import { newScreenPoint, type OxySize, type OxyThickness, type ScreenPoint } from '@/oxyplot'
import { isNegativeInfinity, isPositiveInfinity } from '@/patch'

/**
 * Describes the width, height, and point origin of a rectangle.
 */
export interface OxyRect {
  /**
   * The height of the rectangle.
   */
  height: number
  /**
   * The x-coordinate location of the left side of the rectangle.
   */
  left: number
  /**
   * The y-coordinate location of the top side of the rectangle.
   */
  top: number
  /**
   * The width of the rectangle.
   */
  width: number
}

export class OxyRectEx implements OxyRect {
  private readonly _rect: OxyRect

  get rect() {
    return this._rect
  }

  get left() {
    return this._rect.left
  }

  get top() {
    return this._rect.top
  }

  get topLeft() {
    return OxyRectHelper.topLeft(this._rect)
  }

  get topRight() {
    return OxyRectHelper.topRight(this._rect)
  }

  get right() {
    return OxyRectHelper.right(this._rect)
  }

  get bottom() {
    return OxyRectHelper.bottom(this._rect)
  }

  get bottomLeft() {
    return OxyRectHelper.bottomLeft(this._rect)
  }

  get bottomRight() {
    return OxyRectHelper.bottomRight(this._rect)
  }

  get height() {
    return this._rect.height
  }

  get width() {
    return this._rect.width
  }

  get center() {
    return OxyRectHelper.center(this._rect)
  }

  offset(offsetX: number, offsetY: number) {
    const rect = OxyRectHelper.offset(this._rect, offsetX, offsetY)
    return OxyRectEx.fromRect(rect)
  }

  clip(clipRect: OxyRect) {
    const r = OxyRectHelper.clip(this._rect, clipRect)
    return OxyRectEx.fromRect(r)
  }

  deflate(t: OxyThickness) {
    const r = OxyRectHelper.deflate(this._rect, t)
    return OxyRectEx.fromRect(r)
  }

  constructor(rect: OxyRect) {
    this._rect = rect
  }

  static fromRect(rect: OxyRect) {
    return new OxyRectEx(rect)
  }

  static fromScreenPoints(p0: ScreenPoint, p1: ScreenPoint) {
    return new OxyRectEx(OxyRectHelper.fromScreenPoints(p0, p1))
  }
}

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
export function newOxyRect(left: number, top: number, width: number, height: number): Readonly<OxyRect> {
  if (width < 0) {
    throw new Error('width;The width should not be negative.')
  }

  if (height < 0) {
    throw new Error('height;The height should not be negative.')
  }

  return Object.freeze({
    left,
    top,
    width,
    height,
  })
}

/**
 * Gets an infinitely large `OxyRect` starting at (0,0).
 */
export const OxyRect_Everything = Object.freeze(newOxyRect(0, 0, Infinity, Infinity))

export const OxyRect_Empty = Object.freeze(newOxyRect(0, 0, 0, 0))

export class OxyRectHelper {
  /**
   * Initializes a new instance of the `OxyRect` struct that is exactly large enough to contain the two specified points.
   * @param p0 The first point that the new rectangle must contain.
   * @param p1 The second point that the new rectangle must contain.
   */
  static fromScreenPoints(p0: ScreenPoint, p1: ScreenPoint) {
    return newOxyRect(Math.min(p0.x, p1.x), Math.min(p0.y, p1.y), Math.abs(p1.x - p0.x), Math.abs(p1.y - p0.y))
  }

  /**
   * Initializes a new instance of the `OxyRect` struct by location and size.
   * @param p0 The location.
   * @param size The size.
   */
  static fromScreenPointAndSize(p0: ScreenPoint, size: OxySize) {
    return newOxyRect(p0.x, p0.y, size.width, size.height)
  }

  /**
   * Gets the y-axis value of the bottom of the rectangle.
   * @value The bottom.
   */
  public static bottom(r: OxyRect): number {
    return r.top + r.height
  }

  /**
   * Gets the x-axis value of the right side of the rectangle.
   * @value The right.
   */
  public static right(r: OxyRect): number {
    return r.left + r.width
  }

  /**
   * Gets the center point of the rectangle.
   * @value The center.
   */
  public static center(r: OxyRect): ScreenPoint {
    return newScreenPoint(r.left + r.width * 0.5, r.top + r.height * 0.5)
  }

  /**
   * Gets the top left corner of the rectangle.
   * @value The top left corner.
   */
  public static topLeft(r: OxyRect): ScreenPoint {
    return newScreenPoint(r.left, r.top)
  }

  /**
   * Gets the top right corner of the rectangle.
   * @value The top right corner.
   */
  public static topRight(r: OxyRect): ScreenPoint {
    return newScreenPoint(this.right(r), r.top)
  }

  /**
   * Gets the bottom left corner of the rectangle.
   * @value The bottom left corner.
   */
  public static bottomLeft(r: OxyRect): ScreenPoint {
    return newScreenPoint(r.left, this.bottom(r))
  }

  /**
   * Gets the bottom right corner of the rectangle.
   * @value The bottom right corner.
   */
  public static bottomRight(r: OxyRect): ScreenPoint {
    return newScreenPoint(this.right(r), this.bottom(r))
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
    return newOxyRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0))
  }

  /**
   * Determines whether the specified point is inside the rectangle.
   * @returns `true` if the rectangle contains the specified point; otherwise, `false`.
   */
  public static contains(r: OxyRect, x: number, y: number): boolean {
    return x >= r.left && x <= this.right(r) && y >= r.top && y <= this.bottom(r)
  }

  /**
   * Determines whether the specified point is inside the rectangle.
   * @returns `true` if the rectangle contains the specified point; otherwise, `false`.
   */
  public static containsPoint(r: OxyRect, p: ScreenPoint): boolean {
    return this.contains(r, p.x, p.y)
  }

  public static equals(r: OxyRect, other: OxyRect): boolean {
    return r.left === other.left && r.top === other.top && r.width === other.width && r.height === other.height
  }

  /**
   * Returns a rectangle that is expanded or shrunk by the specified width and height amounts, in all directions.
   * @param r
   * @param dx The amount by which to expand or shrink the left and right sides of the rectangle.
   * @param dy The amount by which to expand or shrink the top and bottom sides of the rectangle.
   * @returns The expanded/shrunk `OxyRect`.
   */
  public static inflate(r: OxyRect, dx: number, dy: number): OxyRect {
    return newOxyRect(r.left - dx, r.top - dy, r.width + dx * 2, r.height + dy * 2)
  }

  /**
   * Returns a rectangle that is expanded by the specified thickness, in all directions.
   * @param r
   * @param t The thickness to apply to the rectangle.
   * @returns The inflated `OxyRect`.
   */
  public static inflateAll(r: OxyRect, t: OxyThickness): OxyRect {
    return newOxyRect(r.left - t.left, r.top - t.top, r.width + t.left + t.right, r.height + t.top + t.bottom)
  }

  /**
   * Intersects this `OxyRect` with another `OxyRect`.
   * @param r
   * @param rect The other `OxyRect`.
   * @returns The intersection between this `OxyRect` and the other `OxyRect`.
   * @remarks If the two rectangles don't intersect, this returns an empty `OxyRect`.
   */
  public static intersect(r: OxyRect, rect: OxyRect): OxyRect {
    const left = Math.max(r.left, rect.left)
    const top = Math.max(r.top, rect.top)
    const right = Math.min(this.right(r), this.right(rect))
    const bottom = Math.min(this.bottom(r), this.bottom(rect))

    if (right < left || bottom < top) {
      return OxyRect_Empty
    }

    return newOxyRect(left, top, right - left, bottom - top)
  }

  /**
   * Returns a rectangle that is shrunk by the specified thickness, in all directions.
   * @param r
   * @param t The thickness to apply to the rectangle.
   * @returns The deflated `OxyRect`.
   */
  public static deflate(r: OxyRect, t: OxyThickness): OxyRect {
    return newOxyRect(
      r.left + t.left,
      r.top + t.top,
      Math.max(0, r.width - t.left - t.right),
      Math.max(0, r.height - t.top - t.bottom),
    )
  }

  /**
   * Returns a rectangle that is moved by the specified horizontal and vertical amounts.
   * @param r
   * @param offsetX The amount to move the rectangle horizontally.
   * @param offsetY The amount to move the rectangle vertically.
   * @returns The moved `OxyRect`.
   */
  public static offset(r: OxyRect, offsetX: number, offsetY: number): OxyRect {
    return newOxyRect(r.left + offsetX, r.top + offsetY, r.width, r.height)
  }

  /**
   * Returns a rectangle that is clipped to the outer bounds of the specified rectangle.
   * @param r
   * @param clipRect The rectangle that defines the outermost allowed coordinates for the clipped rectangle.
   * @returns The clipped rectangle.
   */
  public static clip(r: OxyRect, clipRect: OxyRect): OxyRect {
    const clipRight =
      isNegativeInfinity(clipRect.left) && isPositiveInfinity(clipRect.width) ? this.right(clipRect) : Infinity
    const clipBottom =
      isNegativeInfinity(clipRect.top) && isPositiveInfinity(clipRect.height) ? this.bottom(clipRect) : Infinity

    return this.create(
      Math.max(Math.min(r.left, clipRight), clipRect.left),
      Math.max(Math.min(r.top, clipBottom), clipRect.top),
      Math.max(Math.min(this.right(r), clipRight), clipRect.left),
      Math.max(Math.min(this.bottom(r), clipBottom), clipRect.top),
    )
  }
}
