import {
  DataPoint,
  type IRenderContext,
  LineSeries,
  LineStyle,
  LineStyleHelper,
  newDataPoint,
  RenderingExtensions,
  ScreenPoint,
  ScreenPointHelper,
  TrackerHitResult,
} from 'oxyplot-js'

/**
 * Represents a line series where the points collection define line segments.
 */
export class LineSegmentSeries extends LineSeries {
  /**
   * Initializes a new instance of the LineSegmentSeries class.
   */
  constructor() {
    super()
    this.showVerticals = true
    this.epsilon = 1e-8
  }

  /**
   * Gets or sets a value indicating whether to show vertical lines where there is no gap in x-coordinate.
   */
  public showVerticals: boolean

  /**
   * Gets or sets the x-coordinate gap tolerance.
   */
  public epsilon: number

  /**
   * Renders the series on the specified render context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (this.points.length === 0) {
      return
    }

    if (this.points.length % 2 !== 0) {
      throw new Error('The number of points should be even.')
    }

    if (!this.xAxis || !this.yAxis) {
      throw new Error('Axis has not been defined.')
    }

    const screenPoints = this.points.map((x) => this.transform(x))
    const verticalLines: ScreenPoint[] = []

    for (let i = 0; i < screenPoints.length; i += 2) {
      if (screenPoints[i].distanceToSquared(screenPoints[i + 1]) < this.strokeThickness) {
        screenPoints[i] = new ScreenPoint(screenPoints[i].x - this.strokeThickness * 0.5, screenPoints[i].y)
        screenPoints[i + 1] = new ScreenPoint(screenPoints[i].x + this.strokeThickness * 0.5, screenPoints[i].y)
      }

      if (this.showVerticals && i > 0 && Math.abs(screenPoints[i - 1].x - screenPoints[i].x) < this.epsilon) {
        verticalLines.push(screenPoints[i - 1])
        verticalLines.push(screenPoints[i])
      }
    }

    if (this.strokeThickness > 0) {
      if (this.lineStyle !== LineStyle.None) {
        const dashArray = LineStyleHelper.getDashArray(this.lineStyle)
        await rc.drawLineSegments(
          screenPoints,
          this.actualColor,
          this.strokeThickness,
          this.edgeRenderingMode,
          dashArray,
          this.lineJoin,
        )
      }

      await rc.drawLineSegments(
        verticalLines,
        this.actualColor,
        this.strokeThickness / 3,
        this.edgeRenderingMode,
        LineStyleHelper.getDashArray(LineStyle.Dash),
        this.lineJoin,
      )
    }

    await RenderingExtensions.drawMarkers(
      rc,
      screenPoints,
      this.markerType,
      undefined,
      [this.markerSize],
      this.markerFill,
      this.markerStroke,
      this.markerStrokeThickness,
      this.edgeRenderingMode,
    )
  }

  /**
   * Get the nearest point.
   * @param point The screen point.
   * @param interpolate Whether to interpolate.
   * @returns The tracker hit result.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    const points = this.points

    if (!points) {
      return undefined
    }

    let spn: ScreenPoint | undefined
    let dpn: DataPoint | undefined
    let index = -1

    let minimumDistance = Number.MAX_VALUE

    for (let i = 0; i + 1 < points.length; i += 2) {
      const p1 = points[i]
      const p2 = points[i + 1]
      if (!this.isValidPoint(p1) || !this.isValidPoint(p2)) {
        continue
      }

      const sp1 = this.transform(p1)
      const sp2 = this.transform(p2)

      // Find the nearest point on the line segment.
      const spl = ScreenPointHelper.findPointOnLine(point, sp1, sp2)

      if (ScreenPoint.isUndefined(spl)) {
        // P1 && P2 coincident
        continue
      }

      const l2 = point.distanceToSquared(spl)

      if (l2 < minimumDistance) {
        const u = spl.distanceTo(sp1) / sp2.distanceTo(sp1)
        dpn = newDataPoint(p1.x + u * (p2.x - p1.x), p1.y + u * (p2.y - p1.y))
        spn = spl
        minimumDistance = l2
        index = i + u
      }
    }

    if (minimumDistance < Number.MAX_VALUE) {
      const item = this.getItem(Math.floor(index))
      return new TrackerHitResult({
        series: this,
        dataPoint: dpn,
        position: spn,
        item: item,
        index: index,
        text: `${this.title || ''}\nx: ${item.x}\ny: ${item.y}`,
      })
    }

    return undefined
  }
}
