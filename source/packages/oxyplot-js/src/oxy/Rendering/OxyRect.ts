import type { OxySize, OxyThickness } from '@/oxyplot'
import { ScreenPoint } from '@/oxyplot'
import { isNegativeInfinity, isPositiveInfinity } from '@/patch'

/**
 * Describes the width, height, and point origin of a rectangle.
 */
export class OxyRect {
  /**
   * Gets an infinitely large `OxyRect` starting at (0,0).
   */
  public static readonly Everything = new OxyRect(0, 0, Infinity, Infinity)

  public static readonly Empty = new OxyRect(0, 0, 0, 0)

  /**
   * The height of the rectangle.
   */
  private readonly _height: number

  /**
   * The x-coordinate location of the left side of the rectangle.
   */
  private readonly _left: number

  /**
   * The y-coordinate location of the top side of the rectangle.
   */
  private readonly _top: number

  /**
   * The width of the rectangle.
   */
  private readonly _width: number

  /**
   * Initializes a new instance of the `OxyRect` structure that has the specified x-coordinate, y-coordinate, width, and height.
   * @param left The x-coordinate location of the left side of the rectangle.
   * @param top The y-coordinate location of the top side of the rectangle.
   * @param width The width of the rectangle.
   * @param height The height of the rectangle.
   * @exception ArgumentOutOfRangeException
   * - width;The width should not be negative.
   * - height;The height should not be negative.
   */
  constructor(left: number, top: number, width: number, height: number) {
    if (width < 0) {
      throw new Error('width;The width should not be negative.')
    }

    if (height < 0) {
      throw new Error('height;The height should not be negative.')
    }

    this._left = left
    this._top = top
    this._width = width
    this._height = height
  }

  /**
   * Initializes a new instance of the `OxyRect` struct that is exactly large enough to contain the two specified points.
   * @param p0 The first point that the new rectangle must contain.
   * @param p1 The second point that the new rectangle must contain.
   */
  static fromScreenPoints(p0: ScreenPoint, p1: ScreenPoint) {
    return new OxyRect(Math.min(p0.x, p1.x), Math.min(p0.y, p1.y), Math.abs(p1.x - p0.x), Math.abs(p1.y - p0.y))
  }

  /**
   * Initializes a new instance of the `OxyRect` struct by location and size.
   * @param p0 The location.
   * @param size The size.
   */
  static fromScreenPointAndSize(p0: ScreenPoint, size: OxySize) {
    return new OxyRect(p0.x, p0.y, size.width, size.height)
  }

  /**
   * Gets the y-axis value of the bottom of the rectangle.
   * @value The bottom.
   */
  public get bottom(): number {
    return this._top + this._height
  }

  /**
   * Gets the height of the rectangle.
   * @value The height.
   */
  public get height(): number {
    return this._height
  }

  /**
   * Gets the x-axis value of the left side of the rectangle.
   * @value The left.
   */
  public get left(): number {
    return this._left
  }

  /**
   * Gets the x-axis value of the right side of the rectangle.
   * @value The right.
   */
  public get right(): number {
    return this._left + this._width
  }

  /**
   * Gets the y-axis position of the top of the rectangle.
   * @value The top.
   */
  public get top(): number {
    return this._top
  }

  /**
   * Gets the width of the rectangle.
   * @value The width.
   */
  public get width(): number {
    return this._width
  }

  /**
   * Gets the center point of the rectangle.
   * @value The center.
   */
  public get center(): ScreenPoint {
    return new ScreenPoint(this._left + this._width * 0.5, this._top + this._height * 0.5)
  }

  /**
   * Gets the top left corner of the rectangle.
   * @value The top left corner.
   */
  public get topLeft(): ScreenPoint {
    return new ScreenPoint(this.left, this.top)
  }

  /**
   * Gets the top right corner of the rectangle.
   * @value The top right corner.
   */
  public get topRight(): ScreenPoint {
    return new ScreenPoint(this.right, this.top)
  }

  /**
   * Gets the bottom left corner of the rectangle.
   * @value The bottom left corner.
   */
  public get bottomLeft(): ScreenPoint {
    return new ScreenPoint(this.left, this.bottom)
  }

  /**
   * Gets the bottom right corner of the rectangle.
   * @value The bottom right corner.
   */
  public get bottomRight(): ScreenPoint {
    return new ScreenPoint(this.right, this.bottom)
  }

  /**
   * Creates a rectangle from the specified corner coordinates.
   * @param x0 The x0.
   * @param y0 The y0.
   * @param x1 The x1.
   * @param y1 The y1.
   * @returns A rectangle.
   */
  public static create(x0: number, y0: number, x1: number, y1: number): OxyRect {
    return new OxyRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0))
  }

  /**
   * Determines whether the specified point is inside the rectangle.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @returns `true` if the rectangle contains the specified point; otherwise, `false`.
   */
  public contains(x: number, y: number): boolean {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom
  }

  /**
   * Determines whether the specified point is inside the rectangle.
   * @param p The point.
   * @returns `true` if the rectangle contains the specified point; otherwise, `false`.
   */
  public containsPoint(p: ScreenPoint): boolean {
    return this.contains(p.x, p.y)
  }

  /**
   * Returns a `string` that represents this instance.
   * @returns A `string` that represents this instance.
   */
  public toString(): string {
    return `(${this._left}, ${this._top}, ${this._width}, ${this._height})`
  }

  public equals(other: OxyRect): boolean {
    return (
      this.left === other.left && this.top === other.top && this.width === other.width && this.height === other.height
    )
  }

  /**
   * Returns a rectangle that is expanded or shrunk by the specified width and height amounts, in all directions.
   * @param dx The amount by which to expand or shrink the left and right sides of the rectangle.
   * @param dy The amount by which to expand or shrink the top and bottom sides of the rectangle.
   * @returns The expanded/shrunk `OxyRect`.
   */
  public inflate(dx: number, dy: number): OxyRect {
    return new OxyRect(this._left - dx, this._top - dy, this._width + dx * 2, this._height + dy * 2)
  }

  /**
   * Returns a rectangle that is expanded by the specified thickness, in all directions.
   * @param t The thickness to apply to the rectangle.
   * @returns The inflated `OxyRect`.
   */
  public inflateAll(t: OxyThickness): OxyRect {
    return new OxyRect(
      this._left - t.left,
      this._top - t.top,
      this._width + t.left + t.right,
      this._height + t.top + t.bottom,
    )
  }

  /**
   * Intersects this `OxyRect` with another `OxyRect`.
   * @param rect The other `OxyRect`.
   * @returns The intersection between this `OxyRect` and the other `OxyRect`.
   * @remarks If the two rectangles don't intersect, this returns an empty `OxyRect`.
   */
  public intersect(rect: OxyRect): OxyRect {
    const left = Math.max(this.left, rect.left)
    const top = Math.max(this.top, rect.top)
    const right = Math.min(this.right, rect.right)
    const bottom = Math.min(this.bottom, rect.bottom)

    if (right < left || bottom < top) {
      return OxyRect.Empty
    }

    return new OxyRect(left, top, right - left, bottom - top)
  }

  /**
   * Returns a rectangle that is shrunk by the specified thickness, in all directions.
   * @param t The thickness to apply to the rectangle.
   * @returns The deflated `OxyRect`.
   */
  public deflate(t: OxyThickness): OxyRect {
    return new OxyRect(
      this._left + t.left,
      this._top + t.top,
      Math.max(0, this._width - t.left - t.right),
      Math.max(0, this._height - t.top - t.bottom),
    )
  }

  /**
   * Returns a rectangle that is moved by the specified horizontal and vertical amounts.
   * @param offsetX The amount to move the rectangle horizontally.
   * @param offsetY The amount to move the rectangle vertically.
   * @returns The moved `OxyRect`.
   */
  public offset(offsetX: number, offsetY: number): OxyRect {
    return new OxyRect(this._left + offsetX, this._top + offsetY, this._width, this._height)
  }

  /**
   * Returns a rectangle that is clipped to the outer bounds of the specified rectangle.
   * @param clipRect The rectangle that defines the outermost allowed coordinates for the clipped rectangle.
   * @returns The clipped rectangle.
   */
  public clip(clipRect: OxyRect): OxyRect {
    const clipRight =
      isNegativeInfinity(clipRect.left) && isPositiveInfinity(clipRect.width) ? clipRect.right : Infinity
    const clipBottom =
      isNegativeInfinity(clipRect.top) && isPositiveInfinity(clipRect.height) ? clipRect.bottom : Infinity

    return OxyRect.create(
      Math.max(Math.min(this.left, clipRight), clipRect.left),
      Math.max(Math.min(this.top, clipBottom), clipRect.top),
      Math.max(Math.min(this.right, clipRight), clipRect.left),
      Math.max(Math.min(this.bottom, clipBottom), clipRect.top),
    )
  }
}
