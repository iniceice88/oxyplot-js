import type { IPlotView, IRenderContext, OxyColor, OxyRect } from '@/oxyplot'

/**
 * Specifies functionality for the plot model.
 */
export interface IPlotModel {
  /**
   * Gets the color of the background of the plot.
   * If the background color is set to OxyColors.Undefined or is otherwise invisible then the background will be determined by the plot view or exporter.
   */
  readonly background: OxyColor

  /**
   * Updates the model.
   * @param updateData if set to true, all data collections will be updated.
   */
  update(updateData: boolean): void

  /**
   * Renders the plot with the specified rendering context within the given rectangle.
   * @param rc The rendering context.
   * @param rect The plot bounds.
   */
  render(rc: IRenderContext, rect: OxyRect): Promise<void>

  /**
   * Attaches this model to the specified plot view.
   * Only one plot view can be attached to the plot model.
   * The plot model contains data (e.g. axis scaling) that is only relevant to the current plot view.
   * @param plotView The plot view.
   */
  attachPlotView(plotView?: IPlotView): void
}
