import {
  ClippingRenderContext,
  EdgeRenderingMode,
  FontWeights,
  HorizontalAlignment,
  isNullOrUndef,
  type ITextMeasurer,
  LineJoin,
  type OxyColor,
  OxyColorEx,
  OxyColorHelper,
  type OxyImage,
  type OxyRect,
  type OxySize,
  type ScreenPoint,
  StringHelper,
  VerticalAlignment,
} from 'oxyplot-js'
import { canvasTextMeasurer, OxyStyleToCanvasStyleConverter } from 'oxyplot-js-renderers'
import { type Context2d, jsPDF } from 'jspdf'
import type { CreatePdfOptions } from './PdfExporter'

export class PdfRenderContext extends ClippingRenderContext {
  private readonly _pdf: jsPDF
  private readonly ctx: Context2d
  private readonly _textMeasurer: ITextMeasurer
  private readonly styleConverter = new OxyStyleToCanvasStyleConverter()
  private readonly _ctxInitStyles: Record<string, any>

  constructor(opt: CreatePdfOptions) {
    super()
    this._pdf = new jsPDF(opt)
    //this._pdf.internal.pageSize
    const ctx = this._pdf.context2d
    this.ctx = ctx
    this._ctxInitStyles = {
      fillStyle: ctx.fillStyle,
      strokeStyle: ctx.strokeStyle,
      lineJoin: ctx.lineJoin,
      lineWidth: ctx.lineWidth,
    }
    //this._pdf.getPageInfo(1).
    this._textMeasurer = canvasTextMeasurer()
  }

  getPdf() {
    return this._pdf
  }

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
    if (opacity <= 0) return

    const x = destX - (srcX / srcWidth) * destWidth
    const width = (source.width / srcWidth) * destWidth
    const y = destY - (srcY / srcHeight) * destHeight
    const height = (source.height / srcHeight) * destHeight

    this.clearStyles()
    this._pdf.addImage(Uint8Array.from(source.data), 'PNG', x, y, width, height)
  }

  /**
   * Draws line segments.
   * @param points The points.
   * @param stroke The stroke color.
   * @param thickness The thickness.
   * @param edgeRenderingMode The edge rendering mode.
   * @param dashArray The dash array.
   * @param lineJoin The line join.
   */
  public async drawLineSegments(
    points: ScreenPoint[],
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ): Promise<void> {
    if (points.length < 2 || OxyColorHelper.isInvisible(stroke) || thickness == 0) return
    this.clearStyles()

    const ctx = this.ctx
    ctx.beginPath()

    this.applyLineStyle(stroke, thickness, edgeRenderingMode, dashArray, lineJoin)

    for (let i = 0; i < points.length; i += 2) {
      const start = points[i]
      const end = points[i + 1]
      this.drawPoints([start, end])
    }

    ctx.stroke()
  }

  async drawLine(
    points: ScreenPoint[],
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ): Promise<void> {
    if (points.length < 2 || OxyColorHelper.isInvisible(stroke) || thickness == 0) return

    this.clearStyles()
    const ctx = this.ctx
    ctx.beginPath()

    this.applyLineStyle(stroke, thickness, edgeRenderingMode, dashArray, lineJoin)
    this.drawPoints(points)

    ctx.stroke()
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
  async drawPolygon(
    points: ScreenPoint[],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ): Promise<void> {
    if (
      (OxyColorHelper.isInvisible(fill) && !(OxyColorHelper.isVisible(stroke) || thickness <= 0)) ||
      points.length < 2
    )
      return
    this.clearStyles()
    const f = OxyColorEx.fromOxyColor(fill)
    const s = OxyColorEx.fromOxyColor(stroke)
    const ctx = this.ctx
    if (f.a < 255 || s.a < 255) {
      this._pdf.saveGraphicsState()
      let opacity = 1,
        strokeOpacity = 1
      if (f.a < 255) {
        opacity = f.a / 255
      }
      if (s.a < 255) {
        strokeOpacity = s.a / 255
      }
      this._pdf.setGState(this._pdf.GState({ opacity, 'stroke-opacity': strokeOpacity }))
    }
    ctx.beginPath()

    this.applyPolygonStyle(fill, stroke, thickness, edgeRenderingMode, dashArray, lineJoin)
    this.drawPoints(points)

    ctx.closePath()

    if (OxyColorHelper.isVisible(fill)) {
      ctx.fill()
    }

    if (OxyColorHelper.isVisible(stroke) && thickness > 0) {
      ctx.stroke()
    }

    if (f.a < 255 || s.a < 255) {
      this._pdf.restoreGraphicsState()
    }
  }

  /**
   * Draws multiple polygons.
   * @param polygons The polygons.
   * @param fill The fill color.
   * @param stroke The stroke color.
   * @param thickness The thickness.
   * @param edgeRenderingMode The edge rendering mode.
   * @param dashArray The dash array.
   * @param lineJoin The line join.
   */
  public async drawPolygons(
    polygons: ScreenPoint[][],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray: number[] | undefined,
    lineJoin: LineJoin,
  ): Promise<void> {
    if (
      (OxyColorHelper.isInvisible(fill) && !(OxyColorHelper.isVisible(stroke) || thickness <= 0)) ||
      polygons.length === 0
    )
      return

    this.clearStyles()

    const ctx = this.ctx
    this.applyPolygonStyle(fill, stroke, thickness, edgeRenderingMode, dashArray, lineJoin)

    for (const polygon of polygons) {
      if (polygon.length < 2) continue

      ctx.beginPath()

      this.drawPoints(polygon)

      ctx.closePath()

      if (OxyColorHelper.isVisible(fill)) {
        ctx.fill()
      }

      if (OxyColorHelper.isVisible(stroke) && thickness > 0) {
        ctx.stroke()
      }
    }
  }

  /**
   * Draws the text.
   * @param p The position of the text.
   * @param text The text.
   * @param fill The fill color.
   * @param fontFamily The font family.
   * @param fontSize Size of the font.
   * @param fontWeight The font weight.
   * @param rotation The rotation angle.
   * @param horizontalAlignment The horizontal alignment.
   * @param verticalAlignment The vertical alignment.
   * @param maxSize The maximum size of the text.
   */
  public async drawText(
    p: ScreenPoint,
    text: string,
    fill: OxyColor,
    fontFamily: string | undefined,
    fontSize: number,
    fontWeight?: number,
    rotation?: number,
    horizontalAlignment?: HorizontalAlignment,
    verticalAlignment?: VerticalAlignment,
    maxSize?: OxySize,
  ): Promise<void> {
    if (!text || OxyColorHelper.isInvisible(fill)) return
    this.clearStyles()

    if (isNullOrUndef(horizontalAlignment)) horizontalAlignment = HorizontalAlignment.Left
    if (isNullOrUndef(verticalAlignment)) verticalAlignment = VerticalAlignment.Top

    const ctx = this.ctx
    fontSize = fontSize || 12
    fontWeight = fontWeight || FontWeights.Normal

    this.applyTextStyle(fill, fontFamily, fontSize, fontWeight)

    ctx.save()
    ctx.translate(p.x, p.y)

    if (rotation) {
      ctx.rotate(rotation * (Math.PI / 180))
    }

    const lines = StringHelper.splitLines(text)
    const lineRects: OxySize[] = []

    for (const line of lines) {
      const size = this.measureText(line, fontFamily, fontSize, fontWeight)
      lineRects.push(size)
    }

    const totalHeight = lineRects.reduce((acc, size) => acc + size.height, 0)

    let y = 0
    ctx.textBaseline = 'middle'
    if (verticalAlignment === VerticalAlignment.Top) {
      y = 0
    } else if (verticalAlignment === VerticalAlignment.Middle) {
      y = -totalHeight / 2
    } else if (verticalAlignment === VerticalAlignment.Bottom) {
      y = -totalHeight
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let x = 0
      const textRect = lineRects[i]
      if (horizontalAlignment === HorizontalAlignment.Center) {
        x = -textRect.width / 2
      } else if (horizontalAlignment === HorizontalAlignment.Right) {
        x = -textRect.width
      }

      ctx.fillText(line, x, y + textRect.height / 2)
      y += textRect.height
    }

    ctx.restore()
  }

  measureText(text: string, fontFamily: string | undefined, fontSize: number, fontWeight: number): OxySize {
    return this._textMeasurer.measureText(text, fontFamily, fontSize, fontWeight)
  }

  protected setClip(rect: OxyRect): void {
    this.ctx.save()

    this.ctx.rect(rect.left, rect.top, rect.width, rect.height)
    this.ctx.clip()
  }

  protected resetClip(): void {
    this.ctx.restore()
  }

  private applyLineStyle(
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ) {
    const ctx = this.ctx

    if (dashArray && dashArray.length > 0) {
      ;(ctx as any).setLineDash(dashArray)
    }

    ctx.lineWidth = thickness
    ctx.lineJoin = this.styleConverter.convertLineJoin(lineJoin)
    ctx.strokeStyle = this.styleConverter.convertStrokeOrFillStyle(stroke)
  }

  private clearStyles() {
    ;(this.ctx as any).setLineDash([])
  }

  private applyPolygonStyle(
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ) {
    if (OxyColorHelper.isVisible(stroke) && thickness > 0) {
      this.applyLineStyle(stroke, thickness, edgeRenderingMode, dashArray, lineJoin)
    }
    if (OxyColorHelper.isVisible(fill)) {
      this.ctx.fillStyle = this.styleConverter.convertStrokeOrFillStyle(fill)
    }
  }

  private applyTextStyle(fill: OxyColor, fontFamily: string | undefined, fontSize: number, fontWeight: number) {
    const ctx = this.ctx
    ctx.fillStyle = this.styleConverter.convertStrokeOrFillStyle(fill)
    ctx.font = this.styleConverter.convertFont(fontFamily, fontSize, fontWeight)
  }

  private drawPoints(points: ScreenPoint[]) {
    this.ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      this.ctx.lineTo(point.x, point.y)
    }
  }
}
