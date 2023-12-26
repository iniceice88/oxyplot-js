import type { IRenderContext, ITransposablePlotElement } from '@/oxyplot'
import {
  DataPoint,
  EdgeRenderingMode,
  FontWeights,
  HorizontalAlignment,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  MarkerType,
  OxyColor,
  OxyColors,
  OxyImage,
  OxyPen,
  OxyRect,
  OxySize,
  OxyThickness,
  ScreenPoint,
  StringHelper,
  VerticalAlignment,
} from '@/oxyplot'
import { type IDisposable, pushMany, toUint } from '@/patch'

/**
 * Provides extension methods for IRenderContext.
 */
export class RenderingExtensions {
  /**
   * The vertical distance to the bottom points of the triangles.
   */
  private static readonly M1 = Math.tan(Math.PI / 6)

  /**
   * The vertical distance to the top points of the triangles.
   */
  private static readonly M2 = Math.sqrt(1 + RenderingExtensions.M1 * RenderingExtensions.M1)

  /**
   * The horizontal/vertical distance to the end points of the stars.
   */
  private static readonly M3 = Math.tan(Math.PI / 4)

  /**
   * Gets the actual edge rendering mode.
   * @param edgeRenderingMode The edge rendering mode.
   * @param defaultValue The default value that is used if edgeRenderingMode is EdgeRenderingMode.Automatic.
   * @returns The value of edgeRenderingMode if it is not EdgeRenderingMode.Automatic; the defaultValue otherwise.
   */
  public static getActualEdgeRenderingMode(
    edgeRenderingMode: EdgeRenderingMode,
    defaultValue: EdgeRenderingMode,
  ): EdgeRenderingMode {
    return edgeRenderingMode === EdgeRenderingMode.Automatic ? defaultValue : edgeRenderingMode
  }

  /**
   * Draws a clipped polyline through the specified points.
   * @param rc The render context.
   * @param points The points defining the polyline. The polyline is drawn from point 0, to point 1, to point 2 and so on.
   * @param minDistSquared The minimum line segment length (squared).
   * @param stroke The stroke color.
   * @param strokeThickness The stroke thickness.
   * @param edgeRenderingMode The edge rendering mode.
   * @param dashArray The dash array. Use null to get a solid line.
   * @param lineJoin The line join type.
   * @param outputBuffer The output buffer.
   * @param pointsRendered The points rendered callback.
   */
  public static async drawReducedLine(
    rc: IRenderContext,
    points: ScreenPoint[],
    minDistSquared: number,
    stroke: OxyColor,
    strokeThickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray?: number[],
    lineJoin?: LineJoin,
    outputBuffer?: ScreenPoint[],
    pointsRendered?: (points: ScreenPoint[]) => void,
  ): Promise<void> {
    const n = points.length
    if (n === 0) {
      return
    }

    if (outputBuffer) {
      outputBuffer.length = 0
    } else {
      outputBuffer = []
    }

    this.reducePoints(points, minDistSquared, outputBuffer)
    await rc.drawLine(outputBuffer, stroke, strokeThickness, edgeRenderingMode, dashArray, lineJoin)

    outputBuffer.length = 0
    pushMany(outputBuffer, points)

    if (pointsRendered) {
      pointsRendered(outputBuffer)
    }
  }

  /**
   * Draws the polygon within the specified clipping rectangle.
   * @param rc The render context.
   * @param points The points defining the polygon.
   * @param minDistSquared The squared minimum distance between points.
   * @param fill The fill color.
   * @param stroke The stroke color.
   * @param strokeThickness The stroke thickness.
   * @param edgeRenderingMode The edge rendering mode.
   * @param lineStyle The line style.
   * @param lineJoin The line join.
   */
  public static async drawReducedPolygon(
    rc: IRenderContext,
    points: ScreenPoint[],
    minDistSquared: number,
    fill: OxyColor,
    stroke: OxyColor,
    strokeThickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    lineStyle: LineStyle = LineStyle.Solid,
    lineJoin: LineJoin = LineJoin.Miter,
  ): Promise<void> {
    const n = points.length
    if (n === 0) {
      return
    }

    if (lineStyle === LineStyle.None) {
      return
    }

    const outputBuffer: ScreenPoint[] = []
    this.reducePoints(points, minDistSquared, outputBuffer)

    await rc.drawPolygon(
      outputBuffer,
      fill,
      stroke,
      strokeThickness,
      edgeRenderingMode,
      LineStyleHelper.getDashArray(lineStyle),
      lineJoin,
    )
  }

  /**
   * Draws the specified image.
   * @param rc The render context.
   * @param image The image.
   * @param x The destination X position.
   * @param y The destination Y position.
   * @param w The width.
   * @param h The height.
   * @param opacity The opacity.
   * @param interpolate Interpolate the image if set to true.
   */
  public static async drawImage(
    rc: IRenderContext,
    image: OxyImage,
    x: number,
    y: number,
    w: number,
    h: number,
    opacity: number,
    interpolate: boolean,
  ): Promise<void> {
    await rc.drawImage(image, 0, 0, image.width, image.height, x, y, w, h, opacity, interpolate)
  }

  /**
   * Draws multi-line text at the specified point.
   * @param rc The render context.
   * @param point The point.
   * @param text The text.
   * @param color The text color.
   * @param fontFamily The font family (optional).
   * @param fontSize The font size (default 10).
   * @param fontWeight The font weight (default Normal).
   * @param dy The line spacing (default 12).
   */
  public static async drawMultilineText(
    rc: IRenderContext,
    point: ScreenPoint,
    text: string,
    color: OxyColor,
    fontFamily?: string | null,
    fontSize: number = 10,
    fontWeight: number = FontWeights.Normal,
    dy: number = 12,
  ): Promise<void> {
    const lines = StringHelper.splitLines(text)
    for (let i = 0; i < lines.length; i++) {
      await rc.drawText(new ScreenPoint(point.x, point.y + i * dy), lines[i], color, undefined, fontSize, fontWeight)
    }
  }

  /**
   * Draws a line specified by coordinates.
   * @param rc The render context.
   * @param x0 The x-coordinate of the first point.
   * @param y0 The y-coordinate of the first point.
   * @param x1 The x-coordinate of the second point.
   * @param y1 The y-coordinate of the second point.
   * @param pen The pen.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public static async drawLine(
    rc: IRenderContext,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    pen: OxyPen | undefined,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    if (!pen) {
      return
    }

    await rc.drawLine(
      [new ScreenPoint(x0, y0), new ScreenPoint(x1, y1)],
      pen.color,
      pen.thickness,
      edgeRenderingMode,
      pen.actualDashArray,
      pen.lineJoin,
    )
  }

  /**
   * Draws the line segments.
   * @param rc The render context.
   * @param points The points.
   * @param pen The pen.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public static async drawLineSegments(
    rc: IRenderContext,
    points: ScreenPoint[],
    pen: OxyPen,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    if (!pen) {
      return
    }

    await rc.drawLineSegments(points, pen.color, pen.thickness, edgeRenderingMode, pen.actualDashArray, pen.lineJoin)
  }

  /**
   * Renders the marker.
   * @param rc The render context.
   * @param p The center point of the marker.
   * @param type The marker type.
   * @param outline The outline (optional).
   * @param size The size of the marker.
   * @param fill The fill color.
   * @param stroke The stroke color.
   * @param strokeThickness The stroke thickness.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public static async drawMarker(
    rc: IRenderContext,
    p: ScreenPoint,
    type: MarkerType,
    outline: ScreenPoint[] | undefined,
    size: number,
    fill: OxyColor,
    stroke: OxyColor,
    strokeThickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    await this.drawMarkers(rc, [p], type, outline, [size], fill, stroke, strokeThickness, edgeRenderingMode)
  }

  /**
   * Draws a list of markers.
   * @param rc The render context.
   * @param markerPoints The marker points.
   * @param markerType Type of the marker.
   * @param markerOutline The marker outline.
   * @param markerSize Size of the markers.
   * @param markerFill The marker fill.
   * @param markerStroke The marker stroke.
   * @param markerStrokeThickness The marker stroke thickness.
   * @param edgeRenderingMode The edge rendering mode.
   * @param resolution The resolution.
   * @param binOffset The bin Offset.
   */
  public static async drawMarkers(
    rc: IRenderContext,
    markerPoints: ScreenPoint[],
    markerType: MarkerType,
    markerOutline: ScreenPoint[] | undefined,
    markerSize: number[],
    markerFill: OxyColor,
    markerStroke: OxyColor,
    markerStrokeThickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    resolution: number = 0,
    binOffset: ScreenPoint = new ScreenPoint(),
  ): Promise<void> {
    if (markerType === MarkerType.None) {
      return
    }

    const ellipses: OxyRect[] = []
    const rects: OxyRect[] = []
    const polygons: ScreenPoint[][] = []
    const lines: ScreenPoint[] = []

    const hashset = new Set<number>()

    let i = 0

    for (const p of markerPoints) {
      if (resolution > 1) {
        const x = Math.floor((p.x - binOffset.x) / resolution)
        const y = Math.floor((p.y - binOffset.y) / resolution)
        const hash = toUint(x << 16) + toUint(y)
        if (hashset.has(hash)) {
          i++
          continue
        }
        hashset.add(hash)
      }

      const j = i < markerSize.length ? i : 0
      this.addMarkerGeometry(p, markerType, markerOutline, markerSize[j], ellipses, rects, polygons, lines)

      i++
    }

    if (edgeRenderingMode === EdgeRenderingMode.Automatic) {
      edgeRenderingMode = EdgeRenderingMode.PreferGeometricAccuracy
    }

    if (ellipses.length > 0) {
      await rc.drawEllipses(ellipses, markerFill, markerStroke, markerStrokeThickness, edgeRenderingMode)
    }

    if (rects.length > 0) {
      await rc.drawRectangles(rects, markerFill, markerStroke, markerStrokeThickness, edgeRenderingMode)
    }

    if (polygons.length > 0) {
      await rc.drawPolygons(polygons, markerFill, markerStroke, markerStrokeThickness, edgeRenderingMode)
    }

    if (lines.length > 0) {
      await rc.drawLineSegments(lines, markerStroke, markerStrokeThickness, edgeRenderingMode)
    }
  }

  /**
   * Draws a circle at the specified position.
   * @param rc The render context.
   * @param x The center x-coordinate.
   * @param y The center y-coordinate.
   * @param r The radius.
   * @param fill The fill color.
   * @param stroke The stroke color.
   * @param thickness The thickness.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public static async drawCircle(
    rc: IRenderContext,
    x: number,
    y: number,
    r: number,
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    await rc.drawEllipse(new OxyRect(x - r, y - r, r * 2, r * 2), fill, stroke, thickness, edgeRenderingMode)
  }

  /**
   * Draws a circle at the specified position.
   * @param rc The render context.
   * @param center The center.
   * @param r The radius.
   * @param fill The fill color.
   * @param stroke The stroke color.
   * @param thickness The thickness.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public static async drawCircle2(
    rc: IRenderContext,
    center: ScreenPoint,
    r: number,
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    await this.drawCircle(rc, center.x, center.y, r, fill, stroke, thickness, edgeRenderingMode)
  }

  /**
   * Fills a circle at the specified position.
   * @param rc The render context.
   * @param center The center.
   * @param r The radius.
   * @param fill The fill color.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public static async fillCircle(
    rc: IRenderContext,
    center: ScreenPoint,
    r: number,
    fill: OxyColor,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    await this.drawCircle(rc, center.x, center.y, r, fill, OxyColors.Undefined, 0, edgeRenderingMode)
  }

  /**
   * Fills a rectangle at the specified position.
   * @param rc The render context.
   * @param rectangle The rectangle.
   * @param fill The fill color.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public static async fillRectangle(
    rc: IRenderContext,
    rectangle: OxyRect,
    fill: OxyColor,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    await rc.drawRectangle(rectangle, fill, OxyColors.Undefined, 0, edgeRenderingMode)
  }

  /**
   * Draws the outline of a rectangle with individual stroke thickness for each side.
   * @param rc The render context.
   * @param rect The rectangle.
   * @param stroke The stroke color.
   * @param thickness The thickness.
   * @param edgeRenderingMode The edge rendering mode.
   */
  public static async drawRectangle(
    rc: IRenderContext,
    rect: OxyRect,
    stroke: OxyColor,
    thickness: OxyThickness,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    if (thickness.left === thickness.right && thickness.left === thickness.top && thickness.left === thickness.bottom) {
      await rc.drawRectangle(rect, OxyColors.Undefined, stroke, thickness.left, edgeRenderingMode)
      return
    }

    const adjustedLeft = rect.left - thickness.left / 2 + 0.5
    const adjustedRight = rect.right + thickness.right / 2 - 0.5
    const adjustedTop = rect.top - thickness.top / 2 + 0.5
    const adjustedBottom = rect.bottom + thickness.bottom / 2 - 0.5

    const pointsTop = [new ScreenPoint(adjustedLeft, rect.top), new ScreenPoint(adjustedRight, rect.top)]
    const pointsRight = [new ScreenPoint(rect.right, adjustedTop), new ScreenPoint(rect.right, adjustedBottom)]
    const pointsBottom = [new ScreenPoint(adjustedLeft, rect.bottom), new ScreenPoint(adjustedRight, rect.bottom)]
    const pointsLeft = [new ScreenPoint(rect.left, adjustedTop), new ScreenPoint(rect.left, adjustedBottom)]

    await rc.drawLine(pointsTop, stroke, thickness.top, edgeRenderingMode, undefined, LineJoin.Miter)
    await rc.drawLine(pointsRight, stroke, thickness.right, edgeRenderingMode, undefined, LineJoin.Miter)
    await rc.drawLine(pointsBottom, stroke, thickness.bottom, edgeRenderingMode, undefined, LineJoin.Miter)
    await rc.drawLine(pointsLeft, stroke, thickness.left, edgeRenderingMode, undefined, LineJoin.Miter)
  }

  /**
   * Measures the size of the specified text.
   * @param rc The render context.
   * @param text The text.
   * @param fontFamily The font family.
   * @param fontSize Size of the font.
   * @param fontWeight The font weight.
   * @param angle The angle of measured text (degrees).
   * @returns The size of the text.
   */
  public static measureText(
    rc: IRenderContext,
    text: string,
    fontFamily: string,
    fontSize: number,
    fontWeight: number,
    angle: number,
  ): OxySize {
    const bounds = rc.measureText(text, fontFamily, fontSize, fontWeight)
    return this.measureRotatedRectangleBound(bounds, angle)
  }

  /**
   * Applies the specified clipping rectangle the the render context and returns a reset token. The clipping is reset once this token is disposed.
   * @param rc The render context.
   * @param clippingRectangle The clipping rectangle.
   * @returns The reset token. Clipping is reset once this is disposed.
   */
  public static autoResetClip(rc: IRenderContext, clippingRectangle: OxyRect): IDisposable {
    return new AutoResetClipToken(rc, clippingRectangle)
  }

  /**
   * Adds a marker geometry to the specified collections.
   * @param p The position of the marker.
   * @param type The marker type.
   * @param outline The custom outline, if type is MarkerType.Custom.
   * @param size The size of the marker.
   * @param ellipses The output ellipse collection.
   * @param rects The output rectangle collection.
   * @param polygons The output polygon collection.
   * @param lines The output line collection.
   */
  private static addMarkerGeometry(
    p: ScreenPoint,
    type: MarkerType,
    outline: ScreenPoint[] | undefined,
    size: number,
    ellipses: OxyRect[],
    rects: OxyRect[],
    polygons: ScreenPoint[][],
    lines: ScreenPoint[],
  ) {
    if (type === MarkerType.Custom) {
      if (!outline) {
        throw new Error("The outline should be set when MarkerType is 'Custom'.")
      }

      const poly = outline.map((o) => new ScreenPoint(p.x + o.x * size, p.y + o.y * size))
      polygons.push(poly)
      return
    }

    switch (type) {
      case MarkerType.Circle:
        ellipses.push(new OxyRect(p.x - size, p.y - size, size * 2, size * 2))
        break
      case MarkerType.Square:
        rects.push(new OxyRect(p.x - size, p.y - size, size * 2, size * 2))
        break
      case MarkerType.Diamond:
        polygons.push([
          new ScreenPoint(p.x, p.y - this.M2 * size),
          new ScreenPoint(p.x + this.M2 * size, p.y),
          new ScreenPoint(p.x, p.y + this.M2 * size),
          new ScreenPoint(p.x - this.M2 * size, p.y),
        ])
        break
      case MarkerType.Triangle:
        polygons.push([
          new ScreenPoint(p.x - size, p.y + this.M1 * size),
          new ScreenPoint(p.x + size, p.y + this.M1 * size),
          new ScreenPoint(p.x, p.y - this.M2 * size),
        ])
        break
      case MarkerType.Plus:
      case MarkerType.Star:
        lines.push(new ScreenPoint(p.x - size, p.y))
        lines.push(new ScreenPoint(p.x + size, p.y))
        lines.push(new ScreenPoint(p.x, p.y - size))
        lines.push(new ScreenPoint(p.x, p.y + size))
        break
    }

    const m3 = this.M3
    switch (type) {
      case MarkerType.Cross:
      case MarkerType.Star:
        lines.push(new ScreenPoint(p.x - size * m3, p.y - size * m3))
        lines.push(new ScreenPoint(p.x + size * m3, p.y + size * m3))
        lines.push(new ScreenPoint(p.x - size * m3, p.y + size * m3))
        lines.push(new ScreenPoint(p.x + size * m3, p.y - size * m3))
        break
    }
  }

  /**
   * Calculates the bounds with respect to rotation angle and horizontal/vertical alignment.
   * @param bounds The size of the object to calculate bounds for.
   * @param angle The rotation angle (degrees).
   * @returns A minimum bounding rectangle.
   */
  private static measureRotatedRectangleBound(bounds: OxySize, angle: number): OxySize {
    const oxyRect = bounds.getBounds(angle, HorizontalAlignment.Center, VerticalAlignment.Middle)
    return new OxySize(oxyRect.width, oxyRect.height)
  }

  /**
   * Reduces the specified list of points by the specified minimum squared distance.
   * @param points The points that should be evaluated.
   * @param minDistSquared The minimum line segment length (squared).
   * @param outputBuffer The output buffer. Cannot be null.
   * Points that are closer than the specified distance will not be included in the output buffer.
   */
  private static reducePoints(points: ScreenPoint[], minDistSquared: number, outputBuffer: ScreenPoint[]): void {
    const n = points.length
    if (n === 0) {
      return
    }

    outputBuffer.push(points[0])
    let lastPointIndex = 0
    for (let i = 1; i < n; i++) {
      const sc1 = points[i]

      // length calculation (inlined for performance)
      const dx = sc1.x - points[lastPointIndex].x
      const dy = sc1.y - points[lastPointIndex].y

      if (dx * dx + dy * dy > minDistSquared || i === n - 1) {
        outputBuffer.push(new ScreenPoint(sc1.x, sc1.y))
        lastPointIndex = i
      }
    }
  }

  /**
   * Transforms the given nodes and interpolates the lines if the element exists on a logarithmic plot.
   * @param transposablePlotElement The plot element that defines the transformation.
   * @param points The data points defining the lines.
   * @param screenPoints The destination for the transformed and interpolated screen points.
   * @param maxSegmentLength The maximum length of an interpolated segment in screen space.
   */
  public static transformAndInterpolateLines(
    transposablePlotElement: ITransposablePlotElement,
    points: DataPoint[],
    screenPoints: ScreenPoint[],
    maxSegmentLength: number,
  ): void {
    const xaxis = transposablePlotElement.xAxis!
    const yaxis = transposablePlotElement.yAxis!

    if (xaxis.isLogarithmic() || yaxis.isLogarithmic()) {
      let first = false
      let lastWasUndefined = true
      let last = DataPoint.Undefined

      for (const next of points) {
        // detect and remove invalid points (TODO: replace write a ClipLines method)
        if (!next.isDefined() || (xaxis.isLogarithmic() && next.x <= 0) || (yaxis.isLogarithmic() && next.y <= 0)) {
          lastWasUndefined = true
        } else {
          if (lastWasUndefined) {
            if (screenPoints.length > 0) {
              screenPoints.push(ScreenPoint.Undefined)
            }
            lastWasUndefined = false
            first = true
          } else if (first) {
            const difference = next.minus(last)
            this.interpolatePoints(
              (x) => transposablePlotElement.transform(last.plus(difference.times(x))),
              screenPoints,
              maxSegmentLength,
              first,
            )
          }

          last = next
        }
      }
    } else {
      let lastWasUndefined = true

      for (const dataPoint of points) {
        if (!dataPoint.isDefined()) {
          lastWasUndefined = true
        } else {
          if (lastWasUndefined && screenPoints.length > 0) {
            screenPoints.push(ScreenPoint.Undefined)
          }

          screenPoints.push(transposablePlotElement.transform(dataPoint))
          lastWasUndefined = false
        }
      }
    }
  }

  /**
   * Generates points along a smooth function with a maximum separation.
   * @param func The smooth function evaluated.
   * @param screenPoints The destination for any generated screen points.
   * @param maxSegmentLength the maximum distance between any two points.
   * @param includeFirst Whether or not to include the first point.
   */
  public static interpolatePoints(
    func: (x: number) => ScreenPoint,
    screenPoints: ScreenPoint[],
    maxSegmentLength: number,
    includeFirst: boolean,
  ): void {
    const minLengthSquared = maxSegmentLength * maxSegmentLength

    const candidates: number[] = []
    const candidatePoints: ScreenPoint[] = []
    candidates.push(1.0)
    candidatePoints.push(func(1.0))

    let last = 0.0
    let lastPoint = func(0.0)

    if (includeFirst) {
      screenPoints.push(lastPoint)
    }

    while (candidates.length > 0) {
      let next = candidates[candidates.length - 1]
      let nextPoint = candidatePoints[candidatePoints.length - 1]

      if (nextPoint.distanceToSquared(lastPoint) < minLengthSquared) {
        last = next
        lastPoint = nextPoint
        screenPoints.push(nextPoint)

        candidates.pop()
        candidatePoints.pop()
      } else {
        next = last + (next - last) / 2.0
        nextPoint = func(next)

        candidates.push(next)
        candidatePoints.push(nextPoint)
      }
    }
  }
}

/**
 * Represents the token that is used to automatically reset the clipping in the AutoResetClip method.
 */
class AutoResetClipToken implements IDisposable {
  private readonly renderContext: IRenderContext

  constructor(renderContext: IRenderContext, clippingRectangle: OxyRect) {
    this.renderContext = renderContext
    renderContext.pushClip(clippingRectangle)
  }

  public dispose(): void {
    this.renderContext.popClip()
  }
}
