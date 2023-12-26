import {
  ClippingRenderContext,
  EdgeRenderingMode,
  HorizontalAlignment,
  LineJoin,
  OxyColor,
  OxyImage,
  OxyRect,
  OxySize,
  ScreenPoint,
  VerticalAlignment,
} from 'oxyplot-js'

/**
 * Provides a render context for scalable vector graphics output.
 */
export class LoggerRenderContext extends ClippingRenderContext {
  private _no = 0

  constructor() {
    super()
  }

  /**
   * Closes the svg writer.
   */
  public close(): void {
    log(`${++this._no} close`)
  }

  /**
   * Completes the svg element.
   */
  public complete(): void {
    log(`${++this._no} complete`)
    printLog()
    this._no = 0
    logs = ''
  }

  /**
   * Draws an ellipse.
   * @param rect The rectangle.
   * @param fill The fill color.
   * @param stroke The stroke color.
   * @param thickness The thickness.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public async drawEllipse(
    rect: OxyRect,
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    log(`${++this._no} drawEllipse ${rect} ${fill} ${stroke} ${thickness} ${edgeRenderingMode}`)
  }

  /**
   * Draws a line.
   * @param points The points.
   * @param stroke The stroke color.
   * @param thickness The thickness.
   * @param edgeRenderingMode The edge rendering mode.
   * @param dashArray The dash array.
   * @param lineJoin The line join.
   */
  public async drawLine(
    points: ScreenPoint[],
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray: number[],
    lineJoin: LineJoin,
  ): Promise<void> {
    log(`${++this._no} drawLine ${points} ${stroke} ${thickness} ${edgeRenderingMode} ${dashArray} ${lineJoin}`)
  }

  /**
   * Draws a polygon.
   * @param points The points.
   * @param fill The fill color.
   * @param stroke The stroke color.
   * @param thickness The thickness.
   * @param edgeRenderingMode The edge rendering mode.
   * @param dashArray The dash array.
   * @param lineJoin The line join.
   */
  public async drawPolygon(
    points: ScreenPoint[],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray: number[],
    lineJoin: LineJoin,
  ): Promise<void> {
    log(
      `${++this
        ._no} drawPolygon ${points} ${fill} ${stroke} ${thickness} ${edgeRenderingMode} ${dashArray} ${lineJoin}`,
    )
  }

  /**
   * Draws a rectangle.
   * @param rect The rectangle.
   * @param fill The fill color.
   * @param stroke The stroke color.
   * @param thickness The thickness.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public async drawRectangle(
    rect: OxyRect,
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    log(`${++this._no} drawRectangle ${rect} ${fill} ${stroke} ${thickness} ${edgeRenderingMode}`)
  }

  /**
   * Draws the text.
   * @param p The position.
   * @param text The text.
   * @param c The color.
   * @param fontFamily The font family.
   * @param fontSize The font size.
   * @param fontWeight The font weight.
   * @param rotate The rotation angle.
   * @param halign The horizontal alignment.
   * @param valign The vertical alignment.
   * @param maxSize The maximum size.
   */
  public async drawText(
    p: ScreenPoint,
    text: string,
    c: OxyColor,
    fontFamily: string,
    fontSize: number,
    fontWeight: number,
    rotate: number,
    halign: HorizontalAlignment,
    valign: VerticalAlignment,
    maxSize?: OxySize,
  ): Promise<void> {
    log(
      `${++this
        ._no} drawText ${p} '${text}' ${c} ${fontFamily} ${fontSize} ${fontWeight} ${rotate} ${halign} ${valign} ${
        maxSize || ''
      }`,
    )
  }

  /**
   * Flushes this instance.
   */
  public flush(): void {
    log(`${++this._no} flush`)
  }

  /**
   * Measures the text.
   * @param text The text.
   * @param fontFamily The font family.
   * @param fontSize Size of the font.
   * @param fontWeight The font weight.
   * @returns The text size.
   */
  public measureText(text: string, fontFamily: string | undefined, fontSize: number, fontWeight: number): OxySize {
    log(`${++this._no} measureText '${text}' ${fontFamily} ${fontSize} ${fontWeight}`)
    return new OxySize(0, 0)
  }

  /**
   * Draws the specified portion of the specified OxyImage at the specified location and with the specified size.
   * @param source The source.
   * @param srcX The x-coordinate of the upper-left corner of the portion of the source image to draw.
   * @param srcY The y-coordinate of the upper-left corner of the portion of the source image to draw.
   * @param srcWidth Width of the portion of the source image to draw.
   * @param srcHeight Height of the portion of the source image to draw.
   * @param destX The x-coordinate of the upper-left corner of drawn image.
   * @param destY The y-coordinate of the upper-left corner of drawn image.
   * @param destWidth The width of the drawn image.
   * @param destHeight The height of the drawn image.
   * @param opacity The opacity.
   * @param interpolate Interpolate if set to true.
   */
  public async drawImage(
    source: OxyImage,
    srcX: number,
    srcY: number,
    srcWidth: number,
    srcHeight: number,
    destX: number,
    destY: number,
    destWidth: number,
    destHeight: number,
    opacity: number,
    interpolate: boolean,
  ): Promise<void> {
    log(
      `${++this
        ._no} drawImage ${source} ${srcX} ${srcY} ${srcWidth} ${srcHeight} ${destX} ${destY} ${destWidth} ${destHeight} ${opacity} ${interpolate}`,
    )
  }

  /**
   * Sets the clipping rectangle.
   * @param clippingRectangle The clipping rectangle.
   */
  protected setClip(clippingRectangle: OxyRect): void {
    log(`${++this._no} setClip ${clippingRectangle}`)
  }

  /**
   * Resets the clipping rectangle.
   */
  protected resetClip(): void {
    log(`${++this._no} resetClip`)
  }
}

let logs = ''
const log = (msg: string) => {
  logs += `${msg}\n`
  //console.log(msg)
}

const printLog = () => {
  console.log(logs)
}
