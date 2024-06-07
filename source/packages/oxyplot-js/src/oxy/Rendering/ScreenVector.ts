/**
 * Represents a vector defined in screen space.
 */
export interface ScreenVector {
  /**
   * The x-coordinate.
   */
  x: number
  /**
   * The y-coordinate.
   */
  y: number
}

export function newScreenVector(x: number, y: number): ScreenVector {
  return Object.freeze({
    x,
    y,
  })
}

export function newScreenVectorEx(x: number, y: number): ScreenVectorEx {
  return ScreenVectorEx.fromXY(x, y)
}

/**
 * The zero point.
 */
export const ScreenVector_Zero = newScreenVector(0, 0)

export class ScreenVectorEx implements ScreenVector {
  private readonly _x: number
  private readonly _y: number

  get x() {
    return this._x
  }

  get y() {
    return this._y
  }

  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }

  static from(sv: ScreenVector) {
    return new ScreenVectorEx(sv.x, sv.y)
  }

  static fromXY(x: number, y: number): ScreenVectorEx {
    return new ScreenVectorEx(x, y)
  }

  /**
   * Gets the length of the vector.
   */
  get length(): number {
    const v = this
    return Math.sqrt(v.x * v.x + v.y * v.y)
  }

  /**
   * Gets the squared length of the vector.
   */
  get lengthSquared(): number {
    const v = this
    return v.x * v.x + v.y * v.y
  }

  /**
   * Subtracts one specified vector from another.
   * @param d The vector to be subtracted.
   */
  minus(d: ScreenVector): ScreenVectorEx {
    const v = this
    return new ScreenVectorEx(v.x - d.x, v.y - d.y)
  }

  /**
   * Implements the operator *.
   * @param d The multiplication factor.
   */
  times(d: number): ScreenVectorEx {
    const v = this
    return new ScreenVectorEx(v.x * d, v.y * d)
  }

  /**
   * Negates the specified vector.
   */
  negate(): ScreenVectorEx {
    const v = this
    return new ScreenVectorEx(-v.x, -v.y)
  }

  normalize(): ScreenVectorEx {
    const v = this
    if (v === ScreenVector_Zero) throw new Error('Cannot normalize the zero vector')

    const length = Math.sqrt(v.x * v.x + v.y * v.y)
    if (length > 0) {
      return new ScreenVectorEx(v.x / length, v.y / length)
    }
    return v
  }
}
