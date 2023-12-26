import type {
  IPlotView,
  IViewCommand,
  IViewCommandG,
  ManipulatorBase,
  OxyInputEventArgs,
  OxyInputGesture,
  OxyKeyEventArgs,
  OxyKeyGesture,
  OxyMouseDownEventArgs,
  OxyMouseEnterGesture,
  OxyMouseEventArgs,
  OxyMouseWheelEventArgs,
  OxyTouchEventArgs,
} from '@/oxyplot'
import { OxyMouseDownGesture, OxyMouseWheelGesture, OxyTouchGesture } from '@/oxyplot'

/**
 * Specifies functionality to interact with a graphics view.
 */
export interface IPlotController {
  /**
   * Handles mouse down events.
   */
  handleMouseDown(view: IPlotView, args: OxyMouseDownEventArgs): boolean

  /**
   * Handles mouse move events.
   */
  handleMouseMove(view: IPlotView, args: OxyMouseEventArgs): boolean

  /**
   * Handles mouse up events.
   */
  handleMouseUp(view: IPlotView, args: OxyMouseEventArgs): boolean

  /**
   * Handles mouse enter events.
   */
  handleMouseEnter(view: IPlotView, args: OxyMouseEventArgs): boolean

  /**
   * Handles mouse leave events.
   */
  handleMouseLeave(view: IPlotView, args: OxyMouseEventArgs): boolean

  /**
   * Handles mouse wheel events.
   */
  handleMouseWheel(view: IPlotView, args: OxyMouseWheelEventArgs): boolean

  /**
   * Handles touch started events.
   */
  handleTouchStarted(view: IPlotView, args: OxyTouchEventArgs): boolean

  /**
   * Handles touch delta events.
   */
  handleTouchDelta(view: IPlotView, args: OxyTouchEventArgs): boolean

  /**
   * Handles touch completed events.
   */
  handleTouchCompleted(view: IPlotView, args: OxyTouchEventArgs): boolean

  /**
   * Handles key down events.
   */
  handleKeyDown(view: IPlotView, args: OxyKeyEventArgs): boolean

  /**
   * Handles the specified gesture.
   */
  handleGesture(view: IPlotView, gesture: OxyInputGesture, args: OxyInputEventArgs): boolean

  /**
   * Adds the specified mouse manipulator and invokes the `MouseManipulator.Started` method with the specified mouse event arguments.
   */
  addMouseManipulator(
    view: IPlotView,
    manipulator: ManipulatorBase<OxyMouseEventArgs>,
    args: OxyMouseDownEventArgs,
  ): void

  /**
   * Adds the specified mouse hover manipulator and invokes the `MouseManipulator.Started` method with the specified mouse event arguments.
   */
  addHoverManipulator(view: IPlotView, manipulator: ManipulatorBase<OxyMouseEventArgs>, args: OxyMouseEventArgs): void

  /**
   * Adds the specified touch manipulator and invokes the `MouseManipulator.Started` method with the specified mouse event arguments.
   */
  addTouchManipulator(view: IPlotView, manipulator: ManipulatorBase<OxyTouchEventArgs>, args: OxyTouchEventArgs): void

  /**
   * Binds the specified command to the specified mouse down gesture. Removes old bindings to the gesture.
   */
  bindMouseDown(gesture: OxyMouseDownGesture, command: IViewCommandG<OxyMouseDownEventArgs>): void

  /**
   * Binds the specified command to the specified mouse enter gesture. Removes old bindings to the gesture.
   */
  bindMouseEnter(gesture: OxyMouseEnterGesture, command: IViewCommandG<OxyMouseEventArgs>): void

  /**
   * Binds the specified command to the specified mouse wheel gesture. Removes old bindings to the gesture.
   */
  bindMouseWheel(gesture: OxyMouseWheelGesture, command: IViewCommandG<OxyMouseWheelEventArgs>): void

  /**
   * Binds the specified command to the specified touch gesture. Removes old bindings to the gesture.
   */
  bindTouch(gesture: OxyTouchGesture, command: IViewCommandG<OxyTouchEventArgs>): void

  /**
   * Binds the specified command to the specified key gesture. Removes old bindings to the gesture.
   */
  bindKey(gesture: OxyKeyGesture, command: IViewCommandG<OxyKeyEventArgs>): void

  /**
   * Unbinds the specified gesture.
   */
  unbindInput(gesture: OxyInputGesture): void

  /**
   * Unbinds the specified command from all gestures.
   */
  unbindViewCommand(command: IViewCommand): void

  /**
   * Unbinds all commands.
   */
  unbindAll(): void
}
