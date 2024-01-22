import type {
  CreateXYAxisSeriesOptions,
  DataPoint,
  IRenderContext,
  LabelStringFormatterType,
  ScreenPoint,
  TrackerStringFormatterArgs,
} from '@/oxyplot'
import {
  DataVector,
  EdgeRenderingMode,
  HorizontalAlignment,
  LabelPlacement,
  newDataPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
  screenPointPlus,
  ScreenVector,
  TrackerHitResult,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'
import { maxValueOfArray, minValueOfArray, pushMany, removeUndef } from '@/patch'

/** Represents an item in a HistogramSeries, a bin (range) and its area. */
export class HistogramItem {
  /** The range start. */
  rangeStart: number

  /** The range end. */
  rangeEnd: number

  /** The area. */
  area: number

  /** The count. */
  count: number

  /** The color. */
  color: OxyColor

  constructor(
    rangeStart: number,
    rangeEnd: number,
    area: number,
    count: number,
    color: OxyColor = OxyColors.Automatic,
  ) {
    this.rangeStart = rangeStart
    this.rangeEnd = rangeEnd
    this.area = area
    this.count = count
    this.color = color
  }

  /** Gets the center of the item. */
  get rangeCenter(): number {
    return this.rangeStart + (this.rangeEnd - this.rangeStart) / 2
  }

  /** Gets the computed width of the item. */
  get width(): number {
    return this.rangeEnd - this.rangeStart
  }

  /** Gets the computed height of the item. */
  get height(): number {
    return this.area / this.width
  }

  /** Gets the value of the item. Equivalent to the Height. */
  get value(): number {
    return this.height
  }

  /** Determines whether the specified point lies within the boundary of the HistogramItem. */
  contains(p: DataPoint): boolean {
    if (this.height < 0) {
      return (
        (p.x <= this.rangeEnd && p.x >= this.rangeStart && p.y >= this.height && p.y <= 0) ||
        (p.x <= this.rangeStart && p.x >= this.rangeEnd && p.y >= this.height && p.y <= 0)
      )
    } else {
      return (
        (p.x <= this.rangeEnd && p.x >= this.rangeStart && p.y <= this.height && p.y >= 0) ||
        (p.x <= this.rangeStart && p.x >= this.rangeEnd && p.y <= this.height && p.y >= 0)
      )
    }
  }

  /** Returns a string that represents this instance. */
  toString(): string {
    return `${this.rangeStart} ${this.rangeEnd} ${this.area} ${this.count}`
  }
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
}

/** Represents a series that can be bound to a collection of HistogramItem. */
export class HistogramSeries extends XYAxisSeries {
  /**
   * The default tracker formatter.
   */
  static readonly defaultTrackerStringFormatter: HistogramSeriesTrackerStringFormatterType = (
    args: HistogramSeriesTrackerStringFormatterArgs,
  ) =>
    `Start: ${args.item!.rangeStart}
End: ${args.item!.rangeEnd}
Value: ${args.item!.value}
Area: ${args.item!.area}
Count: ${args.item!.count}`

  /**
   * The default fill color.
   */
  private defaultFillColor: OxyColor = OxyColors.Undefined

  /**
   * The items originating from the items source.
   */
  private _actualItems?: HistogramItem[]

  /**
   * Initializes a new instance of the HistogramSeries class.
   */
  constructor(opt?: CreateHistogramSeriesOptions) {
    super(opt)
    this.fillColor = OxyColors.Automatic
    this.strokeColor = OxyColors.Black
    this.strokeThickness = 0
    this.trackerStringFormatter = HistogramSeries.defaultTrackerStringFormatter
    this.labelPlacement = LabelPlacement.Outside
    this.colorMapping = this.getDefaultColor
    this.negativeFillColor = OxyColors.Undefined
    this.negativeStrokeColor = OxyColors.Undefined
    this.baseValue = 0
    this.baseLine = NaN
    this.actualBaseLine = NaN

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the base value. Default value is 0.
   */
  baseValue: number

  /**
   * Gets or sets the base value.
   */
  baseLine: number

  /**
   * Gets or sets the actual base line.
   */
  actualBaseLine: number

  /**
   * Gets or sets the color of the interior of the bars.
   */
  fillColor: OxyColor

  /**
   * Gets the actual fill color.
   */
  get actualFillColor(): OxyColor {
    return this.fillColor.getActualColor(this.defaultFillColor)
  }

  /**
   * Gets or sets the color of the border around the bars.
   */
  strokeColor: OxyColor

  /**
   * Gets or sets the color of the interior of the bars when the value is negative.
   */
  negativeFillColor: OxyColor

  /**
   * Gets or sets the color of the border around the bars when the value is negative.
   */
  negativeStrokeColor: OxyColor

  /**
   * Gets or sets the thickness of the bar border strokes.
   */
  strokeThickness: number

  /**
   * Gets the minimum value of the dataset.
   */
  minValue: number = 0

  /**
   * Gets the maximum value of the dataset.
   */
  maxValue: number = 0

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
  labelMargin: number = 0

  /**
   * Gets or sets label placements.
   */
  labelPlacement: LabelPlacement

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
      const item = this.actualItems[i]
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
    const xmid = (legendBox.left + legendBox.right) / 2
    const ymid = (legendBox.top + legendBox.bottom) / 2
    const height = (legendBox.bottom - legendBox.top) * 0.8
    const width = height
    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )

    await rc.drawRectangle(
      new OxyRect(xmid - 0.5 * width, ymid - 0.5 * height, width, height),
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
    if (this.fillColor.isAutomatic()) {
      this.defaultFillColor = this.plotModel.getDefaultColor()
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

  /** Computes the base line. */
  protected computeActualBaseLine(): void {
    if (isNaN(this.baseLine)) {
      if (this.yAxis!.isLogarithmic()) {
        const lowestPositiveValue = this.actualItems
          ? minValueOfArray(
              this.actualItems.map((x) => x.value).filter((v) => v > 0),
              1,
            )
          : 1
        this.actualBaseLine = Math.max(lowestPositiveValue / 10.0, this.baseValue)
      } else {
        this.actualBaseLine = 0
      }
    } else {
      this.actualBaseLine = this.baseLine
    }
  }

  /**
   * Updates the maximum and minimum values of the series for the x and y dimensions only.
   * @internal
   * */
  updateMaxMinXY(): void {
    if (this.actualItems && this.actualItems.length > 0) {
      const rangeStarts = this.actualItems.map((r) => r.rangeStart)
      const rangeEnds = this.actualItems.map((r) => r.rangeEnd)
      const heights = this.actualItems.map((r) => r.height)

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

    const allDataPoints: DataPoint[] = []
    pushMany(
      allDataPoints,
      this.actualItems.map((item) => newDataPoint(item.rangeStart, 0.0)),
    )
    pushMany(
      allDataPoints,
      this.actualItems.map((item) => newDataPoint(item.rangeEnd, item.height)),
    )
    this.internalUpdateMaxMin(allDataPoints)

    this.updateMaxMinXY()

    if (this.actualItems && this.actualItems.length > 0) {
      const actualItemsValues = this.actualItems.map((r) => r.value)
      this.minValue = minValueOfArray(actualItemsValues)
      this.maxValue = maxValueOfArray(actualItemsValues)
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

    for (const item of items) {
      if (yAxis.isLogarithmic() && !yAxis.isValidValue(item.height)) {
        continue
      }
      const actualFillColor = this.getItemFillColor(item)
      const actualStrokeColor = this.getItemStrokeColor(item)

      // Transform data points to screen coordinates
      const p1 = this.transform(newDataPoint(item.rangeStart, clampBase ? yAxis.clipMinimum : this.baseValue))
      const p2 = this.transform(newDataPoint(item.rangeEnd, item.height))
      const rectangle = OxyRect.fromScreenPoints(p1, p2)
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
    return item.color.isAutomatic() ? this.colorMapping(item) : item.color
  }

  /**
   * Gets the stroke color of the given histogram item.
   * @param item The histogram item.
   * @returns The stroke color of the item.
   */
  protected getItemStrokeColor(item: HistogramItem): OxyColor {
    if (this.negativeStrokeColor.isUndefined() || item.height >= this.baseValue) {
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
    const formattedString = this.labelStringFormatter!(item, [
      item.value,
      item.rangeStart,
      item.rangeEnd,
      item.area,
      item.count,
    ])

    let dataPoint: DataPoint
    let verticalAlignment: VerticalAlignment
    let horizontalAlignment = HorizontalAlignment.Center

    const midX = (item.rangeStart + item.rangeEnd) / 2
    const sign = Math.sign(item.value)
    let dy = sign * this.labelMargin

    switch (this.labelPlacement) {
      case LabelPlacement.Inside:
        dataPoint = newDataPoint(midX, item.value)
        verticalAlignment = -sign as VerticalAlignment
        break
      case LabelPlacement.Middle: {
        const p1 = this.inverseTransform(rect.topLeft)
        const p2 = this.inverseTransform(rect.bottomRight)
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
        dataPoint = newDataPoint(midX, item.value)
        dy = -dy
        verticalAlignment = sign as VerticalAlignment
        break
      default:
        throw new Error('Invalid label placement')
    }

    const res = PlotElementExtensions.orientateAlignment(this, horizontalAlignment, verticalAlignment)
    horizontalAlignment = res[0]
    verticalAlignment = res[1]

    const ver = PlotElementExtensions.orientateVector(this, new ScreenVector(0, dy))
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
    if (this.negativeFillColor.isUndefined() || item.value >= this.baseValue) {
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
      if (item instanceof HistogramItem) {
        this._actualItems.push(item)
      }
      throw new Error('invalid item type')
    }
  }
}
