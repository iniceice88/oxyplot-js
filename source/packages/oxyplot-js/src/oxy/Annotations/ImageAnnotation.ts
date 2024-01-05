import {
  type CreateTransposableAnnotationOptions,
  DataPoint_Zero,
  HitTestArguments,
  type HitTestResult,
  HorizontalAlignment,
  type IRenderContext,
  OxyImage,
  OxyRect,
  PlotElementExtensions,
  PlotLength,
  PlotLengthUnit,
  RenderingExtensions,
  ScreenPoint,
  ScreenVector,
  TransposableAnnotation,
  VerticalAlignment,
} from '@/oxyplot'
import { removeUndef } from '@/patch'

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

/**
 * Represents an annotation that shows an image.
 */
export class ImageAnnotation extends TransposableAnnotation {
  /**
   * The actual bounds of the rendered image.
   */
  private actualBounds: OxyRect = OxyRect.Empty

  constructor(opt?: CreateImageAnnotationOptions) {
    super(opt)
    this.x = new PlotLength(0.5, PlotLengthUnit.RelativeToPlotArea)
    this.y = new PlotLength(0.5, PlotLengthUnit.RelativeToPlotArea)
    this.offsetX = new PlotLength(0, PlotLengthUnit.ScreenUnits)
    this.offsetY = new PlotLength(0, PlotLengthUnit.ScreenUnits)
    this.width = new PlotLength(NaN, PlotLengthUnit.ScreenUnits)
    this.height = new PlotLength(NaN, PlotLengthUnit.ScreenUnits)
    this.opacity = 1.0
    this.interpolate = true
    this.horizontalAlignment = HorizontalAlignment.Center
    this.verticalAlignment = VerticalAlignment.Middle

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the image source.
   */
  public imageSource?: OxyImage

  /**
   * Gets or sets the horizontal alignment.
   */
  public horizontalAlignment: HorizontalAlignment

  /**
   * Gets or sets the X position of the image.
   */
  public x: PlotLength

  /**
   * Gets or sets the Y position of the image.
   */
  public y: PlotLength

  /**
   * Gets or sets the X offset.
   */
  public offsetX: PlotLength

  /**
   * Gets or sets the Y offset.
   */
  public offsetY: PlotLength

  /**
   * Gets or sets the width.
   */
  public width: PlotLength

  /**
   * Gets or sets the height.
   */
  public height: PlotLength

  /**
   * Gets or sets the opacity (0-1).
   */
  public opacity: number

  /**
   * Gets or sets a value indicating whether to apply smooth interpolation to the image.
   */
  public interpolate: boolean

  /**
   * Gets or sets the vertical alignment.
   */
  public verticalAlignment: VerticalAlignment

  public async render(rc: IRenderContext): Promise<void> {
    if (!this.imageSource) {
      throw new Error(`${this.imageSource} must be non-null before rendering.`)
    }

    const p = this.getPoint(this.x, this.y, this.plotModel)
    const o = this.getVector(this.offsetX, this.offsetY, this.plotModel)
    const position = p.plus(o)

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

    this.actualBounds = new OxyRect(x, y, width, height)

    await RenderingExtensions.drawImage(rc, this.imageSource, x, y, width, height, this.opacity, this.interpolate)
  }

  /**
   * When overridden in a derived class, tests if the plot element is hit by the specified point.
   * @param args The hit test arguments.
   */
  public hitTestOverride(args: HitTestArguments): HitTestResult | undefined {
    if (this.actualBounds.containsPoint(args.point)) {
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

    return new ScreenPoint(xd, yd)
  }

  public getVector(x: PlotLength, y: PlotLength, model: any): ScreenVector {
    let xd = NaN
    let yd = NaN

    if (x.unit === PlotLengthUnit.Data || y.unit === PlotLengthUnit.Data) {
      const dataX = x.unit === PlotLengthUnit.Data ? x.value : NaN
      const dataY = y.unit === PlotLengthUnit.Data ? y.value : NaN
      const v = PlotElementExtensions.transform(this, dataX, dataY).minus(this.transform(DataPoint_Zero))
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

    return new ScreenVector(xd, yd)
  }

  public getClippingRect(): OxyRect {
    if (this.x.unit === PlotLengthUnit.Data || this.y.unit === PlotLengthUnit.Data) {
      return super.getClippingRect()
    }

    return OxyRect.Everything
  }
}
