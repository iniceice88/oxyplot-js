import {
  AnnotationTextOrientation,
  type CreateTextualAnnotationOptions,
  DataPoint_isDefined,
  ExtendedDefaultTextualAnnotationOptions,
  type HitTestArguments,
  type HitTestResult,
  HorizontalAlignment,
  type IRenderContext,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  newScreenPoint,
  newScreenVector,
  type OxyColor,
  OxyColors,
  OxyRectEx,
  OxyRectHelper,
  type OxyThickness,
  OxyThickness_Zero,
  PlotElementExtensions,
  RenderingExtensions,
  type ScreenPoint,
  ScreenPointHelper,
  screenPointMinusEx,
  screenPointPlus,
  TextAnnotation,
  TextualAnnotation,
  VerticalAlignment,
} from '@/oxyplot'

import { Number_MAX_VALUE, Number_MIN_VALUE, assignObject } from '@/patch'

export interface CreatePathAnnotationOptions extends CreateTextualAnnotationOptions {
  minimumX?: number
  maximumX?: number
  minimumY?: number
  maximumY?: number
  color?: OxyColor
  strokeThickness?: number
  lineStyle?: LineStyle
  lineJoin?: LineJoin
  textLinePosition?: number
  textOrientation?: AnnotationTextOrientation
  textMargin?: number
  minimumSegmentLength?: number
  textPadding?: number
  borderPadding?: OxyThickness
  borderBackground?: OxyColor
  borderStroke?: OxyColor
  borderStrokeThickness?: number
}

const DefaultPathAnnotationOptions: CreatePathAnnotationOptions = {
  minimumX: Number_MIN_VALUE,
  maximumX: Number_MAX_VALUE,
  minimumY: Number_MIN_VALUE,
  maximumY: Number_MAX_VALUE,
  color: OxyColors.Blue,
  strokeThickness: 1,
  lineStyle: LineStyle.Dash,
  lineJoin: LineJoin.Miter,
  textLinePosition: 1,
  textOrientation: AnnotationTextOrientation.AlongLine,
  textMargin: 12,
  textHorizontalAlignment: HorizontalAlignment.Right,
  textVerticalAlignment: VerticalAlignment.Top,
  minimumSegmentLength: 2,
  textPadding: 0,
  borderPadding: OxyThickness_Zero,
  borderBackground: OxyColors.Undefined,
  borderStroke: OxyColors.Undefined,
  borderStrokeThickness: 0,
}

export const ExtendedDefaultPathAnnotationOptions = {
  ...ExtendedDefaultTextualAnnotationOptions,
  ...DefaultPathAnnotationOptions,
}

/**
 * Represents an annotation that shows a function rendered as a path.
 */
export abstract class PathAnnotation extends TextualAnnotation {
  /**
   * The points of the line, transformed to screen coordinates.
   */
  private _screenPoints?: ScreenPoint[]

  /**
   * Initializes a new instance of the PathAnnotation class.
   */
  protected constructor(opt?: CreatePathAnnotationOptions) {
    super(opt)
    assignObject(this, DefaultPathAnnotationOptions, opt)
  }

  /**
   * The color of the line.
   */
  public color: OxyColor = DefaultPathAnnotationOptions.color!

  /**
   * The line join.
   */
  public lineJoin: LineJoin = DefaultPathAnnotationOptions.lineJoin!

  /**
   * The line style.
   */
  public lineStyle: LineStyle = DefaultPathAnnotationOptions.lineStyle!

  /**
   * The maximum X coordinate for the line.
   */
  public maximumX: number = DefaultPathAnnotationOptions.maximumX!

  /**
   * The maximum Y coordinate for the line.
   */
  public maximumY: number = DefaultPathAnnotationOptions.maximumY!

  /**
   * The minimum X coordinate for the line.
   */
  public minimumX: number = DefaultPathAnnotationOptions.minimumX!

  /**
   * The minimum Y coordinate for the line.
   */
  public minimumY: number = DefaultPathAnnotationOptions.minimumY!

  /**
   * The stroke thickness.
   */
  public strokeThickness: number = DefaultPathAnnotationOptions.strokeThickness!

  /**
   * The text margin (along the line).
   */
  public textMargin: number = DefaultPathAnnotationOptions.textMargin!

  /**
   * The text padding (in the direction of the text).
   */
  public textPadding: number = DefaultPathAnnotationOptions.textPadding!

  /**
   * The padding of the border rectangle.
   */
  public borderPadding: OxyThickness = DefaultPathAnnotationOptions.borderPadding!

  /**
   * The fill color of the border rectangle.
   */
  public borderBackground: OxyColor = DefaultPathAnnotationOptions.borderBackground!

  /**
   * The stroke color of the border rectangle.
   */
  public borderStroke: OxyColor = DefaultPathAnnotationOptions.borderStroke!

  /**
   * The stroke thickness of the border rectangle.
   */
  public borderStrokeThickness: number = DefaultPathAnnotationOptions.borderStrokeThickness!

  /**
   * The text orientation.
   */
  public textOrientation: AnnotationTextOrientation = DefaultPathAnnotationOptions.textOrientation!

  /**
   * The text position relative to the line.
   */
  public textLinePosition: number = DefaultPathAnnotationOptions.textLinePosition!

  /**
   * The minimum length of the segment.
   */
  public minimumSegmentLength: number = DefaultPathAnnotationOptions.minimumSegmentLength!

  /**
   * The actual minimum value on the x-axis.
   */
  protected actualMinimumX: number = NaN

  /**
   * The actual minimum value on the y-axis.
   */
  protected actualMinimumY: number = NaN

  /**
   * The actual maximum value on the x-axis.
   */
  protected actualMaximumX: number = NaN

  /**
   * The actual maximum value on the y-axis.
   */
  protected actualMaximumY: number = NaN

  /**
   * Renders the path annotation.
   */
  public async render(rc: IRenderContext): Promise<void> {
    this.calculateActualMinimumsMaximums()

    if (this.actualMinimumX > this.actualMaximumX || this.actualMinimumY > this.actualMaximumY) {
      return
    }

    this._screenPoints = this.getScreenPoints()

    const clippedPoints: ScreenPoint[] = []
    const dashArray = LineStyleHelper.getDashArray(this.lineStyle)

    if (this.strokeThickness > 0 && this.lineStyle !== LineStyle.None) {
      await RenderingExtensions.drawReducedLine(
        rc,
        this._screenPoints,
        this.minimumSegmentLength * this.minimumSegmentLength,
        this.getSelectableColor(this.color),
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
        this.lineJoin,
        undefined,
        (points) => clippedPoints.push(...points),
      )
    }

    let margin = this.textMargin

    const [ha, va] = this.getActualTextAlignment()

    const effectiveTextLinePosition = PlotElementExtensions.isTransposed(this)
      ? this.yAxis!.isReversed
        ? 1 - this.textLinePosition
        : this.textLinePosition
      : this.xAxis!.isReversed
        ? 1 - this.textLinePosition
        : this.textLinePosition

    if (ha === HorizontalAlignment.Center) {
      margin = 0
    } else {
      margin *= effectiveTextLinePosition < 0.5 ? 1 : -1
    }

    const result = PathAnnotation.getPointAtRelativeDistance(clippedPoints, effectiveTextLinePosition, margin)
    if (!result) return

    let { position, angle } = result

    if (angle < -90) {
      angle += 180
    }

    if (angle >= 90) {
      angle -= 180
    }

    switch (this.textOrientation) {
      case AnnotationTextOrientation.Horizontal:
        angle = 0
        break
      case AnnotationTextOrientation.Vertical:
        angle = -90
        break
    }

    // Apply 'padding' to the position
    const angleInRadians = (angle / 180) * Math.PI
    let f = 1

    if (ha === HorizontalAlignment.Right) {
      f = -1
    }

    if (ha === HorizontalAlignment.Center) {
      f = 0
    }

    position = screenPointPlus(
      position,
      newScreenVector(f * this.textPadding * Math.cos(angleInRadians), f * this.textPadding * Math.sin(angleInRadians)),
    )

    if (this.text) {
      const textPosition = this.getActualTextPosition(() => position)

      if (DataPoint_isDefined(this.textPosition)) {
        angle = this.textRotation
      }

      const textSize = rc.measureText(this.text, this.actualFont, this.actualFontSize, this.actualFontWeight)

      const textBounds = TextAnnotation.getTextBounds(position, textSize, this.borderPadding, angle, ha, va)

      if (angle % 90 == 0) {
        const actualRect = OxyRectHelper.fromScreenPoints(textBounds[0], textBounds[2])
        await rc.drawRectangle(
          actualRect,
          this.borderBackground,
          this.borderStroke,
          this.borderStrokeThickness,
          this.edgeRenderingMode,
        )
      } else {
        await rc.drawPolygon(
          textBounds,
          this.borderBackground,
          this.borderStroke,
          this.borderStrokeThickness,
          this.edgeRenderingMode,
        )
      }

      await rc.drawText(
        textPosition,
        this.text,
        this.actualTextColor,
        this.actualFont,
        this.actualFontSize,
        this.actualFontWeight,
        angle,
        ha,
        va,
      )
    }
  }

  /**
   * Tests if the plot element is hit by the specified point.
   */
  protected hitTestOverride(args: HitTestArguments): HitTestResult | undefined {
    if (!this._screenPoints) {
      return undefined
    }

    const nearestPoint = ScreenPointHelper.findNearestPointOnPolyline(args.point, this._screenPoints)
    const dist = screenPointMinusEx(args.point, nearestPoint).length
    if (dist < args.tolerance) {
      return {
        element: this,
        nearestHitPoint: nearestPoint,
      }
    }

    return undefined
  }

  /**
   * Gets the screen points.
   */
  protected abstract getScreenPoints(): ScreenPoint[]

  /**
   * Calculates the actual minimums and maximums.
   */
  protected calculateActualMinimumsMaximums(): void {
    if (!this.xAxis) {
      throw new Error(`xAxis is undefined.`)
    }
    if (!this.yAxis) {
      throw new Error(`yAxis is undefined.`)
    }

    this.actualMinimumX = Math.max(this.minimumX, this.xAxis.clipMinimum)
    this.actualMaximumX = Math.min(this.maximumX, this.xAxis.clipMaximum)
    this.actualMinimumY = Math.max(this.minimumY, this.yAxis.clipMinimum)
    this.actualMaximumY = Math.min(this.maximumY, this.yAxis.clipMaximum)

    const plotAreaEx = new OxyRectEx(this.plotModel.plotArea)
    const topLeft = this.inverseTransform(plotAreaEx.topLeft)
    const bottomRight = this.inverseTransform(plotAreaEx.bottomRight)

    if (!this.clipByXAxis) {
      this.actualMaximumX = Math.max(topLeft.x, bottomRight.x)
      this.actualMinimumX = Math.min(topLeft.x, bottomRight.x)
    }

    if (!this.clipByYAxis) {
      this.actualMaximumY = Math.max(topLeft.y, bottomRight.y)
      this.actualMinimumY = Math.min(topLeft.y, bottomRight.y)
    }
  }

  /**
   * Gets the point on a curve at the specified relative distance along the curve.
   */
  private static getPointAtRelativeDistance(
    pts: ScreenPoint[],
    p: number,
    margin: number,
  ): { position: ScreenPoint; angle: number } | undefined {
    if (!pts || pts.length === 0) {
      return undefined
    }

    let length = 0
    for (let i = 1; i < pts.length; i++) {
      length += screenPointMinusEx(pts[i], pts[i - 1]).length
    }

    const l = length * p + margin
    const eps = 1e-8
    length = 0
    for (let i = 1; i < pts.length; i++) {
      const dl = screenPointMinusEx(pts[i], pts[i - 1]).length
      if (l >= length - eps && l <= length + dl + eps) {
        const f = (l - length) / dl
        const x = pts[i].x * f + pts[i - 1].x * (1 - f)
        const y = pts[i].y * f + pts[i - 1].y * (1 - f)
        const position = newScreenPoint(x, y)
        const dx = pts[i].x - pts[i - 1].x
        const dy = pts[i].y - pts[i - 1].y
        const angle = (Math.atan2(dy, dx) / Math.PI) * 180
        return { position, angle }
      }

      length += dl
    }

    return undefined
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultPathAnnotationOptions
  }
}
