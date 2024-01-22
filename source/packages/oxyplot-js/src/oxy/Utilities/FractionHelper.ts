import type { AxisStringFormatterType } from '@/oxyplot'

/**
 * Provides functionality to generate fraction strings from double values.
 * Examples: "3/4", "PI/2"
 */
export class FractionHelper {
  /**
   * Converts a double to a fraction string.
   * @param value The value.
   * @param unit The unit.
   * @param unitSymbol The unit symbol.
   * @param eps The tolerance.
   * @param formatter The formatter.
   * @returns The convert to fraction string.
   */
  public static convertToFractionString(
    value: number,
    unit: number = 1,
    unitSymbol?: string,
    eps: number = 1e-6,
    formatter?: AxisStringFormatterType,
  ): string {
    if (Math.abs(value) < eps) {
      return '0'
    }

    // ½, ⅝, ¾
    value /= unit

    for (let d = 1; d <= 64; d++) {
      const n = value * d
      const ni = Math.round(n)
      if (Math.abs(n - ni) < eps) {
        const nis = !unitSymbol || ni != 1 ? ni.toString() : ''
        if (d == 1) {
          return `${nis}${unitSymbol}`
        }

        return `${nis}${unitSymbol}/${d}`
      }
    }

    if (!formatter) {
      return `${value.toString()}${unitSymbol || ''}`
    }

    return formatter(value) + (unitSymbol || '')
  }
}
