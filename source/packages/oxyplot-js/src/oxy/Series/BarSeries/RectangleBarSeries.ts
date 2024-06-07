import {
  type CreateXYAxisSeriesOptions,
  EdgeRenderingMode,
  ExtendedDefaultXYAxisSeriesOptions,
  HorizontalAlignment,
  type IRenderContext,
  type LabelStringFormatterType,
  newDataPoint,
  newOxyRect,
  newScreenPoint,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRectHelper,
  PlotElementExtensions,
  type PlotModelSerializeOptions,
  RenderingExtensions,
  type ScreenPoint,
  TrackerHitResult,
  type TrackerStringFormatterType,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'

import { assignMethod, assignObject, isNaNOrUndef, isNullOrUndef, Number_MAX_VALUE, Number_MIN_VALUE } from '@/patch'

/**
 * Represents a rectangle item in a RectangleBarSeries.
 */
export interface RectangleBarItem {
  /**
   * The color.
   * If set to Automatic, the FillColor of the RectangleBarSeries will be used.
   */
  color: OxyColor

  /**
   * The title.
   */
  title?: string

  /**
   * The x0 coordinate.
   */
  x0: number

  /**
   * The x1 coordinate.
   */
  x1: number

  /**
   * The y0 coordinate.
   */
  y0: number

  /**
   * The y1 coordinate.
   */
  y1: number
}

export function createRectangleBarItem(x0: number, x1: number, y0: number, y1: number): RectangleBarItem {
  return { x0, x1, y0, y1, color: OxyColors.Automatic }
}

export interface CreateRectangleBarSeriesOptions extends CreateXYAxisSeriesOptions {
  /**
   * The fill color.
   */
  fillColor?: OxyColor

  /**
   * The stroke color.
   */
  strokeColor?: OxyColor

  /**
   * The stroke thickness.
   */
  strokeThickness?: number

  /**
   * The label string formatter.
   */
  labelStringFormatter?: LabelStringFormatterType

  items?: RectangleBarItem[]
}

const DefaultRectangleBarSeriesOptions: CreateRectangleBarSeriesOptions = {
  fillColor: OxyColors.Automatic,
  strokeColor: OxyColors.Black,
  strokeThickness: 1,

  labelStringFormatter: undefined,
  items: undefined,
}

export const ExtendedDefaultRectangleBarSeriesOptions = {
  ...ExtendedDefaultXYAxisSeriesOptions,
  ...DefaultRectangleBarSeriesOptions,
}

/**
 * Represents a series for bar charts where the bars are defined by rectangles.
 */
export class RectangleBarSeries extends XYAxisSeries {
  /**
   * The default tracker formatter.
   */
  public static readonly defaultTrackerStringFormatter: TrackerStringFormatterType = function (args) {
    return `${args.title}
${args.xTitle}: ${args.xValue} ${args['x1Value']}  
${args.yTitle}: ${args.yValue} ${args['y1Value']}`
  }

  public static readonly defaultLabelStringFormatter = function (item: any, args: any) {
    return `${args[4] || ''}`
  }

  /**
   * The default fill color.
   */
  private _defaultFillColor: OxyColor = OxyColors.Undefined

  /**
   * Initializes a new instance of the RectangleBarSeries class.
   */
  constructor(opt?: CreateRectangleBarSeriesOptions) {
    super(opt)

    if (opt?.items) {
      this._items = opt.items
      delete opt.items
    }

    this.trackerStringFormatter = RectangleBarSeries.defaultTrackerStringFormatter
    assignMethod(this, 'trackerStringFormatter', opt)

    this.labelStringFormatter = RectangleBarSeries.defaultLabelStringFormatter
    assignMethod(this, 'labelStringFormatter', opt)

    assignObject(this, DefaultRectangleBarSeriesOptions, opt, {
      exclude: ['trackerStringFormatter', 'labelStringFormatter'],
    })
  }

  getElementName() {
    return 'RectangleBarSeries'
  }

  /**
   * Gets or sets the default color of the interior of the rectangles.
   */
  public fillColor: OxyColor = DefaultRectangleBarSeriesOptions.fillColor!

  /**
   * Gets the actual fill color.
   */
  public get actualFillColor(): OxyColor {
    return OxyColorHelper.getActualColor(this.fillColor, this._defaultFillColor)
  }

  private _items: RectangleBarItem[] = []
  /**
   * Gets the rectangle bar items.
   */
  get items(): RectangleBarItem[] {
    return this._items
  }

  /**
   * Gets or sets the formatter for the labels.
   */
  public labelStringFormatter: LabelStringFormatterType

  /**
   * Gets or sets the color of the border around the rectangles.
   */
  public strokeColor: OxyColor = DefaultRectangleBarSeriesOptions.strokeColor!

  /**
   * Gets or sets the thickness of the border around the rectangles.
   */
  public strokeThickness: number = DefaultRectangleBarSeriesOptions.strokeThickness!

  /**
   * Gets or sets the actual rectangles for the rectangles.
   */
  protected actualBarRectangles: OxyRect[] = []

  /**
   * Gets or sets the actual rectangle bar items.
   */
  protected actualItems: RectangleBarItem[] = []

  /**
   * Gets the point in the dataset that is nearest the specified point.
   * @param point The point.
   * @param interpolate Specifies whether to interpolate or not.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (!this.actualBarRectangles || !this.actualItems) {
      return undefined
    }

    for (let i = 0; i < this.actualBarRectangles.length; i++) {
      const r = this.actualBarRectangles[i]
      if (OxyRectHelper.containsPoint(r, point)) {
        const value = (this.actualItems[i].y0 + this.actualItems[i].y1) / 2
        const sp = point
        const dp = newDataPoint(i, value)
        const item = this.actualItems[i]
        const text = this.formatDefaultTrackerString(
          item,
          newDataPoint(this.actualItems[i].x0, this.actualItems[i].y0),
          (args) => {
            args['x1Value'] = this.xAxis!.getValue(this.actualItems[i].x1)
            args['y1Value'] = this.yAxis!.getValue(this.actualItems[i].y1)
          },
        )
        return new TrackerHitResult({
          series: this,
          dataPoint: dp,
          position: sp,
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
    if (this.items.length === 0) {
      return
    }

    let startIdx = 0
    let xmax = Number_MAX_VALUE

    this.actualBarRectangles = []
    this.actualItems = []

    if (this.isXMonotonic) {
      const xmin = this.xAxis!.clipMinimum
      xmax = this.xAxis!.clipMaximum
      this.windowStartIndex = this.updateWindowStartIndex(this.items, (rect) => rect.x0, xmin, this.windowStartIndex)

      startIdx = this.windowStartIndex
    }

    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )
    let clipCount = 0
    for (let i = startIdx; i < this.items.length; i++) {
      const item = this.items[i]
      if (!this.isValid(item.x0) || !this.isValid(item.x1) || !this.isValid(item.y0) || !this.isValid(item.y1)) {
        continue
      }

      const transform = PlotElementExtensions.transform
      const p0 = transform(this, item.x0, item.y0)
      const p1 = transform(this, item.x1, item.y1)

      const rectangle = OxyRectHelper.create(p0.x, p0.y, p1.x, p1.y)

      this.actualBarRectangles.push(rectangle)
      this.actualItems.push(item)

      const color = item.color ?? OxyColors.Automatic

      await rc.drawRectangle(
        rectangle,
        this.getSelectableFillColor(OxyColorHelper.getActualColor(color, this.actualFillColor)),
        this.strokeColor,
        this.strokeThickness,
        actualEdgeRenderingMode,
      )

      if (this.labelStringFormatter) {
        const s = this.labelStringFormatter(this.getItem(i), [item.x0, item.x1, item.y0, item.y1, item.title])
        const right = OxyRectHelper.right(rectangle)
        const bottom = OxyRectHelper.bottom(rectangle)
        const pt = newScreenPoint((rectangle.left + right) / 2, (rectangle.top + bottom) / 2)

        await rc.drawText(
          pt,
          s,
          this.actualTextColor,
          this.actualFont,
          this.actualFontSize,
          this.actualFontWeight,
          0,
          HorizontalAlignment.Center,
          VerticalAlignment.Middle,
        )
      }

      clipCount += item.x0 > xmax ? 1 : 0
      if (clipCount > 1) {
        break
      }
    }
  }

  /**
   * Renders the legend symbol on the specified rendering context.
   * @param rc The rendering context.
   * @param legendBox The legend rectangle.
   */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const right = OxyRectHelper.right(legendBox)
    const bottom = OxyRectHelper.bottom(legendBox)
    const xmid = (legendBox.left + right) / 2
    const ymid = (legendBox.top + bottom) / 2
    const height = (bottom - legendBox.top) * 0.8
    const width = height
    await rc.drawRectangle(
      newOxyRect(xmid - 0.5 * width, ymid - 0.5 * height, width, height),
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
    if (OxyColorHelper.isAutomatic(this.fillColor)) {
      this._defaultFillColor = this.plotModel.getDefaultColor()
    }
  }

  /**
   * Updates the data.
   * @internal
   */
  updateData(): void {}

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()

    this.isXMonotonic = true

    if (isNullOrUndef(this.items) || this.items.length === 0) {
      return
    }

    let minValueX = Number_MAX_VALUE
    let maxValueX = Number_MIN_VALUE
    let minValueY = Number_MAX_VALUE
    let maxValueY = Number_MIN_VALUE

    let lastX0 = Number_MIN_VALUE
    let lastX1 = Number_MIN_VALUE
    for (const item of this.items) {
      if (item.x0 < lastX0 || item.x1 < lastX1) {
        this.isXMonotonic = false
      }

      minValueX = Math.min(minValueX, Math.min(item.x0, item.x1))
      maxValueX = Math.max(maxValueX, Math.max(item.x1, item.x0))
      minValueY = Math.min(minValueY, Math.min(item.y0, item.y1))
      maxValueY = Math.max(maxValueY, Math.max(item.y0, item.y1))

      lastX0 = item.x0
      lastX1 = item.x1
    }

    this.minX = minValueX
    this.maxX = maxValueX
    this.minY = minValueY
    this.maxY = maxValueY
  }

  /**
   * Checks if the specified value is valid.
   * @param v The value.
   * @returns True if the value is valid.
   */
  protected isValid(v: number): boolean {
    return !isNaNOrUndef(v) && isFinite(v)
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultRectangleBarSeriesOptions
  }

  toJSON(opt?: PlotModelSerializeOptions) {
    const json = super.toJSON(opt)
    if (this._items?.length) {
      json.items = this._items
    }
    return json
  }
}
