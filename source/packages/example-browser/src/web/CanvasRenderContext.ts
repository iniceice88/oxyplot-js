import {
  ClippingRenderContext,
  EdgeRenderingMode,
  FontWeights,
  HorizontalAlignment,
  isNullOrUndef,
  type ITextMeasurer,
  LineJoin,
  OxyColor,
  OxyImage,
  OxyRect,
  OxySize,
  round,
  ScreenPoint,
  StringHelper,
  VerticalAlignment,
} from 'oxyplot-js'
import { canvasTextMeasurer, OxyStyleToCanvasStyleConverter } from './canvasTextMeasurer'
import { getRenderContextImageCacheService, IRenderContextImageCacheService } from './RenderContextImageCacheService.ts'

export class CanvasRenderContext extends ClippingRenderContext {
  private readonly ctx: CanvasRenderingContext2D
  private readonly _textMeasurer: ITextMeasurer
  private readonly styleConverter = new OxyStyleToCanvasStyleConverter()
  private readonly _ctxInitStyles: Record<string, any>
  private readonly _renderContextImageCacheService: IRenderContextImageCacheService

  constructor(private canvas: HTMLCanvasElement) {
    super()

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    this.ctx = ctx
    this._ctxInitStyles = {
      fillStyle: ctx.fillStyle,
      strokeStyle: ctx.strokeStyle,
      lineJoin: ctx.lineJoin,
      lineWidth: ctx.lineWidth,
    }

    this._renderContextImageCacheService = getRenderContextImageCacheService()
    this._textMeasurer = canvasTextMeasurer(ctx)
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

    this.resetStyles()
    const ctx = this.ctx

    const img = await this.getOrCreateImage(source, () => {
      const blob = new Blob([source.data], { type: 'image/png' })
      return createImageBitmap(blob)
    })

    ctx.imageSmoothingEnabled = interpolate
    ctx.drawImage(
      img,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      round(destX, 0),
      round(destY, 0),
      round(destWidth, 0),
      round(destHeight, 0),
    )
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
    if (points.length < 2 || stroke.isInvisible() || thickness == 0) return

    this.resetStyles()

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
    if (points.length < 2 || stroke.isInvisible() || thickness == 0) return

    this.resetStyles()

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
    if ((fill.isInvisible() && !(stroke.isVisible() || thickness <= 0)) || points.length < 2) return

    this.resetStyles()

    const ctx = this.ctx
    ctx.beginPath()

    this.applyPolygonStyle(fill, stroke, thickness, edgeRenderingMode, dashArray, lineJoin)
    this.drawPoints(points)

    ctx.closePath()

    if (fill.isVisible()) {
      ctx.fill()
    }

    if (stroke.isVisible() && thickness > 0) {
      ctx.stroke()
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
    if ((fill.isInvisible() && !(stroke.isVisible() || thickness <= 0)) || polygons.length === 0) return

    this.resetStyles()
    const ctx = this.ctx
    this.applyPolygonStyle(fill, stroke, thickness, edgeRenderingMode, dashArray, lineJoin)

    for (const polygon of polygons) {
      if (polygon.length < 2) continue

      ctx.beginPath()

      this.drawPoints(polygon)

      ctx.closePath()

      if (fill.isVisible()) {
        ctx.fill()
      }

      if (stroke.isVisible() && thickness > 0) {
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
    if (!text || fill.isInvisible()) return

    if (isNullOrUndef(horizontalAlignment)) horizontalAlignment = HorizontalAlignment.Left
    if (isNullOrUndef(verticalAlignment)) verticalAlignment = VerticalAlignment.Top

    this.resetStyles()

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

      ctx.fillText(line, x, y + textRect.height / 2, maxSize?.width)
      y += textRect.height
    }

    ctx.restore()
  }

  measureText(text: string, fontFamily: string | undefined, fontSize: number, fontWeight: number): OxySize {
    return this._textMeasurer.measureText(text, fontFamily, fontSize, fontWeight)
  }

  protected setClip(rect: OxyRect): void {
    this.ctx.save()

    const region = new Path2D()
    region.rect(rect.left, rect.top, rect.width, rect.height)
    this.ctx.clip(region)
  }

  protected resetClip(): void {
    this.ctx.restore()
  }

  private resetStyles() {
    const ctx = this.ctx
    ctx.setLineDash([])
    Object.assign(ctx, this._ctxInitStyles)
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
      ctx.setLineDash(dashArray)
    }

    ctx.lineWidth = thickness
    ctx.lineJoin = this.styleConverter.convertLineJoin(lineJoin)
    ctx.strokeStyle = this.styleConverter.convertStrokeOrFillStyle(stroke)
  }

  private applyPolygonStyle(
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ) {
    if (stroke.isVisible() && thickness > 0) {
      this.applyLineStyle(stroke, thickness, edgeRenderingMode, dashArray, lineJoin)
    }
    if (fill.isVisible()) {
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

  private async getOrCreateImage(
    source: OxyImage,
    creator: () => Promise<ImageBitmap | HTMLImageElement>,
  ): Promise<ImageBitmap | HTMLImageElement> {
    const hashCode = source.getHashCode().toString()
    const existsImage = this._renderContextImageCacheService.get(hashCode)
    if (existsImage) {
      return Promise.resolve(existsImage)
    }
    const image = await creator()
    this._renderContextImageCacheService.set(hashCode, image)
    return image
  }
}
