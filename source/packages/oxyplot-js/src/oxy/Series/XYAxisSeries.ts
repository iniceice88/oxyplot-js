import {
  Axis,
  type CreateItemsSeriesOptions,
  DataPoint,
  type IRenderContext,
  ItemsSeries,
  type ITransposablePlotElement,
  OxyRect,
  PlotElementExtensions,
  PlotElementUtilities,
  ScreenPoint,
  ScreenPointHelper,
  setTransposablePlotElement,
  TrackerHitResult,
  type TrackerStringFormatterArgs,
  type TrackerStringFormatterType,
} from '@/oxyplot'
import { Number_MAX_VALUE, Number_MIN_VALUE } from '@/patch'

export interface CreateXYAxisSeriesOptions extends CreateItemsSeriesOptions {
  xAxisKey?: string
  yAxisKey?: string
}

/**
 * Provides an abstract base class for series that are related to an X-axis and a Y-axis.
 */
export abstract class XYAxisSeries extends ItemsSeries implements ITransposablePlotElement {
  /**
   * The default tracker format string
   */
  public static readonly DefaultTrackerFormatter: TrackerStringFormatterType = (args) => {
    return `${args.title || ''}\n${args.xTitle}: ${args.xValue}\n${args.yTitle}: ${args.yValue}`
  }

  /**
   * The default x-axis title
   */
  protected static readonly defaultXAxisTitle = 'X'

  /**
   * The default y-axis title
   */
  protected static readonly defaultYAxisTitle = 'Y'

  /**
   * A format string used for the tracker. The default depends on the series.
   * The arguments for the format string may be different for each type of series. See the documentation.
   */
  public trackerStringFormatter?: TrackerStringFormatterType

  /**
   * Initializes a new instance of the XYAxisSeries class.
   */
  protected constructor(opt?: CreateXYAxisSeriesOptions) {
    super(opt)
    this.trackerStringFormatter = XYAxisSeries.DefaultTrackerFormatter
    setTransposablePlotElement(this)
  }

  private _maxX: number = 0

  /**
   * Gets or sets the maximum x-coordinate of the dataset.
   */
  public get maxX(): number {
    return this._maxX
  }

  protected set maxX(value: number) {
    this._maxX = value
  }

  private _maxY: number = 0

  /**
   * Gets or sets the maximum y-coordinate of the dataset.
   */
  public get maxY(): number {
    return this._maxY
  }

  protected set maxY(value: number) {
    this._maxY = value
  }

  private _minX: number = 0

  /**
   * Gets or sets the minimum x-coordinate of the dataset.
   */
  public get minX(): number {
    return this._minX
  }

  protected set minX(value: number) {
    this._minX = value
  }

  private _minY: number = 0

  /**
   * Gets or sets the minimum y-coordinate of the dataset.
   */
  public get minY(): number {
    return this._minY
  }

  protected set minY(value: number) {
    this._minY = value
  }

  private _xAxis?: Axis
  /**
   * Gets the x-axis.
   */
  public get xAxis(): Axis | undefined {
    return this._xAxis
  }

  /**
   * Gets or sets the x-axis key. The default is null.
   */
  public xAxisKey?: string

  private _yAxis?: Axis
  /**
   * Gets the y-axis.
   */
  public get yAxis(): Axis | undefined {
    return this._yAxis
  }

  /**
   * Gets or sets the y-axis key. The default is null.
   */
  public yAxisKey?: string

  /**
   * Gets or sets a value indicating whether the X coordinate of all data point increases monotonically.
   */
  protected isXMonotonic: boolean = false

  /**
   * Gets or sets the last visible window start position in the data points collection.
   */
  protected windowStartIndex: number = 0

  /**
   * Gets the clipping rectangle of the series.
   * @returns The clipping rectangle.
   */
  public getClippingRect(): OxyRect {
    return PlotElementUtilities.getClippingRect(this)
  }

  /**
   * Gets the rectangle the series uses on the screen (screen coordinates).
   * @returns The rectangle.
   */
  public getScreenRectangle(): OxyRect {
    return this.getClippingRect()
  }

  /**
   * Inverse transforms the specified screen point to a data point.
   * @param p The screen point.
   * @returns The data point.
   */
  public inverseTransform(p: ScreenPoint): DataPoint {
    return PlotElementUtilities.inverseTransformOrientated(this, p)
  }

  /**
   * Renders the legend symbol on the specified rendering context.
   * @param rc The rendering context.
   * @param legendBox The legend rectangle.
   */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {}

  /**
   * Transforms the specified data point to a screen point.
   * @param p The data point.
   * @returns The screen point.
   */
  public transform(p: DataPoint): ScreenPoint {
    return PlotElementUtilities.transformOrientated(this, p)
  }

  /**
   * Check if this data series requires X/Y axes. (e.g. Pie series do not require axes)
   * @returns True if axes are required.
   * @internal
   */
  areAxesRequired(): boolean {
    return true
  }

  /**
   * Ensures that the axes of the series are defined.
   * @internal
   */
  ensureAxes(): void {
    this._xAxis = this.xAxisKey ? this.plotModel.getAxis(this.xAxisKey) : this.plotModel.defaultXAxis

    this._yAxis = this.yAxisKey ? this.plotModel.getAxis(this.yAxisKey) : this.plotModel.defaultYAxis
  }

  /**
   * Check if the data series is using the specified axis.
   * @param axis An axis.
   * @returns True if the axis is in use.
   * @internal
   */
  isUsing(axis: Axis): boolean {
    return false
  }

  /**
   * Sets default values from the plot model.
   * @internal
   */
  setDefaultValues(): void {}

  /**
   * Updates the axes to include the max and min of this series.
   * @internal
   */
  updateAxisMaxMin(): void {
    this.xAxis!.include(this.minX)
    this.xAxis!.include(this.maxX)
    this.yAxis!.include(this.minY)
    this.yAxis!.include(this.maxY)
  }

  /**
   * Updates the data.
   * @internal
   */
  updateData(): void {
    this.windowStartIndex = 0
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    this.minX = this.minY = this.maxX = this.maxY = Number.NaN
  }

  /**
   * Gets the point on the curve that is nearest the specified point.
   * @param points The point list.
   * @param startIdx The index to start from.
   * @param point The point.
   * @returns A tracker hit result if a point was found.
   * The Text property of the result will not be set, since the formatting depends on the various series.
   */
  protected getNearestInterpolatedPointInternal(
    points: DataPoint[],
    startIdx: number,
    point: ScreenPoint,
  ): TrackerHitResult | undefined {
    if (!this.xAxis || !this.yAxis || !points) {
      return undefined
    }

    let spn = ScreenPoint.LeftTop
    let dpn = DataPoint.Zero
    let index = -1

    let minimumDistance = Number_MAX_VALUE

    for (let i = startIdx; i + 1 < points.length; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      if (!this.isValidPoint(p1) || !this.isValidPoint(p2)) {
        continue
      }

      const sp1 = this.transform(p1)
      const sp2 = this.transform(p2)

      // Find the nearest point on the line segment.
      const spl = ScreenPointHelper.findPointOnLine(point, sp1, sp2)

      if (ScreenPoint.isUndefined(spl)) {
        // P1 && P2 coincident
        continue
      }

      const l2 = point.minus(spl).lengthSquared

      if (l2 < minimumDistance) {
        const segmentLength = sp2.minus(sp1).length
        const u = segmentLength > 0 ? spl.minus(sp1).length / segmentLength : 0
        dpn = this.inverseTransform(spl)
        spn = spl
        minimumDistance = l2
        index = i + u
      }
    }

    if (minimumDistance < Number_MAX_VALUE) {
      const item = this.getItem(Math.round(index))
      return new TrackerHitResult({
        series: this,
        dataPoint: dpn,
        position: spn,
        item,
        index,
      })
    }

    return undefined
  }

  /**
   * Gets the nearest point.
   * @param points The points (data coordinates).
   * @param startIdx The index to start from.
   * @param point The point (screen coordinates).
   * @returns A TrackerHitResult if a point was found, null otherwise.
   * The Text property of the result will not be set, since the formatting depends on the various series.
   */
  protected getNearestPointInternal(
    points: DataPoint[],
    startIdx: number,
    point: ScreenPoint,
  ): TrackerHitResult | undefined {
    let spn = ScreenPoint.LeftTop
    let dpn = DataPoint.Zero
    let index = -1

    let minimumDistance = Number_MAX_VALUE
    let i = startIdx
    for (const p of points.slice(startIdx)) {
      if (!this.isValidPoint(p)) {
        i++
        continue
      }

      const sp = PlotElementExtensions.transform(this, p.x, p.y)
      const d2 = sp.minus(point).lengthSquared

      if (d2 < minimumDistance) {
        dpn = p
        spn = sp
        minimumDistance = d2
        index = i
      }

      i++
    }

    if (minimumDistance < Number_MAX_VALUE) {
      const item = this.getItem(Math.round(index))
      return new TrackerHitResult({
        series: this,
        dataPoint: dpn,
        position: spn,
        item,
        index,
      })
    }

    return undefined
  }

  /**
   * Determines whether the specified point is valid.
   * @param pt The point.
   * @returns true if the point is valid; otherwise, false.
   */
  protected isValidPoint(pt: DataPoint): boolean {
    return this.isValidPoint2(pt.x, pt.y)
  }

  /**
   * Determines whether the specified point is valid.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @returns true if the point is valid; otherwise, false.
   */
  protected isValidPoint2(x: number, y: number): boolean {
    return !!(this.xAxis && this.xAxis.isValidValue(x) && this.yAxis && this.yAxis.isValidValue(y))
  }

  /**
   * Updates the Max/Min limits from the specified DataPoint list.
   * @param points The list of points.
   * @throws Error if points is null.
   */
  protected internalUpdateMaxMin(points: DataPoint[]): void {
    if (!points) {
      throw new Error('points is null')
    }

    this.isXMonotonic = true

    if (points.length === 0) {
      return
    }

    let minx = this.minX
    let miny = this.minY
    let maxx = this.maxX
    let maxy = this.maxY

    if (isNaN(minx)) {
      minx = Number_MAX_VALUE
    }

    if (isNaN(miny)) {
      miny = Number_MAX_VALUE
    }

    if (isNaN(maxx)) {
      maxx = Number_MIN_VALUE
    }

    if (isNaN(maxy)) {
      maxy = Number_MIN_VALUE
    }

    let lastX = Number_MIN_VALUE
    for (const pt of points) {
      const x = pt.x
      const y = pt.y

      // Check if the point is valid
      if (!this.isValidPoint2(x, y)) {
        continue
      }

      if (x < lastX) {
        this.isXMonotonic = false
      }

      if (x < minx) {
        minx = x
      }

      if (x > maxx) {
        maxx = x
      }

      if (y < miny) {
        miny = y
      }

      if (y > maxy) {
        maxy = y
      }

      lastX = x
    }

    if (minx < Number_MAX_VALUE) {
      this.minX = minx
    }

    if (miny < Number_MAX_VALUE) {
      this.minY = miny
    }

    if (maxx > Number_MIN_VALUE) {
      this.maxX = maxx
    }

    if (maxy > Number_MIN_VALUE) {
      this.maxY = maxy
    }
  }

  /**
   * Updates the Max/Min limits from the specified list.
   * @param items The items.
   * @param xf A function that provides the x value for each item.
   * @param yf A function that provides the y value for each item.
   * @throws Error if items is null.
   */
  protected internalUpdateMaxMin2<T>(items: T[], xf: (item: T) => number, yf: (item: T) => number): void {
    if (!items) {
      throw new Error('items is null')
    }

    this.isXMonotonic = true

    if (items.length === 0) {
      return
    }

    let minx = this.minX
    let miny = this.minY
    let maxx = this.maxX
    let maxy = this.maxY

    if (isNaN(minx)) {
      minx = Number_MAX_VALUE
    }

    if (isNaN(miny)) {
      miny = Number_MAX_VALUE
    }

    if (isNaN(maxx)) {
      maxx = Number_MIN_VALUE
    }

    if (isNaN(maxy)) {
      maxy = Number_MIN_VALUE
    }

    let lastX = Number_MIN_VALUE
    for (const item of items) {
      const x = xf(item)
      const y = yf(item)

      // Check if the point is valid
      if (!this.isValidPoint2(x, y)) {
        continue
      }

      if (x < lastX) {
        this.isXMonotonic = false
      }

      if (x < minx) {
        minx = x
      }

      if (x > maxx) {
        maxx = x
      }

      if (y < miny) {
        miny = y
      }

      if (y > maxy) {
        maxy = y
      }

      lastX = x
    }

    if (minx < Number_MAX_VALUE) {
      this.minX = minx
    }

    if (miny < Number_MAX_VALUE) {
      this.minY = miny
    }

    if (maxx > Number_MIN_VALUE) {
      this.maxX = maxx
    }

    if (maxy > Number_MIN_VALUE) {
      this.maxY = maxy
    }
  }

  /**
   * Updates the Max/Min limits from the specified collection.
   * @param items The items.
   * @param xmin A function that provides the x minimum for each item.
   * @param xmax A function that provides the x maximum for each item.
   * @param ymin A function that provides the y minimum for each item.
   * @param ymax A function that provides the y maximum for each item.
   * @throws Error if items is null.
   */
  protected internalUpdateMaxMin3<T>(
    items: T[],
    xmin: (item: T) => number,
    xmax: (item: T) => number,
    ymin: (item: T) => number,
    ymax: (item: T) => number,
  ): void {
    if (!items) {
      throw new Error('items is null')
    }

    this.isXMonotonic = true

    if (items.length === 0) {
      return
    }

    let minx = this.minX
    let miny = this.minY
    let maxx = this.maxX
    let maxy = this.maxY

    if (isNaN(minx)) {
      minx = Number_MAX_VALUE
    }

    if (isNaN(miny)) {
      miny = Number_MAX_VALUE
    }

    if (isNaN(maxx)) {
      maxx = Number_MIN_VALUE
    }

    if (isNaN(maxy)) {
      maxy = Number_MIN_VALUE
    }

    let lastX0 = Number_MIN_VALUE
    let lastX1 = Number_MIN_VALUE
    for (const item of items) {
      const x0 = xmin(item)
      const x1 = xmax(item)
      const y0 = ymin(item)
      const y1 = ymax(item)

      if (!this.isValidPoint2(x0, y0) || !this.isValidPoint2(x1, y1)) {
        continue
      }

      if (x0 < lastX0 || x1 < lastX1) {
        this.isXMonotonic = false
      }

      if (x0 < minx) {
        minx = x0
      }

      if (x1 > maxx) {
        maxx = x1
      }

      if (y0 < miny) {
        miny = y0
      }

      if (y1 > maxy) {
        maxy = y1
      }

      lastX0 = x0
      lastX1 = x1
    }

    if (minx < Number_MAX_VALUE) {
      this.minX = minx
    }

    if (miny < Number_MAX_VALUE) {
      this.minY = miny
    }

    if (maxx > Number_MIN_VALUE) {
      this.maxX = maxx
    }

    if (maxy > Number_MIN_VALUE) {
      this.maxY = maxy
    }
  }

  /**
   * Verifies that both axes are defined.
   */
  protected verifyAxes(): void {
    if (!this.xAxis) {
      throw new Error('XAxis not defined.')
    }

    if (!this.yAxis) {
      throw new Error('YAxis not defined.')
    }
  }

  /**
   * Updates visible window start index.
   * @param items Data points.
   * @param xgetter Function that gets data point X coordinate.
   * @param targetX X coordinate of visible window start.
   * @param lastIndex Last window index.
   * @returns The new window start index.
   */
  protected updateWindowStartIndex<T>(
    items: T[],
    xgetter: (item: T) => number,
    targetX: number,
    lastIndex: number,
  ): number {
    lastIndex = this.findWindowStartIndex(items, xgetter, targetX, lastIndex)
    if (lastIndex > 0) {
      lastIndex--
    }

    return lastIndex
  }

  /**
   * Finds the index of max(x) <= target x in a list of data points
   * @param items vector of data points
   * @param xgetter Function that gets data point X coordinate.
   * @param targetX target x.
   * @param initialGuess initial guess index.
   * @returns index of x with max(x) <= target x or 0 if cannot find
   */
  public findWindowStartIndex<T>(
    items: T[],
    xgetter: (item: T) => number,
    targetX: number,
    initialGuess: number,
  ): number {
    let start = 0
    let nominalEnd = items.length - 1
    while (nominalEnd > 0 && isNaN(xgetter(items[nominalEnd]))) nominalEnd -= 1

    let end = nominalEnd
    let curGuess = Math.max(0, Math.min(end, initialGuess))

    const getX = (index: number): number => {
      while (index <= nominalEnd) {
        const guessX = xgetter(items[index])
        if (isNaN(guessX)) index += 1
        else return guessX
      }
      return xgetter(items[nominalEnd])
    }

    while (start < end) {
      const guessX = getX(curGuess)
      if (guessX === targetX) {
        start = curGuess
        break
      } else if (guessX > targetX) {
        end = curGuess - 1
      } else {
        start = curGuess
      }

      if (start >= end) {
        break
      }

      const endX = getX(end)
      const startX = getX(start)

      const m = (end - start + 1) / (endX - startX)

      curGuess = start + Math.round((targetX - startX) * m)
      curGuess = Math.max(start + 1, Math.min(curGuess, end))
    }

    while (start > 0 && xgetter(items[start]) > targetX) start -= 1

    return start
  }

  protected formatDefaultTrackerString(
    item: any,
    p?: DataPoint,
    addOtherArgs?: (args: TrackerStringFormatterArgs) => void,
  ): string | undefined {
    if (!this.trackerStringFormatter) return undefined
    const args = {
      item,
      title: this.title || '',
    } as TrackerStringFormatterArgs
    if (p) {
      args.xTitle = this.xAxis?.title ?? XYAxisSeries.defaultXAxisTitle
      args.xValue = this.xAxis?.getValue(p.x)
      args.yTitle = this.yAxis?.title ?? XYAxisSeries.defaultYAxisTitle
      args.yValue = this.yAxis?.getValue(p.y)
    }

    if (addOtherArgs) addOtherArgs(args)

    return this.trackerStringFormatter(args)
  }
}
