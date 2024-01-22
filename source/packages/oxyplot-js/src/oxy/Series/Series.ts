import type { CreatePlotElementOptions, HitTestResult, IRenderContext, ScreenPoint } from '@/oxyplot'
import {
  Axis,
  HitTestArguments,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotElement,
  screenPointDistanceTo,
  TrackerHitResult,
} from '@/oxyplot'

export type LabelStringFormatterType = (item: any, trackerParameters: any[]) => any

export interface TrackerStringFormatterArgs extends Record<string, any> {
  item?: any
  title?: string
  xTitle?: string
  xValue?: any
  yTitle?: string
  yValue?: any
  colorAxisTitle?: string
  zTitle?: string
  zValue?: any
  value?: any
}

export type TrackerStringFormatterType = (args: TrackerStringFormatterArgs) => string | undefined

export interface CreateSeriesOptions extends CreatePlotElementOptions {
  background?: OxyColor
  isVisible?: boolean
  title?: string
  legendKey?: string
  seriesGroupName?: string
  renderInLegend?: boolean
  trackerStringFormatter?: TrackerStringFormatterType
  trackerKey?: string
}

/**
 * Provides an abstract base class for plot series.
 * This class contains internal methods that should be called only from the PlotModel.
 */
export abstract class Series extends PlotElement {
  /**
   * Initializes a new instance of the Series class.
   */
  protected constructor(opt?: CreateSeriesOptions) {
    super(opt)
    this.isVisible = true
    this.background = OxyColors.Undefined
    this.renderInLegend = true
  }

  /**
   * The background color of the series. The default is OxyColors.Undefined.
   * This property defines the background color in the area defined by the x and y axes used by this series.
   */
  public background: OxyColor

  /**
   * A value indicating whether this series is visible. The default is true.
   */
  public isVisible: boolean

  /**
   * The title of the series. The default is null.
   * The title that is shown in the legend of the plot. The default value is null.
   */
  public title?: string

  /**
   * The key for the Legend to use on this series. The default is null.
   * This key may be used by the plot model to show a custom Legend for the series.
   */
  public legendKey?: string

  /**
   * The groupname for the Series. The default is null.
   * This groupname may for e.g. be used by the Legend class to group series into separated blocks.
   */
  public seriesGroupName?: string

  /**
   * A value indicating whether the series should be rendered in the legend. The default is true.
   */
  public renderInLegend: boolean

  /**
   * A format function used for the tracker. The default depends on the series.
   * The arguments for the formatter may be different for each type of series. See the documentation.
   */
  public trackerStringFormatter?: TrackerStringFormatterType = undefined

  /**
   * The key for the tracker to use on this series. The default is null.
   * This key may be used by the plot view to show a custom tracker for the series.
   */
  public trackerKey?: string

  /**
   * Gets the point on the series that is nearest the specified point.
   * @param point The point.
   * @param interpolate Interpolate the series if this flag is set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    return undefined
  }

  /**
   * Renders the series on the specified render context.
   * @param rc The rendering context.
   */
  public abstract render(rc: IRenderContext): Promise<void>

  /**
   * Renders the legend symbol on the specified render context.
   * @param rc The rendering context.
   * @param legendBox The legend rectangle.
   */
  public abstract renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void>

  /**
   * Checks if this data series requires X/Y axes. (e.g. Pie series do not require axes)
   * @returns true if axes are required.
   * @internal
   */
  abstract areAxesRequired(): boolean

  /**
   * Ensures that the axes of the series are defined.
   * @internal
   */
  abstract ensureAxes(): void

  /**
   * Checks if the data series is using the specified axis.
   * @param axis The axis that should be checked.
   * @returns true if the axis is in use.
   * @internal
   */
  abstract isUsing(axis: Axis): boolean

  /**
   * Sets the default values (colors, line style etc.) from the plot model.
   * @internal
   */
  abstract setDefaultValues(): void

  /**
   * Updates the maximum and minimum values of the axes used by this series.
   * @internal
   */
  abstract updateAxisMaxMin(): void

  /**
   * Updates the data of the series.
   * @internal
   */
  abstract updateData(): void

  /**
   * Updates the maximum and minimum values of the series.
   * This method is called when the PlotModel is updated with the updateData parameter set to true.
   * @internal
   */
  abstract updateMaxMin(): void

  /**
   * When overridden in a derived class, tests if the plot element is hit by the specified point.
   * @param args The hit test arguments.
   * @returns The result of the hit test.
   */
  protected hitTestOverride(args: HitTestArguments): HitTestResult | undefined {
    const thr = this.getNearestPoint(args.point, true) || this.getNearestPoint(args.point, false)

    if (thr?.position) {
      const distance = screenPointDistanceTo(thr.position, args.point)
      if (distance > args.tolerance) {
        return undefined
      }

      return {
        element: this,
        nearestHitPoint: thr.position,
        item: thr.item,
        index: thr.index,
      }
    }

    return undefined
  }
}
