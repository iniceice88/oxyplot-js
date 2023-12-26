import {
  type CreateShapeAnnotationOptions,
  DataPoint,
  HitTestArguments,
  type HitTestResult,
  type IRenderContext,
  LineJoin,
  LineStyle,
  RenderingExtensions,
  ScreenPoint,
  ScreenPointHelper,
  ShapeAnnotation,
} from '@/oxyplot'

export interface CreatePolygonAnnotationOptions extends CreateShapeAnnotationOptions {
  /**
   * The line join.
   */
  lineJoin?: LineJoin

  /**
   * The line style.
   */
  lineStyle?: LineStyle

  /**
   * The minimum length of the segment.
   */
  minimumSegmentLength?: number

  /**
   * The points.
   */
  points?: DataPoint[]
}

/**
 * Represents an annotation that shows a polygon.
 */
export class PolygonAnnotation extends ShapeAnnotation {
  /**
   * The polygon points transformed to screen coordinates.
   */
  private screenPoints: ScreenPoint[] = []

  /**
   * Initializes a new instance of the PolygonAnnotation class.
   */
  constructor(opt?: CreatePolygonAnnotationOptions) {
    super(opt)
    this.lineStyle = LineStyle.Solid
    this.lineJoin = LineJoin.Miter
    this.minimumSegmentLength = 2

    if (opt) {
      Object.assign(this, opt)
    }
  }

  /**
   * The line join.
   */
  public lineJoin: LineJoin

  /**
   * The line style.
   */
  public lineStyle: LineStyle

  /**
   * The minimum length of the segment.
   */
  public minimumSegmentLength: number

  /**
   * The points.
   */
  public points: DataPoint[] = []

  /**
   * Renders the polygon annotation.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (!this.points) {
      return
    }

    // transform to screen coordinates
    this.screenPoints = this.points.map((x) => this.transform(x))
    if (this.screenPoints.length === 0) {
      return
    }

    await RenderingExtensions.drawReducedPolygon(
      rc,
      this.screenPoints,
      this.minimumSegmentLength * this.minimumSegmentLength,
      this.getSelectableFillColor(this.fill),
      this.getSelectableColor(this.stroke),
      this.strokeThickness,
      this.edgeRenderingMode,
      this.lineStyle,
      this.lineJoin,
    )

    if (this.text) {
      const [ha, va] = this.getActualTextAlignment()
      const textPosition = this.getActualTextPosition(() => ScreenPointHelper.getCentroid(this.screenPoints))

      await rc.drawText(
        textPosition,
        this.text,
        this.actualTextColor,
        this.actualFont,
        this.actualFontSize,
        this.actualFontWeight,
        this.textRotation,
        ha,
        va,
      )
    }
  }

  /**
   * Tests if the plot element is hit by the specified point.
   */
  protected hitTestOverride(args: HitTestArguments): HitTestResult | undefined {
    if (!this.screenPoints || this.screenPoints.length === 0) {
      // Points not specified.
      return undefined
    }

    return ScreenPointHelper.isPointInPolygon(args.point, this.screenPoints)
      ? {
          element: this,
          nearestHitPoint: args.point,
        }
      : undefined
  }
}
