import type { IPlotController, OxyRect } from '@/oxyplot'
import { CursorType, PlotModel, TrackerHitResult } from '@/oxyplot'

/**
 * Specifies functionality for the plot views.
 */
export interface IPlotView {
  /**
   * Gets the actual PlotModel of the control.
   */
  readonly actualModel?: PlotModel

  /**
   * Gets the actual controller.
   */
  readonly actualController: IPlotController

  /**
   * Gets the coordinates of the client area of the view.
   */
  readonly clientArea: OxyRect

  /**
   * Hides the tracker.
   */
  hideTracker(): void

  /**
   * Invalidates the plot (not blocking the UI thread)
   * @param updateData if set to true, all data bindings will be updated.
   */
  invalidatePlot(updateData?: boolean): void

  /**
   * Shows the tracker.
   * @param trackerHitResult The tracker data.
   */
  showTracker(trackerHitResult: TrackerHitResult): void

  /**
   * Stores text on the clipboard.
   * @param text The text.
   */
  setClipboardText(text: string): void

  /**
   * Sets the cursor type.
   * @param cursorType The cursor type.
   */
  setCursorType(cursorType: CursorType): void

  /**
   * Hides the zoom rectangle.
   */
  hideZoomRectangle(): void

  /**
   * Shows the zoom rectangle.
   * @param rectangle The rectangle.
   */
  showZoomRectangle(rectangle: OxyRect): void
}
