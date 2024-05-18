import { type IExporter, type IPlotModel, newOxyRect, PdfRenderContext } from '@/oxyplot'

/**
 * Provides functionality to export plots to pdf.
 * @deprecated OxyPlot.PdfExporter may be removed in a future version. Consider using OxyPlot.SkiaSharp.PdfExporter instead.
 */
export class PdfExporter implements IExporter {
  /**
   * Gets or sets the width (in points, 1/72 inch) of the output document.
   */
  public Width: number

  /**
   * Gets or sets the height (in points, 1/72 inch) of the output document.
   */
  public Height: number

  constructor(width: number, height: number) {
    this.Width = width
    this.Height = height
  }

  /**
   * Exports the specified model to a stream.
   * @param model The model.
   * @param width The width (points).
   * @param height The height (points).
   */
  public static export(model: IPlotModel, width: number, height: number): Promise<ArrayBuffer> {
    const exporter = new PdfExporter(width, height)
    exporter.Width = width
    exporter.Height = height
    return exporter.export(model)
  }

  /**
   * Exports the specified PlotModel to the specified Stream.
   * @param model The model.
   */
  public async export(model: IPlotModel): Promise<ArrayBuffer> {
    const rc = new PdfRenderContext(this.Width, this.Height, model.background)
    model.update(true)
    await model.render(rc, newOxyRect(0, 0, this.Width, this.Height))
    return rc.save()
  }
}
