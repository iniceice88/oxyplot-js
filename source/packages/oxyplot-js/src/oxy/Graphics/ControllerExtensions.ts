import type {
  IPlotController,
  IViewCommandG,
  OxyKeyEventArgs,
  OxyMouseDownEventArgs,
  OxyMouseEventArgs,
  OxyMouseWheelEventArgs,
  OxyTouchEventArgs,
} from '@/oxyplot'
import {
  OxyKey,
  OxyKeyGesture,
  OxyModifierKeys,
  OxyMouseButton,
  OxyMouseDownGesture,
  OxyMouseEnterGesture,
  OxyMouseWheelGesture,
  OxyTouchGesture,
} from '@/oxyplot'

/**
 * Provides extension methods for the IPlotController.
 */
export class ControllerExtensions {
  /**
   * Binds the specified key to the specified command.
   * @param controller The plot controller.
   * @param key The key.
   * @param command A plot controller command that takes key event arguments.
   * @param modifiers The key modifiers.
   */
  static bindKeyDown(
    controller: IPlotController,
    key: OxyKey,
    command: IViewCommandG<OxyKeyEventArgs>,
    modifiers: OxyModifierKeys = OxyModifierKeys.None,
  ): void {
    controller.bindKey(new OxyKeyGesture(key, modifiers), command)
  }

  /**
   * Binds the specified mouse button to the specified command.
   * @param controller The plot controller.
   * @param mouseButton The mouse button.
   * @param command A plot controller command that takes mouse event arguments.
   * @param modifiers The modifiers.
   * @param clickCount The click count.
   */
  static bindMouseDown(
    controller: IPlotController,
    mouseButton: OxyMouseButton,
    command: IViewCommandG<OxyMouseDownEventArgs>,
    modifiers: OxyModifierKeys = OxyModifierKeys.None,
    clickCount: number = 1,
  ): void {
    controller.bindMouseDown(new OxyMouseDownGesture(mouseButton, modifiers, clickCount), command)
  }

  /**
   * Binds the touch down event to the specified command.
   * @param controller The plot controller.
   * @param command A plot controller command that takes touch event arguments.
   */
  static bindTouchDown(controller: IPlotController, command: IViewCommandG<OxyTouchEventArgs>): void {
    controller.bindTouch(new OxyTouchGesture(), command)
  }

  /**
   * Binds the mouse enter event to the specified command.
   * @param controller The plot controller.
   * @param command A plot controller command that takes mouse event arguments.
   */
  static bindMouseEnter(controller: IPlotController, command: IViewCommandG<OxyMouseEventArgs>): void {
    controller.bindMouseEnter(new OxyMouseEnterGesture(), command)
  }

  /**
   * Binds the modifier+mouse wheel event to the specified command.
   * @param controller The plot controller.
   * @param modifiers The modifier key(s).
   * @param command A plot controller command that takes mouse wheel event arguments.
   */
  static bindMouseWheel(
    controller: IPlotController,
    command: IViewCommandG<OxyMouseWheelEventArgs>,
    modifiers: OxyModifierKeys = OxyModifierKeys.None,
  ): void {
    controller.bindMouseWheel(new OxyMouseWheelGesture(modifiers), command)
  }

  /**
   * Unbinds the specified mouse down gesture.
   * @param controller The controller.
   * @param mouseButton The mouse button.
   * @param modifiers The modifier keys.
   * @param clickCount The click count.
   */
  static unbindMouseDown(
    controller: IPlotController,
    mouseButton: OxyMouseButton,
    modifiers: OxyModifierKeys = OxyModifierKeys.None,
    clickCount: number = 1,
  ): void {
    controller.unbindInput(new OxyMouseDownGesture(mouseButton, modifiers, clickCount))
  }

  /**
   * Unbinds the specified key down gesture.
   * @param controller The controller.
   * @param key The key.
   * @param modifiers The modifier keys.
   */
  static unbindKeyDown(
    controller: IPlotController,
    key: OxyKey,
    modifiers: OxyModifierKeys = OxyModifierKeys.None,
  ): void {
    controller.unbindInput(new OxyKeyGesture(key, modifiers))
  }

  /**
   * Unbinds the mouse enter gesture.
   * @param controller The controller.
   */
  static unbindMouseEnter(controller: IPlotController): void {
    controller.unbindInput(new OxyMouseEnterGesture())
  }

  /**
   * Unbinds the touch down gesture.
   * @param controller The controller.
   */
  static unbindTouchDown(controller: IPlotController): void {
    controller.unbindInput(new OxyTouchGesture())
  }

  /**
   * Unbinds the mouse wheel gesture.
   * @param controller The controller.
   */
  static unbindMouseWheel(controller: IPlotController): void {
    controller.unbindInput(new OxyMouseWheelGesture())
  }
}
