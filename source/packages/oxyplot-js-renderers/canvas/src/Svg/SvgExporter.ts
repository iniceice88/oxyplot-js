import { type IExporter, type IPlotModel, type IRenderContext, type ITextMeasurer, newOxyRect } from 'oxyplot-js'
import { SvgRenderContext } from './SvgRenderContext'

/**
 * Provides functionality to export plots to scalable vector graphics.
 */
export class SvgExporter implements IExporter {
  /**
   * Initializes a new instance of the SvgExporter class.
   */
  constructor() {
    this.width = 600
    this.height = 400
    this.isDocument = true
  }

  /**
   * Gets or sets the width (in user units) of the output area.
   */
  public width: number

  /**
   * Gets or sets the height (in user units) of the output area.
   */
  public height: number

  /**
   * Gets or sets a value indicating whether the xml headers should be included.
   */
  public isDocument: boolean

  /**
   * Gets or sets a value indicating whether to use a workaround for vertical text alignment to support renderers with limited support for the dominate-baseline attribute.
   */
  public useVerticalTextAlignmentWorkaround: boolean = false

  /**
   * Gets or sets the text measurer.
   */
  public textMeasurer?: IRenderContext

  /**
   * Exports the specified model to a stream.
   * @param model The model.
   * @param width The width (points).
   * @param height The height (points).
   * @param isDocument if set to true, the xml headers will be included (?xml and !DOCTYPE).
   * @param textMeasurer The text measurer.
   * @param useVerticalTextAlignmentWorkaround Whether to use the workaround for vertical text alignment
   */
  public static async export(
    model: IPlotModel,
    width: number,
    height: number,
    isDocument: boolean,
    textMeasurer?: ITextMeasurer,
    useVerticalTextAlignmentWorkaround: boolean = false,
  ): Promise<string> {
    if (!textMeasurer) {
      throw new Error('textMeasurer is required')
    }

    const rc = new SvgRenderContext(
      width,
      height,
      isDocument,
      textMeasurer!,
      model.background,
      useVerticalTextAlignmentWorkaround,
    )
    model.update(true)
    await model.render(rc, newOxyRect(0, 0, width, height))
    rc.complete()
    rc.flush()

    return rc.getXml()
  }

  /**
   * Exports to string.
   * @param model The model.
   * @param width The width (points).
   * @param height The height (points).
   * @param isDocument if set to true, the xml headers will be included (?xml and !DOCTYPE).
   * @param textMeasurer The text measurer.
   * @returns The plot as an SVG string.
   * @param useVerticalTextAlignmentWorkaround Whether to use the workaround for vertical text alignment
   */
  public static exportToString(
    model: IPlotModel,
    width: number,
    height: number,
    isDocument: boolean,
    textMeasurer?: ITextMeasurer,
    useVerticalTextAlignmentWorkaround: boolean = false,
  ): Promise<string> {
    return this.export(model, width, height, isDocument, textMeasurer, useVerticalTextAlignmentWorkaround)
  }

  /**
   * Exports the specified PlotModel to a Stream.
   * @param model The model to export.
   */
  public async export(model: IPlotModel): Promise<ArrayBuffer> {
    const svg = await SvgExporter.export(
      model,
      this.width,
      this.height,
      this.isDocument,
      this.textMeasurer,
      this.useVerticalTextAlignmentWorkaround,
    )
    const encoder = new TextEncoder()
    return encoder.encode(svg).buffer
  }

  /**
   * Exports the specified PlotModel to a string.
   * @param model The model.
   * @returns the SVG content as a string.
   */
  public exportToString(model: IPlotModel): Promise<string> {
    return SvgExporter.exportToString(
      model,
      this.width,
      this.height,
      this.isDocument,
      this.textMeasurer,
      this.useVerticalTextAlignmentWorkaround,
    )
  }
}
