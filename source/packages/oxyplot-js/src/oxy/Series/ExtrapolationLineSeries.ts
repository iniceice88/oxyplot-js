import type { CreateLineSeriesOptions, IRenderContext, ScreenPoint } from '@/oxyplot'
import {
  LineSeries,
  LineStyle,
  LineStyleHelper,
  newScreenPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
} from '@/oxyplot'

/**
 * Represents an interval defined by two numbers.
 */
export class DataRange {
  private readonly _minimum: number
  private readonly _maximum: number
  private readonly _isDefined: boolean

  /**
   * Initializes a new instance of the DataRange class.
   * @param min The inclusive lower bound.
   * @param max The inclusive upper bound.
   */
  constructor(min: number, max: number) {
    if (isNaN(min) || isNaN(max)) {
      throw new Error('NaN values are not permitted')
    }

    if (max < min) {
      throw new Error('max must be larger or equal min')
    }

    this._minimum = min
    this._maximum = max

    this._isDefined = true
  }

  /**
   * Gets the lower bound of the data range.
   */
  public get minimum(): number {
    return this._minimum
  }

  /**
   * Gets the upper bound of the data range.
   */
  public get maximum(): number {
    return this._maximum
  }

  /**
   * Gets the difference between maximum and minimum.
   */
  public get range(): number {
    return this.maximum - this.minimum
  }

  /**
   * Determines whether this data range is defined.
   * @returns true if this instance is defined, otherwise false.
   */
  public isDefined(): boolean {
    return this._isDefined
  }

  /**
   * Determines whether the specified value lies
   * within the closed interval of the data range.
   * @param value The value to be checked.
   * @returns true if value in range, otherwise false.
   */
  public contains(value: number): boolean {
    return value >= this.minimum && value <= this.maximum
  }

  /**
   * Determines whether the specified data range
   * intersects with this instance.
   * @param other the other interval to be checked.
   * @returns true if intersects, otherwise false.
   */
  public intersectsWith(other: DataRange): boolean {
    return (
      this.isDefined() &&
      other.isDefined() &&
      (this.contains(other.minimum) ||
        this.contains(other.maximum) ||
        other.contains(this.minimum) ||
        other.contains(this.maximum))
    )
  }

  /**
   * Returns a string that represents this instance.
   * @returns A string that represents this instance.
   */
  public toString(): string {
    return `[${this.minimum}, ${this.maximum}]`
  }
}

/**
 * The undefined data range.
 */
const DataRange_Undefined = new DataRange(0, 0)
;(DataRange_Undefined as any)._isDefined = false
Object.freeze(DataRange_Undefined)
export { DataRange_Undefined }

export interface CreateExtrapolationLineSeriesOptions extends CreateLineSeriesOptions {
  extrapolationColor?: OxyColor
  extrapolationDashes?: number[]
  extrapolationLineStyle?: LineStyle
  ignoreExtraplotationForScaling?: boolean
  intervals?: DataRange[]
}

/** Represents a series where the line can be rendered using a different style
 * or color in defined intervals of X. The style specified in the LineStyle
 * property determines how the line is rendered in these intervals. Outside
 * the intervals the style is always solid.
 */
export class ExtrapolationLineSeries extends LineSeries {
  /** Default color for the extrapolated parts of the curve. Currently hard-coded. */
  private readonly defaultExtrapolationColor: OxyColor = OxyColors.Black

  /** Default line style for the extrapolated parts of the curve. Currently hard-coded. */
  private readonly defaultExtrapolationLineStyle: LineStyle = LineStyle.Dash

  private orderedIntervals: DataRange[] = []

  constructor(opt?: CreateExtrapolationLineSeriesOptions) {
    super(opt)
    this.extrapolationColor = OxyColors.Black
    this.lineStyle = LineStyle.Dot

    if (opt) {
      Object.assign(this, opt)
    }
  }

  /** Gets or sets the color for the part of the line that is inside an interval. */
  extrapolationColor: OxyColor

  /** Gets the actual extrapolation color. */
  get actualExtrapolationColor(): OxyColor {
    return this.extrapolationColor.getActualColor(this.defaultExtrapolationColor)
  }

  /** Gets or sets the dash array for the extrapolated intervals of the rendered line
   * (overrides ExtrapolationLineStyle). The default is undefined.
   */
  extrapolationDashes?: number[]

  /** Gets or sets the style for the extrapolated parts of the line. */
  extrapolationLineStyle: LineStyle = LineStyle.Solid

  /** Gets the actual extrapolation line style. */
  get actualExtrapolationLineStyle(): LineStyle {
    return this.extrapolationLineStyle !== LineStyle.Automatic
      ? this.extrapolationLineStyle
      : this.defaultExtrapolationLineStyle
  }

  /** Gets or sets a value indicating whether the extrapolated regions of the series will
   * be taken into account when calculating the minima and maxima of the dataset.
   * These regions will hence also be ignored when auto-scaling the axes.
   */
  ignoreExtraplotationForScaling: boolean = false

  /** Gets the list of X intervals within which the line is rendered using the second color and style. */
  intervals: DataRange[] = []

  /** Gets the actual dash array for the extrapolated parts of the line. */
  protected get actualExtrapolationDashArray(): number[] {
    return (this.extrapolationDashes || LineStyleHelper.getDashArray(this.actualExtrapolationLineStyle))!
  }

  /** Renders the legend symbol for the extrapolation line series on the
   * specified rendering context. Both lines (normal and extrapolated)
   * are displayed.
   */
  async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const xmid = (legendBox.left + legendBox.right) / 2
    const ymid = (legendBox.top + legendBox.bottom) / 2

    let pts = [newScreenPoint(legendBox.left, ymid), newScreenPoint(xmid, ymid)]

    await rc.drawLine(
      pts,
      this.getSelectableColor(this.actualColor),
      this.strokeThickness,
      this.edgeRenderingMode,
      this.actualDashArray,
    )

    pts = [newScreenPoint(xmid, ymid), newScreenPoint(legendBox.right, ymid)]

    await rc.drawLine(
      pts,
      this.getSelectableColor(this.actualExtrapolationColor),
      this.strokeThickness,
      this.edgeRenderingMode,
      this.actualExtrapolationDashArray,
    )

    const midpt = newScreenPoint(xmid, ymid)

    await RenderingExtensions.drawMarker(
      rc,
      midpt,
      this.markerType,
      this.markerOutline,
      this.markerSize,
      this.actualMarkerFill,
      this.markerStroke,
      this.markerStrokeThickness,
      this.edgeRenderingMode,
    )
  }

  /**
   * Updates the data and sorts the intervals.
   * @internal
   * */
  updateData(): void {
    super.updateData()
    this.orderedIntervals = this.mergeOverlaps(this.intervals)
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   * */
  updateMaxMin(): void {
    if (this.ignoreExtraplotationForScaling && this.orderedIntervals.length > 0) {
      this.minX = this.points
        .filter((p) => !this.inAnyInterval(p.x))
        .map((p) => p.x)
        .filter((x) => !isNaN(x))
        .reduce((a, b) => Math.min(a, b), Number.NaN)

      this.minY = this.points
        .filter((p) => !this.inAnyInterval(p.x))
        .map((p) => p.y)
        .filter((y) => !isNaN(y))
        .reduce((a, b) => Math.min(a, b), Number.NaN)

      this.maxX = this.points
        .filter((p) => !this.inAnyInterval(p.x))
        .map((p) => p.x)
        .filter((x) => !isNaN(x))
        .reduce((a, b) => Math.max(a, b), Number.NaN)

      this.maxY = this.points
        .filter((p) => !this.inAnyInterval(p.x))
        .map((p) => p.y)
        .filter((y) => !isNaN(y))
        .reduce((a, b) => Math.max(a, b), Number.NaN)
    } else {
      super.updateMaxMin()
    }
  }

  /**
   * Renders a continuous line.
   * @param rc The render context.
   * @param pointsToRender The points to render.
   */
  protected async renderLine(rc: IRenderContext, pointsToRender: ScreenPoint[]): Promise<void> {
    if (this.strokeThickness <= 0 || this.actualLineStyle === LineStyle.None) {
      return
    }

    const clippingRect = this.getClippingRect()

    const p1 = this.inverseTransform(clippingRect.bottomLeft)
    const p2 = this.inverseTransform(clippingRect.topRight)

    const minX = Math.min(p1.x, p2.x)
    const maxX = Math.max(p1.x, p2.x)

    const minY = Math.min(p1.y, p2.y)
    const maxY = Math.max(p1.y, p2.y)

    const clippingRectangles = this.createClippingRectangles(clippingRect, minX, maxX, minY, maxY)

    for (const rect of clippingRectangles) {
      const centerX = this.inverseTransform(rect.center).x

      const isInterval = this.orderedIntervals && this.orderedIntervals.some((i) => i.contains(centerX))

      const autoResetClipDisp = RenderingExtensions.autoResetClip(rc, rect)
      await this.renderLinePart(rc, pointsToRender, isInterval)
      autoResetClipDisp.dispose()
    }
  }

  /**
   * Creates clipping rectangles for the parts of the line which are either
   * rendered in normal style or in extrapolation style.
   */
  private createClippingRectangles(
    clippingRect: OxyRect,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
  ): OxyRect[] {
    const rectangles: OxyRect[] = []
    let previous = minX
    const transform = PlotElementExtensions.transform
    if (this.orderedIntervals && this.orderedIntervals.length > 0) {
      const flatLimits = this.flatten(this.orderedIntervals).filter((l) => l >= minX && l <= maxX)

      for (const limiter of flatLimits) {
        const rect = OxyRect.fromScreenPoints(transform(this, previous, minY), transform(this, limiter, maxY))
        rectangles.push(rect.clip(clippingRect))

        previous = limiter
      }
    }

    rectangles.push(
      OxyRect.fromScreenPoints(transform(this, previous, minY), transform(this, maxX, maxY)).clip(clippingRect),
    )

    return rectangles
  }

  /**
   * Returns a flat sequence of doubles containing alternating minima
   * and maxima of the original data range intervals.
   */
  private flatten(intervals: DataRange[]): number[] {
    const flat: number[] = []
    for (const interval of intervals) {
      flat.push(interval.minimum)
      flat.push(interval.maximum)
    }
    return flat
  }

  /**
   * Renders the part of the line which is given by the provided list of screen points.
   */
  private async renderLinePart(rc: IRenderContext, pointsToRender: ScreenPoint[], isInterval: boolean): Promise<void> {
    const color = isInterval ? this.extrapolationColor : this.color

    const dashes = isInterval ? this.actualExtrapolationDashArray : this.actualDashArray

    await RenderingExtensions.drawReducedLine(
      rc,
      pointsToRender,
      this.minimumSegmentLength * this.minimumSegmentLength,
      this.getSelectableColor(color),
      this.strokeThickness,
      this.edgeRenderingMode,
      dashes,
      this.lineJoin,
    )
  }

  /**
   * Sorts the intervals by their minimum and merges those intervals which overlap, i.e.
   * replaces them by their union.
   */
  private mergeOverlaps(intervals: DataRange[]): DataRange[] {
    const orderedList: DataRange[] = []

    if (intervals) {
      const ordered = intervals.sort((a, b) => a.minimum - b.minimum)
      for (const current of ordered) {
        const previous = orderedList[orderedList.length - 1] || DataRange_Undefined
        if (current.intersectsWith(previous)) {
          orderedList[orderedList.length - 1] = new DataRange(
            previous.minimum,
            Math.max(previous.maximum, current.maximum),
          )
        } else {
          orderedList.push(current)
        }
      }
    }

    return orderedList
  }

  /**
   * Checks whether the given x-value is within any of the
   * ordered intervals using binary search.
   * @param x The value to be checked for.
   * @returns true if x is inside any interval.
   */
  private inAnyInterval(x: number): boolean {
    let min = 0
    let max = this.orderedIntervals.length - 1

    while (min <= max) {
      const mid = Math.floor((min + max) / 2)
      const comparison = this.compare(this.orderedIntervals[mid], x)

      if (comparison === 0) {
        return true
      } else if (comparison < 0) {
        max = mid - 1
      } else {
        min = mid + 1
      }
    }

    return false
  }

  /**
   * Checks whether the given x-value is within the provided interval.
   * @param interval The interval to check against.
   * @param x The value to be checked.
   * @returns 0 if x is within inclusive interval, -1 if x smaller interval's min, 1 if x larger interval's max.
   */
  private compare(interval: DataRange, x: number): number {
    if (x < interval.minimum) {
      return -1
    }

    if (x > interval.maximum) {
      return 1
    }

    return 0
  }
}
