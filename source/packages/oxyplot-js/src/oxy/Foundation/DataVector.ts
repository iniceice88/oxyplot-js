/**
 * Represents a vector in the data space.
 */
export interface DataVector {
  /**
   * The x-coordinate.
   */
  x: number
  /**
   * The y-coordinate.
   */
  y: number
}

/**
 * The undefined.
 */
export const DataVector_Undefined: DataVector = Object.freeze({ x: NaN, y: NaN })

export function newDataVector(x: number, y: number): DataVector {
  return { x, y }
}

/**
 * Represents a vector in the data space.
 */
export class DataVectorEx implements DataVector {
  /**
   * The x-coordinate.
   */
  private readonly _x: number

  /**
   * The y-coordinate.
   */
  private readonly _y: number

  /**
   * Initializes a new instance of the DataVector class.
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   */
  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }

  static from(dv: DataVector) {
    return new DataVectorEx(dv.x, dv.y)
  }

  /**
   * Gets the length.
   */
  public get length(): number {
    return Math.sqrt(this._x * this._x + this._y * this._y)
  }

  /**
   * Gets the length squared.
   */
  public get lengthSquared(): number {
    return this._x * this._x + this._y * this._y
  }

  /**
   * Gets the x-coordinate.
   */
  public get x(): number {
    return this._x
  }

  /**
   * Gets the y-coordinate.
   */
  public get y(): number {
    return this._y
  }

  /**
   * Implements the operator *.
   * @param d The multiplication factor.
   * @returns The result of the operator.
   */
  public times(d: number): DataVectorEx {
    const v = this
    return new DataVectorEx(v._x * d, v._y * d)
  }

  /**
   * Adds a vector to another vector.
   * @param d The vector to be added.
   * @returns The result of the operation.
   */
  public plus(d: DataVector): DataVectorEx {
    const v = this
    return new DataVectorEx(v._x + d.x, v._y + d.y)
  }

  /**
   * Subtracts one specified vector from another.
   * @param d The vector to be subtracted.
   * @returns The result of operation.
   */
  public minus(d: DataVector): DataVectorEx {
    const v = this
    return new DataVectorEx(v._x - d.x, v._y - d.y)
  }

  /**
   * Negates the specified vector.
   * @returns The result of operation.
   */
  public negate(): DataVectorEx {
    const v = this
    return new DataVectorEx(-v._x, -v._y)
  }

  /**
   * Determines whether this and another specified DataVector have the same value.
   * @param other The vector to compare to this instance.
   * @returns true if the value of the other parameter is the same as the value of this instance; otherwise, false.
   */
  public equals(other: DataVector): boolean {
    return this._x === other.x && this._y === other.y
  }

  /**
   * Returns a string that represents this instance.
   */
  public toString(): string {
    return `${this._x} ${this._y}`
  }

  /**
   * Determines whether this point is defined.
   * @returns true if this point is defined; otherwise, false.
   */
  public isDefined(): boolean {
    // check that x and y is not NaN
    return !isNaN(this._x) && !isNaN(this._y)
  }
}
