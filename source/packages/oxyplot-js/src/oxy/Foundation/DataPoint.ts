import { type DataVector, DataVectorEx } from '@/oxyplot'

/**
 * Represents a point in the data space.
 * DataPoints are transformed to ScreenPoints.
 */
export interface DataPoint {
  /**
   * The x-coordinate.
   */
  x: number
  /**
   * The y-coordinate.
   */
  y: number
}

export class DataPointEx implements DataPoint {
  private readonly _x: number
  private readonly _y: number

  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }

  static from(dp: DataPoint) {
    return new DataPointEx(dp.x, dp.y)
  }

  get x() {
    return this._x
  }

  get y() {
    return this._y
  }

  /**
   * Subtracts a DataPoint from a DataPoint
   * and returns the result as a DataVector.
   * @returns A DataVector structure that represents the difference between p1 and p2.
   */
  minus(other: DataPoint) {
    return dataPointMinus(this, other)
  }

  /**
   * Subtracts a DataVector from a DataPoint
   * and returns the result as a DataPoint.
   * @returns A DataPoint that represents point translated by the negative vector.
   */
  minusVector(v: DataVector) {
    return dataPointMinusVector(this, v)
  }

  /**
   * Translates a DataPoint by a DataVector.
   * @returns The translated point.
   */
  plus(other: DataPoint) {
    return dataPointPlus(this, other)
  }
}

/**
 * The undefined.
 */
export const DataPoint_Undefined = Object.freeze({ x: NaN, y: NaN }) as DataPoint

/**
 * The zero point.
 */
export const DataPoint_Zero = Object.freeze({ x: 0, y: 0 }) as DataPoint

export function DataPoint_isUnDefined(p: DataPoint): boolean {
  return isNaN(p.x) && isNaN(p.y)
}

/**
 * Determines whether this point is defined.
 * @returns true if this point is defined; otherwise, false.
 */
export function DataPoint_isDefined(p: DataPoint): boolean {
  return !DataPoint_isUnDefined(p)
}

export function newDataPoint(x: number, y: number): DataPoint {
  return { x, y }
}

export function isDataPoint(d: any) {
  return d && typeof d.x === 'number' && typeof d.y === 'number'
}

/**
 * Subtracts a DataPoint from a DataPoint
 * and returns the result as a DataVector.
 * @returns A DataVector structure that represents the difference between p1 and p2.
 */
export function dataPointMinus(p1: DataPoint, p2: DataPoint): DataVectorEx {
  return new DataVectorEx(p1.x - p2.x, p1.y - p2.y)
}

/**
 * Subtracts a DataVector from a DataPoint
 * and returns the result as a DataPoint.
 * @returns A DataPoint that represents point translated by the negative vector.
 */
export function dataPointMinusVector(p1: DataPoint, v: DataVector): DataPoint {
  return newDataPoint(p1.x - v.x, p1.y - v.y)
}

/**
 * Translates a DataPoint by a DataVector.
 * @returns The translated point.
 */
export function dataPointPlus(p1: DataPoint, p2: DataPoint): DataPoint {
  return newDataPoint(p1.x + p2.x, p1.y + p2.y)
}

/**
 * Determines whether this and another specified DataPoint have the same value.
 * @returns true if the value of the other parameter is the same as the value of this instance; otherwise, false.
 */
export function dataPointEquals(p1: DataPoint, p2: DataPoint): boolean {
  return p1.x === p2.x && p1.y === p2.y
}
