/**
 * Static utility methods for the Axis classes.
 */
export class AxisUtilities {
  /**
   * Calculates the minor interval.
   * @param majorInterval The major interval.
   * @returns The minor interval.
   */
  public static calculateMinorInterval(majorInterval: number): number {
    // check if majorInterval = 2*10^x
    // uses the mathematical identity log10(2 * 10^x) = x + log10(2)
    // -> we just have to check if the modulo of log10(2*10^x) = log10(2)
    if (Math.abs(((Math.log10(majorInterval) + 1000) % 1) - Math.log10(2)) < 1e-10) {
      return majorInterval / 4.0
    }

    return majorInterval / 5.0
  }

  /**
   * Calculates the minor interval (alternative algorithm).
   * @param majorInterval The major interval.
   * @returns The minor interval.
   */
  public static calculateMinorInterval2(majorInterval: number): number {
    const exponent = Math.ceil(Math.log(majorInterval) / Math.LN10)
    const mantissa = majorInterval / Math.pow(10, exponent - 1)
    return (mantissa | 0) === 2 ? majorInterval / 4 : majorInterval / 5
  }

  /**
   * Creates tick values at the specified interval.
   * @param from The start value.
   * @param to The end value.
   * @param step The interval.
   * @param maxTicks The maximum number of ticks (optional). The default value is 1000.
   * @returns A sequence of values.
   */
  public static createTickValues(from: number, to: number, step: number, maxTicks: number = 1000): number[] {
    if (step <= 0) {
      throw new Error('Step cannot be zero or negative.')
    }

    if (to < from) {
      step = -step
    }

    const epsilon = step * 1e-3
    from -= epsilon
    to += epsilon

    let startValue = Math.ceil(from / step) * step
    if (Math.abs(startValue) < Number.EPSILON) {
      startValue = 0
    }

    const values: number[] = []
    const sign = Math.sign(step)
    let i = 0

    let currentValue = startValue
    while ((to - currentValue) * sign >= 0 && i < maxTicks) {
      values.push(currentValue)
      currentValue = startValue + ++i * step
    }

    return values
  }

  /**
   * Analyses two lists of major and minor ticks and creates a new containing the subset of the minor ticks which are not too close to any of the major ticks.
   * @param majorTicks The major ticks. Must be monotonically ascending or descending.
   * @param minorTicks The minor ticks. Must be monotonically ascending or descending (same direction as major ticks).
   * @returns A new list containing a subset of the original minor ticks such that there are no minor ticks too close to a major tick.
   */
  public static filterRedundantMinorTicks(majorTicks: number[], minorTicks: number[]): number[] {
    if (majorTicks.length === 0 || minorTicks.length === 0) {
      return minorTicks
    }

    const ret: number[] = []
    let previousMinorTick = 0
    let j = 1

    let currentMajorTick = majorTicks.length > 1 ? majorTicks[j] : majorTicks[0]

    const getEpsilon = (tick1: number, tick2: number): number => {
      return Math.abs(tick1 - tick2) * 1e-3
    }

    // If there is only one minor tick, we can't determine a meaningful epsilon.
    // But there also shouldn't be any precision loss, so we can require an exact match (epsilon = 0)
    let epsilon = minorTicks.length > 1 ? getEpsilon(minorTicks[0], minorTicks[1]) : 0

    let sign = 1
    if (majorTicks.length > 1 && majorTicks[0] > majorTicks[1]) {
      sign = -1
    }

    for (let i = 0; i < minorTicks.length; i++) {
      const currentMinorTick = minorTicks[i]
      if (i > 0) {
        epsilon = getEpsilon(currentMinorTick, previousMinorTick)
      }

      while ((currentMajorTick - currentMinorTick) * sign < 0 && j < majorTicks.length - 1) {
        currentMajorTick = majorTicks[++j]
      }

      const previousMajorTick = majorTicks[j - 1]
      if (
        Math.abs(currentMinorTick - currentMajorTick) > epsilon &&
        Math.abs(currentMinorTick - previousMajorTick) > epsilon
      ) {
        ret.push(currentMinorTick)
      }

      previousMinorTick = currentMinorTick
    }

    return ret
  }
}
