import type { CreateXYAxisSeriesOptions, DataPoint, ScreenPoint } from '@/oxyplot'
import { isDataPoint, isDataPointProvider, newDataPoint, TrackerHitResult, XYAxisSeries } from '@/oxyplot'

export interface CreateDataPointSeriesOptions extends CreateXYAxisSeriesOptions {
  points?: DataPoint[]
  canTrackerInterpolatePoints?: boolean
  dataFieldX?: string
  dataFieldY?: string
  mapping?: (item: any) => DataPoint
}

/**
 * Provides an abstract base class for series that contain a collection of DataPoints.
 */
export abstract class DataPointSeries extends XYAxisSeries {
  protected constructor(opt?: CreateDataPointSeriesOptions) {
    super(opt)

    if (opt) {
      if (opt.points) {
        this._points.push(...opt.points)
        delete opt.points
      }
    }
  }

  /**
   * The list of data points.
   */
  private readonly _points: DataPoint[] = []

  /**
   * The data points from the items source.
   */
  private _itemsSourcePoints: DataPoint[] = []

  /**
   * A value indicating whether the tracker can interpolate points.
   */
  public canTrackerInterpolatePoints: boolean = false

  /**
   * The data field X. The default is null.
   */
  public dataFieldX?: string

  /**
   * The data field Y. The default is null.
   */
  public dataFieldY?: string

  /**
   * The delegate used to map from ItemsSeries.ItemsSource to the ActualPoints. The default is null.
   */
  public mapping?: (item: any) => DataPoint

  /**
   * Gets the list of points.
   */
  public get points(): DataPoint[] {
    return this._points
  }

  /**
   * Gets the list of points that should be rendered.
   */
  protected get actualPoints(): DataPoint[] {
    return this.itemsSource ? this._itemsSourcePoints : this._points
  }

  /**
   * Gets the point on the series that is nearest the specified point.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (interpolate && !this.canTrackerInterpolatePoints) {
      return undefined
    }

    let result: TrackerHitResult | undefined = undefined
    if (interpolate) {
      result = this.getNearestInterpolatedPointInternal(this.actualPoints, 0, point)
    }

    if (!result) {
      result = this.getNearestPointInternal(this.actualPoints, 0, point)
    }

    if (result && this.trackerStringFormatter) {
      result.text = this.formatDefaultTrackerString(result.item, result.dataPoint!)
    }

    return result
  }

  /**
   * Updates the data.
   * @internal
   */
  updateData(): void {
    if (!this.itemsSource) {
      return
    }

    this.updateItemsSourcePoints()
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()
    this.internalUpdateMaxMin(this.actualPoints)
  }

  /**
   * Gets the item at the specified index.
   */
  protected getItem(i: number): any {
    const actualPoints = this.actualPoints
    if (!this.itemsSource && actualPoints && i < actualPoints.length) {
      return actualPoints[i]
    }

    return super.getItem(i)
  }

  /**
   * Clears or creates the itemsSourcePoints list.
   */
  private clearItemsSourcePoints(): void {
    if (!this._itemsSourcePoints) return
    this._itemsSourcePoints.length = 0
  }

  /**
   * Updates the points from the ItemsSource.
   */
  private updateItemsSourcePoints(): void {
    if (!this.itemsSource) return

    const itemsSource = this.itemsSource!
    // Use the Mapping property to generate the points
    if (this.mapping) {
      this.clearItemsSourcePoints()
      for (const item of itemsSource) {
        this._itemsSourcePoints.push(this.mapping(item))
      }

      return
    }

    this.clearItemsSourcePoints()
    for (const item of itemsSource) {
      const dp = this.convertToDataPoint(item)
      if (!dp) continue
      this._itemsSourcePoints.push(dp)
    }
  }

  protected convertToDataPoint(item: any): DataPoint | undefined {
    if (!item) return undefined

    if (isDataPoint(item)) {
      return item
    }

    if (this.dataFieldX && this.dataFieldY) {
      const x = this.xAxis ? this.xAxis.itemToDouble(item[this.dataFieldX]) : Number(item[this.dataFieldX])
      const y = this.yAxis ? this.yAxis.itemToDouble(item[this.dataFieldY]) : Number(item[this.dataFieldY])

      return newDataPoint(x, y)
    }

    if (isDataPointProvider(item)) {
      return item.getDataPoint()
    }
    throw new Error(`Cannot convert item ${item} to DataPoint`)
  }
}
