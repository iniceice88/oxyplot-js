import {
  type CreateXYAxisSeriesOptions,
  type DataPoint,
  type DataVector,
  EdgeRenderingMode,
  ExtendedDefaultXYAxisSeriesOptions,
  HorizontalAlignment,
  type IRenderContext,
  LabelPlacement,
  type LabelStringFormatterType,
  newDataPoint,
  newOxyRect,
  newScreenVector,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRectHelper,
  PlotElementExtensions,
  RenderingExtensions,
  type ScreenPoint,
  screenPointPlus,
  TrackerHitResult,
  type TrackerStringFormatterArgs,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'
import { assignMethod, assignObject, isNaNOrUndef, maxValueOfArray, minValueOfArray, pushMany } from '@/patch'

/** Represents an item in a HistogramSeries, a bin (range) and its area. */
export interface HistogramItem {
  /** The range start. */
  rangeStart: number

  /** The range end. */
  rangeEnd: number

  /** The area. */
  area: number

  /** The count. */
  count: number

  value?: number

  /** The color. */
  color: OxyColor
}

export function newHistogramItem(
  rangeStart: number,
  rangeEnd: number,
  area: number,
  count: number,
  color: OxyColor = OxyColors.Automatic,
): HistogramItem {
  return {
    rangeStart,
    rangeEnd,
    area,
    count,
    color,
  }
}

export class HistogramItemEx implements HistogramItem {
  private readonly _item: HistogramItem

  constructor(item: HistogramItem) {
    this._item = item
  }

  static from(item: HistogramItem): HistogramItemEx {
    return new HistogramItemEx(item)
  }

  get rangeStart() {
    return this._item.rangeStart
  }

  get rangeEnd() {
    return this._item.rangeEnd
  }

  get area() {
    return this._item.area
  }

  get count() {
    return this._item.count
  }

  get color() {
    return this._item.color
  }

  get center() {
    return this._item.rangeStart + (this._item.rangeEnd - this._item.rangeStart) / 2
  }

  get width() {
    return this._item.rangeEnd - this._item.rangeStart
  }

  get height() {
    return this._item.area / this.width
  }

  get value() {
    return this.height
  }

  contains(p: DataPoint) {
    const height = this.height
    const { rangeStart, rangeEnd } = this._item
    if (height < 0) {
      return (
        (p.x <= rangeEnd && p.x >= rangeStart && p.y >= height && p.y <= 0) ||
        (p.x <= rangeStart && p.x >= rangeEnd && p.y >= height && p.y <= 0)
      )
    } else {
      return (
        (p.x <= rangeEnd && p.x >= rangeStart && p.y <= height && p.y >= 0) ||
        (p.x <= rangeStart && p.x >= rangeEnd && p.y <= height && p.y >= 0)
      )
    }
  }
}

//
// /** Gets the center of the item. */
// export function getHistogramItemRangeCenter(item: HistogramItem): number {
//   return item.rangeStart + (item.rangeEnd - item.rangeStart) / 2
// }
//
// /** Gets the computed width of the item. */
// export function getHistogramItemWidth(item: HistogramItem): number {
//   return item.rangeEnd - item.rangeStart
// }
//
// /** Gets the computed height of the item. */
// export function getHistogramItemHeight(item: HistogramItem): number {
//   return item.area / getHistogramItemWidth(item)
// }
//
// /** Gets the value of the item. Equivalent to the Height. */
// export function getHistogramItemValue(item: HistogramItem): number {
//   return getHistogramItemHeight(item)
// }
//
// /** Determines whether the specified point lies within the boundary of the HistogramItem. */
// export function histogramItemContains(item: HistogramItem, p: DataPoint) {
//   const height = getHistogramItemHeight(item)
//   const { rangeStart, rangeEnd } = item
//   if (height < 0) {
//     return (
//       (p.x <= rangeEnd && p.x >= rangeStart && p.y >= height && p.y <= 0) ||
//       (p.x <= rangeStart && p.x >= rangeEnd && p.y >= height && p.y <= 0)
//     )
//   } else {
//     return (
//       (p.x <= rangeEnd && p.x >= rangeStart && p.y <= height && p.y >= 0) ||
//       (p.x <= rangeStart && p.x >= rangeEnd && p.y <= height && p.y >= 0)
//     )
//   }
// }

export function isHistogramItem(obj: any) {
  if (!obj) return false
  return 'rangeStart' in obj && 'rangeEnd' in obj && 'area' in obj && 'count' in obj
}

export interface HistogramSeriesTrackerStringFormatterArgs extends TrackerStringFormatterArgs {
  readonly item?: HistogramItem
  readonly itemDirection?: DataVector
}

export type HistogramSeriesTrackerStringFormatterType = (
  args: HistogramSeriesTrackerStringFormatterArgs,
) => string | undefined

export interface CreateHistogramSeriesOptions extends CreateXYAxisSeriesOptions {
  baseValue?: number
  baseLine?: number
  fillColor?: OxyColor
  strokeColor?: OxyColor
  negativeFillColor?: OxyColor
  negativeStrokeColor?: OxyColor
  strokeThickness?: number
  labelStringFormatter?: LabelStringFormatterType
  labelMargin?: number
  labelPlacement?: LabelPlacement
  colorMapping?: (item: HistogramItem) => OxyColor
  mapping?: (item: any) => HistogramItem
  trackerStringFormatter?: HistogramSeriesTrackerStringFormatterType
  items?: HistogramItem[]
}

const DefaultHistogramSeriesOptions: CreateHistogramSeriesOptions = {
  baseValue: 0,
  baseLine: NaN,
  fillColor: OxyColors.Automatic,
  strokeColor: OxyColors.Black,
  negativeFillColor: OxyColors.Undefined,
  negativeStrokeColor: OxyColors.Undefined,
  strokeThickness: 0,
  labelMargin: 0,
  labelPlacement: LabelPlacement.Outside,

  labelStringFormatter: undefined,
  colorMapping: undefined,
  mapping: undefined,
  items: undefined,
}

export const ExtendedDefaultHistogramSeriesOptions = {
  ...ExtendedDefaultXYAxisSeriesOptions,
  ...DefaultHistogramSeriesOptions,
}

/** Represents a series that can be bound to a collection of HistogramItem. */
export class HistogramSeries extends XYAxisSeries {
  /**
   * The default tracker formatter.
   */
  static readonly defaultTrackerStringFormatter: HistogramSeriesTrackerStringFormatterType = function (
    args: HistogramSeriesTrackerStringFormatterArgs,
  ) {
    return `Start: ${args.item!.rangeStart}
End: ${args.item!.rangeEnd}
Value: ${args.item!.value}
Area: ${args.item!.area}
Count: ${args.item!.count}`
  }

  /**
   * The default fill color.
   */
  private _defaultFillColor: OxyColor = OxyColors.Undefined

  /**
   * The items originating from the items source.
   */
  private _actualItems?: HistogramItem[]

  /**
   * Initializes a new instance of the HistogramSeries class.
   */
  constructor(opt?: CreateHistogramSeriesOptions) {
    super(opt)
    this.colorMapping = this.getDefaultColor

    this.trackerStringFormatter = HistogramSeries.defaultTrackerStringFormatter
    assignMethod(this, 'trackerStringFormatter', opt)

    assignObject(this, DefaultHistogramSeriesOptions, opt, { exclude: ['trackerStringFormatter'] })
  }

  getElementName() {
    return 'HistogramSeries'
  }

  /**
   * Gets or sets the base value. Default value is 0.
   */
  baseValue: number = DefaultHistogramSeriesOptions.baseValue!

  /**
   * Gets or sets the base value.
   */
  baseLine: number = DefaultHistogramSeriesOptions.baseLine!

  private _actualBaseLine: number = NaN
  /**
   * Gets or sets the actual baseline.
   */
  get actualBaseLine() {
    return this._actualBaseLine
  }

  /**
   * Gets or sets the color of the interior of the bars.
   */
  fillColor: OxyColor = DefaultHistogramSeriesOptions.fillColor!

  /**
   * Gets the actual fill color.
   */
  get actualFillColor(): OxyColor {
    return OxyColorHelper.getActualColor(this.fillColor, this._defaultFillColor)
  }

  /**
   * Gets or sets the color of the border around the bars.
   */
  strokeColor: OxyColor = DefaultHistogramSeriesOptions.strokeColor!

  /**
   * Gets or sets the color of the interior of the bars when the value is negative.
   */
  negativeFillColor: OxyColor = DefaultHistogramSeriesOptions.negativeFillColor!

  /**
   * Gets or sets the color of the border around the bars when the value is negative.
   */
  negativeStrokeColor: OxyColor = DefaultHistogramSeriesOptions.negativeStrokeColor!

  /**
   * Gets or sets the thickness of the bar border strokes.
   */
  strokeThickness: number = DefaultHistogramSeriesOptions.strokeThickness!

  /**
   * Gets the minimum value of the dataset.
   */
  get minValue() {
    return this._minValue
  }

  private _minValue = 0

  /**
   * Gets the maximum value of the dataset.
   */
  get maxValue() {
    return this._maxValue
  }

  private _maxValue = 0

  /**
   * Gets or sets the formatter for the cell labels. The default value is 0.00.
   */
  labelStringFormatter?: LabelStringFormatterType

  /**
   * A format function used for the tracker. The default depends on the series.
   * The arguments for the formatter may be different for each type of series. See the documentation.
   */
  public trackerStringFormatter?: HistogramSeriesTrackerStringFormatterType = undefined

  /**
   * Gets or sets the label margins.
   */
  labelMargin: number = DefaultHistogramSeriesOptions.labelMargin!

  /**
   * Gets or sets label placements.
   */
  labelPlacement: LabelPlacement = DefaultHistogramSeriesOptions.labelPlacement!

  /**
   * Gets or sets the delegate used to map from histogram item to color.
   */
  colorMapping: (item: HistogramItem) => OxyColor

  /**
   * Gets or sets the delegate used to map from ItemsSeries.ItemsSource to HistogramSeries. The default is null.
   */
  mapping?: (item: any) => HistogramItem

  /**
   * Gets the list of HistogramItem.
   */
  items: HistogramItem[] = []

  /**
   * Gets the list of HistogramItem that should be rendered.
   */
  protected get actualItems(): HistogramItem[] {
    return (this.itemsSource ? this._actualItems : this.items)!
  }

  /** Renders the series on the specified rendering context. */
  async render(rc: IRenderContext): Promise<void> {
    this.verifyAxes()
    await this.renderBins(rc, this.actualItems)
  }

  /** Gets the point on the series that is nearest the specified point. */
  getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    const p = this.inverseTransform(point)

    if (!this.isPointInRange(p)) {
      return undefined
    }

    if (!this.actualItems) {
      return undefined
    }

    // iterate through the HistogramItems and return the first one that contains the point
    for (let i = 0; i < this.actualItems.length; i++) {
      const item = HistogramItemEx.from(this.actualItems[i])
      if (item.contains(p)) {
        const itemsSourceItem = this.getItem(i)
        return new TrackerHitResult({
          series: this,
          dataPoint: p,
          position: point,
          item: itemsSourceItem,
          index: i,
          text: this.formatDefaultTrackerString(item, p),
        })
      }
    }

    // if no HistogramItems contain the point, return null
    return undefined
  }

  /** Renders the legend symbol on the specified rendering context. */
  async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const right = OxyRectHelper.right(legendBox)
    const bottom = OxyRectHelper.bottom(legendBox)
    const xmid = (legendBox.left + right) / 2
    const ymid = (legendBox.top + bottom) / 2
    const height = (bottom - legendBox.top) * 0.8
    const width = height
    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )

    await rc.drawRectangle(
      newOxyRect(xmid - 0.5 * width, ymid - 0.5 * height, width, height),
      this.getSelectableColor(this.actualFillColor),
      this.strokeColor,
      this.strokeThickness,
      actualEdgeRenderingMode,
    )
  }

  /**
   * Updates the data.
   * @internal
   * */
  updateData(): void {
    if (!this.itemsSource) {
      return
    }

    this.updateActualItems()
  }

  /**
   * Sets the default values.
   * @internal
   * */
  setDefaultValues(): void {
    if (OxyColorHelper.isAutomatic(this.fillColor)) {
      this._defaultFillColor = this.plotModel.getDefaultColor()
    }
  }

  /**
   * Updates the axes to include the max and min of this series.
   * @internal
   * */
  updateAxisMaxMin(): void {
    super.updateAxisMaxMin()

    this.computeActualBaseLine()
    this.yAxis!.include(this.actualBaseLine)
  }

  /** Computes the baseline. */
  protected computeActualBaseLine(): void {
    if (isNaNOrUndef(this.baseLine)) {
      if (this.yAxis!.isLogarithmic()) {
        const lowestPositiveValue = this.actualItems
          ? minValueOfArray(
              this.actualItems.map((x) => HistogramItemEx.from(x).value).filter((v) => v > 0),
              1,
            )
          : 1
        this._actualBaseLine = Math.max(lowestPositiveValue / 10.0, this.baseValue)
      } else {
        this._actualBaseLine = 0
      }
    } else {
      this._actualBaseLine = this.baseLine
    }
  }

  /**
   * Updates the maximum and minimum values of the series for the x and y dimensions only.
   * @internal
   * */
  updateMaxMinXY(): void {
    if (this.actualItems && this.actualItems.length > 0) {
      const items = this.actualItems.map((r) => HistogramItemEx.from(r))
      const rangeStarts = items.map((r) => r.rangeStart)
      const rangeEnds = items.map((r) => r.rangeEnd)
      const heights = items.map((r) => r.height)

      this.minX = Math.min(minValueOfArray(rangeStarts), minValueOfArray(rangeEnds))
      this.maxX = Math.max(maxValueOfArray(rangeStarts), maxValueOfArray(rangeEnds))
      if (this.yAxis!.isLogarithmic()) {
        this.minY = Math.max(minValueOfArray(heights), Number.EPSILON)
        this.maxY = maxValueOfArray(heights, Number.EPSILON)
      } else {
        this.minY = minValueOfArray(heights, 0)
        this.maxY = maxValueOfArray(heights, 0)
      }
    }
  }

  /**
   * Updates the internal maximum and minimum values of the series.
   */
  override updateMaxMin(): void {
    super.updateMaxMin()

    if (!this.actualItems) return
    const items = this.actualItems.map((r) => HistogramItemEx.from(r))
    const allDataPoints: DataPoint[] = []
    pushMany(
      allDataPoints,
      items.map((item) => newDataPoint(item.rangeStart, 0.0)),
    )
    pushMany(
      allDataPoints,
      items.map((item) => newDataPoint(item.rangeEnd, item.height)),
    )
    this.internalUpdateMaxMin(allDataPoints)

    this.updateMaxMinXY()

    if (items.length > 0) {
      const actualItemsValues = items.map((r) => r.value)
      this._minValue = minValueOfArray(actualItemsValues)
      this._maxValue = maxValueOfArray(actualItemsValues)
    }
  }

  /**
   * Gets the item at the specified index.
   * @param i The index of the item.
   * @returns The item at the specified index.
   */
  protected override getItem(i: number): object | undefined {
    const items = this.actualItems
    if (!this.itemsSource && items && i < items.length) {
      return items[i]
    }

    return super.getItem(i)
  }

  /**
   * Renders the histogram bins as rectangles with optional fill and stroke.
   * @param rc The rendering context.
   * @param items The histogram items to render.
   */
  protected async renderBins(rc: IRenderContext, items: HistogramItem[]): Promise<void> {
    const yAxis = this.yAxis!
    const clampBase = yAxis.isLogarithmic() && !yAxis.isValidValue(this.baseValue)

    for (const i of items) {
      const item = HistogramItemEx.from(i)
      if (yAxis.isLogarithmic() && !yAxis.isValidValue(item.height)) {
        continue
      }
      const actualFillColor = this.getItemFillColor(item)
      const actualStrokeColor = this.getItemStrokeColor(item)

      // Transform data points to screen coordinates
      const p1 = this.transform(newDataPoint(item.rangeStart, clampBase ? yAxis.clipMinimum : this.baseValue))
      const p2 = this.transform(newDataPoint(item.rangeEnd, item.height))
      const rectangle = OxyRectHelper.fromScreenPoints(p1, p2)
      const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
        this.edgeRenderingMode,
        EdgeRenderingMode.PreferSharpness,
      )

      await rc.drawRectangle(
        rectangle,
        actualFillColor,
        actualStrokeColor,
        this.strokeThickness,
        actualEdgeRenderingMode,
      )

      if (this.labelStringFormatter) {
        await this.renderLabel(rc, rectangle, item)
      }
    }
  }

  /**
   * Gets the fill color of the given histogram item.
   * @param item The histogram item.
   * @returns The fill color of the item.
   */
  protected getItemFillColor(item: HistogramItem): OxyColor {
    const itemEx = HistogramItemEx.from(item)
    if (!item.color) item.color = OxyColors.Automatic
    return OxyColorHelper.isAutomatic(item.color) ? this.colorMapping(itemEx) : item.color
  }

  /**
   * Gets the stroke color of the given histogram item.
   * @param item The histogram item.
   * @returns The stroke color of the item.
   */
  protected getItemStrokeColor(item: HistogramItem): OxyColor {
    if (OxyColorHelper.isUndefined(this.negativeStrokeColor) || HistogramItemEx.from(item).height >= this.baseValue) {
      return this.strokeColor
    }

    return this.negativeStrokeColor
  }

  /**
   * Renders the label for the given histogram item.
   * @param rc The render context.
   * @param rect The rectangle representing the histogram bin.
   * @param item The histogram item.
   */
  protected async renderLabel(rc: IRenderContext, rect: OxyRect, item: HistogramItem): Promise<void> {
    const itemEx = HistogramItemEx.from(item)
    const itemValue = itemEx.value
    const formattedString = this.labelStringFormatter!(item, [
      itemValue,
      item.rangeStart,
      item.rangeEnd,
      item.area,
      item.count,
    ])

    let dataPoint: DataPoint
    let verticalAlignment: VerticalAlignment
    let horizontalAlignment = HorizontalAlignment.Center

    const midX = (item.rangeStart + item.rangeEnd) / 2
    const sign = Math.sign(itemValue)
    let dy = sign * this.labelMargin

    switch (this.labelPlacement) {
      case LabelPlacement.Inside:
        dataPoint = newDataPoint(midX, itemValue)
        verticalAlignment = -sign as VerticalAlignment
        break
      case LabelPlacement.Middle: {
        const p1 = this.inverseTransform(OxyRectHelper.topLeft(rect))
        const p2 = this.inverseTransform(OxyRectHelper.bottomRight(rect))
        dataPoint = newDataPoint(midX, (p1.y + p2.y) / 2)
        verticalAlignment = VerticalAlignment.Middle
        break
      }
      case LabelPlacement.Base:
        dataPoint = newDataPoint(midX, 0)
        dy = -dy
        verticalAlignment = sign as VerticalAlignment
        break
      case LabelPlacement.Outside:
        dataPoint = newDataPoint(midX, itemValue)
        dy = -dy
        verticalAlignment = sign as VerticalAlignment
        break
      default:
        throw new Error('Invalid label placement')
    }

    const res = PlotElementExtensions.orientateAlignment(this, horizontalAlignment, verticalAlignment)
    horizontalAlignment = res[0]
    verticalAlignment = res[1]

    const ver = PlotElementExtensions.orientateVector(this, newScreenVector(0, dy))
    const screenPoint = screenPointPlus(this.transform(dataPoint), ver)

    await rc.drawText(
      screenPoint,
      formattedString,
      this.actualTextColor,
      this.actualFont,
      this.actualFontSize,
      this.actualFontWeight,
      0,
      horizontalAlignment,
      verticalAlignment,
    )
  }

  /**
   * Determines if a DataPoint falls within the histogram bounds.
   * @param p The DataPoint to test.
   * @returns True if the point is inside the histogram.
   */
  private isPointInRange(p: DataPoint): boolean {
    this.updateMaxMinXY()

    return p.x >= this.minX && p.x <= this.maxX && p.y >= this.minY && p.y <= this.maxY
  }

  /**
   * Initializes or clears the actual items list.
   */
  private clearActualItems(): void {
    if (this._actualItems) {
      this._actualItems.length = 0
    }
  }

  /**
   * Gets the default color for a histogram item based on its value.
   * @param item The histogram item.
   * @returns The default color.
   */
  private getDefaultColor(item: HistogramItem): OxyColor {
    if (OxyColorHelper.isUndefined(this.negativeFillColor) || HistogramItemEx.from(item).value >= this.baseValue) {
      return this.actualFillColor
    }
    return this.negativeFillColor
  }

  /**
   * Updates the actual items based on the ItemsSource.
   */
  private updateActualItems(): void {
    // Use the Mapping property to generate the points
    if (this.mapping) {
      if (!this.itemsSource) {
        throw new Error('itemsSource is required when using the Mapping property')
      }
      this.clearActualItems()
      this._actualItems = this._actualItems || []
      for (const item of this.itemsSource) {
        this._actualItems.push(this.mapping(item))
      }

      return
    }
    this.clearActualItems()

    this._actualItems = this._actualItems || []
    for (const item of this.itemsSource || []) {
      if (!item) continue
      if (isHistogramItem(item)) {
        this._actualItems.push(item)
      }
      throw new Error('invalid item type')
    }
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultHistogramSeriesOptions
  }
}
