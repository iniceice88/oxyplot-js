import type { IPortableDocumentObject, PortableDocumentFont } from '@/oxyplot'
import {
  FontEncoding,
  FontSubType,
  LineCap,
  LineJoin,
  ObjectType,
  ObjectTypeCls,
  PageOrientation,
  PageSize,
  PdfWriter,
  PortableDocumentImage,
  StandardFonts,
} from '@/oxyplot'
import { getEnumName, isUndef, round, toUint } from '@/patch'

const fixedNumber = (n: number, precision = 5) => {
  return round(n, precision).toString()
}

/**
 * Represents a document that can be output to PDF.
 */
export class PortableDocument {
  /**
   * The objects.
   */
  private readonly objects: PortableDocumentObject[] = []

  /**
   * The stroke alpha cache.
   */
  private readonly strokeAlphaCache: Map<number, string> = new Map()

  /**
   * The fill alpha cache.
   */
  private readonly fillAlphaCache: Map<number, string> = new Map()

  /**
   * The font cache.
   */
  private readonly fontCache: Map<PortableDocumentFont, string> = new Map()

  /**
   * The image cache.
   */
  private readonly imageCache: Map<PortableDocumentImage, string> = new Map()

  /**
   * The catalog object.
   */
  private readonly catalog: PortableDocumentObject

  /**
   * The pages object.
   */
  private readonly pages: PortableDocumentObject

  /**
   * The metadata object.
   */
  private readonly metadata: PortableDocumentObject

  /**
   * The resources object.
   */
  private readonly resources: PortableDocumentObject

  /**
   * The fonts dictionary.
   */
  private readonly fonts: Map<string, object> = new Map()

  /**
   * The x objects dictionary.
   */
  private readonly xobjects: Map<string, object> = new Map()

  /**
   * The ext g state dictionary.
   */
  private readonly extgstate: Map<string, object> = new Map()

  /**
   * The page reference objects.
   */
  private readonly pageReferences: PortableDocumentObject[] = []

  /**
   * The current page contents
   */
  private currentPageContents?: PortableDocumentObject

  /**
   * The current font
   */
  private currentFont: PortableDocumentFont

  /**
   * The current font size
   */
  private currentFontSize: number

  /**
   * Initializes a new instance of the PortableDocument class.
   */
  constructor() {
    this.metadata = this.addObject()
    this.metadata.set('/CreationDate', new Date())

    this.catalog = this.addObjectType(ObjectType.Catalog)
    this.pages = this.addObjectType(ObjectType.Pages)
    this.catalog.set('/Pages', this.pages)

    this.resources = this.addObject()

    // See chapter 10.1 - ProcSet is obsolete from version 1.4?
    this.resources.set('/ProcSet', ['/PDF', '/Text', '/ImageB', '/ImageC', '/ImageI'])

    this.resources.set('/Font', this.fonts)
    this.resources.set('/XObject', this.xobjects)
    this.resources.set('/ExtGState', this.extgstate)

    this.currentFont = StandardFonts.Helvetica.getFont(false, false)
    this.currentFontSize = 12
  }

  private _pageWidth: number = 0
  /**
   * Gets the width of the current page.
   */
  public get pageWidth(): number {
    return this._pageWidth
  }

  private _pageHeight: number = 0
  /**
   * Gets the height of the current page.
   */
  public get pageHeight(): number {
    return this._pageHeight
  }

  /**
   * Sets the title property.
   */
  public set title(value: string) {
    this.metadata.set('/Title', escapeString(value))
  }

  /**
   * Sets the author property.
   */
  public set author(value: string) {
    this.metadata.set('/Author', escapeString(value))
  }

  /**
   * Sets the subject property.
   */
  public set subject(value: string) {
    this.metadata.set('/Subject', escapeString(value))
  }

  /**
   * Sets the keywords property.
   */
  public set keywords(value: string) {
    this.metadata.set('/Keywords', escapeString(value))
  }

  /**
   * Sets the creator property.
   */
  public set creator(value: string) {
    this.metadata.set('/Creator', escapeString(value))
  }

  /**
   * Sets the producer property.
   */
  public set producer(value: string) {
    this.metadata.set('/Producer', escapeString(value))
  }

  /**
   * Sets the current line width.
   * @param w The line width in points.
   */
  public setLineWidth(w: number): void {
    this.appendLine(`${fixedNumber(w)} w`)
  }

  /**
   * Sets the line cap type.
   * @param cap The cap type.
   */
  public setLineCap(cap: LineCap): void {
    this.appendLine(`${cap} J`)
  }

  /**
   * Sets the line join type.
   * @param lineJoin The line join.
   */
  public setLineJoin(lineJoin: LineJoin): void {
    this.appendLine(`${lineJoin} j`)
  }

  /**
   * Sets the miter limit.
   * @param ml The limit.
   */
  public setMiterLimit(ml: number): void {
    this.appendLine(`${fixedNumber(ml)} M`)
  }

  /**
   * Sets the line dash pattern.
   * @param dashArray The dash array specifies the lengths of alternating dashes and gaps; the numbers must be nonnegative and not all zero.
   * @param dashPhase The dash phase specifies the distance into dash pattern at which to start the dash.
   */
  public setLineDashPattern(dashArray: number[], dashPhase: number): void {
    this.append('[')
    for (let i = 0; i < dashArray.length; i++) {
      if (i > 0) {
        this.append(' ')
      }

      this.append(fixedNumber(dashArray[i]))
    }

    this.appendLine(`]${fixedNumber(dashPhase)} d`)
  }

  /**
   * Resets the line dash pattern.
   */
  public resetLineDashPattern(): void {
    this.setLineDashPattern([], 0)
  }

  /**
   * Moves to the specified coordinate.
   * @param x1 The x1.
   * @param y1 The y1.
   */
  public moveTo(x1: number, y1: number): void {
    this.appendLine(`${fixedNumber(x1)} ${fixedNumber(y1)} m`)
  }

  /**
   * Appends a straight line segment to the current path.
   * @param x1 The x1.
   * @param y1 The y1.
   */
  public lineTo(x1: number, y1: number): void {
    this.appendLine(`${fixedNumber(x1)} ${fixedNumber(y1)} l`)
  }

  /**
   * Appends a cubic Bézier curve to the current path.
   * @param x1 The x1.
   * @param y1 The y1.
   * @param x2 The x2.
   * @param y2 The y2.
   * @param x3 The x3.
   * @param y3 The y3.
   */
  public appendCubicBezier(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    this.appendLine(
      `${fixedNumber(x1)} ${fixedNumber(y1)} ${fixedNumber(x2)} ${fixedNumber(y2)} ${fixedNumber(x3)} ${fixedNumber(
        y3,
      )} c`,
    )
  }

  /**
   * Saves the current graphics state.
   */
  public saveState(): void {
    this.appendLine('q')
  }

  /**
   * Restores the graphics state.
   */
  public restoreState(): void {
    this.appendLine('Q')
  }

  /**
   * Translates the current transformation matrix.
   * @param x The x-translation.
   * @param y The y-translation.
   */
  public translate(x: number, y: number): void {
    this.transform(1, 0, 0, 1, x, y)
  }

  /**
   * Scales the current transformation matrix.
   * @param sx The x-scale.
   * @param sy The y-scale.
   */
  public scale(sx: number, sy: number): void {
    this.transform(sx, 0, 0, sy, 0, 0)
  }

  /**
   * Modifies the current transformation matrix (CTM).
   * @param a The a.
   * @param b The b.
   * @param c The c.
   * @param d The d.
   * @param e The e.
   * @param f The f.
   */
  public transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    // Modify the current transformation matrix (CTM) by concatenating the specified matrix.
    this.appendLine(
      `${fixedNumber(a)} ${fixedNumber(b)} ${fixedNumber(c)} ${fixedNumber(d)} ${fixedNumber(e)} ${fixedNumber(f)} cm`,
    )
  }

  /**
   * Sets the vertical text scaling.
   * @param scale A number specifying the percentage of the normal height.
   */
  public setHorizontalTextScaling(scale: number): void {
    this.appendLine(`${fixedNumber(scale)} Tz`)
  }

  /**
   * Rotates by the specified angle around the specified point.
   * @param x The x-coordinate of the rotation centre.
   * @param y The y-coordinate of the rotation centre.
   * @param angle The rotation angle in degrees.
   */
  public rotateAt(x: number, y: number, angle: number): void {
    this.translate(x, y)
    this.rotate(angle)
    this.translate(-x, -y)
  }

  /**
   * Rotates by the specified angle.
   * @param angle The rotation angle in degrees.
   */
  public rotate(angle: number): void {
    const theta = (angle / 180) * Math.PI
    this.transform(Math.cos(theta), Math.sin(theta), -Math.sin(theta), Math.cos(theta), 0, 0)
  }

  /**
   * Sets the stroke alpha.
   * @param alpha The alpha value [0,1].
   */
  public setStrokeAlpha(alpha: number): void {
    const gs = getCached(alpha, this.strokeAlphaCache, () => this.addExtGState('/CA', alpha))
    this.appendLine(`${gs} gs`)
  }

  /**
   * Sets the fill alpha.
   * @param alpha The alpha value [0,1].
   */
  public setFillAlpha(alpha: number): void {
    const gs = getCached(alpha, this.fillAlphaCache, () => this.addExtGState('/ca', alpha))
    this.appendLine(`${gs} gs`)
  }

  /**
   * Strokes the path.
   * @param close Closes the path if set to true.
   */
  public stroke(close = true): void {
    this.appendLine(close ? 's' : 'S')
  }

  /**
   * Fills the path.
   * @param evenOddRule Use the even-odd fill rule if set to true. Use the nonzero winding number rule if set to false.
   */
  public fill(evenOddRule = false): void {
    this.appendLine(evenOddRule ? 'f>' : 'f')
  }

  /**
   * Fills and strokes the path.
   * @param close Closes the path if set to true.
   * @param evenOddRule Use the even-odd fill rule if set to true. Use the nonzero winding number rule if set to false.
   */
  public fillAndStroke(close = true, evenOddRule = false): void {
    if (evenOddRule) {
      this.appendLine(close ? 'b>' : 'B>')
    } else {
      this.appendLine(close ? 'b' : 'B')
    }
  }

  /**
   * Sets the clipping path.
   * @param evenOddRule Use the even-odd fill rule if set to true. Use the nonzero winding number rule if set to false.
   */
  public setClippingPath(evenOddRule = false): void {
    this.appendLine(evenOddRule ? 'W>' : 'W')
  }

  /**
   * Ends the path.
   */
  public endPath(): void {
    this.appendLine('n')
  }

  /**
   * Closes the subpath.
   */
  public closeSubPath(): void {
    this.appendLine('h')
  }

  /**
   * Appends a rectangle to the current path.
   * @param x The x-coordinate of the lower-left corner.
   * @param y The y-coordinate of the lower-left corner.
   * @param w The width.
   * @param h The height.
   */
  public appendRectangle(x: number, y: number, w: number, h: number): void {
    this.appendLine(`${fixedNumber(x)} ${fixedNumber(y)} ${fixedNumber(w)} ${fixedNumber(h)} re`)
  }

  /**
   * Draws a line connecting the two points specified by the coordinate pairs.
   * @param x1 The x-coordinate of the first point.
   * @param y1 The y-coordinate of the first point.
   * @param x2 The x-coordinate of the second point.
   * @param y2 The y-coordinate of the second point.
   */
  public drawLine(x1: number, y1: number, x2: number, y2: number): void {
    this.appendLine(`${fixedNumber(x1)} ${fixedNumber(y1)} m ${fixedNumber(x2)} ${fixedNumber(y2)} l S`)
  }

  /**
   * Draws a rectangle.
   * @param x The x-coordinate of the lower-left corner.
   * @param y The y-coordinate of the lower-left corner.
   * @param w The width.
   * @param h The height.
   * @param fill Fill the rectangle if set to true.
   */
  public drawRectangle(x: number, y: number, w: number, h: number, fill = false): void {
    const f = fill ? 'B' : 'S'
    this.appendLine(`${fixedNumber(x)} ${fixedNumber(y)} ${fixedNumber(w)} ${fixedNumber(h)} re ${f}`)
  }

  /**
   * Sets the clipping rectangle.
   * @param x The x-coordinate of the lower-left corner.
   * @param y The y-coordinate of the lower-left corner.
   * @param w The width.
   * @param h The height.
   * @param evenOddRule Use the even-odd region rule if set to true.
   */
  public setClippingRectangle(x: number, y: number, w: number, h: number, evenOddRule = false): void {}

  /**
   * Fills a rectangle.
   * @param x The x-coordinate of the lower-left corner.
   * @param y The y-coordinate of the lower-left corner.
   * @param w The width.
   * @param h The height.
   */
  public fillRectangle(x: number, y: number, w: number, h: number): void {
    this.appendLine(`${fixedNumber(x)} ${fixedNumber(y)} ${fixedNumber(w)} ${fixedNumber(h)} re f`)
  }

  /**
   * Draws a circle.
   * @param x The x-coordinate of the center.
   * @param y The y-coordinate of the center.
   * @param r The radius.
   * @param fill Fill the circle if set to true.
   */
  public drawCircle(x: number, y: number, r: number, fill = false): void {
    this.drawEllipse(x - r, y - r, r * 2, r * 2, fill)
  }

  /**
   * Fills a circle.
   * @param x The x-coordinate of the center.
   * @param y The y-coordinate of the center.
   * @param r The radius.
   */
  public fillCircle(x: number, y: number, r: number): void {
    this.fillEllipse(x - r, y - r, r * 2, r * 2)
  }

  /**
   * Draws an ellipse.
   * @param x The x-coordinate of the lower-left corner.
   * @param y The y-coordinate of the lower-left corner.
   * @param w The width.
   * @param h The height.
   * @param fill Fill the ellipse if set to true.
   */
  public drawEllipse(x: number, y: number, w: number, h: number, fill = false): void {
    this.appendEllipse(x, y, w, h)
    if (!fill) {
      this.stroke()
    } else {
      this.fillAndStroke()
    }
  }

  /**
   * Fills an ellipse.
   * @param x The x-coordinate of the lower-left corner.
   * @param y The y-coordinate of the lower-left corner.
   * @param w The width.
   * @param h The height.
   */
  public fillEllipse(x: number, y: number, w: number, h: number): void {
    this.appendEllipse(x, y, w, h)
    this.fill()
  }

  /**
   * Appends an ellipse to the current path.
   * @param x The x-coordinate of the lower-left corner.
   * @param y The y-coordinate of the lower-left corner.
   * @param w The width.
   * @param h The height.
   */
  public appendEllipse(x: number, y: number, w: number, h: number): void {
    const Kappa = 0.5522848
    const ox = w * 0.5 * Kappa // control point offset horizontal
    const oy = h * 0.5 * Kappa // control point offset vertical
    const xe = x + w // x-end
    const ye = y + h // y-end
    const xm = x + w * 0.5 // x-middle
    const ym = y + h * 0.5 // y-middle

    this.moveTo(x, ym)
    this.appendCubicBezier(x, ym - oy, xm - ox, y, xm, y)
    this.appendCubicBezier(xm + ox, y, xe, ym - oy, xe, ym)
    this.appendCubicBezier(xe, ym + oy, xm + ox, ye, xm, ye)
    this.appendCubicBezier(xm - ox, ye, x, ym + oy, x, ym)
  }

  /**
   * Sets the current font.
   * @param fontName The font name.
   * @param fontSize The font size in points.
   * @param bold Use bold font weight if set to true.
   * @param italic Use italic style if set to true.
   */
  public setFont(fontName: string, fontSize: number, bold = false, italic = false): void {
    this.currentFont = getFont(fontName, bold, italic)
    this.currentFontSize = fontSize
  }

  /**
   * Draws the text at the specified coordinate.
   * @param x The left x-coordinate.
   * @param y The bottom (!) y-coordinate.
   * @param text The text.
   */
  public drawText(x: number, y: number, text: string): void {
    if (!text) {
      return
    }

    const fontId = getCached(this.currentFont, this.fontCache, () => this.addFont(this.currentFont))
    this.appendLine('BT') // Begin text object
    this.appendLine(`${fontId} ${this.currentFontSize} Tf`)
    text = encodeString(text, this.currentFont.encoding)
    text = escapeString(text)

    y = y - (this.currentFont.descent * this.currentFontSize) / 1000
    this.appendLine(`${fixedNumber(x)} ${fixedNumber(y)} Td`) // Move to the start of the next line, offset from the start of the current line by (tx , ty ). tx and ty are numbers expressed in unscaled text space units.
    this.appendLine(`${text} Tj`) // Show text string`
    this.appendLine('ET') // End text object
  }

  /**
   * Measures the size of the specified text.
   * @param text The text.
   * @returns The width and height of the text.
   */
  public measureText(text: string): { width: number; height: number } {
    if (!text) {
      return { width: 0, height: 0 }
    }

    return this.currentFont.measure(text, this.currentFontSize)
  }

  /**
   * Draws an image.
   * @param image The image to draw.
   */
  public drawImage(image: PortableDocumentImage): void {
    if (!image) {
      throw new Error('image cannot be null')
    }

    const imageId = getCached(image, this.imageCache, () => this.addImage(image))
    this.appendLine(`${imageId} Do`)
  }

  /**
   * Sets the color in Device RGB color space.
   * @param r The red value.
   * @param g The green value.
   * @param b The blue value.
   */
  public setColor(r: number, g: number, b: number): void {
    this.appendLine(`${fixedNumber(r)} ${fixedNumber(g)} ${fixedNumber(b)} RG`)
  }

  /**
   * Sets the color in CMYK color space.
   * @param c The cyan value.
   * @param m The magenta value.
   * @param y The yellow value.
   * @param k The black value.
   */
  public setColorCMYK(c: number, m: number, y: number, k: number): void {
    this.appendLine(`${fixedNumber(c)} ${fixedNumber(m)} ${fixedNumber(y)} ${fixedNumber(k)} K`)
  }

  /**
   * Sets the fill color in Device RGB color space.
   * @param r The red value.
   * @param g The green value.
   * @param b The blue value.
   */
  public setFillColor(r: number, g: number, b: number): void {
    this.appendLine(`${fixedNumber(r)} ${fixedNumber(g)} ${fixedNumber(b)} rg`)
  }

  /**
   * Adds a page.
   * @param pageSize The page size.
   * @param pageOrientation The page orientation.
   */
  public addPage(pageSize: PageSize, pageOrientation: PageOrientation = PageOrientation.Portrait): void {
    let shortLength: number = NaN,
      longLength: number = NaN
    switch (pageSize) {
      case PageSize.A4:
        shortLength = 595
        longLength = 842
        break
      case PageSize.A3:
        shortLength = 842
        longLength = 1190
        break
      case PageSize.Letter:
        shortLength = 612
        longLength = 792
        break
    }

    if (pageOrientation === PageOrientation.Portrait) {
      this.addPageWithDimensions(shortLength, longLength)
    } else {
      this.addPageWithDimensions(longLength, shortLength)
    }
  }

  /**
   * Adds a page specified by width and height.
   * @param width The page width in points.
   * @param height The page height in points.
   */
  public addPageWithDimensions(width: number = 595, height: number = 842): void {
    this._pageWidth = width
    this._pageHeight = height
    this.currentPageContents = this.addObject()

    const page1 = this.addObjectType(ObjectType.Page)
    page1.set('/Parent', this.pages)
    page1.set('/MediaBox', [0, 0, width, height])
    page1.set('/Contents', this.currentPageContents)
    page1.set('/Resources', this.resources)
    this.pageReferences.push(page1)
  }

  /**
   * Saves the document to the specified stream.
   */
  public save(): ArrayBuffer {
    const w = new PdfWriter()

    // update the Pages dictionary
    this.pages.set('/Count', this.pageReferences.length)
    this.pages.set('/Kids', this.pageReferences)

    // HEADER
    w.writeLine('%PDF-1.3')

    // BODY
    const objectPosition = new Map<PortableDocumentObject, number>()
    for (const o of this.objects) {
      objectPosition.set(o, w.position)
      o.write(w)
    }

    // CROSS-REFERENCE TABLE
    const xrefPosition = w.position
    w.writeLine('xref')
    w.writeLine(`0 ${this.objects.length + 1}`)
    w.writeLine('0000000000 65535 f ')
    for (const o of this.objects) {
      const position = objectPosition.get(o)
      const positionStr = position ? position.toString().padStart(10, '0') : '0000000000'
      w.writeLine(`${positionStr} 00000 n `)
    }

    // TRAILER
    w.writeLine('trailer')
    const trailer = new Map<string, any>([
      ['/Size', this.objects.length + 1],
      ['/Root', this.catalog],
      ['/Info', this.metadata],
    ])
    w.writeDictionary(trailer)
    w.writeLine()

    // Start of cross-reference table
    w.writeLine('startxref')
    w.writeLine(xrefPosition.toString())

    // write PDF end of file marker
    w.writeString('%%EOF')

    return w.getStream()
  }

  /**
   * Adds an object to the document.
   * @returns The added object.
   */
  private addObject(): PortableDocumentObject {
    const obj = new PortableDocumentObject(this.objects.length + 1)
    this.objects.push(obj)
    return obj
  }

  /**
   * Adds an object of the specified type.
   * @param type The object type.
   * @returns The added object.
   */
  private addObjectType(type: ObjectType): PortableDocumentObject {
    const obj = this.addObject()
    obj.set('/Type', ObjectTypeCls.from(type))
    return obj
  }

  /**
   * Adds an ExtGState object.
   * @param key The key.
   * @param value The value.
   * @returns The added object.
   */
  private addExtGState(key: string, value: any): string {
    const gs = this.addObjectType(ObjectType.ExtGState)
    gs.set(key, value)
    const statekey = '/GS' + this.extgstate.size
    this.extgstate.set(statekey, gs)
    return statekey
  }

  /**
   * Adds an image.
   * @param image The image.
   * @returns The added object.
   */
  private addImage(image: PortableDocumentImage): string {
    const i = this.xobjects.size + 1
    const imageObject = this.addObjectType(ObjectType.XObject)
    imageObject.set('/Subtype', '/Image')
    imageObject.set('/Width', image.width)
    imageObject.set('/Height', image.height)
    imageObject.set('/ColorSpace', '/' + image.colorSpace)
    imageObject.set('/Interpolate', image.interpolate)
    imageObject.set('/BitsPerComponent', image.bitsPerComponent)

    const encodedData = ascii85Encode(image.bits)
    imageObject.set('/Length', encodedData.length)
    imageObject.set('/Filter', '/ASCII85Decode')

    imageObject.append(encodedData)
    const imageId = '/Image' + i
    this.xobjects.set(imageId, imageObject)

    if (image.maskBits) {
      const maskImage = this.addObjectType(ObjectType.XObject)
      maskImage.set('/Subtype', '/Image')
      maskImage.set('/Width', image.width)
      maskImage.set('/Height', image.height)
      maskImage.set('/ColorSpace', '/DeviceGray')
      maskImage.set('/Interpolate', image.interpolate)
      maskImage.set('/BitsPerComponent', image.bitsPerComponent)
      const encodedMaskData = ascii85Encode(image.maskBits)
      maskImage.set('/Length', encodedMaskData.length)
      maskImage.set('/Filter', '/ASCII85Decode')
      maskImage.append(encodedMaskData)
      imageObject.set('/SMask', maskImage)
    }

    return imageId
  }

  /**
   * Adds a font.
   * @param font The font.
   * @returns The added object.
   */
  private addFont(font: PortableDocumentFont): string {
    let fd: PortableDocumentObject | undefined = undefined
    if (font.subType !== FontSubType.Type1) {
      fd = this.addObjectType(ObjectType.FontDescriptor)
      fd.set('/Ascent', font.ascent)
      fd.set('/CapHeight', font.capHeight)
      fd.set('/Descent', font.descent)
      fd.set('/Flags', font.flags)
      fd.set('/FontBBox', font.fontBoundingBox)
      fd.set('/ItalicAngle', font.italicAngle)
      fd.set('/StemV', font.stemV)
      fd.set('/XHeight', font.xHeight)
      fd.set('/FontName', '/' + font.fontName)
    }

    const f = this.addObjectType(ObjectType.Font)
    f.set('/Subtype', '/' + getEnumName(FontSubType, font.subType))
    f.set('/Encoding', '/' + getEnumName(FontEncoding, font.encoding))
    f.set('/BaseFont', '/' + font.baseFont)
    if (fd) {
      f.set('/FontDescriptor', fd)
    }

    if (font.subType !== FontSubType.Type1) {
      // Optional for Type 1 fonts
      f.set('/FirstChar', font.firstChar)
      f.set('/LastChar', font.firstChar + font.widths.length - 1)
      f.set('/Widths', font.widths)
    }

    const i = this.fonts.size + 1
    const fontId = '/F' + i
    this.fonts.set(fontId, f)
    return fontId
  }

  /**
   * Appends a line to the current page contents.
   * @param str The  string.
   */
  private appendLine(str: string): void {
    this.append(str + '\n')
  }

  /**
   * Appends text to the current page contents.
   * @param str The  string.
   */
  private append(str: string): void {
    if (!this.currentPageContents) {
      throw new Error('Cannot add content before a page has been added.')
    }
    this.currentPageContents.append(str)
  }
}

/**
 * Represents an object in the PortableDocument.
 * The object contains a dictionary and text content.
 */
class PortableDocumentObject implements IPortableDocumentObject {
  /**
   * The dictionary
   */
  private readonly dictionary: Map<string, any>

  /**
   * The object number
   */
  private readonly _objectNumber: number

  /**
   * The contents
   */
  private contents: string

  /**
   * Initializes a new instance of the PortableDocumentObject class.
   * @param objectNumber The object number.
   */
  constructor(objectNumber: number) {
    this._objectNumber = objectNumber
    this.contents = ''
    this.dictionary = new Map<string, any>()
  }

  /**
   * Gets the object number.
   */
  public get objectNumber(): number {
    return this._objectNumber
  }

  /**
   * Sets the dictionary value for the specified key.
   * @param key The key.
   * @param value The value.
   */
  public set(key: string, value: any): void {
    this.dictionary.set(key, value)
  }

  /**
   * Appends text to the content of the object.
   * @param str The  string.
   */
  public append(str: string): void {
    this.contents += str
  }

  /**
   * Appends a line to the content of the object.
   * @param str The  string.
   */
  public appendLine(str: string): void {
    this.contents += str + '\n'
  }

  /**
   * Writes the object to the specified PdfWriter.
   * @param w The writer.
   */
  public write(w: PdfWriter): void {
    w.writeLine(`${this.objectNumber} 0 obj`)

    const streamBytes: number[] = []

    if (this.contents && this.contents.length > 0) {
      const c = this.contents.trim()

      // convert to a byte[] buffer
      for (let i = 0; i < c.length; i++) {
        streamBytes.push(c.charCodeAt(i))
      }

      this.dictionary.set('/Length', streamBytes.length)
    }

    w.writeDictionary(this.dictionary)
    w.writeLine()

    if (streamBytes.length > 0) {
      w.writeLine('stream')
      w.writeBytes(streamBytes)
      w.writeLine()
      w.writeLine('endstream')
    }

    w.writeLine('endobj')
  }
}

/**
 * Gets a cached value.
 * @param key The key.
 * @param cache The cache dictionary.
 * @param create The create value function.
 * @returns The cached or created value.
 */
const getCached = <T1, T2>(key: T1, cache: Map<T1, T2>, create: () => T2): T2 => {
  let value = cache.get(key)
  if (!isUndef(value)) {
    return value
  }

  value = create()
  cache.set(key, value)
  return value
}

/**
 * Encodes the specified string.
 * @param text The text to encode.
 * @param encoding The target encoding.
 * @returns The encoded text
 */
const encodeString = (text: string, encoding: FontEncoding): string => {
  // TODO
  return text
}

/**
 * Escapes the specified string.
 * @param text The text.
 * @returns The encoded string.
 */
const escapeString = (text: string): string => {
  // Apply escape
  text = text.replace('\\', '\\\\')
  text = text.replace('(', '\\(')
  text = text.replace(')', '\\)')

  // Enclose
  return '(' + text + ')'
}

/**
 * Encodes binary bits into a plaintext ASCII85 format string
 * @param ba binary bits to encode
 * @returns ASCII85 encoded string
 */
const ascii85Encode = (ba: number[]): string => {
  // http://en.wikipedia.org/wiki/Ascii85
  // http://www.codinghorror.com/blog/2005/10/c-implementation-of-ascii85.html
  // PDF reference section 3.3.2
  const encodedBlock = new Uint8Array(5)
  let sb = ''
  const asciiOffset = 33

  const encodeBlock = (length: number, t: number) => {
    for (let i = encodedBlock.length - 1; i >= 0; i--) {
      encodedBlock[i] = (t % 85) + asciiOffset
      t = Math.floor(t / 85)
    }

    for (let i = 0; i < length; i++) {
      sb += String.fromCharCode(encodedBlock[i])
    }
  }

  let tuple = 0
  let count = 0
  for (const b of ba) {
    if (count >= 4 - 1) {
      tuple |= b
      if (tuple === 0) {
        sb += 'z'
      } else {
        encodeBlock(encodedBlock.length, tuple)
      }

      tuple = 0
      count = 0
    } else {
      tuple |= toUint(b << (24 - count * 8))
      count++
    }
  }

  // if we have some bytes left over at the end..
  if (count > 0) {
    encodeBlock(count + 1, tuple)
  }

  // EOD marker
  sb += '~>'

  return sb
}

/**
 * Gets the font.
 * @param fontName Name of the font.
 * @param bold Use bold if set to true.
 * @param italic Use italic if set to true.
 * @returns The font.
 */
const getFont = (fontName: string, bold: boolean, italic: boolean): PortableDocumentFont => {
  if (fontName) {
    fontName = fontName.toLowerCase()
  }

  switch (fontName) {
    case 'arial':
    case 'helvetica':
      return StandardFonts.Helvetica.getFont(bold, italic)
    case 'times':
    case 'times new roman':
      return StandardFonts.Times.getFont(bold, italic)
    case 'courier':
    case 'courier new':
      return StandardFonts.Courier.getFont(bold, italic)
    default:
      // Use Arial/Helvetica as default
      return StandardFonts.Helvetica.getFont(bold, italic)
  }
}
