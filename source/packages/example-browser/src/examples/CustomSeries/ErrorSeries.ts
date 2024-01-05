import {
  type IRenderContext,
  LineJoin,
  newScreenPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  RenderingExtensions,
  ScreenPoint,
  XYAxisSeries,
} from 'oxyplot-js'

/**
 * Represents an error item.
 */
export class ErrorItem {
  /**
   * The X.
   */
  public x: number

  /**
   * The Y.
   */
  public y: number

  /**
   * The X error.
   */
  public xError: number

  /**
   * The Y error.
   */
  public yError: number

  /**
   * Initializes a new instance of the ErrorItem class.
   */
  constructor()

  /**
   * Initializes a new instance of the ErrorItem class.
   * @param x The x.
   * @param y The y.
   * @param xError The x error.
   * @param yError The y error.
   */
  constructor(x: number, y: number, xError: number, yError: number)

  constructor(x?: number, y?: number, xError?: number, yError?: number) {
    this.x = x || 0
    this.y = y || 0
    this.xError = xError || 0
    this.yError = yError || 0
  }
}

/**
 * Represents an error series.
 */
export class ErrorSeries extends XYAxisSeries {
  /**
   * The list of error items.
   */
  private readonly points: ErrorItem[] = []

  /**
   * Initializes a new instance of the ErrorSeries class.
   */
  constructor() {
    super()
    this.color = OxyColors.Black
    this.strokeThickness = 1
  }

  /**
   * Gets or sets the color.
   */
  public color: OxyColor

  /**
   * Gets the list of points.
   */
  public get pointsList(): ErrorItem[] {
    return this.points
  }

  /**
   * Gets or sets the stroke thickness.
   */
  public strokeThickness: number

  /**
   * Renders the series on the specified render context.
   * @param rc The render context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    const points = this.points
    if (points.length === 0) {
      return
    }

    this.verifyAxes()

    const n = points.length

    // Transform all points to screen coordinates
    const segments: ScreenPoint[] = []
    for (let i = 0; i < n; i++) {
      const sp = this.xAxis!.transformPoint(points[i].x, points[i].y, this.yAxis!)
      const ei = points[i]
      const errorx = ei ? ei.xError * this.xAxis!.scale : 0
      const errory = ei ? ei.yError * Math.abs(this.yAxis!.scale) : 0
      const d = 4

      if (errorx > 0) {
        const p0 = newScreenPoint(sp.x - errorx * 0.5, sp.y)
        const p1 = newScreenPoint(sp.x + errorx * 0.5, sp.y)
        segments.push(
          p0,
          p1,
          newScreenPoint(p0.x, p0.y - d),
          newScreenPoint(p0.x, p0.y + d),
          newScreenPoint(p1.x, p1.y - d),
          newScreenPoint(p1.x, p1.y + d),
        )
      }

      if (errory > 0) {
        const p0 = newScreenPoint(sp.x, sp.y - errory * 0.5)
        const p1 = newScreenPoint(sp.x, sp.y + errory * 0.5)
        segments.push(
          p0,
          p1,
          newScreenPoint(p0.x - d, p0.y),
          newScreenPoint(p0.x + d, p0.y),
          newScreenPoint(p1.x - d, p1.y),
          newScreenPoint(p1.x + d, p1.y),
        )
      }
    }

    // clip the line segments with the clipping rectangle
    for (let i = 0; i + 1 < segments.length; i += 2) {
      await RenderingExtensions.drawReducedLine(
        rc,
        [segments[i], segments[i + 1]],
        0,
        this.getSelectableColor(this.color),
        this.strokeThickness,
        this.edgeRenderingMode,
        undefined,
        LineJoin.Bevel,
      )
    }
  }

  /**
   * Renders the legend symbol on the specified rendering context.
   * @param rc The rendering context.
   * @param legendBox The legend rectangle.
   */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const xmid = (legendBox.left + legendBox.right) / 2
    const ymid = (legendBox.top + legendBox.bottom) / 2
    const pts: ScreenPoint[] = [
      newScreenPoint(legendBox.left, ymid),
      newScreenPoint(legendBox.right, ymid),
      newScreenPoint(legendBox.left, ymid - 2),
      newScreenPoint(legendBox.left, ymid + 3),
      newScreenPoint(legendBox.right, ymid - 2),
      newScreenPoint(legendBox.right, ymid + 3),

      newScreenPoint(xmid, legendBox.top),
      newScreenPoint(xmid, legendBox.bottom),
      newScreenPoint(xmid - 2, legendBox.top),
      newScreenPoint(xmid + 3, legendBox.top),
      newScreenPoint(xmid - 2, legendBox.bottom),
      newScreenPoint(xmid + 3, legendBox.bottom),
    ]
    await rc.drawLineSegments(
      pts,
      this.getSelectableColor(this.color),
      this.strokeThickness,
      this.edgeRenderingMode,
      undefined,
      LineJoin.Miter,
    )
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()
    this.internalUpdateMaxMin3(
      this.points,
      (p) => p.x - p.xError,
      (p) => p.x + p.xError,
      (p) => p.y - p.yError,
      (p) => p.y + p.yError,
    )
  }
}
