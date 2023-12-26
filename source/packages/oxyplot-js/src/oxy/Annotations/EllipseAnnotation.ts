import {
  type CreateShapeAnnotationOptions,
  HitTestArguments,
  type HitTestResult,
  type IRenderContext,
  OxyRect,
  PlotElementExtensions,
  ShapeAnnotation,
} from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface CreateEllipseAnnotationOptions extends CreateShapeAnnotationOptions {
  x?: number
  y?: number
  width?: number
  height?: number
}

/**
 * Represents an annotation that shows an ellipse.
 */
export class EllipseAnnotation extends ShapeAnnotation {
  /**
   * The rectangle transformed to screen coordinates.
   */
  private screenRectangle: OxyRect = OxyRect.Empty

  /**
   * Initializes a new instance of the EllipseAnnotation class.
   */
  constructor(opt?: CreateEllipseAnnotationOptions) {
    super(opt)
    this.width = NaN
    this.height = NaN

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
   * The width of the ellipse.
   */
  public width: number = 0

  /**
   * The height of the ellipse.
   */
  public height: number = 0

  /**
   * Renders the ellipse annotation.
   */
  public async render(rc: IRenderContext): Promise<void> {
    const x = PlotElementExtensions.transform(this, this.x - this.width / 2, this.y - this.height / 2)
    const y = PlotElementExtensions.transform(this, this.x + this.width / 2, this.y + this.height / 2)
    this.screenRectangle = OxyRect.fromScreenPoints(x, y)

    await rc.drawEllipse(
      this.screenRectangle,
      this.getSelectableFillColor(this.fill),
      this.getSelectableColor(this.stroke),
      this.strokeThickness,
      this.edgeRenderingMode,
    )

    if (this.text) {
      const textPosition = this.getActualTextPosition(() => this.screenRectangle.center)
      const [ha, va] = this.getActualTextAlignment()
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
