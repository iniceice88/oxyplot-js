import {
  type CreateShapeAnnotationOptions,
  ExtendedDefaultShapeAnnotationOptions,
  HitTestArguments,
  type HitTestResult,
  type IRenderContext,
  type OxyRect,
  OxyRect_Empty,
  OxyRectHelper,
  PlotElementExtensions,
  ShapeAnnotation,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateEllipseAnnotationOptions extends CreateShapeAnnotationOptions {
  x?: number
  y?: number
  width?: number
  height?: number
}

export const DefaultEllipseAnnotationOptions: CreateEllipseAnnotationOptions = {
  x: 0,
  y: 0,
  width: NaN,
  height: NaN,
}

export const ExtendedDefaultEllipseAnnotationOptions = {
  ...ExtendedDefaultShapeAnnotationOptions,
  ...DefaultEllipseAnnotationOptions,
}

/**
 * Represents an annotation that shows an ellipse.
 */
export class EllipseAnnotation extends ShapeAnnotation {
  /**
   * The rectangle transformed to screen coordinates.
   */
  private _screenRectangle: OxyRect = OxyRect_Empty

  /**
   * Initializes a new instance of the EllipseAnnotation class.
   */
  constructor(opt?: CreateEllipseAnnotationOptions) {
    super(opt)
    assignObject(this, DefaultEllipseAnnotationOptions, opt)
  }

  getElementName() {
    return 'EllipseAnnotation'
  }

  /**
   * The x-coordinate of the center.
   */
  public x: number = DefaultEllipseAnnotationOptions.x!

  /**
   * The y-coordinate of the center.
   */
  public y: number = DefaultEllipseAnnotationOptions.y!

  /**
   * The width of the ellipse.
   */
  public width: number = DefaultEllipseAnnotationOptions.width!

  /**
   * The height of the ellipse.
   */
  public height: number = DefaultEllipseAnnotationOptions.height!

  /**
   * Renders the ellipse annotation.
   */
  public async render(rc: IRenderContext): Promise<void> {
    const x = PlotElementExtensions.transform(this, this.x - this.width / 2, this.y - this.height / 2)
    const y = PlotElementExtensions.transform(this, this.x + this.width / 2, this.y + this.height / 2)
    this._screenRectangle = OxyRectHelper.fromScreenPoints(x, y)

    await rc.drawEllipse(
      this._screenRectangle,
      this.getSelectableFillColor(this.fill),
      this.getSelectableColor(this.stroke),
      this.strokeThickness,
      this.edgeRenderingMode,
    )

    if (this.text) {
      const textPosition = this.getActualTextPosition(() => OxyRectHelper.center(this._screenRectangle))
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
    if (OxyRectHelper.containsPoint(this._screenRectangle, args.point)) {
      return {
        element: this,
        nearestHitPoint: args.point,
      }
    }

    return undefined
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultEllipseAnnotationOptions
  }
}
