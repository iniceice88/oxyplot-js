/**
 * Describes the size of an object.
 */
export class OxySize {
  /**
   * Empty Size.
   */
  public static readonly Empty = new OxySize(0, 0)

  /**
   * The height
   */
  private readonly _height: number

  /**
   * The width
   */
  private readonly _width: number

  /**
   * Initializes a new instance of the OxySize class.
   * @param width The width.
   * @param height The height.
   */
  constructor(width?: number, height?: number) {
    this._width = width || 0
    this._height = height || 0
  }

  /**
   * Gets the height.
   */
  public get height(): number {
    return this._height
  }

  /**
   * Gets the width.
   */
  public get width(): number {
    return this._width
  }

  /**
   * Returns a string that represents this instance.
   */
  public toString(): string {
    return `(${this.width}, ${this.height})`
  }

  /**
   * Determines whether this instance and another specified OxySize object have the same value.
   * @param other The size to compare to this instance.
   * @returns true if the value of the other parameter is the same as the value of this instance; otherwise, false.
   */
  public equals(other: OxySize): boolean {
    return this.width === other.width && this.height === other.height
  }

  /**
   * Creates a new OxySize with the maximum dimensions of this instance and the specified other instance.
   * @param other The other instance.
   * @returns A new OxySize.
   */
  public include(other: OxySize): OxySize {
    return new OxySize(Math.max(this.width, other.width), Math.max(this.height, other.height))
  }
}
