import type { ScreenPoint } from '@/oxyplot'

/**
 * Represents arguments for the hit test.
 */
export class HitTestArguments {
  /**
   * The point to hit test.
   */
  public readonly point: ScreenPoint

  /**
   * The hit test tolerance.
   */
  public readonly tolerance: number

  /**
   * Initializes a new instance of the `HitTestArguments` class.
   * @param point The point to hit test.
   * @param tolerance The hit test tolerance.
   */
  constructor(point: ScreenPoint, tolerance: number) {
    this.point = point
    this.tolerance = tolerance
  }
}
