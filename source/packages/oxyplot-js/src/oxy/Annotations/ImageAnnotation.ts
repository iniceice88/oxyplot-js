import {
  type CreateTransposableAnnotationOptions,
  DataPoint_Zero,
  ExtendedDefaultTransposableAnnotationOptions,
  type HitTestArguments,
  type HitTestResult,
  HorizontalAlignment,
  type IRenderContext,
  newOxyRect,
  newPlotLength,
  newScreenPoint,
  newScreenVector,
  type OxyImage,
  type OxyRect,
  OxyRect_Empty,
  OxyRect_Everything,
  OxyRectHelper,
  PlotElementExtensions,
  type PlotLength,
  PlotLengthUnit,
  RenderingExtensions,
  type ScreenPoint,
  screenPointMinus,
  screenPointPlus,
  type ScreenVector,
  TransposableAnnotation,
  VerticalAlignment,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateImageAnnotationOptions extends CreateTransposableAnnotationOptions {
  imageSource?: OxyImage
  horizontalAlignment?: HorizontalAlignment
  x?: PlotLength
  y?: PlotLength
  offsetX?: PlotLength
  offsetY?: PlotLength
  width?: PlotLength
  height?: PlotLength
  opacity?: number
  interpolate?: boolean
  verticalAlignment?: VerticalAlignment
}

const DefaultImageAnnotationOptions: CreateImageAnnotationOptions = {
  x: newPlotLength(0.5, PlotLengthUnit.RelativeToPlotArea),
  y: newPlotLength(0.5, PlotLengthUnit.RelativeToPlotArea),
  offsetX: newPlotLength(0, PlotLengthUnit.ScreenUnits),
  offsetY: newPlotLength(0, PlotLengthUnit.ScreenUnits),
  width: newPlotLength(NaN, PlotLengthUnit.ScreenUnits),
  height: newPlotLength(NaN, PlotLengthUnit.ScreenUnits),
  opacity: 1.0,
  interpolate: true,
  horizontalAlignment: HorizontalAlignment.Center,
  verticalAlignment: VerticalAlignment.Middle,

  imageSource: undefined,
}

export const ExtendedDefaultImageAnnotationOptions = {
  ...ExtendedDefaultTransposableAnnotationOptions,
  ...DefaultImageAnnotationOptions,
}

/**
 * Represents an annotation that shows an image.
 */
export class ImageAnnotation extends TransposableAnnotation {
  /**
   * The actual bounds of the rendered image.
   */
  private actualBounds: OxyRect = OxyRect_Empty

  constructor(opt?: CreateImageAnnotationOptions) {
    super(opt)
    assignObject(this, DefaultImageAnnotationOptions, opt)
  }

  getElementName() {
    return 'ImageAnnotation'
  }

  /**
   * Gets or sets the image source.
   */
  public imageSource?: OxyImage

  /**
   * Gets or sets the X position of the image.
   */
  public x: PlotLength = DefaultImageAnnotationOptions.x!

  /**
   * Gets or sets the Y position of the image.
   */
  public y: PlotLength = DefaultImageAnnotationOptions.y!

  /**
   * Gets or sets the X offset.
   */
  public offsetX: PlotLength = DefaultImageAnnotationOptions.offsetX!

  /**
   * Gets or sets the Y offset.
   */
  public offsetY: PlotLength = DefaultImageAnnotationOptions.offsetY!

  /**
   * Gets or sets the width.
   */
  public width: PlotLength = DefaultImageAnnotationOptions.width!

  /**
   * Gets or sets the height.
   */
  public height: PlotLength = DefaultImageAnnotationOptions.height!

  /**
   * Gets or sets the opacity (0-1).
   */
  public opacity: number = DefaultImageAnnotationOptions.opacity!

  /**
   * Gets or sets a value indicating whether to apply smooth interpolation to the image.
   */
  public interpolate: boolean = DefaultImageAnnotationOptions.interpolate!

  /**
   * Gets or sets the horizontal alignment.
   */
  public horizontalAlignment: HorizontalAlignment = DefaultImageAnnotationOptions.horizontalAlignment!

  /**
   * Gets or sets the vertical alignment.
   */
  public verticalAlignment: VerticalAlignment = DefaultImageAnnotationOptions.verticalAlignment!

  public async render(rc: IRenderContext): Promise<void> {
    if (!this.imageSource) {
      throw new Error(`${this.imageSource} must be non-null before rendering.`)
    }

    const p = this.getPoint(this.x, this.y, this.plotModel)
    const o = this.getVector(this.offsetX, this.offsetY, this.plotModel)
    const position = screenPointPlus(p, o)

    const s = this.getVector(this.width, this.height, this.plotModel)

    let width = s.x
    let height = s.y

    if (isNaN(width) && isNaN(height)) {
      width = this.imageSource.width
      height = this.imageSource.height
    }

    if (isNaN(width)) {
      width = (height / this.imageSource.height) * this.imageSource.width
    }

    if (isNaN(height)) {
      height = (width / this.imageSource.width) * this.imageSource.height
    }

    width = Math.abs(width)
    height = Math.abs(height)

    let x = position.x
    let y = position.y

    const ha = this.horizontalAlignment
    const va = this.verticalAlignment

    if (ha === HorizontalAlignment.Center) {
      x -= width * 0.5
    } else if (ha === HorizontalAlignment.Right) {
      x -= width
    }

    if (va === VerticalAlignment.Middle) {
      y -= height * 0.5
    } else if (va === VerticalAlignment.Bottom) {
      y -= height
    }

    this.actualBounds = newOxyRect(x, y, width, height)

    await RenderingExtensions.drawImage(rc, this.imageSource, x, y, width, height, this.opacity, this.interpolate)
  }

  /**
   * When overridden in a derived class, tests if the plot element is hit by the specified point.
   * @param args The hit test arguments.
   */
  public hitTestOverride(args: HitTestArguments): HitTestResult | undefined {
    if (OxyRectHelper.containsPoint(this.actualBounds, args.point)) {
      return {
        element: this,
        nearestHitPoint: args.point,
      }
    }

    return undefined
  }

  /**
   * Gets the point.
   * @returns The point in screen coordinates.
   */
  public getPoint(x: PlotLength, y: PlotLength, model: any): ScreenPoint {
    let xd = NaN
    let yd = NaN

    if (x.unit === PlotLengthUnit.Data || y.unit === PlotLengthUnit.Data) {
      const dataX = x.unit === PlotLengthUnit.Data ? x.value : NaN
      const dataY = y.unit === PlotLengthUnit.Data ? y.value : NaN
      const p = PlotElementExtensions.transform(this, dataX, dataY)
      xd = p.x
      yd = p.y
    }

    switch (x.unit) {
      case PlotLengthUnit.Data:
        break
      case PlotLengthUnit.ScreenUnits:
        xd = x.value
        break
      case PlotLengthUnit.RelativeToViewport:
        xd = model.width * x.value
        break
      case PlotLengthUnit.RelativeToPlotArea:
        xd = model.plotArea.left + model.plotArea.width * x.value
        break
      default:
        throw new Error('Invalid unit')
    }

    switch (y.unit) {
      case PlotLengthUnit.Data:
        break
      case PlotLengthUnit.ScreenUnits:
        yd = y.value
        break
      case PlotLengthUnit.RelativeToViewport:
        yd = model.height * y.value
        break
      case PlotLengthUnit.RelativeToPlotArea:
        yd = model.plotArea.top + model.plotArea.height * y.value
        break
      default:
        throw new Error('Invalid unit')
    }

    return newScreenPoint(xd, yd)
  }

  public getVector(x: PlotLength, y: PlotLength, model: any): ScreenVector {
    let xd = NaN
    let yd = NaN

    if (x.unit === PlotLengthUnit.Data || y.unit === PlotLengthUnit.Data) {
      const dataX = x.unit === PlotLengthUnit.Data ? x.value : NaN
      const dataY = y.unit === PlotLengthUnit.Data ? y.value : NaN
      const sp = PlotElementExtensions.transform(this, dataX, dataY)
      const v = screenPointMinus(sp, this.transform(DataPoint_Zero))
      xd = v.x
      yd = v.y
    }

    switch (x.unit) {
      case PlotLengthUnit.Data:
        break
      case PlotLengthUnit.ScreenUnits:
        xd = x.value
        break
      case PlotLengthUnit.RelativeToViewport:
        xd = model.width * x.value
        break
      case PlotLengthUnit.RelativeToPlotArea:
        xd = model.plotArea.width * x.value
        break
      default:
        throw new Error('Invalid unit')
    }

    switch (y.unit) {
      case PlotLengthUnit.Data:
        break
      case PlotLengthUnit.ScreenUnits:
        yd = y.value
        break
      case PlotLengthUnit.RelativeToViewport:
        yd = model.height * y.value
        break
      case PlotLengthUnit.RelativeToPlotArea:
        yd = model.plotArea.height * y.value
        break
      default:
        throw new Error('Invalid unit')
    }

    return newScreenVector(xd, yd)
  }

  public getClippingRect(): OxyRect {
    if (this.x.unit === PlotLengthUnit.Data || this.y.unit === PlotLengthUnit.Data) {
      return super.getClippingRect()
    }

    return OxyRect_Everything
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultImageAnnotationOptions
  }
}
