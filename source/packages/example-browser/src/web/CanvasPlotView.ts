import {
  CursorType,
  EdgeRenderingMode,
  IRenderContext,
  OxyColor,
  OxyColors,
  OxyRect,
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
    document.body.appendChild(this._tooltip)
    this._renderContext = new CanvasRenderContext(this._view)

    addPlotViewEvents(this._view, this)
  }

  get tooltip(): HTMLElement {
    return this._tooltip
  }

  get clientArea(): OxyRect {
    return new OxyRect(0, 0, this._view.width, this._view.height)
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
    this._drawCtx = this._view.getContext('2d') as CanvasRenderingContext2D
    const view = this._view
    this._drawCtx.reset()
    if (!model.background.isUndefined()) {
      this._drawCtx.fillStyle = this._styleConverter.convertStrokeOrFillStyle(model.background)
      this._drawCtx.fillRect(0, 0, view.width, view.height)
    }

    await model.render(this._renderContext, new OxyRect(0, 0, view.width, view.height))
    if (this._zoomRectangle && this._zoomRectangle.equals(OxyRect.Empty)) {
      const fill = OxyColor.parse('#40FFFF00')
      const stroke = OxyColors.Black
      await this._renderContext.drawRectangle(this._zoomRectangle, fill, stroke, 1, EdgeRenderingMode.Automatic)
    }
  }
}
