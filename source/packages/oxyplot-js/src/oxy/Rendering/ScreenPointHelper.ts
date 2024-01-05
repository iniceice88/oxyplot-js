import {
  newScreenPoint,
  ScreenPoint,
  ScreenPoint_isUndefined,
  ScreenPoint_LeftTop,
  screenPointDistanceToSquared,
  screenPointMinus,
} from '@/oxyplot'
import { Number_MAX_VALUE } from '@/patch'

/**
 * Provides algorithms for polygons and lines of ScreenPoint.
 */
export class ScreenPointHelper {
  /**
   * Finds the nearest point on the specified polyline.
   * @param point The point.
   * @param points The points.
   * @returns The nearest point.
   * @throws Error if points is null.
   */
  public static findNearestPointOnPolyline(point: ScreenPoint, points: ScreenPoint[]): ScreenPoint {
    if (!points) {
      throw new Error('points is null')
    }

    let minimumDistance = Number_MAX_VALUE
    let nearestPoint = ScreenPoint_LeftTop

    for (let i = 0; i + 1 < points.length; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      if (ScreenPoint_isUndefined(p1) || ScreenPoint_isUndefined(p2)) {
        continue
      }

      // Find the nearest point on the line segment.
      const nearestPointOnSegment = ScreenPointHelper.findPointOnLine(point, p1, p2)

      if (ScreenPoint_isUndefined(nearestPointOnSegment)) {
        continue
      }

      const l2 = screenPointMinus(point, nearestPointOnSegment).lengthSquared

      if (l2 < minimumDistance) {
        nearestPoint = nearestPointOnSegment
        minimumDistance = l2
      }
    }

    return nearestPoint
  }

  /**
   * Finds the point on line.
   * @param p The point.
   * @param p1 The first point on the line.
   * @param p2 The second point on the line.
   * @returns The nearest point on the line.
   * @remakes http://paulbourke.net/geometry/pointlineplane/
   */
  public static findPointOnLine(p: ScreenPoint, p1: ScreenPoint, p2: ScreenPoint): ScreenPoint {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    let u = ScreenPointHelper.findPositionOnLine(p, p1, p2)

    if (isNaN(u)) {
      u = 0
    }

    if (u < 0) {
      u = 0
    }

    if (u > 1) {
      u = 1
    }

    return newScreenPoint(p1.x + u * dx, p1.y + u * dy)
  }

  /**
   * Finds the nearest point on line.
   * @param p The point.
   * @param p1 The start point on the line.
   * @param p2 The end point on the line.
   * @returns The relative position of the nearest point.
   * @remakes http://paulbourke.net/geometry/pointlineplane/
   */
  public static findPositionOnLine(p: ScreenPoint, p1: ScreenPoint, p2: ScreenPoint): number {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const u1 = (p.x - p1.x) * dx + (p.y - p1.y) * dy
    const u2 = dx * dx + dy * dy

    if (u2 < 1e-6) {
      return NaN
    }

    return u1 / u2
  }

  /**
   * Determines whether the specified point is in the specified polygon.
   * @param p The point.
   * @param pts The polygon points.
   * @returns true if the point is in the polygon; otherwise, false.
   */
  public static isPointInPolygon(p: ScreenPoint, pts: ScreenPoint[]): boolean {
    if (!pts) {
      return false
    }

    const nvert = pts.length
    let c = false
    for (let i = 0, j = nvert - 1; i < nvert; j = i++) {
      if (
        pts[i].y > p.y !== pts[j].y > p.y &&
        p.x < (pts[j].x - pts[i].x) * ((p.y - pts[i].y) / (pts[j].y - pts[i].y)) + pts[i].x
      ) {
        c = !c
      }
    }

    return c
  }

  /**
   * Resamples the points with the specified point distance limit.
   * @param allPoints All points.
   * @param minimumDistance The minimum squared distance.
   * @returns List of resampled points.
   */
  public static resamplePoints(allPoints: ScreenPoint[], minimumDistance: number): ScreenPoint[] {
    const minimumSquaredDistance = minimumDistance * minimumDistance
    const n = allPoints.length
    const result: ScreenPoint[] = []
    if (n > 0) {
      result.push(allPoints[0])
      let i0 = 0
      for (let i = 1; i < n; i++) {
        const distSquared = screenPointDistanceToSquared(allPoints[i0], allPoints[i])
        if (distSquared < minimumSquaredDistance && i !== n - 1) {
          continue
        }

        i0 = i
        result.push(allPoints[i])
      }
    }

    return result
  }

  /**
   * Gets the centroid of the specified polygon.
   * @param points The points.
   * @returns The centroid.
   */
  public static getCentroid(points: ScreenPoint[]): ScreenPoint {
    let cx = 0
    let cy = 0
    let a = 0

    for (let i = 0; i < points.length; i++) {
      const i1 = (i + 1) % points.length
      const da = points[i].x * points[i1].y - points[i1].x * points[i].y
      cx += (points[i].x + points[i1].x) * da
      cy += (points[i].y + points[i1].y) * da
      a += da
    }

    a *= 0.5
    cx /= 6 * a
    cy /= 6 * a
    return newScreenPoint(cx, cy)
  }
}
