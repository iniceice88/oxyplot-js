import type { IPlotModel } from '@/oxyplot'

/**
 * Defines functionality to export a PlotModel.
 */
export interface IExporter {
  /**
   * Exports the specified PlotModel to a Stream.
   * @param model The model to export.
   */
  export(model: IPlotModel): Promise<ArrayBuffer>
}
