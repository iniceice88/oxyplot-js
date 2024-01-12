import type { DataPoint, IPlotView, OxyInputEventArgs, ScreenPoint } from '@/oxyplot'
import { Axis, AxisPreference, DataPoint_Zero, ManipulatorBase, newDataPoint } from '@/oxyplot'

/**
 * Provides an abstract base class for plot manipulators.
 */
export abstract class PlotManipulator<T extends OxyInputEventArgs> extends ManipulatorBase<T> {
  /**
   * The plot view where the event was raised.
   */
  public readonly plotView: IPlotView

  /**
   * The axis that the manipulator will prefer to operate on.
   */
  public axisPreference: AxisPreference = AxisPreference.None

  /**
   * The X axis.
   */
  protected xAxis: Axis | undefined

  /**
   * The Y axis.
   */
  protected yAxis: Axis | undefined

  /**
   * Initializes a new instance of the PlotManipulator class.
   * @param view The plot view.
   */
  protected constructor(view: IPlotView) {
    super(view)
    this.plotView = view
  }

  /**
   * Transforms a point from screen coordinates to data coordinates.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @returns A data point.
   */
  protected inverseTransform(x: number, y: number): DataPoint {
    if (this.xAxis) {
      return this.xAxis.inverseTransformPoint(x, y, this.yAxis!)
    }

    if (this.yAxis) {
      return newDataPoint(0, this.yAxis.inverseTransform(y))
    }

    return DataPoint_Zero
  }

  /**
   * Assigns the axes to this manipulator by the specified position.
   * @param position The position.
   */
  protected assignAxes(position: ScreenPoint): void {
    let xaxis: Axis | undefined
    let yaxis: Axis | undefined
    if (this.plotView.actualModel) {
      ;[xaxis, yaxis] = this.plotView.actualModel.getAxesFromPoint(position)

      if (this.axisPreference !== AxisPreference.None && this.plotView.actualModel.plotArea.containsPoint(position)) {
        if (this.axisPreference === AxisPreference.X) {
          if (xaxis) yaxis = undefined
        } else if (this.axisPreference === AxisPreference.Y) {
          if (yaxis) xaxis = undefined
        }
      }
    } else {
      xaxis = undefined
      yaxis = undefined
    }

    this.xAxis = xaxis
    this.yAxis = yaxis
  }
}
