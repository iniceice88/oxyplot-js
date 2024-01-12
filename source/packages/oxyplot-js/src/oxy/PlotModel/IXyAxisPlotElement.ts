import type { DataPoint, IPlotElement, ScreenPoint } from '@/oxyplot'
import { Axis } from '@/oxyplot'

/**
 * Defines a plot element that uses an X and a Y axis.
 */
export interface IXyAxisPlotElement extends IPlotElement {
  /**
   * Gets the X axis.
   */
  readonly xAxis?: Axis

  /**
   * Gets the Y axis.
   */
  readonly yAxis?: Axis

  /**
   * Transforms the specified data point to a screen point by the axes of the plot element.
   * @param p The data point.
   */
  transform(p: DataPoint): ScreenPoint

  /**
   * Transforms from a screen point to a data point by the axes of this series.
   * @param p The screen point.
   */
  inverseTransform(p: ScreenPoint): DataPoint
}
