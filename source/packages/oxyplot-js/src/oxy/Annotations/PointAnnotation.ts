import {
  type CreateShapeAnnotationOptions,
  HitTestArguments,
  type HitTestResult,
  type IRenderContext,
  MarkerType,
  PlotElementExtensions,
  RenderingExtensions,
  ScreenPoint,
  ScreenVector,
  ShapeAnnotation,
  VerticalAlignment,
} from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface CreatePointAnnotationOptions extends CreateShapeAnnotationOptions {
  x?: number
  y?: number
  size?: number
  textMargin?: number
  shape?: MarkerType
  customOutline?: ScreenPoint[]
}

/**
 * Represents an annotation that shows a point.
 */
export class PointAnnotation extends ShapeAnnotation {
  /**
   * The position transformed to screen coordinates.
   */
  private screenPosition: ScreenPoint = ScreenPoint.LeftTop

  /**
   * Initializes a new instance of the PointAnnotation class.
   */
  constructor(opt?: CreatePointAnnotationOptions) {
    super(opt)
    this.size = 4
    this.textMargin = 2
    this.shape = MarkerType.Circle
    this.textVerticalAlignment = VerticalAlignment.Top

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * The x-coordinate of the center.
   */
  public x: number = 0

  /**
   * The y-coordinate of the center.
   */
  public y: number = 0

  /**
   * The size of the rendered point.
   */
  public size: number

  /**
   * The distance between the rendered point and the text.
   */
  public textMargin: number

  /**
   * The shape of the rendered point.
   */
  public shape: MarkerType

  /**
   * A custom polygon outline for the point marker. Set shape to MarkerType.Custom to use this property.
   */
  public customOutline?: ScreenPoint[]

  /**
   * Renders the point annotation.
   */
  public async render(rc: IRenderContext): Promise<void> {
    this.screenPosition = PlotElementExtensions.transform(this, this.x, this.y)

    await RenderingExtensions.drawMarker(
      rc,
      this.screenPosition,
      this.shape,
      this.customOutline,
      this.size,
      this.fill,
      this.stroke,
      this.strokeThickness,
      this.edgeRenderingMode,
    )

    if (this.text) {
      const [ha, va] = this.getActualTextAlignment()
      const dx = -Number(ha) * (this.size + this.textMargin)
      const dy = -Number(va) * (this.size + this.textMargin)
      const textPosition = this.screenPosition.plus(new ScreenVector(dx, dy))
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
    if (this.screenPosition.distanceTo(args.point) < this.size) {
      return {
        element: this,
        nearestHitPoint: this.screenPosition,
      }
    }

    return undefined
  }
}
