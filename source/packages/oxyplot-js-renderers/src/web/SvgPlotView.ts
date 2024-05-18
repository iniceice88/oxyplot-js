import {
  CursorType,
  EdgeRenderingMode,
  type ITextMeasurer,
  newOxyRect,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRect_Empty,
  OxyRectHelper,
  PlotModel,
  SvgRenderContext,
  TrackerHitResult,
} from 'oxyplot-js'
import { addPlotViewEvents, convertCursorType } from './web-events'
import { canvasTextMeasurer } from './canvasTextMeasurer'
import { WebPlotViewBase } from './WebPlotViewBase'

export class SvgPlotView extends WebPlotViewBase {
  private readonly _view: HTMLDivElement
  private readonly _tooltip: HTMLDivElement
  //private readonly _drawCtx: HTMLElement
  private readonly textMeasurer: ITextMeasurer

  constructor(view: HTMLDivElement) {
    super()
    this._view = view
    this.textMeasurer = canvasTextMeasurer()
    this._tooltip = document.createElement('div')
    this._tooltip.style.position = 'absolute'
    this._tooltip.style.zIndex = '100'
    this._tooltip.style.backgroundColor = '#FFFFA0E0'
    this._tooltip.style.border = '1px solid black'
    this._tooltip.style.padding = '8px'
    this._tooltip.style.visibility = 'hidden'
    this._tooltip.style.pointerEvents = 'none'
    document.body.appendChild(this._tooltip)

    addPlotViewEvents(this._view, this)
  }

  get tooltip(): HTMLElement {
    return this._tooltip
  }

  get clientArea(): OxyRect {
    return newOxyRect(0, 0, this._view.clientWidth, this._view.clientHeight)
  }

  hideTracker(): void {
    this._tooltip.style.visibility = 'hidden'
  }

  showTracker(trackerHitResult: TrackerHitResult): void {
    if (!trackerHitResult?.position) {
      return
    }
    const trackerStr = trackerHitResult.toString() || ''
    if (trackerStr.trim().length === 0) return

    const topOffset = this._view.offsetTop
    const leftOffset = this._view.offsetLeft
    this._tooltip.innerText = trackerStr
    this._tooltip.style.top = `${topOffset + trackerHitResult.position.y}px`
    this._tooltip.style.left = `${leftOffset + trackerHitResult.position.x}px`
    this._tooltip.style.visibility = 'visible'
  }

  setCursorType(cursorType: CursorType): void {
    this._view.style.cursor = convertCursorType(cursorType)
  }

  async renderOverride(model: PlotModel): Promise<void> {
    const view = this._view
    this._view.innerHTML = ''
    const renderContext = new SvgRenderContext(
      view.clientWidth,
      view.clientHeight,
      true,
      this.textMeasurer,
      model.background,
    )

    if (!OxyColorHelper.isUndefined(model.background)) {
      this._view.style.backgroundColor = model.background.toString()
    }

    await model.render(renderContext, newOxyRect(0, 0, view.clientWidth, view.clientHeight))
    if (this._zoomRectangle && OxyRectHelper.equals(this._zoomRectangle, OxyRect_Empty)) {
      const fill = OxyColorHelper.parse('#40FFFF00')
      const stroke = OxyColors.Black
      await renderContext.drawRectangle(this._zoomRectangle, fill, stroke, 1, EdgeRenderingMode.Automatic)
    }

    renderContext.complete()
    this._view.innerHTML = renderContext.getXml()
  }
}
