import {
  CursorType,
  IPlotController,
  type IPlotModel,
  IPlotView,
  OxyRect,
  PlotController,
  PlotModel,
  TrackerHitResult,
} from 'oxyplot-js'

export abstract class WebPlotViewBase implements IPlotView {
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

  get actualModel(): PlotModel | undefined {
    return this._model
  }

  abstract readonly clientArea: OxyRect

  protected _zoomRectangle?: OxyRect = undefined

  private _model?: PlotModel

  get model(): PlotModel | undefined {
    return this._model
  }

  set model(model: PlotModel | undefined) {
    const oldModel = this._model
    this._model = model
    this.onModelChanged(oldModel, model)
  }

  protected onModelChanged(oldModel?: PlotModel, newModel?: PlotModel) {
    if (oldModel) {
      ;(oldModel as IPlotModel).attachPlotView(undefined)
    }
    if (newModel) {
      ;(newModel as IPlotModel).attachPlotView(this)
    }
    this.invalidatePlot(true)
  }

  protected _isModelInvalidated: boolean = false
  protected _updateDataFlag: boolean = false

  invalidatePlot(updateData?: boolean): void {
    this._isModelInvalidated = true
    this._updateDataFlag = updateData || false
    this.render()
  }

  protected render() {
    const model = this._model
    if (!model) {
      return
    }
    if (this._isModelInvalidated) {
      model.update(this._updateDataFlag)
      this._isModelInvalidated = false
      this._updateDataFlag = false
    }

    window.requestAnimationFrame(async () => this.renderSync())
  }

  setClipboardText(text: string): void {
    try {
      void navigator.clipboard.writeText(text)
    } catch (e) {
      console.error(e)
    }
  }

  setCursorType(cursorType: CursorType): void {}

  hideTracker(): void {}

  showTracker(trackerHitResult: TrackerHitResult): void {}

  hideZoomRectangle(): void {
    this._zoomRectangle = undefined
  }

  showZoomRectangle(rectangle: OxyRect): void {
    this._zoomRectangle = rectangle
  }

  private _rendering = false

  private async renderSync(): Promise<void> {
    if (!this._model) return
    if (this._rendering) return
    this._rendering = true
    try {
      await this.renderOverride(this._model)
    } finally {
      this._rendering = false
    }
  }

  abstract renderOverride(model: PlotModel): Promise<void>
}
