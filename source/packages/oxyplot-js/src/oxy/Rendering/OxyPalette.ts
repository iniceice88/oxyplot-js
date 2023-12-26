import { OxyColor } from './OxyColor'
import { getReversedCopy } from '@/patch'

/**
 * Represents a palette of colors.
 */
export class OxyPalette {
  /**
   * The list of colors in the palette.
   */
  public colors: OxyColor[] = []

  /**
   * Initializes a new instance of the `OxyPalette` class.
   */
  constructor(colors?: OxyColor[]) {
    if (colors) {
      this.colors = [...colors]
      Object.freeze(this.colors)
    }
  }

  /**
   * Interpolates the specified colors to a palette of the specified size.
   * @param paletteSize The size of the palette.
   * @param colors The colors to interpolate.
   * @returns A palette.
   */
  public static interpolate(paletteSize: number, ...colors: OxyColor[]): OxyPalette {
    if (!colors || colors.length === 0 || paletteSize < 1) {
      // No color to interpolate or no color required.
      return new OxyPalette([])
    }

    const palette: OxyColor[] = []
    const incrementStepSize = paletteSize === 1 ? 0 : 1.0 / (paletteSize - 1)

    for (let i = 0; i < paletteSize; i++) {
      const y = i * incrementStepSize
      const x = y * (colors.length - 1)
      const i0 = Math.floor(x)
      const i1 = i0 + 1 < colors.length ? i0 + 1 : i0
      palette[i] = OxyColor.interpolate(colors[i0], colors[i1], x - i0)
    }

    return new OxyPalette(palette)
  }

  /**
   * Creates a new palette with the color order reversed.
   * @returns The reversed palette.
   */
  public reverse(): OxyPalette {
    return new OxyPalette(getReversedCopy(this.colors))
  }
}
