import {
  type BarItem,
  BarSeriesBase,
  type CreateBarSeriesBaseOptions,
  EdgeRenderingMode,
  ExtendedDefaultBarSeriesBaseOptions,
  getBarItemCategoryIndex,
  type IRenderContext,
  type IStackableSeries,
  type LabelStringFormatterType,
  newBarItem,
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
  type TrackerStringFormatterArgs,
} from '@/oxyplot'
import {
  assignMethod,
  assignObject, isNaNOrUndef,
  isNullOrUndef,
  maxValueOfArray,
  minValueOfArray,
  Number_MAX_VALUE,
  Number_MIN_VALUE,
} from '@/patch'

export interface CreateBarSeriesOptions extends CreateBarSeriesBaseOptions {
  valueField?: string
  colorField?: string
  stackGroup?: string
  baseLine?: number
  isStacked?: boolean
  overlapsStack?: boolean
  baseValue?: number
  fillColor?: OxyColor
  negativeFillColor?: OxyColor
}

export interface BarSeriesTrackerStringFormatterArgs extends TrackerStringFormatterArgs {
  readonly item?: BarItem
  readonly category?: string
  readonly value?: number
}

/**
 * The default tracker formatter
 */
export const DefaultBarSeriesTrackerFormatter: BarSeriesTrackerStringFormatterType = function (args) {
  return `${args.title || ''}\n${args.category}: ${args.value}`
}

export const DefaultBarSeriesOptions: CreateBarSeriesOptions = {
  fillColor: OxyColors.Automatic,
  negativeFillColor: OxyColors.Undefined,
  labelMargin: 2,
  labelAngle: 0,
  stackGroup: '',
  strokeThickness: 0,
  baseValue: 0,
  baseLine: NaN,
  isStacked: false,
  overlapsStack: false,
  trackerStringFormatter: DefaultBarSeriesTrackerFormatter,
  colorField: undefined,
  labelStringFormatter: undefined,
  valueField: undefined,
}

export const ExtendedDefaultBarSeriesOptions = {
  ...ExtendedDefaultBarSeriesBaseOptions,
  ...DefaultBarSeriesOptions,
}

export type BarSeriesTrackerStringFormatterType = (args: BarSeriesTrackerStringFormatterArgs) => string | undefined

/**
 * Represents a series for clustered or stacked bar charts.
 */
export class BarSeries extends BarSeriesBase<BarItem> implements IStackableSeries {
  /**
   * The default fill color.
   */
  private _defaultFillColor: OxyColor = OxyColors.Undefined

  /**
   * A format function used for the tracker. The default depends on the series.
   * The arguments for the formatter may be different for each type of series. See the documentation.
   */
  public trackerStringFormatter?: BarSeriesTrackerStringFormatterType = undefined

  /**
   * Initializes a new instance of the BarSeries class.
   */
  constructor(opt?: CreateBarSeriesOptions) {
    super(opt)
    assignMethod(this, 'labelStringFormatter', opt)
    assignObject(this, DefaultBarSeriesOptions, opt, { exclude: ['labelStringFormatter'] })
  }

  getElementName() {
    return 'BarSeries'
  }

  /**
   * Gets or sets the base value. Default value is 0.
   */
  public baseValue: number = DefaultBarSeriesOptions.baseValue!

  /**
   * Gets or sets the base value.
   */
  public baseLine: number = DefaultBarSeriesOptions.baseLine!

  private _actualBaseLine: number = NaN
  /**
   * Gets or sets the actual baseline.
   */
  public get actualBaseLine() {
    return this._actualBaseLine
  }

  protected set actualBaseLine(value: number) {
    this._actualBaseLine = value
  }

  /**
   * Gets the actual fill color.
   */
  public get actualFillColor(): OxyColor {
    return OxyColorHelper.getActualColor(this.fillColor, this._defaultFillColor)
  }

  /**
   * Gets or sets the color field.
   */
  public colorField?: string

  /**
   * Gets or sets the color of the interior of the bars.
   */
  public fillColor: OxyColor = DefaultBarSeriesOptions.fillColor!

  /**
   * Gets or sets a value indicating whether the series is stacked.
   */
  isStacked: boolean = DefaultBarSeriesOptions.isStacked!

  /**
   *  Gets a value indicating whether this series should overlap its stack when IsStacked is true.
   */
  overlapsStack: boolean = DefaultBarSeriesOptions.overlapsStack!

  /**
   * Gets or sets the label formatter.
   */
  labelStringFormatter?: LabelStringFormatterType

  /**
   * Gets or sets the color of the interior of the bars when the value is negative.
   */
  public negativeFillColor: OxyColor = DefaultBarSeriesOptions.negativeFillColor!

  /**
   * Gets or sets the stack group
   */
  stackGroup: string = DefaultBarSeriesOptions.stackGroup!

  /**
   * Gets or sets the value field.
   */
  public valueField?: string

  /**
   * Gets or sets the actual rectangles for the bars.
   */
  protected actualBarRectangles?: OxyRect[]

  /**
   * Gets the nearest point.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (!this.actualBarRectangles || this.validItems.length === 0) {
      return undefined
    }

    let i = 0
    for (const rectangle of this.actualBarRectangles) {
      if (OxyRectHelper.containsPoint(rectangle, point)) {
        // get the item corresponding to this bar/column rectangle
        const item = this.validItems[i]
        const categoryIndex = getBarItemCategoryIndex(item, i)
        const dp = newDataPoint(categoryIndex, this.validItems[i].value)

        // get the item that the bar/column is bound to, or the item from the Items collection
        const boundItem = this.getItem(this.validItemsIndexInversion.get(i)!)
        return new TrackerHitResult({
          series: this,
          dataPoint: dp,
          position: point,
          item: boundItem,
          index: i,
          text: this.getTrackerText(item, boundItem, categoryIndex),
        })
      }

      i++
    }

    return undefined
  }

  /**
   * Renders the legend.
   */
  public renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const right = OxyRectHelper.right(legendBox)
    const bottom = OxyRectHelper.bottom(legendBox)
    const xmid = (legendBox.left + right) / 2
    const ymid = (legendBox.top + bottom) / 2
    const height = (bottom - legendBox.top) * 0.8
    const width = height
    return rc.drawRectangle(
      newOxyRect(xmid - 0.5 * width, ymid - 0.5 * height, width, height),
      this.getSelectableColor(this.actualFillColor),
      this.strokeColor,
      this.strokeThickness,
      this.edgeRenderingMode,
    )
  }

  /**
   * Sets default values.
   * @internal
   */
  setDefaultValues(): void {
    if (OxyColorHelper.isAutomatic(this.fillColor)) {
      this._defaultFillColor = this.plotModel.getDefaultColor()
    }
  }

  /**
   * Updates the axes to include the max and min of this series.
   * @internal
   */
  updateAxisMaxMin(): void {
    super.updateAxisMaxMin()

    this.computeActualBaseLine()
    this.xAxis!.include(this.actualBaseLine)
  }

  /**
   * Computes the actual base value.
   */
  protected computeActualBaseLine(): void {
    if (isNaNOrUndef(this.baseLine)) {
      if (this.xAxis!.isLogarithmic()) {
        const actualValues = (this.actualItems || []).map((item) => item.value)
        const lowestPositiveValue = minValueOfArray(
          actualValues.filter((v) => v > 0),
          1,
        )
        this.actualBaseLine = Math.max(lowestPositiveValue / 10.0, this.baseValue)
      } else {
        this.actualBaseLine = 0
      }
    } else {
      this.actualBaseLine = this.baseLine
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

    const categoryAxis = this.getCategoryAxis()

    let minValue = Number_MAX_VALUE,
      maxValue = Number_MIN_VALUE
    const manager = this.manager!
    if (this.isStacked) {
      const labels = categoryAxis.actualLabels
      for (let i = 0; i < labels.length; i++) {
        let j = 0
        const values = this.validItems
          .filter((item) => getBarItemCategoryIndex(item, j++) === i)
          .map((item) => item.value)
          .concat([0])
        let minTemp = values.filter((v) => v <= 0).reduce((a, b) => a + b, 0)
        let maxTemp = values.filter((v) => v >= 0).reduce((a, b) => a + b, 0)

        const stackIndex = manager.getStackIndex(this.stackGroup)
        const stackedMinValue = manager.getCurrentMinValue(stackIndex, i)
        if (!isNaN(stackedMinValue)) {
          minTemp += stackedMinValue
        }

        manager.setCurrentMinValue(stackIndex, i, minTemp)

        const stackedMaxValue = manager.getCurrentMaxValue(stackIndex, i)
        if (!this.overlapsStack && !isNaN(stackedMaxValue)) {
          maxTemp += stackedMaxValue
        }

        manager.setCurrentMaxValue(stackIndex, i, maxTemp)

        minValue = Math.min(minValue, minTemp + this.baseValue)
        maxValue = Math.max(maxValue, maxTemp + this.baseValue)
      }
    } else {
      const values = this.validItems.map((item) => item.value).concat([0])
      minValue = minValueOfArray(values)
      maxValue = maxValueOfArray(values)
      if (this.baseValue < minValue) {
        minValue = this.baseValue
      }

      if (this.baseValue > maxValue) {
        maxValue = this.baseValue
      }
    }

    this.minX = minValue
    this.maxX = maxValue
  }

  /**
   * Gets the tracker text.
   */
  protected getTrackerText(barItem: BarItem, item: any, categoryIndex: number): string | undefined {
    if (!this.trackerStringFormatter) return undefined

    const categoryAxis = this.getCategoryAxis()
    const valueAxis = this.xAxis

    return this.trackerStringFormatter({
      item,
      title: this.title,
      category: categoryAxis.formatValue(categoryIndex),
      value: valueAxis?.getValue(barItem.value),
    })
  }

  /**
   * Checks if the bar item is valid.
   */
  protected isValid(item: BarItem): boolean {
    return this.xAxis!.isValidValue(item.value)
  }

  /**
   * Renders the bar/column item.
   */
  protected async renderItem(
    rc: IRenderContext,
    barValue: number,
    categoryValue: number,
    actualBarWidth: number,
    item: BarItem,
    rect: OxyRect,
  ): Promise<void> {
    // Get the color of the item
    let actualFillColor = item.color
    if (OxyColorHelper.isAutomatic(actualFillColor)) {
      actualFillColor = this.actualFillColor
      if (item.value < 0 && !OxyColorHelper.isUndefined(this.negativeFillColor)) {
        actualFillColor = this.negativeFillColor
      }
    }

    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )
    await rc.drawRectangle(
      rect,
      this.getSelectableFillColor(actualFillColor),
      this.strokeColor,
      this.strokeThickness,
      actualEdgeRenderingMode,
    )
  }

  /**
   * Renders the series on the specified render context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    this.actualBarRectangles = []
    if (this.validItems.length === 0) {
      return
    }

    const manager = this.manager!
    const yAxis = this.yAxis!
    const xAxis = this.xAxis!
    const transform = PlotElementExtensions.transform
    const actualBarWidth = this.getActualBarWidth()
    const stackIndex = this.isStacked ? manager.getStackIndex(this.stackGroup) : 0
    for (let i = 0; i < this.validItems.length; i++) {
      const item = this.validItems[i]
      const categoryIndex = getBarItemCategoryIndex(item, i)

      const value = item.value

      // Get base- and topValue
      let baseValue = NaN
      if (this.isStacked && !this.overlapsStack) {
        baseValue = manager.getCurrentBaseValue(stackIndex, categoryIndex, value < 0)
      }

      if (isNaNOrUndef(baseValue)) {
        baseValue = this.baseValue
      }

      const topValue = this.isStacked ? baseValue + value : value

      if (yAxis.isLogarithmic() && !yAxis.isValidValue(topValue)) {
        continue
      }

      // Calculate offset
      let categoryValue: number
      if (this.isStacked) {
        categoryValue = manager.getCategoryValue(categoryIndex, stackIndex, actualBarWidth)
      } else {
        categoryValue = categoryIndex - 0.5 + manager.getCurrentBarOffset(categoryIndex)
      }

      if (this.isStacked) {
        manager.setCurrentBaseValue(stackIndex, categoryIndex, value < 0, topValue)
      }

      const clampBase = xAxis.isLogarithmic() && !xAxis.isValidValue(baseValue)
      const p1 = transform(this, clampBase ? xAxis.clipMinimum : baseValue, categoryValue)
      const p2 = transform(this, topValue, categoryValue + actualBarWidth)

      const rectangle = OxyRectHelper.fromScreenPoints(p1, p2)

      this.actualBarRectangles.push(rectangle)

      await this.renderItem(rc, topValue, categoryValue, actualBarWidth, item, rectangle)

      if (this.labelStringFormatter) {
        await this.renderLabel(
          rc,
          item,
          baseValue,
          topValue,
          categoryValue,
          categoryValue + actualBarWidth,
          this.labelStringFormatter,
        )
      }

      if (!this.isStacked) {
        manager.increaseCurrentBarOffset(categoryIndex, actualBarWidth)
      }
    }
  }

  /**
   * Updates from data fields.
   */
  protected updateFromDataFields(): boolean {
    if (!this.valueField) {
      return false
    }

    if (!this.itemsSource || this.itemsSource.length == 0) return true

    this.itemsSourceItems = this.itemsSourceItems || []

    for (const item of this.itemsSource) {
      if (isNullOrUndef(item)) continue
      const value = item[this.valueField]
      const bi = newBarItem()
      bi.value = !isNullOrUndef(value) ? value : NaN
      let color = OxyColors.Automatic
      if (this.colorField && item[this.colorField] && OxyColorHelper.isOxyColor(item[this.colorField])) {
        color = item[this.colorField]
      }
      bi.color = color
      this.itemsSourceItems.push(bi)
    }

    return true
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultBarSeriesOptions
  }
}
