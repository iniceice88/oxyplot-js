import {
  type CreateLineSeriesOptions,
  ExtendedDefaultLineSeriesOptions,
  type IRenderContext,
  LineSeries,
  LineStyle,
  LineStyleHelper,
  newScreenPoint,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRectHelper,
  PlotElementExtensions,
  RenderingExtensions,
  type ScreenPoint,
} from '@/oxyplot'
import { assignObject, isNaNOrUndef } from '@/patch'

export interface DataRange {
  minimum: number
  maximum: number
}

export function newDataRange(min: number, max: number): DataRange {
  if (isNaN(min) || isNaN(max)) {
    throw new Error('NaN values are not permitted')
  }

  if (max < min) {
    throw new Error('max must be larger or equal min')
  }
  return Object.freeze({ minimum: min, maximum: max })
}

/**
 * Represents an interval defined by two numbers.
 */
export class DataRangeHelper {
  /**
   * Gets the difference between maximum and minimum.
   */
  static range(dr: DataRange): number {
    return dr.maximum - dr.minimum
  }

  /**
   * Determines whether the specified value lies
   * within the closed interval of the data range.
   * @param dr
   * @param value The value to be checked.
   * @returns true if value in range, otherwise false.
   */
  static contains(dr: DataRange, value: number): boolean {
    return value >= dr.minimum && value <= dr.maximum
  }

  /**
   * Determines whether the specified data range
   * intersects with this instance.
   * @param dr
   * @param other the other interval to be checked.
   * @returns true if intersects, otherwise false.
   */
  static intersectsWith(dr: DataRange, other: DataRange): boolean {
    return (
      this.contains(dr, other.minimum) ||
      this.contains(dr, other.maximum) ||
      this.contains(other, dr.minimum) ||
      this.contains(other, dr.maximum)
    )
  }
}

export interface CreateExtrapolationLineSeriesOptions extends CreateLineSeriesOptions {
  extrapolationColor?: OxyColor
  extrapolationDashes?: number[]
  extrapolationLineStyle?: LineStyle
  ignoreExtraplotationForScaling?: boolean
  intervals?: DataRange[]
}

const DefaultExtrapolationLineSeriesOptions: CreateExtrapolationLineSeriesOptions = {
  extrapolationColor: OxyColors.Black,
  extrapolationLineStyle: LineStyle.Dash,
  ignoreExtraplotationForScaling: false,
  lineStyle: LineStyle.Dot,
  extrapolationDashes: undefined,
  intervals: undefined,
}

export const ExtendedDefaultExtrapolationLineSeriesOptions = {
  ...ExtendedDefaultLineSeriesOptions,
  ...DefaultExtrapolationLineSeriesOptions,
}

/** Represents a series where the line can be rendered using a different style
 * or color in defined intervals of X. The style specified in the LineStyle
 * property determines how the line is rendered in these intervals. Outside
 * the intervals the style is always solid.
 */
export class ExtrapolationLineSeries extends LineSeries {
  /** Default color for the extrapolated parts of the curve. Currently, hard-coded. */
  private readonly _defaultExtrapolationColor: OxyColor = OxyColors.Black

  /** Default line style for the extrapolated parts of the curve. Currently, hard-coded. */
  private readonly _defaultExtrapolationLineStyle: LineStyle = LineStyle.Dash

  private _orderedIntervals: DataRange[] = []

  constructor(opt?: CreateExtrapolationLineSeriesOptions) {
    super(opt)
    assignObject(this, DefaultExtrapolationLineSeriesOptions, opt)
  }

  getElementName() {
    return 'ExtrapolationLineSeries'
  }

  /** Gets or sets the color for the part of the line that is inside an interval. */
  extrapolationColor: OxyColor = DefaultExtrapolationLineSeriesOptions.extrapolationColor!

  /** Gets the actual extrapolation color. */
  get actualExtrapolationColor(): OxyColor {
    return OxyColorHelper.getActualColor(this.extrapolationColor, this._defaultExtrapolationColor)
  }

  /** Gets or sets the dash array for the extrapolated intervals of the rendered line
   * (overrides ExtrapolationLineStyle). The default is undefined.
   */
  extrapolationDashes?: number[]

  /** Gets or sets the style for the extrapolated parts of the line. */
  extrapolationLineStyle: LineStyle = DefaultExtrapolationLineSeriesOptions.extrapolationLineStyle!

  /** Gets the actual extrapolation line style. */
  get actualExtrapolationLineStyle(): LineStyle {
    return this.extrapolationLineStyle !== LineStyle.Automatic
      ? this.extrapolationLineStyle
      : this._defaultExtrapolationLineStyle
  }

  /** Gets or sets a value indicating whether the extrapolated regions of the series will
   * be taken into account when calculating the minima and maxima of the dataset.
   * These regions will hence also be ignored when auto-scaling the axes.
   */
  ignoreExtraplotationForScaling: boolean = DefaultExtrapolationLineSeriesOptions.ignoreExtraplotationForScaling!

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
    const right = OxyRectHelper.right(legendBox)
    const bottom = OxyRectHelper.bottom(legendBox)
    const xmid = (legendBox.left + right) / 2
    const ymid = (legendBox.top + bottom) / 2

    let pts = [newScreenPoint(legendBox.left, ymid), newScreenPoint(xmid, ymid)]

    await rc.drawLine(
      pts,
      this.getSelectableColor(this.actualColor),
      this.strokeThickness,
      this.edgeRenderingMode,
      this.actualDashArray,
    )

    pts = [newScreenPoint(xmid, ymid), newScreenPoint(right, ymid)]

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
    this._orderedIntervals = this.mergeOverlaps(this.intervals)
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   * */
  updateMaxMin(): void {
    if (this.ignoreExtraplotationForScaling && this._orderedIntervals.length > 0) {
      this.minX = this.points
        .filter((p) => !this.inAnyInterval(p.x))
        .map((p) => p.x)
        .filter((x) => !isNaNOrUndef(x))
        .reduce((a, b) => Math.min(a, b), Number.NaN)

      this.minY = this.points
        .filter((p) => !this.inAnyInterval(p.x))
        .map((p) => p.y)
        .filter((y) => !isNaNOrUndef(y))
        .reduce((a, b) => Math.min(a, b), Number.NaN)

      this.maxX = this.points
        .filter((p) => !this.inAnyInterval(p.x))
        .map((p) => p.x)
        .filter((x) => !isNaNOrUndef(x))
        .reduce((a, b) => Math.max(a, b), Number.NaN)

      this.maxY = this.points
        .filter((p) => !this.inAnyInterval(p.x))
        .map((p) => p.y)
        .filter((y) => !isNaNOrUndef(y))
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

    const p1 = this.inverseTransform(OxyRectHelper.bottomLeft(clippingRect))
    const p2 = this.inverseTransform(OxyRectHelper.topRight(clippingRect))

    const minX = Math.min(p1.x, p2.x)
    const maxX = Math.max(p1.x, p2.x)

    const minY = Math.min(p1.y, p2.y)
    const maxY = Math.max(p1.y, p2.y)

    const clippingRectangles = this.createClippingRectangles(clippingRect, minX, maxX, minY, maxY)

    for (const rect of clippingRectangles) {
      const centerX = this.inverseTransform(OxyRectHelper.center(rect)).x

      const isInterval =
        this._orderedIntervals && this._orderedIntervals.some((i) => DataRangeHelper.contains(i, centerX))

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
    if (this._orderedIntervals && this._orderedIntervals.length > 0) {
      const flatLimits = this.flatten(this._orderedIntervals).filter((l) => l >= minX && l <= maxX)

      for (const limiter of flatLimits) {
        const rect = OxyRectHelper.fromScreenPoints(transform(this, previous, minY), transform(this, limiter, maxY))
        rectangles.push(OxyRectHelper.clip(rect, clippingRect))

        previous = limiter
      }
    }

    const rect = OxyRectHelper.fromScreenPoints(transform(this, previous, minY), transform(this, maxX, maxY))
    rectangles.push(OxyRectHelper.clip(rect, clippingRect))

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
        // previous is undefined if orderedList is empty
        const previous = orderedList[orderedList.length - 1]
        if (previous && DataRangeHelper.intersectsWith(current, previous)) {
          orderedList[orderedList.length - 1] = newDataRange(
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
    let max = this._orderedIntervals.length - 1

    while (min <= max) {
      const mid = Math.floor((min + max) / 2)
      const comparison = this.compare(this._orderedIntervals[mid], x)

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

  protected getElementDefaultValues(): any {
    return ExtendedDefaultExtrapolationLineSeriesOptions
  }
}
