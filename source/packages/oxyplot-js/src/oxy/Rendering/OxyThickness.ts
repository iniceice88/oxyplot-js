import { isNullOrUndef } from '@/patch'

/**
 * Describes the thickness of a frame around a rectangle. Four number values describe the left, top, right, and bottom sides of the rectangle, respectively.
 */
export interface OxyThickness {
  /**
   * The bottom.
   */
  bottom: number
  /**
   * The left.
   */
  left: number
  /**
   * The right.
   */
  right: number
  /**
   * The top.
   */
  top: number
}

export function newOxyThickness(thickness: number): Readonly<OxyThickness>
export function newOxyThickness(left: number, top: number, right: number, bottom: number): OxyThickness
export function newOxyThickness(leftOrThickness: number, top?: number, right?: number, bottom?: number): OxyThickness {
  if (!isNullOrUndef(leftOrThickness) && isNullOrUndef(top) && isNullOrUndef(right) && isNullOrUndef(bottom)) {
    return Object.freeze({
      left: leftOrThickness,
      top: leftOrThickness,
      right: leftOrThickness,
      bottom: leftOrThickness,
    })
  } else if (!isNullOrUndef(top) && !isNullOrUndef(right) && !isNullOrUndef(bottom)) {
    return Object.freeze({
      left: leftOrThickness,
      top: top,
      right: right,
      bottom: bottom,
    })
  } else {
    debugger
    throw new Error('Invalid arguments')
  }
}

export const OxyThickness_Zero = Object.freeze(newOxyThickness(0))

export class OxyThicknessEx implements OxyThickness {
  private _thickness: OxyThickness

  constructor(t: OxyThickness) {
    this._thickness = t
  }

  static from(t: OxyThickness) {
    return new OxyThicknessEx(t)
  }

  get bottom() {
    return this._thickness.bottom
  }

  get left() {
    return this._thickness.left
  }

  get right() {
    return this._thickness.right
  }

  get top() {
    return this._thickness.top
  }

  /**
   * Determines whether this instance and another specified OxyThickness object have the same value.
   * @param t
   * @param other The thickness to compare to this instance.
   * @returns true if the value of the other parameter is the same as the value of this instance; otherwise, false.
   */
  static equals(t: OxyThickness, other: OxyThickness): boolean {
    return t.left === other.left && t.top === other.top && t.right === other.right && t.bottom === other.bottom
  }

  /**
   * Creates a new OxyThickness with the maximum dimensions of this instance and the specified other instance.
   * @param t
   * @param other The other instance.
   * @returns A new OxyThickness.
   */
  static include(t: OxyThickness, other: OxyThickness): OxyThickness {
    return newOxyThickness(
      Math.max(other.left, t.left),
      Math.max(other.top, t.top),
      Math.max(other.right, t.right),
      Math.max(other.bottom, t.bottom),
    )
  }
}
