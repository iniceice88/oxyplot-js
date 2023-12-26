import type { Series } from '@/oxyplot'
import { Axis, DataPoint, OxyRect, PlotModel, ScreenPoint, XYAxisSeries } from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface CreateTrackerHitResultOptions {
  dataPoint?: DataPoint
  item?: any
  index?: number
  lineExtents?: OxyRect
  plotModel?: PlotModel
  position?: ScreenPoint
  series?: Series
  text?: string
}

/**
 * Provides data for a tracker hit result.
 *
 * @remarks This is used as DataContext for the TrackerControl.
 * The TrackerControl is visible when the user use the left mouse button to "track" points on the series.
 */
export class TrackerHitResult {
  constructor(opt?: CreateTrackerHitResultOptions) {
    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the nearest or interpolated data point.
   */
  public dataPoint?: DataPoint

  /**
   * Gets or sets the source item of the point.
   * If the current point is from an ItemsSource and is not interpolated, this property will contain the item.
   */
  public item?: any

  /**
   * Gets or sets the index for the Item.
   */
  public index: number = 0

  /**
   * Gets or sets the horizontal/vertical line extents.
   */
  public lineExtents?: OxyRect

  /**
   * Gets or sets the plot model.
   */
  public plotModel?: PlotModel

  /**
   * Gets or sets the position in screen coordinates.
   */
  public position?: ScreenPoint

  /**
   * Gets or sets the series that is being tracked.
   */
  public series?: Series

  /**
   * Gets or sets the text shown in the tracker.
   */
  public text?: string

  /**
   * Gets the X axis.
   */
  public get xAxis(): Axis | undefined {
    if (!this.series || !(this.series instanceof XYAxisSeries)) return undefined
    const xyas = this.series as XYAxisSeries
    return xyas.xAxis
  }

  /**
   * Gets the Y axis.
   */
  public get yAxis(): Axis | undefined {
    if (!this.series || !(this.series instanceof XYAxisSeries)) return undefined
    const xyas = this.series as XYAxisSeries
    return xyas.yAxis
  }

  /**
   * Returns a string that represents this instance.
   */
  public toString(): string {
    return this.text ? this.text.trim() : ''
  }
}
