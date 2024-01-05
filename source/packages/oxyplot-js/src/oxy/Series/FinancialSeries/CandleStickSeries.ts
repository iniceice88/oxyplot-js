import {
  CreateHighLowSeriesOptions,
  HighLowItem,
  HighLowSeries,
  IRenderContext,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  newDataPoint,
  newScreenPoint,
  OxyColor,
  OxyColorExtensions,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  ScreenPoint,
  TrackerHitResult,
} from '@/oxyplot'
import { Number_MAX_VALUE, removeUndef } from '@/patch'

export interface CreateCandleStickSeriesOptions extends CreateHighLowSeriesOptions {
  /**
   * Gets or sets the color used when the closing value is greater than opening value.
   */
  increasingColor?: OxyColor

  /**
   * Gets or sets the fill color used when the closing value is less than opening value.
   */
  decreasingColor?: OxyColor

  /**
   * Gets or sets the bar width in data units (for example if the X axis is date/time based, then should
   * use the difference of DateTimeAxis.toDouble(date) to indicate the width).  By default candlestick
   * series will use 0.80 x the minimum difference in data points.
   */
  candleWidth?: number
}

/**
 * Represents a "higher performance" ordered OHLC series for candlestick charts
 * Does the following:
 * - automatically calculates the appropriate bar width based on available screen + # of bars
 * - can render and pan within millions of bars, using a fast approach to indexing in series
 * - convenience methods
 * This implementation is associated with issue https://github.com/oxyplot/oxyplot/issues/369.
 * See also Wikipedia and Matlab documentation
 * http://en.wikipedia.org/wiki/Candlestick_chart
 * http://www.mathworks.com/help/toolbox/finance/candle.html
 */
export class CandleStickSeries extends HighLowSeries {
  /**
   * The minimum X gap between successive data items
   */
  private minDx: number = 0

  /**
   * Initializes a new instance of the CandleStickSeries class.
   */
  constructor(opt?: CreateCandleStickSeriesOptions) {
    super()
    this.increasingColor = OxyColors.DarkGreen
    this.decreasingColor = OxyColors.Red
    this.candleWidth = 0

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the color used when the closing value is greater than opening value.
   */
  increasingColor: OxyColor

  /**
   * Gets or sets the fill color used when the closing value is less than opening value.
   */
  decreasingColor: OxyColor

  /**
   * Gets or sets the bar width in data units (for example if the X axis is date/time based, then should
   * use the difference of DateTimeAxis.toDouble(date) to indicate the width).  By default candlestick
   * series will use 0.80 x the minimum difference in data points.
   */
  candleWidth: number

  /**
   * Fast index of bar where max(bar[i].X) <= x
   * @returns The index of the bar closest to X, where max(bar[i].X) <= x.
   * @param x The x coordinate.
   * @param startIndex starting index
   */
  public findByX(x: number, startIndex: number = -1): number {
    if (startIndex < 0) {
      startIndex = this.windowStartIndex
    }

    return this.findWindowStartIndex(this.items, (item) => item.x, x, startIndex)
  }

  /**
   * Renders the series on the specified render context.
   * @param rc The render context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    const nitems = this.items.length
    const items = this.items

    if (nitems === 0 || this.strokeThickness <= 0 || this.lineStyle === LineStyle.None) {
      return
    }

    this.verifyAxes()

    const dashArray = LineStyleHelper.getDashArray(this.lineStyle)

    const dataCandlewidth = this.candleWidth > 0 ? this.candleWidth : this.minDx * 0.8
    const halfDataCandlewidth = 0.5 * dataCandlewidth

    // colors
    const fillUp = this.getSelectableFillColor(this.increasingColor)
    const fillDown = this.getSelectableFillColor(this.decreasingColor)
    const lineUp = this.getSelectableColor(OxyColorExtensions.changeIntensity(this.increasingColor, 0.7))
    const lineDown = this.getSelectableColor(OxyColorExtensions.changeIntensity(this.decreasingColor, 0.7))

    // determine render range
    const xmin = this.xAxis!.clipMinimum
    const xmax = this.xAxis!.clipMaximum
    this.windowStartIndex = this.updateWindowStartIndex(items, (item) => item.x, xmin, this.windowStartIndex)

    const transform = PlotElementExtensions.transform

    for (let i = this.windowStartIndex; i < nitems; i++) {
      const bar = items[i]

      // if item beyond visible range, done
      if (bar.x > xmax) {
        return
      }

      // check to see whether is valid
      if (!this.isValidItem(bar, this.xAxis!, this.yAxis!)) {
        continue
      }

      const fillColor = bar.close > bar.open ? fillUp : fillDown
      const lineColor = bar.close > bar.open ? lineUp : lineDown

      const high = transform(this, bar.x, bar.high)
      const low = transform(this, bar.x, bar.low)
      const max = transform(this, bar.x, Math.max(bar.open, bar.close))
      const min = transform(this, bar.x, Math.min(bar.open, bar.close))

      if (this.strokeThickness > 0) {
        // Upper extent
        await rc.drawLine(
          [high, max],
          lineColor,
          this.strokeThickness,
          this.edgeRenderingMode,
          dashArray,
          this.lineJoin,
        )

        // Lower extent
        await rc.drawLine([min, low], lineColor, this.strokeThickness, this.edgeRenderingMode, dashArray, this.lineJoin)
      }

      const p1 = transform(this, bar.x - halfDataCandlewidth, bar.open)
      const p2 = transform(this, bar.x + halfDataCandlewidth, bar.close)
      const rect = OxyRect.fromScreenPoints(p1, p2)
      await rc.drawRectangle(rect, fillColor, lineColor, this.strokeThickness, this.edgeRenderingMode)
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

    const candlewidth = legendBox.width * 0.75

    if (this.strokeThickness > 0 && this.lineStyle !== LineStyle.None) {
      await rc.drawLine(
        [newScreenPoint(xmid, legendBox.top), newScreenPoint(xmid, legendBox.bottom)],
        this.getSelectableColor(this.actualColor),
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
        LineJoin.Miter,
      )
    }

    await rc.drawRectangle(
      new OxyRect(xmid - candlewidth * 0.5, yclose, candlewidth, yopen - yclose),
      this.getSelectableFillColor(this.increasingColor),
      this.getSelectableColor(this.actualColor),
      this.strokeThickness,
      this.edgeRenderingMode,
    )
  }

  /**
   * Gets the point on the series that is nearest the specified point.
   * @param point The point.
   * @param interpolate Interpolate the series if this flag is set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (!this.xAxis || !this.yAxis || interpolate || this.items.length === 0) {
      return undefined
    }

    const nbars = this.items.length
    const xy = this.inverseTransform(point)
    const targetX = xy.x

    // punt if beyond start & end of series
    if (targetX > this.items[nbars - 1].x + this.minDx || targetX < this.items[0].x - this.minDx) {
      return undefined
    }

    const pidx = this.findWindowStartIndex(this.items, (item) => item.x, targetX, this.windowStartIndex)
    const nidx = pidx + 1 < this.items.length ? pidx + 1 : pidx

    const distance = (bar: HighLowItem): number => {
      const dx = bar.x - xy.x
      const dyo = bar.open - xy.y
      const dyh = bar.high - xy.y
      const dyl = bar.low - xy.y
      const dyc = bar.close - xy.y

      const d2O = dx * dx + dyo * dyo
      const d2H = dx * dx + dyh * dyh
      const d2L = dx * dx + dyl * dyl
      const d2C = dx * dx + dyc * dyc

      return Math.min(d2O, Math.min(d2H, Math.min(d2L, d2C)))
    }

    // determine closest point
    const midx = distance(this.items[pidx]) <= distance(this.items[nidx]) ? pidx : nidx
    const mbar = this.items[midx]

    const hit = newDataPoint(mbar.x, mbar.close)
    const text = this.formatHighLowItemTrackerString(mbar)
    return new TrackerHitResult({
      series: this,
      dataPoint: hit,
      position: this.transform(hit),
      item: mbar,
      index: midx,
      text,
    })
  }

  /**
   * Updates the data.
   * @internal
   */
  updateData(): void {
    super.updateData()

    // determine minimum X gap between successive points
    const items = this.items
    const nitems = items.length
    this.minDx = Number_MAX_VALUE

    for (let i = 1; i < nitems; i++) {
      this.minDx = Math.min(this.minDx, items[i].x - items[i - 1].x)
      if (this.minDx < 0) {
        throw new Error('bars are out of order, must be sequential in x')
      }
    }

    if (nitems <= 1) {
      this.minDx = 1
    }
  }
}
