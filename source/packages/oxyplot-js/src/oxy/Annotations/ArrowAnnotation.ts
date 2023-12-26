import {
  type CreateTextualAnnotationOptions,
  DataPoint,
  HitTestArguments,
  type HitTestResult,
  HorizontalAlignment,
  type IRenderContext,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  OxyColor,
  OxyColors,
  PlotElementExtensions,
  RenderingExtensions,
  ScreenPoint,
  ScreenPointHelper,
  ScreenVector,
  TextualAnnotation,
  VerticalAlignment,
} from '@/oxyplot'
import { removeUndef } from '@/patch'

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

/**
 * Represents an annotation that shows an arrow.
 */
export class ArrowAnnotation extends TextualAnnotation {
  /**
   * The end point in screen coordinates.
   */
  private screenEndPoint: ScreenPoint = ScreenPoint.LeftTop

  /**
   * The start point in screen coordinates.
   */
  private screenStartPoint: ScreenPoint = ScreenPoint.LeftTop

  /**
   * Initializes a new instance of the ArrowAnnotation class.
   */
  public constructor(opt?: CreateArrowAnnotationOptions) {
    super()
    this.headLength = 10
    this.headWidth = 3
    this.color = OxyColors.Blue
    this.strokeThickness = 2
    this.lineStyle = LineStyle.Solid
    this.lineJoin = LineJoin.Miter
    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the arrow direction.
   * Setting this property overrides the StartPoint property.
   */
  public arrowDirection: ScreenVector = ScreenVector.Zero

  /**
   * Gets or sets the color of the arrow.
   */
  public color: OxyColor

  /**
   * Gets or sets the end point of the arrow.
   */
  public endPoint: DataPoint = DataPoint.Zero

  /**
   * Gets or sets the length of the head (relative to the stroke thickness) (the default value is 10).
   */
  public headLength: number

  /**
   * Gets or sets the width of the head (relative to the stroke thickness) (the default value is 3).
   */
  public headWidth: number

  /**
   * Gets or sets the line join type.
   */
  public lineJoin: LineJoin

  /**
   * Gets or sets the line style.
   */
  public lineStyle: LineStyle

  /**
   * Gets or sets the start point of the arrow.
   * This property is overridden by the ArrowDirection property, if set.
   */
  public startPoint: DataPoint = DataPoint.Zero

  /**
   * Gets or sets the stroke thickness (the default value is 2).
   */
  public strokeThickness: number

  /**
   * Gets or sets the 'veeness' of the arrow head (relative to thickness) (the default value is 0).
   */
  public veeness: number = 0

  public async render(rc: IRenderContext): Promise<void> {
    this.screenEndPoint = this.transform(this.endPoint)

    if (this.arrowDirection.lengthSquared > 0) {
      this.screenStartPoint = this.screenEndPoint.minusVector(
        PlotElementExtensions.orientateVector(this, this.arrowDirection),
      )
    } else {
      this.screenStartPoint = this.transform(this.startPoint)
    }

    const d = this.screenEndPoint.minus(this.screenStartPoint)
    d.normalize()
    const n = new ScreenVector(d.y, -d.x)

    const p1 = this.screenEndPoint.minusVector(d.times(this.headLength * this.strokeThickness))
    const p2 = p1.plus(n.times(this.headWidth * this.strokeThickness))
    const p3 = p1.minusVector(n.times(this.headWidth * this.strokeThickness))
    const p4 = p1.plus(d.times(this.veeness * this.strokeThickness))

    const MinimumSegmentLength = 0

    const dashArray = LineStyleHelper.getDashArray(this.lineStyle)

    if (this.strokeThickness > 0 && this.lineStyle !== LineStyle.None) {
      await RenderingExtensions.drawReducedLine(
        rc,
        [this.screenStartPoint, p4],
        MinimumSegmentLength * MinimumSegmentLength,
        this.getSelectableColor(this.color),
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
        this.lineJoin,
      )

      await RenderingExtensions.drawReducedPolygon(
        rc,
        [p3, this.screenEndPoint, p2, p4],
        MinimumSegmentLength * MinimumSegmentLength,
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

    if (this.textPosition.isDefined()) {
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

    const textPoint = this.getActualTextPosition(() => this.screenStartPoint)
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
    if (args.point.minus(this.screenStartPoint).length < args.tolerance) {
      return {
        element: this,
        nearestHitPoint: this.screenStartPoint,
        index: 0,
      }
    }

    if (args.point.minus(this.screenEndPoint).length < args.tolerance) {
      return {
        element: this,
        nearestHitPoint: this.screenEndPoint,
        index: 2,
      }
    }

    const p = ScreenPointHelper.findPointOnLine(args.point, this.screenStartPoint, this.screenEndPoint)
    if (p.minus(args.point).length < args.tolerance) {
      return {
        element: this,
        nearestHitPoint: p,
      }
    }

    return undefined
  }
}
