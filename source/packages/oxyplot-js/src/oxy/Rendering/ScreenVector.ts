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
export const ScreenVector_Zero = Object.freeze(newScreenVector(0, 0)) as ScreenVector

export class ScreenVectorEx implements ScreenVector {
  private _v: ScreenVector

  get x() {
    return this._v.x
  }

  get y() {
    return this._v.y
  }

  get vector(): ScreenVector {
    return this._v
  }

  constructor(v: ScreenVector) {
    this._v = v
  }

  get length(): number {
    return ScreenVectorHelper.length(this._v)
  }

  get lengthSquared(): number {
    return ScreenVectorHelper.lengthSquared(this._v)
  }

  minus(d: ScreenVector): ScreenVectorEx {
    return ScreenVectorEx.fromVector(ScreenVectorHelper.minus(this._v, d))
  }

  times(d: number): ScreenVectorEx {
    return ScreenVectorEx.fromVector(ScreenVectorHelper.times(this._v, d))
  }

  negate(): ScreenVectorEx {
    return ScreenVectorEx.fromVector(ScreenVectorHelper.negate(this._v))
  }

  normalize() {
    this._v = ScreenVectorHelper.normalize(this._v)
    return this
  }

  static fromVector(v: ScreenVector): ScreenVectorEx {
    return new ScreenVectorEx(v)
  }

  static fromXY(x: number, y: number): ScreenVectorEx {
    return new ScreenVectorEx(newScreenVector(x, y))
  }
}

export class ScreenVectorHelper {
  /**
   * Gets the length of the vector.
   */
  static length(v: ScreenVector): number {
    return Math.sqrt(v.x * v.x + v.y * v.y)
  }

  /**
   * Gets the squared length of the vector.
   */
  static lengthSquared(v: ScreenVector): number {
    return v.x * v.x + v.y * v.y
  }

  /**
   * Normalizes the vector (makes its length 1).
   * If the vector has zero length, it remains unchanged.
   */
  static normalize(v: ScreenVector): ScreenVector {
    if (v === ScreenVector_Zero) throw new Error('Cannot normalize the zero vector')

    const length = Math.sqrt(v.x * v.x + v.y * v.y)
    if (length > 0) {
      return {
        x: v.x / length,
        y: v.y / length,
      }
    }
    return v
  }

  static plus(v: ScreenVector, d: ScreenVector): ScreenVector {
    return newScreenVector(v.x + d.x, v.y + d.y)
  }

  static minus(v: ScreenVector, d: ScreenVector): ScreenVector {
    return newScreenVector(v.x - d.x, v.y - d.y)
  }

  static times(v: ScreenVector, d: number): ScreenVector {
    return newScreenVector(v.x * d, v.y * d)
  }

  static negate(v: ScreenVector): ScreenVector {
    return newScreenVector(-v.x, -v.y)
  }

  /**
   * Determines whether this vector equals another vector.
   * @param v
   * @param other The vector to compare to.
   * @returns True if the vectors are equal, false otherwise.
   */
  static equals(v: ScreenVector, other: ScreenVector): boolean {
    return v.x === other.x && v.y === other.y
  }
}
