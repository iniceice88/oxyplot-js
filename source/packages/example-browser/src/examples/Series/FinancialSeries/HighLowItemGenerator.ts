import { createHighLowItem, DateTimeAxis, type HighLowItem } from 'oxyplot-js'
import { Random } from '../../Random'

/**
 * Creates realistic high/low items.
 */
export class HighLowItemGenerator {
  /**
   * The random number generator.
   */
  private static readonly rand = new Random()

  /**
   * Creates bars governed by a MR process
   * @returns The process.
   * @param n N.
   * @param x0 X0.
   * @param csigma Csigma.
   * @param esigma Esigma.
   * @param kappa Kappa.
   */
  public static mrProcess(n: number, x0 = 100.0, csigma = 0.5, esigma = 0.7, kappa = 0.01): HighLowItem[] {
    let x = x0

    const items: HighLowItem[] = []
    const baseT = new Date()
    for (let ti = 0; ti < n; ti++) {
      const dx_c = -kappa * (x - x0) + this.randomNormal(0, csigma)
      const dx_1 = -kappa * (x - x0) + this.randomNormal(0, esigma)
      const dx_2 = -kappa * (x - x0) + this.randomNormal(0, esigma)

      const open = x
      const close = (x = x + dx_c)
      const low = this.min(open, close, open + dx_1, open + dx_2)
      const high = this.max(open, close, open + dx_1, open + dx_2)

      const nowT = new Date(baseT.getTime() + ti * 1000)
      const t = DateTimeAxis.toDouble(nowT)
      items.push(createHighLowItem(t, high, low, open, close))
    }

    return items
  }

  /**
   * Finds the minimum of the specified a, b, c and d.
   * @param a A.
   * @param b B.
   * @param c C.
   * @param d D.
   * @returns The minimum.
   */
  private static min(a: number, b: number, c: number, d: number): number {
    return Math.min(a, Math.min(b, Math.min(c, d)))
  }

  /**
   * Finds the maximum of the specified a, b, c and d.
   * @param a A.
   * @param b B.
   * @param c C.
   * @param d D.
   * @returns The maximum.
   */
  private static max(a: number, b: number, c: number, d: number): number {
    return Math.max(a, Math.max(b, Math.max(c, d)))
  }

  /**
   * Get random normal
   * @param mu Mu.
   * @param sigma Sigma.
   */
  private static randomNormal(mu: number, sigma: number): number {
    return this.inverseCumNormal(this.rand.next(), mu, sigma)
  }

  /**
   * Fast approximation for inverse cum normal
   * @param p probability
   * @param mu Mean
   * @param sigma std dev
   */
  static inverseCumNormal(p: number, mu: number, sigma: number): number {
    const A1 = -3.969683028665376e1
    const A2 = 2.209460984245205e2
    const A3 = -2.759285104469687e2
    const A4 = 1.38357751867269e2
    const A5 = -3.066479806614716e1
    const A6 = 2.506628277459239

    const B1 = -5.447609879822406e1
    const B2 = 1.615858368580409e2
    const B3 = -1.556989798598866e2
    const B4 = 6.680131188771972e1
    const B5 = -1.328068155288572e1

    const C1 = -7.784894002430293e-3
    const C2 = -3.223964580411365e-1
    const C3 = -2.400758277161838
    const C4 = -2.549732539343734
    const C5 = 4.374664141464968
    const C6 = 2.938163982698783

    const D1 = 7.784695709041462e-3
    const D2 = 3.224671290700398e-1
    const D3 = 2.445134137142996
    const D4 = 3.754408661907416

    const Xlow = 0.02425
    const Xhigh = 1.0 - Xlow

    let z, r

    if (p < Xlow) {
      z = Math.sqrt(-2.0 * Math.log(p))
      z = (((((C1 * z + C2) * z + C3) * z + C4) * z + C5) * z + C6) / ((((D1 * z + D2) * z + D3) * z + D4) * z + 1.0)
    } else if (p <= Xhigh) {
      z = p - 0.5
      r = z * z
      z =
        ((((((A1 * r + A2) * r + A3) * r + A4) * r + A5) * r + A6) * z) /
        (((((B1 * r + B2) * r + B3) * r + B4) * r + B5) * r + 1.0)
    } else {
      z = Math.sqrt(-2.0 * Math.log(1.0 - p))
      z = -(((((C1 * z + C2) * z + C3) * z + C4) * z + C5) * z + C6) / ((((D1 * z + D2) * z + D3) * z + D4) * z + 1.0)
    }

    r = (this.cumN0(z) - p) * Math.sqrt(2.0) * Math.sqrt(Math.PI) * Math.exp(0.5 * z * z)

    z -= r / (1 + 0.5 * z * r)

    return mu + z * sigma
  }

  /**
   * Cumulative for a N(0,1) distribution
   * @returns The n0.
   * @param x The x coordinate.
   */
  private static cumN0(x: number): number {
    const B1 = 0.31938153
    const B2 = -0.356563782
    const B3 = 1.781477937
    const B4 = -1.821255978
    const B5 = 1.330274429
    const P = 0.2316419
    const C = 0.39894228

    if (x >= 0.0) {
      const t = 1.0 / (1.0 + P * x)
      return 1.0 - C * Math.exp((-x * x) / 2.0) * t * (t * (t * (t * (t * B5 + B4) + B3) + B2) + B1)
    } else {
      const t = 1.0 / (1.0 - P * x)
      return C * Math.exp((-x * x) / 2.0) * t * (t * (t * (t * (t * B5 + B4) + B3) + B2) + B1)
    }
  }
}
