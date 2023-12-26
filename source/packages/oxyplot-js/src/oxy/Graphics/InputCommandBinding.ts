import {
  type IViewCommand,
  type OxyInputGesture,
  OxyKey,
  OxyKeyGesture,
  OxyModifierKeys,
  OxyMouseButton,
  OxyMouseDownGesture,
} from '@/oxyplot'

/**
 * Represents a binding by an input gesture and a command binding.
 */
export class InputCommandBinding {
  /**
   * The gesture.
   */
  private readonly gesture: OxyInputGesture

  /**
   * The command.
   */
  private readonly command: IViewCommand

  /**
   * Initializes a new instance of the InputCommandBinding class by a gesture.
   * @param gesture The gesture.
   * @param command The command.
   */
  constructor(gesture: OxyInputGesture, command: IViewCommand) {
    this.gesture = gesture
    this.command = command
  }

  /**
   * Initializes a new instance of the InputCommandBinding class by a key gesture.
   * @param key The key.
   * @param modifiers The modifiers.
   * @param command The command.
   */
  static fromKeyGesture(key: OxyKey, modifiers: OxyModifierKeys, command: IViewCommand): InputCommandBinding {
    return new InputCommandBinding(new OxyKeyGesture(key, modifiers), command)
  }

  /**
   * Initializes a new instance of the InputCommandBinding class by a mouse gesture.
   * @param mouseButton The mouse button.
   * @param modifiers The modifiers.
   * @param command The command.
   */
  static fromMouseGesture(
    mouseButton: OxyMouseButton,
    modifiers: OxyModifierKeys,
    command: IViewCommand,
  ): InputCommandBinding {
    return new InputCommandBinding(new OxyMouseDownGesture(mouseButton, modifiers), command)
  }

  /**
   * Gets the gesture.
   */
  getGesture(): OxyInputGesture {
    return this.gesture
  }

  /**
   * Gets the command.
   */
  getCommand(): IViewCommand {
    return this.command
  }
}
