import type {
  CreateXYAxisSeriesOptions,
  IBarSeries,
  IRenderContext,
  LabelStringFormatterType,
  ScreenPoint,
} from '@/oxyplot'
import {
  Axis,
  BarItem,
  BarItemBase,
  BarSeriesManager,
  CategoryAxis,
  HorizontalAlignment,
  IntervalBarItem,
  LabelPlacement,
  OxyColor,
  OxyColors,
  PlotElementExtensions,
  RenderingExtensions,
  screenPointPlus,
  ScreenVector,
  TornadoBarItem,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'

export interface CreateBarSeriesBaseOptions extends CreateXYAxisSeriesOptions {
  barWidth?: number
  strokeColor?: OxyColor
  strokeThickness?: number
  labelColor?: OxyColor
  labelMargin?: number
  labelAngle?: number
  labelPlacement?: LabelPlacement
  labelStringFormatter?: LabelStringFormatterType
}

/**
 * Base class for bar series.
 */
export abstract class BarSeriesBase<T extends BarItemBase> extends XYAxisSeries implements IBarSeries {
  /**
   * The default category axis title
   */
  protected static readonly DefaultCategoryAxisTitle = 'Category'

  /**
   * The default value axis title
   */
  protected static readonly DefaultValueAxisTitle = 'Value'

  /**
   * The width of the bars. The default value is 1.
   */
  public barWidth: number

  /**
   * The items from the items source.
   */
  protected itemsSourceItems?: T[]

  /**
   * The color of the border around the bars.
   */
  public strokeColor: OxyColor

  /**
   * The thickness of the bar border strokes.
   */
  public strokeThickness: number = 0

  /**
   * The manager of this BarSeriesBase.
   */
  manager?: BarSeriesManager

  /**
   * The valid items.
   */
  protected validItems: T[] = []

  /**
   * The dictionary which stores the index-inversion for the valid items
   */
  protected validItemsIndexInversion: Map<number, number> = new Map()

  /**
   * The label color.
   */
  public labelColor: OxyColor = OxyColors.Undefined

  /**
   * The label margins.
   */
  public labelMargin: number = 0

  /**
   * The label angle in degrees.
   */
  public labelAngle: number = 0

  /**
   * Label placements.
   */
  public labelPlacement: LabelPlacement = LabelPlacement.Outside

  /**
   * Initializes a new instance of the BarSeriesBase class.
   */
  protected constructor(opt?: CreateBarSeriesBaseOptions) {
    super(opt)
    this.strokeColor = OxyColors.Black
    this.barWidth = 1
  }

  /**
   * Gets the list of items that should be rendered.
   */
  public get actualItems(): T[] {
    return (this.itemsSource ? this.itemsSourceItems : this.items)!
  }

  /**
   * Gets the items list.
   */
  public items: T[] = []

  /**
   * Gets the actual width of the items of this series.
   * @returns The width.
   * The actual width is also influenced by the GapWidth of the CategoryAxis used by this series.
   */
  protected getActualBarWidth(): number {
    if (!this.manager) return 0

    const categoryAxis = this.getCategoryAxis()
    return this.barWidth / (1 + categoryAxis.gapWidth) / this.manager.getMaxWidth()
  }

  public get categoryAxis(): CategoryAxis {
    return this.getCategoryAxis()
  }

  /**
   * Gets the category axis.
   * @returns The category axis.
   */
  protected getCategoryAxis(): CategoryAxis {
    if (!(this.yAxis instanceof CategoryAxis)) {
      throw new Error('BarSeries requires a CategoryAxis on the Y Axis.')
    }

    return this.yAxis as CategoryAxis
  }

  public get valueAxis(): Axis | undefined {
    return this.xAxis
  }

  /**
   * Gets the item at the specified index.
   * @param i The index of the item.
   * @returns The item of the index.
   */
  protected getItem(i: number): any {
    if (this.itemsSource || !this.actualItems || this.actualItems.length === 0) {
      return super.getItem(i)
    }

    return this.actualItems[i]
  }

  /**
   * Gets a value indicating whether the specified item is valid.
   * @param item The items.
   * @returns true if the item is valid; false otherwise.
   */
  protected abstract isValid(item: T): boolean

  /**
   * Updates the ItemsSourceItems from the ItemsSource and data fields.
   */
  protected abstract updateFromDataFields(): boolean

  /**
   * Clears or creates the ItemsSourceItems list.
   */
  private clearItemsSourceItems(): void {
    if (!this.itemsSourceItems) return

    this.itemsSourceItems.length = 0
  }

  /**
   * Determines whether the specified axis is being used.
   * @param axis The axis.
   * @returns true if the axis is being used; false otherwise.
   * @internal
   */
  isUsing(axis: Axis): boolean {
    return this.xAxis === axis || this.yAxis === axis
  }

  /**
   * Renders the item label.
   * @param rc The render context
   * @param item The item.
   * @param baseValue The bar item base value.
   * @param topValue The bar item top value.
   * @param categoryValue The bar item category value.
   * @param categoryEndValue The bar item category end value.
   * @param labelStringFormatter The formatter to use for the label.
   * @param labelValues An optional set of data values to use when generating label strings.
   */
  protected async renderLabel(
    rc: IRenderContext,
    item: T,
    baseValue: number,
    topValue: number,
    categoryValue: number,
    categoryEndValue: number,
    labelStringFormatter: LabelStringFormatterType,
    ...labelValues: number[]
  ): Promise<void> {
    const v: any[] = []
    if (!labelValues.length) {
      if (item instanceof BarItem) {
        v.push((item as BarItem).value)
      } else if (item instanceof IntervalBarItem) {
        v.push((item as IntervalBarItem).start)
        v.push((item as IntervalBarItem).end)
      } else if (item instanceof TornadoBarItem) {
        throw new Error(
          `RenderLabel does not support automatic determination of label values for TornadoBarItem objects. Please populate the labelValues parameter.`,
        )
      } else {
        throw new Error(
          `RenderLabel automatic value determination not implemented for ${this.constructor.name}. Please populate the labelValues parameter.`,
        )
      }
    } else {
      v.push(...labelValues)
    }

    const s = labelStringFormatter ? labelStringFormatter(item, v) : ''
    let pt: ScreenPoint
    const y = (categoryEndValue + categoryValue) / 2
    const sign = Math.sign(topValue - baseValue)
    let marginVector = new ScreenVector(this.labelMargin, 0).times(sign)
    let centreVector = new ScreenVector(0, 0)

    const size = RenderingExtensions.measureText(
      rc,
      s,
      this.actualFont,
      this.actualFontSize,
      this.actualFontWeight,
      this.labelAngle,
    )
    const halfSize = (PlotElementExtensions.isTransposed(this) ? size.height : size.width) / 2

    const transform = PlotElementExtensions.transform
    switch (this.labelPlacement) {
      case LabelPlacement.Inside:
        pt = transform(this, topValue, y)
        marginVector = marginVector.negate()
        centreVector = new ScreenVector(-sign * halfSize, 0)
        break
      case LabelPlacement.Outside:
        pt = transform(this, topValue, y)
        centreVector = new ScreenVector(sign * halfSize, 0)
        break
      case LabelPlacement.Middle:
        pt = transform(this, (topValue + baseValue) / 2, y)
        marginVector = new ScreenVector(0, 0)
        break
      case LabelPlacement.Base:
        pt = transform(this, baseValue, y)
        centreVector = new ScreenVector(sign * halfSize, 0)
        break
      default:
        throw new Error('Invalid label placement')
    }

    const orientate = PlotElementExtensions.orientateVector
    pt = screenPointPlus(screenPointPlus(pt, orientate(this, marginVector)), orientate(this, centreVector))

    await rc.drawText(
      pt,
      s,
      this.actualTextColor,
      this.actualFont,
      this.actualFontSize,
      this.actualFontWeight,
      this.labelAngle,
      HorizontalAlignment.Center,
      VerticalAlignment.Middle,
    )
  }

  /**
   * Updates the Max/Min limits of the axis.
   * @internal
   */
  updateAxisMaxMin(): void {
    this.xAxis!.include(this.minX)
    this.xAxis!.include(this.maxX)
  }

  /**
   * Updates the data.
   * @internal
   */
  updateData(): void {
    this.clearItemsSourceItems()

    if (!this.itemsSource || this.itemsSource.length == 0) return

    if (!this.updateFromDataFields()) {
      if (!this.itemsSourceItems) this.itemsSourceItems = []
      this.itemsSourceItems.push(...(this.itemsSource as T[]))
    }
  }

  /**
   * Updates the valid data.
   */
  updateValidData(): void {
    this.validItems.length = 0
    this.validItemsIndexInversion.clear()
    const numberOfCategories = this.manager!.categories.length
    for (let index = 0; index < this.actualItems.length; index++) {
      const item = this.actualItems[index]
      if (item && item.getCategoryIndex(index) < numberOfCategories && this.isValid(item)) {
        this.validItemsIndexInversion.set(this.validItems.length, index)
        this.validItems.push(item)
      }
    }
  }
}
