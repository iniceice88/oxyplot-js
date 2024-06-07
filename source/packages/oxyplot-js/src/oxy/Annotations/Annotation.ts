import {
  AnnotationLayer,
  type Axis,
  type CreatePlotElementOptions,
  type DataPoint,
  ExtendedDefaultPlotElementOptions,
  type IRenderContext,
  type IXyAxisPlotElement,
  newScreenPoint,
  type OxyRect,
  OxyRectEx,
  OxyRectHelper,
  PlotElement,
  PlotElementUtilities,
  type ScreenPoint,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateAnnotationOptions extends CreatePlotElementOptions {
  xAxisKey?: string
  yAxisKey?: string
  layer?: AnnotationLayer
  clipByXAxis?: boolean
  clipByYAxis?: boolean
  xAxis?: Axis
  yAxis?: Axis
}

const DefaultAnnotationOptions: CreateAnnotationOptions = {
  clipByXAxis: true,
  clipByYAxis: true,
  layer: AnnotationLayer.AboveSeries,

  xAxisKey: undefined,
  yAxisKey: undefined,
  xAxis: undefined,
  yAxis: undefined,
}

export const ExtendedDefaultAnnotationOptions = {
  ...ExtendedDefaultPlotElementOptions,
  ...DefaultAnnotationOptions,
}

/**
 * Provides an abstract base class for annotations.
 */
export abstract class Annotation extends PlotElement implements IXyAxisPlotElement {
  /**
   * The rendering layer of the annotation. The default value is AnnotationLayer.AboveSeries.
   */
  public layer: AnnotationLayer = DefaultAnnotationOptions.layer!

  private _xAxis?: Axis
  /**
   * The X axis.
   */
  public get xAxis(): Axis | undefined {
    return this._xAxis
  }

  /**
   * The X axis key.
   */
  public xAxisKey?: string

  private _yAxis?: Axis
  /**
   * The Y axis.
   */
  public get yAxis(): Axis | undefined {
    return this._yAxis
  }

  /**
   * A value indicating whether to clip the annotation by the X axis range.
   */
  public clipByXAxis: boolean = DefaultAnnotationOptions.clipByXAxis!

  /**
   * A value indicating whether to clip the annotation by the Y axis range.
   */
  public clipByYAxis: boolean = DefaultAnnotationOptions.clipByYAxis!

  /**
   * The Y axis key.
   */
  public yAxisKey?: string

  /**
   * Initializes a new instance of the Annotation class.
   */
  protected constructor(opt?: CreateAnnotationOptions) {
    super(opt)

    assignObject(this, DefaultAnnotationOptions, opt)

    if (opt) {
      if (opt.xAxis) this._xAxis = opt.xAxis
      if (opt.yAxis) this._yAxis = opt.yAxis
    }
  }

  /**
   * Ensures that the annotation axes are set.
   */
  public ensureAxes(): void {
    this._xAxis = this.xAxisKey ? this.plotModel.getAxis(this.xAxisKey) : this.plotModel.defaultXAxis
    this._yAxis = this.yAxisKey ? this.plotModel.getAxis(this.yAxisKey) : this.plotModel.defaultYAxis
  }

  /**
   * Renders the annotation on the specified context.
   * @param rc The render context.
   */
  public abstract render(rc: IRenderContext): Promise<void>

  /**
   * Gets the clipping rect.
   */
  public getClippingRect(): OxyRect {
    const rect = this.plotModel.plotArea
    const axisRect = new OxyRectEx(PlotElementUtilities.getClippingRect(this))

    let minX = 0
    let maxX = Number.POSITIVE_INFINITY
    let minY = 0
    let maxY = Number.POSITIVE_INFINITY

    if (this.clipByXAxis) {
      minX = axisRect.topLeft.x
      maxX = axisRect.bottomRight.x
    }

    if (this.clipByYAxis) {
      minY = axisRect.topLeft.y
      maxY = axisRect.bottomRight.y
    }

    const minPoint = newScreenPoint(minX, minY)
    const maxPoint = newScreenPoint(maxX, maxY)

    const axisClipRect = OxyRectHelper.fromScreenPoints(minPoint, maxPoint)
    return OxyRectHelper.clip(rect, axisClipRect)
  }

  /**
   * Transforms the data point.
   * @param p The data point.
   */
  public transform(p: DataPoint): ScreenPoint {
    return PlotElementUtilities.transform(this, p)
  }

  /**
   * Inverse transforms the screen point.
   * @param p The screen point.
   */
  public inverseTransform(p: ScreenPoint): DataPoint {
    return PlotElementUtilities.inverseTransform(this, p)
  }
}
