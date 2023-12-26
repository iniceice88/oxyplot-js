import type { IPlotController, IPlotModel, IPlotView, IRenderContext } from 'oxyplot-js'
import {
  CursorType,
  EdgeRenderingMode,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotController,
  PlotModel,
  TrackerHitResult,
} from 'oxyplot-js'
import { toOxyMouseDownEventArgs, toOxyMouseEventArgs, toOxyMouseWheelEventArgs } from './web-events'
import { OxyStyleToCanvasStyleConverter } from './canvasTextMeasurer'
import { CanvasRenderContext } from './CanvasRenderContext'

export class WebPlotView implements IPlotView {
  private readonly _view: HTMLCanvasElement
  private readonly _tooltip: HTMLDivElement
  private readonly _renderContext: IRenderContext
  private readonly _drawCtx: CanvasRenderingContext2D
  private readonly _styleConverter: OxyStyleToCanvasStyleConverter = new OxyStyleToCanvasStyleConverter()

  constructor(view: HTMLCanvasElement) {
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
    this.addViewEvents()
  }

  get tooltip(): HTMLElement {
    return this._tooltip
  }

  private addViewEvents() {
    const view = this._view
    view.addEventListener('contextmenu', function (event) {
      event.preventDefault()
    })

    view.addEventListener('resize', async () => {
      await this.render(false)
    })
    view.onmousedown = (e) => {
      this.actualController.handleMouseDown(this, toOxyMouseDownEventArgs(e))
    }
    view.onmousemove = (e) => {
      this.actualController.handleMouseMove(this, toOxyMouseEventArgs(e))
    }
    view.onmouseup = (e) => {
      this.actualController.handleMouseUp(this, toOxyMouseEventArgs(e))
    }
    view.onmouseenter = (e) => {
      this.actualController.handleMouseEnter(this, toOxyMouseEventArgs(e))
    }
    view.onmouseleave = (e) => {
      this.actualController.handleMouseLeave(this, toOxyMouseEventArgs(e))
    }
    view.onwheel = (e) => {
      this.actualController.handleMouseWheel(this, toOxyMouseWheelEventArgs(e))
    }
  }

  get clientArea(): OxyRect {
    return new OxyRect(0, 0, this._view.width, this._view.height)
  }

  private _zoomRectangle?: OxyRect = undefined

  private _model?: PlotModel

  get model(): PlotModel | undefined {
    return this._model
  }

  set model(model: PlotModel | undefined) {
    const oldModel = this._model
    this._model = model
    this.onModelChanged(oldModel, model)
  }

  get actualModel(): PlotModel | undefined {
    return this._model
  }

  controller?: IPlotController
  private defaultController?: IPlotController

  get actualController(): IPlotController {
    if (this.controller) return this.controller

    if (this.defaultController) {
      return this.defaultController
    }
    this.defaultController = new PlotController()
    return this.defaultController
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

  hideZoomRectangle(): void {
    this._zoomRectangle = undefined
  }

  showZoomRectangle(rectangle: OxyRect): void {
    this._zoomRectangle = rectangle
  }

  invalidatePlot(updateData?: boolean): void {
    this.render(updateData)
  }

  setClipboardText(text: string): void {
    try {
      navigator.clipboard.writeText(text)
    } catch (e) {
      console.error(e)
    }
  }

  setCursorType(cursorType: CursorType): void {
    switch (cursorType) {
      case CursorType.Default:
        this._view.style.cursor = 'default'
        break
      case CursorType.Pan:
        this._view.style.cursor = 'grab'
        break
      case CursorType.ZoomRectangle:
        this._view.style.cursor = 'move'
        break
      case CursorType.ZoomHorizontal:
        this._view.style.cursor = 'ew-resize'
        break
      case CursorType.ZoomVertical:
        this._view.style.cursor = 'ns-resize'
        break
      default:
        this._view.style.cursor = 'default'
        break
    }
  }

  private onModelChanged(oldModel?: PlotModel, newModel?: PlotModel) {
    if (oldModel) {
      ;(oldModel as IPlotModel).attachPlotView(undefined)
    }
    if (newModel) {
      ;(newModel as IPlotModel).attachPlotView(this)
    }
    this.invalidatePlot(true)
  }

  private async render(updateData?: boolean): Promise<void> {
    const model = this._model
    if (!model) {
      return
    }
    if (updateData) {
      await this.renderCore(updateData)
      return
    }

    this._throttleRender()
  }

  private _throttleRender: () => void = this.throttle(() => this.renderCore(false), 16)

  private async renderCore(updateData?: boolean) {
    const view = this._view
    const model = this._model
    this._drawCtx.reset()
    if (!model) {
      return
    }
    model.update(updateData || false)

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

  // https://stackoverflow.com/questions/27078285/simple-throttle-in-js
  private throttle(callback: () => void, limit: number) {
    let wait = false // Initially, we're not waiting
    return function () {
      // We return a throttled function
      if (!wait) {
        // If we're not waiting
        callback && callback() // Execute users function
        wait = true // Prevent future invocations
        setTimeout(function () {
          // After a period of time
          wait = false // And allow future invocations
        }, limit)
      }
    }
  }
}
