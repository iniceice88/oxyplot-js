import type { CreateXYAxisSeriesOptions, IRenderContext, ScreenPoint, TrackerStringFormatterType } from '@/oxyplot'
import {
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
  TrackerHitResult,
  XYAxisSeries,
} from '@/oxyplot'
import { Number_MAX_VALUE, Number_MIN_VALUE, removeUndef } from '@/patch'

/**
 * Represents an item in a CandleStickAndVolumeSeries.
 */
export class OhlcvItem {
  /**
   * The undefined.
   */
  public static readonly Undefined = new OhlcvItem(NaN, NaN, NaN)

  /**
   * The X value (time).
   */
  public x: number

  /**
   * The buy volume.
   */
  public buyVolume: number

  /**
   * The sell volume.
   */
  public sellVolume: number

  constructor(x: number = NaN, buyVolume: number, sellVolume: number) {
    this.x = x || NaN
    this.buyVolume = buyVolume
    this.sellVolume = sellVolume
  }

  /**
   * Find index of max(x) <= target x in a list of OHLCV items
   */
  public static findIndex(items: OhlcvItem[], targetX: number, guessIdx: number): number {
    let lastGuess = 0
    let start = 0
    let end = items.length - 1

    while (start <= end) {
      if (guessIdx < start) {
        return lastGuess
      } else if (guessIdx > end) {
        return end
      }

      const guessX = items[guessIdx].x
      if (guessX === targetX) {
        return guessIdx
      } else if (guessX > targetX) {
        end = guessIdx - 1
        if (end < start) {
          return lastGuess
        } else if (end === start) {
          return end
        }
      } else {
        start = guessIdx + 1
        lastGuess = guessIdx
      }

      if (start >= end) {
        return lastGuess
      }

      const endX = items[end].x
      const startX = items[start].x

      const m = (end - start + 1) / (endX - startX)
      guessIdx = start + Math.round((targetX - startX) * m)
    }

    return lastGuess
  }

  /**
   * Indicate whether is valid for rendering or not
   */
  public isValid(): boolean {
    return !isNaN(this.x) && !isNaN(this.buyVolume) && !isNaN(this.sellVolume)
  }
}

/**
 * Represents rendering style for volume in either CandleStickAndVolumeSeries or VolumeSeries.
 */
export enum VolumeStyle {
  /**
   * Volume is not displayed
   */
  None,

  /**
   * Buy + Sell volume summed to produce net positive or negative volume
   */
  Combined,

  /**
   * Buy and Sell volume is stacked, one on top of the other, with the dominant on top
   */
  Stacked,

  /**
   * Buy volume above y=0 axis and Sell volume below y=0 axis
   */
  PositiveNegative,
}

export interface CreateVolumeSeriesOptions extends CreateXYAxisSeriesOptions {
  /**
   * The items of the series.
   */
  items?: OhlcvItem[]

  /**
   * The style of volume rendering (defaults to Combined).
   */
  volumeStyle?: VolumeStyle

  /**
   * The thickness of the bar lines.
   */
  strokeThickness?: number

  /**
   * The stroke intensity scale (used to generate stroke color from positive or negative color).
   * For example, 1.0 = same color and 0.5 is 1/2 of the intensity of the source fill color.
   */
  strokeIntensity?: number

  /**
   * The color used when the closing value is greater than opening value or
   * for buying volume.
   */
  positiveColor?: OxyColor

  /**
   * The fill color used when the closing value is less than opening value or
   * for selling volume.
   */
  negativeColor?: OxyColor

  /**
   * The stroke color of the Y=0 intercept.
   */
  interceptColor?: OxyColor

  /**
   * The thickness of the Y=0 intercept.
   */
  interceptStrokeThickness?: number

  /**
   * The line style of the Y=0 intercept.
   */
  interceptLineStyle?: LineStyle

  /**
   * A value indicating whether positive bars are shown as filled (false) or hollow (true) candlesticks.
   */
  positiveHollow?: boolean

  /**
   * A value indicating whether negative bars are shown as filled (false) or hollow (true) candlesticks.
   */
  negativeHollow?: boolean

  /**
   * The bar width in data units (for example if the X axis is date/time based, then should
   * use the difference of DateTimeAxis.toDouble(date) to indicate the width).  By default candlestick
   * series will use 0.80 x the minimum difference in data points.
   */
  barWidth?: number
}

/**
 * Represents a dual view (candlestick + volume) series for OHLCV bars.
 * See http://www.mathworks.com/help/toolbox/finance/highlowfts.html
 */
export class VolumeSeries extends XYAxisSeries {
  /**
   * The default tracker format string.
   */
  public static readonly DefaultTrackerStringFormatter: TrackerStringFormatterType = (args) => {
    const item = args.item as OhlcvItem
    //'Time: {0}\nBuy Volume: {1}\nSell Volume: {2}'
    return `Time: ${args.xValue}\nBuy Volume: ${item.buyVolume}\nSell Volume: ${item.sellVolume}`
  }

  /**
   * The data series.
   */
  private data: OhlcvItem[] = []

  /**
   * The minimum X gap between successive data items.
   */
  private minDx: number = 0

  /**
   * The index of the data item at the start of visible window.
   */
  private winIndex: number = 0

  /**
   * Initializes a new instance of the VolumeSeries class.
   */
  constructor(opt?: CreateVolumeSeriesOptions) {
    super(opt)
    this.positiveColor = OxyColors.DarkGreen
    this.negativeColor = OxyColors.Red
    this.barWidth = 0
    this.strokeThickness = 1
    this.negativeHollow = false
    this.positiveHollow = true
    this.strokeIntensity = 0.8
    this.volumeStyle = VolumeStyle.Combined

    this.interceptColor = OxyColors.Gray
    this.interceptLineStyle = LineStyle.Dash
    this.interceptStrokeThickness = 1

    this.trackerStringFormatter = VolumeSeries.DefaultTrackerStringFormatter

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the items of the series.
   */
  get items(): OhlcvItem[] {
    return this.data
  }

  set items(value: OhlcvItem[]) {
    this.data = value
  }

  /**
   * Gets or sets the style of volume rendering (defaults to Combined).
   */
  volumeStyle: VolumeStyle

  /**
   * Gets or sets the thickness of the bar lines.
   */
  strokeThickness: number

  /**
   * Gets or sets the stroke intensity scale (used to generate stroke color from positive or negative color).
   * For example, 1.0 = same color and 0.5 is 1/2 of the intensity of the source fill color.
   */
  strokeIntensity: number

  /**
   * Gets or sets the color used when the closing value is greater than opening value or
   * for buying volume.
   */
  positiveColor: OxyColor

  /**
   * Gets or sets the fill color used when the closing value is less than opening value or
   * for selling volume.
   */
  negativeColor: OxyColor

  /**
   * Gets or sets the stroke color of the Y=0 intercept.
   */
  interceptColor: OxyColor

  /**
   * Gets or sets the thickness of the Y=0 intercept.
   */
  interceptStrokeThickness: number

  /**
   * Gets or sets the line style of the Y=0 intercept.
   */
  interceptLineStyle: LineStyle

  /**
   * Gets or sets a value indicating whether positive bars are shown as filled (false) or hollow (true) candlesticks.
   */
  positiveHollow: boolean

  /**
   * Gets or sets a value indicating whether negative bars are shown as filled (false) or hollow (true) candlesticks.
   */
  negativeHollow: boolean

  /**
   * Gets or sets the bar width in data units (for example if the X axis is date/time based, then should
   * use the difference of DateTimeAxis.toDouble(date) to indicate the width).  By default candlestick
   * series will use 0.80 x the minimum difference in data points.
   */
  barWidth: number

  /**
   * Gets or sets the minimum volume seen in the data series.
   */
  protected minimumVolume: number = 0

  /**
   * Gets or sets the maximum volume seen in the data series.
   */
  protected maximumVolume: number = 0

  /**
   * Gets or sets the average volume seen in the data series.
   */
  protected averageVolume: number = 0

  /**
   * Append a bar to the series (must be in X order)
   * @param bar The Bar.
   */
  public append(bar: OhlcvItem): void {
    if (this.data === null) {
      this.data = []
    }

    if (this.data.length > 0 && this.data[this.data.length - 1].x > bar.x) {
      throw new Error('cannot append bar out of order, must be sequential in X')
    }

    this.data.push(bar)
  }

  /**
   * Renders the series on the specified render context.
   * @param rc The render context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (this.data === null || this.data.length === 0) {
      return
    }

    const items = this.data
    const nitems = this.data.length

    this.verifyAxes()

    const clippingRect = this.getClippingRect()

    const datacandlewidth = this.barWidth > 0 ? this.barWidth : this.minDx * 0.8
    const halfDataCandleWidth = datacandlewidth * 0.5

    // colors
    const fillUp = this.getSelectableFillColor(this.positiveColor)
    const fillDown = this.getSelectableFillColor(this.negativeColor)

    const barfillUp = this.positiveHollow ? OxyColors.Transparent : fillUp
    const barfillDown = this.negativeHollow ? OxyColors.Transparent : fillDown

    const positiveColor = OxyColorExtensions.changeIntensity(this.positiveColor, this.strokeIntensity)
    const negativeColor = OxyColorExtensions.changeIntensity(this.negativeColor, this.strokeIntensity)
    const lineUp = this.getSelectableColor(positiveColor)
    const lineDown = this.getSelectableColor(negativeColor)

    // determine render range
    const xmin = this.xAxis!.clipMinimum
    const xmax = this.xAxis!.clipMaximum
    this.winIndex = OhlcvItem.findIndex(items, xmin, this.winIndex)
    const transform = PlotElementExtensions.transform

    for (let i = this.winIndex; i < nitems; i++) {
      const bar = items[i]

      // if item beyond visible range, done
      if (bar.x > xmax) {
        break
      }

      // check to see whether is valid
      if (!bar.isValid()) {
        continue
      }

      const rectBuy = this.getBuyBarRect(bar)
      const rectSell = this.getSellBarRect(bar)

      switch (this.volumeStyle) {
        case VolumeStyle.Combined:
          {
            const fillColor = bar.buyVolume > bar.sellVolume ? barfillUp : barfillDown
            const lineColor = bar.buyVolume > bar.sellVolume ? lineUp : lineDown
            await rc.drawRectangle(rectBuy, fillColor, lineColor, this.strokeThickness, this.edgeRenderingMode)
          }
          break

        case VolumeStyle.PositiveNegative:
          {
            await rc.drawRectangle(rectBuy, fillUp, lineUp, this.strokeThickness, this.edgeRenderingMode)
            await rc.drawRectangle(rectSell, fillDown, lineDown, this.strokeThickness, this.edgeRenderingMode)
          }
          break

        case VolumeStyle.Stacked: {
          await rc.drawRectangle(rectBuy, fillUp, lineUp, this.strokeThickness, this.edgeRenderingMode)
          await rc.drawRectangle(rectSell, fillDown, lineDown, this.strokeThickness, this.edgeRenderingMode)

          break
        }
        case VolumeStyle.None:
          break
        default:
          throw new Error('Invalid VolumeStyle')
      }
    }

    if (this.interceptStrokeThickness > 0 && this.interceptLineStyle !== LineStyle.None) {
      // draw volume y=0 line
      const p1 = this.inverseTransform(clippingRect.bottomLeft)
      const p2 = this.inverseTransform(clippingRect.topRight)
      const lineA = transform(this, p1.x, 0)
      const lineB = transform(this, p2.x, 0)

      await rc.drawLine(
        [lineA, lineB],
        this.interceptColor,
        this.interceptStrokeThickness,
        this.edgeRenderingMode,
        LineStyleHelper.getDashArray(this.interceptLineStyle),
        LineJoin.Miter,
      )
    }
  }

  protected getBuyBarRect(bar: OhlcvItem): OxyRect {
    const transform = PlotElementExtensions.transform
    const barWidth = this.barWidth > 0 ? this.barWidth : this.minDx * 0.8
    const halfDataCandleWidth = barWidth * 0.5

    const p1 = transform(this, bar.x - halfDataCandleWidth, 0)

    switch (this.volumeStyle) {
      case VolumeStyle.Combined: {
        const p2 = transform(this, bar.x + halfDataCandleWidth, Math.abs(bar.buyVolume - bar.sellVolume))
        return OxyRect.fromScreenPoints(p1, p2)
      }
      case VolumeStyle.PositiveNegative: {
        const p2 = transform(this, bar.x + halfDataCandleWidth, bar.buyVolume)
        return OxyRect.fromScreenPoints(p1, p2)
      }
      case VolumeStyle.Stacked: {
        const p2Buy = transform(this, bar.x + halfDataCandleWidth, bar.buyVolume)
        const p2Sell = transform(this, bar.x + halfDataCandleWidth, bar.sellVolume)
        const pBoth = transform(this, bar.x - halfDataCandleWidth, bar.buyVolume + bar.sellVolume)
        if (bar.buyVolume > bar.sellVolume) {
          return OxyRect.fromScreenPoints(p2Sell, pBoth)
        } else {
          return OxyRect.fromScreenPoints(p1, p2Buy)
        }
      }
    }
    throw new Error('Invalid VolumeStyle')
  }

  protected getSellBarRect(bar: OhlcvItem): OxyRect {
    const transform = PlotElementExtensions.transform
    const barWidth = this.barWidth > 0 ? this.barWidth : this.minDx * 0.8
    const halfDataCandleWidth = barWidth * 0.5

    const p1 = transform(this, bar.x - halfDataCandleWidth, 0)

    switch (this.volumeStyle) {
      case VolumeStyle.Combined: {
        const p2 = transform(this, bar.x + halfDataCandleWidth, Math.abs(bar.buyVolume - bar.sellVolume))
        return OxyRect.fromScreenPoints(p1, p2)
      }
      case VolumeStyle.PositiveNegative: {
        const p2 = transform(this, bar.x + halfDataCandleWidth, -bar.sellVolume)
        return OxyRect.fromScreenPoints(p1, p2)
      }
      case VolumeStyle.Stacked: {
        const p2Buy = transform(this, bar.x + halfDataCandleWidth, bar.buyVolume)
        const p2Sell = transform(this, bar.x + halfDataCandleWidth, bar.sellVolume)
        const pBoth = transform(this, bar.x - halfDataCandleWidth, bar.buyVolume + bar.sellVolume)
        if (bar.buyVolume > bar.sellVolume) {
          return OxyRect.fromScreenPoints(p1, p2Sell)
        } else {
          return OxyRect.fromScreenPoints(p2Buy, pBoth)
        }
      }
    }
    throw new Error('Invalid VolumeStyle')
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
    const dashArray = LineStyleHelper.getDashArray(LineStyle.Solid)

    const fillUp = this.getSelectableFillColor(this.positiveColor)
    const lineUp = this.getSelectableColor(OxyColorExtensions.changeIntensity(this.positiveColor, this.strokeIntensity))

    const candlewidth = legendBox.width * 0.75

    if (this.strokeThickness > 0) {
      await rc.drawLine(
        [newScreenPoint(xmid, legendBox.top), newScreenPoint(xmid, legendBox.bottom)],
        lineUp,
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
        LineJoin.Miter,
      )

      await rc.drawRectangle(
        new OxyRect(xmid - candlewidth * 0.5, yclose, candlewidth, yopen - yclose),
        fillUp,
        lineUp,
        this.strokeThickness,
        this.edgeRenderingMode,
      )
    }
  }

  /**
   * Gets the point on the series that is nearest the specified point.
   * @param point The point.
   * @param interpolate Interpolate the series if this flag is set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (!this.xAxis || !this.yAxis || interpolate || !this.data || this.data.length === 0) {
      return undefined
    }

    const nbars = this.data.length
    const xy = this.inverseTransform(point)
    const targetX = xy.x

    if (targetX > this.data[nbars - 1].x + this.minDx) {
      return undefined
    } else if (targetX < this.data[0].x - this.minDx) {
      return undefined
    }

    const pidx = OhlcvItem.findIndex(this.data, targetX, this.winIndex)
    const nidx = pidx + 1 < this.data.length ? pidx + 1 : pidx

    const distance = (bar: OhlcvItem): number => {
      const dx = bar.x - xy.x
      return dx * dx
    }

    const midx = distance(this.data[pidx]) <= distance(this.data[nidx]) ? pidx : nidx
    const item = this.data[midx]
    let match = false
    const buyRect = this.getBuyBarRect(item)
    if (buyRect.containsPoint(point)) {
      match = true
    }
    if (!match) {
      const sellRect = this.getSellBarRect(item)
      if (sellRect.containsPoint(point)) {
        match = true
      }
    }
    if (match) return undefined

    const text = this.formatDefaultTrackerString(item, newDataPoint(item.x, 0))
    return new TrackerHitResult({
      series: this,
      dataPoint: xy,
      position: point,
      item: item,
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
    this.winIndex = 0

    if (!this.data || this.data.length === 0) {
      return
    }

    // determine minimum X gap between successive points
    const items = this.data
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

  /**
   * Updates the axes to include the max and min of this series.
   * @internal
   */
  updateAxisMaxMin(): void {
    this.xAxis!.include(this.minX)
    this.xAxis!.include(this.maxX)

    let ymin = this.minimumVolume
    let ymax = this.maximumVolume
    const yavg = this.averageVolume

    const yquartile = (ymax - ymin) / 4.0

    switch (this.volumeStyle) {
      case VolumeStyle.PositiveNegative:
        ymin = -(yavg + yquartile / 2.0)
        ymax = +(yavg + yquartile / 2.0)
        break
      case VolumeStyle.Stacked:
        ymax = yavg + yquartile
        ymin = 0
        break
      default:
        ymax = yavg + yquartile / 2.0
        ymin = 0
        break
    }

    ymin = Math.max(this.yAxis!.filterMinValue, ymin)
    ymax = Math.min(this.yAxis!.filterMaxValue, ymax)
    this.yAxis!.include(ymin)
    this.yAxis!.include(ymax)
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()

    let xmin = Number_MAX_VALUE
    let xmax = Number_MIN_VALUE
    let ymin = 0.0
    let ymax = Number_MIN_VALUE

    let nvol = 0.0
    let cumvol = 0.0

    for (const bar of this.items) {
      if (!bar.isValid()) {
        continue
      }

      if (bar.sellVolume > 0) {
        nvol++
      }

      if (bar.buyVolume > 0) {
        nvol++
      }

      cumvol += bar.buyVolume
      cumvol += bar.sellVolume

      xmin = Math.min(xmin, bar.x)
      xmax = Math.max(xmax, bar.x)
      ymin = Math.min(ymin, -bar.sellVolume)
      ymax = Math.max(ymax, +bar.buyVolume)
    }

    this.minX = Math.max(this.xAxis!.filterMinValue, xmin)
    this.maxX = Math.min(this.xAxis!.filterMaxValue, xmax)

    this.minimumVolume = ymin
    this.maximumVolume = ymax
    this.averageVolume = cumvol / nvol
  }
}
