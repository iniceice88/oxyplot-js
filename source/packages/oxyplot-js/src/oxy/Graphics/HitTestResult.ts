import type { ScreenPoint } from '@/oxyplot'
import { Element } from '@/oxyplot'

/**
 * Represents a hit test result.
 */
export interface HitTestResult {
  /**
   * the element that was hit.
   */
  readonly element: Element
  /**
   * the position of the nearest hit point.
   */
  readonly nearestHitPoint: ScreenPoint
  /**
   * the item of the hit (if available).
   */
  readonly item?: any
  /**
   * the index of the hit (if available).
   * If the hit was in the middle between point 1 and 2, index = 1.5.
   */
  readonly index?: number
}
