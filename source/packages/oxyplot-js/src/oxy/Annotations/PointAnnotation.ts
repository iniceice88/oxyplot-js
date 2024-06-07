import {
  type CreateShapeAnnotationOptions,
  ExtendedDefaultShapeAnnotationOptions,
  type HitTestArguments,
  type HitTestResult,
  type IRenderContext,
  MarkerType,
  newScreenVector,
  PlotElementExtensions,
  RenderingExtensions,
  type ScreenPoint,
  ScreenPoint_LeftTop,
  screenPointDistanceTo,
  screenPointPlus,
  ShapeAnnotation,
  VerticalAlignment,
} from '@/oxyplot'

import { assignObject } from '@/patch'

export interface CreatePointAnnotationOptions extends CreateShapeAnnotationOptions {
  x?: number
  y?: number
  size?: number
  textMargin?: number
  shape?: MarkerType
  customOutline?: ScreenPoint[]
}

const DefaultPointAnnotationOptions: CreatePointAnnotationOptions = {
  x: 0,
  y: 0,
  size: 4,
  textMargin: 2,
  shape: MarkerType.Circle,
  textVerticalAlignment: VerticalAlignment.Top,

  customOutline: undefined,
}

export const ExtendedDefaultPointAnnotationOptions = {
  ...ExtendedDefaultShapeAnnotationOptions,
  ...DefaultPointAnnotationOptions,
}

/**
 * Represents an annotation that shows a point.
 */
export class PointAnnotation extends ShapeAnnotation {
  /**
   * The position transformed to screen coordinates.
   */
  private _screenPosition: ScreenPoint = ScreenPoint_LeftTop

  /**
   * Initializes a new instance of the PointAnnotation class.
   */
  constructor(opt?: CreatePointAnnotationOptions) {
    super(opt)

    assignObject(this, DefaultPointAnnotationOptions, opt)
  }

  getElementName() {
    return 'PointAnnotation'
  }

  /**
   * The x-coordinate of the center.
   */
  public x: number = DefaultPointAnnotationOptions.x!

  /**
   * The y-coordinate of the center.
   */
  public y: number = DefaultPointAnnotationOptions.y!

  /**
   * The size of the rendered point.
   */
  public size: number = DefaultPointAnnotationOptions.size!

  /**
   * The distance between the rendered point and the text.
   */
  public textMargin: number = DefaultPointAnnotationOptions.textMargin!

  /**
   * The shape of the rendered point.
   */
  public shape: MarkerType = DefaultPointAnnotationOptions.shape!

  /**
   * A custom polygon outline for the point marker. Set shape to MarkerType.Custom to use this property.
   */
  public customOutline?: ScreenPoint[]

  /**
   * Renders the point annotation.
   */
  public async render(rc: IRenderContext): Promise<void> {
    this._screenPosition = PlotElementExtensions.transform(this, this.x, this.y)

    await RenderingExtensions.drawMarker(
      rc,
      this._screenPosition,
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
      const textPosition = screenPointPlus(this._screenPosition, newScreenVector(dx, dy))
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
    if (screenPointDistanceTo(this._screenPosition, args.point) < this.size) {
      return {
        element: this,
        nearestHitPoint: this._screenPosition,
      }
    }

    return undefined
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultPointAnnotationOptions
  }
}
