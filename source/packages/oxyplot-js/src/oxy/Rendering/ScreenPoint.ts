import { ScreenVector } from '@/oxyplot'

/**
 * Represents a point defined in screen space.
 *
 * @remarks The rendering methods transforms `DataPoint`s to `ScreenPoint`s.
 */
export class ScreenPoint {
  /**
   * The undefined point.
   */
  public static readonly Undefined = new ScreenPoint(NaN, NaN)

  /**
   * The left-top point.
   */
  public static readonly LeftTop = new ScreenPoint(0, 0)

  /**
   * The x-coordinate.
   */
  private readonly _x: number

  /**
   * The y-coordinate.
   */
  private readonly _y: number

  /**
   * Initializes a new instance of the `ScreenPoint` struct.
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   */
  constructor(x?: number, y?: number) {
    this._x = x || 0
    this._y = y || 0
  }

  /**
   * Gets the x-coordinate.
   */
  get x(): number {
    return this._x
  }

  /**
   * Gets the y-coordinate.
   */
  get y(): number {
    return this._y
  }

  /**
   * Determines whether the specified point is undefined.
   * @param point The point.
   * @returns `true` if the specified point is undefined; otherwise, `false`.
   */
  static isUndefined(point: ScreenPoint): boolean {
    return isNaN(point._x) && isNaN(point._y)
  }

  /**
   * Translates a ScreenPoint by a ScreenVector.
   * @param p2 The vector.
   * @returns The translated point.
   */
  public plus(p2: ScreenVector): ScreenPoint {
    const p1 = this
    return new ScreenPoint(p1.x + p2.x, p1.y + p2.y)
  }

  /**
   * Subtracts a ScreenPoint from a ScreenPoint
   * and returns the result as a ScreenVector.
   * @param p2 The point to subtract from p1.
   * @returns A ScreenVector structure that represents the difference between p1 and p2.
   */
  public minus(p2: ScreenPoint): ScreenVector {
    const p1 = this
    return new ScreenVector(p1.x - p2.x, p1.y - p2.y)
  }

  /**
   * Subtracts a ScreenVector from a ScreenPoint
   * and returns the result as a ScreenPoint.
   * @param vector The vector to subtract from p1.
   * @returns A ScreenPoint that represents point translated by the negative vector.
   */
  public minusVector(vector: ScreenVector): ScreenPoint {
    const point = this
    return new ScreenPoint(point.x - vector.x, point.y - vector.y)
  }

  /**
   * Gets the distance to the specified point.
   * @param point The point.
   * @returns The distance.
   */
  distanceTo(point: ScreenPoint): number {
    const dx = point._x - this._x
    const dy = point._y - this._y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Gets the squared distance to the specified point.
   * @param point The point.
   * @returns The squared distance.
   */
  distanceToSquared(point: ScreenPoint): number {
    const dx = point._x - this._x
    const dy = point._y - this._y
    return dx * dx + dy * dy
  }

  /**
   * Returns a `string` that represents this instance.
   * @returns A `string` that represents this instance.
   */
  toString(): string {
    return `${this._x} ${this._y}`
  }

  /**
   * Determines whether this instance and another specified `ScreenPoint` object have the same value.
   * @param other The point to compare to this instance.
   * @returns `true` if the value of the `other` parameter is the same as the value of this instance; otherwise, `false`.
   */
  equals(other: ScreenPoint): boolean {
    return this._x === other._x && this._y === other._y
  }
}
