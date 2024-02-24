import { type IColorAxis, OxyColor, OxyPalette } from '@/oxyplot'

/**
 * Specifies functionality for numeric color axes.
 */
export interface INumericColorAxis extends IColorAxis {
  /**
   * Gets or sets the palette.
   */
  palette: OxyPalette

  /**
   * Gets or sets the color of values above the maximum value.
   */
  highColor: OxyColor

  /**
   * Gets or sets the color of values below the minimum value.
   */
  lowColor: OxyColor

  /**
   * Gets or sets the color used to represent NaN values.
   */
  invalidNumberColor: OxyColor

  /**
   * Gets or sets a value indicating whether to render the colors as an image.
   */
  renderAsImage: boolean
}
