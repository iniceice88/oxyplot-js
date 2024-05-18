import { type CreateLineSeriesOptions, ExtendedDefaultLineSeriesOptions, LineSeries, newDataPoint } from '@/oxyplot'
import { assertInteger } from '@/patch'

export interface CreateFunctionSeriesOptions extends CreateLineSeriesOptions {
  f?: (x: number) => number
  x0?: number
  x1?: number
  dx?: number

  n?: number

  fx?: (t: number) => number
  fy?: (t: number) => number
  t0?: number
  t1?: number
  dt?: number
}

export const ExtendedDefaultFunctionSeriesOptions = {
  ...ExtendedDefaultLineSeriesOptions,
}

/**
 * Represents a line series that generates its dataset from a function.
 *
 * Remarks:
 * - Define `f(x)` and make a plot on the range `[x0,x1]`
 * - or define `x(t)` and `y(t)` and make a plot on the range `[t0,t1]`
 */
export class FunctionSeries extends LineSeries {
  constructor(opt: CreateFunctionSeriesOptions) {
    super(opt)
    if (opt.f) {
      if (opt.dx) {
        this.f1(opt.f, opt.x0!, opt.x1!, opt.dx)
      } else if (opt.n) {
        this.f2(opt.f, opt.x0!, opt.x1!, opt.n)
      }
      return
    }
    if (opt.fx && opt.fy) {
      if (opt.dt) {
        this.f3(opt.fx, opt.fy, opt.t0!, opt.t1!, opt.dt)
      } else if (opt.n) {
        this.f4(opt.fx, opt.fy, opt.t0!, opt.t1!, opt.n)
      }
    }
  }

  getElementName() {
    return 'FunctionSeries'
  }

  static fromDx(f: (x: number) => number, x0: number, x1: number, dx: number, title?: string): FunctionSeries {
    return new FunctionSeries({
      f,
      x0,
      x1,
      dx,
      title,
    })
  }

  static fromN(f: (x: number) => number, x0: number, x1: number, n: number, title?: string): FunctionSeries {
    assertInteger(n, 'n')
    return new FunctionSeries({
      f,
      x0,
      x1,
      n,
      title,
    })
  }

  static fromFxFyDt(
    fx: (t: number) => number,
    fy: (t: number) => number,
    t0: number,
    t1: number,
    dt: number,
    title?: string,
  ) {
    return new FunctionSeries({
      fx,
      fy,
      t0,
      t1,
      dt,
      title,
    })
  }

  static fromFxFyN(
    fx: (t: number) => number,
    fy: (t: number) => number,
    t0: number,
    t1: number,
    n: number,
    title?: string,
  ) {
    assertInteger(n, 'n')
    return new FunctionSeries({
      fx,
      fy,
      t0,
      t1,
      n,
      title,
    })
  }

  /**
   * Initializes a new instance of the FunctionSeries class using a function f(x).
   * @param f The function f(x).
   * @param x0 The start x value.
   * @param x1 The end x value.
   * @param dx The increment in x.
   */
  private f1(f: (x: number) => number, x0: number, x1: number, dx: number) {
    for (let x = x0; x <= x1 + dx * 0.5; x += dx) {
      this.points.push(newDataPoint(x, f(x)))
    }
  }

  /**
   * Initializes a new instance of the FunctionSeries class using a function f(x).
   * @param f The function f(x).
   * @param x0 The start x value.
   * @param x1 The end x value.
   * @param n The number of points.
   */
  f2(f: (x: number) => number, x0: number, x1: number, n: number) {
    this.f1(f, x0, x1, (x1 - x0) / (n - 1))
  }

  /**
   * Initializes a new instance of the FunctionSeries class using functions x(t) and y(t).
   * @param fx The function x(t).
   * @param fy The function y(t).
   * @param t0 The start t parameter.
   * @param t1 The end t parameter.
   * @param dt The increment in t.
   */
  private f3(fx: (t: number) => number, fy: (t: number) => number, t0: number, t1: number, dt: number) {
    for (let t = t0; t <= t1 + dt * 0.5; t += dt) {
      this.points.push(newDataPoint(fx(t), fy(t)))
    }
  }

  /**
   * Initializes a new instance of the FunctionSeries class using functions x(t) and y(t).
   * @param fx The function x(t).
   * @param fy The function y(t).
   * @param t0 The start t parameter.
   * @param t1 The end t parameter.
   * @param n The number of points.
   */
  private f4(fx: (t: number) => number, fy: (t: number) => number, t0: number, t1: number, n: number) {
    this.f3(fx, fy, t0, t1, (t1 - t0) / (n - 1))
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultFunctionSeriesOptions
  }
}
