import { DateTimeAxis, newOhlcvItem, OhlcvItem } from 'oxyplot-js'
import { Random } from '../../Random'
import { HighLowItemGenerator } from './HighLowItemGenerator'

/**
 * Creates realistic OHLCV items.
 */
export class OhlcvItemGenerator {
  /**
   * The random number generator.
   */
  private static readonly rand = new Random()

  /**
   * Creates bars governed by a MR process.
   * @param n N.
   * @param x0 X0.
   * @param v0 V0.
   * @param csigma Csigma.
   * @param esigma Esigma.
   * @param kappa Kappa.
   * @returns The process.
   */
  public static mrProcess(n: number, x0 = 100.0, v0 = 500, csigma = 0.5, esigma = 0.75, kappa = 0.01): OhlcvItem[] {
    let x = x0
    const items: OhlcvItem[] = []
    const baseT = new Date()
    for (let ti = 0; ti < n; ti++) {
      const dx_c = -kappa * (x - x0) + this.randomNormal(0, csigma)

      const open = x
      const close = (x = x + dx_c)

      const dp = close - open
      const v = v0 * Math.exp(Math.abs(dp) / csigma)
      const dir = dp < 0 ? -Math.min(-dp / esigma, 1.0) : Math.min(dp / esigma, 1.0)

      const skew = (dir + 1) / 2.0
      const buyvol = skew * v
      const sellvol = (1 - skew) * v

      const nowT = new Date(baseT.getTime() + ti * 1000)
      const t = DateTimeAxis.toDouble(nowT)
      items.push(newOhlcvItem(t, buyvol, sellvol))
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
   * Gets random normal
   * @param mu Mu.
   * @param sigma Sigma.
   */
  private static randomNormal(mu: number, sigma: number): number {
    return HighLowItemGenerator.inverseCumNormal(this.rand.next(), mu, sigma)
  }
}
