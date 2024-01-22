import type {
  CreateBarItemOptions,
  CreateBarSeriesBaseOptions,
  IRenderContext,
  LabelStringFormatterType,
  ScreenPoint,
  TrackerStringFormatterType,
} from '@/oxyplot'
import {
  BarItemBase,
  BarSeriesBase,
  EdgeRenderingMode,
  newDataPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
  TrackerHitResult,
} from '@/oxyplot'
import { getOrDefault, Number_MAX_VALUE, Number_MIN_VALUE, removeUndef } from '@/patch'

export interface CreateTornadoBarItemOptions extends CreateBarItemOptions {
  baseValue?: number
  maximum?: number
  maximumColor?: OxyColor
  minimum?: number
  minimumColor?: OxyColor
}

/**
 * Represents an item for the TornadoBarSeries.
 */
export class TornadoBarItem extends BarItemBase {
  /**
   * The base value.
   */
  public baseValue: number

  /**
   * The maximum value.
   */
  public maximum: number

  /**
   * The color for the maximum bar.
   */
  public maximumColor: OxyColor

  /**
   * The minimum value.
   */
  public minimum: number

  /**
   * The color for the minimum bar.
   */
  public minimumColor: OxyColor

  /**
   * Initializes a new instance of the TornadoBarItem class.
   */
  constructor(opt?: CreateTornadoBarItemOptions) {
    super(opt)
    this.minimum = NaN
    this.maximum = NaN
    this.baseValue = NaN
    this.minimumColor = OxyColors.Automatic
    this.maximumColor = OxyColors.Automatic

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }
}

export interface CreateTornadoBarSeriesOptions extends CreateBarSeriesBaseOptions {
  baseField?: string
  baseValue?: number
  maximumColorField?: string
  maximumField?: string
  maximumFillColor?: OxyColor
  maximumLabelStringFormatter?: LabelStringFormatterType
  minimumColorField?: string
  minimumField?: string
  minimumFillColor?: OxyColor
  minimumLabelStringFormatter?: LabelStringFormatterType
  actualMaximumBarRectangles?: OxyRect[]
  actualMinimumBarRectangles?: OxyRect[]
}

/**
 * Represents a series that can be used to create tornado plots.
 * See http://en.wikipedia.org/wiki/Tornado_diagram.
 */
export class TornadoBarSeries extends BarSeriesBase<TornadoBarItem> {
  /**
   * The default tracker formatter
   */
  public static readonly defaultTrackerStringFormatter: TrackerStringFormatterType = (args) =>
    `${args.title || ''}\n${args.yTitle}: ${args.yValue}\n${args.xTitle}: ${args.xValue}`

  /**
   * The default fill color.
   */
  private defaultMaximumFillColor: OxyColor = OxyColors.Undefined

  /**
   * The default minimum fill color.
   */
  private defaultMinimumFillColor: OxyColor = OxyColors.Undefined

  /**
   * Initializes a new instance of the TornadoBarSeries class.
   */
  constructor(opt?: CreateTornadoBarSeriesOptions) {
    super(opt)
    this.maximumFillColor = OxyColor.fromRgb(216, 82, 85)
    this.minimumFillColor = OxyColor.fromRgb(84, 138, 209)

    this.strokeColor = OxyColors.Black
    this.strokeThickness = 1

    this.trackerStringFormatter = TornadoBarSeries.defaultTrackerStringFormatter
    this.labelMargin = 4

    this.minimumLabelStringFormatter = (item, args) => args[0].toString()
    this.maximumLabelStringFormatter = (item, args) => args[0].toString()

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets the actual fill color.
   */
  get actualMaximumFillColor(): OxyColor {
    return this.maximumFillColor.getActualColor(this.defaultMaximumFillColor)
  }

  /**
   * Gets the actual minimum fill color.
   */
  get actualMinimumFillColor(): OxyColor {
    return this.minimumFillColor.getActualColor(this.defaultMinimumFillColor)
  }

  /**
   * Gets or sets the color field.
   */
  baseField?: string

  /**
   * Gets or sets the base value.
   */
  baseValue: number = NaN

  /**
   * Gets or sets the color field.
   */
  maximumColorField?: string

  /**
   * Gets or sets the color field.
   */
  maximumField?: string

  /**
   * Gets or sets the color of the interior of the Maximum bars.
   */
  maximumFillColor: OxyColor

  /**
   * Gets or sets the formatter for the maximum labels.
   */
  maximumLabelStringFormatter: LabelStringFormatterType

  /**
   * Gets or sets the color field.
   */
  minimumColorField?: string

  /**
   * Gets or sets the color field.
   */
  minimumField?: string

  /**
   * Gets or sets the default color of the interior of the Minimum bars.
   */
  minimumFillColor: OxyColor

  /**
   * Gets or sets the formatter for the minimum labels.
   */
  minimumLabelStringFormatter: LabelStringFormatterType

  /**
   * Gets or sets the actual rectangles for the maximum bars.
   */
  protected actualMaximumBarRectangles: OxyRect[] = []

  /**
   * Gets or sets the actual rectangles for the minimum bars.
   */
  protected actualMinimumBarRectangles: OxyRect[] = []

  /**
   * Gets the nearest point.
   * @param point The point.
   * @param interpolate Whether to interpolate.
   * @returns The nearest point.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    for (let i = 0; i < this.actualMinimumBarRectangles.length; i++) {
      const insideMinimumRectangle = this.actualMinimumBarRectangles[i].containsPoint(point)
      const insideMaximumRectangle = this.actualMaximumBarRectangles[i].containsPoint(point)
      if (insideMinimumRectangle || insideMaximumRectangle) {
        const item = this.getItem(this.validItemsIndexInversion.get(i)!) as TornadoBarItem
        const categoryIndex = item.getCategoryIndex(i)
        const value = insideMaximumRectangle ? this.validItems[i].maximum : this.validItems[i].minimum
        const dp = newDataPoint(categoryIndex, value)
        const categoryAxis = this.getCategoryAxis()
        const text = this.trackerStringFormatter!({
          item,
          title: this.title,
          yTitle: categoryAxis.title ?? BarSeriesBase.DefaultCategoryAxisTitle,
          yValue: categoryAxis.formatValue(categoryIndex),
          xTitle: this.xAxis!.title ?? BarSeriesBase.DefaultValueAxisTitle,
          xValue: this.xAxis!.getValue(value),
        })
        return new TrackerHitResult({
          series: this,
          dataPoint: dp,
          position: point,
          item: item,
          index: i,
          text,
        })
      }
    }

    return undefined
  }

  /**
   * Renders the series on the specified render context.
   * @param rc The render context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    this.actualMinimumBarRectangles = []
    this.actualMaximumBarRectangles = []

    if (this.validItems.length === 0) {
      return
    }

    const actualBarWidth = this.getActualBarWidth()

    for (let i = 0; i < this.validItems.length; i++) {
      const item = this.validItems[i]

      const categoryIndex = item.getCategoryIndex(i)

      const baseValue = isNaN(item.baseValue) ? this.baseValue : item.baseValue
      const barOffset = this.manager!.getCurrentBarOffset(categoryIndex)
      const barStart = categoryIndex - 0.5 + barOffset
      const barEnd = barStart + actualBarWidth

      const transform = PlotElementExtensions.transform
      const pMin = transform(this, item.minimum, barStart)
      const pMax = transform(this, item.maximum, barStart)
      const pBase = transform(this, baseValue, barStart + actualBarWidth)

      const minimumRectangle = OxyRect.fromScreenPoints(pMin, pBase)
      const maximumRectangle = OxyRect.fromScreenPoints(pMax, pBase)

      this.actualMinimumBarRectangles.push(minimumRectangle)
      this.actualMaximumBarRectangles.push(maximumRectangle)

      const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
        this.edgeRenderingMode,
        EdgeRenderingMode.PreferSharpness,
      )

      await rc.drawRectangle(
        minimumRectangle,
        item.minimumColor.getActualColor(this.actualMinimumFillColor),
        this.strokeColor,
        this.strokeThickness,
        actualEdgeRenderingMode,
      )
      await rc.drawRectangle(
        maximumRectangle,
        item.maximumColor.getActualColor(this.actualMaximumFillColor),
        this.strokeColor,
        this.strokeThickness,
        actualEdgeRenderingMode,
      )

      if (this.minimumLabelStringFormatter)
        await this.renderLabel(
          rc,
          item,
          baseValue,
          item.minimum,
          barStart,
          barEnd,
          this.minimumLabelStringFormatter,
          item.minimum,
        )

      if (this.maximumLabelStringFormatter)
        await this.renderLabel(
          rc,
          item,
          baseValue,
          item.maximum,
          barStart,
          barEnd,
          this.maximumLabelStringFormatter,
          item.maximum,
        )
    }
  }

  /**
   * Renders the legend on the specified render context.
   * @param rc The render context.
   * @param legendBox The legend box.
   */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const xmid = (legendBox.left + legendBox.right) / 2
    const ymid = (legendBox.top + legendBox.bottom) / 2
    const height = (legendBox.bottom - legendBox.top) * 0.8
    const width = height

    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )
    await rc.drawRectangle(
      new OxyRect(xmid - 0.5 * width, ymid - 0.5 * height, 0.5 * width, height),
      this.actualMinimumFillColor,
      this.strokeColor,
      this.strokeThickness,
      actualEdgeRenderingMode,
    )
    await rc.drawRectangle(
      new OxyRect(xmid, ymid - 0.5 * height, 0.5 * width, height),
      this.actualMaximumFillColor,
      this.strokeColor,
      this.strokeThickness,
      actualEdgeRenderingMode,
    )
  }

  /**
   * Sets the default values.
   * @internal
   */
  setDefaultValues(): void {
    if (this.maximumFillColor.isAutomatic()) {
      this.defaultMaximumFillColor = this.plotModel.getDefaultColor()
    }

    if (this.minimumFillColor.isAutomatic()) {
      this.defaultMinimumFillColor = this.plotModel.getDefaultColor()
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
      minValue = Math.min(minValue, item.minimum)
      maxValue = Math.max(maxValue, item.maximum)
    }

    this.minX = minValue
    this.maxX = maxValue
  }

  /**
   * Checks if the specified item is valid.
   * @param item The item to check.
   * @returns true if the item is valid; false otherwise.
   */
  protected isValid(item: TornadoBarItem): boolean {
    return this.xAxis!.isValidValue(item.minimum) && this.xAxis!.isValidValue(item.maximum)
  }

  /**
   * Updates the ItemsSourceItems from the ItemsSource and data fields.
   * @returns true if the update was successful; false otherwise.
   */
  protected updateFromDataFields(): boolean {
    if (!this.minimumField || !this.maximumField) {
      return false
    }
    if (!this.itemsSource) return false

    if (!this.itemsSourceItems) this.itemsSourceItems = []
    else this.itemsSourceItems.length = 0

    for (const item of this.itemsSource) {
      if (!item) continue
      if (item instanceof TornadoBarItem) {
        this.itemsSourceItems.push(item)
        continue
      }
      const minimum = getOrDefault(item, this.minimumField, Number.NaN)
      const maximum = getOrDefault(item, this.maximumField, Number.NaN)
      const baseValue = getOrDefault(item, this.baseField, Number.NaN)
      const minimumColor = getOrDefault(item, this.minimumColorField, OxyColors.Automatic)
      const maximumColor = getOrDefault(item, this.maximumColorField, OxyColors.Automatic)
      this.itemsSourceItems.push(
        new TornadoBarItem({
          minimum,
          maximum,
          baseValue,
          minimumColor,
          maximumColor,
        }),
      )
    }
    return true
  }
}
