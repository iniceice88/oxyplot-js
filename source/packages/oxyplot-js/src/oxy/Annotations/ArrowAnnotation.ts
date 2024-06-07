import {
  type CreateTextualAnnotationOptions,
  type DataPoint,
  DataPoint_isDefined,
  DataPoint_Zero,
  ExtendedDefaultTextualAnnotationOptions,
  type HitTestArguments,
  type HitTestResult,
  HorizontalAlignment,
  type IRenderContext,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  type OxyColor,
  OxyColors,
  PlotElementExtensions,
  RenderingExtensions,
  type ScreenPoint,
  ScreenPoint_LeftTop,
  ScreenPointHelper,
  screenPointMinusEx,
  screenPointMinusVector,
  screenPointPlus,
  type ScreenVector,
  ScreenVector_Zero,
  ScreenVectorEx,
  TextualAnnotation,
  VerticalAlignment,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateArrowAnnotationOptions extends CreateTextualAnnotationOptions {
  arrowDirection?: ScreenVector
  color?: OxyColor
  endPoint?: DataPoint
  headLength?: number
  headWidth?: number
  lineJoin?: LineJoin
  lineStyle?: LineStyle
  startPoint?: DataPoint
  strokeThickness?: number
  veeness?: number
}

const DefaultArrowAnnotationOptions: CreateArrowAnnotationOptions = {
  color: OxyColors.Blue,
  headLength: 10,
  headWidth: 3,
  strokeThickness: 2,
  lineStyle: LineStyle.Solid,
  lineJoin: LineJoin.Miter,

  arrowDirection: undefined,
  endPoint: undefined,
  startPoint: undefined,
  veeness: undefined,
}

export const ExtendedDefaultArrowAnnotationOptions = {
  ...ExtendedDefaultTextualAnnotationOptions,
  ...DefaultArrowAnnotationOptions,
}

/**
 * Represents an annotation that shows an arrow.
 */
export class ArrowAnnotation extends TextualAnnotation {
  /**
   * The end point in screen coordinates.
   */
  private _screenEndPoint: ScreenPoint = ScreenPoint_LeftTop

  /**
   * The start point in screen coordinates.
   */
  private _screenStartPoint: ScreenPoint = ScreenPoint_LeftTop

  /**
   * Initializes a new instance of the ArrowAnnotation class.
   */
  public constructor(opt?: CreateArrowAnnotationOptions) {
    super(opt)

    assignObject(this, DefaultArrowAnnotationOptions, opt)
  }

  getElementName() {
    return 'ArrowAnnotation'
  }

  /**
   * Gets or sets the arrow direction.
   * Setting this property overrides the StartPoint property.
   */
  public arrowDirection: ScreenVector = ScreenVector_Zero

  /**
   * Gets or sets the color of the arrow.
   */
  public color: OxyColor = DefaultArrowAnnotationOptions.color!

  /**
   * Gets or sets the end point of the arrow.
   */
  public endPoint: DataPoint = DataPoint_Zero

  /**
   * Gets or sets the length of the head (relative to the stroke thickness) (the default value is 10).
   */
  public headLength: number = DefaultArrowAnnotationOptions.headLength!

  /**
   * Gets or sets the width of the head (relative to the stroke thickness) (the default value is 3).
   */
  public headWidth: number = DefaultArrowAnnotationOptions.headWidth!

  /**
   * Gets or sets the line join type.
   */
  public lineJoin: LineJoin = DefaultArrowAnnotationOptions.lineJoin!

  /**
   * Gets or sets the line style.
   */
  public lineStyle: LineStyle = DefaultArrowAnnotationOptions.lineStyle!

  /**
   * Gets or sets the start point of the arrow.
   * This property is overridden by the ArrowDirection property, if set.
   */
  public startPoint: DataPoint = DataPoint_Zero

  /**
   * Gets or sets the stroke thickness (the default value is 2).
   */
  public strokeThickness: number = DefaultArrowAnnotationOptions.strokeThickness!

  /**
   * Gets or sets the 'veeness' of the arrow head (relative to thickness) (the default value is 0).
   */
  public veeness: number = 0

  public async render(rc: IRenderContext): Promise<void> {
    this._screenEndPoint = this.transform(this.endPoint)

    if (ScreenVectorEx.from(this.arrowDirection).lengthSquared > 0) {
      this._screenStartPoint = screenPointMinusVector(
        this._screenEndPoint,
        PlotElementExtensions.orientateVector(this, this.arrowDirection),
      )
    } else {
      this._screenStartPoint = this.transform(this.startPoint)
    }

    const d = screenPointMinusEx(this._screenEndPoint, this._screenStartPoint).normalize()
    const n = ScreenVectorEx.fromXY(d.y, -d.x)

    const p1 = screenPointMinusVector(this._screenEndPoint, d.times(this.headLength * this.strokeThickness))
    const p2 = screenPointPlus(p1, n.times(this.headWidth * this.strokeThickness))
    const p3 = screenPointMinusVector(p1, n.times(this.headWidth * this.strokeThickness))
    const p4 = screenPointPlus(p1, d.times(this.veeness * this.strokeThickness))

    const minimumSegmentLength = 0

    const dashArray = LineStyleHelper.getDashArray(this.lineStyle)

    if (this.strokeThickness > 0 && this.lineStyle !== LineStyle.None) {
      await RenderingExtensions.drawReducedLine(
        rc,
        [this._screenStartPoint, p4],
        minimumSegmentLength * minimumSegmentLength,
        this.getSelectableColor(this.color),
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
        this.lineJoin,
      )

      await RenderingExtensions.drawReducedPolygon(
        rc,
        [p3, this._screenEndPoint, p2, p4],
        minimumSegmentLength * minimumSegmentLength,
        this.getSelectableColor(this.color),
        OxyColors.Undefined,
        0,
        this.edgeRenderingMode,
      )
    }

    if (!this.text) {
      return
    }

    let ha: HorizontalAlignment
    let va: VerticalAlignment

    if (DataPoint_isDefined(this.textPosition)) {
      ;[ha, va] = this.getActualTextAlignment()
    } else {
      const angle = Math.atan2(d.y, d.x)
      const piOver8 = Math.PI / 8
      if (angle < 3 * piOver8 && angle > -3 * piOver8) {
        ha = HorizontalAlignment.Right
      } else if (angle > 5 * piOver8 || angle < -5 * piOver8) {
        ha = HorizontalAlignment.Left
      } else {
        ha = HorizontalAlignment.Center
      }

      if (angle > piOver8 && angle < 7 * piOver8) {
        va = VerticalAlignment.Bottom
      } else if (angle < -piOver8 && angle > -7 * piOver8) {
        va = VerticalAlignment.Top
      } else {
        va = VerticalAlignment.Middle
      }
    }

    const textPoint = this.getActualTextPosition(() => this._screenStartPoint)
    await rc.drawText(
      textPoint,
      this.text!,
      this.actualTextColor,
      this.actualFont,
      this.actualFontSize,
      this.actualFontWeight,
      this.textRotation,
      ha,
      va,
    )
  }

  /**
   * Tests if the plot element is hit by the specified point.
   * @param args The hit test arguments.
   * @returns The result of the hit test.
   */
  protected hitTestOverride(args: HitTestArguments): HitTestResult | undefined {
    if (screenPointMinusEx(args.point, this._screenStartPoint).length < args.tolerance) {
      return {
        element: this,
        nearestHitPoint: this._screenStartPoint,
        index: 0,
      }
    }

    if (screenPointMinusEx(args.point, this._screenEndPoint).length < args.tolerance) {
      return {
        element: this,
        nearestHitPoint: this._screenEndPoint,
        index: 2,
      }
    }

    const p = ScreenPointHelper.findPointOnLine(args.point, this._screenStartPoint, this._screenEndPoint)
    if (screenPointMinusEx(p, args.point).length < args.tolerance) {
      return {
        element: this,
        nearestHitPoint: p,
      }
    }

    return undefined
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultArrowAnnotationOptions
  }
}
