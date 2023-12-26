import { type IPlotView, MouseManipulator, type OxyMouseEventArgs } from '@/oxyplot'

/**
 * Provides a plot view manipulator for stepwise zoom functionality.
 */
export class ZoomStepManipulator extends MouseManipulator {
  /**
   * Initializes a new instance of the ZoomStepManipulator class.
   */
  constructor(plotView: IPlotView, step: number, fineControl: boolean) {
    super(plotView)
    this.step = step
    this.fineControl = fineControl
  }

  /**
   * Gets or sets a value indicating whether FineControl.
   */
  public fineControl: boolean

  /**
   * Gets or sets Step.
   */
  public step: number

  /**
   * Occurs when an input device begins a manipulation on the plot.
   * @param e The OxyMouseEventArgs instance containing the event data.
   */
  public started(e: OxyMouseEventArgs): void {
    super.started(e)

    const isZoomEnabled = (this.xAxis && this.xAxis.isZoomEnabled) || (this.yAxis && this.yAxis.isZoomEnabled)

    if (!isZoomEnabled) {
      return
    }

    const current = this.inverseTransform(e.position.x, e.position.y)

    let scale = this.step
    if (this.fineControl) {
      scale *= 3
    }

    if (scale > 0) {
      scale = 1 + scale
    } else {
      scale = 1.0 / (1 - scale)
    }

    if (this.xAxis) {
      this.xAxis.zoomAt(scale, current.x)
    }

    if (this.yAxis) {
      this.yAxis.zoomAt(scale, current.y)
    }

    this.plotView.invalidatePlot(false)
    e.handled = true
  }
}
