import { maxValueOfArray, minValueOfArray, Number_MAX_VALUE, Number_MIN_VALUE, assignObject, round } from '@/patch'
import {
  type BarItem,
  BarSeries,
  type BarSeriesTrackerStringFormatterType,
  type CreateBarSeriesOptions,
  EdgeRenderingMode,
  ExtendedDefaultBarSeriesOptions,
  getBarItemCategoryIndex,
  type IRenderContext,
  LineJoin,
  newBarItem,
  type OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
} from '@/oxyplot'

export interface ErrorBarItem extends BarItem {
  error: number
}

export function newErrorBarItem(item: Partial<ErrorBarItem>): ErrorBarItem {
  const bi = newBarItem(item) as ErrorBarItem
  bi.error = item.error ?? 0
  return bi
}

export interface CreateErrorBarSeriesOptions extends CreateBarSeriesOptions {
  errorStrokeThickness?: number
  errorWidth?: number
}

export const DefaultErrorBarSeriesOptions: CreateErrorBarSeriesOptions = {
  errorStrokeThickness: 1,
  errorWidth: 0.4,
}

export const ExtendedDefaultErrorBarSeriesOptions = {
  ...ExtendedDefaultBarSeriesOptions,
  ...DefaultErrorBarSeriesOptions,
}

export class ErrorBarSeries extends BarSeries {
  public static readonly DefaultTrackerStringFormatter: BarSeriesTrackerStringFormatterType = function (args) {
    return `${args.title || ''}\n${args.category}: ${args.value}, Error: ${round((args.item as ErrorBarItem).error, 3)}`
  }

  public errorStrokeThickness: number = DefaultErrorBarSeriesOptions.errorStrokeThickness!
  public errorWidth: number = DefaultErrorBarSeriesOptions.errorWidth!

  constructor(opt?: CreateErrorBarSeriesOptions) {
    super(opt)
    this.trackerStringFormatter = ErrorBarSeries.DefaultTrackerStringFormatter
    assignObject(this, DefaultErrorBarSeriesOptions, opt)
  }

  getElementName() {
    return 'ErrorBarSeries'
  }

  /**
   *
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()

    if (this.validItems.length === 0) {
      return
    }

    let minValue = Number_MAX_VALUE,
      maxValue = Number_MIN_VALUE
    if (this.isStacked) {
      const labels = this.getCategoryAxis().actualLabels
      const manager = this.manager!
      for (let i = 0; i < labels.length; i++) {
        let j = 0
        const items = this.validItems.filter((item) => getBarItemCategoryIndex(item, j++) === i)
        const values = items.map((item) => item.value).concat([0])
        let minTemp = values.filter((v) => v <= 0).reduce((a, b) => a + b, 0)
        let maxTemp =
          values.filter((v) => v >= 0).reduce((a, b) => a + b, 0) + (items[items.length - 1] as ErrorBarItem).error

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
      const valuesMin = this.validItems.map((item) => item.value - (item as ErrorBarItem).error).concat([0])
      const valuesMax = this.validItems.map((item) => item.value + (item as ErrorBarItem).error).concat([0])
      minValue = minValueOfArray(valuesMin)
      maxValue = maxValueOfArray(valuesMax)
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

  protected async renderItem(
    rc: IRenderContext,
    barValue: number,
    categoryValue: number,
    actualBarWidth: number,
    item: ErrorBarItem,
    rect: OxyRect,
  ): Promise<void> {
    await super.renderItem(rc, barValue, categoryValue, actualBarWidth, item, rect)

    // Render the error
    const errorStart = barValue - item.error
    const errorEnd = barValue + item.error
    const start = 0.5 - this.errorWidth / 2
    const end = 0.5 + this.errorWidth / 2
    const categoryStart = categoryValue + start * actualBarWidth
    const categoryMiddle = categoryValue + 0.5 * actualBarWidth
    const categoryEnd = categoryValue + end * actualBarWidth

    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )
    const transform = PlotElementExtensions.transform

    const lowerErrorPoint = transform(this, errorStart, categoryMiddle)
    const upperErrorPoint = transform(this, errorEnd, categoryMiddle)
    await rc.drawLine(
      [lowerErrorPoint, upperErrorPoint],
      this.strokeColor,
      this.errorStrokeThickness,
      actualEdgeRenderingMode,
      undefined,
      LineJoin.Miter,
    )

    if (this.errorWidth > 0) {
      const lowerLeftErrorPoint = transform(this, errorStart, categoryStart)
      const lowerRightErrorPoint = transform(this, errorStart, categoryEnd)
      await rc.drawLine(
        [lowerLeftErrorPoint, lowerRightErrorPoint],
        this.strokeColor,
        this.errorStrokeThickness,
        actualEdgeRenderingMode,
        undefined,
        LineJoin.Miter,
      )

      const upperLeftErrorPoint = transform(this, errorEnd, categoryStart)
      const upperRightErrorPoint = transform(this, errorEnd, categoryEnd)
      await rc.drawLine(
        [upperLeftErrorPoint, upperRightErrorPoint],
        this.strokeColor,
        this.errorStrokeThickness,
        actualEdgeRenderingMode,
        undefined,
        LineJoin.Miter,
      )
    }
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultErrorBarSeriesOptions
  }
}
