import { type OxyInputGesture, type OxyKey, OxyModifierKeys } from '@/oxyplot'

/**
 * Represents a keyboard input gesture.
 * The input gesture can be bound to a command in a `PlotController`.
 */
export class OxyKeyGesture implements OxyInputGesture {
  /**
   * Initializes a new instance of the `OxyKeyGesture` class.
   * @param key The key.
   * @param modifiers The modifier keys.
   */
  constructor(
    public key: OxyKey,
    public modifiers: OxyModifierKeys = OxyModifierKeys.None,
  ) {}

  /**
   * Indicates whether the current object is equal to another object of the same type.
   * @param other An object to compare with this object.
   * @returns `true` if the current object is equal to the `other` parameter; otherwise, `false`.
   */
  public equals(other: OxyInputGesture): boolean {
    if (!(other instanceof OxyKeyGesture)) return false

    const kg = other as OxyKeyGesture
    return kg.modifiers === this.modifiers && kg.key === this.key
  }
}
