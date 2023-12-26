import { CursorType, type IPlotView, MouseManipulator, type OxyMouseEventArgs, OxyRect } from '@/oxyplot'

/**
 * Provides a manipulator for rectangle zooming functionality.
 */
export class ZoomRectangleManipulator extends MouseManipulator {
  /**
   * The zoom rectangle.
   */
  private zoomRectangle: OxyRect = OxyRect.Empty

  /**
   * Initializes a new instance of the ZoomRectangleManipulator class.
   * @param plotView The plot view.
   */
  constructor(plotView: IPlotView) {
    super(plotView)
  }

  /**
   * Gets or sets a value indicating whether zooming is enabled.
   */
  private isZoomEnabled: boolean = false

  /**
   * Occurs when a manipulation is complete.
   * @param e The OxyMouseEventArgs instance containing the event data.
   */
  public completed(e: OxyMouseEventArgs): void {
    super.completed(e)
    if (!this.isZoomEnabled) {
      return
    }

    this.plotView.setCursorType(CursorType.Default)
    this.plotView.hideZoomRectangle()

    if (this.zoomRectangle.width > 10 && this.zoomRectangle.height > 10) {
      const p0 = this.inverseTransform(this.zoomRectangle.left, this.zoomRectangle.top)
      const p1 = this.inverseTransform(this.zoomRectangle.right, this.zoomRectangle.bottom)

      if (this.xAxis) {
        this.xAxis.zoom(p0.x, p1.x)
      }

      if (this.yAxis) {
        this.yAxis.zoom(p0.y, p1.y)
      }

      this.plotView.invalidatePlot()
    }

    e.handled = true
  }

  /**
   * Occurs when the input device changes position during a manipulation.
   * @param e The OxyMouseEventArgs instance containing the event data.
   */
  public delta(e: OxyMouseEventArgs): void {
    super.delta(e)
    if (!this.plotView.actualModel || !this.isZoomEnabled) {
      return
    }

    if (!this.startPosition) return

    const plotArea = this.plotView.actualModel.plotArea

    let x = Math.min(this.startPosition.x, e.position.x)
    let w = Math.abs(this.startPosition.x - e.position.x)
    let y = Math.min(this.startPosition.y, e.position.y)
    let h = Math.abs(this.startPosition.y - e.position.y)

    if (this.xAxis === undefined || !this.xAxis.isZoomEnabled) {
      x = plotArea.left
      w = plotArea.width
    }

    if (this.yAxis === undefined || !this.yAxis.isZoomEnabled) {
      y = plotArea.top
      h = plotArea.height
    }

    this.zoomRectangle = new OxyRect(x, y, w, h)
    this.plotView.showZoomRectangle(this.zoomRectangle)
    e.handled = true
  }

  /**
   * Occurs when an input device begins a manipulation on the plot.
   * @param e The OxyMouseEventArgs instance containing the event data.
   */
  public started(e: OxyMouseEventArgs): void {
    super.started(e)

    this.isZoomEnabled = !!((this.xAxis && this.xAxis.isZoomEnabled) || (this.yAxis && this.yAxis.isZoomEnabled))

    if (this.isZoomEnabled && this.startPosition) {
      this.zoomRectangle = new OxyRect(this.startPosition.x, this.startPosition.y, 0, 0)
      this.plotView.showZoomRectangle(this.zoomRectangle)
      this.plotView.setCursorType(this.getCursorType())
      e.handled = true
    }
  }

  /**
   * Gets the cursor for the manipulation.
   * @returns The cursor.
   */
  private getCursorType(): CursorType {
    if (this.xAxis === undefined) {
      return CursorType.ZoomVertical
    }

    if (this.yAxis === undefined) {
      return CursorType.ZoomHorizontal
    }

    return CursorType.ZoomRectangle
  }
}
