import type { DataPoint, IInterpolationAlgorithm, ScreenPoint } from '@/oxyplot'
import { newDataPoint, newScreenPoint, screenPointEquals } from '@/oxyplot'

/**
 * Provides functionality to interpolate a list of points by a Centripetal Catmull–Rom spline.
 * Based on CanonicalSplineHelper.cs (c) 2009 by Charles Petzold (WPF and Silverlight)
 * http://www.charlespetzold.com/blog/2009/01/Canonical-Splines-in-WPF-and-Silverlight.html
 */
export class CatmullRomSpline implements IInterpolationAlgorithm {
  /**
   * The alpha value.
   */
  public alpha: number

  /**
   * The maximum number of segments.
   */
  public maxSegments: number

  /**
   * Initializes a new instance of the CatmullRomSpline class.
   * @param alpha The alpha.
   */
  constructor(alpha: number) {
    this.alpha = alpha
    this.maxSegments = 100
  }

  /**
   * Creates a spline from data points.
   * @param points Data points.
   * @param isClosed True if the spline is closed.
   * @param tolerance The tolerance.
   * @returns Spline.
   */
  createSplineDp(points: DataPoint[], isClosed: boolean, tolerance: number): DataPoint[] {
    return CatmullRomSpline.createSplineForDp(points, this.alpha, isClosed, tolerance, this.maxSegments)
  }

  /**
   * Creates a spline from points in screen space.
   * @param points Resampled points.
   * @param isClosed True if the spline is closed.
   * @param tolerance The tolerance.
   * @returns Spline.
   */
  createSplineSp(points: ScreenPoint[], isClosed: boolean, tolerance: number): ScreenPoint[] {
    return CatmullRomSpline.createSpline(points, this.alpha, isClosed, tolerance, this.maxSegments)
  }

  /**
   * Creates a spline of data points.
   * @param points The points.
   * @param alpha The alpha.
   * @param isClosed True if the spline is closed.
   * @param tolerance The tolerance.
   * @param maxSegments The maximum number of segments.
   * @returns A list of data points.
   */
  private static createSplineForDp(
    points: DataPoint[],
    alpha: number,
    isClosed: boolean,
    tolerance: number,
    maxSegments: number,
  ): DataPoint[] {
    const screenPoints: ScreenPoint[] = points.map((p) => newScreenPoint(p.x, p.y))
    const interpolatedScreenPoints: ScreenPoint[] = this.createSpline(
      screenPoints,
      alpha,
      isClosed,
      tolerance,
      maxSegments,
    )
    const interpolatedDataPoints: DataPoint[] = []

    for (const s of interpolatedScreenPoints) {
      interpolatedDataPoints.push(newDataPoint(s.x, s.y))
    }

    return interpolatedDataPoints
  }

  /**
   * Creates a spline of screen points.
   * @param points The points.
   * @param alpha The alpha.
   * @param isClosed True if the spline is closed.
   * @param tolerance The tolerance.
   * @param maxSegments The maximum number of segments.
   * @returns A list of screen points.
   */
  static createSpline(
    points: ScreenPoint[],
    alpha: number,
    isClosed: boolean,
    tolerance: number,
    maxSegments: number,
  ): ScreenPoint[] {
    const result: ScreenPoint[] = []
    if (points === undefined) {
      return result
    }

    const n = points.length
    if (n < 1) {
      return result
    }

    if (n < 2) {
      result.push(...points)
      return result
    }

    if (n === 2) {
      if (!isClosed) {
        this.segment(result, points[0], points[0], points[1], points[1], alpha, tolerance, maxSegments)
      } else {
        this.segment(result, points[1], points[0], points[1], points[0], alpha, tolerance, maxSegments)
        this.segment(result, points[0], points[1], points[0], points[1], alpha, tolerance, maxSegments)
      }
    } else {
      for (let i = 0; i < n; i++) {
        if (i === 0) {
          this.segment(
            result,
            isClosed ? points[n - 1] : points[0],
            points[0],
            points[1],
            points[2],
            alpha,
            tolerance,
            maxSegments,
          )
        } else if (i === n - 2) {
          this.segment(
            result,
            points[i - 1],
            points[i],
            points[i + 1],
            isClosed ? points[0] : points[i + 1],
            alpha,
            tolerance,
            maxSegments,
          )
        } else if (i === n - 1) {
          if (isClosed) {
            this.segment(result, points[i - 1], points[i], points[0], points[1], alpha, tolerance, maxSegments)
          }
        } else {
          this.segment(result, points[i - 1], points[i], points[i + 1], points[i + 2], alpha, tolerance, maxSegments)
        }
      }
    }

    return result
  }

  /**
   * The segment.
   * @private
   */
  private static segment(
    points: ScreenPoint[],
    pt0: ScreenPoint,
    pt1: ScreenPoint,
    pt2: ScreenPoint,
    pt3: ScreenPoint,
    alpha: number,
    tolerance: number,
    maxSegments: number,
  ): void {
    if (screenPointEquals(pt1, pt2)) {
      points.push(pt1)
      return
    }

    if (screenPointEquals(pt0, pt1)) {
      pt0 = this.prev(pt1, pt2)
    }

    if (screenPointEquals(pt2, pt3)) {
      pt3 = this.prev(pt2, pt1)
    }

    const t0 = 0
    const t1 = this.getT(t0, pt0, pt1, alpha)
    const t2 = this.getT(t1, pt1, pt2, alpha)
    const t3 = this.getT(t2, pt2, pt3, alpha)

    let iterations = Math.round((Math.abs(pt1.x - pt2.x) + Math.abs(pt1.y - pt2.y)) / tolerance)
    iterations = Math.max(0, iterations)
    iterations = Math.min(maxSegments, iterations)
    for (let t = t1; t < t2; t += (t2 - t1) / iterations) {
      const a1 = this.sum(this.mult((t1 - t) / (t1 - t0), pt0), this.mult((t - t0) / (t1 - t0), pt1))
      const a2 = this.sum(this.mult((t2 - t) / (t2 - t1), pt1), this.mult((t - t1) / (t2 - t1), pt2))
      const a3 = this.sum(this.mult((t3 - t) / (t3 - t2), pt2), this.mult((t - t2) / (t3 - t2), pt3))

      const b1 = this.sum(this.mult((t2 - t) / (t2 - t0), a1), this.mult((t - t0) / (t2 - t0), a2))
      const b2 = this.sum(this.mult((t3 - t) / (t3 - t1), a2), this.mult((t - t1) / (t3 - t1), a3))

      const c1 = this.sum(this.mult((t2 - t) / (t2 - t1), b1), this.mult((t - t1) / (t2 - t1), b2))
      points.push(c1)
    }
  }

  private static getT(t: number, p0: ScreenPoint, p1: ScreenPoint, alpha: number): number {
    const a = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)
    const b = Math.sqrt(a)
    const c = Math.pow(b, alpha)
    return c + t
  }

  private static mult(d: number, s: ScreenPoint): ScreenPoint {
    return newScreenPoint(s.x * d, s.y * d)
  }

  private static equals(a: ScreenPoint, b: ScreenPoint): boolean {
    return a.x === b.x && a.y === b.y
  }

  private static prev(s0: ScreenPoint, s1: ScreenPoint): ScreenPoint {
    return newScreenPoint(s0.x - 0.0001 * (s1.x - s0.x), s0.y - 0.0001 * (s1.y - s0.y))
  }

  private static sum(a: ScreenPoint, b: ScreenPoint): ScreenPoint {
    return newScreenPoint(a.x + b.x, a.y + b.y)
  }
}
