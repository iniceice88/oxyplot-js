import { HorizontalAlignment, VerticalAlignment } from './types'
import { newScreenVector, type ScreenVector, ScreenVectorEx } from './ScreenVector'
import { type ScreenPoint, screenPointPlus } from './ScreenPoint'
import { newOxyRect, type OxyRect } from './OxyRect'

/**
 * Describes the size of an object.
 */
export interface OxySize {
  /**
   * The height
   */
  height: number
  /**
   * The width
   */
  width: number
}

/**
 * Initializes a new OxySize object.
 * @param width The width.
 * @param height The height.
 */
export function newOxySize(width?: number, height?: number): Readonly<OxySize> {
  return Object.freeze({
    height: height || 0,
    width: width || 0,
  })
}

export const OxySize_Empty = newOxySize()

export class OxySizeEx implements OxySize {
  private _size: OxySize

  constructor(size: OxySize) {
    this._size = size
  }

  get height() {
    return this._size.height
  }

  get width() {
    return this._size.width
  }

  static from(size: OxySize) {
    return new OxySizeEx(size)
  }

  /**
   * Determines whether this instance and another specified OxySize object have the same value.
   * @returns true if the value of the other parameter is the same as the value of this instance; otherwise, false.
   */
  static equals(s: OxySize, other: OxySize): boolean {
    return s.width === other.width && s.height === other.height
  }

  /**
   * Creates a new OxySize with the maximum dimensions of this instance and the specified other instance.
   * @returns A new OxySize.
   */
  static include(s: OxySize, other: OxySize): OxySize {
    return newOxySize(Math.max(s.width, other.width), Math.max(s.height, other.height))
  }

  /**
   * Calculates the bounds with respect to rotation angle and horizontal/vertical alignment.
   * @param bounds The size of the object to calculate bounds for.
   * @param angle The rotation angle (degrees).
   * @param horizontalAlignment The horizontal alignment.
   * @param verticalAlignment The vertical alignment.
   * @returns A minimum bounding rectangle.
   */
  static getBounds(
    bounds: OxySize,
    angle: number,
    horizontalAlignment: HorizontalAlignment,
    verticalAlignment: VerticalAlignment,
  ): OxyRect {
    const u =
      horizontalAlignment === HorizontalAlignment.Left
        ? 0
        : horizontalAlignment === HorizontalAlignment.Center
          ? 0.5
          : 1
    const v = verticalAlignment === VerticalAlignment.Top ? 0 : verticalAlignment === VerticalAlignment.Middle ? 0.5 : 1

    const origin = newScreenVector(u * bounds.width, v * bounds.height)

    if (angle === 0) {
      return newOxyRect(-origin.x, -origin.y, bounds.width, bounds.height)
    }

    const p0 = ScreenVectorEx.fromXY(0, 0).minus(origin)
    const p1 = ScreenVectorEx.fromXY(bounds.width, 0).minus(origin)
    const p2 = ScreenVectorEx.fromXY(bounds.width, bounds.height).minus(origin)
    const p3 = ScreenVectorEx.fromXY(0, bounds.height).minus(origin)

    const theta = (angle * Math.PI) / 180.0
    const costh = Math.cos(theta)
    const sinth = Math.sin(theta)
    const rotate = (p: ScreenVector) => newScreenVector(costh * p.x - sinth * p.y, sinth * p.x + costh * p.y)

    const q0 = rotate(p0)
    const q1 = rotate(p1)
    const q2 = rotate(p2)
    const q3 = rotate(p3)

    const x = Math.min(Math.min(q0.x, q1.x), Math.min(q2.x, q3.x))
    const y = Math.min(Math.min(q0.y, q1.y), Math.min(q2.y, q3.y))
    const w = Math.max(Math.max(q0.x - x, q1.x - x), Math.max(q2.x - x, q3.x - x))
    const h = Math.max(Math.max(q0.y - y, q1.y - y), Math.max(q2.y - y, q3.y - y))

    return newOxyRect(x, y, w, h)
  }

  /**
   * Gets the polygon outline of the specified rotated and aligned box.
   * @param size The size of the box.
   * @param origin The origin of the box.
   * @param angle The rotation angle of the box.
   * @param horizontalAlignment The horizontal alignment of the box.
   * @param verticalAlignment The vertical alignment of the box.
   * @returns A sequence of points defining the polygon outline of the box.
   */
  static getPolygon(
    size: OxySize,
    origin: ScreenPoint,
    angle: number,
    horizontalAlignment: HorizontalAlignment,
    verticalAlignment: VerticalAlignment,
  ): ScreenPoint[] {
    const u =
      horizontalAlignment === HorizontalAlignment.Left
        ? 0
        : horizontalAlignment === HorizontalAlignment.Center
          ? 0.5
          : 1
    const v = verticalAlignment === VerticalAlignment.Top ? 0 : verticalAlignment === VerticalAlignment.Middle ? 0.5 : 1

    const offset = newScreenVector(u * size.width, v * size.height)

    // the corners of the rectangle
    let p0 = ScreenVectorEx.fromXY(0, 0).minus(offset)
    let p1 = ScreenVectorEx.fromXY(size.width, 0).minus(offset)
    let p2 = ScreenVectorEx.fromXY(size.width, size.height).minus(offset)
    let p3 = ScreenVectorEx.fromXY(0, size.height).minus(offset)

    if (angle !== 0) {
      const theta = (angle * Math.PI) / 180.0
      const costh = Math.cos(theta)
      const sinth = Math.sin(theta)
      const rotate = (p: ScreenVector) => ScreenVectorEx.fromXY(costh * p.x - sinth * p.y, sinth * p.x + costh * p.y)

      p0 = rotate(p0)
      p1 = rotate(p1)
      p2 = rotate(p2)
      p3 = rotate(p3)
    }

    return [
      screenPointPlus(origin, p0),
      screenPointPlus(origin, p1),
      screenPointPlus(origin, p2),
      screenPointPlus(origin, p3),
    ]
  }
}
