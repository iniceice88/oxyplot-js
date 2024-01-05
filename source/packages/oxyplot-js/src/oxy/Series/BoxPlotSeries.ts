import {
  Axis,
  type CreateXYAxisSeriesOptions,
  DataPoint_isDefined,
  DataPoint_Undefined,
  EdgeRenderingMode,
  type IRenderContext,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  MarkerType,
  newDataPoint,
  newScreenPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
  ScreenPoint,
  ScreenPointHelper,
  screenPointMinus,
  TrackerHitResult,
  type TrackerStringFormatterArgs,
  XYAxisSeries,
} from '@/oxyplot'
import { isInfinity, Number_MAX_VALUE, removeUndef } from '@/patch'

export interface CreateBoxPlotSeriesOptions extends CreateXYAxisSeriesOptions {
  boxWidth?: number
  fill?: OxyColor
  items?: BoxPlotItem[]
  lineStyle?: LineStyle
  medianPointSize?: number
  medianThickness?: number
  meanPointSize?: number
  meanThickness?: number
  outlierSize?: number
  outlierType?: MarkerType
  showBox?: boolean
  showMedianAsDot?: boolean
  showMeanAsDot?: boolean
  stroke?: OxyColor
  strokeThickness?: number
  whiskerWidth?: number
  trackerStringFormatter?: BoxPlotSeriesTrackerStringFormatterType
}

export interface BoxPlotSeriesTrackerStringFormatterArgs extends TrackerStringFormatterArgs {
  item?: BoxPlotItem
  upperWhisker?: number
  boxTop?: number
  median?: number
  boxBottom?: number
  lowerWhisker?: number
  mean?: number
}

export type BoxPlotSeriesTrackerStringFormatterType = (
  args: BoxPlotSeriesTrackerStringFormatterArgs,
) => string | undefined

export interface BoxPlotSeriesOutlierTrackerStringFormatterArgs extends TrackerStringFormatterArgs {
  item?: BoxPlotItem
  outlier?: number
}

export type BoxPlotSeriesOutlierTrackerStringFormatterType = (
  args: BoxPlotSeriesOutlierTrackerStringFormatterArgs,
) => string | undefined

/**
 * Represents a series for box plots.
 */
export class BoxPlotSeries extends XYAxisSeries {
  /**
   * The default tracker format string
   */
  public static readonly DefaultTrackerFormatString: BoxPlotSeriesTrackerStringFormatterType = (args) =>
    `${args.title || ''}
${args.xTitle}: ${args.xValue}
Upper Whisker: ${args.upperWhisker!.toFixed(2)}
Third Quartil: ${args.boxTop!.toFixed(2)}
Median: ${args.median!.toFixed(2)}
First Quartil: ${args.boxBottom!.toFixed(2)}
Lower Whisker: ${args.lowerWhisker!.toFixed(2)}
Mean: ${args.mean!.toFixed(2)}`

  /**
   * The items from the items source.
   */
  private itemsSourceItems: BoxPlotItem[] = []

  /**
   * Initializes a new instance of the BoxPlotSeries class.
   */
  constructor(opt?: CreateBoxPlotSeriesOptions) {
    super(opt)
    this.items = []
    this.trackerStringFormatter = BoxPlotSeries.DefaultTrackerFormatString

    this.outlierTrackerStringFormatter = (args) =>
      `${args.title || ''}\n${args.xTitle}: ${args.xValue}\nY: ${args.outlier!.toFixed(2)}`

    this.title = undefined
    this.fill = OxyColors.Automatic
    this.stroke = OxyColors.Black
    this.boxWidth = 0.3
    this.strokeThickness = 1
    this.medianThickness = 2
    this.meanThickness = 2
    this.outlierSize = 2
    this.outlierType = MarkerType.Circle
    this.medianPointSize = 2
    this.meanPointSize = 2
    this.whiskerWidth = 0.5
    this.lineStyle = LineStyle.Solid
    this.showMedianAsDot = false
    this.showMeanAsDot = false
    this.showBox = true

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  public trackerStringFormatter?: BoxPlotSeriesTrackerStringFormatterType = undefined

  /**
   * Gets or sets the width of the boxes (specified in x-axis units).
   */
  public boxWidth: number

  /**
   * Gets or sets the fill color. If undefined, this color will be automatically set.
   */
  public fill: OxyColor

  /**
   * Gets or sets the box plot items.
   */
  public items: BoxPlotItem[]

  /**
   * Gets or sets the line style.
   */
  public lineStyle: LineStyle

  /**
   * Gets or sets the size of the median point.
   * This property is only used when showMedianAsDot = true.
   */
  public medianPointSize: number

  /**
   * Gets or sets the median thickness, relative to the strokeThickness.
   */
  public medianThickness: number

  /**
   * Gets or sets the size of the mean point.
   * This property is only used when showMeanAsDot = true.
   */
  public meanPointSize: number

  /**
   * Gets or sets the mean thickness, relative to the strokeThickness.
   */
  public meanThickness: number

  /**
   * Gets or sets the diameter of the outlier circles (specified in points).
   */
  public outlierSize: number

  /**
   * Gets or sets the tracker format string for the outliers.
   * Use {0} for series title, {1} for x- and {2} for y-value.
   */
  public outlierTrackerStringFormatter: BoxPlotSeriesOutlierTrackerStringFormatterType

  /**
   * Gets or sets the type of the outliers.
   * MarkerType.Custom is currently not supported.
   */
  public outlierType: MarkerType

  /**
   * Gets or sets a custom polygon outline for the outlier markers. Set outlierType to MarkerType.Custom to use this property.
   */
  public outlierOutline?: ScreenPoint[]

  /**
   * Gets or sets a value indicating whether to show the boxes.
   */
  public showBox: boolean

  /**
   * Gets or sets a value indicating whether to show the median as a dot.
   */
  public showMedianAsDot: boolean

  /**
   * Gets or sets a value indicating whether to show the mean as a dot.
   */
  public showMeanAsDot: boolean

  /**
   * Gets or sets the stroke color.
   */
  public stroke: OxyColor

  /**
   * Gets or sets the stroke thickness.
   */
  public strokeThickness: number

  /**
   * Gets or sets the width of the whiskers (relative to the boxWidth).
   */
  public whiskerWidth: number

  /**
   * Gets the list of items that should be rendered.
   */
  protected get actualItems(): BoxPlotItem[] {
    return this.itemsSource ? this.itemsSourceItems : this.items
  }

  /**
   * Gets the nearest point.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (!this.xAxis || !this.yAxis) {
      return undefined
    }

    let minimumDistance = Number_MAX_VALUE
    let result: TrackerHitResult | undefined = undefined
    for (const item of this.actualItems) {
      for (const outlier of item.outliers) {
        const sp = PlotElementExtensions.transform(this, item.x, outlier)
        const d = screenPointMinus(sp, point).lengthSquared
        if (d < minimumDistance) {
          const text = this.outlierTrackerStringFormatter({
            item,
            title: this.title,
            xTitle: this.xAxis.title || XYAxisSeries.defaultXAxisTitle,
            xValue: this.xAxis.getValue(item.x),
            outlier,
          })

          result = new TrackerHitResult({
            series: this,
            dataPoint: newDataPoint(item.x, outlier),
            position: sp,
            item,
            text,
          })
          minimumDistance = d
        }
      }

      let hitPoint = DataPoint_Undefined

      // check if we are inside the box rectangle
      const rect = this.getBoxRect(item)
      if (rect.containsPoint(point)) {
        const dp = this.inverseTransform(point)
        hitPoint = newDataPoint(item.x, dp.y)
        minimumDistance = 0
      }

      const topWhisker = PlotElementExtensions.transform(this, item.x, item.upperWhisker)
      const bottomWhisker = PlotElementExtensions.transform(this, item.x, item.lowerWhisker)

      // check if we are near the line
      const p = ScreenPointHelper.findPointOnLine(point, topWhisker, bottomWhisker)
      const d2 = screenPointMinus(p, point).lengthSquared
      if (d2 < minimumDistance) {
        hitPoint = this.inverseTransform(p)
        minimumDistance = d2
      }

      if (DataPoint_isDefined(hitPoint)) {
        const text = this.trackerStringFormatter!({
          item,
          title: this.title,
          xTitle: this.xAxis.title || XYAxisSeries.defaultXAxisTitle,
          xValue: this.xAxis.getValue(item.x),
          upperWhisker: this.yAxis.getValue(item.upperWhisker),
          boxTop: this.yAxis.getValue(item.boxTop),
          median: this.yAxis.getValue(item.median),
          boxBottom: this.yAxis.getValue(item.boxBottom),
          lowerWhisker: this.yAxis.getValue(item.lowerWhisker),
          mean: this.yAxis.getValue(item.mean !== undefined ? item.mean : NaN),
        })
        result = new TrackerHitResult({
          series: this,
          dataPoint: hitPoint,
          position: this.transform(hitPoint),
          item,
          text,
        })
      }
    }

    if (minimumDistance < Number_MAX_VALUE) {
      return result
    }

    return undefined
  }

  /**
   * Determines whether the specified item contains a valid point.
   */
  public isValidPointBoxPlot(item: BoxPlotItem, xaxis: Axis, yaxis: Axis): boolean {
    const values = getBoxPlotItemValues(item)
    return (
      !isNaN(item.x) &&
      !isInfinity(item.x) &&
      !values.some(isNaN) &&
      !values.some(isInfinity) &&
      xaxis &&
      xaxis.isValidValue(item.x) &&
      yaxis &&
      values.every((x) => yaxis.isValidValue(x))
    )
  }

  /**
   * Renders the series on the specified render context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (this.actualItems.length === 0) {
      return
    }

    const clippingRect = this.getClippingRect()

    const outlierScreenPoints: ScreenPoint[] = []
    const halfBoxWidth = this.boxWidth * 0.5
    const halfWhiskerWidth = halfBoxWidth * this.whiskerWidth
    const strokeColor = this.getSelectableColor(this.stroke)
    const fillColor = this.getSelectableFillColor(this.fill)
    const dashArray = LineStyleHelper.getDashArray(this.lineStyle)
    const transform = PlotElementExtensions.transform
    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )
    for (const item of this.actualItems) {
      const mean = item.mean !== undefined ? item.mean : NaN
      // Add the outlier points
      outlierScreenPoints.push(...item.outliers.map((outlier) => transform(this, item.x, outlier)))

      const topWhiskerTop = transform(this, item.x, item.upperWhisker)
      const topWhiskerBottom = transform(this, item.x, item.boxTop)
      const bottomWhiskerTop = transform(this, item.x, item.boxBottom)
      const bottomWhiskerBottom = transform(this, item.x, item.lowerWhisker)

      if (this.strokeThickness > 0 && this.lineStyle !== LineStyle.None) {
        await rc.drawLine(
          [topWhiskerTop, topWhiskerBottom],
          strokeColor,
          this.strokeThickness,
          actualEdgeRenderingMode,
          dashArray,
          LineJoin.Miter,
        )
        await rc.drawLine(
          [bottomWhiskerTop, bottomWhiskerBottom],
          strokeColor,
          this.strokeThickness,
          actualEdgeRenderingMode,
          dashArray,
          LineJoin.Miter,
        )
      }

      // Draw the whiskers
      if (this.whiskerWidth > 0) {
        const topWhiskerLine1 = transform(this, item.x - halfWhiskerWidth, item.upperWhisker)
        const topWhiskerLine2 = transform(this, item.x + halfWhiskerWidth, item.upperWhisker)
        const bottomWhiskerLine1 = transform(this, item.x - halfWhiskerWidth, item.lowerWhisker)
        const bottomWhiskerLine2 = transform(this, item.x + halfWhiskerWidth, item.lowerWhisker)

        await rc.drawLine(
          [topWhiskerLine1, topWhiskerLine2],
          strokeColor,
          this.strokeThickness,
          actualEdgeRenderingMode,
          undefined,
          LineJoin.Miter,
        )
        await rc.drawLine(
          [bottomWhiskerLine1, bottomWhiskerLine2],
          strokeColor,
          this.strokeThickness,
          actualEdgeRenderingMode,
          undefined,
          LineJoin.Miter,
        )
      }

      if (this.showBox) {
        // Draw the box
        const rect = this.getBoxRect(item)
        await rc.drawRectangle(rect, fillColor, strokeColor, this.strokeThickness, actualEdgeRenderingMode)
      }

      if (!this.showMedianAsDot) {
        // Draw the median line
        const medianLeft = transform(this, item.x - halfBoxWidth, item.median)
        const medianRight = transform(this, item.x + halfBoxWidth, item.median)
        await rc.drawLine(
          [medianLeft, medianRight],
          strokeColor,
          this.strokeThickness * this.medianThickness,
          actualEdgeRenderingMode,
          undefined,
          LineJoin.Miter,
        )
      } else {
        const mc = transform(this, item.x, item.median)
        if (clippingRect.containsPoint(mc)) {
          const ellipseRect = new OxyRect(
            mc.x - this.medianPointSize,
            mc.y - this.medianPointSize,
            this.medianPointSize * 2,
            this.medianPointSize * 2,
          )
          await rc.drawEllipse(ellipseRect, fillColor, OxyColors.Undefined, 0, this.edgeRenderingMode)
        }
      }

      if (!this.showMeanAsDot && !isNaN(mean)) {
        // Draw the median line
        const meanLeft = transform(this, item.x - halfBoxWidth, mean)
        const meanRight = transform(this, item.x + halfBoxWidth, mean)
        await rc.drawLine(
          [meanLeft, meanRight],
          strokeColor,
          this.strokeThickness * this.meanThickness,
          actualEdgeRenderingMode,
          LineStyleHelper.getDashArray(LineStyle.Dash),
          LineJoin.Miter,
        )
      } else if (!isNaN(mean)) {
        const mc = transform(this, item.x, mean)
        if (clippingRect.containsPoint(mc)) {
          const ellipseRect = new OxyRect(
            mc.x - this.meanPointSize,
            mc.y - this.meanPointSize,
            this.meanPointSize * 2,
            this.meanPointSize * 2,
          )
          await rc.drawEllipse(ellipseRect, fillColor, OxyColors.Undefined, 0, this.edgeRenderingMode)
        }
      }
    }

    if (this.outlierType !== MarkerType.None) {
      // Draw the outlier(s)
      const markerSizes = outlierScreenPoints.map((o) => this.outlierSize)
      await RenderingExtensions.drawMarkers(
        rc,
        outlierScreenPoints,
        this.outlierType,
        this.outlierOutline,
        markerSizes,
        fillColor,
        strokeColor,
        this.strokeThickness,
        this.edgeRenderingMode,
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
    const ybottom = legendBox.top + (legendBox.bottom - legendBox.top) * 0.7
    const ytop = legendBox.top + (legendBox.bottom - legendBox.top) * 0.3
    const ymid = (ybottom + ytop) * 0.5

    const halfBoxWidth = legendBox.width * 0.24
    const halfWhiskerWidth = halfBoxWidth * this.whiskerWidth
    const LegendStrokeThickness = 1
    const strokeColor = this.getSelectableColor(this.stroke)
    const fillColor = this.getSelectableFillColor(this.fill)
    const solidDashArray = LineStyleHelper.getDashArray(LineStyle.Solid)
    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferGeometricAccuracy,
    )

    await rc.drawLine(
      [newScreenPoint(xmid, legendBox.top), newScreenPoint(xmid, ytop)],
      strokeColor,
      LegendStrokeThickness,
      actualEdgeRenderingMode,
      solidDashArray,
      LineJoin.Miter,
    )

    await rc.drawLine(
      [newScreenPoint(xmid, ybottom), newScreenPoint(xmid, legendBox.bottom)],
      strokeColor,
      LegendStrokeThickness,
      actualEdgeRenderingMode,
      solidDashArray,
      LineJoin.Miter,
    )

    if (this.whiskerWidth > 0) {
      await rc.drawLine(
        [
          newScreenPoint(xmid - halfWhiskerWidth, legendBox.bottom),
          newScreenPoint(xmid + halfWhiskerWidth, legendBox.bottom),
        ],
        strokeColor,
        LegendStrokeThickness,
        actualEdgeRenderingMode,
        solidDashArray,
        LineJoin.Miter,
      )

      await rc.drawLine(
        [
          newScreenPoint(xmid - halfWhiskerWidth, legendBox.top),
          newScreenPoint(xmid + halfWhiskerWidth, legendBox.top),
        ],
        strokeColor,
        LegendStrokeThickness,
        actualEdgeRenderingMode,
        solidDashArray,
        LineJoin.Miter,
      )
    }

    if (this.showBox) {
      await rc.drawRectangle(
        new OxyRect(xmid - halfBoxWidth, ytop, 2 * halfBoxWidth, ybottom - ytop),
        fillColor,
        strokeColor,
        LegendStrokeThickness,
        actualEdgeRenderingMode,
      )
    }

    if (!this.showMedianAsDot) {
      await rc.drawLine(
        [newScreenPoint(xmid - halfBoxWidth, ymid), newScreenPoint(xmid + halfBoxWidth, ymid)],
        strokeColor,
        LegendStrokeThickness * this.medianThickness,
        actualEdgeRenderingMode,
        solidDashArray,
        LineJoin.Miter,
      )
    } else {
      const ellipseRect = new OxyRect(
        xmid - this.medianPointSize,
        ymid - this.medianPointSize,
        this.medianPointSize * 2,
        this.medianPointSize * 2,
      )
      await rc.drawEllipse(ellipseRect, fillColor, OxyColors.Undefined, 0, actualEdgeRenderingMode)
    }
  }

  /**
   * Updates the data.
   * @internal
   */
  updateData(): void {
    if (!this.itemsSource) {
      return
    }

    this.clearItemsSourceItems()
    this.itemsSourceItems.push(...this.itemsSource)
    this.itemsSourceItems.forEach((x) => {
      if (x.mean === undefined) x.median = NaN
    })
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()
    this.internalUpdateBoxPlotMaxMin(this.actualItems)
  }

  /**
   * Updates the max and min of the series.
   * @param items The items.
   */
  protected internalUpdateBoxPlotMaxMin(items: BoxPlotItem[]): void {
    if (!items || items.length === 0) {
      return
    }

    let minx = this.minX
    let miny = this.minY
    let maxx = this.maxX
    let maxy = this.maxY

    for (const pt of items) {
      if (!this.isValidPointBoxPlot(pt, this.xAxis!, this.yAxis!)) {
        continue
      }

      const x = pt.x
      if (x < minx || isNaN(minx)) {
        minx = x
      }

      if (x > maxx || isNaN(maxx)) {
        maxx = x
      }

      const values = getBoxPlotItemValues(pt)
      for (const y of values) {
        if (y < miny || isNaN(miny)) {
          miny = y
        }

        if (y > maxy || isNaN(maxy)) {
          maxy = y
        }
      }
    }

    this.minX = minx
    this.minY = miny
    this.maxX = maxx
    this.maxY = maxy
  }

  /**
   * Gets the item at the specified index.
   * @param i The index of the item.
   * @returns The item of the index.
   */
  protected getItem(i: number): any {
    if (this.itemsSource || !this.actualItems || this.actualItems.length === 0) {
      return super.getItem(i)
    }

    return this.actualItems[i]
  }

  /**
   * Gets the screen rectangle for the box.
   * @param item The box item.
   * @returns A rectangle.
   */
  private getBoxRect(item: BoxPlotItem): OxyRect {
    const halfBoxWidth = this.boxWidth * 0.5

    const p1 = PlotElementExtensions.transform(this, item.x - halfBoxWidth, item.boxTop)
    const p2 = PlotElementExtensions.transform(this, item.x + halfBoxWidth, item.boxBottom)

    return OxyRect.fromScreenPoints(p1, p2)
  }

  /**
   * Clears or creates the itemsSourceItems list.
   */
  private clearItemsSourceItems(): void {
    this.itemsSourceItems.length = 0
  }
}

function getBoxPlotItemValues(item: BoxPlotItem): number[] {
  const values = [item.lowerWhisker, item.boxBottom, item.median, item.boxTop, item.upperWhisker]

  // As mean is an optional value and should not be checked for validation if not set don't add it if NaN
  if (item.mean !== undefined && !isNaN(item.mean)) {
    values.push(item.mean)
  }

  values.push(...item.outliers)

  return values
}

/**
 * Represents an item in a BoxPlotSeries.
 */
export interface BoxPlotItem {
  /**
   * Gets or sets the box bottom value (usually the 25th percentile, Q1).
   */
  boxBottom: number

  /**
   * Gets or sets the box top value (usually the 75th percentile, Q3)).
   */
  boxTop: number

  /**
   * Gets or sets the lower whisker value.
   */
  lowerWhisker: number

  /**
   * Gets or sets the median.
   */
  median: number

  /**
   * Gets or sets the mean.
   */
  mean?: number

  /**
   * Gets or sets the outliers.
   */
  outliers: number[]

  /**
   * Gets or sets the tag.
   */
  tag?: any

  /**
   * Gets or sets the upper whisker value.
   */
  upperWhisker: number

  /**
   * Gets or sets the X value.
   */
  x: number
}
