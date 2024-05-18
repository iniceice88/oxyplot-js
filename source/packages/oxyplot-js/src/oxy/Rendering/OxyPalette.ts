import { type OxyColor, OxyColorEx, OxyColorHelper } from './OxyColor'
import { getReversedCopy } from '@/patch'

/**
 * Represents a palette of colors.
 */
export interface OxyPalette {
  /**
   * The list of colors in the palette.
   */
  colors: OxyColor[]
}

export function newOxyPalette(colors?: (OxyColorEx | OxyColor)[]): OxyPalette {
  if (!colors?.length) return Object.freeze({ colors: [] })
  let cList = colors as OxyColor[]
  if ((colors[0] as OxyColorEx).hex) {
    cList = (colors as OxyColorEx[]).map((x) => x.hex)
  }
  return Object.freeze({ colors: cList })
}

/**
 * Represents a palette of colors.
 */
export class OxyPaletteHelper {
  /**
   * Interpolates the specified colors to a palette of the specified size.
   * @param paletteSize The size of the palette.
   * @param colors The colors to interpolate.
   * @returns A palette.
   */
  static interpolate(paletteSize: number, ...colors: (OxyColorEx | OxyColor)[]): OxyPalette {
    if (!colors || colors.length === 0 || paletteSize < 1) {
      // No color to interpolate or no color required.
      return newOxyPalette([])
    }

    const palette: OxyColorEx[] = []
    const incrementStepSize = paletteSize === 1 ? 0 : 1.0 / (paletteSize - 1)

    for (let i = 0; i < paletteSize; i++) {
      const y = i * incrementStepSize
      const x = y * (colors.length - 1)
      const i0 = Math.floor(x)
      const i1 = i0 + 1 < colors.length ? i0 + 1 : i0
      const c1 = OxyColorEx.fromOxyColor(colors[i0])
      const c2 = OxyColorEx.fromOxyColor(colors[i1])
      palette[i] = OxyColorHelper.interpolate(c1, c2, x - i0)
    }

    return newOxyPalette(palette)
  }

  /**
   * Creates a new palette with the color order reversed.
   * @returns The reversed palette.
   */
  static reverse(p: OxyPalette): OxyPalette {
    return newOxyPalette(getReversedCopy(p.colors))
  }
}
