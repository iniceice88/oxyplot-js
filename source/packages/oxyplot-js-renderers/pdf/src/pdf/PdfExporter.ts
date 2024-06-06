import { type IExporter, type IPlotModel, PlotModel } from 'oxyplot-js'
import { PdfRenderContext } from './PdfRenderContext'
import { calculatePdfClientArea } from './utils'

const defaultPdfOptions: CreatePdfOptions = {
  unit: 'px',
  orientation: 'l',
}

interface EncryptionOptions {
  userPassword?: string
  ownerPassword?: string
  userPermissions?: ('print' | 'modify' | 'copy' | 'annot-forms')[]
}

export type PdfOrientation = 'p' | 'portrait' | 'l' | 'landscape'

export interface CreatePdfOptions {
  orientation?: PdfOrientation
  unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc'
  format?: string | number[]
  compress?: boolean
  precision?: number
  filters?: string[]
  userUnit?: number
  encryption?: EncryptionOptions
  putOnlyUsedFonts?: boolean
  hotfixes?: string[]
  floatPrecision?: number | 'smart'
}

/**
 * Provides functionality to export plots to pdf.
 */
export class PdfExporter implements IExporter {
  public pdfOptions: CreatePdfOptions

  constructor(opt: CreatePdfOptions) {
    if (opt?.unit && opt.unit !== 'px') {
      throw new Error('pdf unit must be px, but got ' + opt.unit)
    }
    this.pdfOptions = Object.assign({}, defaultPdfOptions, opt)
  }

  /**
   * Exports the specified model to a stream.
   * @param model The model.
   * @param opt create pdf option
   */
  public static export(model: IPlotModel, opt: CreatePdfOptions): Promise<ArrayBuffer> {
    const exporter = new PdfExporter(opt)
    return exporter.export(model)
  }

  /**
   * Exports the specified PlotModel to the specified Stream.
   * @param model The model.
   */
  public async export(model: IPlotModel): Promise<ArrayBuffer> {
    const pdf = await this.renderPdf(model)
    return pdf.output('arraybuffer')
  }

  public async download(model: IPlotModel, fileName?: string) {
    fileName = fileName ?? (model as PlotModel).title
    const pdf = await this.renderPdf(model)
    pdf.save(fileName + '.pdf')
  }

  private async renderPdf(model: IPlotModel) {
    const rc = new PdfRenderContext(this.pdfOptions)
    model.update(true)
    const pdf = rc.getPdf()
    const clientArea = calculatePdfClientArea(pdf)
    await model.render(rc, clientArea)
    return pdf
  }
}
