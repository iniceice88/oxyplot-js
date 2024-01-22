import type {
  CreateXYAxisSeriesOptions,
  DataPoint,
  IColorAxis,
  IRenderContext,
  LabelStringFormatterType,
  ScreenPoint,
  TrackerStringFormatterArgs,
  TrackerStringFormatterType,
} from '@/oxyplot'
import {
  Axis,
  ColorAxisExtensions,
  DataPoint_isDefined,
  DataPoint_Undefined,
  dataPointEquals,
  EdgeRenderingMode,
  HorizontalAlignment,
  newDataPoint,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
  toColorAxis,
  TrackerHitResult,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'
import { maxValueOfArray, minValueOfArray, pushMany, removeUndef } from '@/patch'

/**
 * Represents an item in a RectangleSeries.
 * RectangleItems are transformed to OxyRects.
 */
export class RectangleItem {
  /**
   * The undefined rectangle item.
   */
  static readonly Undefined = new RectangleItem(DataPoint_Undefined, DataPoint_Undefined, Number.NaN)

  /**
   * Initializes a new instance of the RectangleItem class.
   * @param x1 The x coordinate of the first corner.
   * @param x2 The x coordinate of the diagonally-opposite corner.
   * @param y1 The y coordinate of the first corner.
   * @param y2 The y coordinate of the diagonally-opposite corner.
   * @param value The value of the data rect.
   */
  constructor(x1: number, x2: number, y1: number, y2: number, value: number)
  /**
   * Initializes a new instance of the RectangleItem class.
   * @param a The first corner.
   * @param b The diagonally-opposite corner.
   * @param value The value of the data rect.
   */
  constructor(a: DataPoint, b: DataPoint, value: number)
  constructor(a: number | DataPoint, b: number | DataPoint, c: number | DataPoint, d?: number, value?: number) {
    if (typeof a === 'number') {
      this.a = newDataPoint(a, c as number)
      this.b = newDataPoint(b as number, d as number)
      this.value = value as number
    } else {
      this.a = a
      this.b = b as DataPoint
      this.value = c as number
    }
  }

  /**
   * Gets the first data point.
   */
  readonly a: DataPoint

  /**
   * Gets the diagonally-opposite data point.
   */
  readonly b: DataPoint

  /**
   * Gets the value of the item.
   */
  readonly value: number

  /**
   * Determines whether the specified point lies within the boundary of the rectangle.
   * @returns true if the value of the p parameter is inside the bounds of this instance.
   */
  contains(p: DataPoint): boolean {
    return (
      (p.x <= this.b.x && p.x >= this.a.x && p.y <= this.b.y && p.y >= this.a.y) ||
      (p.x <= this.a.x && p.x >= this.b.x && p.y <= this.a.y && p.y >= this.b.y)
    )
  }

  /**
   * Determines whether this instance and another specified RectangleItem object have the same value.
   * @param other The point to compare to this instance.
   * @returns true if the value of the other parameter is the same as the value of this instance; otherwise, false.
   */
  equals(other: RectangleItem): boolean {
    return dataPointEquals(this.a, other.a) && dataPointEquals(this.b, other.b) && this.value === other.value
  }

  /**
   * Returns a string that represents this instance.
   * @returns A string that represents this instance.
   */
  toString(): string {
    return `${this.a} ${this.b} ${this.value}`
  }

  /**
   * Determines whether this rectangle item is defined.
   * @returns true if this point is defined; otherwise, false.
   */
  isDefined(): boolean {
    return DataPoint_isDefined(this.a) && DataPoint_isDefined(this.b) && !isNaN(this.value)
  }
}

export interface CreateRectangleItemOptions extends CreateXYAxisSeriesOptions {
  /**
   * The items originating from the items source.
   */
  items?: RectangleItem[]

  /**
   * The delegate used to map from ItemsSeries.itemsSource to RectangleItem. The default is null.
   */
  mapping?: (item: any) => RectangleItem

  /**
   * The color axis key.
   */
  colorAxisKey?: string

  /**
   * The formatter for the cell labels. The default value is 0.00.
   */
  labelStringFormatter?: LabelStringFormatterType

  /**
   * The font size of the labels. The default value is 0 (labels not visible).
   */
  labelFontSize?: number

  /**
   * The default tracker formatter
   */
  trackerStringFormatter?: TrackerStringFormatterType

  /**
   * The default color-axis title
   */
  colorAxisTitle?: string

  /**
   * The color axis.
   */
  colorAxis?: IColorAxis
}

/**
 * Represents a series that can be bound to a collection of RectangleItem.
 */
export class RectangleSeries extends XYAxisSeries {
  /**
   * The items originating from the items source.
   */
  private _actualItems: RectangleItem[] = []

  /**
   * The default tracker formatter
   */
  static readonly DefaultTrackerFormatString: TrackerStringFormatterType = (args: TrackerStringFormatterArgs) =>
    `${args.title}\n${args.xTitle}: ${args.xValue}\n${args.yTitle}: ${args.yValue}\n${args.colorAxisTitle}: ${args.value}`
  //'{0}\n{1}: {2}\n{3}: {4}\n{5}: {6}'

  /**
   * The default color-axis title
   */
  private static readonly DefaultColorAxisTitle = 'Value'

  /**
   * Initializes a new instance of the HeatMapSeries class.
   */
  constructor(opt?: CreateRectangleItemOptions) {
    super(opt)
    this.trackerStringFormatter = RectangleSeries.DefaultTrackerFormatString
    this.labelFontSize = 0
    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  private _minValue: number = 0
  /**
   * Gets the minimum value of the dataset.
   */
  get minValue(): number {
    return this._minValue
  }

  private _maxValue: number = 0
  /**
   * Gets the maximum value of the dataset.
   */
  get maxValue(): number {
    return this._maxValue
  }

  private _colorAxis?: IColorAxis
  /**
   * Gets or sets the color axis.
   */
  get colorAxis(): IColorAxis | undefined {
    return this._colorAxis
  }

  protected set colorAxis(colorAxis: IColorAxis | undefined) {
    this._colorAxis = colorAxis
  }

  /**
   * Gets or sets the color axis key.
   */
  colorAxisKey?: string

  /**
   * Gets or sets the formatter for the cell labels. The default value is 0.00.
   */
  labelStringFormatter: LabelStringFormatterType = (item) => item.toFixed(2)

  /**
   * Gets or sets the font size of the labels. The default value is 0 (labels not visible).
   */
  labelFontSize: number

  /**
   * Gets or sets the delegate used to map from ItemsSeries.itemsSource to RectangleItem. The default is null.
   */
  mapping?: (item: any) => RectangleItem

  /**
   * Gets the list of rectangles. This list is used if ItemsSeries.itemsSource is not set.
   */
  items: RectangleItem[] = []

  /**
   * Gets the list of rectangles that should be rendered.
   */
  protected get actualItems(): RectangleItem[] {
    return this.itemsSource ? this._actualItems : this.items
  }

  /**
   * Renders the series on the specified rendering context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    this.verifyAxes()
    await this.renderRectangles(rc, this.actualItems)
  }

  /**
   * Updates the data.
   * @internal
   */
  updateData(): void {
    if (!this.itemsSource) {
      return
    }

    this.updateActualItems()
  }

  /**
   * Gets the item at the specified index.
   * @param i The index of the item.
   * @returns The item of the index.
   */
  protected getItem(i: number): any {
    const items = this.actualItems
    if (!this.itemsSource && items && i < items.length) {
      return items[i]
    }

    return super.getItem(i)
  }

  /**
   * Clears or creates the actualItems list.
   */
  private clearActualItems(): void {
    this._actualItems.length = 0
  }

  /**
   * Updates the points from the ItemsSeries.itemsSource.
   */
  private updateActualItems(): void {
    this.clearActualItems()

    if (!this.itemsSource || this.itemsSource.length == 0) return

    for (const item of this.itemsSource) {
      if (!item) continue
      if (item instanceof RectangleItem) {
        this._actualItems.push(item)
        continue
      }

      if (this.mapping) {
        this._actualItems.push(this.mapping(item))
        continue
      }

      throw new Error('Invalid itemsSource')
    }
  }

  /**
   * Renders the points as line, broken line and markers.
   * @param rc The rendering context.
   * @param items The Items to render.
   */
  protected async renderRectangles(rc: IRenderContext, items: RectangleItem[]): Promise<void> {
    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )

    const transform = PlotElementExtensions.transform
    for (const item of items) {
      const rectColor = ColorAxisExtensions.getColor(this.colorAxis!, item.value)

      // transform the data points to screen points
      const p1 = transform(this, item.a.x, item.a.y)
      const p2 = transform(this, item.b.x, item.b.y)

      const rect = OxyRect.fromScreenPoints(p1, p2)

      await rc.drawRectangle(rect, rectColor, OxyColors.Undefined, 0, actualEdgeRenderingMode)

      if (this.labelFontSize > 0) {
        await rc.drawText(
          rect.center,
          this.labelStringFormatter(item.value, []),
          this.actualTextColor,
          this.actualFont,
          this.labelFontSize,
          this.actualFontWeight,
          0,
          HorizontalAlignment.Center,
          VerticalAlignment.Middle,
        )
      }
    }
  }

  /**
   * Gets the point on the series that is nearest the specified point.
   * @param point The point.
   * @param interpolate Interpolate the series if this flag is set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    const p = this.inverseTransform(point)

    if (!this.isPointInRange(p)) {
      return undefined
    }

    if (!this.actualItems) return undefined

    const colorAxis = this.colorAxis as unknown as Axis
    const colorAxisTitle = colorAxis?.title ?? RectangleSeries.DefaultColorAxisTitle

    // iterate through the DataRects and return the first one that contains the point
    for (const item of this.actualItems) {
      if (item.contains(p)) {
        const text = this.formatDefaultTrackerString(item, p, (args) => {
          args.colorAxisTitle = colorAxisTitle
          args.value = item.value
        })

        return new TrackerHitResult({
          series: this,
          dataPoint: p,
          position: point,
          item: null,
          index: -1,
          text,
        })
      }
    }

    // if no DataRects contain the point, return null
    return undefined
  }

  /**
   * Ensures that the axes of the series is defined.
   * @internal
   */
  ensureAxes(): void {
    super.ensureAxes()

    this.colorAxis = this.colorAxisKey
      ? toColorAxis(this.plotModel.getAxis(this.colorAxisKey))
      : (this.plotModel.defaultColorAxis as IColorAxis)
  }

  /**
   * Updates the maximum and minimum values of the series for the x and y dimensions only.
   * @internal
   */
  updateMaxMinXY(): void {
    if (this.actualItems && this.actualItems.length > 0) {
      const minAx = minValueOfArray(this.actualItems.map((r) => r.a.x))
      const minBx = minValueOfArray(this.actualItems.map((r) => r.b.x))
      const maxAx = maxValueOfArray(this.actualItems.map((r) => r.a.x))
      const maxBx = maxValueOfArray(this.actualItems.map((r) => r.b.x))
      const minAy = minValueOfArray(this.actualItems.map((r) => r.a.y))
      const minBy = minValueOfArray(this.actualItems.map((r) => r.b.y))
      const maxAy = maxValueOfArray(this.actualItems.map((r) => r.a.y))
      const maxBy = maxValueOfArray(this.actualItems.map((r) => r.b.y))

      this.minX = Math.min(minAx, minBx)
      this.maxX = Math.max(maxAx, maxBx)
      this.minY = Math.min(minAy, minBy)
      this.maxY = Math.max(maxAy, maxBy)
    }
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()

    const allDataPoints: DataPoint[] = []
    pushMany(
      allDataPoints,
      this.actualItems.map((rect) => rect.a),
    )
    pushMany(
      allDataPoints,
      this.actualItems.map((rect) => rect.b),
    )
    this.internalUpdateMaxMin(allDataPoints)

    this.updateMaxMinXY()

    if (this.actualItems && this.actualItems.length > 0) {
      const actualItemsValues = this.actualItems.map((r) => r.value)
      this._minValue = minValueOfArray(actualItemsValues)
      this._maxValue = minValueOfArray(actualItemsValues)
    }
  }

  /**
   * Updates the axes to include the max and min of this series.
   * @internal
   */
  updateAxisMaxMin(): void {
    super.updateAxisMaxMin()
    const colorAxis = this.colorAxis as unknown as Axis
    if (colorAxis) {
      colorAxis.include(this.minValue)
      colorAxis.include(this.maxValue)
    }
  }

  /**
   * Tests if a DataPoint is inside the heat map
   * @param p The DataPoint to test.
   * @returns True if the point is inside the heat map.
   */
  private isPointInRange(p: DataPoint): boolean {
    this.updateMaxMinXY()

    return p.x >= this.minX && p.x <= this.maxX && p.y >= this.minY && p.y <= this.maxY
  }
}
