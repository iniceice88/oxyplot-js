import {
  type BarItemBase,
  BarSeriesBase,
  type CreateBarSeriesBaseOptions,
  EdgeRenderingMode,
  ExtendedDefaultBarSeriesBaseOptions,
  getBarItemCategoryIndex,
  type IRenderContext,
  type LabelStringFormatterType,
  newDataPoint,
  newOxyRect,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRectHelper,
  PlotElementExtensions,
  RenderingExtensions,
  type ScreenPoint,
  TrackerHitResult,
  type TrackerStringFormatterType,
} from '@/oxyplot'
import {
  assignMethod,
  assignObject,
  getOrDefault,
  isNaNOrUndef,
  Number_MAX_VALUE,
  Number_MIN_VALUE,
  removeUndef,
} from '@/patch'

export interface TornadoBarItem extends BarItemBase {
  /**
   * The base value.
   */
  baseValue: number
  /**
   * The maximum value.
   */
  maximum: number
  /**
   * The color for the maximum bar.
   */
  maximumColor: OxyColor
  /**
   * The minimum value.
   */
  minimum: number
  /**
   * The color for the minimum bar.
   */
  minimumColor: OxyColor
}

const DefaultTornadoBarItemOptions: TornadoBarItem = {
  categoryIndex: -1,
  baseValue: NaN,
  maximum: NaN,
  maximumColor: OxyColors.Automatic,
  minimum: NaN,
  minimumColor: OxyColors.Automatic,
}

export function newTornadoBarItem(item: Partial<TornadoBarItem>) {
  return Object.assign({}, DefaultTornadoBarItemOptions, removeUndef(item))
}

export function isTornadoBarItem(item: any): item is TornadoBarItem {
  if (!item) return false
  return 'categoryIndex' in item && 'baseValue' in item && 'maximum' in item && 'minimum' in item
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

export const DefaultTornadoBarSeriesOptions: CreateTornadoBarSeriesOptions = {
  maximumFillColor: OxyColorHelper.fromRgb(216, 82, 85),
  minimumFillColor: OxyColorHelper.fromRgb(84, 138, 209),

  strokeColor: OxyColors.Black,
  strokeThickness: 1,
  labelMargin: 4,

  baseField: undefined,
  baseValue: undefined,
  maximumColorField: undefined,
  maximumField: undefined,
  maximumLabelStringFormatter: undefined,
  minimumColorField: undefined,
  minimumField: undefined,
  minimumLabelStringFormatter: undefined,
  actualMaximumBarRectangles: undefined,
  actualMinimumBarRectangles: undefined,
}

export const ExtendedDefaultTornadoBarSeriesOptions = {
  ...ExtendedDefaultBarSeriesBaseOptions,
  ...DefaultTornadoBarSeriesOptions,
}

/**
 * Represents a series that can be used to create tornado plots.
 * See http://en.wikipedia.org/wiki/Tornado_diagram.
 */
export class TornadoBarSeries extends BarSeriesBase<TornadoBarItem> {
  /**
   * The default tracker formatter
   */
  public static readonly defaultTrackerStringFormatter: TrackerStringFormatterType = function (args) {
    return `${args.title || ''}\n${args.yTitle}: ${args.yValue}\n${args.xTitle}: ${args.xValue}`
  }

  public static readonly defaultMinimumLabelStringFormatter: LabelStringFormatterType = function (item, args) {
    return args[0].toString()
  }

  public static readonly defaultMaximumLabelStringFormatter: LabelStringFormatterType = function (item, args) {
    return args[0].toString()
  }

  /**
   * The default fill color.
   */
  private _defaultMaximumFillColor: OxyColor = OxyColors.Undefined

  /**
   * The default minimum fill color.
   */
  private _defaultMinimumFillColor: OxyColor = OxyColors.Undefined

  /**
   * Initializes a new instance of the TornadoBarSeries class.
   */
  constructor(opt?: CreateTornadoBarSeriesOptions) {
    super(opt)
    this.trackerStringFormatter = TornadoBarSeries.defaultTrackerStringFormatter
    assignMethod(this, 'trackerStringFormatter', opt)

    this.minimumLabelStringFormatter = TornadoBarSeries.defaultMinimumLabelStringFormatter
    assignMethod(this, 'minimumLabelStringFormatter', opt)

    this.maximumLabelStringFormatter = TornadoBarSeries.defaultMaximumLabelStringFormatter
    assignMethod(this, 'maximumLabelStringFormatter', opt)

    assignObject(this, DefaultTornadoBarSeriesOptions, opt, {
      exclude: ['trackerStringFormatter', 'minimumLabelStringFormatter', 'maximumLabelStringFormatter'],
    })
  }

  getElementName() {
    return 'TornadoBarSeries'
  }

  /**
   * Gets the actual fill color.
   */
  get actualMaximumFillColor(): OxyColor {
    return OxyColorHelper.getActualColor(this.maximumFillColor, this._defaultMaximumFillColor)
  }

  /**
   * Gets the actual minimum fill color.
   */
  get actualMinimumFillColor(): OxyColor {
    return OxyColorHelper.getActualColor(this.minimumFillColor, this._defaultMinimumFillColor)
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
  maximumFillColor: OxyColor = DefaultTornadoBarSeriesOptions.maximumFillColor!

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
  minimumFillColor: OxyColor = DefaultTornadoBarSeriesOptions.minimumFillColor!

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
      const insideMinimumRectangle = OxyRectHelper.containsPoint(this.actualMinimumBarRectangles[i], point)
      const insideMaximumRectangle = OxyRectHelper.containsPoint(this.actualMaximumBarRectangles[i], point)
      if (insideMinimumRectangle || insideMaximumRectangle) {
        const item = this.getItem(this.validItemsIndexInversion.get(i)!) as TornadoBarItem
        const categoryIndex = getBarItemCategoryIndex(item, i)
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

      const categoryIndex = getBarItemCategoryIndex(item, i)

      const baseValue = isNaNOrUndef(item.baseValue) ? this.baseValue : item.baseValue
      const barOffset = this.manager!.getCurrentBarOffset(categoryIndex)
      const barStart = categoryIndex - 0.5 + barOffset
      const barEnd = barStart + actualBarWidth

      const transform = PlotElementExtensions.transform
      const pMin = transform(this, item.minimum, barStart)
      const pMax = transform(this, item.maximum, barStart)
      const pBase = transform(this, baseValue, barStart + actualBarWidth)

      const minimumRectangle = OxyRectHelper.fromScreenPoints(pMin, pBase)
      const maximumRectangle = OxyRectHelper.fromScreenPoints(pMax, pBase)

      this.actualMinimumBarRectangles.push(minimumRectangle)
      this.actualMaximumBarRectangles.push(maximumRectangle)

      const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
        this.edgeRenderingMode,
        EdgeRenderingMode.PreferSharpness,
      )

      await rc.drawRectangle(
        minimumRectangle,
        OxyColorHelper.getActualColor(item.minimumColor, this.actualMinimumFillColor),
        this.strokeColor,
        this.strokeThickness,
        actualEdgeRenderingMode,
      )
      await rc.drawRectangle(
        maximumRectangle,
        OxyColorHelper.getActualColor(item.maximumColor, this.actualMaximumFillColor),
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
      newOxyRect(xmid - 0.5 * width, ymid - 0.5 * height, 0.5 * width, height),
      this.actualMinimumFillColor,
      this.strokeColor,
      this.strokeThickness,
      actualEdgeRenderingMode,
    )
    await rc.drawRectangle(
      newOxyRect(xmid, ymid - 0.5 * height, 0.5 * width, height),
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
    if (OxyColorHelper.isAutomatic(this.maximumFillColor)) {
      this._defaultMaximumFillColor = this.plotModel.getDefaultColor()
    }

    if (OxyColorHelper.isAutomatic(this.minimumFillColor)) {
      this._defaultMinimumFillColor = this.plotModel.getDefaultColor()
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
      if (isTornadoBarItem(item)) {
        this.itemsSourceItems.push(item)
        continue
      }
      const minimum = getOrDefault(item, this.minimumField, Number.NaN)
      const maximum = getOrDefault(item, this.maximumField, Number.NaN)
      const baseValue = getOrDefault(item, this.baseField, Number.NaN)
      const minimumColor = getOrDefault(item, this.minimumColorField, OxyColors.Automatic)
      const maximumColor = getOrDefault(item, this.maximumColorField, OxyColors.Automatic)
      this.itemsSourceItems.push(
        newTornadoBarItem({
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

  protected getElementDefaultValues(): any {
    return ExtendedDefaultTornadoBarSeriesOptions
  }
}
