import { type OxyRect, OxyRect_Empty, PlotModel } from 'oxyplot-js'
import { PdfRenderContext } from './PdfRenderContext'
import { jsPDF } from 'jspdf'
import { WebPlotViewBase } from 'oxyplot-js-renderers'
import type { CreatePdfOptions } from './PdfExporter'
import { calculatePdfClientArea } from './utils'

const defaultPdfOptions: CreatePdfOptions = {
  unit: 'px',
  orientation: 'l',
}

export class PdfPlotView extends WebPlotViewBase {
  private readonly _view: HTMLIFrameElement

  constructor(view: HTMLIFrameElement, opt?: CreatePdfOptions) {
    super()
    if (opt?.unit && opt.unit !== 'px') {
      throw new Error('pdf unit must be px, but got ' + opt.unit)
    }
    this._view = view
    this._pdfOptions = Object.assign({}, defaultPdfOptions, opt)
    this.calcClientArea()
  }

  private _pdfOptions: CreatePdfOptions

  get pdfOptions() {
    return this._pdfOptions
  }

  set pdfOptions(opt: CreatePdfOptions) {
    this._pdfOptions = opt
    this.calcClientArea()
  }

  private calcClientArea() {
    const pdf = new jsPDF(this._pdfOptions)
    this._clientArea = calculatePdfClientArea(pdf)
    pdf.close()
  }

  private _clientArea: OxyRect = OxyRect_Empty
  get clientArea(): OxyRect {
    return this._clientArea
  }

  async renderOverride(model: PlotModel): Promise<void> {
    const rc = new PdfRenderContext(this._pdfOptions)
    await model.render(rc, this._clientArea)
    const pdf = rc.getPdf()

    const dataUrl = pdf.output('dataurlstring', {
      filename: model.title + '.pdf',
    })

    this._view.src = ''
    this._view.src = dataUrl
  }
}
