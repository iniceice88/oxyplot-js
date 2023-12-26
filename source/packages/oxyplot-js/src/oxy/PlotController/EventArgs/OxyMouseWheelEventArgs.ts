import type { OxyMouseEventArgs } from '@/oxyplot'

export interface OxyMouseWheelEventArgs extends OxyMouseEventArgs {
  /**
   * Gets or sets the change.
   */
  delta: number
}
