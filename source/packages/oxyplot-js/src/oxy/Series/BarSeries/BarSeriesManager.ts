import type { IBarSeries } from '@/oxyplot'
import { Axis, CategoryAxis, isStackableSeries, type IStackableSeries, PlotModel } from '@/oxyplot'
import { create2DArray, isUndef } from '@/patch'

/**
 * Represents a manager for bar series.
 * This handles all operations that need information about all bar series in the plot that share the same axes. This includes:
 * - determine and keep track of bar width and offset
 * - determine and keep track of stacked bar offsets
 */
export class BarSeriesManager {
  /**
   * The current offset of the bars (not used for stacked bar series).
   * These offsets are modified during rendering.
   */
  private currentBarOffset?: number[]

  /**
   * The current max value per StackIndex and Label.
   * These values are modified during rendering.
   */
  private currentMaxValue?: number[][]

  /**
   * The current min value per StackIndex and Label.
   * These values are modified during rendering.
   */
  private currentMinValue?: number[][]

  /**
   * The base value per StackIndex and Label for negative values of stacked bar series.
   * These values are modified during rendering.
   */
  private currentNegativeBaseValues?: number[][]

  /**
   * The base value per StackIndex and Label for positive values of stacked bar series.
   * These values are modified during rendering.
   */
  private currentPositiveBaseValues?: number[][]

  /**
   * The maximal width of all labels.
   */
  private maxWidth: number = NaN

  /**
   * Initializes a new instance of the BarSeriesManager class.
   * @param categoryAxis The category axis the series belong to.
   * @param valueAxis The value axis the series belong to.
   * @param series The bar series this instance should manage.
   */
  constructor(categoryAxis: CategoryAxis, valueAxis: Axis, series: IBarSeries[]) {
    if (!categoryAxis.plotModel) {
      throw new Error('The category axis must be part of a plot model.')
    }

    this._categoryAxis = categoryAxis
    this._valueAxis = valueAxis
    this._series = series

    for (const s of this._series) {
      s.manager = this
    }
  }

  private readonly _categoryAxis: CategoryAxis

  /**
   * Gets the CategoryAxis whose bar series this instance manages.
   */
  get categoryAxis(): CategoryAxis {
    return this._categoryAxis
  }

  private readonly _series: IBarSeries[]

  /**
   * Gets all bar series that are managed by this instance.
   */
  get managedSeries(): IBarSeries[] {
    return this._series
  }

  /**
   * Gets the PlotModel whose bar series this instance manages.
   */
  get plotModel(): PlotModel {
    return this.categoryAxis.plotModel
  }

  private readonly _valueAxis: Axis

  /**
   * Gets the value Axis whose bar series this instance manages.
   */
  get valueAxis(): Axis {
    return this._valueAxis
  }

  /**
   * Gets the string representation of the categories.
   */
  get categories(): string[] {
    return this._categoryAxis.actualLabels
  }

  /**
   * The offset of the bars.
   */
  private _barOffset?: number[]

  /**
   * The offset of the bars per StackIndex and Label (only used for stacked bar series).
   */
  private _stackedBarOffset?: number[][]

  private _stackIndexMapping: Map<string, number> = new Map()
  /**
   * Gets the stack index mapping. The mapping indicates to which rank a specific stack index belongs.
   */
  private get stackIndexMapping(): Map<string, number> {
    return this._stackIndexMapping
  }

  /**
   * Gets the category value.
   * @param categoryIndex Index of the category.
   * @param stackIndex Index of the stack.
   * @param actualBarWidth Actual width of the bar.
   * @returns The get category value.
   */
  public getCategoryValue(categoryIndex: number, stackIndex: number, actualBarWidth: number): number {
    const offsetBegin = this._stackedBarOffset![stackIndex][categoryIndex]
    const offsetEnd = this._stackedBarOffset![stackIndex + 1][categoryIndex]
    return categoryIndex - 0.5 + (offsetEnd + offsetBegin - actualBarWidth) * 0.5
  }

  /**
   * Gets the current bar offset for the specified category index.
   * @param categoryIndex The category index.
   * @returns The offset.
   */
  public getCurrentBarOffset(categoryIndex: number): number {
    if (!this.currentBarOffset) return 0
    return this.currentBarOffset[categoryIndex]
  }

  /**
   * Gets the current base value for the specified stack and category index.
   * @param stackIndex The stack index.
   * @param categoryIndex The category index.
   * @param negativeValue if set to true get the base value for negative values.
   * @returns The current base value.
   */
  public getCurrentBaseValue(stackIndex: number, categoryIndex: number, negativeValue: boolean): number {
    if (negativeValue) {
      return this.currentNegativeBaseValues![stackIndex][categoryIndex]
    }
    return this.currentPositiveBaseValues![stackIndex][categoryIndex]
  }

  /**
   * Gets the current maximum value for the specified stack and category index.
   * @param stackIndex The stack index.
   * @param categoryIndex The category index.
   * @returns The current value.
   */
  public getCurrentMaxValue(stackIndex: number, categoryIndex: number): number {
    if (!this.currentMaxValue) return 0
    return this.currentMaxValue[stackIndex][categoryIndex]
  }

  /**
   * Gets the current minimum value for the specified stack and category index.
   * @param stackIndex The stack index.
   * @param categoryIndex The category index.
   * @returns The current value.
   */
  public getCurrentMinValue(stackIndex: number, categoryIndex: number): number {
    if (!this.currentMinValue) return 0
    return this.currentMinValue[stackIndex][categoryIndex]
  }

  /**
   * Gets the maximum width of all category labels.
   * @returns The maximum width.
   */
  public getMaxWidth(): number {
    return this.maxWidth
  }

  /**
   * Gets the stack index for the specified stack group.
   * @param stackGroup The stack group.
   * @returns The stack index.
   */
  public getStackIndex(stackGroup: string): number {
    const idx = this._stackIndexMapping.get(stackGroup)
    if (!isUndef(idx)) return idx
    return -1
  }

  /**
   * Increases the current bar offset for the specified category index.
   * @param categoryIndex The category index.
   * @param delta The offset increase.
   */
  public increaseCurrentBarOffset(categoryIndex: number, delta: number): void {
    if (!this.currentBarOffset) return
    this.currentBarOffset[categoryIndex] += delta
  }

  /**
   * Initializes the manager for rendering. This should be called before any of the managed series are rendered.
   */
  public initializeRender(): void {
    this.resetCurrentValues()
  }

  /**
   * Sets the current base value for the specified stack and category index.
   * @param stackIndex Index of the stack.
   * @param categoryIndex Index of the category.
   * @param negativeValue if set to true set the base value for negative values.
   * @param newValue The new value.
   */
  public setCurrentBaseValue(
    stackIndex: number,
    categoryIndex: number,
    negativeValue: boolean,
    newValue: number,
  ): void {
    if (negativeValue) {
      this.currentNegativeBaseValues![stackIndex][categoryIndex] = newValue
    } else {
      this.currentPositiveBaseValues![stackIndex][categoryIndex] = newValue
    }
  }

  /**
   * Sets the current maximum value for the specified stack and category index.
   * @param stackIndex The stack index.
   * @param categoryIndex The category index.
   * @param newValue The new value.
   */
  public setCurrentMaxValue(stackIndex: number, categoryIndex: number, newValue: number): void {
    this.currentMaxValue![stackIndex][categoryIndex] = newValue
  }

  /**
   * Sets the current minimum value for the specified stack and category index.
   * @param stackIndex The stack index.
   * @param categoryIndex The category index.
   * @param newValue The new value.
   */
  public setCurrentMinValue(stackIndex: number, categoryIndex: number, newValue: number): void {
    this.currentMinValue![stackIndex][categoryIndex] = newValue
  }

  /**
   * Bar series should call this after they updated their data.
   */
  public update(): void {
    this.categoryAxis.updateLabels(Math.max(...this.managedSeries.map((s) => s.actualItems.length)))
    this.updateBarOffsets()
    this.updateValidData()
    this.resetCurrentValues()
  }

  /**
   * Gets a value indicating whether the bar series has an item at the specified category index.
   * @param series The bar series.
   * @param categoryIndex The category index.
   * @returns true if the bar series has an item at the specified category index; false otherwise.
   */
  private static hasCategory(series: IBarSeries, categoryIndex: number): boolean {
    if (series.actualItems.length > categoryIndex && series.actualItems[categoryIndex].categoryIndex < 0) {
      return true
    }

    return series.actualItems.some((item) => item.categoryIndex === categoryIndex)
  }

  /**
   * Resets the current values.
   * The current values may be modified during update of max/min and rendering.
   */
  private resetCurrentValues(): void {
    this.currentBarOffset = [...(this._barOffset || [])]
    const actualLabels = this.categoryAxis.actualLabels
    const stackIndexMappingSize = this._stackIndexMapping.size
    if (stackIndexMappingSize > 0) {
      this.currentPositiveBaseValues = create2DArray(stackIndexMappingSize, actualLabels.length, Number.NaN)
      this.currentNegativeBaseValues = create2DArray(stackIndexMappingSize, actualLabels.length, Number.NaN)
      this.currentMaxValue = create2DArray(stackIndexMappingSize, actualLabels.length, Number.NaN)
      this.currentMinValue = create2DArray(stackIndexMappingSize, actualLabels.length, Number.NaN)
    } else {
      this.currentPositiveBaseValues = undefined
      this.currentNegativeBaseValues = undefined
      this.currentMaxValue = undefined
      this.currentMinValue = undefined
    }
  }

  /**
   * Updates the bar offsets.
   */
  private updateBarOffsets(): void {
    if (this.categories.length === 0) {
      this.maxWidth = Number.NaN
      this._stackedBarOffset = undefined
      this._stackIndexMapping.clear()

      return
    }

    const totalWidthPerCategory = new Array(this.categories.length).fill(0)
    const stackGroupWidthDict: Map<string, number> = new Map()
    this._barOffset = new Array(this.categories.length).fill(0)

    const stackableSeries = this.managedSeries.filter((s) => isStackableSeries(s)).map((s) => s as IStackableSeries)

    const stackGroups = Array.from(
      stackableSeries
        .filter((s) => s.isStacked)
        .reduce(
          (map, s) => map.set(s.stackGroup, (map.get(s.stackGroup) || []).concat(s)),
          new Map<string, IStackableSeries[]>(),
        )
        .values(),
    )

    for (const stackGroup of stackGroups) {
      const maxBarWidth = Math.max(...stackGroup.map((s) => s.barWidth))

      stackGroupWidthDict.set(stackGroup[0].stackGroup, maxBarWidth)

      for (let i = 0; i < this.categories.length; i++) {
        if (stackGroup.some((s) => BarSeriesManager.hasCategory(s, i))) {
          totalWidthPerCategory[i] += maxBarWidth
        }
      }
    }

    // Add width of unstacked series
    for (const s of this.managedSeries.filter((s) => !isStackableSeries(s) || !s.isStacked)) {
      for (let i = 0; i < this.categories.length; i++) {
        let numberOfItems = s.actualItems.filter((item) => item.categoryIndex === i).length
        if (s.actualItems.length > i && s.actualItems[i].categoryIndex < 0) {
          numberOfItems++
        }

        totalWidthPerCategory[i] += s.barWidth * numberOfItems
      }
    }

    this.maxWidth = Math.max(...totalWidthPerCategory)

    // Calculate BarOffset and StackedBarOffset
    this._stackedBarOffset = create2DArray(stackGroups.length + 1, this.categories.length, 0)
    const widthScale = 1 / (1 + this.categoryAxis.gapWidth) / this.maxWidth
    for (let i = 0; i < this.categories.length; i++) {
      this._barOffset[i] = 0.5 - totalWidthPerCategory[i] * widthScale * 0.5
    }

    for (let j = 0; j < stackGroups.length; j++) {
      const stackGroup = stackGroups[j]
      for (let i = 0; i < this.categories.length; i++) {
        this._stackedBarOffset[j][i] = this._barOffset[i]
        if (stackGroup.some((s) => BarSeriesManager.hasCategory(s, i))) {
          this._barOffset[i] += stackGroupWidthDict.get(stackGroup[0].stackGroup)! * widthScale
        }
      }
    }

    for (let i = 0; i < this.categories.length; i++) {
      this._stackedBarOffset[stackGroups.length][i] = this._barOffset[i]
    }

    this._stackIndexMapping.clear()
    let groupCounter = 0
    for (const group of stackGroups.map((group) => group[0].stackGroup).sort()) {
      this._stackIndexMapping.set(group, groupCounter++)
    }
  }

  /**
   * Updates the valid data of all managed series.
   */
  private updateValidData(): void {
    for (const item of this.managedSeries) {
      item.updateValidData()
    }
  }
}
