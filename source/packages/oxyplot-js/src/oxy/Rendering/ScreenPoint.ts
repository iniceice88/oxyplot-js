import { ScreenVector } from '@/oxyplot'

/**
 * Represents a point defined in screen space.
 *
 * @remarks The rendering methods transforms `DataPoint`s to `ScreenPoint`s.
 */
export interface ScreenPoint {
  /**
   * The x-coordinate.
   */
  x: number
  /**
   * The y-coordinate.
   */
  y: number
}

/**
 * The undefined point.
 */
export const ScreenPoint_Undefined = Object.freeze({ x: NaN, y: NaN }) as ScreenPoint

/**
 * The left-top point.
 */
export const ScreenPoint_LeftTop = Object.freeze({ x: 0, y: 0 }) as ScreenPoint

export function newScreenPoint(x: number, y: number): ScreenPoint {
  return { x, y }
}

/**
 * Translates a ScreenPoint by a ScreenVector.
 * @returns The translated point.
 */
export function screenPointPlus(p1: ScreenPoint, p2: ScreenVector): ScreenPoint {
  return newScreenPoint(p1.x + p2.x, p1.y + p2.y)
}

/**
 * Subtracts a ScreenPoint from a ScreenPoint
 * and returns the result as a ScreenVector.
 * @returns A ScreenVector structure that represents the difference between p1 and p2.
 */
export function screenPointMinus(p1: ScreenPoint, p2: ScreenPoint): ScreenVector {
  return new ScreenVector(p1.x - p2.x, p1.y - p2.y)
}

/**
 * Subtracts a ScreenVector from a ScreenPoint
 * and returns the result as a ScreenPoint.
 * @returns A ScreenPoint that represents point translated by the negative vector.
 */
export function screenPointMinusVector(point: ScreenPoint, vector: ScreenVector): ScreenPoint {
  return newScreenPoint(point.x - vector.x, point.y - vector.y)
}

/**
 * Gets the distance to the specified point.
 * @returns The distance.
 */
export function screenPointDistanceTo(point: ScreenPoint, other: ScreenPoint): number {
  const dx = other.x - point.x
  const dy = other.y - point.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Gets the squared distance to the specified point.
 * @returns The squared distance.
 */
export function screenPointDistanceToSquared(point: ScreenPoint, other: ScreenPoint): number {
  const dx = other.x - point.x
  const dy = other.y - point.y
  return dx * dx + dy * dy
}

/**
 * Determines whether the specified point is undefined.
 * @returns `true` if the specified point is undefined; otherwise, `false`.
 */
export function ScreenPoint_isUndefined(point: ScreenPoint): boolean {
  return isNaN(point.x) && isNaN(point.y)
}

/**
 * Determines whether this instance and another specified `ScreenPoint` object have the same value.
 * @returns `true` if the value of the `other` parameter is the same as the value of this instance; otherwise, `false`.
 */
export function screenPointEquals(a: ScreenPoint, b: ScreenPoint): boolean {
  return a.x === b.x && a.y === b.y
}
