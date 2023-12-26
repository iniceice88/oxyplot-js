import { type IPlotView, type OxyTouchEventArgs, PlotManipulator } from '@/oxyplot'

/**
 * Provides a manipulator for panning and scaling by touch events.
 */
export class TouchManipulator extends PlotManipulator<OxyTouchEventArgs> {
  /**
   * Initializes a new instance of the TouchManipulator class.
   * @param plotView The plot view.
   */
  constructor(plotView: IPlotView) {
    super(plotView)
    this.setHandledForPanOrZoom = true
  }

  /**
   * Gets or sets a value indicating whether e.Handled should be set to true
   * in case pan or zoom is enabled.
   */
  protected setHandledForPanOrZoom: boolean

  /**
   * Gets or sets a value indicating whether panning is enabled.
   */
  private isPanEnabled: boolean = false

  /**
   * Gets or sets a value indicating whether zooming is enabled.
   */
  private isZoomEnabled: boolean = false

  /**
   * Occurs when a manipulation is complete.
   * @param e The OxyInputEventArgs instance containing the event data.
   */
  public completed(e: OxyTouchEventArgs): void {
    super.completed(e)

    if (this.setHandledForPanOrZoom) {
      e.handled = e.handled || this.isPanEnabled || this.isZoomEnabled
    }
  }

  /**
   * Occurs when a touch delta event is handled.
   * @param e The OxyTouchEventArgs instance containing the event data.
   */
  public delta(e: OxyTouchEventArgs): void {
    super.delta(e)
    if (!this.isPanEnabled && !this.isZoomEnabled) {
      return
    }

    const newPosition = e.position
    const previousPosition = newPosition.minusVector(e.deltaTranslation)

    if (this.xAxis) {
      this.xAxis.pan(previousPosition, newPosition)
    }

    if (this.yAxis) {
      this.yAxis.pan(previousPosition, newPosition)
    }

    const current = this.inverseTransform(newPosition.x, newPosition.y)

    if (this.xAxis) {
      this.xAxis.zoomAt(e.deltaScale.x, current.x)
    }

    if (this.yAxis) {
      this.yAxis.zoomAt(e.deltaScale.y, current.y)
    }

    this.plotView.invalidatePlot(false)
    e.handled = true
  }

  /**
   * Occurs when an input device begins a manipulation on the plot.
   * @param e The OxyTouchEventArgs instance containing the event data.
   */
  public started(e: OxyTouchEventArgs): void {
    this.assignAxes(e.position)
    super.started(e)

    if (this.setHandledForPanOrZoom) {
      this.isPanEnabled = !!((this.xAxis && this.xAxis.isPanEnabled) || (this.yAxis && this.yAxis.isPanEnabled))

      this.isZoomEnabled = !!((this.xAxis && this.xAxis.isZoomEnabled) || (this.yAxis && this.yAxis.isZoomEnabled))

      e.handled = e.handled || this.isPanEnabled || this.isZoomEnabled
    }
  }
}
