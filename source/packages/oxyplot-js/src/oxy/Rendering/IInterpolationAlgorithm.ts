import { DataPoint, ScreenPoint } from '@/oxyplot'

/**
 * Defines an interpolation algorithm.
 */
export interface IInterpolationAlgorithm {
  /**
   * Creates a spline from data points.
   * @param points Data points.
   * @param isClosed True if the spline is closed.
   * @param tolerance The tolerance.
   * @returns Spline.
   */
  createSplineDp(points: DataPoint[], isClosed: boolean, tolerance: number): DataPoint[]

  /**
   * Creates a spline from points in screen space.
   * @param points Resampled points.
   * @param isClosed True if the spline is closed.
   * @param tolerance The tolerance.
   * @returns Spline.
   */
  createSplineSp(points: ScreenPoint[], isClosed: boolean, tolerance: number): ScreenPoint[]
}
