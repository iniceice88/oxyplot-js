import {
  type CreateShapeAnnotationOptions,
  type DataPoint,
  ExtendedDefaultShapeAnnotationOptions,
  type HitTestArguments,
  type HitTestResult,
  type IRenderContext,
  LineJoin,
  LineStyle,
  RenderingExtensions,
  type ScreenPoint,
  ScreenPointHelper,
  ShapeAnnotation,
} from '@/oxyplot'
import { assignObject } from '@/patch'

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

const DefaultPolygonAnnotationOptions: CreatePolygonAnnotationOptions = {
  lineJoin: LineJoin.Miter,
  lineStyle: LineStyle.Solid,
  minimumSegmentLength: 2,

  points: undefined,
}

export const ExtendedDefaultPolygonAnnotationOptions = {
  ...ExtendedDefaultShapeAnnotationOptions,
  ...DefaultPolygonAnnotationOptions,
}

/**
 * Represents an annotation that shows a polygon.
 */
export class PolygonAnnotation extends ShapeAnnotation {
  /**
   * The polygon points transformed to screen coordinates.
   */
  private _screenPoints: ScreenPoint[] = []

  /**
   * Initializes a new instance of the PolygonAnnotation class.
   */
  constructor(opt?: CreatePolygonAnnotationOptions) {
    super(opt)
    assignObject(this, DefaultPolygonAnnotationOptions, opt)
  }

  getElementName() {
    return 'PolygonAnnotation'
  }

  /**
   * The line join.
   */
  public lineJoin: LineJoin = DefaultPolygonAnnotationOptions.lineJoin!

  /**
   * The line style.
   */
  public lineStyle: LineStyle = DefaultPolygonAnnotationOptions.lineStyle!

  /**
   * The minimum length of the segment.
   */
  public minimumSegmentLength: number = DefaultPolygonAnnotationOptions.minimumSegmentLength!

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
    this._screenPoints = this.points.map((x) => this.transform(x))
    if (this._screenPoints.length === 0) {
      return
    }

    await RenderingExtensions.drawReducedPolygon(
      rc,
      this._screenPoints,
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
      const textPosition = this.getActualTextPosition(() => ScreenPointHelper.getCentroid(this._screenPoints))

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
    if (!this._screenPoints || this._screenPoints.length === 0) {
      // Points not specified.
      return undefined
    }

    return ScreenPointHelper.isPointInPolygon(args.point, this._screenPoints)
      ? {
          element: this,
          nearestHitPoint: args.point,
        }
      : undefined
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultPolygonAnnotationOptions
  }
}
