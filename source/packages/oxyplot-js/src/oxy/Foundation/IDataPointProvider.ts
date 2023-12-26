import type { DataPoint } from '@/oxyplot'

/**
 * Specifies functionality to provide a DataPoint.
 */
export interface IDataPointProvider {
  /**
   * Gets the DataPoint that represents the element.
   * @returns A DataPoint.
   */
  getDataPoint(): DataPoint
}

export function isDataPointProvider(obj: any): obj is IDataPointProvider {
  return obj.getDataPoint && typeof obj.getDataPoint === 'function'
}
