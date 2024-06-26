import {
  Axis,
  ColorAxisExtensions,
  type CreateXYAxisSeriesOptions,
  type DataPoint,
  DataPoint_isUnDefined,
  EdgeRenderingMode,
  ExtendedDefaultXYAxisSeriesOptions,
  HorizontalAlignment,
  type IColorAxis,
  type IRenderContext,
  type LabelStringFormatterType,
  newOxyRect,
  type OxyColor,
  OxyColors,
  type OxyRect,
  OxyRectHelper,
  RenderingExtensions,
  type ScreenPoint,
  ScreenPointHelper,
  toColorAxis,
  TrackerHitResult,
  type TrackerStringFormatterType,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'

import { assignMethod, assignObject, isInfinity, maxValueOfArray, minValueOfArray } from '@/patch'

export interface PolygonItem {
  outlines: DataPoint[][]
  value: number
  bounds: OxyRect[]
}

export interface CreatePolygonSeriesOptions extends CreateXYAxisSeriesOptions {
  stroke?: OxyColor
  strokeThickness?: number
  items?: PolygonItem[]
  mapping?: (item: any) => PolygonItem
  colorAxisKey?: string
  labelFontSize?: number
  labelStringFormatter?: LabelStringFormatterType
}

const DefaultPolygonSeriesOptions: CreatePolygonSeriesOptions = {
  stroke: OxyColors.Undefined,
  strokeThickness: 2,
  labelFontSize: 0,

  items: undefined,
  mapping: undefined,
  colorAxisKey: undefined,
  labelStringFormatter: undefined,
}

export const ExtendedDefaultPolygonSeriesOptions = {
  ...ExtendedDefaultXYAxisSeriesOptions,
  ...DefaultPolygonSeriesOptions,
}

/**
 * Represents a series that can be bound to a collection of PolygonItem.
 */
export class PolygonSeries extends XYAxisSeries {
  /**
   * The default tracker formatter
   */
  private static readonly defaultTrackerStringFormatter: TrackerStringFormatterType = function (args) {
    return `${args.title}\n${args.xTitle}: ${args.xValue}\n${args.yTitle}: ${args.yValue}\n${args.colorAxisTitle}: ${args.item.value}`
  }

  /** The default color-axis title */
  private static readonly _defaultColorAxisTitle = 'Value'

  /**
   * The items originating from the items source.
   */
  private _actualItems: PolygonItem[] = []

  /** Gets the list of Polygons that should be rendered. */
  get actualItems(): PolygonItem[] {
    return this.itemsSource ? this._actualItems : this.items
  }

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

  private _colorAxis?: IColorAxis
  /**
   * Gets the color axis.
   */
  get colorAxis() {
    return this._colorAxis
  }

  /**
   * Gets or sets the color axis key.
   */
  public colorAxisKey?: string
  /**
   * Gets or sets the formatter for the cell labels. The default value is `0.00`.
   *
   * The label formatter is only used when `LabelFontSize` is greater than 0.
   */
  public labelStringFormatter: LabelStringFormatterType = (item: PolygonItem, args: any[]) => item.value.toFixed(2)
  /**
   * Gets or sets the font size of the labels. The default value is 0 (labels not visible).
   *
   * The font size is relative to the cell height.
   */
  public labelFontSize: number = DefaultPolygonSeriesOptions.labelFontSize!
  /**
   * Gets or sets the delegate used to map from `ItemsSource` to `PolygonItem`. The default is `null`.
   */
  public mapping?: (item: any) => PolygonItem
  /**
   * Gets or sets the list of Polygons.
   *
   * This list is used if `ItemsSource` is not set.
   */
  public items: PolygonItem[] = []
  /**
   * Gets or sets the stroke. The default is `OxyColors.Undefined`.
   */
  public stroke: OxyColor = DefaultPolygonSeriesOptions.stroke!
  /**
   * Gets or sets the stroke thickness. The default is 2.
   */
  public strokeThickness: number = DefaultPolygonSeriesOptions.strokeThickness!

  constructor(opt?: CreatePolygonSeriesOptions) {
    super(opt)

    this.trackerStringFormatter = PolygonSeries.defaultTrackerStringFormatter
    assignMethod(this, 'trackerStringFormatter', opt)

    assignMethod(this, 'labelStringFormatter', opt)

    assignObject(this, DefaultPolygonSeriesOptions, opt, {
      exclude: ['trackerStringFormatter', 'labelStringFormatter'],
    })
  }

  getElementName() {
    return 'PolygonSeries'
  }

  /**
   * Renders the series on the specified rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    this.verifyAxes()
    await this.renderPolygons(rc, this.actualItems)
  }

  /**
   * Updates the data.
   * @internal
   */
  public updateData(): void {
    if (!this.itemsSource) {
      return
    }

    this.updateActualItems()
  }

  /**
   * Gets the item at the specified index.
   *
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
   * Clears or creates the `actualItems` list.
   */
  private clearActualItems(): void {
    if (this._actualItems) {
      this._actualItems.length = 0
    }
    this._actualItems = []
  }

  /**
   * Updates the points from the `ItemsSource`.
   */
  private updateActualItems(): void {
    this.clearActualItems()
    for (const item of this.itemsSource || []) {
      if (isPolygonItem(item)) {
        this._actualItems.push(item)
        continue
      }
      if (this.mapping) {
        this._actualItems.push(this.mapping(item))
        continue
      }
      throw new Error('Invalid item')
    }
  }

  /**
   * Renders the points as line, broken line and markers.
   */
  protected async renderPolygons(rc: IRenderContext, items: PolygonItem[]) {
    const screenPointOutline: ScreenPoint[] = []

    for (const item of items) {
      const polyColor = ColorAxisExtensions.getColor(this.colorAxis!, item.value)

      const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
        this.edgeRenderingMode,
        EdgeRenderingMode.PreferSharpness,
      )

      for (const outline of item.outlines) {
        screenPointOutline.length = 0
        screenPointOutline.push(...outline.map((x) => this.transform(x)))

        await rc.drawPolygon(screenPointOutline, polyColor, this.stroke, this.strokeThickness, actualEdgeRenderingMode)

        if (this.labelFontSize > 0) {
          const text = this.labelStringFormatter(item, [])
          await rc.drawText(
            ScreenPointHelper.getCentroid(screenPointOutline),
            text,
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
  }

  /**
   * Gets the point on the series that is nearest the specified point.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    const p = this.inverseTransform(point)

    if (!this.isPointInRange(p)) {
      return undefined
    }

    const colorAxis = this.colorAxis as unknown as Axis
    const colorAxisTitle = colorAxis?.title ?? PolygonSeries._defaultColorAxisTitle

    const screenPointOutline: ScreenPoint[] = []

    const actualItems = this.actualItems
    if (!actualItems) {
      return undefined
    }

    for (const item of actualItems) {
      for (let i = 0; i < item.outlines.length; i++) {
        const bounds = item.bounds[i]
        if (!OxyRectHelper.contains(bounds, p.x, p.y)) {
          continue
        }

        screenPointOutline.length = 0
        screenPointOutline.push(...item.outlines[i].map((p) => this.transform(p)))

        if (ScreenPointHelper.isPointInPolygon(point, screenPointOutline)) {
          const text = super.formatDefaultTrackerString(item, p, (args) => {
            args.colorAxisTitle = colorAxisTitle
          })
          return new TrackerHitResult({
            series: this,
            dataPoint: p,
            position: point,
            item,
            index: -1,
            text,
          })
        }
      }
    }

    return undefined
  }

  /**
   * Ensures that the axes of the series is defined.
   * @internal
   */
  public ensureAxes(): void {
    super.ensureAxes()

    this._colorAxis = this.colorAxisKey
      ? toColorAxis(this.plotModel.getAxis(this.colorAxisKey))
      : toColorAxis(this.plotModel.defaultColorAxis)
  }

  /**
   * Updates the maximum and minimum values of the series for the x and y dimensions only.
   * @internal
   */
  public updateMaxMin(): void {
    super.updateMaxMin()

    this.updateMaxMinXY()
    const actualItems = this.actualItems

    if (actualItems && actualItems.length > 0) {
      this._minValue = minValueOfArray(actualItems.map((r) => r.value))
      this._maxValue = maxValueOfArray(actualItems.map((r) => r.value))
    }
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  public updateAxisMaxMin(): void {
    super.updateAxisMaxMin()
    const colorAxis = this.colorAxis as unknown as Axis
    if (colorAxis) {
      colorAxis.include(this.minValue)
      colorAxis.include(this.maxValue)
    }
  }

  /**
   * Updates the axes to include the max and min of this series.
   * @internal
   */
  public updateMaxMinXY(): void {
    const actualItems = this.actualItems
    if (actualItems && actualItems.length > 0) {
      const bounds = actualItems.flatMap((p) => p.bounds)
      this.minX = minValueOfArray(bounds.map((b) => b.left))
      this.maxX = maxValueOfArray(bounds.map((b) => OxyRectHelper.right(b)))
      this.minY = minValueOfArray(bounds.map((b) => b.top))
      this.maxY = maxValueOfArray(bounds.map((b) => OxyRectHelper.bottom(b)))
    }
  }

  /**
   * Tests if a `DataPoint` is inside the heat map.
   */
  private isPointInRange(p: DataPoint): boolean {
    this.updateMaxMinXY()

    return p.x >= this.minX && p.x <= this.maxX && p.y >= this.minY && p.y <= this.maxY
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultPolygonSeriesOptions
  }
}

export function newPolygonItem(outlines: DataPoint[] | DataPoint[][], value: number): PolygonItem {
  if (!outlines || outlines.length === 0) {
    throw new Error('Outlines does not contain any sub-polygons.')
  }

  if (!Array.isArray(outlines[0])) {
    outlines = [outlines as DataPoint[]]
  }

  const outlineArrs = (outlines as DataPoint[][]).map((outline) => outline.slice())

  for (const outline of outlineArrs) {
    for (const p of outline) {
      if (DataPoint_isUnDefined(p) || isInfinity(p.x) || isInfinity(p.y)) {
        throw new Error('Outline contains non-finite elements.')
      }
    }
  }

  const bounds = outlineArrs.map((outline) => computeBounds(outline))

  return {
    outlines: outlineArrs,
    value,
    bounds,
  }
}

function computeBounds(outline: DataPoint[]): OxyRect {
  let minx = outline[0].x
  let miny = outline[0].y
  let maxx = outline[0].x
  let maxy = outline[0].y

  for (let i = 1; i < outline.length; i++) {
    minx = Math.min(minx, outline[i].x)
    miny = Math.min(miny, outline[i].y)
    maxx = Math.max(maxx, outline[i].x)
    maxy = Math.max(maxy, outline[i].y)
  }

  return newOxyRect(minx, miny, maxx - minx, maxy - miny)
}

function isPolygonItem(obj: any): obj is PolygonItem {
  return obj && obj.outlines && obj.value && obj.bounds
}
