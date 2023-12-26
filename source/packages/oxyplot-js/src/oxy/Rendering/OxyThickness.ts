import { isNullOrUndef } from '@/patch'

/**
 * Describes the thickness of a frame around a rectangle. Four number values describe the left, top, right, and bottom sides of the rectangle, respectively.
 */
export class OxyThickness {
  public static readonly Zero = new OxyThickness(0)

  /**
   * The bottom.
   */
  private readonly _bottom: number

  /**
   * The left.
   */
  private readonly _left: number

  /**
   * The right.
   */
  private readonly _right: number

  /**
   * The top.
   */
  private readonly _top: number

  /**
   * Initializes a new instance of the OxyThickness class.
   * @param thickness The thickness.
   */
  constructor(thickness: number)
  /**
   * Initializes a new instance of the OxyThickness class.
   * @param left The left.
   * @param top The top.
   * @param right The right.
   * @param bottom The bottom.
   */
  constructor(left: number, top: number, right: number, bottom: number)
  constructor(leftOrThickness: number, top?: number, right?: number, bottom?: number) {
    if (isNullOrUndef(top) && isNullOrUndef(right) && isNullOrUndef(bottom)) {
      this._left = this._top = this._right = this._bottom = leftOrThickness
    } else if (!isNullOrUndef(top) && !isNullOrUndef(right) && !isNullOrUndef(bottom)) {
      this._left = leftOrThickness
      this._top = top
      this._right = right
      this._bottom = bottom
    } else {
      throw new Error('Invalid arguments')
    }
  }

  /**
   * Gets the bottom thickness.
   */
  public get bottom(): number {
    return this._bottom
  }

  /**
   * Gets the left thickness.
   */
  public get left(): number {
    return this._left
  }

  /**
   * Gets the right thickness.
   */
  public get right(): number {
    return this._right
  }

  /**
   * Gets the top thickness.
   */
  public get top(): number {
    return this._top
  }

  /**
   * Returns a string that represents this instance.
   */
  public toString(): string {
    return `(${this._left}, ${this._top}, ${this._right}, ${this._bottom})`
  }

  /**
   * Determines whether this instance and another specified OxyThickness object have the same value.
   * @param other The thickness to compare to this instance.
   * @returns true if the value of the other parameter is the same as the value of this instance; otherwise, false.
   */
  public equals(other: OxyThickness): boolean {
    return (
      this.left === other.left && this.top === other.top && this.right === other.right && this.bottom === other.bottom
    )
  }

  /**
   * Creates a new OxyThickness with the maximum dimensions of this instance and the specified other instance.
   * @param other The other instance.
   * @returns A new OxyThickness.
   */
  public include(other: OxyThickness): OxyThickness {
    return new OxyThickness(
      Math.max(other.left, this.left),
      Math.max(other.top, this.top),
      Math.max(other.right, this.right),
      Math.max(other.bottom, this.bottom),
    )
  }
}
