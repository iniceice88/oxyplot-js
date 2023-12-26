import type { IRenderContext } from '@/oxyplot'
import { HorizontalAlignment, OxyColor, OxyColors, OxySize, ScreenPoint, VerticalAlignment } from '@/oxyplot'
import { indexOfAny, round, substring } from '@/patch'

/**
 * The subscript alignment.
 */
const SubAlignment = 0.6

/**
 * The subscript size.
 */
const SubSize = 0.62

/**
 * The superscript alignment.
 */
const SuperAlignment = 0

/**
 * The superscript size.
 */
const SuperSize = 0.62

/**
 * Provides functionality to render mathematical expressions.
 */
export class MathRenderingExtensions {
  /**
   * Draws or measures text containing sub- and superscript.
   * @param rc The render context.
   * @param pt The point.
   * @param text The text.
   * @param textColor Color of the text.
   * @param fontFamily The font family.
   * @param fontSize The font size.
   * @param fontWeight The font weight.
   * @param angle The angle.
   * @param ha The horizontal alignment.
   * @param va The vertical alignment.
   * @param maxSize The maximum size of the text.
   * @param measure Measure the size of the text if set to true.
   * @returns The size of the text.
   */
  public static async drawMathText(
    rc: IRenderContext,
    pt: ScreenPoint,
    text: string,
    textColor: OxyColor,
    fontFamily: string,
    fontSize: number,
    fontWeight: number,
    angle: number,
    ha: HorizontalAlignment,
    va: VerticalAlignment,
    maxSize?: OxySize,
    measure: boolean = false,
  ): Promise<OxySize> {
    if (!text) {
      return OxySize.Empty
    }
    if (text.includes('^{') || text.includes('_{')) {
      const x = pt.x
      const y = pt.y

      // Measure
      const size = await this.internalDrawMathText(
        rc,
        x,
        y,
        0,
        0,
        text,
        textColor,
        fontFamily,
        fontSize,
        fontWeight,
        true,
        angle,
      )

      let dx = 0
      let dy = 0

      switch (ha) {
        case HorizontalAlignment.Right:
          dx = -size.width
          break
        case HorizontalAlignment.Center:
          dx = -size.width * 0.5
          break
      }

      switch (va) {
        case VerticalAlignment.Bottom:
          dy = -size.height
          break
        case VerticalAlignment.Middle:
          dy = -size.height * 0.5
          break
      }

      await this.internalDrawMathText(rc, x, y, dx, dy, text, textColor, fontFamily, fontSize, fontWeight, false, angle)
      return measure ? size : OxySize.Empty
    }

    await rc.drawText(pt, text, textColor, fontFamily, fontSize, fontWeight, angle, ha, va, maxSize)
    if (measure) {
      return rc.measureText(text, fontFamily, fontSize, fontWeight)
    }

    return OxySize.Empty
  }

  /**
   * The measure math text.
   * @param rc The render context.
   * @param text The text.
   * @param fontFamily The font family.
   * @param fontSize The font size.
   * @param fontWeight The font weight.
   * @returns The size of the text.
   */
  public static async measureMathText(
    rc: IRenderContext,
    text: string,
    fontFamily: string,
    fontSize: number,
    fontWeight: number,
  ): Promise<OxySize> {
    if (text.includes('^{') || text.includes('_{')) {
      return this.internalDrawMathText(
        rc,
        0,
        0,
        0,
        0,
        text,
        OxyColors.Black,
        fontFamily,
        fontSize,
        fontWeight,
        true,
        0.0,
      )
    }

    return rc.measureText(text, fontFamily, fontSize, fontWeight)
  }

  /**
   * Draws text with sub- and superscript items.
   * @param rc The render context.
   * @param x The x.
   * @param y The y.
   * @param dx The x offset (in rotated coordinates).
   * @param dy The y offset (in rotated coordinates).
   * @param s The s.
   * @param textColor The text color.
   * @param fontFamily The font family.
   * @param fontSize The font size.
   * @param fontWeight The font weight.
   * @param measureOnly Only measure if set to true.
   * @param angle The angle of the text (degrees).
   * @returns The size of the text.
   */
  private static async internalDrawMathText(
    rc: IRenderContext,
    x: number,
    y: number,
    dx: number,
    dy: number,
    s: string,
    textColor: OxyColor,
    fontFamily: string,
    fontSize: number,
    fontWeight: number,
    measureOnly: boolean,
    angle: number,
  ): Promise<OxySize> {
    let i = 0
    const angleRadian = (angle * Math.PI) / 180.0
    const cosAngle = round(Math.cos(angleRadian), 5)
    const sinAngle = round(Math.sin(angleRadian), 5)

    let currentX = x
    let maximumX = x
    let minimumX = x
    const currentY = y
    let maximumY = y
    let minimumY = y

    // http://en.wikipedia.org/wiki/Subscript_and_superscript
    const superScriptYDisplacement = fontSize * SuperAlignment
    const subscriptYDisplacement = fontSize * SubAlignment
    const superscriptFontSize = fontSize * SuperSize
    const subscriptFontSize = fontSize * SubSize

    const drawText = async (xb: number, yb: number, text: string, fSize: number): Promise<OxySize> => {
      if (!measureOnly) {
        const xr = x + (xb - x + dx) * cosAngle - (yb - y + dy) * sinAngle
        const yr = y + (xb - x + dx) * sinAngle + (yb - y + dy) * cosAngle
        await rc.drawText(new ScreenPoint(xr, yr), text, textColor, fontFamily, fSize, fontWeight, angle)
      }

      const flatSize = rc.measureText(text, fontFamily, fSize, fontWeight)
      return new OxySize(flatSize.width, flatSize.height)
    }

    while (i < s.length) {
      if (i + 1 < s.length && s[i] === '^' && s[i + 1] === '{') {
        const i1 = s.indexOf('}', i)
        if (i1 !== -1) {
          const supString = substring(s, i + 2, i1 - i - 2)
          i = i1 + 1
          const sx = currentX
          const sy = currentY + superScriptYDisplacement
          const size = await drawText(sx, sy, supString, superscriptFontSize)
          maximumX = Math.max(sx + size.width, maximumX)
          maximumY = Math.max(sy + size.height, maximumY)
          minimumX = Math.min(sx, minimumX)
          minimumY = Math.min(sy, minimumY)
          continue
        }
      }

      if (i + 1 < s.length && s[i] === '_' && s[i + 1] === '{') {
        const i1 = s.indexOf('}', i)
        if (i1 !== -1) {
          const subString = substring(s, i + 2, i1 - i - 2)
          i = i1 + 1
          const sx = currentX
          const sy = currentY + subscriptYDisplacement
          const size = await drawText(sx, sy, subString, subscriptFontSize)
          maximumX = Math.max(sx + size.width, maximumX)
          maximumY = Math.max(sy + size.height, maximumY)
          minimumX = Math.min(sx, minimumX)
          minimumY = Math.min(sy, minimumY)
          continue
        }
      }

      const i2 = indexOfAny(s.split(''), ['^', '_'], i + 1)
      let regularString: string
      if (i2 === -1) {
        regularString = substring(s, i)
        i = s.length
      } else {
        regularString = substring(s, i, i2 - i)
        i = i2
      }

      currentX = maximumX + 2
      const size2 = await drawText(currentX, currentY, regularString, fontSize)

      maximumX = Math.max(currentX + size2.width, maximumX)
      maximumY = Math.max(currentY + size2.height, maximumY)
      minimumX = Math.min(currentX, minimumX)
      minimumY = Math.min(currentY, minimumY)

      currentX = maximumX
    }

    return new OxySize(maximumX - minimumX, maximumY - minimumY)
  }
}
