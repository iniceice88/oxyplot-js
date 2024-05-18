import {
  type CreateXYAxisSeriesOptions,
  ExtendedDefaultXYAxisSeriesOptions,
  type IRenderContext,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  newDataPoint,
  newOxyRect,
  newScreenPoint,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRectHelper,
  PlotElementExtensions,
  type PlotModelSerializeOptions,
  type ScreenPoint,
  TrackerHitResult,
  type TrackerStringFormatterType,
  XYAxisSeries,
} from '@/oxyplot'
import { assignMethod, assignObject, isNullOrUndef, Number_MAX_VALUE, Number_MIN_VALUE } from '@/patch'

/**
 * Represents an item in a CandleStickAndVolumeSeries.
 */
export interface OhlcvItem {
  /**
   * The X value (time).
   */
  x: number

  /**
   * The buy volume.
   */
  buyVolume: number

  /**
   * The sell volume.
   */
  sellVolume: number
}

export function newOhlcvItem(x: number, buyVolume: number, sellVolume: number): OhlcvItem {
  return { x: x ?? NaN, buyVolume, sellVolume }
}

export class OhlcvItemHelper {
  /**
   * Find index of max(x) <= target x in a list of OHLCV items
   */
  static findIndex(items: OhlcvItem[], targetX: number, guessIdx: number): number {
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
  static isValid(item: OhlcvItem): boolean {
    return !isNaN(item.x) && !isNaN(item.buyVolume) && !isNaN(item.sellVolume)
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
   * use the difference of DateTimeAxis.toDouble(date) to indicate the width).  By default, candlestick
   * series will use 0.80 x the minimum difference in data points.
   */
  barWidth?: number
}

export const DefaultVolumeSeriesOptions: CreateVolumeSeriesOptions = {
  positiveColor: OxyColors.DarkGreen,
  negativeColor: OxyColors.Red,
  barWidth: 0,
  strokeThickness: 1,
  negativeHollow: false,
  positiveHollow: true,
  strokeIntensity: 0.8,
  volumeStyle: VolumeStyle.Combined,
  interceptColor: OxyColors.Gray,
  interceptLineStyle: LineStyle.Dash,
  interceptStrokeThickness: 1,

  items: undefined,
}

export const ExtendedDefaultVolumeSeriesOptions = {
  ...ExtendedDefaultXYAxisSeriesOptions,
  ...DefaultVolumeSeriesOptions,
}

/**
 * Represents a dual view (candlestick + volume) series for OHLCV bars.
 * See http://www.mathworks.com/help/toolbox/finance/highlowfts.html
 */
export class VolumeSeries extends XYAxisSeries {
  /**
   * The default tracker formatter.
   */
  public static readonly DefaultTrackerStringFormatter: TrackerStringFormatterType = function (args) {
    const item = args.item as OhlcvItem
    //'Time: {0}\nBuy Volume: {1}\nSell Volume: {2}'
    return `Time: ${args.xValue}\nBuy Volume: ${item.buyVolume}\nSell Volume: ${item.sellVolume}`
  }

  /**
   * The data series.
   */
  private _items: OhlcvItem[] = []

  /**
   * The minimum X gap between successive data items.
   */
  private _minDx: number = 0

  /**
   * The index of the data item at the start of visible window.
   */
  private _winIndex: number = 0

  /**
   * Initializes a new instance of the VolumeSeries class.
   */
  constructor(opt?: CreateVolumeSeriesOptions) {
    super(opt)

    if (opt?.items) {
      this.items = opt.items
      delete opt.items
    }
    this.trackerStringFormatter = VolumeSeries.DefaultTrackerStringFormatter
    assignMethod(this, 'trackerStringFormatter', opt)
    assignObject(this, DefaultVolumeSeriesOptions, opt, { exclude: ['trackerStringFormatter'] })
  }

  getElementName() {
    return 'VolumeSeries'
  }

  /**
   * Gets or sets the items of the series.
   */
  get items(): OhlcvItem[] {
    return this._items
  }

  set items(value: OhlcvItem[]) {
    this._items = value
  }

  /**
   * Gets or sets the style of volume rendering (defaults to Combined).
   */
  volumeStyle: VolumeStyle = DefaultVolumeSeriesOptions.volumeStyle!

  /**
   * Gets or sets the thickness of the bar lines.
   */
  strokeThickness: number = DefaultVolumeSeriesOptions.strokeThickness!

  /**
   * Gets or sets the stroke intensity scale (used to generate stroke color from positive or negative color).
   * For example, 1.0 = same color and 0.5 is 1/2 of the intensity of the source fill color.
   */
  strokeIntensity: number = DefaultVolumeSeriesOptions.strokeIntensity!

  /**
   * Gets or sets the color used when the closing value is greater than opening value or
   * for buying volume.
   */
  positiveColor: OxyColor = DefaultVolumeSeriesOptions.positiveColor!

  /**
   * Gets or sets the fill color used when the closing value is less than opening value or
   * for selling volume.
   */
  negativeColor: OxyColor = DefaultVolumeSeriesOptions.negativeColor!

  /**
   * Gets or sets the stroke color of the Y=0 intercept.
   */
  interceptColor: OxyColor = DefaultVolumeSeriesOptions.interceptColor!

  /**
   * Gets or sets the thickness of the Y=0 intercept.
   */
  interceptStrokeThickness: number = DefaultVolumeSeriesOptions.interceptStrokeThickness!

  /**
   * Gets or sets the line style of the Y=0 intercept.
   */
  interceptLineStyle: LineStyle = DefaultVolumeSeriesOptions.interceptLineStyle!

  /**
   * Gets or sets a value indicating whether positive bars are shown as filled (false) or hollow (true) candlesticks.
   */
  positiveHollow: boolean = DefaultVolumeSeriesOptions.positiveHollow!

  /**
   * Gets or sets a value indicating whether negative bars are shown as filled (false) or hollow (true) candlesticks.
   */
  negativeHollow: boolean = DefaultVolumeSeriesOptions.negativeHollow!

  /**
   * Gets or sets the bar width in data units (for example if the X axis is date/time based, then should
   * use the difference of DateTimeAxis.toDouble(date) to indicate the width).  By default, candlestick
   * series will use 0.80 x the minimum difference in data points.
   */
  barWidth: number = DefaultVolumeSeriesOptions.barWidth!

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
    if (isNullOrUndef(this._items)) {
      this._items = []
    }

    if (this._items.length > 0 && this._items[this._items.length - 1].x > bar.x) {
      throw new Error('cannot append bar out of order, must be sequential in X')
    }

    this._items.push(bar)
  }

  /**
   * Renders the series on the specified render context.
   * @param rc The render context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (isNullOrUndef(this._items) || this._items.length === 0) {
      return
    }

    const items = this._items
    const nitems = this._items.length

    this.verifyAxes()

    const clippingRect = this.getClippingRect()

    const datacandlewidth = this.barWidth > 0 ? this.barWidth : this._minDx * 0.8
    const halfDataCandleWidth = datacandlewidth * 0.5

    // colors
    const fillUp = this.getSelectableFillColor(this.positiveColor)
    const fillDown = this.getSelectableFillColor(this.negativeColor)

    const barfillUp = this.positiveHollow ? OxyColors.Transparent : fillUp
    const barfillDown = this.negativeHollow ? OxyColors.Transparent : fillDown

    const positiveColor = OxyColorHelper.changeIntensity(this.positiveColor, this.strokeIntensity)
    const negativeColor = OxyColorHelper.changeIntensity(this.negativeColor, this.strokeIntensity)
    const lineUp = this.getSelectableColor(positiveColor)
    const lineDown = this.getSelectableColor(negativeColor)

    // determine render range
    const xmin = this.xAxis!.clipMinimum
    const xmax = this.xAxis!.clipMaximum
    this._winIndex = OhlcvItemHelper.findIndex(items, xmin, this._winIndex)
    const transform = PlotElementExtensions.transform

    for (let i = this._winIndex; i < nitems; i++) {
      const bar = items[i]

      // if item beyond visible range, done
      if (bar.x > xmax) {
        break
      }

      // check to see whether is valid
      if (!OhlcvItemHelper.isValid(bar)) {
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
      const p1 = this.inverseTransform(OxyRectHelper.bottomLeft(clippingRect))
      const p2 = this.inverseTransform(OxyRectHelper.topRight(clippingRect))
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
    const barWidth = this.barWidth > 0 ? this.barWidth : this._minDx * 0.8
    const halfDataCandleWidth = barWidth * 0.5

    const p1 = transform(this, bar.x - halfDataCandleWidth, 0)

    switch (this.volumeStyle) {
      case VolumeStyle.Combined: {
        const p2 = transform(this, bar.x + halfDataCandleWidth, Math.abs(bar.buyVolume - bar.sellVolume))
        return OxyRectHelper.fromScreenPoints(p1, p2)
      }
      case VolumeStyle.PositiveNegative: {
        const p2 = transform(this, bar.x + halfDataCandleWidth, bar.buyVolume)
        return OxyRectHelper.fromScreenPoints(p1, p2)
      }
      case VolumeStyle.Stacked: {
        const p2Buy = transform(this, bar.x + halfDataCandleWidth, bar.buyVolume)
        const p2Sell = transform(this, bar.x + halfDataCandleWidth, bar.sellVolume)
        const pBoth = transform(this, bar.x - halfDataCandleWidth, bar.buyVolume + bar.sellVolume)
        if (bar.buyVolume > bar.sellVolume) {
          return OxyRectHelper.fromScreenPoints(p2Sell, pBoth)
        } else {
          return OxyRectHelper.fromScreenPoints(p1, p2Buy)
        }
      }
    }
    throw new Error('Invalid VolumeStyle')
  }

  protected getSellBarRect(bar: OhlcvItem): OxyRect {
    const transform = PlotElementExtensions.transform
    const barWidth = this.barWidth > 0 ? this.barWidth : this._minDx * 0.8
    const halfDataCandleWidth = barWidth * 0.5

    const p1 = transform(this, bar.x - halfDataCandleWidth, 0)

    switch (this.volumeStyle) {
      case VolumeStyle.Combined: {
        const p2 = transform(this, bar.x + halfDataCandleWidth, Math.abs(bar.buyVolume - bar.sellVolume))
        return OxyRectHelper.fromScreenPoints(p1, p2)
      }
      case VolumeStyle.PositiveNegative: {
        const p2 = transform(this, bar.x + halfDataCandleWidth, -bar.sellVolume)
        return OxyRectHelper.fromScreenPoints(p1, p2)
      }
      case VolumeStyle.Stacked: {
        const p2Buy = transform(this, bar.x + halfDataCandleWidth, bar.buyVolume)
        const p2Sell = transform(this, bar.x + halfDataCandleWidth, bar.sellVolume)
        const pBoth = transform(this, bar.x - halfDataCandleWidth, bar.buyVolume + bar.sellVolume)
        if (bar.buyVolume > bar.sellVolume) {
          return OxyRectHelper.fromScreenPoints(p1, p2Sell)
        } else {
          return OxyRectHelper.fromScreenPoints(p2Buy, pBoth)
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
    const right = OxyRectHelper.right(legendBox)
    const bottom = OxyRectHelper.bottom(legendBox)
    const xmid = (legendBox.left + right) / 2
    const yopen = legendBox.top + (bottom - legendBox.top) * 0.7
    const yclose = legendBox.top + (bottom - legendBox.top) * 0.3
    const dashArray = LineStyleHelper.getDashArray(LineStyle.Solid)

    const fillUp = this.getSelectableFillColor(this.positiveColor)
    const lineUp = this.getSelectableColor(OxyColorHelper.changeIntensity(this.positiveColor, this.strokeIntensity))

    const candlewidth = legendBox.width * 0.75

    if (this.strokeThickness > 0) {
      await rc.drawLine(
        [newScreenPoint(xmid, legendBox.top), newScreenPoint(xmid, bottom)],
        lineUp,
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
        LineJoin.Miter,
      )

      await rc.drawRectangle(
        newOxyRect(xmid - candlewidth * 0.5, yclose, candlewidth, yopen - yclose),
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
    if (!this.xAxis || !this.yAxis || interpolate || !this._items || this._items.length === 0) {
      return undefined
    }

    const nbars = this._items.length
    const xy = this.inverseTransform(point)
    const targetX = xy.x

    if (targetX > this._items[nbars - 1].x + this._minDx) {
      return undefined
    } else if (targetX < this._items[0].x - this._minDx) {
      return undefined
    }

    const pidx = OhlcvItemHelper.findIndex(this._items, targetX, this._winIndex)
    const nidx = pidx + 1 < this._items.length ? pidx + 1 : pidx

    const distance = (bar: OhlcvItem): number => {
      const dx = bar.x - xy.x
      return dx * dx
    }

    const midx = distance(this._items[pidx]) <= distance(this._items[nidx]) ? pidx : nidx
    const item = this._items[midx]
    let match = false
    const buyRect = this.getBuyBarRect(item)
    if (OxyRectHelper.containsPoint(buyRect, point)) {
      match = true
    }
    if (!match) {
      const sellRect = this.getSellBarRect(item)
      if (OxyRectHelper.containsPoint(sellRect, point)) {
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
    this._winIndex = 0

    if (!this._items || this._items.length === 0) {
      return
    }

    // determine minimum X gap between successive points
    const items = this._items
    const nitems = items.length
    this._minDx = Number_MAX_VALUE

    for (let i = 1; i < nitems; i++) {
      this._minDx = Math.min(this._minDx, items[i].x - items[i - 1].x)
      if (this._minDx < 0) {
        throw new Error('bars are out of order, must be sequential in x')
      }
    }

    if (nitems <= 1) {
      this._minDx = 1
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
      if (!OhlcvItemHelper.isValid(bar)) {
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

  getJsonIgnoreProperties(): string[] {
    return [...super.getJsonIgnoreProperties(), 'minimumVolume', 'maximumVolume', 'averageVolume']
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultVolumeSeriesOptions
  }

  toJSON(opt?: PlotModelSerializeOptions) {
    const json = super.toJSON(opt)
    if (this._items?.length) {
      json.items = this._items
    }
    return json
  }
}
