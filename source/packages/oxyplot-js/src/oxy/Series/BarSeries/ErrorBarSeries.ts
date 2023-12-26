import {
  maxValueOfArray,
  minValueOfArray,
  Number_MAX_VALUE,
  Number_MIN_VALUE,
  removeUndef,
  round,
} from '@/patch'
import type {
  BarSeriesTrackerStringFormatterType,
  CreateBarItemOptions,
  CreateBarSeriesOptions,
  IRenderContext,
} from '@/oxyplot'
import {
  BarItem,
  BarSeries,
  EdgeRenderingMode,
  LineJoin,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
} from '@/oxyplot'

export interface CreateErrorBarItemOptions extends CreateBarItemOptions {
  error?: number
}

export class ErrorBarItem extends BarItem {
  public error: number = 0

  constructor(opt?: CreateErrorBarItemOptions) {
    super(opt)
    this.color = OxyColors.Automatic

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }
}

export interface CreateErrorBarSeriesOptions extends CreateBarSeriesOptions {
  errorStrokeThickness?: number
  errorWidth?: number
}

export class ErrorBarSeries extends BarSeries {
  public static readonly DefaultTrackerStringFormatter: BarSeriesTrackerStringFormatterType = (args) =>
    `${args.title || ''}\n${args.category}: ${args.value}, Error: ${round((args.item as ErrorBarItem).error, 3)}`

  public errorStrokeThickness: number
  public errorWidth: number

  constructor(opt?: CreateErrorBarSeriesOptions) {
    super(opt)
    this.errorWidth = 0.4
    this.errorStrokeThickness = 1
    this.trackerStringFormatter = ErrorBarSeries.DefaultTrackerStringFormatter
    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
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
      // TODO: Implement stacked logic
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
}
