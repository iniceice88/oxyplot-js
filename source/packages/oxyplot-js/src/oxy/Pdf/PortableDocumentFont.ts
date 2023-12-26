import { FontEncoding, FontSubType } from '@/oxyplot'

type ExtractProperties<T> = {
  [K in keyof T]: T[K]
}

export type CreatePortableDocumentFontType = Omit<ExtractProperties<PortableDocumentFont>, 'measure'>

/**
 * Represents a font that can be used in a PortableDocument.
 */
export class PortableDocumentFont {
  /**
   * Initializes a new instance of the PortableDocumentFont class.
   */
  constructor(opt: CreatePortableDocumentFontType) {
    this.firstChar = 0
    this.encoding = FontEncoding.WinAnsiEncoding
    this.subType = opt.subType
    this.baseFont = opt.baseFont
    this.encoding = opt.encoding
    this.firstChar = opt.firstChar
    this.widths = opt.widths
    this.ascent = opt.ascent
    this.capHeight = opt.capHeight
    this.descent = opt.descent
    this.flags = opt.flags
    this.fontBoundingBox = opt.fontBoundingBox
    this.italicAngle = opt.italicAngle
    this.stemV = opt.stemV
    this.xHeight = opt.xHeight
    this.fontName = opt.fontName
  }

  /**
   * The font subtype.
   */
  public subType: FontSubType

  /**
   * The base font.
   */
  public baseFont: string

  /**
   * The encoding.
   */
  public encoding: FontEncoding

  /**
   * The first character in the Widths array.
   */
  public firstChar: number

  /**
   * The character Widths array.
   */
  public widths: number[]

  /**
   * The font ascent.
   */
  public ascent: number

  /**
   * The font cap height.
   */
  public capHeight: number

  /**
   * The font descent.
   */
  public descent: number

  /**
   * The font flags.
   */
  public flags: number

  /**
   * The font bounding box.
   */
  public fontBoundingBox: number[]

  /**
   * The italic angle.
   */
  public italicAngle: number

  /**
   * The stem v.
   */
  public stemV: number

  /**
   * The x height.
   */
  public xHeight: number

  /**
   * The font name.
   */
  public fontName: string

  /**
   * Measures the specified text.
   * @param text The text.
   * @param fontSize The font size
   * @returns The width and height of the text.
   */
  public measure(text: string, fontSize: number): { width: number; height: number } {
    let wmax = 0

    const lines = text.split('\n')

    const lineCount = lines.length

    for (const line of lines) {
      let w = 0

      for (let i = 0; i < line.length; i++) {
        const c = line.charCodeAt(i)
        if (c >= this.firstChar + this.widths.length) {
          continue
        }

        w += this.widths[c - this.firstChar]
      }

      if (w > wmax) {
        wmax = w
      }
    }

    const width = (wmax * fontSize) / 1000
    const height = (lineCount * (this.ascent - this.descent) * fontSize) / 1000

    return { width, height }
  }
}
