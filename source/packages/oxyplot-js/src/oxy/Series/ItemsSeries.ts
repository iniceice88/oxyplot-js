import { type CreateSeriesOptions, Series } from '@/oxyplot'

export interface CreateItemsSeriesOptions extends CreateSeriesOptions {
  itemsSource?: any[]
}

/**
 * Abstract base class for series that can contain items.
 */
export abstract class ItemsSeries extends Series {
  protected constructor(opt?: CreateItemsSeriesOptions) {
    super(opt)
  }

  /**
   * The items source. The default is null.
   */
  itemsSource?: any[]

  /**
   * Gets the item for the specified index.
   * @param itemsSource The items source.
   * @param index The index.
   * @returns The get item.
   * Returns null if ItemsSource is not set, or the index is outside the boundaries.
   */
  protected static getItem(itemsSource: any[], index: number): any | undefined {
    if (!itemsSource || index < 0) {
      return undefined
    }

    if (index < itemsSource.length && index >= 0) {
      return itemsSource[index]
    }

    return undefined
  }

  /**
   * Gets the item at the specified index.
   * @param i The index of the item.
   * @returns The item of the index.
   */
  protected getItem(i: number): any | undefined {
    if (!this.itemsSource) return undefined

    return ItemsSeries.getItem(this.itemsSource, i)
  }
}
