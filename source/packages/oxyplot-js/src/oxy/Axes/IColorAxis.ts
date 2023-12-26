import { IPlotElement, OxyColor } from '@/oxyplot'

/**
 * Specifies functionality for color axes.
 */
export interface IColorAxis extends IPlotElement {
  /**
   * Gets the color of the specified index in the color palette.
   * @param paletteIndex The color map index (less than NumberOfEntries).
   * @returns The color.
   */
  getColor(paletteIndex: number): OxyColor

  /**
   * Gets the palette index of the specified value.
   * @param value The value.
   * @returns The palette index.
   * @remarks If the value is less than minimum, 0 is returned. If the value is greater than maximum, Palette.Colors.Count+1 is returned.
   */
  getPaletteIndex(value: number): number
}

/**
 * Checks if the specified axis is a color axis.
 * @param axis
 */
export function isColorAxis(axis: any): axis is IColorAxis {
  return axis && typeof axis.getColor === 'function' && typeof axis.getPaletteIndex === 'function'
}

export function toColorAxis(axis: any): IColorAxis {
  return axis as IColorAxis
}
