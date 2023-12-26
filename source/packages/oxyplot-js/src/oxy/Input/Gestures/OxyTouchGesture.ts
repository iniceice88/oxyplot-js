import type { OxyInputGesture } from '@/oxyplot'

/**
 * Represents a touch input gesture.
 * The input gesture can be bound to a command in a `PlotController`.
 */
export class OxyTouchGesture implements OxyInputGesture {
  /**
   * Indicates whether the current object is equal to another object of the same type.
   * @param other An object to compare with this object.
   * @returns `true` if the current object is equal to the `other` parameter; otherwise, `false`.
   */
  public equals(other: OxyInputGesture): boolean {
    return other instanceof OxyTouchGesture
  }
}
