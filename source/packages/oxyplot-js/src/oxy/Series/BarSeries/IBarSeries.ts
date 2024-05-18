import { Axis, type BarItemBase, BarSeriesManager, CategoryAxis, PlotModel } from '@/oxyplot'
import { isNullOrUndef } from '@/patch'

/**
 * Defines the functionality of a bar series.
 */
export interface IBarSeries {
  /**
   * Gets the bar width.
   */
  readonly barWidth: number

  /**
   * Gets the CategoryAxis the bar series uses.
   */
  readonly categoryAxis: CategoryAxis

  /**
   * Gets a value indicating whether the bar series is visible.
   */
  readonly isVisible: boolean

  /**
   * Gets or sets the manager of the bar series.
   */
  manager?: BarSeriesManager

  /**
   * Gets the PlotModel the bar series belongs to.
   */
  readonly plotModel: PlotModel

  /**
   * Gets the ValueAxis the bar series uses.
   */
  readonly valueAxis?: Axis

  /**
   * Updates the valid data.
   */
  updateValidData(): void

  /**
   * Gets the actual bar items.
   */
  readonly actualItems: BarItemBase[]
}

/**
 * check if the specified axis is a bar series
 * @param axis
 */
export function isBarSeries(axis: any): axis is IBarSeries {
  return axis && !isNullOrUndef(axis.barWidth) && axis.categoryAxis
}
