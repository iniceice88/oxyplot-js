import {
  Axis,
  type CreateXYAxisSeriesOptions,
  HorizontalAlignment,
  type IColorAxis,
  type IRenderContext,
  type LabelStringFormatterType,
  MarkerType,
  newDataPoint, newScreenPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  RenderingExtensions,
  ScreenPoint,
  screenPointPlus,
  ScreenVector,
  TrackerHitResult,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'
import {
  getOrDefault,
  isInfinity,
  isNullOrUndef,
  isUndef,
  Number_MAX_VALUE,
  Number_MIN_VALUE,
  removeUndef,
} from '@/patch'

/**
 * Represents a point in a ScatterSeries.
 */
export interface ScatterPoint {
  readonly x: number
  readonly y: number
  readonly size?: number
  readonly value?: number
  readonly tag?: any
}

/**
 * Defines functionality to provide a ScatterPoint.
 */
export interface IScatterPointProvider {
  /**
   * Gets the ScatterPoint that represents the element.
   * @returns A ScatterPoint.
   */
  getScatterPoint(): ScatterPoint
}

export function isScatterPointProvider(obj: any): obj is IScatterPointProvider {
  return obj && typeof obj.getScatterPoint === 'function'
}

export interface CreateCreateXYAxisSeriesOptions extends CreateXYAxisSeriesOptions {
  dataFieldValue?: string
  dataFieldSize?: string
  dataFieldTag?: string
  dataFieldX?: string
  dataFieldY?: string
  mapping?: (item: any) => ScatterPoint
  markerFill?: OxyColor
  markerSize?: number
  markerStroke?: OxyColor
  markerStrokeThickness?: number
  markerType?: MarkerType
  labelMargin?: number
  labelStringFormatter?: LabelStringFormatterType
  colorAxisKey?: string
  binSize?: number
}

/**
 * Provides a base class for scatter series.
 */
export class ScatterSeries extends XYAxisSeries {
  /** The default color-axis title */
  private static readonly defaultColorAxisTitle = 'Value'

  /** The list of data points. */
  private readonly _points: ScatterPoint[] = []

  /** The default fill color. */
  private defaultMarkerFillColor: OxyColor = OxyColors.Undefined

  /** The marker fill color. If undefined, this color will be automatically set. */
  markerFill: OxyColor = OxyColors.Automatic

  /** Gets or sets the custom marker outline polygon. Set MarkerType to T:MarkerType.Custom to use this. */
  markerOutline?: ScreenPoint[]

  /** The size of the marker (same size for all items). */
  markerSize: number = 5

  /** The type of the marker. */
  markerType: MarkerType = MarkerType.Square

  /** The marker stroke. */
  markerStroke: OxyColor = OxyColors.Automatic

  /** Thickness of the marker strokes. */
  markerStrokeThickness: number = 1

  /** The label format string. The default is undefined (no labels). */
  labelStringFormatter?: LabelStringFormatterType

  /** The label margins. The default is 6. */
  labelMargin: number = 6

  /** The size of the 'binning' feature. */
  binSize: number = 0

  /** The color axis key. */
  colorAxisKey?: string

  /** The name of the property that specifies X coordinates in the ItemsSource elements. */
  dataFieldX?: string

  /** The name of the property that specifies Y coordinates in the ItemsSource elements. */
  dataFieldY?: string

  /** The name of the property that specifies the size in the ItemsSource elements. */
  dataFieldSize?: string

  /** The name of the property that specifies the tag in the ItemsSource elements. */
  dataFieldTag?: string

  /** The name of the property that specifies the color value in the ItemsSource elements. */
  dataFieldValue?: string

  /** A function that maps from elements in the ItemsSource to ScatterPoint points to be rendered. */
  mapping?: (item: any) => ScatterPoint

  /** The actual color axis. */
  colorAxis?: IColorAxis

  /** The data points from the items source. */
  protected itemsSourcePoints?: ScatterPoint[]

  /** The actual fill color. */
  get actualMarkerFillColor(): OxyColor {
    return this.markerFill.getActualColor(this.defaultMarkerFillColor)
  }

  /** The list of points. */
  get points(): ScatterPoint[] {
    return this._points
  }

  /** The actual points. */
  get actualPoints(): ScatterPoint[] {
    return (this.itemsSource ? this.itemsSourcePoints : this.points)!
  }

  /** The maximum value of the points. */
  maxValue: number = 0

  /** The minimum value of the points. */
  minValue: number = 0

  /**
   * Initializes a new instance of the ScatterSeries class.
   * @protected
   */
  constructor(opt?: CreateCreateXYAxisSeriesOptions) {
    super(opt)
    this.markerFill = OxyColors.Automatic
    this.markerSize = 5
    this.markerType = MarkerType.Square
    this.markerStroke = OxyColors.Automatic
    this.markerStrokeThickness = 1
    this.labelMargin = 6

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /** Gets the nearest point. */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (!this.xAxis || !this.yAxis) {
      return undefined
    }

    if (interpolate) {
      return undefined
    }

    const actualPoints = this.actualPoints
    if (!actualPoints || actualPoints.length === 0) {
      return undefined
    }

    let result: TrackerHitResult | undefined = undefined
    let minimumDistance = Number_MAX_VALUE
    let i = 0

    const colorAxisTitle = this.colorAxis
      ? (this.colorAxis as unknown as Axis).title
      : undefined ?? ScatterSeries.defaultColorAxisTitle

    const xmin = this.xAxis!.clipMinimum
    const xmax = this.xAxis!.clipMaximum
    const ymin = this.yAxis!.clipMinimum
    const ymax = this.yAxis!.clipMaximum
    for (const p of actualPoints) {
      if (p.x < xmin || p.x > xmax || p.y < ymin || p.y > ymax) {
        i++
        continue
      }

      const sp = this.transform(newDataPoint(p.x, p.y))
      const dx = sp.x - point.x
      const dy = sp.y - point.y
      const d2 = dx * dx + dy * dy

      if (d2 < minimumDistance) {
        const item = this.getItem(i) ?? p

        let zValue: number | undefined = undefined

        if (!isNullOrUndef(p.value) && !isNaN(p.value) && !isInfinity(p.value)) {
          zValue = p.value
        }

        const dataPoint = newDataPoint(p.x, p.y)
        result = new TrackerHitResult({
          series: this,
          dataPoint,
          position: sp,
          item: item,
          index: i,
          text: this.formatDefaultTrackerString(item, dataPoint, (args) => {
            args.colorAxisTitle = colorAxisTitle
            args.zValue = zValue
          }),
        })

        minimumDistance = d2
      }

      i++
    }

    return result
  }

  /** Render the scatter series */
  public async render(rc: IRenderContext): Promise<void> {
    const actualPoints = this.actualPoints
    if (!actualPoints || actualPoints.length === 0) {
      return
    }

    const clippingRect = this.getClippingRect()

    const n = actualPoints.length
    const allPoints: ScreenPoint[] = []
    const allMarkerSizes: number[] = []
    const selectedPoints: ScreenPoint[] = []
    const selectedMarkerSizes: number[] = []
    const groupPoints: Map<number, ScreenPoint[]> = new Map()
    const groupSizes: Map<number, number[]> = new Map()

    // check if any item of the series is selected
    const isSelected = this.isSelected()

    // Transform all points to screen coordinates
    for (let i = 0; i < n; i++) {
      const dp = newDataPoint(actualPoints[i].x, actualPoints[i].y)

      // Skip invalid points
      if (!this.isValidPoint(dp)) {
        continue
      }

      let size = NaN
      let value = NaN

      const scatterPoint = actualPoints[i]
      if (scatterPoint) {
        if (!isNullOrUndef(scatterPoint.size)) size = scatterPoint.size
        if (!isNullOrUndef(scatterPoint.value)) value = scatterPoint.value
      }

      if (isNaN(size)) {
        size = this.markerSize
      }

      // Transform from data to screen coordinates
      const screenPoint = this.transform(newDataPoint(dp.x, dp.y))

      if (isSelected && this.isItemSelected(i)) {
        selectedPoints.push(screenPoint)
        selectedMarkerSizes.push(size)
        continue
      }

      if (this.colorAxis) {
        if (isNaN(value)) {
          // The value is not defined, skip this point.
          continue
        }

        const group = this.colorAxis.getPaletteIndex(value)
        if (!groupPoints.has(group)) {
          groupPoints.set(group, [])
          groupSizes.set(group, [])
        }

        groupPoints.get(group)!.push(screenPoint)
        groupSizes.get(group)!.push(size)
      } else {
        allPoints.push(screenPoint)
        allMarkerSizes.push(size)
      }
    }

    // Offset of the bins
    const binOffset = this.transform(newDataPoint(this.minX, this.maxY))

    if (this.colorAxis) {
      // Draw the grouped (by color defined in ColorAxis) markers
      const markerIsStrokedOnly =
        this.markerType === MarkerType.Plus ||
        this.markerType === MarkerType.Star ||
        this.markerType === MarkerType.Cross

      for (const [group, value] of groupPoints) {
        const color = this.colorAxis!.getColor(group)
        await RenderingExtensions.drawMarkers(
          rc,
          value,
          this.markerType,
          this.markerOutline,
          groupSizes.get(group)!,
          this.markerFill.getActualColor(color),
          markerIsStrokedOnly ? color : this.markerStroke,
          this.markerStrokeThickness,
          this.edgeRenderingMode,
          this.binSize,
          binOffset,
        )
      }
    }

    // Draw unselected markers
    await RenderingExtensions.drawMarkers(
      rc,
      allPoints,
      this.markerType,
      this.markerOutline,
      allMarkerSizes,
      this.actualMarkerFillColor,
      this.markerStroke,
      this.markerStrokeThickness,
      this.edgeRenderingMode,
      this.binSize,
      binOffset,
    )

    // Draw the selected markers
    await RenderingExtensions.drawMarkers(
      rc,
      selectedPoints,
      this.markerType,
      this.markerOutline,
      selectedMarkerSizes,
      this.plotModel.selectionColor,
      this.plotModel.selectionColor,
      this.markerStrokeThickness,
      this.edgeRenderingMode,
      this.binSize,
      binOffset,
    )

    if (this.labelStringFormatter) {
      // render point labels (not optimized for performance)
      await this.renderPointLabels(rc, clippingRect)
    }
  }

  /** Renders the legend symbol for the line series on the specified rendering context. */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const xmid = (legendBox.left + legendBox.right) / 2
    const ymid = (legendBox.top + legendBox.bottom) / 2

    const midpt = newScreenPoint(xmid, ymid)

    await RenderingExtensions.drawMarker(
      rc,
      midpt,
      this.markerType,
      this.markerOutline,
      this.markerSize,
      this.isSelected() ? this.plotModel.selectionColor : this.actualMarkerFillColor,
      this.isSelected() ? this.plotModel.selectionColor : this.markerStroke,
      this.markerStrokeThickness,
      this.edgeRenderingMode,
    )
  }

  /**
   * Ensures that the axes of the series is defined.
   * @internal
   */
  ensureAxes(): void {
    super.ensureAxes()

    this.colorAxis = (
      this.colorAxisKey ? this.plotModel.getAxis(this.colorAxisKey) : this.plotModel.defaultColorAxis
    ) as IColorAxis
  }

  /**
   * Sets the default values.
   * @internal
   */
  setDefaultValues(): void {
    if (this.markerFill.isAutomatic()) {
      this.defaultMarkerFillColor = this.plotModel.getDefaultColor()
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

    this.updateItemsSourcePoints()
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   * */
  updateMaxMin(): void {
    super.updateMaxMin()
    this.internalUpdateMaxMinValue(this.actualPoints)
  }

  /**
   * Renders the point labels.
   * @param rc The render context.
   * @param clippingRect The clipping rectangle.
   */
  protected async renderPointLabels(rc: IRenderContext, clippingRect: OxyRect): Promise<void> {
    const actualPoints = this.actualPoints
    if (!actualPoints || actualPoints.length === 0) {
      return
    }

    let index = -1
    for (const point of actualPoints) {
      index++
      const dataPoint = newDataPoint(point.x, point.y)
      if (!this.isValidPoint(dataPoint)) {
        continue
      }

      const pt = screenPointPlus(this.transform(dataPoint), new ScreenVector(0, -this.labelMargin))

      if (!clippingRect.containsPoint(pt)) {
        continue
      }

      const item = this.getItem(index)
      const s = this.labelStringFormatter!(item, [point.x, point.y])

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
   * Updates the Max/Min limits from the values in the specified point list.
   * @param pts The points.
   */
  protected internalUpdateMaxMinValue(pts: ScatterPoint[]): void {
    if (!pts || pts.length === 0) {
      return
    }

    let minx = Number_MAX_VALUE
    let miny = Number_MAX_VALUE
    let minvalue = Number_MAX_VALUE
    let maxx = Number_MIN_VALUE
    let maxy = Number_MIN_VALUE
    let maxvalue = Number_MIN_VALUE

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

    if (isNaN(minvalue)) {
      minvalue = Number_MIN_VALUE
    }

    if (isNaN(maxvalue)) {
      maxvalue = Number_MIN_VALUE
    }

    for (const pt of pts) {
      const x = pt.x
      const y = pt.y

      // Check if the point is defined (the code below is faster than isNaN)
      if (x !== x || y !== y) {
        continue
      }

      const value = !isNullOrUndef(pt.value) ? pt.value : Number.NaN

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

      if (value < minvalue) {
        minvalue = value
      }

      if (value > maxvalue) {
        maxvalue = value
      }
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

    if (minvalue < Number_MAX_VALUE) {
      this.minValue = minvalue
    }

    if (maxvalue > Number_MIN_VALUE) {
      this.maxValue = maxvalue
    }

    if (this.colorAxis instanceof Axis) {
      this.colorAxis.include(this.minValue)
      this.colorAxis.include(this.maxValue)
    }
  }

  /**
   * Clears or creates the itemsSourcePoints list.
   */
  protected clearItemsSourcePoints(): void {
    if (this.itemsSourcePoints) this.itemsSourcePoints.length = 0
  }

  /**
   * Updates the points from the ItemsSource.
   */
  private updateItemsSourcePoints(): void {
    this.clearItemsSourcePoints()

    // Use the mapping property to generate the points
    if (this.mapping) {
      if (!this.itemsSource) {
        throw new Error('itemsSource is required when mapping is set')
      }

      this.itemsSourcePoints = this.itemsSourcePoints || []

      for (const item of this.itemsSource) {
        this.itemsSourcePoints.push(this.mapping(item))
      }
      return
    }

    this.itemsSourcePoints = this.itemsSourcePoints || []

    for (const item of this.itemsSource || []) {
      if (isNullOrUndef(item)) continue
      if (!isUndef(item.x) && !isUndef(item.y)) {
        this.itemsSourcePoints?.push(item)
        continue
      }
      if (this.dataFieldX && this.dataFieldY) {
        const actualItem = this.updateFromDataFields(item)
        if (!actualItem) continue
        this.itemsSourcePoints?.push(actualItem)
        continue
      }

      if (isScatterPointProvider(item)) {
        const actualItem = item.getScatterPoint()
        if (!actualItem) continue
        this.itemsSourcePoints?.push(actualItem)
        continue
      }

      throw new Error('Invalid item type')
    }
  }

  /**
   * Updates the itemsSourcePoints from the ItemsSource and data fields.
   */
  protected updateFromDataFields(item: any): ScatterPoint {
    const x = getOrDefault(item, this.dataFieldX, Number.NaN)
    const y = getOrDefault(item, this.dataFieldY, Number.NaN)
    return {
      x,
      y,
      size: getOrDefault(item, this.dataFieldSize, Number.NaN),
      value: getOrDefault(item, this.dataFieldValue, Number.NaN),
      tag: getOrDefault(item, this.dataFieldTag, undefined),
    } as ScatterPoint
  }
}
