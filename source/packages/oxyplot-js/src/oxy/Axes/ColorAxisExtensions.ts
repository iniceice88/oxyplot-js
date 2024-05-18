import { Axis, type IColorAxis, type INumericColorAxis, type OxyColor } from '@/oxyplot'
import { Number_MIN_VALUE } from '@/patch'

/** Provides extension methods for IColorAxis. */
export class ColorAxisExtensions {
  /** Gets the color for the specified value. */
  public static getColor(axis: IColorAxis, value: number): OxyColor {
    return axis.getColor(axis.getPaletteIndex(value))
  }

  /**
   * Gets the high value of the specified palette index.
   */
  public static getHighValue<T extends Axis & INumericColorAxis>(axis: T, paletteIndex: number): number {
    return this.getLowValue(axis, paletteIndex + 1)
  }

  /**
   * Gets the low value of the specified palette index.
   */
  public static getLowValue<T extends Axis & INumericColorAxis>(axis: T, paletteIndex: number): number {
    return (paletteIndex / axis.palette.colors.length) * (axis.clipMaximum - axis.clipMinimum) + axis.clipMinimum
  }

  /**
   * Gets the color.
   */
  public static getColorByPaletteIndex<T extends Axis & INumericColorAxis>(axis: T, paletteIndex: number): OxyColor {
    if (paletteIndex === Number_MIN_VALUE) {
      return axis.invalidNumberColor
    }

    if (paletteIndex === 0) {
      return axis.lowColor
    }

    if (paletteIndex === axis.palette.colors.length + 1) {
      return axis.highColor
    }

    return axis.palette.colors[paletteIndex - 1]
  }
}
