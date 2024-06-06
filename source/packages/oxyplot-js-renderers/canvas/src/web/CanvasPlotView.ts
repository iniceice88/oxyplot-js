import {
  CursorType,
  EdgeRenderingMode,
  type IRenderContext,
  newOxyRect,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRect_Empty,
  OxyRectHelper,
  PlotModel,
  TrackerHitResult,
} from 'oxyplot-js'
import { addPlotViewEvents, convertCursorType } from './web-events'
import { OxyStyleToCanvasStyleConverter } from './canvasTextMeasurer'
import { CanvasRenderContext } from './CanvasRenderContext'
import { WebPlotViewBase } from './WebPlotViewBase'

export class CanvasPlotView extends WebPlotViewBase {
  private readonly _view: HTMLCanvasElement
  private readonly _tooltip: HTMLDivElement
  private readonly _renderContext: IRenderContext
  private _drawCtx: CanvasRenderingContext2D
  private readonly _styleConverter: OxyStyleToCanvasStyleConverter = new OxyStyleToCanvasStyleConverter()

  constructor(view: HTMLCanvasElement) {
    super()
    this._view = view
    this.setupCanvas(view)
    this._drawCtx = this._view.getContext('2d') as CanvasRenderingContext2D
    if (!this._drawCtx) throw new Error('Could not get 2d context')
    this._tooltip = document.createElement('div')
    this._tooltip.style.position = 'absolute'
    this._tooltip.style.zIndex = '100'
    this._tooltip.style.backgroundColor = '#FFFFA0E0'
    this._tooltip.style.border = '1px solid black'
    this._tooltip.style.padding = '8px'
    this._tooltip.style.visibility = 'hidden'
    this._tooltip.style.pointerEvents = 'none'
    this._tooltip.style.transition = 'transform 0.2s ease, top 0.2s ease, left 0.2s ease'
    document.body.appendChild(this._tooltip)
    this._renderContext = new CanvasRenderContext(this._view)

    addPlotViewEvents(this._view, this)

    new ResizeObserver(() => {
      this.setupCanvas(view)
    }).observe(view)
  }

  private setupCanvas(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    // ensure the canvas is aligned with the pixel grid
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
  }

  get tooltip(): HTMLElement {
    return this._tooltip
  }

  get clientArea(): OxyRect {
    return newOxyRect(0, 0, this._view.width, this._view.height)
  }

  hideTracker(): void {
    this._tooltip.style.visibility = 'hidden'
    this._tooltip.style.top = 'unset'
    this._tooltip.style.left = 'unset'
  }

  showTracker(trackerHitResult: TrackerHitResult): void {
    if (!trackerHitResult?.position) {
      return
    }
    const trackerStr = trackerHitResult.toString() || ''
    if (trackerStr.trim().length === 0) return

    const { top, left } = this._view.getBoundingClientRect()
    this._tooltip.innerText = trackerStr
    this._tooltip.style.top = `${top + trackerHitResult.position.y}px`
    this._tooltip.style.left = `${left + trackerHitResult.position.x}px`
    this._tooltip.style.visibility = 'visible'
  }

  setCursorType(cursorType: CursorType): void {
    this._view.style.cursor = convertCursorType(cursorType)
  }

  async renderOverride(model: PlotModel): Promise<void> {
    this._drawCtx = this._view.getContext('2d') as CanvasRenderingContext2D
    const dpr = window.devicePixelRatio || 1
    this._drawCtx.scale(dpr, dpr)

    const view = this._view
    this._drawCtx.reset()

    if (!OxyColorHelper.isUndefined(model.background)) {
      this._drawCtx.fillStyle = this._styleConverter.convertStrokeOrFillStyle(model.background)
      this._drawCtx.fillRect(0, 0, view.width, view.height)
    }

    await model.render(this._renderContext, newOxyRect(0, 0, view.width, view.height))
    if (this._zoomRectangle && OxyRectHelper.equals(this._zoomRectangle, OxyRect_Empty)) {
      const fill = OxyColorHelper.parse('#40FFFF00')
      const stroke = OxyColors.Black
      await this._renderContext.drawRectangle(this._zoomRectangle, fill, stroke, 1, EdgeRenderingMode.Automatic)
    }
  }
}
