import { type OxyInputGesture, OxyModifierKeys } from '@/oxyplot'

/**
 * Represents a mouse enter gesture.
 * The input gesture can be bound to a command in a `PlotController`.
 */
export class OxyMouseEnterGesture implements OxyInputGesture {
  /**
   * Initializes a new instance of the `OxyMouseEnterGesture` class.
   * @param modifiers The modifiers.
   */
  constructor(public modifiers: OxyModifierKeys = OxyModifierKeys.None) {}

  /**
   * Indicates whether the current object is equal to another object of the same type.
   * @param other An object to compare with this object.
   * @returns `true` if the current object is equal to the `other` parameter; otherwise, `false`.
   */
  public equals(other: OxyInputGesture): boolean {
    if (!(other instanceof OxyMouseEnterGesture)) return false

    const mg = other as OxyMouseEnterGesture
    return mg.modifiers === this.modifiers
  }
}
