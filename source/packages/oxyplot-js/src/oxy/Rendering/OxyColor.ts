import { toByte, trimString } from '@/patch'

/**
 * Describes a color in terms of alpha, red, green, and blue channels.
 */
export class OxyColor {
  /**
   * The undefined color.
   */
  private static readonly _undefined = OxyColor.fromUInt32(0x00000000)

  /**
   * The automatic color.
   */
  private static readonly _automatic = OxyColor.fromUInt32(0x00000001)

  /**
   * The red component.
   */
  private readonly _r: number

  /**
   * The green component.
   */
  private readonly _g: number

  /**
   * The blue component.
   */
  private readonly _b: number

  /**
   * The alpha component.
   */
  private readonly _a: number

  /**
   * Initializes a new instance of the OxyColor class.
   * @param a The alpha value.
   * @param r The red value.
   * @param g The green value.
   * @param b The blue value.
   */
  constructor(a: number, r: number, g: number, b: number) {
    this._a = toByte(a)
    this._r = toByte(r)
    this._g = toByte(g)
    this._b = toByte(b)
  }

  /**
   * Gets the alpha value.
   */
  public get a(): number {
    return this._a
  }

  /**
   * Gets the blue value.
   */
  public get b(): number {
    return this._b
  }

  /**
   * Gets the green value.
   */
  public get g(): number {
    return this._g
  }

  /**
   * Gets the red value.
   */
  public get r(): number {
    return this._r
  }

  /**
   * Parse a string.
   * @param value The string in the format "#FFFFFF00" or "255,200,180,50".
   * @returns The parsed color.
   * @throws Error if the format is invalid.
   */
  public static parse(value: string): OxyColor {
    if (!value || value.toLowerCase() === 'none') {
      return this._undefined
    }

    if (value.toLowerCase() === 'auto') {
      return this._automatic
    }

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

      return OxyColor.fromUInt32(u)
    }

    const values = value.split(',')
    if (values.length < 3 || values.length > 4) {
      throw new Error('Invalid format.')
    }

    let i = 0

    let alpha = 255
    if (values.length > 3) {
      alpha = parseInt(values[i], 10)
      i++
    }

    const red = parseInt(values[i], 10)
    const green = parseInt(values[i + 1], 10)
    const blue = parseInt(values[i + 2], 10)
    return OxyColor.fromArgb(alpha, red, green, blue)
  }

  /**
   * Calculates the difference between two OxyColors.
   * @param c1 The first color.
   * @param c2 The second color.
   * @returns L2-norm in ARGB space.
   */
  public static colorDifference(c1: OxyColor, c2: OxyColor): number {
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
  public static fromUInt32(color: number): OxyColor {
    const a = (color >> 24) & 0xff
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff
    return OxyColor.fromArgb(a, r, g, b)
  }

  /**
   * Converts from HSV to `OxyColor`.
   * @param hue The hue value [0,1]
   * @param sat The saturation value [0,1]
   * @param val The intensity value [0,1]
   * @returns The `OxyColor`.
   * @remarks See [Wikipedia](http://en.wikipedia.org/wiki/HSL_Color_space).
   */
  public static fromHsv(hue: number, sat: number, val: number): OxyColor {
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

    return OxyColor.fromRgb(r * 255, g * 255, b * 255)
  }

  /**
   * Creates a color defined by an alpha value and another color.
   * @param a Alpha value.
   * @param color The original color.
   * @returns A color.
   */
  public static fromAColor(a: number, color: OxyColor): OxyColor {
    return OxyColor.fromArgb(a, color.r, color.g, color.b)
  }

  /**
   * Creates a color from the specified ARGB values.
   * @param a The alpha value.
   * @param r The red value.
   * @param g The green value.
   * @param b The blue value.
   * @returns A color.
   */
  public static fromArgb(a: number, r: number, g: number, b: number): OxyColor {
    return new OxyColor(a, r, g, b)
  }

  /**
   * Creates a new `OxyColor` structure from the specified RGB values.
   * @param r The red value.
   * @param g The green value.
   * @param b The blue value.
   * @returns An `OxyColor` structure with the specified values and an alpha channel value of 1.
   */
  public static fromRgb(r: number, g: number, b: number): OxyColor {
    return new OxyColor(255, r, g, b)
  }

  /**
   * Interpolates the specified colors.
   * @param color1 The color1.
   * @param color2 The color2.
   * @param t The t.
   * @returns The interpolated color
   */
  public static interpolate(color1: OxyColor, color2: OxyColor, t: number): OxyColor {
    const a = color1.a * (1 - t) + color2.a * t
    const r = color1.r * (1 - t) + color2.r * t
    const g = color1.g * (1 - t) + color2.g * t
    const b = color1.b * (1 - t) + color2.b * t
    return OxyColor.fromArgb(toByte(a), toByte(r), toByte(g), toByte(b))
  }

  /**
   * Determines whether the specified OxyColor is equal to the current instance.
   * @param other The OxyColor to compare with the current instance.
   * @returns true if the specified OxyColor is equal to the current instance; otherwise, false.
   */
  public equals(other: OxyColor): boolean {
    return other.a === this.a && other.r === this.r && other.g === this.g && other.b === this.b
  }

  public toArgb(): string {
    return this.toArgbInner('start')
  }

  public toRgba(): string {
    return this.toArgbInner('end')
  }

  public toRgb(): string {
    return this.toArgbInner('none')
  }

  private toArgbInner(aPosition: 'none' | 'start' | 'end') {
    const toHex = (v: number) => v.toString(16).padStart(2, '0')
    const rgb = `${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`

    if (aPosition === 'start') return `#${toHex(this.a)}${rgb}`
    else if (aPosition === 'end') return `#${rgb}${toHex(this.a)}`

    return `#${rgb}`
    //return `#${toHex(this.a)}${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`
  }

  /**
   * Returns a string that represents the current instance.
   * @returns A string that represents the current instance.
   */
  public toString(): string {
    return this.toArgb()
  }

  /**
   * Determines whether the current color is invisible.
   * @returns True if the alpha value is 0.
   */
  public isInvisible(): boolean {
    return this.a === 0
  }

  /**
   * Determines whether the current color is visible.
   * @returns True if the alpha value is greater than 0.
   */
  public isVisible(): boolean {
    return this.a > 0
  }

  /**
   * Determines whether the current color is undefined.
   * @returns True if the color equals OxyColors.Undefined.
   */
  public isUndefined(): boolean {
    return this.equals(OxyColor._undefined)
  }

  /**
   * Determines whether the current color is automatic.
   * @returns True if the color equals OxyColors.Automatic.
   */
  public isAutomatic(): boolean {
    return this.equals(OxyColor._automatic)
  }

  /**
   * Gets the actual color.
   * @param defaultColor The default color.
   * @returns The default color if the current color equals OxyColors.Automatic, otherwise the color itself.
   */
  public getActualColor(defaultColor: OxyColor): OxyColor {
    return this.isAutomatic() ? defaultColor : this
  }
}

function toByte(n: number) {
  return Math.round(n)
}
