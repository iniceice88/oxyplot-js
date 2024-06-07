import type { ScreenPoint } from '@/oxyplot'

/**
 * Represents arguments for the hit test.
 */
export interface HitTestArguments {
  /**
   * The point to hit test.
   */
  readonly point: ScreenPoint

  /**
   * The hit test tolerance.
   */
  readonly tolerance: number
}

/**
 * Initializes a new instance of the `HitTestArguments` class.
 * @param point The point to hit test.
 * @param tolerance The hit test tolerance.
 */
export function newHitTestArguments(point: ScreenPoint, tolerance: number): HitTestArguments {
  return {
    point,
    tolerance,
  }
}
