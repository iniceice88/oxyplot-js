import type {
  EdgeRenderingMode,
  HorizontalAlignment,
  LineJoin,
  OxyColor,
  OxyImage,
  OxyRect,
  OxySize,
  ScreenPoint,
  VerticalAlignment,
} from '@/oxyplot'

export interface ITextMeasurer {
  /**
   * Measures the size of the specified text.
   * @param text The text to measure.
   * @param fontFamily The font family.
   * @param fontSize Size of the font (in device independent units, 1/96 inch).
   * @param fontWeight The font weight.
   */
  measureText(text: string, fontFamily: string | undefined, fontSize: number, fontWeight?: number): OxySize
}

/**
 * Specifies functionality to render 2D graphics.
 */
export interface IRenderContext {
  /**
   * Gets a value indicating whether the context renders to screen.
   */
  readonly rendersToScreen: boolean

  /**
   * Draws an ellipse.
   * @param extents The rectangle defining the extents of the ellipse.
   * @param fill The fill color. If set to OxyColors.Undefined, the extents will not be filled.
   * @param stroke The stroke color. If set to OxyColors.Undefined, the extents will not be stroked.
   * @param thickness The thickness (in device independent units, 1/96 inch).
   * @param edgeRenderingMode The edge rendering mode.
   */
  drawEllipse(
    extents: OxyRect,
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void>

  /**
   * Draws a collection of ellipses, where all have the same stroke and fill.
   * @param extents The rectangles defining the extents of the ellipses.
   * @param fill The fill color. If set to OxyColors.Undefined, the ellipses will not be filled.
   * @param stroke The stroke color. If set to OxyColors.Undefined, the ellipses will not be stroked.
   * @param thickness The stroke thickness (in device independent units, 1/96 inch).
   * @param edgeRenderingMode The edge rendering mode.
   */
  drawEllipses(
    extents: OxyRect[],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void>

  /**
   * Draws a polyline.
   * @param points The points defining the polyline. The polyline is drawn from point 0, to point 1, to point 2 and so on.
   * @param stroke The stroke color.
   * @param thickness The stroke thickness (in device independent units, 1/96 inch).
   * @param edgeRenderingMode The edge rendering mode.
   * @param dashArray The dash array (in device independent units, 1/96 inch). Use null to get a solid line.
   * @param lineJoin The line join type.
   */
  drawLine(
    points: ScreenPoint[],
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ): Promise<void>

  /**
   * Draws line segments.
   * @param points The points defining the line segments. Lines are drawn from point 0 to 1, point 2 to 3 and so on.
   * @param stroke The stroke color.
   * @param thickness The stroke thickness (in device independent units, 1/96 inch).
   * @param edgeRenderingMode The edge rendering mode.
   * @param dashArray The dash array (in device independent units, 1/96 inch).
   * @param lineJoin The line join type.
   */
  drawLineSegments(
    points: ScreenPoint[],
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ): Promise<void>

  /**
   * Draws a polygon.
   * @param points The points defining the polygon.
   * @param fill The fill color. If set to OxyColors.Undefined, the polygon will not be filled.
   * @param stroke The stroke color. If set to OxyColors.Undefined, the polygon will not be stroked.
   * @param thickness The stroke thickness (in device independent units, 1/96 inch).
   * @param edgeRenderingMode The edge rendering mode.
   * @param dashArray The dash array (in device independent units, 1/96 inch).
   * @param lineJoin The line join type.
   */
  drawPolygon(
    points: ScreenPoint[],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ): Promise<void>

  /**
   * Draws a collection of polygons, where all polygons have the same stroke and fill.
   * @param polygons The polygons to draw.
   * @param fill The fill color. If set to OxyColors.Undefined, the polygons will not be filled.
   * @param stroke The stroke color. If set to OxyColors.Undefined, the polygons will not be stroked.
   * @param thickness The stroke thickness (in device independent units, 1/96 inch).
   * @param edgeRenderingMode The edge rendering mode.
   * @param dashArray The dash array (in device independent units, 1/96 inch).
   * @param lineJoin The line join type.
   */
  drawPolygons(
    polygons: ScreenPoint[][],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
  ): Promise<void>

  /**
   * Draws a rectangle.
   * @param rectangle The rectangle to draw.
   * @param fill The fill color. If set to OxyColors.Undefined, the rectangle will not be filled.
   * @param stroke The stroke color. If set to OxyColors.Undefined, the rectangle will not be stroked.
   * @param thickness The stroke thickness (in device independent units, 1/96 inch).
   * @param edgeRenderingMode The edge rendering mode.
   */
  drawRectangle(
    rectangle: OxyRect,
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void>

  /**
   * Draws a collection of extents, where all have the same stroke and fill.
   * @param rectangles The extents to draw.
   * @param fill The fill color. If set to OxyColors.Undefined, the extents will not be filled.
   * @param stroke The stroke color. If set to OxyColors.Undefined, the extents will not be stroked.
   * @param thickness The stroke thickness (in device independent units, 1/96 inch).
   * @param edgeRenderingMode The edge rendering mode.
   */
  drawRectangles(
    rectangles: OxyRect[],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void>

  /**
   * Draws text.
   * Multi-line text is not supported.
   * @param p The position.
   * @param text The text.
   * @param fill The text color.
   * @param fontFamily The font family.
   * @param fontSize Size of the font (in device independent units, 1/96 inch).
   * @param fontWeight The font weight.
   * @param rotation The rotation angle.
   * @param horizontalAlignment The horizontal alignment.
   * @param verticalAlignment The vertical alignment.
   * @param maxSize The maximum size of the text (in device independent units, 1/96 inch). If set to null, the text will not be clipped.
   */
  drawText(
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
  measureText(text: string, fontFamily: string, fontSize: number, fontWeight: number): OxySize

  /**
   * Sets the tool tip for the following items.
   * @param text The text in the tool tip, or null if no tool tip should be shown.
   */
  setToolTip(text?: string): void

  /**
   * Cleans up resources not in use.
   * This method is called at the end of each rendering.
   */
  cleanUp(): void

  /**
   * Draws a portion of the specified OxyImage.
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
   * @param interpolate interpolate if set to true.
   */
  drawImage(
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
   * Pushes the clipping rectangle onto the clipping stack.
   * If there is already a clipping rectangle on the clipping stack, the new clipping rectangle will be intersected with the existing clipping rectangle.
   * Calls to this method must be balanced by a call to popClip.
   * It is recommended to use RenderingExtensions.autoResetClip(IRenderContext, OxyRect) in combination with a using statement instead of pushClip and popClip if possible.
   * However, if pushClip and popClip are used directly, it is recommended to wrap them in a try...finally block.
   * @param clippingRectangle The clipping rectangle.
   */
  pushClip(clippingRectangle: OxyRect): void

  /**
   * Pops the most recently pushed clipping rectangle from the clipping stack.
   */
  popClip(): void

  /**
   * Gets the number of clipping rectangles on the clipping stack.
   */
  readonly clipCount: number
}
