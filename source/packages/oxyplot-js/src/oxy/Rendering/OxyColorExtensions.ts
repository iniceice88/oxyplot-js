import { OxyColor, OxyColors } from '@/oxyplot'
import { toUint } from '@/patch'

const colorNamesCache = new Map<number, string>()
/**
 * Provides extension methods for OxyColor
 * @remarks
 * These are pure methods. They could also be placed in the OxyColor type with a PureAttribute.
 */
export const OxyColorExtensions = {
  /**
   * Changes the intensity.
   * @param color The color.
   * @param factor The factor.
   * @returns A color with the new intensity.
   */
  changeIntensity: (color: OxyColor, factor: number): OxyColor => {
    const hsv = OxyColorExtensions.toHsv(color)
    hsv[2] *= factor
    if (hsv[2] > 1.0) {
      hsv[2] = 1.0
    }

    return OxyColor.fromHsv(hsv[0], hsv[1], hsv[2])
  },

  /**
   * Changes the saturation.
   * @param color The color.
   * @param factor The factor.
   * @returns A color with the new saturation.
   */
  changeSaturation: (color: OxyColor, factor: number): OxyColor => {
    const hsv = OxyColorExtensions.toHsv(color)
    hsv[1] *= factor
    if (hsv[1] > 1.0) {
      hsv[1] = 1.0
    }

    return OxyColor.fromHsv(hsv[0], hsv[1], hsv[2])
  },

  /**
   * Changes the opacity.
   * @param color The color.
   * @param factor The factor.
   * @returns A color with the new opacity.
   */
  changeOpacity: (color: OxyColor, factor: number): OxyColor => {
    return OxyColor.fromAColor(color.a * factor, color)
  },

  /**
   * Calculates the complementary color.
   * @param color The color to convert.
   * @returns The complementary color.
   */
  complementary: (color: OxyColor): OxyColor => {
    // http://en.wikipedia.org/wiki/Complementary_Color
    const hsv = OxyColorExtensions.toHsv(color)
    let newHue = hsv[0] - 0.5

    // clamp to [0,1]
    if (newHue < 0) {
      newHue += 1.0
    }

    return OxyColor.fromHsv(newHue, hsv[1], hsv[2])
  },

  /**
   * Converts from a `OxyColor` to HSV values (double)
   * @param color The color.
   * @returns Array of [Hue,Saturation,Value] in the range [0,1]
   */
  toHsv: (color: OxyColor): number[] => {
    const r = color.r
    const g = color.g
    const b = color.b

    const min = Math.min(Math.min(r, g), b)
    const v = Math.max(Math.max(r, g), b)
    const delta = v - min

    const s = v === 0 ? 0 : delta / v
    let h = 0

    if (s === 0) {
      h = 0.0
    } else {
      if (r === v) {
        h = (g - b) / delta
      } else if (g === v) {
        h = 2 + (b - r) / delta
      } else if (b === v) {
        h = 4 + (r - g) / delta
      }

      h *= 60
      if (h < 0.0) {
        h += 360
      }
    }

    const hsv = new Array(3)
    hsv[0] = h / 360.0
    hsv[1] = s
    hsv[2] = v / 255.0
    return hsv
  },

  /**
   * Converts to an unsigned integer.
   * @param color The color.
   * @returns The color as an unsigned integer.
   */
  toUint: (color: OxyColor): number => {
    let u = toUint(color.a << 24)
    u += toUint(color.r << 16)
    u += toUint(color.g << 8)
    u += toUint(color.b)
    return toUint(u)
  },

  /**
   * Converts an OxyColor to a string containing the ARGB byte values.
   * @param color The color.
   * @returns A string that contains byte values of the alpha, red, green and blue components separated by comma.
   */
  toByteString: (color: OxyColor): string => {
    return `${color.a},${color.r},${color.g},${color.b}`
  },

  /**
   * Gets the name of the color if it is defined in the `OxyColors` class.
   * @param color The color.
   * @returns The color name or `null` if the color is not found.
   */
  getColorName: (color: OxyColor): string | undefined => {
    const colorCode = OxyColorExtensions.toUint(color)
    if (colorNamesCache.has(colorCode)) {
      return colorNamesCache.get(colorCode)
    }

    const pxyColors = OxyColors as Record<string, OxyColor>
    for (const name of Object.keys(pxyColors)) {
      const c = pxyColors[name]
      if (OxyColorExtensions.toUint(c) === colorCode) {
        colorNamesCache.set(colorCode, name)
        return name
      }
    }

    return undefined
  },

  /**
   * Calculate the difference in hue between two `OxyColor`s.
   * @param c1 The first color.
   * @param c2 The second color.
   * @returns The hue difference.
   */
  hueDifference: (c1: OxyColor, c2: OxyColor): number => {
    const hsv1 = OxyColorExtensions.toHsv(c1)
    const hsv2 = OxyColorExtensions.toHsv(c2)
    let dh = hsv1[0] - hsv2[0]

    // clamp to [-0.5,0.5]
    if (dh > 0.5) {
      dh -= 1.0
    }

    if (dh < -0.5) {
      dh += 1.0
    }

    const e = Math.pow(dh, 2)
    return Math.sqrt(e)
  },
}
