import { DataPoint, type IInterpolationAlgorithm, ScreenPoint } from '@/oxyplot'

/**
 * Provides functionality to interpolate a list of points by a canonical spline.
 * Based on CanonicalSplineHelper.cs (c) 2009 by Charles Petzold (WPF and Silverlight)
 * http://www.charlespetzold.com/blog/2009/01/Canonical-Splines-in-WPF-and-Silverlight.html
 */
export class CanonicalSpline implements IInterpolationAlgorithm {
  /**
   * The tension.
   */
  public tension: number

  /**
   * Initializes a new instance of the CanonicalSpline class.
   * @param tension The tension.
   */
  constructor(tension: number) {
    this.tension = tension
  }

  /**
   * Creates a spline of data points.
   * @param points The points.
   * @param isClosed True if the spline is closed.
   * @param tolerance The tolerance.
   * @returns A list of data points.
   */
  public createSplineDp(points: DataPoint[], isClosed: boolean, tolerance: number): DataPoint[] {
    return CanonicalSpline.createSplineForDp(points, this.tension, undefined, isClosed, tolerance)
  }

  /**
   * Creates a spline of screen points.
   * @param points The points.
   * @param isClosed True if the spline is closed.
   * @param tolerance The tolerance.
   * @returns A list of screen points.
   */
  public createSplineSp(points: ScreenPoint[], isClosed: boolean, tolerance: number): ScreenPoint[] {
    return CanonicalSpline.createSpline(points, this.tension, undefined, isClosed, tolerance)
  }

  private static createSplineForDp(
    points: DataPoint[],
    tension: number,
    tensions: number[] | undefined,
    isClosed: boolean,
    tolerance: number,
  ): DataPoint[] {
    const screenPoints = points.map((p) => new ScreenPoint(p.x, p.y))
    const interpolatedScreenPoints = CanonicalSpline.createSpline(screenPoints, tension, tensions, isClosed, tolerance)
    const interpolatedDataPoints: DataPoint[] = []

    for (const s of interpolatedScreenPoints) {
      interpolatedDataPoints.push(new DataPoint(s.x, s.y))
    }

    return interpolatedDataPoints
  }

  private static createSpline(
    points: ScreenPoint[],
    tension: number,
    tensions: number[] | undefined,
    isClosed: boolean,
    tolerance: number,
  ): ScreenPoint[] {
    const result: ScreenPoint[] = []
    if (!points) {
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
        CanonicalSpline.segment(result, points[0], points[0], points[1], points[1], tension, tension, tolerance)
      } else {
        CanonicalSpline.segment(result, points[1], points[0], points[1], points[0], tension, tension, tolerance)
        CanonicalSpline.segment(result, points[0], points[1], points[0], points[1], tension, tension, tolerance)
      }
    } else {
      const useTensionCollection = tensions && tensions.length > 0

      for (let i = 0; i < n; i++) {
        const t1 = useTensionCollection ? tensions[i % tensions.length] : tension
        const t2 = useTensionCollection ? tensions[(i + 1) % tensions.length] : tension

        if (i === 0) {
          CanonicalSpline.segment(
            result,
            isClosed ? points[n - 1] : points[0],
            points[0],
            points[1],
            points[2],
            t1,
            t2,
            tolerance,
          )
        } else if (i === n - 2) {
          CanonicalSpline.segment(
            result,
            points[i - 1],
            points[i],
            points[i + 1],
            isClosed ? points[0] : points[i + 1],
            t1,
            t2,
            tolerance,
          )
        } else if (i === n - 1) {
          if (isClosed) {
            CanonicalSpline.segment(result, points[i - 1], points[i], points[0], points[1], t1, t2, tolerance)
          }
        } else {
          CanonicalSpline.segment(result, points[i - 1], points[i], points[i + 1], points[i + 2], t1, t2, tolerance)
        }
      }
    }

    return result
  }

  private static segment(
    points: ScreenPoint[],
    pt0: ScreenPoint,
    pt1: ScreenPoint,
    pt2: ScreenPoint,
    pt3: ScreenPoint,
    t1: number,
    t2: number,
    tolerance: number,
    maxSegments: number = 1000,
  ): void {
    const sx1 = t1 * (pt2.x - pt0.x)
    const sy1 = t1 * (pt2.y - pt0.y)
    const sx2 = t2 * (pt3.x - pt1.x)
    const sy2 = t2 * (pt3.y - pt1.y)

    const ax = sx1 + sx2 + 2 * pt1.x - 2 * pt2.x
    const ay = sy1 + sy2 + 2 * pt1.y - 2 * pt2.y
    const bx = -2 * sx1 - sx2 - 3 * pt1.x + 3 * pt2.x
    const by = -2 * sy1 - sy2 - 3 * pt1.y + 3 * pt2.y

    const cx = sx1
    const cy = sy1
    const dx = pt1.x
    const dy = pt1.y

    const num = Math.min(maxSegments, Math.round((Math.abs(pt1.x - pt2.x) + Math.abs(pt1.y - pt2.y)) / tolerance))

    for (let i = 1; i < num; i++) {
      const t = i / (num - 1)
      const pt = new ScreenPoint(ax * t * t * t + bx * t * t + cx * t + dx, ay * t * t * t + by * t * t + cy * t + dy)
      points.push(pt)
    }
  }
}
