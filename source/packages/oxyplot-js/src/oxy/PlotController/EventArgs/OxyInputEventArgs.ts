import { OxyModifierKeys } from '@/oxyplot'

/**
 * Provides an abstract base interface for classes that contain event data for input events.
 */
export interface OxyInputEventArgs {
  /**
   * Gets or sets a value indicating whether the event was handled.
   */
  handled: boolean

  /**
   * Gets or sets the modifier keys.
   */
  modifierKeys: OxyModifierKeys
}

export class OxyModifierKeysExtensions {
  /**
   * Determines whether the specified modifier keys contains the alt key.
   */
  public static isAltDown(e: OxyInputEventArgs): boolean {
    return (e.modifierKeys & OxyModifierKeys.Alt) === OxyModifierKeys.Alt
  }

  /**
   * Determines whether the specified modifier keys contains the control key.
   */
  public static isControlDown(e: OxyInputEventArgs): boolean {
    return (e.modifierKeys & OxyModifierKeys.Control) === OxyModifierKeys.Control
  }

  /**
   * Determines whether the specified modifier keys contains the shift key.
   */
  public static isShiftDown(e: OxyInputEventArgs): boolean {
    return (e.modifierKeys & OxyModifierKeys.Shift) === OxyModifierKeys.Shift
  }
}
