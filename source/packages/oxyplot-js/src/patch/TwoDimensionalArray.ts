import { create2DArray } from './array-util'

/**
 * equivalent to c# `T[,]`
 */
export class TwoDimensionalArray<T> {
  private readonly _data: T[][]

  constructor(
    private columnCount: number,
    private rowCount: number,
    initValue?: T
  ) {
    this._data = create2DArray(rowCount, columnCount, initValue)
  }

  static fromArray<T>(arr: T[][]): TwoDimensionalArray<T> {
    const rowCount = arr.length
    const columnCount = arr[0].length
    const result = new TwoDimensionalArray<T>(columnCount, rowCount)
    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < columnCount; x++) {
        result.set(x, y, arr[y][x])
      }
    }
    return result
  }

  toArray(): T[][] {
    const array = create2DArray<T>(this.rowCount, this.columnCount)
    for (let y = 0; y < this.rowCount; y++) {
      for (let x = 0; x < this.columnCount; x++) {
        array[y][x] = this.get(x, y)
      }
    }
    return array
  }

  get height(): number {
    return this.rowCount
  }

  get width(): number {
    return this.columnCount
  }

  get(x: number, y: number): T {
    return this._data[y][x]
  }

  set(x: number, y: number, val: T) {
    this._data[y][x] = val
  }
}
