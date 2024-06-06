import {
  arrayBufferToBase64,
  EdgeRenderingMode,
  FontWeights,
  HorizontalAlignment,
  LineJoin,
  type OxyColor,
  OxyColorEx,
  OxyColorHelper,
  OxyColors,
  type OxyImage,
  round,
  type ScreenPoint,
  VerticalAlignment,
} from 'oxyplot-js'
import { XmlWriterBase } from './XmlWriterBase'

/**
 * Represents a writer that provides easy generation of Scalable Vector Graphics files.
 */
export class SvgWriter extends XmlWriterBase {
  private endIsWritten: boolean = false
  private clipPathNumber: number = 1
  public isDocument: boolean
  public numberFormat: (n: number) => string

  /**
   * Initializes a new instance of the SvgWriter class.
   * @param width The width (in user units).
   * @param height The height (in user units).
   * @param isDocument if set to true, the writer will write the xml headers (?xml and !DOCTYPE).
   */
  constructor(width: number, height: number, isDocument: boolean = true) {
    super()
    this.isDocument = isDocument
    this.numberFormat = (n: number) => round(n, 4).toString()
    this.writeHeader(width, height)
  }

  /**
   * Closes the svg document.
   */
  public close(): void {
    if (!this.endIsWritten) {
      this.complete()
    }
  }

  /**
   * Writes the end of the document.
   */
  public complete(): void {
    this.writeEndElement()
    if (this.isDocument) {
      this.writeEndDocument()
    }
    this.endIsWritten = true
  }

  /**
   * Creates a style.
   * @param fill The fill color.
   * @param stroke The stroke color.
   * @param thickness The stroke thickness (in user units).
   * @param dashArray The line dash array.
   * @param lineJoin The line join type.
   * @returns A style string.
   */
  public createStyle(
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    dashArray: number[] = [],
    lineJoin: LineJoin = LineJoin.Miter,
  ): string {
    const f = OxyColorEx.fromOxyColor(fill)
    // http://oreilly.com/catalog/svgess/chapter/ch03.html
    let style = ''
    if (OxyColorHelper.isInvisible(f)) {
      style += 'fill:none;'
    } else {
      style += `fill:${this.colorToString(f)};`
      if (f.a !== 0xff) {
        style += `fill-opacity:${f.a / 255.0};`
      }
    }

    const s = OxyColorEx.fromOxyColor(stroke)
    if (OxyColorHelper.isInvisible(stroke)) {
      style += 'stroke:none;'
    } else {
      const thicknessStr = this.numberFormat(thickness)
      style += `stroke:${this.colorToString(s)};stroke-width:${thicknessStr}`
      switch (lineJoin) {
        case LineJoin.Round:
          style += ';stroke-linejoin:round'
          break
        case LineJoin.Bevel:
          style += ';stroke-linejoin:bevel'
          break
      }

      if (s.a !== 0xff) {
        style += `;stroke-opacity:${s.a / 255.0}`
      }

      if (dashArray && dashArray.length > 0) {
        style += ';stroke-dasharray:'
        for (let i = 0; i < dashArray.length; i++) {
          style += `${i > 0 ? ',' : ''}${dashArray[i]}`
        }
      }
    }

    return style
  }

  /**
   * Writes an ellipse.
   * @param x The x-coordinate of the center.
   * @param y The y-coordinate of the center.
   * @param width The width.
   * @param height The height.
   * @param style The style.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public writeEllipse(
    x: number,
    y: number,
    width: number,
    height: number,
    style: string,
    edgeRenderingMode: EdgeRenderingMode,
  ): void {
    // http://www.w3.org/TR/SVG/shapes.html#EllipseElement
    this.writeStartElement('ellipse')
    this.writeAttributeNumberString('cx', x + width / 2)
    this.writeAttributeNumberString('cy', y + height / 2)
    this.writeAttributeNumberString('rx', width / 2)
    this.writeAttributeNumberString('ry', height / 2)
    this.writeAttributeString('style', style)
    this.writeEdgeRenderingModeAttribute(edgeRenderingMode)
    this.writeEndElement()
  }

  /**
   * Sets a clipping rectangle.
   * @param x The x coordinate of the clipping rectangle.
   * @param y The y coordinate of the clipping rectangle.
   * @param width The width of the clipping rectangle.
   * @param height The height of the clipping rectangle.
   */
  public beginClip(x: number, y: number, width: number, height: number): void {
    // http://www.w3.org/TR/SVG/masking.html
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath
    // http://www.svgbasics.com/clipping.html
    const clipPath = 'clipPath' + this.clipPathNumber++

    this.writeStartElement('defs')
    this.writeStartElement('clipPath')
    this.writeAttributeString('id', clipPath)
    this.writeStartElement('rect')
    this.writeAttributeNumberString('x', x)
    this.writeAttributeNumberString('y', y)
    this.writeAttributeNumberString('width', width)
    this.writeAttributeNumberString('height', height)
    this.writeEndElement() // rect
    this.writeEndElement() // clipPath
    this.writeEndElement() // defs

    this.writeStartElement('g')
    this.writeAttributeString('clip-path', `url(#${clipPath})`)
  }

  /**
   * Resets the clipping rectangle.
   */
  public endClip(): void {
    this.writeEndElement() // g
  }

  /**
   * Writes a portion of the specified image.
   * @param srcX The x-coordinate of the upper-left corner of the portion of the source image to draw.
   * @param srcY The y-coordinate of the upper-left corner of the portion of the source image to draw.
   * @param srcWidth Width of the portion of the source image to draw.
   * @param srcHeight Height of the portion of the source image to draw.
   * @param destX The destination x-coordinate.
   * @param destY The destination y-coordinate.
   * @param destWidth Width of the destination rectangle.
   * @param destHeight Height of the destination rectangle.
   * @param image The image.
   * @param interpolate Interpolate if set to true.
   */
  public writeImage(
    srcX: number,
    srcY: number,
    srcWidth: number,
    srcHeight: number,
    destX: number,
    destY: number,
    destWidth: number,
    destHeight: number,
    image: OxyImage,
    interpolate: boolean,
  ): void {
    const x = destX - (srcX / srcWidth) * destWidth
    const width = (image.width / srcWidth) * destWidth
    const y = destY - (srcY / srcHeight) * destHeight
    const height = (image.height / srcHeight) * destHeight
    this.beginClip(destX, destY, destWidth, destHeight)
    this.writeImage2(x, y, width, height, image, interpolate)
    this.endClip()
  }

  /**
   * Writes the specified image.
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   * @param width The width of the image.
   * @param height The height of the image.
   * @param image The image.
   * @param interpolate Interpolate if set to true.
   */
  public writeImage2(x: number, y: number, width: number, height: number, image: OxyImage, interpolate: boolean): void {
    // http://www.w3.org/TR/SVG/shapes.html#ImageElement
    this.writeStartElement('image')
    this.writeAttributeNumberString('x', x)
    this.writeAttributeNumberString('y', y)
    this.writeAttributeNumberString('width', width)
    this.writeAttributeNumberString('height', height)
    this.writeAttributeString('preserveAspectRatio', 'none')
    if (!interpolate) {
      this.writeAttributeString('image-rendering', 'pixelated')
    }
    const base64 = arrayBufferToBase64(Uint8Array.from(image.data))
    const encodedImage = 'data:image/png;base64,' + base64
    this.writeAttributeString('xlink:href', encodedImage)
    this.writeEndElement()
  }

  /**
   * Writes a line.
   * @param p1 The first point.
   * @param p2 The second point.
   * @param style The style.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public writeLine(p1: ScreenPoint, p2: ScreenPoint, style: string, edgeRenderingMode: EdgeRenderingMode): void {
    // http://www.w3.org/TR/SVG/shapes.html#LineElement
    // http://www.w3schools.com/svg/svg_line.asp
    this.writeStartElement('line')
    this.writeAttributeNumberString('x1', p1.x)
    this.writeAttributeNumberString('y1', p1.y)
    this.writeAttributeNumberString('x2', p2.x)
    this.writeAttributeNumberString('y2', p2.y)
    this.writeAttributeString('style', style)
    this.writeEdgeRenderingModeAttribute(edgeRenderingMode)
    this.writeEndElement()
  }

  /**
   * Writes a polygon.
   * @param points The points.
   * @param style The style.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public writePolygon(points: ScreenPoint[], style: string, edgeRenderingMode: EdgeRenderingMode): void {
    // http://www.w3.org/TR/SVG/shapes.html#PolygonElement
    this.writeStartElement('polygon')
    this.writeAttributeString('points', this.pointsToString(points))
    this.writeAttributeString('style', style)
    this.writeEdgeRenderingModeAttribute(edgeRenderingMode)
    this.writeEndElement()
  }

  /**
   * Writes a polyline.
   * @param pts The points.
   * @param style The style.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public writePolyline(pts: ScreenPoint[], style: string, edgeRenderingMode: EdgeRenderingMode): void {
    // http://www.w3.org/TR/SVG/shapes.html#PolylineElement
    this.writeStartElement('polyline')
    this.writeAttributeString('points', this.pointsToString(pts))
    this.writeAttributeString('style', style)
    this.writeEdgeRenderingModeAttribute(edgeRenderingMode)
    this.writeEndElement()
  }

  /**
   * Writes a rectangle.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param width The width.
   * @param height The height.
   * @param style The style.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public writeRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    style: string,
    edgeRenderingMode: EdgeRenderingMode,
  ): void {
    // http://www.w3.org/TR/SVG/shapes.html#RectangleElement
    this.writeStartElement('rect')
    this.writeAttributeNumberString('x', x)
    this.writeAttributeNumberString('y', y)
    this.writeAttributeNumberString('width', width)
    this.writeAttributeNumberString('height', height)
    this.writeAttributeString('style', style)
    this.writeEdgeRenderingModeAttribute(edgeRenderingMode)
    this.writeEndElement()
  }

  /**
   * Writes text.
   * @param position The position.
   * @param text The text.
   * @param fill The text color.
   * @param fontFamily The font family.
   * @param fontSize The font size (in user units).
   * @param fontWeight The font weight.
   * @param rotate The rotation angle.
   * @param halign The horizontal alignment.
   * @param valign The vertical alignment.
   */
  public writeText(
    position: ScreenPoint,
    text: string,
    fill: OxyColor,
    fontFamily: string | null = null,
    fontSize: number = 10,
    fontWeight: number = FontWeights.Normal,
    rotate: number = 0,
    halign: HorizontalAlignment = HorizontalAlignment.Left,
    valign: VerticalAlignment = VerticalAlignment.Top,
  ): void {
    // http://www.w3.org/TR/SVG/text.html
    this.writeStartElement('text')

    let baselineAlignment = 'hanging'
    if (valign === VerticalAlignment.Middle) {
      baselineAlignment = 'middle'
    }

    if (valign === VerticalAlignment.Bottom) {
      baselineAlignment = 'baseline'
    }

    this.writeAttributeString('dominant-baseline', baselineAlignment)

    let textAnchor = 'start'
    if (halign === HorizontalAlignment.Center) {
      textAnchor = 'middle'
    }

    if (halign === HorizontalAlignment.Right) {
      textAnchor = 'end'
    }

    this.writeAttributeString('text-anchor', textAnchor)

    const fmt = `translate(${position.x},${position.y})`
    let transform = fmt
    if (Math.abs(rotate) > 0) {
      transform += ` rotate(${rotate})`
    }

    this.writeAttributeString('transform', transform)

    if (fontFamily) {
      this.writeAttributeString('font-family', fontFamily)
    }

    if (fontSize > 0) {
      this.writeAttributeNumberString('font-size', fontSize)
    }

    if (fontWeight > 0) {
      this.writeAttributeNumberString('font-weight', fontWeight)
    }
    const f = OxyColorEx.fromOxyColor(fill)
    if (OxyColorHelper.isInvisible(fill)) {
      this.writeAttributeString('fill', 'none')
    } else {
      this.writeAttributeString('fill', this.colorToString(f))
      if (f.a !== 0xff) {
        this.writeAttributeNumberString('fill-opacity', f.a / 255.0)
      }
    }

    // preserve whitespace
    if (text.length !== text.trim().length) {
      this.writeAttributeString2('xml', 'space', '', 'preserve')
    }

    this.writeString(text)
    this.writeEndElement()
  }

  /**
   * Converts a color to a svg color string.
   * @param color The color.
   * @returns The color string.
   */
  protected colorToString(color: OxyColorEx): string {
    if (OxyColorHelper.equals(color, OxyColors.Black)) {
      return 'black'
    }

    return `rgb(${color.r},${color.g},${color.b})`
  }

  /**
   * Writes a double attribute.
   * @param name The name.
   * @param value The value.
   */
  protected writeAttributeNumberString(name: string, value: number): void {
    this.writeAttributeString(name, this.numberFormat(value))
  }

  /**
   * Writes the edge rendering mode attribute if necessary.
   * @param edgeRenderingMode The edge rendering mode.
   */
  private writeEdgeRenderingModeAttribute(edgeRenderingMode: EdgeRenderingMode): void {
    let value: string
    switch (edgeRenderingMode) {
      case EdgeRenderingMode.PreferSharpness:
        value = 'crispEdges'
        break
      case EdgeRenderingMode.PreferSpeed:
        value = 'optimizeSpeed'
        break
      case EdgeRenderingMode.PreferGeometricAccuracy:
        value = 'geometricPrecision'
        break
      default:
        return
    }

    this.writeAttributeString('shape-rendering', value)
  }

  /**
   * Converts a value to a string or to the specified "auto" string if the value is NaN.
   * @param value The value.
   * @param auto The string to return if value is NaN.
   * @returns A string.
   */
  private getAutoValue(value: number, auto: string): string {
    if (isNaN(value)) {
      return auto
    }

    return this.numberFormat(value)
  }

  /**
   * Converts a list of points to a string.
   * @param points The points.
   * @returns A string.
   */
  private pointsToString(points: ScreenPoint[]): string {
    let sb = ''
    for (const p of points) {
      sb += `${this.numberFormat(p.x)},${this.numberFormat(p.y)} `
    }

    return sb.trim()
  }

  /**
   * Writes the header.
   * @param width The width.
   * @param height The height.
   */
  private writeHeader(width: number, height: number): void {
    // http://www.w3.org/TR/SVG/struct.html#SVGElement
    if (this.isDocument) {
      this.writeStartDocument(false)
      this.writeDocType('svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd')
    }

    this.writeStartElement('svg', 'http://www.w3.org/2000/svg')
    this.writeAttributeString('width', this.getAutoValue(width, '100%'))
    this.writeAttributeString('height', this.getAutoValue(height, '100%'))
    this.writeAttributeString('version', '1.1')
    this.writeAttributeString('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  }
}
