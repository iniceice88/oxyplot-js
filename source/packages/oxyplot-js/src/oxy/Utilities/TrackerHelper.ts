import { ScreenPoint, Series, TrackerHitResult } from '@/oxyplot'

/**
 * Provides helper methods for tracker functionality.
 */
export class TrackerHelper {
  /**
   * Gets the nearest tracker hit.
   * @param series The series.
   * @param point The point.
   * @param snap Snap to points.
   * @param pointsOnly Check points only (no interpolation).
   * @param firesDistance The distance from the series at which the tracker fires.
   * @param checkDistanceBetweenPoints The value indicating whether to check distance when showing tracker between data points.
   * @returns A tracker hit result.
   */
  public static getNearestHit(
    series: Series,
    point: ScreenPoint,
    snap: boolean,
    pointsOnly: boolean,
    firesDistance: number,
    checkDistanceBetweenPoints: boolean,
  ): TrackerHitResult | undefined {
    if (!series) {
      return undefined
    }

    // Check data points only
    if (snap || pointsOnly) {
      const result = series.getNearestPoint(point, false)
      if (this.shouldTrackerOpen(result, point, firesDistance)) {
        return result
      }
    }

    // Check between data points (if possible)
    if (!pointsOnly) {
      const result = series.getNearestPoint(point, true)
      if (!checkDistanceBetweenPoints || this.shouldTrackerOpen(result, point, firesDistance)) {
        return result
      }
    }

    return undefined
  }

  private static shouldTrackerOpen(
    result: TrackerHitResult | undefined,
    point: ScreenPoint,
    firesDistance: number,
  ): boolean {
    if (!result?.position) return false
    return result.position.distanceTo(point) < firesDistance
  }
}
