import { isNullOrUndef, toUint, trimString } from '@/patch'

export type OxyColor = string

/**
 * The undefined color.
 */
export const OxyColor_Undefined: OxyColor = '#00000000'

/**
 * The automatic color.
 */
export const OxyColor_Automatic: OxyColor = '#00000001'

export class OxyColorEx {
  /**
   * The alpha component.0-255
   */
  readonly a: number
  /**
   * The blue component.Rendering
   */
  readonly b: number
  /**
   * The green component.Rendering
   */
  readonly g: number
  /**
   * The red component.Rendering
   */
  readonly r: number

  readonly hex: OxyColor

  constructor(a: number, r: number, g: number, b: number) {
    this.a = a
    this.r = r
    this.g = g
    this.b = b
    this.hex = OxyColorHelper.toHexString(r, g, b, a)
  }

  static fromArgb(a: number, r: number, g: number, b: number): OxyColorEx {
    return new OxyColorEx(a, r, g, b)
  }

  static fromHex(hex: string): OxyColorEx {
    if (!hex) hex = OxyColor_Undefined
    const { a, r, g, b } = OxyColorHelper.parseHex(hex)
    return new OxyColorEx(a, r, g, b)
  }

  static fromOxyColor(c: OxyColorEx | OxyColor): OxyColorEx {
    if (c instanceof OxyColorEx) return c
    if (isHexString(c)) {
      return OxyColorEx.fromHex(c)
    }
    const color = getOxyColorByName(c)
    if (color) return OxyColorEx.fromHex(color)
    throw new Error('Invalid color:' + c)
  }

  static fromRgb(r: number, g: number, b: number): OxyColorEx {
    return this.fromArgb(255, r, g, b)
  }

  static fromHsv(hue: number, sat: number, val: number): OxyColorEx {
    return this.fromOxyColor(OxyColorHelper.fromHsv(hue, sat, val))
  }

  static fromAColor(a: number, color: OxyColorEx | OxyColor): OxyColorEx {
    return this.fromOxyColor(OxyColorHelper.fromAColor(a, color))
  }
}

export class OxyColorHelper {
  static isOxyColor(obj: any): obj is OxyColor {
    if (!obj) return false
    if (typeof obj !== 'string') return false
    return true // trade any string as OxyColor
  }

  static getOxyColor(c: OxyColor | OxyColorEx): OxyColor {
    if (typeof c === 'string') return c
    return OxyColorEx.fromOxyColor(c).hex
  }

  /**
   * Parse a string.
   * @param value The string in the format "#FFFFFF00" or "255,200,180,50".
   * @returns The parsed color.
   * @throws Error if the format is invalid.
   */
  static parse(value: string): OxyColor {
    if (!value || value.toLowerCase() === 'none') {
      return OxyColor_Undefined
    }

    if (value.toLowerCase() === 'auto') {
      return OxyColor_Automatic
    }

    const { a, r, g, b } = this.parseHex(value)
    return this.fromArgb(a, r, g, b)
  }

  static parseHex(value: string): { a: number; r: number; g: number; b: number } {
    value = value.trim()
    if (value.startsWith('#')) {
      value = trimString(value, '#')
      if (value.length === 3) {
        // replicate digits
        value = `${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`
      }

      let u = parseInt(value, 16)
      if (value.length < 8) {
        // alpha value was not specified
        u += 0xff000000
      }

      return this.uint32ToArgb(u)
    }

    // r,g,b
    const values = value.split(',')
    if (values.length < 3 || values.length > 4) {
      throw new Error('Invalid color:' + value)
    }

    let i = 0

    let a = 255
    if (values.length > 3) {
      a = parseInt(values[i], 10)
      i++
    }

    const r = parseInt(values[i], 10)
    const g = parseInt(values[i + 1], 10)
    const b = parseInt(values[i + 2], 10)
    return { a, r, g, b }
  }

  /**
   * Calculates the difference between two OxyColors.
   * @param c1 The first color.
   * @param c2 The second color.
   * @returns L2-norm in ARGB space.
   */
  static colorDifference(c1: OxyColorEx, c2: OxyColorEx): number {
    // http://en.wikipedia.org/wiki/OxyColor_difference
    // http://mathworld.wolfram.com/L2-Norm.html
    const dr = (c1.r - c2.r) / 255.0
    const dg = (c1.g - c2.g) / 255.0
    const db = (c1.b - c2.b) / 255.0
    const da = (c1.a - c2.a) / 255.0
    const e = dr * dr + dg * dg + db * db + da * da
    return Math.sqrt(e)
  }

  /**
   * Convert an unsigned integer to an OxyColor.
   * @param color The unsigned integer color value.
   * @returns The OxyColor.
   */
  static fromUInt32(color: number): OxyColor {
    const { a, r, g, b } = this.uint32ToArgb(color)
    return this.fromArgb(a, r, g, b)
  }

  private static uint32ToArgb(color: number) {
    const a = (color >> 24) & 0xff
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff
    return { a, r, g, b }
  }

  /**
   * Converts from HSV to `OxyColor`.
   * @param hue The hue value [0,1]
   * @param sat The saturation value [0,1]
   * @param val The intensity value [0,1]
   * @returns The `OxyColor`.
   * @remarks See [Wikipedia](http://en.wikipedia.org/wiki/HSL_Color_space).
   */
  static fromHsv(hue: number, sat: number, val: number): OxyColor {
    let g: number, b: number
    let r = (g = b = 0)

    if (sat === 0) {
      // Gray scale
      r = g = b = val
    } else {
      if (hue === 1) {
        hue = 0
      }

      hue *= 6.0
      const i = Math.floor(hue)
      const f = hue - i
      const aa = val * (1 - sat)
      const bb = val * (1 - sat * f)
      const cc = val * (1 - sat * (1 - f))

      switch (i) {
        case 0:
          r = val
          g = cc
          b = aa
          break
        case 1:
          r = bb
          g = val
          b = aa
          break
        case 2:
          r = aa
          g = val
          b = cc
          break
        case 3:
          r = aa
          g = bb
          b = val
          break
        case 4:
          r = cc
          g = aa
          b = val
          break
        case 5:
          r = val
          g = aa
          b = bb
          break
      }
    }

    return this.fromRgb(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255))
  }

  /**
   * Creates a color defined by an alpha value and another color.
   * @param a Alpha value.
   * @param color The original color.
   * @returns A color.
   */
  static fromAColor(a: number, color: OxyColorEx | OxyColor): OxyColor {
    const c = OxyColorEx.fromOxyColor(color)
    return this.fromArgb(a, c.r, c.g, c.b)
  }

  /**
   * Creates a color from the specified ARGB values.
   * @param a The alpha value.
   * @param r The red value.
   * @param g The green value.
   * @param b The blue value.
   * @returns A color.
   */
  static fromArgb(a: number, r: number, g: number, b: number): OxyColor {
    return this.toHexString(r, g, b, a)
  }

  /**
   * Creates a new `OxyColor` structure from the specified RGB values.
   * @param r The red value.
   * @param g The green value.
   * @param b The blue value.
   * @returns An `OxyColor` structure with the specified values and an alpha channel value of 1.
   */
  static fromRgb(r: number, g: number, b: number): OxyColor {
    return this.fromArgb(255, r, g, b)
  }

  /**
   * Interpolates the specified colors.
   * @param color1 The color1.
   * @param color2 The color2.
   * @param t The t.
   * @returns The interpolated color
   */
  static interpolate(color1: OxyColorEx | OxyColor, color2: OxyColorEx | OxyColor, t: number): OxyColorEx {
    const c1 = OxyColorEx.fromOxyColor(color1)
    const c2 = OxyColorEx.fromOxyColor(color2)
    const a = c1.a * (1 - t) + c2.a * t
    const r = c1.r * (1 - t) + c2.r * t
    const g = c1.g * (1 - t) + c2.g * t
    const b = c1.b * (1 - t) + c2.b * t
    return OxyColorEx.fromArgb(toByte(a), toByte(r), toByte(g), toByte(b))
  }

  /**
   * Determines whether the specified OxyColor is equal to the current instance.
   * @returns true if the specified OxyColor is equal to the current instance; otherwise, false.
   */
  static equals(c: OxyColorEx | OxyColor, other: OxyColorEx | OxyColor): boolean {
    if (typeof c === 'string' && typeof other === 'string') return c === other

    const c1 = OxyColorEx.fromOxyColor(c)
    const c2 = OxyColorEx.fromOxyColor(other)
    return c1.a === c2.a && c1.r === c2.r && c1.g === c2.g && c1.b === c2.b
  }

  static toArgb(c: OxyColorEx | OxyColor): string {
    const { r, g, b, a } = this.toArgbInner(c)
    return `#${a}${r}${g}${b}`
  }

  static toRgba(c: OxyColorEx | OxyColor): string {
    const { r, g, b, a } = this.toArgbInner(c)
    return `#${r}${g}${b}${a}`
  }

  static toRgb(c: OxyColorEx | OxyColor): string {
    const { r, g, b } = this.toArgbInner(c)
    return `#${r}${g}${b}$`
  }

  static toHexString(r: number, g: number, b: number, a?: number) {
    const toHex = numToHex
    const [hexR, hexG, hexB] = [toHex(r), toHex(g), toHex(b)]
    const rgb = `${hexR}${hexG}${hexB}`
    if (isNullOrUndef(a) || a === 255) {
      // #RRGGBB -> #RGB if possible
      if (hexR[0] === hexR[1] && hexG[0] === hexG[1] && hexB[0] === hexB[1]) {
        return `#${hexR[0]}${hexG[0]}${hexB[0]}`
      }
      return `#${rgb}`
    }
    return `#${toHex(a)}${rgb}`
  }

  private static toArgbInner(c: OxyColorEx | OxyColor) {
    const { r, g, b, a } = OxyColorEx.fromOxyColor(c)
    return {
      a: numToHex(a),
      r: numToHex(r),
      g: numToHex(g),
      b: numToHex(b),
    }
  }

  /**
   * Determines whether the current color is invisible.
   * @returns True if the alpha value is 0.
   */
  static isInvisible(color: OxyColorEx | OxyColor): boolean {
    if (!color) return true
    const c = OxyColorEx.fromOxyColor(color)
    return c.a === 0
  }

  /**
   * Determines whether the current color is visible.
   * @returns True if the alpha value is greater than 0.
   */
  static isVisible(color: OxyColorEx | OxyColor): boolean {
    if (!color) return false
    const c = OxyColorEx.fromOxyColor(color)
    return c.a > 0
  }

  /**
   * Determines whether the current color is undefined.
   * @returns True if the color equals OxyColors.Undefined.
   */
  static isUndefined(color: OxyColorEx | OxyColor): boolean {
    return this.equals(color, OxyColor_Undefined)
  }

  /**
   * Determines whether the current color is automatic.
   * @returns True if the color equals OxyColors.Automatic.
   */
  static isAutomatic(color: OxyColorEx | OxyColor): boolean {
    return this.equals(color, OxyColor_Automatic)
  }

  /**
   * Gets the actual color.
   * @returns The default color if the current color equals OxyColors.Automatic, otherwise the color itself.
   */
  static getActualColor(c: OxyColor | OxyColorEx, defaultColor: OxyColor | OxyColorEx): OxyColor {
    if (this.isAutomatic(c)) return this.getOxyColor(defaultColor)
    return this.getOxyColor(c)
  }

  /**
   * Changes the intensity.
   * @param color The color.
   * @param factor The factor.
   * @returns A color with the new intensity.
   */
  static changeIntensity(color: OxyColor | OxyColorEx, factor: number): OxyColorEx {
    const hsv = this.toHsv(color)
    hsv[2] *= factor
    if (hsv[2] > 1.0) {
      hsv[2] = 1.0
    }

    return OxyColorEx.fromHsv(hsv[0], hsv[1], hsv[2])
  }

  /**
   * Changes the saturation.
   * @param color The color.
   * @param factor The factor.
   * @returns A color with the new saturation.
   */
  static changeSaturation(color: OxyColor | OxyColorEx, factor: number): OxyColorEx {
    const hsv = this.toHsv(color)
    hsv[1] *= factor
    if (hsv[1] > 1.0) {
      hsv[1] = 1.0
    }

    return OxyColorEx.fromHsv(hsv[0], hsv[1], hsv[2])
  }

  /**
   * Changes the opacity.
   * @param color The color.
   * @param factor The factor.
   * @returns A color with the new opacity.
   */
  static changeOpacity(color: OxyColor | OxyColorEx, factor: number): OxyColorEx {
    const { a } = OxyColorEx.fromOxyColor(color)
    return OxyColorEx.fromAColor(Math.round(a * factor), color)
  }

  /**
   * Calculates the complementary color.
   * @param color The color to convert.
   * @returns The complementary color.
   */
  static complementary(color: OxyColor | OxyColorEx): OxyColorEx {
    // http://en.wikipedia.org/wiki/Complementary_Color
    const hsv = this.toHsv(color)
    let newHue = hsv[0] - 0.5

    // clamp to [0,1]
    if (newHue < 0) {
      newHue += 1.0
    }

    return OxyColorEx.fromHsv(newHue, hsv[1], hsv[2])
  }

  /**
   * Converts from a `OxyColor` to HSV values (double)
   * @param color The color.
   * @returns Array of [Hue,Saturation,Value] in the range [0,1]
   */
  static toHsv(color: OxyColor | OxyColorEx): number[] {
    const { r, g, b } = OxyColorEx.fromOxyColor(color)

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
  }

  /**
   * Converts to an unsigned integer.
   * @param color The color.
   * @returns The color as an unsigned integer.
   */
  static toUint(color: OxyColor | OxyColorEx): number {
    const { r, g, b, a } = OxyColorEx.fromOxyColor(color)
    let u = toUint(a << 24)
    u += toUint(r << 16)
    u += toUint(g << 8)
    u += toUint(b)
    return toUint(u)
  }

  /**
   * Converts an OxyColor to a string containing the ARGB byte values.
   * @param color The color.
   * @returns A string that contains byte values of the alpha, red, green and blue components separated by comma.
   */
  static toByteString(color: OxyColor | OxyColorEx): string {
    const { r, g, b, a } = OxyColorEx.fromOxyColor(color)
    return `${a},${r},${g},${b}`
  }

  /**
   * Calculate the difference in hue between two `OxyColor`s.
   * @param c1 The first color.
   * @param c2 The second color.
   * @returns The hue difference.
   */
  static hueDifference(c1: OxyColor, c2: OxyColor): number {
    const hsv1 = this.toHsv(c1)
    const hsv2 = this.toHsv(c2)
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
  }
}

function isHexString(color: string) {
  if (!color) return false
  if (color.startsWith('#')) color = color.substring(1)
  if (color.length === 8 || color.length === 6 || color.length === 3) {
    return /^[0-9A-F]+$/.test(color.toUpperCase())
  }
  return false
}

function numToHex(v: number) {
  return v.toString(16).padStart(2, '0')
}

function toByte(n: number) {
  return Math.round(n)
}

/**
 * Implements a set of predefined colors.
 */
export const OxyColors = {
  /** The undefined color. */
  Undefined: OxyColor_Undefined,

  /** The automatic color. */
  Automatic: OxyColor_Automatic,

  /** The alice blue. */
  AliceBlue: '#f0f8ff',

  /** The antique white. */
  AntiqueWhite: '#faebd7',

  /** The aqua. */
  Aqua: '#0ff',

  /** The aquamarine. */
  Aquamarine: '#7fffd4',

  /** The azure. */
  Azure: '#f0ffff',

  /** The beige. */
  Beige: '#f5f5dc',

  /** The bisque. */
  Bisque: '#ffe4c4',

  /** The black. */
  Black: '#000',

  /** The blanched almond. */
  BlanchedAlmond: '#ffebcd',

  /** The blue. */
  Blue: '#00f',

  /** The blue violet. */
  BlueViolet: '#8a2be2',

  /** The brown. */
  Brown: '#a52a2a',

  /** The burly wood. */
  BurlyWood: '#deb887',

  /** The cadet blue. */
  CadetBlue: '#5f9ea0',

  /** The chartreuse. */
  Chartreuse: '#7fff00',

  /** The chocolate. */
  Chocolate: '#d2691e',

  /** The coral. */
  Coral: '#ff7f50',

  /** The cornflower blue. */
  CornflowerBlue: '#6495ed',

  /** The cornsilk. */
  Cornsilk: '#fff8dc',

  /** The crimson. */
  Crimson: '#dc143c',

  /** The cyan. */
  Cyan: '#0ff',

  /** The dark blue. */
  DarkBlue: '#00008b',

  /** The dark cyan. */
  DarkCyan: '#008b8b',

  /** The dark goldenrod. */
  DarkGoldenrod: '#b8860b',

  /** The dark gray. */
  DarkGray: '#a9a9a9',

  /** The dark green. */
  DarkGreen: '#006400',

  /** The dark khaki. */
  DarkKhaki: '#bdb76b',

  /** The dark magenta. */
  DarkMagenta: '#8b008b',

  /** The dark olive green. */
  DarkOliveGreen: '#556b2f',

  /** The dark orange. */
  DarkOrange: '#ff8c00',

  /** The dark orchid. */
  DarkOrchid: '#9932cc',

  /** The dark red. */
  DarkRed: '#8b0000',

  /** The dark salmon. */
  DarkSalmon: '#e9967a',

  /** The dark sea green. */
  DarkSeaGreen: '#8fbc8f',

  /** The dark slate blue. */
  DarkSlateBlue: '#483d8b',

  /** The dark slate gray. */
  DarkSlateGray: '#2f4f4f',

  /** The dark turquoise. */
  DarkTurquoise: '#00ced1',

  /** The dark violet. */
  DarkViolet: '#9400d3',

  /** The deep pink. */
  DeepPink: '#ff1493',

  /** The deep sky blue. */
  DeepSkyBlue: '#00bfff',

  /** The dim gray. */
  DimGray: '#696969',

  /** The dodger blue. */
  DodgerBlue: '#1e90ff',

  /** The firebrick. */
  Firebrick: '#b22222',

  /** The floral white. */
  FloralWhite: '#fffaf0',

  /** The forest green. */
  ForestGreen: '#228b22',

  /** The fuchsia. */
  Fuchsia: '#f0f',

  /** The gainsboro. */
  Gainsboro: '#dcdcdc',

  /** The ghost white. */
  GhostWhite: '#f8f8ff',

  /** The gold. */
  Gold: '#ffd700',

  /** The goldenrod. */
  Goldenrod: '#daa520',

  /** The gray. */
  Gray: '#808080',

  /** The green. */
  Green: '#008000',

  /** The green yellow. */
  GreenYellow: '#adff2f',

  /** The honeydew. */
  Honeydew: '#f0fff0',

  /** The hot pink. */
  HotPink: '#ff69b4',

  /** The indian red. */
  IndianRed: '#cd5c5c',

  /** The indigo. */
  Indigo: '#4b0082',

  /** The ivory. */
  Ivory: '#fffff0',

  /** The khaki. */
  Khaki: '#f0e68c',

  /** The lavender. */
  Lavender: '#e6e6fa',

  /** The lavender blush. */
  LavenderBlush: '#fff0f5',

  /** The lawn green. */
  LawnGreen: '#7cfc00',

  /** The lemon chiffon. */
  LemonChiffon: '#fffacd',

  /** The light blue. */
  LightBlue: '#add8e6',

  /** The light coral. */
  LightCoral: '#f08080',

  /** The light cyan. */
  LightCyan: '#e0ffff',

  /** The light goldenrod yellow. */
  LightGoldenrodYellow: '#fafad2',

  /** The light gray. */
  LightGray: '#d3d3d3',

  /** The light green. */
  LightGreen: '#90ee90',

  /** The light pink. */
  LightPink: '#ffb6c1',

  /** The light salmon. */
  LightSalmon: '#ffa07a',

  /** The light sea green. */
  LightSeaGreen: '#20b2aa',

  /** The light sky blue. */
  LightSkyBlue: '#87cefa',

  /** The light slate gray. */
  LightSlateGray: '#789',

  /** The light steel blue. */
  LightSteelBlue: '#b0c4de',

  /** The light yellow. */
  LightYellow: '#ffffe0',

  /** The lime. */
  Lime: '#0f0',

  /** The lime green. */
  LimeGreen: '#32cd32',

  /** The linen. */
  Linen: '#faf0e6',

  /** The magenta. */
  Magenta: '#f0f',

  /** The maroon. */
  Maroon: '#800000',

  /** The medium aquamarine. */
  MediumAquamarine: '#66cdaa',

  /** The medium blue. */
  MediumBlue: '#0000cd',

  /** The medium orchid. */
  MediumOrchid: '#ba55d3',

  /** The medium purple. */
  MediumPurple: '#9370db',

  /** The medium sea green. */
  MediumSeaGreen: '#3cb371',

  /** The medium slate blue. */
  MediumSlateBlue: '#7b68ee',

  /** The medium spring green. */
  MediumSpringGreen: '#00fa9a',

  /** The medium turquoise. */
  MediumTurquoise: '#48d1cc',

  /** The medium violet red. */
  MediumVioletRed: '#c71585',

  /** The midnight blue. */
  MidnightBlue: '#191970',

  /** The mint cream. */
  MintCream: '#f5fffa',

  /** The misty rose. */
  MistyRose: '#ffe4e1',

  /** The moccasin. */
  Moccasin: '#ffe4b5',

  /** The navajo white. */
  NavajoWhite: '#ffdead',

  /** The navy. */
  Navy: '#000080',

  /** The old lace. */
  OldLace: '#fdf5e6',

  /** The olive. */
  Olive: '#808000',

  /** The olive drab. */
  OliveDrab: '#6b8e23',

  /** The orange. */
  Orange: '#ffa500',

  /** The orange red. */
  OrangeRed: '#ff4500',

  /** The orchid. */
  Orchid: '#da70d6',

  /** The pale goldenrod. */
  PaleGoldenrod: '#eee8aa',

  /** The pale green. */
  PaleGreen: '#98fb98',

  /** The pale turquoise. */
  PaleTurquoise: '#afeeee',

  /** The pale violet red. */
  PaleVioletRed: '#db7093',

  /** The papaya whip. */
  PapayaWhip: '#ffefd5',

  /** The peach puff. */
  PeachPuff: '#ffdab9',

  /** The peru. */
  Peru: '#cd853f',

  /** The pink. */
  Pink: '#ffc0cb',

  /** The plum. */
  Plum: '#dda0dd',

  /** The powder blue. */
  PowderBlue: '#b0e0e6',

  /** The purple. */
  Purple: '#800080',

  /** The red. */
  Red: '#f00',

  /** The rosy brown. */
  RosyBrown: '#bc8f8f',

  /** The royal blue. */
  RoyalBlue: '#4169e1',

  /** The saddle brown. */
  SaddleBrown: '#8b4513',

  /** The salmon. */
  Salmon: '#fa8072',

  /** The sandy brown. */
  SandyBrown: '#f4a460',

  /** The sea green. */
  SeaGreen: '#2e8b57',

  /** The seashell. */
  SeaShell: '#fff5ee',

  /** The sienna. */
  Sienna: '#a0522d',

  /** The silver. */
  Silver: '#c0c0c0',

  /** The sky blue. */
  SkyBlue: '#87ceeb',

  /** The slate blue. */
  SlateBlue: '#6a5acd',

  /** The slate gray. */
  SlateGray: '#708090',

  /** The snow. */
  Snow: '#fffafa',

  /** The spring green. */
  SpringGreen: '#00ff7f',

  /** The steel blue. */
  SteelBlue: '#4682b4',

  /** The tan. */
  Tan: '#d2b48c',

  /** The teal. */
  Teal: '#008080',

  /** The thistle. */
  Thistle: '#d8bfd8',

  /** The tomato. */
  Tomato: '#ff6347',

  /** The transparent. */
  Transparent: '#00ffffff',

  /** The turquoise. */
  Turquoise: '#40e0d0',

  /** The violet. */
  Violet: '#ee82ee',

  /** The wheat. */
  Wheat: '#f5deb3',

  /** The white. */
  White: '#fff' as OxyColor,

  /** The white smoke. */
  WhiteSmoke: '#f5f5f5',

  /** The yellow. */
  Yellow: '#ff0',

  /** The yellow green. */
  YellowGreen: '#9acd32',
} as const

Object.freeze(OxyColors)

export function getOxyColorByName(colorName: string): OxyColor | undefined {
  if (!colorName) return undefined
  colorName = colorName.toLowerCase()
  const oxyColors = OxyColors as Record<string, OxyColor>
  for (const name of Object.keys(oxyColors)) {
    if (name.toLowerCase() === colorName) return oxyColors[name]
  }
  return undefined
}
