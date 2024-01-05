import {
  type CreateLineSeriesOptions,
  EdgeRenderingMode,
  type IRenderContext,
  LineSeries,
  LineStyle,
  MarkerType,
  newDataPoint,
  newScreenPoint,
  PlotElementExtensions,
  RenderingExtensions,
  ScreenPoint,
  ScreenPointHelper,
  screenPointMinus,
  screenPointPlus,
  TrackerHitResult,
} from '@/oxyplot'
import { Number_MAX_VALUE } from '@/patch'

export interface CreateStemSeriesOptions extends CreateLineSeriesOptions {
  base?: number
}

/**
 * Represents a series that plots discrete data in a stem plot.
 */
export class StemSeries extends LineSeries {
  /**
   * Initializes a new instance of the StemSeries class.
   */
  constructor(opt?: CreateStemSeriesOptions) {
    super(opt)
    this.base = 0
    if (opt) {
      this.base = opt.base ?? 0
    }
  }

  /**
   * Gets or sets Base.
   */
  public base: number

  /**
   * Gets the point on the series that is nearest the specified point.
   * @param point The point.
   * @param interpolate Interpolate the series if this flag is set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (!this.xAxis || !this.yAxis) {
      return undefined
    }

    if (interpolate) {
      return undefined
    }

    let result: TrackerHitResult | undefined = undefined

    let minimumDistance = Number_MAX_VALUE
    const points = this.actualPoints

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i]
      const basePoint = newDataPoint(p1.x, this.base)
      const sp1 = this.transform(p1)
      const sp2 = this.transform(basePoint)
      let u = ScreenPointHelper.findPositionOnLine(point, sp1, sp2)

      if (isNaN(u)) {
        u = 1 // we are a tiny line, snap to the end
      }

      if (u < 0 || u > 1) {
        u = 1 // we are outside the line, snap to the end
      }

      const sp = screenPointPlus(sp1, screenPointMinus(sp2, sp1).times(u))
      const distance = screenPointMinus(point, sp).lengthSquared

      if (distance < minimumDistance) {
        const item = this.getItem(i)
        const text = this.formatDefaultTrackerString(item, p1)
        result = new TrackerHitResult({
          series: this,
          dataPoint: newDataPoint(p1.x, p1.y),
          position: newScreenPoint(sp1.x, sp1.y),
          item: this.getItem(i),
          index: i,
          text,
        })
        minimumDistance = distance
      }
    }

    return result
  }

  /**
   * Renders the LineSeries on the specified rendering context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (this.actualPoints.length === 0) {
      return
    }

    this.verifyAxes()

    const minDistSquared = this.minimumSegmentLength * this.minimumSegmentLength
    const dashArray = this.actualDashArray
    const actualColor = this.getSelectableColor(this.actualColor)
    const points: ScreenPoint[] = []
    const markerPoints: ScreenPoint[] | undefined = this.markerType !== MarkerType.None ? [] : undefined
    for (const point of this.actualPoints) {
      if (!this.isValidPoint(point)) {
        continue
      }

      points[0] = PlotElementExtensions.transform(this, point.x, this.base)
      points[1] = PlotElementExtensions.transform(this, point.x, point.y)

      if (this.strokeThickness > 0 && this.actualLineStyle !== LineStyle.None) {
        const edgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
          this.edgeRenderingMode,
          EdgeRenderingMode.PreferSharpness,
        )
        await RenderingExtensions.drawReducedLine(
          rc,
          points,
          minDistSquared,
          actualColor,
          this.strokeThickness,
          edgeRenderingMode,
          dashArray,
          this.lineJoin,
        )
      }

      if (markerPoints) {
        markerPoints.push(points[1])
      }
    }

    if (markerPoints && markerPoints.length > 0) {
      await RenderingExtensions.drawMarkers(
        rc,
        markerPoints,
        this.markerType,
        this.markerOutline,
        [this.markerSize],
        this.actualMarkerFill,
        this.markerStroke,
        this.markerStrokeThickness,
        this.edgeRenderingMode,
      )
    }
  }
}
