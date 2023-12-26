import type { OxyMouseButton } from '@/oxyplot'
import { type OxyInputGesture, OxyModifierKeys } from '@/oxyplot'

/**
 * Represents a mouse down input gesture.
 * The input gesture can be bound to a command in a `PlotController`.
 */
export class OxyMouseDownGesture implements OxyInputGesture {
  /**
   * Initializes a new instance of the `OxyMouseDownGesture` class.
   * @param mouseButton The mouse button.
   * @param modifiers The modifiers.
   * @param clickCount The click count.
   */
  constructor(
    public mouseButton: OxyMouseButton,
    public modifiers: OxyModifierKeys = OxyModifierKeys.None,
    public clickCount: number = 1,
  ) {}

  /**
   * Indicates whether the current object is equal to another object of the same type.
   * @param other An object to compare with this object.
   * @returns `true` if the current object is equal to the `other` parameter; otherwise, `false`.
   */
  public equals(other: OxyInputGesture): boolean {
    if (!(other instanceof OxyMouseDownGesture)) return false

    const mg = other as OxyMouseDownGesture
    return mg.modifiers === this.modifiers && mg.mouseButton === this.mouseButton && mg.clickCount === this.clickCount
  }
}
