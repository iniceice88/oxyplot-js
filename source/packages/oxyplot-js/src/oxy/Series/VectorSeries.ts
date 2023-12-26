import {
  Axis,
  ColorAxisExtensions,
  type CreateXYAxisSeriesOptions,
  DataPoint,
  DataVector,
  HorizontalAlignment,
  type IColorAxis,
  type IRenderContext,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  OxyColor,
  OxyColors,
  RenderingExtensions,
  ScreenPoint,
  ScreenVector,
  TrackerHitResult,
  type TrackerStringFormatterArgs,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'
import { maxValueOfArray, minValueOfArray } from '../../patch'

/** Represents an item in a VectorSeries. */
export interface VectorItem {
  /** The origin of the vector. */
  readonly origin: DataPoint

  /** The direction of the vector. */
  readonly direction: DataVector

  /** The value of the item. */
  readonly value: number
}

/** Represents an item in a VectorSeries. */
export interface VectorItem {
  /** The origin of the vector. */
  readonly origin: DataPoint

  /** The direction of the vector. */
  readonly direction: DataVector

  /** The value of the item. */
  readonly value: number
}

export interface CreateVectorSeriesOptions extends CreateXYAxisSeriesOptions {
  /** The color of the arrow. */
  color?: OxyColor

  /** The length of the arrows heads (relative to the stroke thickness) (the default value is 10). */
  arrowHeadLength?: number

  /** The width of the arrows heads (relative to the stroke thickness) (the default value is 3). */
  arrowHeadWidth?: number

  /** The position of the arrow heads (relative to the end of the vector) (the default value is 1). */
  arrowHeadPosition?: number

  /** The line join type. */
  lineJoin?: LineJoin

  /** The line style. */
  lineStyle?: LineStyle

  /** The stroke thickness (the default value is 2). */
  strokeThickness?: number

  /**
   * The minimum length of an interpolated line segment.
   * Increasing this number will increase performance,
   * but make the curve less accurate. The default is <c>2</c>.
   */
  minimumSegmentLength?: number

  /** The 'veeness' of the arrow head (relative to thickness) (the default value is 0). */
  arrowVeeness?: number

  /** The start position of the arrows for each vector relative to the length of the vector (the default value is 0). */
  arrowStartPosition?: number

  /** The positions of the label for each vector along the drawn arrow (the default value is 0). */
  arrowLabelPosition?: number

  /** The format string for the cell labels. The default value is <c>0.00</c>. */
  labelStringFormatter?: (item: VectorItem) => string

  /** The font size of the labels. The default value is <c>0</c> (labels not visible). */
  labelFontSize?: number

  /** The delegate used to map from ItemsSeries.ItemsSource to VectorItem. The default is <c>null</c>. */
  mapping?: (item: any) => VectorItem

  /** The list of Vectors. */
  items?: VectorItem[]
}

export interface VectorSeriesTrackerStringFormatterArgs extends TrackerStringFormatterArgs {
  item?: VectorItem
  itemDirection?: DataVector
}

export type VectorSeriesTrackerStringFormatterType = (
  args: VectorSeriesTrackerStringFormatterArgs,
) => string | undefined

/** Represents a series that can be bound to a collection of VectorItem. */
export class VectorSeries extends XYAxisSeries {
  /** The items originating from the items source. */
  private _actualItems?: VectorItem[]

  /** The default color. */
  private defaultColor: OxyColor = OxyColors.Undefined

  /** The default line style. */
  private defaultLineStyle: LineStyle = LineStyle.Solid

  /** The default tracker format string */
  public static readonly DefaultTrackerStringFormatter: VectorSeriesTrackerStringFormatterType = (args) => {
    return `${args.title}
${args.xTitle}: ${args.xValue}
${args.yTitle}: ${args.yValue}
${args.colorAxisTitle}: ${args.item!.value}
Δ${args.xTitle}: ${args.itemDirection!.x}
Δ${args.yTitle}: ${args.itemDirection!.y}`
  }

  /** The default color-axis title */
  private static readonly DefaultColorAxisTitle = 'Value'

  constructor(opt?: CreateVectorSeriesOptions) {
    super(opt)
    this.color = OxyColors.Automatic
    this.minimumSegmentLength = 2
    this.strokeThickness = 2
    this.lineStyle = LineStyle.Solid
    this.lineJoin = LineJoin.Miter

    this.arrowHeadLength = 3
    this.arrowHeadWidth = 2
    this.arrowHeadPosition = 1
    this.arrowVeeness = 0
    this.arrowStartPosition = 0
    this.arrowLabelPosition = 0

    this.trackerStringFormatter = VectorSeries.DefaultTrackerStringFormatter
    this.labelStringFormatter = (item) => item.value.toFixed(2)
    this.labelFontSize = 0

    if (opt) {
      Object.assign(this, opt)
    }
  }

  /** Gets or sets the color of the arrow. */
  public color: OxyColor

  /** Gets the minimum value of the dataset. */
  public minValue: number = 0

  /** Gets the maximum value of the dataset. */
  public maxValue: number = 0

  /** Gets or sets the length of the arrows heads (relative to the stroke thickness) (the default value is 10). */
  public arrowHeadLength: number

  /** Gets or sets the width of the arrows heads (relative to the stroke thickness) (the default value is 3). */
  public arrowHeadWidth: number

  /** Gets or sets the position of the arrow heads (relative to the end of the vector) (the default value is 1). */
  public arrowHeadPosition: number

  /** Gets or sets the line join type. */
  public lineJoin: LineJoin

  /** Gets or sets the line style. */
  public lineStyle: LineStyle

  /** Gets or sets the stroke thickness (the default value is 2). */
  public strokeThickness: number

  public get actualLineStyle(): LineStyle {
    if (this.lineStyle != LineStyle.Automatic) return this.lineStyle
    return this.defaultLineStyle
  }

  /**
   * Gets or sets the minimum length of an interpolated line segment.
   * Increasing this number will increase performance,
   * but make the curve less accurate. The default is <c>2</c>.
   */
  public minimumSegmentLength: number

  /** Gets or sets the 'veeness' of the arrow head (relative to thickness) (the default value is 0). */
  public arrowVeeness: number

  /** Gets the start position of the arrows for each vector relative to the length of the vector (the default value is 0). */
  public arrowStartPosition: number

  /** Gets the positions of the label for each vector along the drawn arrow (the default value is 0). */
  public arrowLabelPosition: number

  /** Gets or sets the color axis. */
  public colorAxis?: IColorAxis

  /** Gets or sets the color axis key. */
  public colorAxisKey?: string

  /** Gets or sets the format string for the cell labels. The default value is <c>0.00</c>. */
  public labelStringFormatter?: (item: VectorItem) => string

  /**
   * A format string used for the tracker. The default depends on the series.
   * The arguments for the format string may be different for each type of series. See the documentation.
   */
  public trackerStringFormatter?: VectorSeriesTrackerStringFormatterType = undefined

  /** Gets or sets the font size of the labels. The default value is <c>0</c> (labels not visible). */
  public labelFontSize: number

  /** Gets or sets a value indicating whether the tracker can interpolate points. */
  public canTrackerInterpolatePoints: boolean = false

  /** Gets or sets the delegate used to map from ItemsSeries.ItemsSource to VectorItem. The default is <c>null</c>. */
  public mapping?: (item: any) => VectorItem

  /** Gets the list of Vectors. */
  public items: VectorItem[] = []

  /** Gets the list of Vectors that should be rendered. */
  protected get ActualItems(): VectorItem[] {
    return (this.itemsSource ? this._actualItems : this.items)!
  }

  /** Renders the series on the specified rendering context. */
  public async render(rc: IRenderContext): Promise<void> {
    const actualRects = this.ActualItems

    this.verifyAxes()

    await this.renderVectors(rc, actualRects)
  }

  /**
   * Updates the data.
   * @internal
   */
  updateData(): void {
    if (!this.itemsSource) {
      return
    }

    this.updateActualItems()
  }

  /** Clears or creates the actualItems list. */
  private clearActualItems(): void {
    if (this._actualItems) this._actualItems.length = 0
  }

  /** Updates the points from the ItemsSeries.ItemsSource. */
  private updateActualItems(): void {
    if (!this.itemsSource) return

    this.clearActualItems()
    this._actualItems = this._actualItems || []

    let finalItemSources = this.itemsSource
    // Use the Mapping property to generate the points
    if (this.mapping) {
      finalItemSources = this.itemsSource.map((x) => this.mapping!(x))
    }

    this._actualItems.push(...finalItemSources)
  }

  /** Renders the points as line, broken line and markers. */
  protected async renderVectors(rc: IRenderContext, items: VectorItem[]): Promise<void> {
    let i = 0
    for (const item of items) {
      let vectorColor: OxyColor
      if (this.colorAxis && (this.color.isUndefined() || this.color.isAutomatic())) {
        vectorColor = ColorAxisExtensions.getColor(this.colorAxis, item.value)
      } else {
        vectorColor = this.color.getActualColor(this.defaultColor)
      }

      vectorColor = this.getSelectableColor(vectorColor, i)

      const vector = item.direction
      const origin = item.origin.minusVector(vector.times(this.arrowStartPosition))
      const textOrigin = origin.plus(vector.times(this.arrowLabelPosition))

      await this.drawVector(rc, origin, vector, vectorColor)

      if (this.labelFontSize > 0 && this.labelStringFormatter) {
        await rc.drawText(
          this.transform(textOrigin),
          this.labelStringFormatter(item),
          this.actualTextColor,
          this.actualFont,
          this.labelFontSize,
          this.actualFontWeight,
          0,
          HorizontalAlignment.Center,
          VerticalAlignment.Middle,
        )
      }

      i++
    }
  }

  private async drawVector(rc: IRenderContext, point: DataPoint, vector: DataVector, color: OxyColor): Promise<void> {
    const points = [point, point.plus(vector)]
    const screenPoints: ScreenPoint[] = []
    RenderingExtensions.transformAndInterpolateLines(this, points, screenPoints, this.minimumSegmentLength)

    if (screenPoints.length >= 2) {
      await this.drawArrow(
        rc,
        screenPoints,
        screenPoints[screenPoints.length - 1].minus(screenPoints[screenPoints.length - 2]),
        color,
      )
    }
  }

  private async drawArrow(
    rc: IRenderContext,
    points: ScreenPoint[],
    direction: ScreenVector,
    color: OxyColor,
  ): Promise<void> {
    // draws a line with an arrowhead glued on the tip (the arrowhead does not point to the end point)
    const d = direction
    d.normalize()
    const n = new ScreenVector(d.y, -d.x)

    const actualHeadLength = this.arrowHeadLength * this.strokeThickness
    const actualHeadWidth = this.arrowHeadWidth * this.strokeThickness

    const endPoint = points[points.length - 1].minusVector(d.times(actualHeadLength * this.arrowHeadPosition))

    const veeness = d.times(this.arrowVeeness * this.strokeThickness)
    const p1 = endPoint.plus(d.times(actualHeadLength))
    const p2 = endPoint.plus(n.times(actualHeadWidth)).minusVector(veeness)
    const p3 = endPoint.minusVector(n.times(actualHeadWidth)).minusVector(veeness)

    const lineStyle = this.actualLineStyle
    const dashArray = LineStyleHelper.getDashArray(lineStyle)

    if (this.arrowHeadPosition > 0 && this.arrowHeadPosition <= 1) {
      // TODO: may see rendering artefacts from this on non-linear lines
      // crop elements from points which would introduce on the head, and re-include end-point if necessary
      const cropDistanceSquared = actualHeadLength * this.arrowHeadPosition * actualHeadLength * this.arrowHeadPosition
      for (let i = points.length - 1; i >= 0; i--) {
        if (points[i].distanceToSquared(p1) <= cropDistanceSquared) points.splice(i, 1)
      }

      if (points.length > 0) {
        points.push(endPoint)
      }
    }

    if (this.strokeThickness > 0 && lineStyle !== LineStyle.None) {
      await rc.drawLine(points, color, this.strokeThickness, this.edgeRenderingMode, dashArray, this.lineJoin)

      await rc.drawPolygon([p3, p1, p2, endPoint], color, OxyColors.Undefined, 0, this.edgeRenderingMode)
    }
  }

  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    const colorAxis = this.colorAxis as unknown as Axis
    const colorAxisTitle = colorAxis?.title ?? VectorSeries.DefaultColorAxisTitle

    if (!(this.ActualItems && this.ActualItems.length > 0)) {
      // if no vectors, return null
      return undefined
    }

    const item = argMin(this.ActualItems, (i) => this.transform(i.origin).distanceToSquared(point))
    const p = item.origin
    const trackerText = this.formatDefaultTrackerString(item, p, (args) => {
      const vectorArgs = args as VectorSeriesTrackerStringFormatterArgs
      vectorArgs.colorAxisTitle = colorAxisTitle
      vectorArgs.itemDirection = item.direction
    })

    return new TrackerHitResult({
      series: this,
      dataPoint: p,
      position: this.transform(p),
      item: undefined,
      index: -1,
      text: trackerText,
    })
  }

  /**
   * Ensures that the axes of the series is defined.
   * @internal
   */
  ensureAxes(): void {
    super.ensureAxes()

    this.colorAxis = (
      this.colorAxisKey ? this.plotModel.getAxis(this.colorAxisKey) : this.plotModel.defaultColorAxis
    ) as IColorAxis
  }

  /**
   * Sets default values from the plot model.
   * @internal
   */
  setDefaultValues(): void {
    if (this.color.isAutomatic() && this.colorAxis === undefined) {
      this.defaultLineStyle = this.plotModel.getDefaultLineStyle()
      this.defaultColor = this.plotModel.getDefaultColor()
    }
  }

  /**
   * Updates the maximum and minimum values of the series for the x and y dimensions only.
   * @internal
   */
  updateMaxMinXY(): void {
    const actualItems = this.ActualItems

    if (actualItems && actualItems.length > 0) {
      this.minX = Math.min(
        ...actualItems.map((r) => r.origin.x - r.direction.x * this.arrowStartPosition),
        ...actualItems.map((r) => r.origin.x - r.direction.x * (this.arrowStartPosition - 1)),
      )
      this.maxX = Math.max(
        ...actualItems.map((r) => r.origin.x - r.direction.x * this.arrowStartPosition),
        ...actualItems.map((r) => r.origin.x - r.direction.x * (this.arrowStartPosition - 1)),
      )
      this.minY = Math.min(
        ...actualItems.map((r) => r.origin.y - r.direction.y * this.arrowStartPosition),
        ...actualItems.map((r) => r.origin.y - r.direction.y * (this.arrowStartPosition - 1)),
      )
      this.maxY = Math.max(
        ...actualItems.map((r) => r.origin.y - r.direction.y * this.arrowStartPosition),
        ...actualItems.map((r) => r.origin.y - r.direction.y * (this.arrowStartPosition - 1)),
      )
    }
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()
    const actualItems = this.ActualItems

    const allDataPoints: DataPoint[] = []
    allDataPoints.push(
      ...actualItems.map((item) => item.origin.minusVector(item.direction.times(this.arrowStartPosition))),
    )
    allDataPoints.push(
      ...actualItems.map((item) => item.origin.plus(item.direction.times(1 - this.arrowStartPosition))),
    )
    this.internalUpdateMaxMin(allDataPoints)

    this.updateMaxMinXY()

    if (actualItems && actualItems.length > 0) {
      const actualItemValues = actualItems.map((r) => r.value)
      this.minValue = minValueOfArray(actualItemValues)
      this.maxValue = maxValueOfArray(actualItemValues)
    }
  }

  /**
   * Updates the axes to include the max and min of this series.
   * @internal
   */
  updateAxisMaxMin(): void {
    super.updateAxisMaxMin()
    if (!this.colorAxis) return

    const colorAxis = this.colorAxis as unknown as Axis
    colorAxis.include(this.minValue)
    colorAxis.include(this.maxValue)
  }
}

/**
 * Gets the first element with a minimal projected value.
 * @param sequence The enumerable of elements.
 * @param projection The projection from elements to a comparable.
 * @returns The first element with a minimal projected value.
 */
const argMin = <T>(sequence: T[], projection: (t: T) => any): T => {
  if (!sequence) {
    throw new Error('Sequence must be defined.')
  }

  if (!projection) {
    throw new Error('Projection must be defined.')
  }

  let best: T | undefined = undefined
  let bestComparable: any | undefined = undefined

  let first = true
  for (const t of sequence) {
    const comparable = projection(t)

    if (first || comparable < bestComparable) {
      best = t
      bestComparable = comparable
      first = false
    }
  }

  if (first) {
    throw new Error('Sequence must be non-empty.')
  }

  return best!
}
