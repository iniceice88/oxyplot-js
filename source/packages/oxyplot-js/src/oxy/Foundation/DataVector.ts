/**
 * Represents a vector in the data space.
 */
export class DataVector {
  /**
   * The undefined.
   */
  public static readonly Undefined = new DataVector(NaN, NaN)

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
  public times(d: number): DataVector {
    const v = this
    return new DataVector(v._x * d, v._y * d)
  }

  /**
   * Adds a vector to another vector.
   * @param d The vector to be added.
   * @returns The result of the operation.
   */
  public plus(d: DataVector): DataVector {
    const v = this
    return new DataVector(v._x + d._x, v._y + d._y)
  }

  /**
   * Subtracts one specified vector from another.
   * @param d The vector to be subtracted.
   * @returns The result of operation.
   */
  public minus(d: DataVector): DataVector {
    const v = this
    return new DataVector(v._x - d._x, v._y - d._y)
  }

  /**
   * Negates the specified vector.
   * @returns The result of operation.
   */
  public negate(): DataVector {
    const v = this
    return new DataVector(-v._x, -v._y)
  }

  /**
   * Determines whether this and another specified DataVector have the same value.
   * @param other The vector to compare to this instance.
   * @returns true if the value of the other parameter is the same as the value of this instance; otherwise, false.
   */
  public equals(other: DataVector): boolean {
    return this._x === other._x && this._y === other._y
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
    // check that x and y is not NaN (the code below is faster than isNaN)
    return this._x === this._x && this._y === this._y
  }
}
