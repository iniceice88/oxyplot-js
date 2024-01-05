import {
  type CreateLineSeriesOptions,
  DataPoint,
  type IRenderContext,
  LineSeries,
  LineStyle,
  LineStyleHelper,
  newDataPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
  ScreenPoint,
  ScreenPointHelper,
  TrackerHitResult,
} from '@/oxyplot'
import { getOrDefault, Number_MAX_VALUE, removeUndef } from '@/patch'

export interface CreateAreaSeriesOptions extends CreateLineSeriesOptions {
  /**
   * Gets or sets a constant value for the area definition.
   * This is used if DataFieldBase and BaselineValues are undefined.
   */
  constantY2?: number

  /**
   * Gets or sets the data field to use for the X-coordinates of the second data set.
   */
  dataFieldX2?: string

  /**
   * Gets or sets the data field to use for the Y-coordinates of the second data set.
   */
  dataFieldY2?: string

  /**
   * Gets or sets the color of the line for the second data set.
   */
  color2?: OxyColor

  /**
   * Gets or sets the fill color of the area.
   */
  fill?: OxyColor

  /**
   * Gets or sets a value indicating whether the second data collection should be reversed.
   */
  reverse2?: boolean
}

/**
 * Represents an area series that fills the polygon defined by two sets of points or one set of points and a constant.
 */
export class AreaSeries extends LineSeries {
  /**
   * The second list of points.
   */
  private readonly _points2: DataPoint[] = []

  /**
   * The secondary data points from the ItemsSource collection.
   */
  private readonly itemsSourcePoints2: DataPoint[] = []

  /**
   * The secondary data points from the Points2 list.
   */
  private _actualPoints2?: DataPoint[]

  /**
   * Initializes a new instance of the AreaSeries class.
   */
  constructor(opt?: CreateAreaSeriesOptions) {
    super(opt)
    this.reverse2 = true
    this.color2 = OxyColors.Automatic
    this.fill = OxyColors.Automatic

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets a constant value for the area definition.
   * This is used if DataFieldBase and BaselineValues are undefined.
   */
  constantY2: number = 0

  /**
   * Gets or sets the data field to use for the X-coordinates of the second data set.
   */
  dataFieldX2?: string

  /**
   * Gets or sets the data field to use for the Y-coordinates of the second data set.
   */
  dataFieldY2?: string

  /**
   * Gets or sets the color of the line for the second data set.
   */
  color2: OxyColor

  /**
   * Gets the actual color of the line for the second data set.
   */
  get actualColor2(): OxyColor {
    return this.color2.getActualColor(this.actualColor)
  }

  /**
   * Gets or sets the fill color of the area.
   */
  fill: OxyColor

  /**
   * Gets the actual fill color of the area.
   */
  get actualFill(): OxyColor {
    return this.fill.getActualColor(OxyColor.fromAColor(100, this.actualColor))
  }

  /**
   * Gets the second list of points.
   */
  get points2(): DataPoint[] {
    return this._points2
  }

  /**
   * Gets or sets a value indicating whether the second data collection should be reversed.
   */
  reverse2: boolean = false

  /**
   * Gets the actual points of the second data set.
   */
  protected get actualPoints2(): DataPoint[] {
    return this.itemsSource ? this.itemsSourcePoints2 : this._actualPoints2!
  }

  /**
   * Gets or sets the last visible window start position in second data points collection.
   */
  protected windowStartIndex2: number = 0

  /**
   * Gets a value indicating whether Points2 collection was defined by user.
   */
  protected isPoints2Defined: boolean = false

  /**
   * Gets the nearest point.
   * @param point The point.
   * @param interpolate interpolate if set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    const startIdx = this.isXMonotonic ? this.windowStartIndex : 0
    const startIdx2 = this.isXMonotonic ? this.windowStartIndex2 : 0

    let result1: TrackerHitResult | undefined, result2: TrackerHitResult | undefined
    if (interpolate && this.canTrackerInterpolatePoints) {
      result1 = this.getNearestInterpolatedPointInternal(this.actualPoints, startIdx, point)
      result2 = this.getNearestInterpolatedPointInternal(this.actualPoints2, startIdx2, point)
    } else {
      result1 = this.getNearestPointInternal(this.actualPoints, startIdx, point)
      result2 = this.getNearestPointInternal(this.actualPoints2, startIdx2, point)
    }

    let result: TrackerHitResult | undefined
    if (result1 && result2) {
      const dist1 = result1.position!.distanceTo(point)
      const dist2 = result2.position!.distanceTo(point)
      result = dist1 < dist2 ? result1 : result2
    } else {
      result = result1 ?? result2
    }

    if (result) {
      result.text = this.formatDefaultTrackerString(result.item, result.dataPoint!)
    }

    return result
  }

  /**
   * Renders the series on the specified rendering context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    this.verifyAxes()

    const actualPoints = this.actualPoints
    if (!actualPoints || actualPoints.length === 0) {
      return
    }

    const actualPoints2 = this.actualPoints2
    if (!actualPoints2 || actualPoints2.length === 0) {
      return
    }

    let startIdx = 0
    let startIdx2 = 0
    let xmax = Number_MAX_VALUE

    if (this.isXMonotonic) {
      // determine render range
      const xmin = this.xAxis!.clipMinimum
      xmax = this.xAxis!.clipMaximum
      this.windowStartIndex = this.updateWindowStartIndex(actualPoints, (point) => point.x, xmin, this.windowStartIndex)
      this.windowStartIndex2 = this.updateWindowStartIndex(
        actualPoints2,
        (point) => point.x,
        xmin,
        this.windowStartIndex2,
      )

      startIdx = this.windowStartIndex
      startIdx2 = this.windowStartIndex2
    }

    const minDistSquared = this.minimumSegmentLength * this.minimumSegmentLength

    const areaContext: AreaRenderContext = {
      points: actualPoints,
      windowStartIndex: startIdx,
      xMax: xmax,
      renderContext: rc,
      minDistSquared: minDistSquared,
      reverse: false,
      color: this.actualColor,
      dashArray: this.actualDashArray,
    }

    const chunksOfPoints = await this.renderChunkedPoints(areaContext)

    areaContext.points = actualPoints2
    areaContext.windowStartIndex = startIdx2
    areaContext.reverse = this.reverse2
    areaContext.color = this.actualColor2

    const chunksOfPoints2 = await this.renderChunkedPoints(areaContext)

    if (chunksOfPoints.length !== chunksOfPoints2.length) {
      return
    }

    // Draw the fill
    for (let chunkIndex = 0; chunkIndex < chunksOfPoints.length; chunkIndex++) {
      const pts = chunksOfPoints[chunkIndex]
      const pts2 = chunksOfPoints2[chunkIndex]

      // combine the two lines and draw the clipped area
      const allPts: ScreenPoint[] = []
      allPts.push(...pts2)
      allPts.push(...pts)
      await RenderingExtensions.drawReducedPolygon(
        rc,
        allPts,
        minDistSquared,
        this.getSelectableFillColor(this.actualFill),
        OxyColors.Undefined,
        0,
        this.edgeRenderingMode,
      )

      const markerSizes = [this.markerSize]

      // draw the markers on top
      await RenderingExtensions.drawMarkers(
        rc,
        pts,
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
        pts2,
        this.markerType,
        undefined,
        markerSizes,
        this.markerFill,
        this.markerStroke,
        this.markerStrokeThickness,
        this.edgeRenderingMode,
        1,
      )
    }
  }

  /**
   * Renders the legend symbol for the line series on the
   * specified rendering context.
   * @param rc The rendering context.
   * @param legendBox The bounding rectangle of the legend box.
   */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const y0 = legendBox.top * 0.2 + legendBox.bottom * 0.8
    const y1 = legendBox.top * 0.4 + legendBox.bottom * 0.6
    const y2 = legendBox.top * 0.8 + legendBox.bottom * 0.2

    const pts0 = [new ScreenPoint(legendBox.left, y0), new ScreenPoint(legendBox.right, y0)]
    const pts1 = [new ScreenPoint(legendBox.right, y2), new ScreenPoint(legendBox.left, y1)]
    const pts = [...pts0, ...pts1]

    if (this.strokeThickness > 0 && this.actualLineStyle !== LineStyle.None) {
      const dashArray = LineStyleHelper.getDashArray(this.actualLineStyle)
      await rc.drawLine(
        pts0,
        this.getSelectableColor(this.actualColor),
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
      )
      await rc.drawLine(
        pts1,
        this.getSelectableColor(this.actualColor2),
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
      )
    }
    await rc.drawPolygon(
      pts,
      this.getSelectableFillColor(this.actualFill),
      OxyColors.Undefined,
      0,
      this.edgeRenderingMode,
    )
  }

  /**
   * The update data.
   * @internal
   */
  updateData(): void {
    super.updateData()

    if (!this.itemsSource) {
      this.isPoints2Defined = this._points2.length > 0

      if (this.isPoints2Defined) {
        this._actualPoints2 = this._points2
      } else {
        this._actualPoints2 = this.getConstantPoints2()
      }

      return
    }

    this.itemsSourcePoints2.length = 0
    this.isPoints2Defined = !!(this.dataFieldX2 && this.dataFieldY2)

    if (this.isPoints2Defined) {
      for (const item of this.itemsSource) {
        if (!item) continue
        const x = getOrDefault(item, this.dataFieldX2, Number.NaN)
        const y = getOrDefault(item, this.dataFieldY2, Number.NaN)
        const point = newDataPoint(this.xAxis!.itemToDouble(x), this.yAxis!.itemToDouble(y))
        this.itemsSourcePoints2.push(point)
      }
    } else {
      this.itemsSourcePoints2.push(...this.getConstantPoints2())
    }
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()
    this.internalUpdateMaxMin(this.actualPoints2)
  }

  /**
   * Renders data points skipping NaN values.
   * @param context Area rendering context.
   * @returns The list of chunks.
   */
  protected async renderChunkedPoints(context: AreaRenderContext): Promise<ScreenPoint[][]> {
    const result: ScreenPoint[][] = []
    let screenPoints: ScreenPoint[] = []

    let clipCount = 0
    const actualPoints = context.points
    for (let i = context.windowStartIndex; i < actualPoints.length; i++) {
      const point = actualPoints[i]

      if (isNaN(point.y)) {
        if (screenPoints.length === 0) {
          continue
        }

        result.push(await this.renderScreenPoints(context, screenPoints))
        screenPoints = []
      } else {
        const sp = PlotElementExtensions.transform(this, point.x, point.y)
        screenPoints.push(sp)
      }

      // We break after two points were seen beyond xMax to ensure glitch-free rendering.
      clipCount += point.x > context.xMax ? 1 : 0
      if (clipCount > 1) {
        break
      }
    }

    if (screenPoints.length > 0) {
      result.push(await this.renderScreenPoints(context, screenPoints))
    }

    return result
  }

  /**
   * Renders a chunk of points on the screen.
   * @param context Render context.
   * @param points Screen points.
   * @returns The list of resampled points.
   */
  protected async renderScreenPoints(context: AreaRenderContext, points: ScreenPoint[]): Promise<ScreenPoint[]> {
    let final = points

    if (context.reverse) {
      final.reverse()
    }

    if (this.interpolationAlgorithm) {
      const resampled = ScreenPointHelper.resamplePoints(final, this.minimumSegmentLength)
      final = this.interpolationAlgorithm.createSplineSp(resampled, false, 0.25)
    }

    await RenderingExtensions.drawReducedLine(
      context.renderContext!,
      final,
      context.minDistSquared,
      this.getSelectableColor(context.color),
      this.strokeThickness,
      this.edgeRenderingMode,
      context.dashArray,
      this.lineJoin,
    )

    return final
  }

  /**
   * Gets the points when ConstantY2 is used.
   * @returns A sequence of DataPoint.
   */
  private getConstantPoints2(): DataPoint[] {
    const actualPoints = this.actualPoints
    const points: DataPoint[] = []
    if (!isNaN(this.constantY2) && actualPoints.length > 0) {
      // Use ConstantY2
      const x0 = actualPoints[0].x
      const x1 = actualPoints[actualPoints.length - 1].x
      points.push(newDataPoint(x0, this.constantY2))
      points.push(newDataPoint(x1, this.constantY2))
    }
    return points
  }
}

/**
 * Holds parameters for point rendering.
 */
export class AreaRenderContext {
  /**
   * Gets or sets source data points.
   */
  points: DataPoint[] = []

  /**
   * Gets or sets start index of a visible window.
   */
  windowStartIndex: number = 0

  /**
   * Gets or sets maximum visible X coordinate.
   */
  xMax: number = 0

  /**
   * Gets or sets render context.
   */
  renderContext?: IRenderContext

  /**
   * Gets or sets minimum squared distance between points.
   */
  minDistSquared: number = 0

  /**
   * Gets or sets a value indicating whether to reverse the points.
   */
  reverse: boolean = false

  /**
   * Gets or sets line color.
   */
  color: OxyColor = OxyColors.Undefined

  /**
   * Gets or sets line dash array.
   */
  dashArray?: number[] = []
}
