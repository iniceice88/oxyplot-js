import {
  HorizontalAlignment,
  IRenderContext,
  newScreenPoint,
  OxyColor,
  OxyRect,
  OxySize,
  VerticalAlignment,
} from '@/oxyplot'
import { EdgeRenderingMode, LineJoin, OxyImage, ScreenPoint } from '@/oxyplot'

/**
 * Provides an abstract base class for rendering contexts.
 */
export abstract class RenderContextBase implements IRenderContext {
  /**
   * Initializes a new instance of the RenderContextBase class.
   */
  protected constructor() {
    this.rendersToScreen = true
  }

  /**
   * Gets a value indicating whether the specified points form a straight line (i.e. parallel to the pixel raster).
   * @param p1 The first point.
   * @param p2 The second point.
   * @returns true if the points form a straight line; false otherwise.
   */
  public static isStraightLine(p1: ScreenPoint, p2: ScreenPoint): boolean {
    const epsilon = 1e-5
    return Math.abs(p1.x - p2.x) < epsilon || Math.abs(p1.y - p2.y) < epsilon
  }

  /**
   * Gets a value indicating whether the specified points form a straight line (i.e. parallel to the pixel raster).
   * @param points The points.
   * @returns true if the points form a straight line; false otherwise.
   */
  public static isStraightLine2(points: ScreenPoint[]): boolean {
    for (let i = 1; i < points.length; i++) {
      if (!this.isStraightLine(points[i - 1], points[i])) {
        return false
      }
    }

    return true
  }

  /**
   * Gets or sets a value indicating whether the context renders to screen.
   */
  public rendersToScreen: boolean

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
    const polygon = RenderContextBase.createEllipse(rect)
    await this.drawPolygon(polygon, fill, stroke, thickness, edgeRenderingMode, undefined, LineJoin.Miter)
  }

  /**
   * Draws multiple ellipses.
   * @param rectangles The rectangles.
   * @param fill The fill color.
   * @param stroke The stroke color.
   * @param thickness The thickness.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public async drawEllipses(
    rectangles: OxyRect[],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    for (const r of rectangles) {
      await this.drawEllipse(r, fill, stroke, thickness, edgeRenderingMode)
    }
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
  public abstract drawLine(
    points: ScreenPoint[],
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ): Promise<void>

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
    for (let i = 0; i + 1 < points.length; i += 2) {
      await this.drawLine([points[i], points[i + 1]], stroke, thickness, edgeRenderingMode, dashArray, lineJoin)
    }
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
  public abstract drawPolygon(
    points: ScreenPoint[],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ): Promise<void>

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
    for (const polygon of polygons) {
      await this.drawPolygon(polygon, fill, stroke, thickness, edgeRenderingMode, dashArray, lineJoin)
    }
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
    const polygon = RenderContextBase.createRectangle(rect)
    await this.drawPolygon(polygon, fill, stroke, thickness, edgeRenderingMode, undefined, LineJoin.Miter)
  }

  /**
   * Draws multiple rectangles.
   * @param rectangles The rectangles.
   * @param fill The fill color.
   * @param stroke The stroke color.
   * @param thickness The thickness.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public async drawRectangles(
    rectangles: OxyRect[],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    for (const r of rectangles) {
      await this.drawRectangle(r, fill, stroke, thickness, edgeRenderingMode)
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
  public abstract drawText(
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
  ): Promise<void>

  /**
   * Measures the size of the specified text.
   * @param text The text to measure.
   * @param fontFamily The font family.
   * @param fontSize Size of the font (in device independent units, 1/96 inch).
   * @param fontWeight The font weight.
   */
  public abstract measureText(
    text: string,
    fontFamily: string | undefined,
    fontSize: number,
    fontWeight: number,
  ): OxySize

  /**
   * Sets the tool tip for the following items.
   * @param text The text in the tooltip.
   */
  public setToolTip(text: string): void {}

  /**
   * Cleans up resources not in use.
   * This method is called at the end of each rendering.
   */
  public cleanUp(): void {}

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
  public abstract drawImage(
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
  ): Promise<void>

  /**
   * Pops the clip.
   */
  public abstract popClip(): void

  /**
   * Pushes the clip.
   * @param clippingRectangle The clipping rectangle.
   */
  public abstract pushClip(clippingRectangle: OxyRect): void

  /**
   * Gets the clip count.
   */
  public abstract get clipCount(): number

  /**
   * Creates an ellipse polygon.
   * @param rect The bounding rectangle.
   * @param n The number of points.
   * @returns The points defining the ellipse.
   */
  protected static createEllipse(rect: OxyRect, n: number = 40): ScreenPoint[] {
    const cx = rect.center.x
    const cy = rect.center.y
    const dx = rect.width / 2
    const dy = rect.height / 2
    const points: ScreenPoint[] = new Array(n)
    for (let i = 0; i < n; i++) {
      const t = (Math.PI * 2 * i) / n
      points[i] = newScreenPoint(cx + Math.cos(t) * dx, cy + Math.sin(t) * dy)
    }

    return points
  }

  /**
   * Creates a rectangle polygon.
   * @param rect The rectangle.
   * @returns The points defining the rectangle.
   */
  protected static createRectangle(rect: OxyRect): ScreenPoint[] {
    return [
      newScreenPoint(rect.left, rect.top),
      newScreenPoint(rect.left, rect.bottom),
      newScreenPoint(rect.right, rect.bottom),
      newScreenPoint(rect.right, rect.top),
    ]
  }

  /**
   * Returns a value indicating whether anti-aliasing should be used for the given edge rendering mode.
   * @param edgeRenderingMode The edge rendering mode.
   * @returns true if anti-aliasing should be used; false otherwise.
   */
  protected shouldUseAntiAliasingForRect(edgeRenderingMode: EdgeRenderingMode): boolean {
    switch (edgeRenderingMode) {
      case EdgeRenderingMode.PreferGeometricAccuracy:
        return true
      default:
        return false
    }
  }

  /**
   * Returns a value indicating whether anti-aliasing should be used for the given edge rendering mode.
   * @param edgeRenderingMode The edge rendering mode.
   * @returns true if anti-aliasing should be used; false otherwise.
   */
  protected shouldUseAntiAliasingForEllipse(edgeRenderingMode: EdgeRenderingMode): boolean {
    switch (edgeRenderingMode) {
      case EdgeRenderingMode.PreferSpeed:
        return false
      default:
        return true
    }
  }

  /**
   * Returns a value indicating whether anti-aliasing should be used for the given edge rendering mode.
   * @param edgeRenderingMode The edge rendering mode.
   * @points The points.
   * @returns true if anti-aliasing should be used; false otherwise.
   */
  protected shouldUseAntiAliasingForLine(edgeRenderingMode: EdgeRenderingMode, points: ScreenPoint[]): boolean {
    switch (edgeRenderingMode) {
      case EdgeRenderingMode.PreferSpeed:
      case EdgeRenderingMode.PreferSharpness:
        return false
      case EdgeRenderingMode.Automatic:
        if (RenderContextBase.isStraightLine2(points)) {
          return false
        }
        break
      case EdgeRenderingMode.Adaptive:
        if (RenderContextBase.isStraightLine2(points)) {
          return false
        }
        break
      default:
        return true
    }
    return true
  }
}
