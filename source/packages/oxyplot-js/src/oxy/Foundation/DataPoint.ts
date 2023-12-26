import { DataVector } from '@/oxyplot'

/**
 * Represents a point in the data space.
 * DataPoints are transformed to ScreenPoints.
 */
export class DataPoint {
  /**
   * The undefined.
   */
  public static readonly Undefined = new DataPoint(NaN, NaN)

  /**
   * The zero point.
   */
  public static readonly Zero = new DataPoint(0, 0)

  /**
   * The x-coordinate.
   */
  private readonly _x: number

  /**
   * The y-coordinate.
   */
  private readonly _y: number

  /**
   * Initializes a new instance of the DataPoint class.
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   */
  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }

  /**
   * Gets the X-coordinate of the point.
   */
  public get x(): number {
    return this._x
  }

  /**
   * Gets the Y-coordinate of the point.
   */
  public get y(): number {
    return this._y
  }

  /**
   * Determines whether this and another specified DataPoint have the same value.
   * @param other The point to compare to this instance.
   * @returns true if the value of the other parameter is the same as the value of this instance; otherwise, false.
   */
  public equals(other: DataPoint): boolean {
    return this._x === other._x && this._y === other._y
  }

  /**
   * Translates a DataPoint by a DataVector.
   * @param p2 The vector.
   * @returns The translated point.
   */
  public plus(p2: DataVector): DataPoint {
    const p1 = this
    return new DataPoint(p1._x + p2.x, p1._y + p2.y)
  }

  /**
   * Subtracts a DataPoint from a DataPoint
   * and returns the result as a DataVector.
   * @param p2 The point to subtract from p1.
   * @returns A DataVector structure that represents the difference between p1 and p2.
   */
  public minus(p2: DataPoint): DataVector {
    const p1 = this
    return new DataVector(p1._x - p2._x, p1._y - p2._y)
  }

  /**
   * Subtracts a DataVector from a DataPoint
   * and returns the result as a DataPoint.
   * @param vector The vector to subtract from p1.
   * @returns A DataPoint that represents point translated by the negative vector.
   */
  public minusVector(vector: DataVector): DataPoint {
    const point = this
    return new DataPoint(point._x - vector.x, point._y - vector.y)
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
