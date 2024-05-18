import { newOxySize, type OxyRect, OxyRect_Empty, OxyRectHelper, PlotModel, ScreenPoint_LeftTop } from 'oxyplot-js'
import { PdfRenderContext } from './PdfRenderContext'
import { jsPDF } from 'jspdf'
import { WebPlotViewBase } from './WebPlotViewBase'

export class PdfPlotView extends WebPlotViewBase {
  private readonly _view: HTMLIFrameElement

  constructor(view: HTMLIFrameElement) {
    super()
    this._view = view
    this.calcClientArea()
  }

  private _orientation: 'p' | 'portrait' | 'l' | 'landscape' = 'portrait'

  get orientation() {
    return this._orientation
  }

  set orientation(value: 'p' | 'portrait' | 'l' | 'landscape') {
    if (value === this._orientation) return
    this._orientation = value
    this.calcClientArea()
  }

  private calcClientArea() {
    const pdf = new jsPDF({
      unit: 'px',
      orientation: this.orientation,
    })
    const pdfPageSize = newOxySize(pdf.internal.pageSize.width, pdf.internal.pageSize.height)
    pdf.close()
    this._clientArea = OxyRectHelper.fromScreenPointAndSize(ScreenPoint_LeftTop, pdfPageSize)
  }

  private _clientArea: OxyRect = OxyRect_Empty
  get clientArea(): OxyRect {
    return this._clientArea
  }

  async renderOverride(model: PlotModel): Promise<void> {
    const rc = new PdfRenderContext(this.orientation)
    await model.render(rc, this.clientArea)
    const pdf = rc.getPdf()
    if (pdf.internal.pages.length > 1) {
      pdf.deletePage(1)
    }

    const dataUrl = pdf.output('dataurlstring', {
      filename: model.title + '.pdf',
    })

    this._view.src = ''
    this._view.src = dataUrl
  }
}
