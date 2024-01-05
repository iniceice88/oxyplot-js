import {
  CursorType,
  type IPlotView,
  MouseManipulator,
  type OxyMouseEventArgs,
  ScreenPoint,
  ScreenPoint_LeftTop,
} from '@/oxyplot'

/**
 * Provides a manipulator for panning functionality.
 */
export class PanManipulator extends MouseManipulator {
  /**
   * Initializes a new instance of the PanManipulator class.
   * @param plotView The plot view.
   */
  constructor(plotView: IPlotView) {
    super(plotView)
  }

  /**
   * Gets or sets the previous position.
   */
  private previousPosition: ScreenPoint = ScreenPoint_LeftTop

  /**
   * Gets or sets a value indicating whether panning is enabled.
   */
  private isPanEnabled: boolean = false

  /**
   * Occurs when a manipulation is complete.
   * @param e The OxyMouseEventArgs instance containing the event data.
   */
  public completed(e: OxyMouseEventArgs): void {
    super.completed(e)
    if (!this.isPanEnabled) {
      return
    }

    this.view.setCursorType(CursorType.Default)
    e.handled = true
  }

  /**
   * Occurs when the input device changes position during a manipulation.
   * @param e The OxyMouseEventArgs instance containing the event data.
   */
  public delta(e: OxyMouseEventArgs): void {
    super.delta(e)
    if (!this.isPanEnabled) {
      return
    }

    if (this.xAxis) {
      this.xAxis.pan(this.previousPosition, e.position)
    }

    if (this.yAxis) {
      this.yAxis.pan(this.previousPosition, e.position)
    }

    this.plotView.invalidatePlot(false)
    this.previousPosition = e.position
    e.handled = true
  }

  /**
   * Occurs when an input device begins a manipulation on the plot.
   * @param e The OxyMouseEventArgs instance containing the event data.
   */
  public started(e: OxyMouseEventArgs): void {
    super.started(e)
    this.previousPosition = e.position

    this.isPanEnabled = !!((this.xAxis && this.xAxis.isPanEnabled) || (this.yAxis && this.yAxis.isPanEnabled))

    if (this.isPanEnabled) {
      this.view.setCursorType(CursorType.Pan)
      e.handled = true
    }
  }
}
