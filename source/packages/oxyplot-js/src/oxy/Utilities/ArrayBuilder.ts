/** Provides functionality to build arrays. */
export class ArrayBuilder {
  /** Creates a vector. */
  public static createVector(x0: number, x1: number, n: number): number[] {
    if (n.toFixed(0) !== n.toString()) {
      throw new Error(`use createVectorWithStep instead`)
    }

    const result: number[] = []
    for (let i = 0; i < n; i++) {
      result[i] = Number((x0 + ((x1 - x0) * i) / (n - 1)).toFixed(8))
    }

    return result
  }

  /** Creates a vector. */
  public static createVectorWithStep(x0: number, x1: number, dx: number): number[] {
    const n = Math.round((x1 - x0) / dx)
    const result: number[] = []
    for (let i = 0; i <= n; i++) {
      result[i] = Number((x0 + i * dx).toFixed(8))
    }

    return result
  }

  /** Evaluates the specified function. */
  public static evaluate(f: (x: number, y: number) => number, x: number[], y: number[]): number[][] {
    const m = x.length
    const n = y.length
    const result: number[][] = []
    for (let i = 0; i < m; i++) {
      result[i] = []
      for (let j = 0; j < n; j++) {
        result[i][j] = f(x[i], y[j])
      }
    }

    return result
  }

  /** Fills the array with the specified value. */
  public static fill(array: number[], value: number): void {
    for (let i = 0; i < array.length; i++) {
      array[i] = value
    }
  }

  /** Fills the two-dimensional array with the specified value. */
  public static fill2D(array: number[][], value: number): void {
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < array[i].length; j++) {
        array[i][j] = value
      }
    }
  }
}
