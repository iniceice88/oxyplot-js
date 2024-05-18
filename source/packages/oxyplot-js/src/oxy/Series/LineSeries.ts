import {
  type CreateDataPointSeriesOptions,
  type DataPoint,
  DataPointSeries,
  ExtendedDefaultDataPointSeriesOptions,
  HorizontalAlignment,
  type IInterpolationAlgorithm,
  type IRenderContext,
  type LabelStringFormatterType,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  MarkerType,
  newDataPoint,
  newScreenPoint,
  newScreenVector,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRectHelper,
  PlotElementExtensions,
  type PlotModelSerializeOptions,
  RenderingExtensions,
  type ScreenPoint,
  ScreenPoint_LeftTop,
  ScreenPointHelper,
  screenPointPlus,
  TrackerHitResult,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'

import { assignMethod, assignObject, maxValueOfArray, minValueOfArray, Number_MAX_VALUE } from '@/patch'

/**
 * Specifies the position of legends rendered on a LineSeries.
 */
export enum LineLegendPosition {
  /**
   * Do not render legend on the line.
   */
  None = 0,

  /**
   * Render legend at the start of the line.
   */
  Start = 1,

  /**
   * Render legend at the end of the line.
   */
  End = 2,
}

export interface CreateLineSeriesOptions extends CreateDataPointSeriesOptions {
  color?: OxyColor
  brokenLineColor?: OxyColor
  brokenLineStyle?: LineStyle
  brokenLineThickness?: number
  dashes?: number[]
  decimator?: (points: ScreenPoint[], result: ScreenPoint[]) => void
  labelStringFormatter?: LabelStringFormatterType
  labelMargin?: number
  lineJoin?: LineJoin
  lineStyle?: LineStyle
  lineLegendPosition?: LineLegendPosition
  markerFill?: OxyColor
  markerOutline?: ScreenPoint[]
  markerResolution?: number
  markerSize?: number
  markerStroke?: OxyColor
  markerStrokeThickness?: number
  markerType?: MarkerType
  minimumSegmentLength?: number
  interpolationAlgorithm?: IInterpolationAlgorithm
  strokeThickness?: number
}

export const DefaultLineSeriesOptions: CreateLineSeriesOptions = {
  color: OxyColors.Automatic,
  brokenLineColor: OxyColors.Undefined,
  brokenLineStyle: LineStyle.Solid,
  brokenLineThickness: 0,
  labelMargin: 6,
  lineJoin: LineJoin.Bevel,
  lineStyle: LineStyle.Automatic,
  lineLegendPosition: LineLegendPosition.None,
  markerFill: OxyColors.Automatic,
  markerResolution: 0,
  markerSize: 3,
  markerStroke: OxyColors.Automatic,
  markerStrokeThickness: 1,
  markerType: MarkerType.None,
  minimumSegmentLength: 2,
  strokeThickness: 2,

  canTrackerInterpolatePoints: true,

  dashes: undefined,
  decimator: undefined,
  labelStringFormatter: undefined,
  markerOutline: undefined,
  interpolationAlgorithm: undefined,
} as const

export const ExtendedDefaultLineSeriesOptions = {
  ...ExtendedDefaultDataPointSeriesOptions,
  ...DefaultLineSeriesOptions,
}

/**
 * Represents a line series.
 */
export class LineSeries extends DataPointSeries {
  /**
   * The divisor value used to calculate tolerance for line smoothing.
   */
  private static readonly ToleranceDivisor = 200

  /**
   * The output buffer.
   */
  private _outputBuffer?: ScreenPoint[]

  /**
   * The buffer for contiguous screen points.
   */
  private _contiguousScreenPointsBuffer?: ScreenPoint[]

  /**
   * The buffer for decimated points.
   */
  private _decimatorBuffer: ScreenPoint[] = []

  /**
   * The default color.
   */
  private _defaultColor: OxyColor = OxyColors.Undefined

  /**
   * The default marker fill color.
   */
  private _defaultMarkerFill: OxyColor = OxyColors.Undefined

  /**
   * The default line style.
   */
  private _defaultLineStyle: LineStyle = LineStyle.Solid

  /**
   * The smoothed points.
   */
  private _smoothedPoints: DataPoint[] = []

  /**
   * Initializes a new instance of the LineSeries class.
   */
  constructor(opt?: CreateLineSeriesOptions) {
    super(opt)

    assignMethod(this, 'labelStringFormatter', opt)
    assignObject(this, DefaultLineSeriesOptions, opt, { exclude: ['labelStringFormatter'] })
  }

  getElementName() {
    return 'LineSeries'
  }

  /**
   * Gets or sets the color of the curve.
   */
  public color: OxyColor = DefaultLineSeriesOptions.color!

  /**
   * Gets or sets the color of the broken line segments. The default is OxyColors.Undefined. Set it to OxyColors.Automatic if it should follow the Color.
   */
  public brokenLineColor: OxyColor = DefaultLineSeriesOptions.brokenLineColor!

  /**
   * Gets or sets the broken line style. The default is LineStyle.Solid.
   */
  public brokenLineStyle: LineStyle = DefaultLineSeriesOptions.brokenLineStyle!

  /**
   * Gets or sets the broken line thickness. The default is 0 (no line).
   */
  public brokenLineThickness: number = DefaultLineSeriesOptions.brokenLineThickness!

  /**
   * Gets or sets the dash array for the rendered line (overrides LineStyle). The default is null.
   */
  public dashes?: number[]

  /**
   * Gets or sets the decimator.
   */
  public decimator?: (points: ScreenPoint[], result: ScreenPoint[]) => void

  /**
   * Gets or sets the label formatter. The default is null (no labels).
   */
  public labelStringFormatter?: LabelStringFormatterType

  /**
   * Gets or sets the label margins. The default is 6.
   */
  public labelMargin: number = DefaultLineSeriesOptions.labelMargin!

  /**
   * Gets or sets the line join. The default is LineJoin.Bevel.
   */
  public lineJoin: LineJoin = DefaultLineSeriesOptions.lineJoin!

  /**
   * Gets or sets the line style. The default is LineStyle.Automatic.
   */
  public lineStyle: LineStyle = DefaultLineSeriesOptions.lineStyle!

  /**
   * Gets or sets a value specifying the position of a legend rendered on the line. The default is LineLegendPosition.None.
   */
  public lineLegendPosition: LineLegendPosition = DefaultLineSeriesOptions.lineLegendPosition!

  /**
   * Gets or sets the marker fill color. The default is OxyColors.Automatic.
   */
  public markerFill: OxyColor = DefaultLineSeriesOptions.markerFill!

  /**
   * Gets or sets the custom polygon outline for the markers. Set MarkerType to MarkerType.Custom to use this property. The default is null.
   */
  public markerOutline?: ScreenPoint[]

  /**
   * Gets or sets the marker resolution. The default is 0.
   */
  public markerResolution: number = DefaultLineSeriesOptions.markerResolution!

  /**
   * Gets or sets the size of the marker. The default is 3.
   */
  public markerSize: number = DefaultLineSeriesOptions.markerSize!

  /**
   * Gets or sets the marker stroke. The default is OxyColors.Automatic.
   */
  public markerStroke: OxyColor = DefaultLineSeriesOptions.markerStroke!

  /**
   * Gets or sets the marker stroke thickness. The default is 2.
   */
  public markerStrokeThickness: number = DefaultLineSeriesOptions.markerStrokeThickness!

  /**
   * Gets or sets the type of the marker. The default is MarkerType.None.
   */
  public markerType: MarkerType = DefaultLineSeriesOptions.markerType!

  /**
   * Gets or sets the minimum length of the segment.
   * Increasing this number will increase performance,
   * but make the curve less accurate. The default is 2.
   */
  public minimumSegmentLength: number = DefaultLineSeriesOptions.minimumSegmentLength!

  /**
   * Gets or sets a type of interpolation algorithm used for smoothing this DataPointSeries.
   */
  public interpolationAlgorithm?: IInterpolationAlgorithm

  /**
   * Gets or sets the thickness of the curve.
   */
  public strokeThickness: number = DefaultLineSeriesOptions.strokeThickness!

  /**
   * Gets the actual color.
   */
  public get actualColor(): OxyColor {
    return OxyColorHelper.getActualColor(this.color, this._defaultColor)
  }

  /**
   * Gets the actual marker fill color.
   */
  public get actualMarkerFill(): OxyColor {
    return OxyColorHelper.getActualColor(this.markerFill, this._defaultMarkerFill)
  }

  /**
   * Gets the actual line style.
   */
  protected get actualLineStyle(): LineStyle {
    return this.lineStyle != LineStyle.Automatic ? this.lineStyle : this._defaultLineStyle
  }

  /**
   * Gets the actual dash array for the line.
   */
  protected get actualDashArray(): number[] | undefined {
    return this.dashes ?? LineStyleHelper.getDashArray(this.actualLineStyle)
  }

  /**
   * Gets the smoothed points.
   */
  protected get smoothedPoints(): DataPoint[] {
    return this._smoothedPoints
  }

  /**
   * Gets the point on the series that is nearest the specified point.
   * @param point The point.
   * @param interpolate Interpolate the series if this flag is set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (interpolate) {
      // Cannot interpolate if there is no line
      if (OxyColorHelper.isInvisible(this.actualColor) || this.strokeThickness === 0) {
        return undefined
      }

      if (!this.canTrackerInterpolatePoints) {
        return undefined
      }
    }

    const trackerStringFormatter = this.trackerStringFormatter

    if (interpolate && this.interpolationAlgorithm) {
      const result = this.getNearestInterpolatedPointInternal(this.smoothedPoints, 0, point)
      if (result && trackerStringFormatter) {
        result.text = trackerStringFormatter({
          item: result.item,
          title: this.title,
          xTitle: this.xAxis!.title ?? XYAxisSeries.defaultXAxisTitle,
          xValue: this.xAxis!.getValue(result.dataPoint!.x),
          yTitle: this.yAxis!.title ?? XYAxisSeries.defaultYAxisTitle,
          yValue: this.yAxis!.getValue(result.dataPoint!.y),
        })
      }
      return result
    }

    return super.getNearestPoint(point, interpolate)
  }

  /**
   * Renders the series on the specified rendering context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    const actualPoints = this.actualPoints
    if (!actualPoints || actualPoints.length === 0) {
      return
    }

    this.verifyAxes()

    await this.renderPoints(rc, actualPoints)

    if (this.labelStringFormatter) {
      // render point labels (not optimized for performance)
      await this.renderPointLabels(rc)
    }

    if (this.lineLegendPosition !== LineLegendPosition.None && this.title) {
      // renders a legend on the line
      await this.renderLegendOnLine(rc)
    }
  }

  /**
   * Renders the legend symbol for the line series on the
   * specified rendering context.
   * @param rc The rendering context.
   * @param legendBox The bounding rectangle of the legend box.
   */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const right = OxyRectHelper.right(legendBox)
    const bottom = OxyRectHelper.bottom(legendBox)
    const xmid = (legendBox.left + right) / 2
    const ymid = (legendBox.top + bottom) / 2
    const pts = [newScreenPoint(legendBox.left, ymid), newScreenPoint(right, ymid)]
    await rc.drawLine(
      pts,
      this.getSelectableColor(this.actualColor),
      this.strokeThickness,
      this.edgeRenderingMode,
      this.actualDashArray,
    )

    const midpt = newScreenPoint(xmid, ymid)
    await RenderingExtensions.drawMarker(
      rc,
      midpt,
      this.markerType,
      this.markerOutline,
      this.markerSize,
      this.actualMarkerFill,
      this.markerStroke,
      this.markerStrokeThickness,
      this.edgeRenderingMode,
    )
  }

  /**
   * Sets default values from the plot model.
   * @internal
   */
  setDefaultValues(): void {
    if (this.lineStyle === LineStyle.Automatic) {
      this._defaultLineStyle = this.plotModel.getDefaultLineStyle()
    }

    if (OxyColorHelper.isAutomatic(this.color)) {
      this._defaultColor = this.plotModel.getDefaultColor()
    }

    if (OxyColorHelper.isAutomatic(this.markerFill)) {
      // No color was explicitly provided. Use the line color if it was set, else use default.
      this._defaultMarkerFill = OxyColorHelper.isAutomatic(this.color) ? this._defaultColor : this.color
    }
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    if (this.interpolationAlgorithm) {
      // Update the max/min from the control points
      super.updateMaxMin()

      // Make sure the smooth points are re-evaluated.
      this.resetSmoothedPoints()

      if (this.smoothedPoints.every((x) => isNaN(x.x))) {
        return
      }

      const smoothedXs = this.smoothedPoints.filter((x) => !isNaN(x.x)).map((x) => x.x)
      const smoothedYs = this.smoothedPoints.filter((x) => !isNaN(x.y)).map((x) => x.y)

      // Update the max/min from the smoothed points
      this.minX = minValueOfArray(smoothedXs)
      this.minY = minValueOfArray(smoothedYs)
      this.maxX = maxValueOfArray(smoothedXs)
      this.maxY = maxValueOfArray(smoothedYs)
    } else {
      super.updateMaxMin()
    }
  }

  /**
   * Renders the points as line, broken line and markers.
   * @param rc The rendering context.
   * @param points The points to render.
   */
  protected async renderPoints(rc: IRenderContext, points: DataPoint[]): Promise<void> {
    let lastValidPoint: ScreenPoint | undefined = undefined
    const areBrokenLinesRendered = this.brokenLineThickness > 0 && this.brokenLineStyle !== LineStyle.None
    const dashArray = areBrokenLinesRendered ? LineStyleHelper.getDashArray(this.brokenLineStyle) : undefined
    const broken = areBrokenLinesRendered ? [] : undefined

    if (!this._contiguousScreenPointsBuffer) {
      this._contiguousScreenPointsBuffer = []
    }

    let startIdx = 0
    let xmax = Number_MAX_VALUE

    if (this.isXMonotonic) {
      // determine render range
      const xmin = this.xAxis!.clipMinimum
      xmax = this.xAxis!.clipMaximum
      this.windowStartIndex = this.updateWindowStartIndex(points, (point) => point.x, xmin, this.windowStartIndex)

      startIdx = this.windowStartIndex
    }

    for (let i = startIdx; i < points.length; i++) {
      const { result, pointIdx, previousContiguousLineSegmentEndPoint } = this.extractNextContiguousLineSegment(
        points,
        i,
        lastValidPoint,
        xmax,
        broken!,
        this._contiguousScreenPointsBuffer,
      )
      i = pointIdx
      lastValidPoint = previousContiguousLineSegmentEndPoint
      if (!result) {
        break
      }

      if (areBrokenLinesRendered) {
        if (broken && broken.length > 0) {
          const actualBrokenLineColor = OxyColorHelper.isAutomatic(this.brokenLineColor)
            ? this.actualColor
            : this.brokenLineColor

          await rc.drawLineSegments(
            broken,
            actualBrokenLineColor,
            this.brokenLineThickness,
            this.edgeRenderingMode,
            dashArray,
            this.lineJoin,
          )
          broken.length = 0
        }
      } else {
        lastValidPoint = undefined
      }

      if (this.decimator) {
        if (!this._decimatorBuffer) {
          this._decimatorBuffer = []
        } else {
          this._decimatorBuffer.length = 0
        }

        this.decimator(this._contiguousScreenPointsBuffer, this._decimatorBuffer)
        await this.renderLineAndMarkers(rc, this._decimatorBuffer)
      } else {
        await this.renderLineAndMarkers(rc, this._contiguousScreenPointsBuffer)
      }

      this._contiguousScreenPointsBuffer.length = 0
    }
  }

  /**
   * Extracts a single contiguous line segment beginning with the element at the position of the enumerator when the method
   * is called. Initial invalid data points are ignored.
   * @param points Points collection
   * @param pointIdx Current point index
   * @param previousContiguousLineSegmentEndPoint Initially set to null, but I will update I won't give a broken line if this is null
   * @param xmax Maximum visible X value
   * @param broken place to put broken segment
   * @param contiguous place to put contiguous segment
   * @returns true if line segments are extracted, false if reached end.
   */
  protected extractNextContiguousLineSegment(
    points: DataPoint[],
    pointIdx: number,
    previousContiguousLineSegmentEndPoint: ScreenPoint | undefined,
    xmax: number,
    broken: ScreenPoint[],
    contiguous: ScreenPoint[],
  ) {
    let currentPoint = newDataPoint(0, 0)
    let hasValidPoint = false

    // Skip all undefined points
    for (; pointIdx < points.length; pointIdx++) {
      currentPoint = points[pointIdx]
      if (currentPoint.x > xmax) {
        return {
          result: false,
          pointIdx,
          previousContiguousLineSegmentEndPoint,
        }
      }

      hasValidPoint = this.isValidPoint(currentPoint)
      if (hasValidPoint) {
        break
      }
    }

    if (!hasValidPoint) {
      return {
        result: false,
        pointIdx,
        previousContiguousLineSegmentEndPoint,
      }
    }

    // First valid point
    let screenPoint = this.transform(currentPoint)

    // Handle broken line segment if exists
    if (previousContiguousLineSegmentEndPoint) {
      broken.push(previousContiguousLineSegmentEndPoint)
      broken.push(screenPoint)
    }

    // Add first point
    contiguous.push(screenPoint)

    // Add all points up until the next invalid one
    let clipCount = 0
    for (pointIdx++; pointIdx < points.length; pointIdx++) {
      currentPoint = points[pointIdx]
      clipCount += currentPoint.x > xmax ? 1 : 0
      if (clipCount > 1) {
        break
      }
      if (!this.isValidPoint(currentPoint)) {
        break
      }

      screenPoint = this.transform(currentPoint)
      contiguous.push(screenPoint)
    }

    previousContiguousLineSegmentEndPoint = screenPoint

    return {
      result: true,
      pointIdx,
      previousContiguousLineSegmentEndPoint,
    }
  }

  /**
   * Renders the point labels.
   * @param rc The render context.
   */
  protected async renderPointLabels(rc: IRenderContext): Promise<void> {
    if (!this.labelStringFormatter) return

    let index = -1
    for (const point of this.actualPoints) {
      index++

      if (!this.isValidPoint(point)) {
        continue
      }

      const pt = screenPointPlus(this.transform(point), newScreenVector(0, -this.labelMargin))

      const item = this.getItem(index)
      const s = this.labelStringFormatter(item, [point.x, point.y])

      await rc.drawText(
        pt,
        s,
        this.actualTextColor,
        this.actualFont,
        this.actualFontSize,
        this.actualFontWeight,
        0,
        HorizontalAlignment.Center,
        VerticalAlignment.Bottom,
      )
    }
  }

  /**
   * Renders a legend on the line.
   * @param rc The render context.
   */
  protected async renderLegendOnLine(rc: IRenderContext): Promise<void> {
    if (!this.title) return

    // Find the position
    let point: DataPoint
    let ha: HorizontalAlignment
    let va = VerticalAlignment.Middle
    let dx = 4

    switch (this.lineLegendPosition) {
      case LineLegendPosition.Start:
        point = this.actualPoints[0]
        ha = HorizontalAlignment.Right
        dx = -dx
        break
      case LineLegendPosition.End:
        point = this.actualPoints[this.actualPoints.length - 1]
        ha = HorizontalAlignment.Left
        break
      case LineLegendPosition.None:
        return
      default:
        throw new Error('Invalid LineLegendPosition')
    }

    const res = PlotElementExtensions.orientateAlignment(this, ha, va)
    ha = res[0]
    va = res[1]
    const ver = PlotElementExtensions.orientateVector(this, newScreenVector(dx, 0))
    const pt = screenPointPlus(this.transform(point), ver)

    // Render the legend
    await rc.drawText(
      pt,
      this.title,
      this.actualTextColor,
      this.actualFont,
      this.actualFontSize,
      this.actualFontWeight,
      0,
      ha,
      va,
    )
  }

  /**
   * Renders the transformed points as a line (smoothed if interpolationAlgorithm isn’t null) and markers (if markerType is not None).
   * @param rc The render context.
   * @param pointsToRender The points to render.
   */
  protected async renderLineAndMarkers(rc: IRenderContext, pointsToRender: ScreenPoint[]): Promise<void> {
    let screenPoints = pointsToRender
    if (this.interpolationAlgorithm) {
      // spline smoothing (should only be used on small datasets)
      const resampledPoints = ScreenPointHelper.resamplePoints(pointsToRender, this.minimumSegmentLength)
      screenPoints = this.interpolationAlgorithm.createSplineSp(resampledPoints, false, 0.25)
    }

    // clip the line segments with the clipping rectangle
    if (this.strokeThickness > 0 && this.actualLineStyle !== LineStyle.None) {
      await this.renderLine(rc, screenPoints)
    }

    if (this.markerType !== MarkerType.None) {
      const markerBinOffset =
        this.markerResolution > 0 ? PlotElementExtensions.transform(this, this.minX, this.minY) : ScreenPoint_LeftTop

      await RenderingExtensions.drawMarkers(
        rc,
        pointsToRender,
        this.markerType,
        this.markerOutline,
        [this.markerSize],
        this.actualMarkerFill,
        this.markerStroke,
        this.markerStrokeThickness,
        this.edgeRenderingMode,
        this.markerResolution,
        markerBinOffset,
      )
    }
  }

  /**
   * Renders a continuous line.
   * @param rc The render context.
   * @param pointsToRender The points to render.
   */
  protected async renderLine(rc: IRenderContext, pointsToRender: ScreenPoint[]): Promise<void> {
    const dashArray = this.actualDashArray

    if (!this._outputBuffer) {
      this._outputBuffer = []
    }

    await RenderingExtensions.drawReducedLine(
      rc,
      pointsToRender,
      this.minimumSegmentLength * this.minimumSegmentLength,
      this.getSelectableColor(this.actualColor),
      this.strokeThickness,
      this.edgeRenderingMode,
      dashArray,
      this.lineJoin,
      this._outputBuffer,
    )
  }

  /**
   * Force the smoothed points to be re-evaluated.
   */
  protected resetSmoothedPoints(): void {
    const tolerance = Math.abs(Math.max(this.maxX - this.minX, this.maxY - this.minY) / LineSeries.ToleranceDivisor)
    this._smoothedPoints = this.interpolationAlgorithm!.createSplineDp(this.actualPoints, false, tolerance)
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultLineSeriesOptions
  }

  toJSON(opt?: PlotModelSerializeOptions) {
    const json = super.toJSON(opt)
    if (this.points?.length) {
      json.points = this.points
    }
    return json
  }
}
