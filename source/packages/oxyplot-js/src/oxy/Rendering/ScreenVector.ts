/**
 * Represents a vector defined in screen space.
 */
export class ScreenVector {
  /**
   * The zero point.
   */
  public static readonly Zero = Object.freeze(new ScreenVector(0, 0)) as ScreenVector

  /**
   * The x-coordinate.
   */
  private _x: number

  /**
   * The y-coordinate.
   */
  private _y: number

  /**
   * Initializes a new instance of the `ScreenVector` struct.
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   */
  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }

  /**
   * Gets the length of the vector.
   */
  public get length(): number {
    return Math.sqrt(this._x * this._x + this._y * this._y)
  }

  /**
   * Gets the squared length of the vector.
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
   * Normalizes the vector (makes its length 1).
   * If the vector has zero length, it remains unchanged.
   */
  normalize(): void {
    if (this === ScreenVector.Zero) throw new Error('Cannot normalize the zero vector')

    const length = Math.sqrt(this._x * this._x + this._y * this._y)
    if (length > 0) {
      this._x /= length
      this._y /= length
    }
  }

  plus(d: ScreenVector): ScreenVector {
    const v = this
    return new ScreenVector(v.x + d.x, v.y + d.y)
  }

  minus(d: ScreenVector): ScreenVector {
    const v = this
    return new ScreenVector(v.x - d.x, v.y - d.y)
  }

  times(d: number): ScreenVector {
    const v = this
    return new ScreenVector(v.x * d, v.y * d)
  }

  negate(): ScreenVector {
    const v = this
    return new ScreenVector(-v.x, -v.y)
  }

  /**
   * Returns a string representation of the vector.
   */
  toString(): string {
    return `${this._x} ${this._y}`
  }

  /**
   * Determines whether this vector equals another vector.
   * @param other The vector to compare to.
   * @returns True if the vectors are equal, false otherwise.
   */
  equals(other: ScreenVector): boolean {
    return this._x === other._x && this._y === other._y
  }
}
