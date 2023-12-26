import { BarItemBase, OxyColor, OxyColors } from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface CreateBarItemOptions {
  value?: number
  color?: OxyColor
  categoryIndex?: number
}

/**
 * Represents an item used in the BarSeries.
 */
export class BarItem extends BarItemBase {
  /**
   * The color of the item.
   * If the color is not specified (default), the color of the series will be used.
   */
  public color: OxyColor

  /**
   * The value of the item.
   */
  public value: number = 0

  /**
   * Initializes a new instance of the BarItem class.
   */
  constructor(opt?: CreateBarItemOptions) {
    super(opt)
    this.color = OxyColors.Automatic

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  static fromValue(value: number): BarItem {
    return new BarItem({ value })
  }
}
