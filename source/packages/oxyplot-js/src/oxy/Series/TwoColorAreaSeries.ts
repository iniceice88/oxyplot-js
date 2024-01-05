import {
  AreaRenderContext,
  AreaSeries,
  type CreateAreaSeriesOptions,
  DataPoint,
  type IRenderContext,
  LineStyle,
  LineStyleHelper, newDataPoint,
  OxyColor,
  OxyColors,
  RenderingExtensions,
  ScreenPoint,
  TrackerHitResult,
} from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface CreateTwoColorAreaSeriesOptions extends CreateAreaSeriesOptions {
  color2?: OxyColor
  fill2?: OxyColor
  lineStyle2?: LineStyle
  markerFill2?: OxyColor
  markerStroke2?: OxyColor
  limit?: number
}

/**
 * Represents a two-color area series.
 */
export class TwoColorAreaSeries extends AreaSeries {
  /**
   * The default second color.
   */
  private defaultColor2: OxyColor = OxyColors.Undefined

  /**
   * The collection of points above the limit.
   */
  private abovePoints: DataPoint[] = []

  /**
   * The collection of points below the limit.
   */
  private belowPoints: DataPoint[] = []

  /**
   * Start index of a visible rendering window for markers.
   */
  private markerStartIndex: number = 0

  /**
   * Initializes a new instance of the TwoColorAreaSeries class.
   */
  constructor(opt?: CreateTwoColorAreaSeriesOptions) {
    super(opt)
    this.color2 = OxyColor.fromRgb(0, 0, 255) // Blue

    this.fill = OxyColors.Automatic
    this.fill2 = OxyColors.Automatic

    this.markerFill2 = OxyColors.Automatic
    this.markerStroke2 = OxyColors.Automatic
    this.lineStyle2 = LineStyle.Solid

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the area fill color below the limit line.
   */
  fill2: OxyColor

  /**
   * Gets the actual fill color below the limit line.
   */
  get actualFill2(): OxyColor {
    return this.fill2.getActualColor(OxyColor.fromAColor(100, this.actualColor2))
  }

  /**
   * Gets the actual second color.
   */
  get actualColor2(): OxyColor {
    return this.color2.getActualColor(this.defaultColor2)
  }

  /**
   * Gets or sets the dash array for the rendered line that is below the limit (overrides LineStyle).
   */
  dashes2?: number[]

  /**
   * Gets or sets the line style for the part of the line that is below the limit.
   */
  lineStyle2: LineStyle

  /**
   * Gets the actual line style for the part of the line that is below the limit.
   */
  get actualLineStyle2(): LineStyle {
    return this.lineStyle2 !== LineStyle.Automatic ? this.lineStyle2 : LineStyle.Solid
  }

  /**
   * Gets the actual dash array for the line that is below the limit.
   */
  get actualDashArray2(): number[] | undefined {
    return this.dashes2 ?? LineStyleHelper.getDashArray(this.actualLineStyle2)
  }

  /**
   * Gets or sets the marker fill color which is below the limit line. The default is OxyColors.Automatic.
   */
  markerFill2: OxyColor

  /**
   * Gets or sets the marker stroke which is below the limit line. The default is OxyColors.Automatic.
   */
  markerStroke2: OxyColor

  /**
   * Gets or sets a baseline for the series.
   */
  limit: number = 0

  /**
   * Gets the nearest point.
   * @param point The point.
   * @param interpolate Interpolate if set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    let result: TrackerHitResult | undefined

    if (interpolate && this.canTrackerInterpolatePoints) {
      result = this.getNearestInterpolatedPointInternal(this.actualPoints, 0, point)
    } else {
      result = this.getNearestPointInternal(this.actualPoints, 0, point)
    }

    if (result) {
      result.text = this.formatDefaultTrackerString(result.item, result.dataPoint!)
    }

    return result
  }

  /**
   * Renders the series on the specified render context.
   * @param rc The render context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    // determine render range
    const xmin = this.xAxis!.clipMinimum
    const xmax = this.xAxis!.clipMaximum
    const getPointX = (dp: DataPoint) => dp.x

    this.windowStartIndex = this.updateWindowStartIndex(this.abovePoints, getPointX, xmin, this.windowStartIndex)
    this.windowStartIndex2 = this.updateWindowStartIndex(this.belowPoints, getPointX, xmin, this.windowStartIndex2)

    const minDistSquared = this.minimumSegmentLength * this.minimumSegmentLength

    const areaContext: TwoColorAreaRenderContext = {
      points: this.abovePoints,
      windowStartIndex: this.windowStartIndex,
      xMax: xmax,
      renderContext: rc,
      minDistSquared: minDistSquared,
      reverse: false,
      color: this.actualColor,
      fill: this.actualFill,
      markerFill: this.actualMarkerFill,
      markerStroke: this.markerStroke,
      dashArray: this.actualDashArray,
      baseline: this.limit,
    }

    await this.renderChunkedPoints(areaContext)

    areaContext.points = this.belowPoints
    areaContext.windowStartIndex = this.windowStartIndex2
    areaContext.reverse = this.reverse2
    areaContext.color = this.actualColor2
    areaContext.fill = this.actualFill2
    areaContext.markerFill = this.markerFill2
    areaContext.markerStroke = this.markerStroke2
    areaContext.dashArray = this.actualDashArray2
    if (this.isPoints2Defined) {
      areaContext.baseline = this.constantY2
    }

    await this.renderChunkedPoints(areaContext)

    if (!this.isPoints2Defined) {
      const markerSizes = [this.markerSize]
      const limit = this.limit
      const points = this.actualPoints
      const aboveMarkers: ScreenPoint[] = []
      const belowMarkers: ScreenPoint[] = []
      this.markerStartIndex = this.updateWindowStartIndex(points, getPointX, xmin, this.markerStartIndex)

      let markerClipCount = 0
      for (let i = this.markerStartIndex; i < points.length; i++) {
        const point = points[i]
        ;(point.y >= limit ? aboveMarkers : belowMarkers).push(this.transform(point))

        markerClipCount += point.x > xmax ? 1 : 0
        if (markerClipCount > 1) {
          break
        }
      }

      await RenderingExtensions.drawMarkers(
        rc,
        aboveMarkers,
        this.markerType,
        undefined,
        markerSizes,
        this.actualMarkerFill,
        this.markerStroke,
        this.markerStrokeThickness,
        this.edgeRenderingMode,
        1,
      )

      await RenderingExtensions.drawMarkers(
        rc,
        belowMarkers,
        this.markerType,
        undefined,
        markerSizes,
        this.markerFill2,
        this.markerStroke2,
        this.markerStrokeThickness,
        this.edgeRenderingMode,
        1,
      )
    }
  }

  /**
   * Sets the default values.
   * @internal
   */
  setDefaultValues(): void {
    super.setDefaultValues()

    if (this.color2.isAutomatic()) {
      this.defaultColor2 = this.plotModel.getDefaultColor()
    }

    if (this.lineStyle2 === LineStyle.Automatic) {
      this.lineStyle2 = this.plotModel.getDefaultLineStyle()
    }
  }

  /**
   * The update data.
   * @internal
   */
  updateData(): void {
    super.updateData()

    if (this.isPoints2Defined) {
      this.abovePoints = this.actualPoints
      this.belowPoints = this.actualPoints2
    } else {
      this.splitPoints(this.actualPoints)
    }
  }

  /**
   * Renders a chunk of points on the screen.
   * @param context Render context.
   * @param points Screen points.
   * @returns The list of resampled points.
   */
  protected async renderScreenPoints(context: AreaRenderContext, points: ScreenPoint[]): Promise<ScreenPoint[]> {
    const result = await super.renderScreenPoints(context, points)
    const twoColorContext = context as TwoColorAreaRenderContext

    const baseline = this.getConstantScreenPoints2(result, twoColorContext.baseline)
    const polygon = [...baseline, ...result]

    const rc = context.renderContext!
    await RenderingExtensions.drawReducedPolygon(
      rc,
      polygon,
      context.minDistSquared,
      this.getSelectableFillColor(twoColorContext.fill),
      OxyColors.Undefined,
      0,
      this.edgeRenderingMode,
    )

    if (this.isPoints2Defined) {
      const markerSizes = [this.markerSize]

      // draw the markers on top
      await RenderingExtensions.drawMarkers(
        rc,
        result,
        this.markerType,
        undefined,
        markerSizes,
        twoColorContext.markerFill,
        twoColorContext.markerStroke,
        this.markerStrokeThickness,
        this.edgeRenderingMode,
        1,
      )
    }

    return result
  }

  /**
   * Splits a collection of points into two collections based on their Y value.
   * @param source A collection of points to split.
   */
  private splitPoints(source: DataPoint[]): void {
    const nan = newDataPoint(Number.NaN, Number.NaN)
    const limit = this.limit
    this.abovePoints = new Array<DataPoint>()
    this.belowPoints = new Array<DataPoint>()

    let lastAbove = false
    let lastPoint: DataPoint | null = null
    for (const point of source) {
      const isAbove = point.y >= limit

      if (lastPoint && isAbove !== lastAbove) {
        const shared = newDataPoint(this.getInterpolatedX(lastPoint, point, limit), limit)
        this.abovePoints.push(isAbove ? nan : shared)
        this.abovePoints.push(isAbove ? shared : nan)

        this.belowPoints.push(isAbove ? shared : nan)
        this.belowPoints.push(isAbove ? nan : shared)
      }

      ;(isAbove ? this.abovePoints : this.belowPoints).push(point)

      lastPoint = point
      lastAbove = isAbove
    }
  }

  /**
   * Gets the screen points when baseline is used.
   * @param source The list of polygon screen points.
   * @param baseline Baseline Y value for the polygon.
   * @returns A sequence of DataPoint.
   */
  private getConstantScreenPoints2(source: ScreenPoint[], baseline: number): ScreenPoint[] {
    const result: ScreenPoint[] = []

    if (isNaN(baseline) || source.length <= 0) {
      return result
    }

    let p1 = this.inverseTransform(source[0])
    p1 = newDataPoint(p1.x, baseline)
    result.push(this.transform(p1))

    let p2 = this.inverseTransform(source[source.length - 1])
    p2 = newDataPoint(p2.x, baseline)
    result.push(this.transform(p2))

    if (this.reverse2) {
      result.reverse()
    }

    return result
  }

  /**
   * Gets interpolated X coordinate for given Y on a straight line
   * between two points.
   * @param a First point.
   * @param b Second point.
   * @param y Y coordinate.
   * @returns Corresponding X coordinate.
   */
  private getInterpolatedX(a: DataPoint, b: DataPoint, y: number): number {
    return ((y - a.y) / (b.y - a.y)) * (b.x - a.x) + a.x
  }
}

class TwoColorAreaRenderContext extends AreaRenderContext {
  /** Gets or sets area baseline value. */
  public baseline: number = 0

  /** Gets or sets polygon fill color. */
  public fill: OxyColor = OxyColors.Undefined

  /** Gets or sets marker fill color. */
  public markerFill: OxyColor = OxyColors.Undefined

  /** Gets or sets marker stroke color. */
  public markerStroke: OxyColor = OxyColors.Undefined
}
