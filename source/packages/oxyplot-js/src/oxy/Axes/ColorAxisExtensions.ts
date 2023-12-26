import type { IColorAxis } from '@/oxyplot'
import { OxyColor } from '@/oxyplot'

/** Provides extension methods for IColorAxis. */
export class ColorAxisExtensions {
  /** Gets the color for the specified value. */
  public static getColor(axis: IColorAxis, value: number): OxyColor {
    return axis.getColor(axis.getPaletteIndex(value))
  }
}
