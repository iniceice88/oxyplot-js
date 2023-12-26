import {
  InputCommandBinding,
  type IPlotController,
  type IPlotView,
  type IViewCommand,
  type IViewCommandG,
  ManipulatorBase,
  type OxyInputEventArgs,
  type OxyInputGesture,
  type OxyKeyEventArgs,
  OxyKeyGesture,
  type OxyMouseDownEventArgs,
  OxyMouseDownGesture,
  OxyMouseEnterGesture,
  type OxyMouseEventArgs,
  type OxyMouseWheelEventArgs,
  OxyMouseWheelGesture,
  type OxyTouchEventArgs,
  OxyTouchGesture,
} from '@/oxyplot'
import { arrayRemoveFirst, arrayRemoveIf } from '@/patch'

/**
 * Provides functionality to handle input events.
 */
export abstract class ControllerBase implements IPlotController {
  /**
   * The input bindings.
   * This collection is used to specify the customized input gestures (both key, mouse and touch).
   */
  public readonly inputCommandBindings: InputCommandBinding[] = []

  /**
   * The manipulators that are created by mouse down events. These manipulators are removed when the mouse button is released.
   */
  protected readonly mouseDownManipulators: ManipulatorBase<OxyMouseEventArgs>[] = []

  /**
   * The manipulators that are created by mouse enter events. These manipulators are removed when the mouse leaves the control.
   */
  protected readonly mouseHoverManipulators: ManipulatorBase<OxyMouseEventArgs>[] = []

  /**
   * The manipulators that are created by touch events. These manipulators are removed when the touch gesture is completed.
   */
  protected readonly touchManipulators: ManipulatorBase<OxyTouchEventArgs>[] = []

  /**
   * Initializes a new instance of the ControllerBase class.
   */
  protected constructor() {}

  /**
   * Handles the specified gesture.
   * @param view The plot view.
   * @param gesture The gesture.
   * @param args The OxyInputEventArgs instance containing the event data.
   * @returns true if the event was handled.
   */
  public handleGesture(view: IPlotView, gesture: OxyInputGesture, args: OxyInputEventArgs): boolean {
    const command = this.getCommand(gesture)
    return this.handleCommand(command, view, args)
  }

  /**
   * Handles mouse down events.
   * @param view The plot view.
   * @param args The OxyMouseDownEventArgs instance containing the event data.
   * @returns true if the event was handled.
   */
  public handleMouseDown(view: IPlotView, args: OxyMouseDownEventArgs): boolean {
    if (view.actualModel) {
      view.actualModel.handleMouseDown(this, args)
      if (args.handled) {
        return true
      }
    }
    const command = this.getCommand(new OxyMouseDownGesture(args.changedButton, args.modifierKeys, args.clickCount))
    return this.handleCommand(command, view, args)
  }

  /**
   * Handles mouse enter events.
   * @param view The plot view.
   * @param args The OxyMouseEventArgs instance containing the event data.
   * @returns true if the event was handled.
   */
  public handleMouseEnter(view: IPlotView, args: OxyMouseEventArgs): boolean {
    if (view.actualModel) {
      view.actualModel.handleMouseEnter(this, args)
      if (args.handled) {
        return true
      }
    }

    const command = this.getCommand(new OxyMouseEnterGesture(args.modifierKeys))
    return this.handleCommand(command, view, args)
  }

  /**
   * Handles mouse leave events.
   * @param view The plot view.
   * @param args The OxyMouseEventArgs instance containing the event data.
   * @returns true if the event was handled.
   */
  public handleMouseLeave(view: IPlotView, args: OxyMouseEventArgs): boolean {
    if (view.actualModel) {
      view.actualModel.handleMouseLeave(this, args)
      if (args.handled) {
        return true
      }
    }

    for (const m of [...this.mouseHoverManipulators]) {
      m.completed(args)
      arrayRemoveFirst(this.mouseHoverManipulators, m)
    }

    return args.handled
  }

  /**
   * Handles mouse move events.
   * @param view The plot view.
   * @param args The OxyMouseEventArgs instance containing the event data.
   * @returns true if the event was handled.
   */
  public handleMouseMove(view: IPlotView, args: OxyMouseEventArgs): boolean {
    if (view.actualModel) {
      view.actualModel.handleMouseMove(this, args)
      if (args.handled) {
        return true
      }
    }

    for (const m of this.mouseDownManipulators) {
      m.delta(args)
    }

    for (const m of this.mouseHoverManipulators) {
      m.delta(args)
    }

    return args.handled
  }

  /**
   * Handles mouse up events.
   * @param view The plot view.
   * @param args The OxyMouseEventArgs instance containing the event data.
   * @returns true if the event was handled.
   */
  public handleMouseUp(view: IPlotView, args: OxyMouseEventArgs): boolean {
    if (view.actualModel) {
      view.actualModel.handleMouseUp(this, args)
      if (args.handled) {
        return true
      }
    }

    for (const m of [...this.mouseDownManipulators]) {
      m.completed(args)
      arrayRemoveFirst(this.mouseDownManipulators, m)
    }

    return args.handled
  }

  /**
   * Handles mouse wheel events.
   * @param view The plot view.
   * @param args The OxyMouseWheelEventArgs instance containing the event data.
   * @returns true if the event was handled.
   */
  public handleMouseWheel(view: IPlotView, args: OxyMouseWheelEventArgs): boolean {
    const command = this.getCommand(new OxyMouseWheelGesture(args.modifierKeys))
    return this.handleCommand(command, view, args)
  }

  /**
   * Handles touch started events.
   * @param view The plot view.
   * @param args The OxyTouchEventArgs instance containing the event data.
   * @returns true if the event was handled.
   */
  public handleTouchStarted(view: IPlotView, args: OxyTouchEventArgs): boolean {
    if (view.actualModel) {
      view.actualModel.handleTouchStarted(this, args)
      if (args.handled) {
        return true
      }
    }

    const command = this.getCommand(new OxyTouchGesture())
    return this.handleCommand(command, view, args)
  }

  /**
   * Handles touch delta events.
   * @param view The plot view.
   * @param args The OxyTouchEventArgs instance containing the event data.
   * @returns true if the event was handled.
   */
  public handleTouchDelta(view: IPlotView, args: OxyTouchEventArgs): boolean {
    if (view.actualModel) {
      view.actualModel.handleTouchDelta(this, args)
      if (args.handled) {
        return true
      }
    }

    for (const m of this.touchManipulators) {
      m.delta(args)
    }

    return args.handled
  }

  /**
   * Handles touch completed events.
   * @param view The plot view.
   * @param args The OxyTouchEventArgs instance containing the event data.
   * @returns true if the event was handled.
   */
  public handleTouchCompleted(view: IPlotView, args: OxyTouchEventArgs): boolean {
    if (view.actualModel) {
      view.actualModel.handleTouchCompleted(this, args)
      if (args.handled) {
        return true
      }
    }

    for (const m of [...this.touchManipulators]) {
      m.completed(args)
      arrayRemoveFirst(this.touchManipulators, m)
    }

    return args.handled
  }

  /**
   * Handles key down events.
   * @param view The plot view.
   * @param args The OxyKeyEventArgs instance containing the event data.
   * @returns true if the event was handled.
   */
  public handleKeyDown(view: IPlotView, args: OxyKeyEventArgs): boolean {
    if (!view.actualModel) {
      return false
    }

    view.actualModel.handleKeyDown(this, args)
    if (args.handled) {
      return true
    }

    const command = this.getCommand(new OxyKeyGesture(args.key, args.modifierKeys))
    return this.handleCommand(command, view, args)
  }

  /**
   * Adds the specified mouse manipulator and invokes the MouseManipulator.started method with the specified mouse down event arguments.
   * @param view The plot view.
   * @param manipulator The manipulator to add.
   * @param args The OxyMouseDownEventArgs instance containing the event data.
   */
  public addMouseManipulator(
    view: IPlotView,
    manipulator: ManipulatorBase<OxyMouseEventArgs>,
    args: OxyMouseDownEventArgs,
  ): void {
    this.mouseDownManipulators.push(manipulator)
    manipulator.started(args)
  }

  /**
   * Adds the specified mouse hover manipulator and invokes the MouseManipulator.started method with the specified mouse event arguments.
   * @param view The plot view.
   * @param manipulator The manipulator.
   * @param args The OxyMouseEventArgs instance containing the event data.
   */
  public addHoverManipulator(
    view: IPlotView,
    manipulator: ManipulatorBase<OxyMouseEventArgs>,
    args: OxyMouseEventArgs,
  ): void {
    this.mouseHoverManipulators.push(manipulator)
    manipulator.started(args)
  }

  /**
   * Adds the specified mouse hover manipulator and invokes the TouchManipulator.started method with the specified mouse event arguments.
   * @param view The plot view.
   * @param manipulator The manipulator.
   * @param args The OxyTouchEventArgs instance containing the event data.
   */
  public addTouchManipulator(
    view: IPlotView,
    manipulator: ManipulatorBase<OxyTouchEventArgs>,
    args: OxyTouchEventArgs,
  ): void {
    this.touchManipulators.push(manipulator)
    manipulator.started(args)
  }

  /**
   * Binds the specified command to the specified mouse gesture. Removes old bindings to the gesture.
   * @param gesture The gesture.
   * @param command The command. If undefined, the binding will be removed.
   */
  public bindMouseDown(gesture: OxyMouseDownGesture, command: IViewCommandG<OxyMouseDownEventArgs>): void {
    this.bindCore(gesture, command)
  }

  /**
   * Binds the specified command to the specified mouse enter gesture. Removes old bindings to the gesture.
   * @param gesture The gesture.
   * @param command The command. If undefined, the binding will be removed.
   */
  public bindMouseEnter(gesture: OxyMouseEnterGesture, command: IViewCommandG<OxyMouseEventArgs> | undefined): void {
    this.bindCore(gesture, command)
  }

  /**
   * Binds the specified command to the specified mouse wheel gesture. Removes old bindings to the gesture.
   * @param gesture The gesture.
   * @param command The command. If undefined, the binding will be removed.
   */
  public bindMouseWheel(
    gesture: OxyMouseWheelGesture,
    command: IViewCommandG<OxyMouseWheelEventArgs> | undefined,
  ): void {
    this.bindCore(gesture, command)
  }

  /**
   * Binds the specified command to the specified touch gesture. Removes old bindings to the gesture.
   * @param gesture The gesture.
   * @param command The command. If undefined, the binding will be removed.
   */
  public bindTouch(gesture: OxyTouchGesture, command: IViewCommandG<OxyTouchEventArgs> | undefined): void {
    this.bindCore(gesture, command)
  }

  /**
   * Binds the specified command to the specified key gesture. Removes old bindings to the gesture.
   * @param gesture The gesture.
   * @param command The command. If undefined, the binding will be removed.
   */
  public bindKey(gesture: OxyKeyGesture, command: IViewCommandG<OxyKeyEventArgs> | undefined): void {
    this.bindCore(gesture, command)
  }

  /**
   * Unbinds the specified gesture.
   * @param gesture The gesture to unbind.
   */
  public unbindInput(gesture: OxyInputGesture): void {
    arrayRemoveIf(this.inputCommandBindings, (icb) => icb.getGesture().equals(gesture))
  }

  /**
   * Unbinds the specified command from all gestures.
   * @param command The command to unbind.
   */
  public unbindViewCommand(command: IViewCommand): void {
    arrayRemoveIf(this.inputCommandBindings, (m) => m.getCommand() === command)
  }

  /**
   * Unbinds all commands.
   */
  public unbindAll(): void {
    this.inputCommandBindings.length = 0
  }

  /**
   * Binds the specified command to the specified gesture. Removes old bindings to the gesture.
   * @param gesture The gesture.
   * @param command The command. If undefined, the binding will be removed.
   * This method was created to avoid calling a virtual method in the constructor.
   */
  protected bindCore(gesture: OxyInputGesture, command: IViewCommand | undefined): void {
    const current = this.inputCommandBindings.find((icb) => icb.getGesture().equals(gesture))
    if (current) {
      arrayRemoveFirst(this.inputCommandBindings, current)
    }

    if (command) {
      this.inputCommandBindings.push(new InputCommandBinding(gesture, command))
    }
  }

  /**
   * Gets the command for the specified OxyInputGesture.
   * @param gesture The input gesture.
   * @returns A command.
   */
  protected getCommand(gesture: OxyInputGesture): IViewCommand | undefined {
    const binding = this.inputCommandBindings.find((b) => b.getGesture().equals(gesture))
    return binding ? binding.getCommand() : undefined
  }

  /**
   * Handles a command triggered by an input gesture.
   * @param command The command.
   * @param view The plot view.
   * @param args The OxyInputEventArgs instance containing the event data.
   * @returns true if the command was handled.
   */
  protected handleCommand(command: IViewCommand | undefined, view: IPlotView, args: OxyInputEventArgs): boolean {
    if (!command) {
      return false
    }

    command.execute(view, this, args)
    return args.handled
  }
}
