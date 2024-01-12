import type { CreateTextualAnnotationOptions, HitTestResult, IRenderContext, ScreenPoint } from '@/oxyplot'
import {
  AnnotationTextOrientation,
  DataPoint_isDefined,
  HitTestArguments,
  HorizontalAlignment,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  newScreenPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  OxyThickness,
  PlotElementExtensions,
  RenderingExtensions,
  ScreenPointHelper,
  screenPointMinus,
  screenPointPlus,
  ScreenVector,
  TextAnnotation,
  TextualAnnotation,
  VerticalAlignment,
} from '@/oxyplot'
import { Number_MAX_VALUE, Number_MIN_VALUE } from '@/patch'

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

/**
 * Represents an annotation that shows a function rendered as a path.
 */
export abstract class PathAnnotation extends TextualAnnotation {
  /**
   * The points of the line, transformed to screen coordinates.
   */
  private screenPoints?: ScreenPoint[]

  /**
   * Initializes a new instance of the PathAnnotation class.
   */
  protected constructor(opt?: CreatePathAnnotationOptions) {
    super(opt)
    this.minimumX = Number_MIN_VALUE
    this.maximumX = Number_MAX_VALUE
    this.minimumY = Number_MIN_VALUE
    this.maximumY = Number_MAX_VALUE
    this.color = OxyColors.Blue
    this.strokeThickness = 1
    this.lineStyle = LineStyle.Dash
    this.lineJoin = LineJoin.Miter

    this.textLinePosition = 1
    this.textOrientation = AnnotationTextOrientation.AlongLine
    this.textMargin = 12
    this.textHorizontalAlignment = HorizontalAlignment.Right
    this.textVerticalAlignment = VerticalAlignment.Top
    this.minimumSegmentLength = 2
  }

  /**
   * The color of the line.
   */
  public color: OxyColor

  /**
   * The line join.
   */
  public lineJoin: LineJoin

  /**
   * The line style.
   */
  public lineStyle: LineStyle

  /**
   * The maximum X coordinate for the line.
   */
  public maximumX: number

  /**
   * The maximum Y coordinate for the line.
   */
  public maximumY: number

  /**
   * The minimum X coordinate for the line.
   */
  public minimumX: number

  /**
   * The minimum Y coordinate for the line.
   */
  public minimumY: number

  /**
   * The stroke thickness.
   */
  public strokeThickness: number

  /**
   * The text margin (along the line).
   */
  public textMargin: number

  /**
   * The text padding (in the direction of the text).
   */
  public textPadding: number = 0

  /**
   * The padding of the border rectangle.
   */
  public borderPadding: OxyThickness = OxyThickness.Zero

  /**
   * The fill color of the border rectangle.
   */
  public borderBackground: OxyColor = OxyColors.Undefined

  /**
   * The stroke color of the border rectangle.
   */
  public borderStroke: OxyColor = OxyColors.Undefined

  /**
   * The stroke thickness of the border rectangle.
   */
  public borderStrokeThickness: number = 0

  /**
   * The text orientation.
   */
  public textOrientation: AnnotationTextOrientation

  /**
   * The text position relative to the line.
   */
  public textLinePosition: number

  /**
   * The minimum length of the segment.
   */
  public minimumSegmentLength: number

  /**
   * The actual minimum value on the x axis.
   */
  protected actualMinimumX: number = NaN

  /**
   * The actual minimum value on the y axis.
   */
  protected actualMinimumY: number = NaN

  /**
   * The actual maximum value on the x axis.
   */
  protected actualMaximumX: number = NaN

  /**
   * The actual maximum value on the y axis.
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

    this.screenPoints = this.getScreenPoints()

    const clippedPoints: ScreenPoint[] = []
    const dashArray = LineStyleHelper.getDashArray(this.lineStyle)

    if (this.strokeThickness > 0 && this.lineStyle !== LineStyle.None) {
      await RenderingExtensions.drawReducedLine(
        rc,
        this.screenPoints,
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
      new ScreenVector(
        f * this.textPadding * Math.cos(angleInRadians),
        f * this.textPadding * Math.sin(angleInRadians),
      ),
    )

    if (this.text) {
      const textPosition = this.getActualTextPosition(() => position)

      if (DataPoint_isDefined(this.textPosition)) {
        angle = this.textRotation
      }

      const textSize = rc.measureText(this.text, this.actualFont, this.actualFontSize, this.actualFontWeight)

      const textBounds = TextAnnotation.getTextBounds(position, textSize, this.borderPadding, angle, ha, va)

      if (angle % 90 == 0) {
        const actualRect = OxyRect.fromScreenPoints(textBounds[0], textBounds[2])
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
    if (!this.screenPoints) {
      return undefined
    }

    const nearestPoint = ScreenPointHelper.findNearestPointOnPolyline(args.point, this.screenPoints)
    const dist = screenPointMinus(args.point, nearestPoint).length
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

    const topLeft = this.inverseTransform(this.plotModel.plotArea.topLeft)
    const bottomRight = this.inverseTransform(this.plotModel.plotArea.bottomRight)

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
      length += screenPointMinus(pts[i], pts[i - 1]).length
    }

    const l = length * p + margin
    const eps = 1e-8
    length = 0
    for (let i = 1; i < pts.length; i++) {
      const dl = screenPointMinus(pts[i], pts[i - 1]).length
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
}
