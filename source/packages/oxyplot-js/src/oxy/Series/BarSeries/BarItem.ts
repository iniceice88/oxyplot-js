import { type OxyColor, OxyColors } from '@/oxyplot'
import { isNullOrUndef, removeUndef } from '@/patch'

/**
 * Represents an item in a bar series.
 */
export interface BarItemBase {
  /**
   * The index of the category.
   */
  categoryIndex: number
}

/**
 * Represents an item used in the BarSeries.
 */
export interface BarItem extends BarItemBase {
  /**
   * The color of the item.
   * If the color is not specified (default), the color of the series will be used.
   */
  color: OxyColor

  /**
   * The value of the item.
   */
  value: number
}

export function newBarItem(value?: number, categoryIndex?: number, color?: OxyColor): BarItem
export function newBarItem(bi?: Partial<BarItem>): BarItem
export function newBarItem(arg1?: number | Partial<BarItem>, categoryIndex?: number, color?: OxyColor): BarItem {
  const def = { categoryIndex: -1, value: 0, color: OxyColors.Automatic }
  if (isNullOrUndef(arg1)) return def

  if (typeof arg1 === 'number') {
    return Object.assign({}, def, removeUndef({ value: arg1, categoryIndex, color }))
  }

  return Object.assign({}, def, removeUndef(arg1))
}

export function getBarItemCategoryIndex(bi: BarItemBase, defaultIndex: number): number {
  if (bi.categoryIndex < 0) {
    return defaultIndex
  }

  return bi.categoryIndex
}

export class BarItemEx implements BarItem {
  private readonly _barItem: BarItem

  constructor(barItem: BarItem) {
    this._barItem = barItem
  }

  get color(): OxyColor {
    return this._barItem.color
  }

  get value(): number {
    return this._barItem.value
  }

  get categoryIndex(): number {
    return this._barItem.categoryIndex
  }

  /**
   * Gets the index of the category.
   * @param defaultIndex The default index.
   * @returns The index.
   * @internal
   */
  getCategoryIndex(defaultIndex: number): number {
    return getBarItemCategoryIndex(this._barItem, defaultIndex)
  }

  static fromBarItem(barItem: BarItem): BarItemEx {
    return new BarItemEx(barItem)
  }
}
