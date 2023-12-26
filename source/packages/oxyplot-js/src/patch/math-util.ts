import { isNullOrUndef } from './object-util'

// Note:JavaScript Number.MIN_VALUE = 5E-324 > 0
export const Number_MIN_VALUE = -1.7976931348623157e308
export const Number_MAX_VALUE = Number.MAX_VALUE

export function round(number: number, precision: number) {
  if (precision < 0) {
    const factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  }
  return +(Math.round(Number(number + 'e+' + precision)) + 'e-' + precision)
}

export function isInfinity(number: number) {
  return !isFinite(number)
}

export function isNegativeInfinity(number: number) {
  return number === Number.NEGATIVE_INFINITY
}

export function isPositiveInfinity(number: number) {
  return number === Number.POSITIVE_INFINITY
}

export function toUint(n: number) {
  if (n >= 0) {
    return n
  }
  return n >>> 0
}

export function log(a: number, newBase: number): number {
  if (isNaN(a)) {
    return a
  }

  if (isNaN(newBase)) {
    return newBase
  }

  if (newBase === 1.0) {
    return NaN
  }

  if (a !== 1.0 && (newBase === 0.0 || Number.POSITIVE_INFINITY === newBase)) {
    return NaN
  }

  return Math.log(a) / Math.log(newBase)
}

export function pettyNumber(n: number, precision: number): string {
  let str
  if (n >= 1_000_000 || n <= -1_000_000) str = n.toExponential(precision)
  else str = n.toString()

  if (str.includes('e')) {
    const exp = Number(str.split('e')[0])
    return round(exp, precision).toString() + 'e' + str.split('e')[1]
  }

  return round(n, precision).toString()
}

export function toPercent(n: number, precision: number = 1): string {
  if (isNullOrUndef(n)) return ''
  if (isNaN(n)) return 'NaN'
  return round(n * 100, precision) + '%'
}

export function assertInteger(n: number, filedName?: string) {
  if (Math.round(n) !== n) {
    throw new Error(`${filedName || 'number'} must be an integer.`)
  }
}
