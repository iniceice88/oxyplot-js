import { Axis, CreateXYAxisSeriesOptions, IRenderContext, newDataPoint, TrackerStringFormatterArgs } from '@/oxyplot'
import {
  DataPoint,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  ScreenPoint,
  ScreenVector,
  TrackerHitResult,
  XYAxisSeries,
} from '@/oxyplot'
import { getOrDefault, Number_MAX_VALUE, removeUndef, round } from '@/patch'

export interface HighLowItem {
  /**
   * The close value.
   */
  close: number

  /**
   * The high value.
   */
  high: number

  /**
   * The low value.
   */
  low: number

  /**
   * The open value.
   */
  open: number

  /**
   * The X value (time).
   */
  x: number
}

export function createHighLowItem(
  x: number,
  high: number,
  low: number,
  open: number = NaN,
  close: number = NaN,
): HighLowItem {
  return {
    x,
    high,
    low,
    open,
    close,
  }
}

export interface HighLowSeriesTrackerStringFormatterArgs extends TrackerStringFormatterArgs {
  readonly item?: HighLowItem
  readonly close?: number
  readonly high?: number
  readonly low?: number
  readonly open?: number
}

export type HighLowSeriesTrackerStringFormatterType = (
  args: HighLowSeriesTrackerStringFormatterArgs,
) => string | undefined

export interface CreateHighLowSeriesOptions extends CreateXYAxisSeriesOptions {
  color?: OxyColor
  dataFieldClose?: string
  dataFieldHigh?: string
  dataFieldLow?: string
  dataFieldOpen?: string
  dataFieldX?: string
  lineJoin?: LineJoin
  lineStyle?: LineStyle
  strokeThickness?: number
  tickLength?: number
  trackerStringFormatter?: HighLowSeriesTrackerStringFormatterType
}

/**
 * Represents a series for high-low plots.
 * See http://www.mathworks.com/help/toolbox/finance/highlowfts.html
 */
export class HighLowSeries extends XYAxisSeries {
  /**
   * The default tracker format string
   */
  public static readonly DefaultTrackerStringFormatter: HighLowSeriesTrackerStringFormatterType = (args) =>
    `${args.title}
${args.xTitle}: ${args.xValue}
High: ${round(args.high!, 3)}
Low: ${round(args.low!, 3)}
Open: ${round(args.open!, 3)}
Close: ${round(args.close!, 3)}`

  /**
   * High/low items
   */
  private _items: HighLowItem[] = []

  /**
   * The default color.
   */
  private defaultColor: OxyColor = OxyColors.Undefined

  /**
   * Initializes a new instance of the HighLowSeries class.
   */
  constructor(opt?: CreateHighLowSeriesOptions) {
    super(opt)
    this.color = OxyColors.Automatic
    this.tickLength = 4
    this.strokeThickness = 1
    this.trackerStringFormatter = HighLowSeries.DefaultTrackerStringFormatter

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * A format string used for the tracker. The default depends on the series.
   * The arguments for the format string may be different for each type of series. See the documentation.
   */
  public trackerStringFormatter?: HighLowSeriesTrackerStringFormatterType

  /**
   * Gets or sets the color of the item.
   */
  color: OxyColor

  /**
   * Gets the actual color of the item.
   */
  get actualColor(): OxyColor {
    return this.color.getActualColor(this.defaultColor)
  }

  /**
   * Gets or sets the dashes array.
   * If this is not null it overrides the LineStyle property.
   */
  dashes?: number[]

  /**
   * Gets or sets the data field for the Close value.
   */
  dataFieldClose?: string

  /**
   * Gets or sets the data field for the High value.
   */
  dataFieldHigh?: string

  /**
   * Gets or sets the data field for the Low value.
   */
  dataFieldLow?: string

  /**
   * Gets or sets the data field for the Open value.
   */
  dataFieldOpen?: string

  /**
   * Gets or sets the x data field (time).
   */
  dataFieldX?: string

  /**
   * Gets the items of the series.
   */
  get items(): HighLowItem[] {
    return this._items
  }

  /**
   * Gets or sets the line join.
   */
  lineJoin: LineJoin = LineJoin.Miter

  /**
   * Gets or sets the line style.
   */
  lineStyle: LineStyle = LineStyle.Solid

  /**
   * Gets or sets the mapping delegate.
   * Example: series1.mapping = item => new HighLowItem(((MyType)item).Time,((MyType)item).Value);
   */
  mapping?: (item: any) => HighLowItem

  /**
   * Gets or sets the thickness of the curve.
   */
  strokeThickness: number

  /**
   * Gets or sets the length of the open/close ticks (screen coordinates).
   */
  tickLength: number

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

    let minimumDistance = Number_MAX_VALUE

    let result: TrackerHitResult | undefined = undefined
    const checkDistance = (p: DataPoint, item: HighLowItem, index: number) => {
      const sp = this.transform(p)
      const dx = sp.x - point.x
      const dy = sp.y - point.y
      const d2 = dx * dx + dy * dy

      if (d2 < minimumDistance) {
        const text = this.formatHighLowItemTrackerString(item)
        result = new TrackerHitResult({
          series: this,
          dataPoint: p,
          position: sp,
          item: item,
          index: index,
          text,
        })

        minimumDistance = d2
      }
    }

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]
      checkDistance(newDataPoint(item.x, item.high), item, i)
      checkDistance(newDataPoint(item.x, item.low), item, i)
      checkDistance(newDataPoint(item.x, item.open), item, i)
      checkDistance(newDataPoint(item.x, item.close), item, i)
    }

    if (minimumDistance < Number_MAX_VALUE) {
      return result
    }

    return undefined
  }

  protected formatHighLowItemTrackerString(item: HighLowItem): string {
    if (!this.trackerStringFormatter) return ''

    return (
      this.trackerStringFormatter({
        item,
        title: this.title || '',
        xTitle: this.xAxis!.title ?? XYAxisSeries.defaultXAxisTitle,
        xValue: this.xAxis!.getValue(item.x),
        high: this.yAxis!.getValue(item.high),
        low: this.yAxis!.getValue(item.low),
        open: this.yAxis!.getValue(item.open),
        close: this.yAxis!.getValue(item.close),
      }) || ''
    )
  }

  /**
   * Determines whether the point is valid.
   * @param pt The point.
   * @param xaxis The x axis.
   * @param yaxis The y axis.
   * @returns true if the specified point is valid; otherwise, false.
   */
  public isValidItem(pt: HighLowItem, xaxis: Axis, yaxis: Axis): boolean {
    return !isNaN(pt.x) && isFinite(pt.x) && !isNaN(pt.high) && isFinite(pt.high) && !isNaN(pt.low) && isFinite(pt.low)
  }

  /**
   * Renders the series on the specified render context.
   * @param rc The render context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (this.items.length === 0) {
      return
    }

    this.verifyAxes()

    const dashArray = LineStyleHelper.getDashArray(this.lineStyle)
    const actualColor = this.getSelectableColor(this.actualColor)

    const transform = PlotElementExtensions.transform
    for (const v of this.items) {
      if (!this.isValidItem(v, this.xAxis!, this.yAxis!)) {
        continue
      }

      if (this.strokeThickness > 0 && this.lineStyle !== LineStyle.None) {
        const high = transform(this, v.x, v.high)
        const low = transform(this, v.x, v.low)

        await rc.drawLine(
          [low, high],
          actualColor,
          this.strokeThickness,
          this.edgeRenderingMode,
          dashArray,
          this.lineJoin,
        )

        const tickVector = PlotElementExtensions.orientateVector(this, new ScreenVector(this.tickLength, 0))
        if (!isNaN(v.open)) {
          const open = transform(this, v.x, v.open)
          const openTick = open.minusVector(tickVector)
          await rc.drawLine(
            [open, openTick],
            actualColor,
            this.strokeThickness,
            this.edgeRenderingMode,
            dashArray,
            this.lineJoin,
          )
        }

        if (!isNaN(v.close)) {
          const close = transform(this, v.x, v.close)
          const closeTick = close.plus(tickVector)
          await rc.drawLine(
            [close, closeTick],
            actualColor,
            this.strokeThickness,
            this.edgeRenderingMode,
            dashArray,
            this.lineJoin,
          )
        }
      }
    }
  }

  /**
   * Renders the legend symbol for the series on the specified rendering context.
   * @param rc The rendering context.
   * @param legendBox The bounding rectangle of the legend box.
   */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const xmid = (legendBox.left + legendBox.right) / 2
    const yopen = legendBox.top + (legendBox.bottom - legendBox.top) * 0.7
    const yclose = legendBox.top + (legendBox.bottom - legendBox.top) * 0.3
    const dashArray = LineStyleHelper.getDashArray(this.lineStyle)
    const color = this.getSelectableColor(this.actualColor)

    if (this.strokeThickness > 0 && this.lineStyle !== LineStyle.None) {
      await rc.drawLine(
        [new ScreenPoint(xmid, legendBox.top), new ScreenPoint(xmid, legendBox.bottom)],
        color,
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
        LineJoin.Miter,
      )
      await rc.drawLine(
        [new ScreenPoint(xmid - this.tickLength, yopen), new ScreenPoint(xmid, yopen)],
        color,
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
        LineJoin.Miter,
      )
      await rc.drawLine(
        [new ScreenPoint(xmid + this.tickLength, yclose), new ScreenPoint(xmid, yclose)],
        color,
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
        LineJoin.Miter,
      )
    }
  }

  /**
   * Sets the default values.
   * @internal
   */
  setDefaultValues(): void {
    if (this.color.isAutomatic()) {
      this.lineStyle = this.plotModel.getDefaultLineStyle()
      this.defaultColor = this.plotModel.getDefaultColor()
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

    this._items.length = 0

    // Use the mapping to generate the points
    if (this.mapping) {
      for (const item of this.itemsSource) {
        this._items.push(this.mapping(item))
      }

      return
    }

    for (const item of this.itemsSource) {
      if (!item) continue
      if ('high' in item && 'low' in item && 'x' in item) {
        this._items.push(item as HighLowItem)
        continue
      }

      if (!this.dataFieldX || !this.dataFieldHigh || !this.dataFieldLow) {
        throw new Error('HighLowSeries: dataFieldX, dataFieldHigh and dataFieldLow are required')
      }

      const x = getOrDefault(item, this.dataFieldX, NaN)!
      const high = getOrDefault(item, this.dataFieldHigh, NaN)!
      const low = getOrDefault(item, this.dataFieldLow, NaN)!
      const open = getOrDefault(item, this.dataFieldOpen, NaN)!
      const close = getOrDefault(item, this.dataFieldClose, NaN)!

      this._items.push({
        x,
        high,
        low,
        open,
        close,
      })
    }
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()
    this.internalUpdateMaxMin3(
      this.items,
      (i) => i.x,
      (i) => i.x,
      (i) => i.low,
      (i) => i.high,
    )
  }
}
