import { isNullOrUndef } from '@/patch'

export interface CreateBarItemBaseOptions {
  /**
   * The index of the category.
   */
  categoryIndex?: number
}

/**
 * Represents an item in a bar series.
 */
export abstract class BarItemBase {
  /**
   * The index of the category.
   */
  public categoryIndex: number

  /**
   * Initializes a new instance of the BarItemBase class.
   */
  protected constructor(opt?: CreateBarItemBaseOptions) {
    this.categoryIndex = -1
    if (opt) {
      if (!isNullOrUndef(opt.categoryIndex)) this.categoryIndex = opt.categoryIndex
    }
  }

  /**
   * Gets the index of the category.
   * @param defaultIndex The default index.
   * @returns The index.
   * @internal
   */
  getCategoryIndex(defaultIndex: number): number {
    if (this.categoryIndex < 0) {
      return defaultIndex
    }

    return this.categoryIndex
  }
}
