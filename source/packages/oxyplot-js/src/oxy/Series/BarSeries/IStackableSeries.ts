/**
 * Defines properties for stacked series.
 */
import { type IBarSeries } from './IBarSeries'
import { isUndef } from '@/patch'

export interface IStackableSeries extends IBarSeries {
  /**
   * Gets a value indicating whether this series is stacked.
   */
  readonly isStacked: boolean

  /**
   * Gets a value indicating whether this series should overlap its stack when isStacked is true.
   */
  readonly overlapsStack: boolean

  /**
   * Gets the stack group.
   */
  readonly stackGroup: string
}

export function isStackableSeries(obj: any): obj is IStackableSeries {
  return (
    obj &&
    !isUndef(obj.isStacked) &&
    typeof obj.isStacked === 'boolean' &&
    !isUndef(obj.stackGroup) &&
    typeof obj.stackGroup === 'string'
  )
}
