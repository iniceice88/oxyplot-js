import {
  ControllerBase,
  ControllerExtensions,
  type IPlotController,
  OxyKey,
  OxyModifierKeys,
  OxyMouseButton,
  OxyShakeGesture,
  PlotCommands,
} from '@/oxyplot'

/**
 * Provides an IPlotController with a default set of plot bindings.
 */
export class PlotController extends ControllerBase implements IPlotController {
  /**
   * Initializes a new instance of the PlotController class.
   */
  constructor() {
    super()

    // Zoom rectangle bindings: MMB / control RMB / control+alt LMB
    ControllerExtensions.bindMouseDown(this, OxyMouseButton.Middle, PlotCommands.zoomRectangle)
    ControllerExtensions.bindMouseDown(this, OxyMouseButton.Right, PlotCommands.zoomRectangle, OxyModifierKeys.Control)
    ControllerExtensions.bindMouseDown(
      this,
      OxyMouseButton.Left,
      PlotCommands.zoomRectangle,
      OxyModifierKeys.Control | OxyModifierKeys.Alt,
    )

    // Reset bindings: Same as zoom rectangle, but double click / A key
    ControllerExtensions.bindMouseDown(this, OxyMouseButton.Middle, PlotCommands.resetAt, OxyModifierKeys.None, 2)
    ControllerExtensions.bindMouseDown(this, OxyMouseButton.Right, PlotCommands.resetAt, OxyModifierKeys.Control, 2)
    ControllerExtensions.bindMouseDown(
      this,
      OxyMouseButton.Left,
      PlotCommands.resetAt,
      OxyModifierKeys.Control | OxyModifierKeys.Alt,
      2,
    )
    ControllerExtensions.bindKeyDown(this, OxyKey.A, PlotCommands.reset)
    ControllerExtensions.bindKeyDown(
      this,
      OxyKey.C,
      PlotCommands.copyCode,
      OxyModifierKeys.Control | OxyModifierKeys.Alt,
    )
    ControllerExtensions.bindKeyDown(this, OxyKey.Home, PlotCommands.reset)
    this.bindCore(new OxyShakeGesture(), PlotCommands.reset)

    // Pan bindings: RMB / alt LMB / Up/down/left/right keys (panning direction on axis is opposite of key as it is more intuitive)
    ControllerExtensions.bindMouseDown(this, OxyMouseButton.Right, PlotCommands.panAt)
    ControllerExtensions.bindMouseDown(this, OxyMouseButton.Left, PlotCommands.panAt, OxyModifierKeys.Alt)
    ControllerExtensions.bindKeyDown(this, OxyKey.Left, PlotCommands.panLeft)
    ControllerExtensions.bindKeyDown(this, OxyKey.Right, PlotCommands.panRight)
    ControllerExtensions.bindKeyDown(this, OxyKey.Up, PlotCommands.panUp)
    ControllerExtensions.bindKeyDown(this, OxyKey.Down, PlotCommands.panDown)
    ControllerExtensions.bindKeyDown(this, OxyKey.Left, PlotCommands.panLeftFine, OxyModifierKeys.Control)
    ControllerExtensions.bindKeyDown(this, OxyKey.Right, PlotCommands.panRightFine, OxyModifierKeys.Control)
    ControllerExtensions.bindKeyDown(this, OxyKey.Up, PlotCommands.panUpFine, OxyModifierKeys.Control)
    ControllerExtensions.bindKeyDown(this, OxyKey.Down, PlotCommands.panDownFine, OxyModifierKeys.Control)

    ControllerExtensions.bindTouchDown(this, PlotCommands.panZoomByTouch)

    // Tracker bindings: LMB
    ControllerExtensions.bindMouseDown(this, OxyMouseButton.Left, PlotCommands.snapTrack)
    ControllerExtensions.bindMouseDown(this, OxyMouseButton.Left, PlotCommands.track, OxyModifierKeys.Control)
    ControllerExtensions.bindMouseDown(this, OxyMouseButton.Left, PlotCommands.pointsOnlyTrack, OxyModifierKeys.Shift)

    // Tracker bindings: Touch
    ControllerExtensions.bindTouchDown(this, PlotCommands.snapTrackTouch)

    // Zoom in/out binding: XB1 / XB2 / mouse wheels / +/- keys
    ControllerExtensions.bindMouseDown(this, OxyMouseButton.XButton1, PlotCommands.zoomInAt)
    ControllerExtensions.bindMouseDown(this, OxyMouseButton.XButton2, PlotCommands.zoomOutAt)
    ControllerExtensions.bindMouseWheel(this, PlotCommands.zoomWheel)
    ControllerExtensions.bindMouseWheel(this, PlotCommands.zoomWheelFine, OxyModifierKeys.Control)
    ControllerExtensions.bindKeyDown(this, OxyKey.Add, PlotCommands.zoomIn)
    ControllerExtensions.bindKeyDown(this, OxyKey.Subtract, PlotCommands.zoomOut)
    ControllerExtensions.bindKeyDown(this, OxyKey.PageUp, PlotCommands.zoomIn)
    ControllerExtensions.bindKeyDown(this, OxyKey.PageDown, PlotCommands.zoomOut)
    ControllerExtensions.bindKeyDown(this, OxyKey.Add, PlotCommands.zoomInFine, OxyModifierKeys.Control)
    ControllerExtensions.bindKeyDown(this, OxyKey.Subtract, PlotCommands.zoomOutFine, OxyModifierKeys.Control)
    ControllerExtensions.bindKeyDown(this, OxyKey.PageUp, PlotCommands.zoomInFine, OxyModifierKeys.Control)
    ControllerExtensions.bindKeyDown(this, OxyKey.PageDown, PlotCommands.zoomOutFine, OxyModifierKeys.Control)
  }
}
