import {
  type CreateShapeAnnotationOptions,
  EdgeRenderingMode,
  ExtendedDefaultShapeAnnotationOptions,
  HitTestArguments,
  type HitTestResult,
  type IRenderContext,
  type OxyRect,
  OxyRect_Empty,
  OxyRectEx,
  OxyRectHelper,
  PlotElementExtensions,
  RenderingExtensions,
  ShapeAnnotation,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface RectangleAnnotationOptions extends CreateShapeAnnotationOptions {
  minimumX?: number
  maximumX?: number
  minimumY?: number
  maximumY?: number
}

export const DefaultRectangleAnnotationOptions: RectangleAnnotationOptions = {
  minimumX: -Infinity,
  maximumX: Infinity,
  minimumY: -Infinity,
  maximumY: Infinity,
}

export const ExtendedDefaultRectangleAnnotationOptions = {
  ...ExtendedDefaultShapeAnnotationOptions,
  ...DefaultRectangleAnnotationOptions,
}

/**
 * Represents an annotation that shows a rectangle.
 */
export class RectangleAnnotation extends ShapeAnnotation {
  /**
   * The rectangle transformed to screen coordinates.
   */
  private _screenRectangle: OxyRect = OxyRect_Empty

  /**
   * Initializes a new instance of the RectangleAnnotation class.
   */
  constructor(opt?: RectangleAnnotationOptions) {
    super(opt)
    assignObject(this, DefaultRectangleAnnotationOptions, opt)
  }

  getElementName() {
    return 'RectangleAnnotation'
  }

  /**
   * The minimum X.
   */
  public minimumX: number = DefaultRectangleAnnotationOptions.minimumX!

  /**
   * The maximum X.
   */
  public maximumX: number = DefaultRectangleAnnotationOptions.maximumX!

  /**
   * The minimum Y.
   */
  public minimumY: number = DefaultRectangleAnnotationOptions.minimumY!

  /**
   * The maximum Y.
   */
  public maximumY: number = DefaultRectangleAnnotationOptions.maximumY!

  /**
   * Renders the rectangle annotation.
   */
  public async render(rc: IRenderContext): Promise<void> {
    const clippingRectangle = OxyRectEx.fromRect(this.getClippingRect())

    const p1 = this.inverseTransform(clippingRectangle.topLeft)
    const p2 = this.inverseTransform(clippingRectangle.bottomRight)

    const x1 = this.minimumX === -Infinity || isNaN(this.minimumX) ? Math.min(p1.x, p2.x) : this.minimumX
    const x2 = this.maximumX === Infinity || isNaN(this.maximumX) ? Math.max(p1.x, p2.x) : this.maximumX
    const y1 = this.minimumY === -Infinity || isNaN(this.minimumY) ? Math.min(p1.y, p2.y) : this.minimumY
    const y2 = this.maximumY === Infinity || isNaN(this.maximumY) ? Math.max(p1.y, p2.y) : this.maximumY

    const transform = PlotElementExtensions.transform
    this._screenRectangle = OxyRectHelper.fromScreenPoints(transform(this, x1, y1), transform(this, x2, y2))

    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )

    await rc.drawRectangle(
      this._screenRectangle,
      this.getSelectableFillColor(this.fill),
      this.getSelectableColor(this.stroke),
      this.strokeThickness,
      actualEdgeRenderingMode,
    )

    if (this.text) {
      const [ha, va] = this.getActualTextAlignment()
      const textPosition = this.getActualTextPosition(() => OxyRectHelper.center(this._screenRectangle))
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
    if (OxyRectHelper.containsPoint(this._screenRectangle, args.point)) {
      return {
        element: this,
        nearestHitPoint: args.point,
      }
    }

    return undefined
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultRectangleAnnotationOptions
  }
}
