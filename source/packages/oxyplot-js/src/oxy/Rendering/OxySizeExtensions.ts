import { HorizontalAlignment, OxyRect, OxySize, ScreenPoint, ScreenVector, VerticalAlignment } from '@/oxyplot'

declare module './OxySize' {
  interface OxySize {
    getBounds(angle: number, horizontalAlignment: HorizontalAlignment, verticalAlignment: VerticalAlignment): OxyRect
  }
}

OxySize.prototype.getBounds = function (
  angle: number,
  horizontalAlignment: HorizontalAlignment,
  verticalAlignment: VerticalAlignment,
) {
  return OxySizeExtensions.getBounds(this, angle, horizontalAlignment, verticalAlignment)
}

/**
 * Provides extension methods for OxySize
 */
export class OxySizeExtensions {
  /**
   * Calculates the bounds with respect to rotation angle and horizontal/vertical alignment.
   * @param bounds The size of the object to calculate bounds for.
   * @param angle The rotation angle (degrees).
   * @param horizontalAlignment The horizontal alignment.
   * @param verticalAlignment The vertical alignment.
   * @returns A minimum bounding rectangle.
   */
  public static getBounds(
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

    const origin = new ScreenVector(u * bounds.width, v * bounds.height)

    if (angle === 0) {
      return new OxyRect(-origin.x, -origin.y, bounds.width, bounds.height)
    }

    const p0 = new ScreenVector(0, 0).minus(origin)
    const p1 = new ScreenVector(bounds.width, 0).minus(origin)
    const p2 = new ScreenVector(bounds.width, bounds.height).minus(origin)
    const p3 = new ScreenVector(0, bounds.height).minus(origin)

    const theta = (angle * Math.PI) / 180.0
    const costh = Math.cos(theta)
    const sinth = Math.sin(theta)
    const rotate = (p: ScreenVector) => new ScreenVector(costh * p.x - sinth * p.y, sinth * p.x + costh * p.y)

    const q0 = rotate(p0)
    const q1 = rotate(p1)
    const q2 = rotate(p2)
    const q3 = rotate(p3)

    const x = Math.min(Math.min(q0.x, q1.x), Math.min(q2.x, q3.x))
    const y = Math.min(Math.min(q0.y, q1.y), Math.min(q2.y, q3.y))
    const w = Math.max(Math.max(q0.x - x, q1.x - x), Math.max(q2.x - x, q3.x - x))
    const h = Math.max(Math.max(q0.y - y, q1.y - y), Math.max(q2.y - y, q3.y - y))

    return new OxyRect(x, y, w, h)
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
  public static getPolygon(
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

    const offset = new ScreenVector(u * size.width, v * size.height)

    // the corners of the rectangle
    let p0 = new ScreenVector(0, 0).minus(offset)
    let p1 = new ScreenVector(size.width, 0).minus(offset)
    let p2 = new ScreenVector(size.width, size.height).minus(offset)
    let p3 = new ScreenVector(0, size.height).minus(offset)

    if (angle !== 0) {
      const theta = (angle * Math.PI) / 180.0
      const costh = Math.cos(theta)
      const sinth = Math.sin(theta)
      const rotate = (p: ScreenVector) => new ScreenVector(costh * p.x - sinth * p.y, sinth * p.x + costh * p.y)

      p0 = rotate(p0)
      p1 = rotate(p1)
      p2 = rotate(p2)
      p3 = rotate(p3)
    }

    return [origin.plus(p0), origin.plus(p1), origin.plus(p2), origin.plus(p3)]
  }
}
