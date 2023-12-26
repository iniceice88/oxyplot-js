import {
  Axis,
  DataPoint,
  HorizontalAlignment,
  type IRenderContext,
  ItemsSeries,
  maxValueOfArray,
  minValueOfArray,
  OxyColor,
  OxyColors,
  OxyRect,
  OxySize,
  ScreenPoint,
  TrackerHitResult,
  VerticalAlignment,
} from 'oxyplot-js'

/**
 * Represents a 'flag' above the x-axis at the specified positions (in the Values list).
 */
export class FlagSeries extends ItemsSeries {
  /**
   * The symbol position (y coordinate).
   */
  private symbolPosition: number = 0

  /**
   * The symbol text size.
   */
  private symbolSize: OxySize = OxySize.Empty

  /**
   * Initializes a new instance of the FlagSeries class.
   */
  constructor() {
    super()

    this.color = OxyColors.Black
    this.fontSize = 10
    this.symbol = String.fromCharCode(0xea)
    this.font = 'Wingdings 2'
    this.trackerStringFormatter = (args) => `${args.title}: ${args.item}`
  }

  /**
   * Gets or sets the color of the symbols.
   */
  public color: OxyColor

  /**
   * Gets the maximum value.
   */
  public maximumX: number = 0

  /**
   * Gets the minimum value.
   */
  public minimumX: number = 0

  /**
   * Gets or sets the symbol to draw at each value.
   */
  public symbol: string

  private _values: number[] = []
  /**
   * Gets the values.
   */
  public get values(): number[] {
    return this._values
  }

  /**
   * Gets the x-axis.
   */
  public xAxis?: Axis

  /**
   * Gets or sets the x-axis key.
   */
  public xAxisKey?: string

  /**
   * Gets the point on the series that is nearest the specified point.
   * @param point The point.
   * @param interpolate Interpolate the series if this flag is set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (!this.xAxis) return undefined

    for (const v of this.values) {
      if (isNaN(v) || v < this.xAxis.actualMinimum || v > this.xAxis.actualMaximum) {
        continue
      }

      const x = this.xAxis.transform(v)
      const r = new OxyRect(
        x - this.symbolSize.width / 2,
        this.symbolPosition - this.symbolSize.height,
        this.symbolSize.width,
        this.symbolSize.height,
      )
      if (r.containsPoint(point)) {
        const text = this.trackerStringFormatter!({
          item: v,
          title: this.title,
        })
        return new TrackerHitResult({
          series: this,
          dataPoint: new DataPoint(v, NaN),
          position: new ScreenPoint(x, this.symbolPosition - this.symbolSize.height),
          text,
        })
      }
    }

    return undefined
  }

  /**
   * Renders the series on the specified render context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (!this.xAxis) {
      return
    }

    this.symbolPosition = this.plotModel.plotArea.bottom
    this.symbolSize = rc.measureText(this.symbol, this.actualFont, this.actualFontSize, this.actualFontWeight)
    for (const v of this.values) {
      if (isNaN(v) || v < this.xAxis.clipMinimum || v > this.xAxis.clipMaximum) {
        continue
      }

      const x = this.xAxis.transform(v)
      await rc.drawText(
        new ScreenPoint(x, this.symbolPosition),
        this.symbol,
        this.color,
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
   * Renders the legend symbol on the specified render context.
   * @param rc The rendering context.
   * @param legendBox The legend rectangle.
   */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    await rc.drawText(
      legendBox.center,
      this.symbol,
      this.color,
      this.actualFont,
      this.actualFontSize,
      this.actualFontWeight,
      0,
      HorizontalAlignment.Center,
      VerticalAlignment.Middle,
    )
  }

  /**
   * Check if this data series requires X/Y axes. (e.g. Pie series do not require axes)
   * @returns True if no axes are required.
   * @internal
   */
  areAxesRequired(): boolean {
    return true
  }

  /**
   * Ensures that the axes of the series is defined.
   * @internal
   */
  ensureAxes(): void {
    this.xAxis = this.xAxisKey !== undefined ? this.plotModel.getAxis(this.xAxisKey) : this.plotModel.defaultXAxis
  }

  /**
   * Check if the data series is using the specified axis.
   * @param axis An axis which should be checked if used
   * @returns True if the axis is in use.
   *
   * @internal
   */
  isUsing(axis: Axis): boolean {
    return axis === this.xAxis
  }

  /**
   * Sets default values (colors, line style etc) from the plot model.
   * @internal
   */
  setDefaultValues(): void {}

  /**
   * Updates the axis maximum and minimum values.
   * @internal
   */
  updateAxisMaxMin(): void {
    this.xAxis!.include(this.minimumX)
    this.xAxis!.include(this.maximumX)
  }

  /**
   * Updates the data from the ItemsSource.
   * @internal
   */
  updateData(): void {}

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    this.minimumX = minValueOfArray(this.values)
    this.maximumX = maxValueOfArray(this.values)
  }
}
