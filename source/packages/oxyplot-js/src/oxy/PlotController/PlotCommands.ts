import {
  DelegatePlotCommand,
  type IPlotView,
  type IViewCommandG,
  type OxyInputEventArgs,
  type OxyKeyEventArgs,
  OxyModifierKeysExtensions,
  type OxyMouseDownEventArgs,
  type OxyMouseEventArgs,
  type OxyMouseWheelEventArgs,
  type OxyTouchEventArgs,
  PanManipulator,
  TouchManipulator,
  TouchTrackerManipulator,
  TrackerManipulator,
  ZoomRectangleManipulator,
  ZoomStepManipulator,
} from '@/oxyplot'

/**
 * Defines common commands for the plots.
 */
export class PlotCommands {
  private static init() {
    // commands that can be triggered from key events
    this.reset = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) => this.handleReset(view, args))
    this.copyCode = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handleCopyCode(view, args),
    )

    // commands that can be triggered from mouse down events
    this.resetAt = new DelegatePlotCommand<OxyMouseEventArgs>((view, controller, args) => this.handleReset(view, args))
    this.panAt = new DelegatePlotCommand<OxyMouseDownEventArgs>((view, controller, args) =>
      controller.addMouseManipulator(view, new PanManipulator(view), args),
    )
    this.zoomRectangle = new DelegatePlotCommand<OxyMouseDownEventArgs>((view, controller, args) =>
      controller.addMouseManipulator(view, new ZoomRectangleManipulator(view), args),
    )
    this.track = new DelegatePlotCommand<OxyMouseDownEventArgs>((view, controller, args) =>
      controller.addMouseManipulator(
        view,
        new TrackerManipulator(view, {
          snap: false,
          pointsOnly: false,
        }),
        args,
      ),
    )
    this.snapTrack = new DelegatePlotCommand<OxyMouseDownEventArgs>((view, controller, args) =>
      controller.addMouseManipulator(
        view,
        new TrackerManipulator(view, {
          snap: true,
          pointsOnly: false,
        }),
        args,
      ),
    )
    this.pointsOnlyTrack = new DelegatePlotCommand<OxyMouseDownEventArgs>((view, controller, args) =>
      controller.addMouseManipulator(
        view,
        new TrackerManipulator(view, {
          snap: false,
          pointsOnly: true,
        }),
        args,
      ),
    )
    this.zoomWheel = new DelegatePlotCommand<OxyMouseWheelEventArgs>((view, controller, args) =>
      this.handleZoomByWheel(view, args),
    )
    this.zoomWheelFine = new DelegatePlotCommand<OxyMouseWheelEventArgs>((view, controller, args) =>
      this.handleZoomByWheel(view, args, 0.1),
    )
    this.zoomInAt = new DelegatePlotCommand<OxyMouseEventArgs>((view, controller, args) =>
      this.handleZoomAt(view, args, 0.05),
    )
    this.zoomOutAt = new DelegatePlotCommand<OxyMouseEventArgs>((view, controller, args) =>
      this.handleZoomAt(view, args, -0.05),
    )

    // commands that can be triggered from mouse enter events
    this.hoverTrack = new DelegatePlotCommand<OxyMouseEventArgs>((view, controller, args) =>
      controller.addHoverManipulator(
        view,
        new TrackerManipulator(view, {
          lockToInitialSeries: false,
          snap: false,
          pointsOnly: false,
        }),
        args,
      ),
    )
    this.hoverSnapTrack = new DelegatePlotCommand<OxyMouseEventArgs>((view, controller, args) =>
      controller.addHoverManipulator(
        view,
        new TrackerManipulator(view, {
          lockToInitialSeries: false,
          snap: true,
          pointsOnly: false,
        }),
        args,
      ),
    )
    this.hoverPointsOnlyTrack = new DelegatePlotCommand<OxyMouseEventArgs>((view, controller, args) =>
      controller.addHoverManipulator(
        view,
        new TrackerManipulator(view, {
          lockToInitialSeries: false,
          snap: false,
          pointsOnly: true,
        }),
        args,
      ),
    )

    // Touch events
    this.snapTrackTouch = new DelegatePlotCommand<OxyTouchEventArgs>((view, controller, args) =>
      controller.addTouchManipulator(
        view,
        new TouchTrackerManipulator(view, {
          snap: true,
          pointsOnly: false,
        }),
        args,
      ),
    )
    this.pointsOnlyTrackTouch = new DelegatePlotCommand<OxyTouchEventArgs>((view, controller, args) =>
      controller.addTouchManipulator(
        view,
        new TouchTrackerManipulator(view, {
          snap: true,
          pointsOnly: true,
        }),
        args,
      ),
    )
    this.panZoomByTouch = new DelegatePlotCommand<OxyTouchEventArgs>((view, controller, args) =>
      controller.addTouchManipulator(view, new TouchManipulator(view), args),
    )

    // commands that can be triggered from key events
    this.panLeft = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handlePan(view, args, -0.1, 0),
    )
    this.panRight = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handlePan(view, args, 0.1, 0),
    )
    this.panUp = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handlePan(view, args, 0, -0.1),
    )
    this.panDown = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handlePan(view, args, 0, 0.1),
    )
    this.panLeftFine = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handlePan(view, args, -0.01, 0),
    )
    this.panRightFine = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handlePan(view, args, 0.01, 0),
    )
    this.panUpFine = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handlePan(view, args, 0, -0.01),
    )
    this.panDownFine = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handlePan(view, args, 0, 0.01),
    )

    this.zoomIn = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handleZoomCenter(view, args, 1),
    )
    this.zoomOut = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handleZoomCenter(view, args, -1),
    )
    this.zoomInFine = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handleZoomCenter(view, args, 0.1),
    )
    this.zoomOutFine = new DelegatePlotCommand<OxyKeyEventArgs>((view, controller, args) =>
      this.handleZoomCenter(view, args, -0.1),
    )
  }

  /**
   * Gets the reset axes command.
   */
  public static reset: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the reset axes command (for mouse events).
   */
  public static resetAt: IViewCommandG<OxyMouseEventArgs>

  /**
   * Gets the copy code command.
   */
  public static copyCode: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the pan/zoom touch command.
   */
  public static panZoomByTouch: IViewCommandG<OxyTouchEventArgs>

  /**
   * Gets the pan command.
   */
  public static panAt: IViewCommandG<OxyMouseDownEventArgs>

  /**
   * Gets the zoom rectangle command.
   */
  public static zoomRectangle: IViewCommandG<OxyMouseDownEventArgs>

  /**
   * Gets the zoom by mouse wheel command.
   */
  public static zoomWheel: IViewCommandG<OxyMouseWheelEventArgs>

  /**
   * Gets the fine-control zoom by mouse wheel command.
   */
  public static zoomWheelFine: IViewCommandG<OxyMouseWheelEventArgs>

  /**
   * Gets the tracker command.
   */
  public static track: IViewCommandG<OxyMouseDownEventArgs>

  /**
   * Gets the snap tracker command.
   */
  public static snapTrack: IViewCommandG<OxyMouseDownEventArgs>

  /**
   * Gets the snap tracker command.
   */
  public static snapTrackTouch: IViewCommandG<OxyTouchEventArgs>

  /**
   * Gets the points only tracker command.
   */
  public static pointsOnlyTrack: IViewCommandG<OxyMouseDownEventArgs>

  /**
   * Gets the points only tracker command.
   */
  public static pointsOnlyTrackTouch: IViewCommandG<OxyTouchEventArgs>

  /**
   * Gets the mouse hover tracker.
   */
  public static hoverTrack: IViewCommandG<OxyMouseEventArgs>

  /**
   * Gets the mouse hover snap tracker.
   */
  public static hoverSnapTrack: IViewCommandG<OxyMouseEventArgs>

  /**
   * Gets the mouse hover points only tracker.
   */
  public static hoverPointsOnlyTrack: IViewCommandG<OxyMouseEventArgs>

  /**
   * Gets the pan left command.
   */
  public static panLeft: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the pan right command.
   */
  public static panRight: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the pan up command.
   */
  public static panUp: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the pan down command.
   */
  public static panDown: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the fine control pan left command.
   */
  public static panLeftFine: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the fine control pan right command.
   */
  public static panRightFine: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the fine control pan up command.
   */
  public static panUpFine: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the fine control pan down command.
   */
  public static panDownFine: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the zoom in command.
   */
  public static zoomInAt: IViewCommandG<OxyMouseEventArgs>

  /**
   * Gets the zoom out command.
   */
  public static zoomOutAt: IViewCommandG<OxyMouseEventArgs>

  /**
   * Gets the zoom in command.
   */
  public static zoomIn: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the zoom out command.
   */
  public static zoomOut: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the fine control zoom in command.
   */
  public static zoomInFine: IViewCommandG<OxyKeyEventArgs>

  /**
   * Gets the fine control zoom out command.
   */
  public static zoomOutFine: IViewCommandG<OxyKeyEventArgs>

  /**
   * Handles the reset event.
   * @param view The view to reset.
   * @param args The OxyInputEventArgs instance containing the event data.
   */
  private static handleReset(view: IPlotView, args: OxyInputEventArgs): void {
    if (!view.actualModel) return

    args.handled = true
    view.actualModel.resetAllAxes()
    view.invalidatePlot(false)
  }

  /**
   * Handles the copy code event.
   * @param view The view.
   * @param args The OxyInputEventArgs instance containing the event data.
   */
  private static handleCopyCode(view: IPlotView, args: OxyInputEventArgs): void {
    if (!view.actualModel) return

    args.handled = true
    const code = view.actualModel.toCode()
    view.setClipboardText(code)
  }

  /**
   * Zooms the view by the specified factor at the position specified in the OxyMouseEventArgs.
   * @param view The view.
   * @param args The OxyMouseWheelEventArgs instance containing the event data.
   * @param delta The zoom factor.
   */
  private static handleZoomAt(view: IPlotView, args: OxyMouseEventArgs, delta: number): void {
    const isControlDown = OxyModifierKeysExtensions.isControlDown(args)
    const m = new ZoomStepManipulator(view, delta, isControlDown)
    m.started(args)
  }

  /**
   * Zooms the view by the mouse wheel delta in the specified OxyKeyEventArgs.
   * @param view The view.
   * @param args The OxyMouseWheelEventArgs instance containing the event data.
   * @param factor The zoom speed factor. Default value is 1.
   */
  private static handleZoomByWheel(view: IPlotView, args: OxyMouseWheelEventArgs, factor = 1): void {
    const isControlDown = OxyModifierKeysExtensions.isControlDown(args)
    const m = new ZoomStepManipulator(view, args.delta * 0.001 * factor, isControlDown)
    m.started(args)
  }

  /**
   * Zooms the view by the key in the specified factor.
   * @param view The view.
   * @param args The OxyInputEventArgs instance containing the event data.
   * @param delta The zoom factor (positive zoom in, negative zoom out).
   */
  private static handleZoomCenter(view: IPlotView, args: OxyInputEventArgs, delta: number): void {
    if (!view.actualModel) return

    args.handled = true
    view.actualModel.zoomAllAxes(1 + delta * 0.12)
    view.invalidatePlot(false)
  }

  /**
   * Pans the view by the key in the specified vector.
   * @param view The view.
   * @param args The OxyInputEventArgs instance containing the event data.
   * @param dx The horizontal delta (percentage of plot area width).
   * @param dy The vertical delta (percentage of plot area height).
   */
  private static handlePan(view: IPlotView, args: OxyInputEventArgs, dx: number, dy: number): void {
    if (!view.actualModel) return

    args.handled = true
    dx *= view.actualModel.plotArea.width
    dy *= view.actualModel.plotArea.height
    view.actualModel.panAllAxes(dx, dy)
    view.invalidatePlot(false)
  }
}

;(PlotCommands as any).init()
