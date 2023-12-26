import { AxisChangeTypes } from '@/oxyplot'

/**
 * Provides additional data for the AxisChanged event.
 */
export interface AxisChangedEventArgs {
  /**
   * The type of the change.
   */
  changeType: AxisChangeTypes

  /**
   * The delta for the minimum.
   */
  deltaMinimum: number

  /**
   * The delta for the maximum.
   */
  deltaMaximum: number
}
