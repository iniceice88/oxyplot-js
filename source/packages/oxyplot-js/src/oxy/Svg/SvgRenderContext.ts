import type { ITextMeasurer, ScreenPoint } from '@/oxyplot'
import {
  ClippingRenderContext,
  EdgeRenderingMode,
  HorizontalAlignment,
  LineJoin,
  OxyColor,
  OxyColors,
  OxyImage,
  OxyRect,
  OxySize,
  screenPointMinusVector,
  screenPointPlus,
  ScreenVector,
  StringHelper,
  SvgWriter,
  VerticalAlignment,
} from '@/oxyplot'

/**
 * Provides a render context for scalable vector graphics output.
 */
export class SvgRenderContext extends ClippingRenderContext {
  /**
   * The writer.
   */
  private readonly w: SvgWriter

  /**
   * Initializes a new instance of the SvgRenderContext class.
   * @param width The width.
   * @param height The height.
   * @param isDocument Create an SVG document if set to true.
   * @param textMeasurer The text measurer.
   * @param background The background.
   * @param useVerticalTextAlignmentWorkaround Whether to use the workaround for vertical text alignment.
   */
  constructor(
    width: number,
    height: number,
    isDocument: boolean,
    textMeasurer: ITextMeasurer,
    background: OxyColor,
    useVerticalTextAlignmentWorkaround: boolean = false,
  ) {
    super()
    if (!textMeasurer) {
      throw new Error('A text measuring render context must be provided.')
    }

    this.w = new SvgWriter(width, height, isDocument)
    this.textMeasurer = textMeasurer
    this.useVerticalTextAlignmentWorkaround = useVerticalTextAlignmentWorkaround

    if (background.isVisible()) {
      this.w.writeRectangle(
        0,
        0,
        width,
        height,
        this.w.createStyle(background, OxyColors.Undefined, 0),
        EdgeRenderingMode.Adaptive,
      )
    }
  }

  /**
   * Gets or sets the text measurer.
   */
  public textMeasurer: ITextMeasurer

  /**
   * Gets or sets a value indicating whether to use a workaround for vertical text alignment to support renderers with limited support for the dominate-baseline attribute.
   */
  public useVerticalTextAlignmentWorkaround: boolean

  /**
   * Closes the svg writer.
   */
  public close(): void {
    this.w.close()
  }

  /**
   * Completes the svg element.
   */
  public complete(): void {
    this.w.complete()
  }

  public getXml(): string {
    return this.w.getXml()
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
    this.w.writeEllipse(
      rect.left,
      rect.top,
      rect.width,
      rect.height,
      this.w.createStyle(fill, stroke, thickness),
      edgeRenderingMode,
    )
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
    this.w.writePolyline(
      points,
      this.w.createStyle(OxyColors.Undefined, stroke, thickness, dashArray, lineJoin),
      edgeRenderingMode,
    )
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
    this.w.writePolygon(points, this.w.createStyle(fill, stroke, thickness, dashArray, lineJoin), edgeRenderingMode)
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
    this.w.writeRectangle(
      rect.left,
      rect.top,
      rect.width,
      rect.height,
      this.w.createStyle(fill, stroke, thickness),
      edgeRenderingMode,
    )
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
    if (!text) {
      return
    }
    const lines = StringHelper.splitLines(text)

    const textSize = this.measureText(text, fontFamily, fontSize, fontWeight)
    const lineHeight = textSize.height / lines.length
    const lineOffset = new ScreenVector(
      -Math.sin((rotate / 180.0) * Math.PI) * lineHeight,
      +Math.cos((rotate / 180.0) * Math.PI) * lineHeight,
    )
    if (this.useVerticalTextAlignmentWorkaround) {
      // offset the position, and set the valign to neutral value of `Bottom`
      const offsetRatio =
        valign === VerticalAlignment.Bottom
          ? 1.0 - lines.length
          : valign === VerticalAlignment.Top
            ? 1.0
            : 1.0 - lines.length / 2.0
      valign = VerticalAlignment.Bottom

      p = screenPointPlus(p, lineOffset.times(offsetRatio))

      for (const line of lines) {
        this.w.writeText(p, line, c, fontFamily, fontSize, fontWeight, rotate, halign, valign)

        p = screenPointPlus(p, lineOffset)
      }
    } else {
      if (valign === VerticalAlignment.Bottom) {
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i]
          this.w.writeText(p, line, c, fontFamily, fontSize, fontWeight, rotate, halign, valign)

          p = screenPointMinusVector(p, lineOffset)
        }
      } else {
        for (const line of lines) {
          this.w.writeText(p, line, c, fontFamily, fontSize, fontWeight, rotate, halign, valign)

          p = screenPointPlus(p, lineOffset)
        }
      }
    }
  }

  /**
   * Flushes this instance.
   */
  public flush(): void {
    this.w.flush()
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
    if (text === '') {
      return OxySize.Empty
    }
    return this.textMeasurer.measureText(text, fontFamily, fontSize, fontWeight)
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
    this.w.writeImage(srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight, source, interpolate)
  }

  protected disposed = false

  /**
   * Releases unmanaged and - optionally - managed resources
   * @param disposing true to release both managed and unmanaged resources; false to release only unmanaged resources.
   */
  protected dispose(disposing: boolean): void {
    if (!this.disposed) {
      if (disposing) {
        this.w.dispose()
      }
    }

    this.disposed = true
  }

  /**
   * Sets the clipping rectangle.
   * @param clippingRectangle The clipping rectangle.
   */
  protected setClip(clippingRectangle: OxyRect): void {
    this.w.beginClip(clippingRectangle.left, clippingRectangle.top, clippingRectangle.width, clippingRectangle.height)
  }

  /**
   * Resets the clipping rectangle.
   */
  protected resetClip(): void {
    this.w.endClip()
  }
}
