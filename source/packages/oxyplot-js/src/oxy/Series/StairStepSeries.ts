import type { CreateLineSeriesOptions, IRenderContext } from '@/oxyplot'
import {
  DataPoint,
  EdgeRenderingMode,
  LineSeries,
  LineStyle,
  LineStyleHelper,
  MarkerType,
  PlotElementExtensions,
  RenderingExtensions,
  ScreenPoint,
  TrackerHitResult,
} from '@/oxyplot'
import { Number_MAX_VALUE, removeUndef } from '@/patch'

export interface CreateStairStepSeriesOptions extends CreateLineSeriesOptions {
  verticalStrokeThickness?: number
  verticalLineStyle?: LineStyle
}

/**
 * Represents a series for stair step graphs.
 */
export class StairStepSeries extends LineSeries {
  /**
   * Initializes a new instance of the StairStepSeries class.
   */
  constructor(opt?: CreateStairStepSeriesOptions) {
    super(opt)
    this.verticalStrokeThickness = NaN
    this.verticalLineStyle = this.lineStyle

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the stroke thickness of the vertical line segments.
   */
  public verticalStrokeThickness: number

  /**
   * Gets or sets the line style of the vertical line segments.
   */
  public verticalLineStyle: LineStyle

  /**
   * Gets the nearest point.
   * @param point The point.
   * @param interpolate interpolate if set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (!this.xAxis || !this.yAxis) {
      return undefined
    }

    // http://paulbourke.net/geometry/pointlineplane/
    let minimumDistanceSquared = 16 * 16

    // snap to the nearest point
    let result = this.getNearestPointInternal(this.actualPoints, 0, point)
    if (!interpolate && result && result.position!.distanceToSquared(point) < minimumDistanceSquared) {
      result.text = this.formatDefaultTrackerString(result.item, result.dataPoint!)
      return result
    }

    result = undefined

    // find the nearest point on the horizontal line segments
    const n = this.actualPoints.length
    for (let i = 0; i < n; i++) {
      const p1 = this.actualPoints[i]
      const p2 = this.actualPoints[i + 1 < n ? i + 1 : i]
      const sp1 = PlotElementExtensions.transform(this, p1.x, p1.y)
      const sp2 = PlotElementExtensions.transform(this, p2.x, p1.y)

      const spdx = sp2.x - sp1.x
      const spdy = sp2.y - sp1.y
      let u1 = (point.x - sp1.x) * spdx + (point.y - sp1.y) * spdy
      let u2 = spdx * spdx + spdy * spdy
      const ds = spdx * spdx + spdy * spdy

      if (ds < 4) {
        // if the points are very close, we can get numerical problems, just use the first point...
        u1 = 0
        u2 = 1
      }

      if (Math.abs(u2) <= 0) {
        continue // P1 && P2 coincident
      }

      const u = u1 / u2
      if (u < 0 || u > 1) {
        continue // outside line
      }

      const sx = sp1.x + u * spdx
      const sy = sp1.y + u * spdy

      const dx = point.x - sx
      const dy = point.y - sy
      const distanceSquared = dx * dx + dy * dy

      if (distanceSquared >= minimumDistanceSquared) continue

      const px = p1.x + u * (p2.x - p1.x)
      const py = p1.y
      const item = this.getItem(i)
      const text = this.formatDefaultTrackerString(item, new DataPoint(px, py))

      result = new TrackerHitResult({
        series: this,
        dataPoint: new DataPoint(px, py),
        position: new ScreenPoint(sx, sy),
        item,
        index: i,
        text: text,
      })
      minimumDistanceSquared = distanceSquared
    }

    return result
  }

  public async render(rc: IRenderContext): Promise<void> {
    if (!this.actualPoints || this.actualPoints.length === 0) {
      return
    }

    this.verifyAxes()

    const dashArray = this.actualDashArray
    const verticalLineDashArray = LineStyleHelper.getDashArray(this.verticalLineStyle)
    const lineStyle = this.actualLineStyle
    const verticalStrokeThickness = isNaN(this.verticalStrokeThickness)
      ? this.strokeThickness
      : this.verticalStrokeThickness

    const actualColor = this.getSelectableColor(this.actualColor)
    const edgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )

    const renderPoints = async (linePoints: ScreenPoint[], markerPoints: ScreenPoint[]): Promise<void> => {
      if (this.strokeThickness > 0 && lineStyle !== LineStyle.None) {
        if (verticalStrokeThickness !== this.strokeThickness || this.verticalLineStyle !== lineStyle) {
          const hLinePoints: ScreenPoint[] = []
          const vLinePoints: ScreenPoint[] = []
          if (linePoints.length >= 2) {
            hLinePoints.push(linePoints[0])
            hLinePoints.push(linePoints[1])
            for (let i = 1; i + 2 < linePoints.length; i += 2) {
              vLinePoints.push(linePoints[i])
              vLinePoints.push(linePoints[i + 1])
              hLinePoints.push(linePoints[i + 1])
              hLinePoints.push(linePoints[i + 2])
            }
          }

          await rc.drawLineSegments(
            hLinePoints,
            actualColor,
            this.strokeThickness,
            edgeRenderingMode,
            dashArray,
            this.lineJoin,
          )
          await rc.drawLineSegments(
            vLinePoints,
            actualColor,
            verticalStrokeThickness,
            edgeRenderingMode,
            verticalLineDashArray,
            this.lineJoin,
          )
        } else {
          await rc.drawLine(linePoints, actualColor, this.strokeThickness, edgeRenderingMode, dashArray, this.lineJoin)
        }
      }

      if (this.markerType !== MarkerType.None) {
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

    const points = this.actualPoints

    let offset = 0
    let xClipMax = Number_MAX_VALUE

    if (this.isXMonotonic) {
      const xClipMin = this.xAxis!.clipMinimum
      xClipMax = this.xAxis!.clipMaximum

      this.windowStartIndex = this.updateWindowStartIndex(points, (point) => point.x, xClipMin, this.windowStartIndex)
      offset = this.windowStartIndex
    }

    const linePoints: ScreenPoint[] = []
    const markerPoints: ScreenPoint[] = []

    for (let i = offset; i < points.length; ) {
      const { valid, validOffset, endOffset } = this.findNextValidSegment(points, i, xClipMax)
      if (!valid) break

      let transformedPoint = new ScreenPoint(0, 0)
      let previousPoint = DataPoint.Undefined
      let xIncreased = false
      let xDecreased = false

      for (i = validOffset; i < endOffset; ++i) {
        const point = points[i]

        xIncreased = xIncreased || point.x > previousPoint.x
        xDecreased = xDecreased || point.x < previousPoint.x

        if (xIncreased && xDecreased) {
          linePoints.push(this.transform(previousPoint))
          linePoints.push(this.transform(previousPoint))

          xIncreased = point.x > previousPoint.x
          xDecreased = point.x < previousPoint.x
        }

        transformedPoint = this.transform(point)

        if (point.y !== previousPoint.y) {
          if (!isNaN(previousPoint.y)) linePoints.push(this.transform(new DataPoint(point.x, previousPoint.y)))

          linePoints.push(transformedPoint)

          xIncreased = false
          xDecreased = false
        }

        previousPoint = point

        markerPoints.push(transformedPoint)
      }

      if (i < points.length && this.xAxis!.isValidValue(points[i].x)) {
        linePoints.push(this.transform(new DataPoint(points[i].x, previousPoint.y)))
      } else {
        linePoints.push(transformedPoint)
      }

      await renderPoints(linePoints, markerPoints)

      linePoints.length = 0
      markerPoints.length = 0
    }

    if (this.labelStringFormatter) {
      await this.renderPointLabels(rc)
    }
  }

  private findNextValidSegment(
    points: DataPoint[],
    offset: number,
    xClipMax: number,
  ): {
    valid: boolean
    validOffset: number
    endOffset: number
  } {
    // Skip invalid points.
    for (; ; ++offset) {
      if (offset >= points.length) {
        return { valid: false, validOffset: 0, endOffset: 0 }
      }

      const point = points[offset]
      if (point.x > xClipMax) {
        return { valid: false, validOffset: 0, endOffset: 0 }
      }

      if (this.isValidPoint(point)) {
        break
      }
    }

    const validOffset = offset

    // Skip valid points.
    for (; ; ++offset) {
      if (offset >= points.length) {
        break
      }

      const point = points[offset]

      if (!this.isValidPoint(point)) {
        break
      }

      if (point.x > xClipMax) {
        break
      }
    }

    const endOffset = offset
    return { valid: true, validOffset, endOffset }
  }
}
