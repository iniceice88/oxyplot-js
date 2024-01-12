import type {
  CreateBarItemBaseOptions,
  CreateBarSeriesBaseOptions,
  IRenderContext,
  IStackableSeries,
  LabelStringFormatterType,
  ScreenPoint,
  TrackerStringFormatterArgs,
} from '@/oxyplot'
import {
  BarItemBase,
  BarSeriesBase,
  EdgeRenderingMode,
  LabelPlacement,
  newDataPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
  TrackerHitResult,
} from '@/oxyplot'
import { getOrDefault, Number_MAX_VALUE, Number_MIN_VALUE, removeUndef } from '@/patch'

export interface CreateIntervalBarItemOptions extends CreateBarItemBaseOptions {
  color?: OxyColor
  end?: number
  start?: number
  title?: string
}

/**
 * Represents an item in an IntervalBarSeries.
 */
export class IntervalBarItem extends BarItemBase {
  /**
   * The color.
   */
  public color: OxyColor

  /**
   * The end value.
   */
  public end: number = 0

  /**
   * The start value.
   */
  public start: number = 0

  /**
   * The title.
   */
  public title?: string

  /**
   * Initializes a new instance of the IntervalBarItem class.
   */
  constructor(opt?: CreateIntervalBarItemOptions) {
    super(opt)
    this.color = OxyColors.Automatic
    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }
}

export interface IntervalBarSeriesTrackerStringFormatterArgs extends TrackerStringFormatterArgs {
  readonly item?: IntervalBarItem
  readonly categoryTitle?: string
  readonly categoryValue?: string
  readonly valueTitle?: string
}

export type IntervalBarSeriesTrackerStringFormatterType = (
  args: IntervalBarSeriesTrackerStringFormatterArgs,
) => string | undefined

export interface CreateIntervalBarSeriesOptions extends CreateBarSeriesBaseOptions {
  colorField?: string
  endField?: string
  fillColor?: OxyColor
  startField?: string
  trackerStringFormatter?: IntervalBarSeriesTrackerStringFormatterType
}

/**
 * Represents a series for bar charts defined by to/from values.
 */
export class IntervalBarSeries extends BarSeriesBase<IntervalBarItem> implements IStackableSeries {
  /**
   * The default tracker format string
   */
  static readonly DefaultTrackerStringFormatter: IntervalBarSeriesTrackerStringFormatterType = (args) =>
    `${args.title}\n${args.categoryTitle}: ${args.categoryValue}\n${args.valueTitle}: ${args.item?.start} - ${args.item?.end}`

  /**
   * The default fill color.
   */
  private defaultFillColor: OxyColor = OxyColors.Undefined

  /**
   * Initializes a new instance of the IntervalBarSeries class.
   */
  constructor(opt?: CreateIntervalBarSeriesOptions) {
    super(opt)
    this.fillColor = OxyColors.Automatic
    this.strokeThickness = 1

    this.trackerStringFormatter = IntervalBarSeries.DefaultTrackerStringFormatter
    this.labelMargin = 4
    this.labelPlacement = LabelPlacement.Middle

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * A format string used for the tracker. The default depends on the series.
   * The arguments for the format string may be different for each type of series. See the documentation.
   */
  public trackerStringFormatter?: IntervalBarSeriesTrackerStringFormatterType

  /**
   * Gets the actual fill color.
   */
  get actualFillColor(): OxyColor {
    return this.fillColor.getActualColor(this.defaultFillColor)
  }

  /**
   * Gets or sets the color field.
   */
  colorField?: string

  /**
   * Gets or sets the color field.
   */
  endField?: string

  /**
   * Gets or sets the default color of the interior of the Maximum bars.
   */
  fillColor: OxyColor

  readonly isStacked = true

  readonly overlapsStack = true

  /**
   * Gets or sets the label format string.
   */
  labelStringFormatter: LabelStringFormatterType = (item: any, args: any[]) => `${args[0]} - ${args[1]}`

  /**
   * Gets the stack group.
   */
  readonly stackGroup = ''

  /**
   * Gets or sets the color field.
   */
  startField?: string

  /**
   * Gets or sets the actual rectangles for the maximum bars.
   */
  protected actualBarRectangles: OxyRect[] = []

  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    for (let i = 0; i < this.actualBarRectangles.length; i++) {
      const r = this.actualBarRectangles[i]
      if (!r.containsPoint(point)) {
        continue
      }

      const item = this.getItem(this.validItemsIndexInversion.get(i)!) as IntervalBarItem
      const categoryIndex = item.getCategoryIndex(i)
      const value = (this.validItems[i].start + this.validItems[i].end) / 2
      const dp = newDataPoint(categoryIndex, value)
      const categoryAxis = this.getCategoryAxis()
      const valueAxis = this.xAxis!
      const text = this.trackerStringFormatter!({
        item,
        title: this.title,
        categoryTitle: categoryAxis.title ?? BarSeriesBase.DefaultCategoryAxisTitle,
        categoryValue: categoryAxis.formatValue(categoryIndex),
        valueTitle: valueAxis.title ?? BarSeriesBase.DefaultValueAxisTitle,
      })

      return new TrackerHitResult({
        series: this,
        dataPoint: dp,
        position: point,
        item: item,
        index: i,
        text: text,
      })
    }

    return undefined
  }

  /**
   * Renders the legend on the specified rendering context.
   * @param rc The rendering context.
   * @param legendBox The bounding box of the legend.
   */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const xmid = (legendBox.left + legendBox.right) / 2
    const ymid = (legendBox.top + legendBox.bottom) / 2
    const height = (legendBox.bottom - legendBox.top) * 0.8
    const width = height
    await rc.drawRectangle(
      new OxyRect(xmid - 0.5 * width, ymid - 0.5 * height, width, height),
      this.getSelectableFillColor(this.actualFillColor),
      this.strokeColor,
      this.strokeThickness,
      this.edgeRenderingMode,
    )
  }

  /**
   * Sets the default values.
   * @internal
   */
  setDefaultValues(): void {
    if (this.fillColor.isAutomatic()) {
      this.defaultFillColor = this.plotModel.getDefaultColor()
    }
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()

    if (this.validItems.length === 0) {
      return
    }

    let minValue = Number_MAX_VALUE
    let maxValue = Number_MIN_VALUE

    for (const item of this.validItems) {
      minValue = Math.min(minValue, item.start)
      minValue = Math.min(minValue, item.end)
      maxValue = Math.max(maxValue, item.start)
      maxValue = Math.max(maxValue, item.end)
    }

    this.minX = minValue
    this.maxX = maxValue
  }

  /**
   * Checks if the provided item is valid.
   * @param item The item to check.
   * @returns True if the item is valid, otherwise false.
   */
  protected isValid(item: IntervalBarItem): boolean {
    return this.xAxis!.isValidValue(item.start) && this.xAxis!.isValidValue(item.end)
  }

  /**
   * Renders the series on the specified rendering context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    this.actualBarRectangles = []

    if (this.validItems.length === 0) {
      return
    }

    const actualBarWidth = this.getActualBarWidth()
    const stackIndex = this.manager!.getStackIndex(this.stackGroup)
    const transform = PlotElementExtensions.transform

    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )

    for (let i = 0; i < this.validItems.length; i++) {
      const item = this.validItems[i]

      const categoryIndex = item.getCategoryIndex(i)
      const categoryValue = this.manager!.getCategoryValue(categoryIndex, stackIndex, actualBarWidth)

      const p0 = transform(this, item.start, categoryValue)
      const p1 = transform(this, item.end, categoryValue + actualBarWidth)

      const rectangle = OxyRect.fromScreenPoints(p0, p1)

      this.actualBarRectangles.push(rectangle)

      await rc.drawRectangle(
        rectangle,
        this.getSelectableFillColor(item.color.getActualColor(this.actualFillColor)),
        this.strokeColor,
        this.strokeThickness,
        actualEdgeRenderingMode,
      )

      if (this.labelStringFormatter) {
        await this.renderLabel(
          rc,
          this.getItem(i) as IntervalBarItem,
          item.start,
          item.end,
          categoryValue,
          categoryValue + actualBarWidth,
          this.labelStringFormatter,
        )
      }
    }
  }

  /**
   * Updates from data fields.
   */
  protected updateFromDataFields(): boolean {
    if (!this.startField || !this.endField) {
      return false
    }

    if (!this.itemsSource) return false
    for (const item of this.itemsSource) {
      const start = getOrDefault(item, this.startField, NaN)
      const end = getOrDefault(item, this.endField, NaN)
      const color = getOrDefault(item, this.colorField, OxyColors.Automatic)
      this.itemsSourceItems?.push(new IntervalBarItem({ start, end, color }))
    }

    return true
  }
}
