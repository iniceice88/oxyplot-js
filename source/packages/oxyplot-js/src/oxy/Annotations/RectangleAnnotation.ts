import {
  type CreateShapeAnnotationOptions,
  EdgeRenderingMode,
  HitTestArguments,
  type HitTestResult,
  HorizontalAlignment,
  type IRenderContext,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
  ShapeAnnotation,
  VerticalAlignment,
} from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface RectangleAnnotationOptions extends CreateShapeAnnotationOptions {
  minimumX?: number
  maximumX?: number
  minimumY?: number
  maximumY?: number
}

/**
 * Represents an annotation that shows a rectangle.
 */
export class RectangleAnnotation extends ShapeAnnotation {
  /**
   * The rectangle transformed to screen coordinates.
   */
  private screenRectangle: OxyRect = OxyRect.Empty

  /**
   * Initializes a new instance of the RectangleAnnotation class.
   */
  constructor(opt?: RectangleAnnotationOptions) {
    super(opt)
    this.minimumX = -Infinity
    this.maximumX = Infinity
    this.minimumY = -Infinity
    this.maximumY = Infinity
    this.textRotation = 0
    this.textHorizontalAlignment = HorizontalAlignment.Center
    this.textVerticalAlignment = VerticalAlignment.Middle

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * The minimum X.
   */
  public minimumX: number

  /**
   * The maximum X.
   */
  public maximumX: number

  /**
   * The minimum Y.
   */
  public minimumY: number

  /**
   * The maximum Y.
   */
  public maximumY: number

  /**
   * Renders the rectangle annotation.
   */
  public async render(rc: IRenderContext): Promise<void> {
    const clippingRectangle = this.getClippingRect()

    const p1 = this.inverseTransform(clippingRectangle.topLeft)
    const p2 = this.inverseTransform(clippingRectangle.bottomRight)

    const x1 = this.minimumX === -Infinity || isNaN(this.minimumX) ? Math.min(p1.x, p2.x) : this.minimumX
    const x2 = this.maximumX === Infinity || isNaN(this.maximumX) ? Math.max(p1.x, p2.x) : this.maximumX
    const y1 = this.minimumY === -Infinity || isNaN(this.minimumY) ? Math.min(p1.y, p2.y) : this.minimumY
    const y2 = this.maximumY === Infinity || isNaN(this.maximumY) ? Math.max(p1.y, p2.y) : this.maximumY

    const transform = PlotElementExtensions.transform
    this.screenRectangle = OxyRect.fromScreenPoints(transform(this, x1, y1), transform(this, x2, y2))

    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )

    await rc.drawRectangle(
      this.screenRectangle,
      this.getSelectableFillColor(this.fill),
      this.getSelectableColor(this.stroke),
      this.strokeThickness,
      actualEdgeRenderingMode,
    )

    if (this.text) {
      const [ha, va] = this.getActualTextAlignment()
      const textPosition = this.getActualTextPosition(() => this.screenRectangle.center)
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
    if (this.screenRectangle.containsPoint(args.point)) {
      return {
        element: this,
        nearestHitPoint: args.point,
      }
    }

    return undefined
  }
}
