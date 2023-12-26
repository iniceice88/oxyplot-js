import type { PortableDocumentFont } from '@/oxyplot'

type ExtractProperties<T> = {
  [K in keyof T]: T[K]
}

export type CreatePortableDocumentFontFamilyType = Omit<ExtractProperties<PortableDocumentFontFamily>, 'getFont'>

/**
 * Represents a font family that can be used in a PortableDocument.
 */
export class PortableDocumentFontFamily {
  constructor(opt: CreatePortableDocumentFontFamilyType) {
    this.regularFont = opt.regularFont
    this.boldFont = opt.boldFont
    this.italicFont = opt.italicFont
    this.boldItalicFont = opt.boldItalicFont
  }

  /**
   * The regular font.
   */
  public regularFont: PortableDocumentFont

  /**
   * The bold font.
   */
  public boldFont: PortableDocumentFont

  /**
   * The italic font.
   */
  public italicFont: PortableDocumentFont

  /**
   * The bold and italic font.
   */
  public boldItalicFont: PortableDocumentFont

  /**
   * Gets the font with the specified weight and style.
   * @param bold bold font weight.
   * @param italic italic/oblique font style.
   * @returns The font.
   */
  public getFont(bold: boolean, italic: boolean): PortableDocumentFont {
    if (bold && italic && this.boldItalicFont) {
      return this.boldItalicFont
    }

    if (bold && this.boldFont) {
      return this.boldFont
    }

    if (italic && this.italicFont) {
      return this.italicFont
    }

    return this.regularFont
  }
}
