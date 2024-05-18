import {
  Axis,
  type AxisLabelFormatType,
  type CreateItemsSeriesOptions,
  ExtendedDefaultItemsSeriesOptions,
  HorizontalAlignment,
  type IRenderContext,
  ItemsSeries,
  LineJoin,
  newScreenPoint,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRectHelper,
  type ScreenPoint,
  ScreenPointHelper,
  TrackerHitResult,
  type TrackerStringFormatterArgs,
  VerticalAlignment,
} from '@/oxyplot'
import { assignMethod, assignObject, getOrDefault, round, toPercent } from '@/patch'

/**
 * Represents a slice of a `PieSeries`.
 */
export interface PieSlice {
  /**
   * The fill color of the slice.
   */
  fill?: OxyColor

  /**
   * The label of the slice.
   */
  label: string

  /**
   * The value of the slice.
   */
  value: number

  /**
   * Whether the slice is exploded from the pie chart.
   */
  isExploded?: boolean
}

interface InternalPieSlice extends PieSlice {
  /**
   * The default fill color used if `fill` is not explicitly set.
   */
  defaultFillColor?: OxyColor
}

export interface PieSeriesTrackerStringFormatterArgs extends TrackerStringFormatterArgs {
  readonly item?: PieSlice
  readonly percent?: number
}

export type PieSeriesTrackerStringFormatterType = (args: PieSeriesTrackerStringFormatterArgs) => string | undefined

function getActualFillColor(slice: InternalPieSlice): OxyColor {
  return OxyColorHelper.getActualColor(slice.fill!, slice.defaultFillColor!)
}

export interface CreatePieSeriesOptions extends CreateItemsSeriesOptions {
  angleIncrement?: number
  angleSpan?: number
  areInsideLabelsAngled?: boolean
  colorField?: string
  diameter?: number
  explodedDistance?: number
  innerDiameter?: number
  insideLabelColor?: OxyColor
  insideLabelFormatter?: AxisLabelFormatType
  insideLabelPosition?: number
  isExplodedField?: string
  labelField?: string
  outsideLabelFormatter?: AxisLabelFormatType
  slices?: PieSlice[]
  startAngle?: number
  stroke?: OxyColor
  strokeThickness?: number
  tickDistance?: number
  tickHorizontalLength?: number
  tickLabelDistance?: number
  tickRadialLength?: number
  valueField?: string
  trackerStringFormatter?: PieSeriesTrackerStringFormatterType
}

export const DefaultPieSeriesOptions: CreatePieSeriesOptions = {
  angleIncrement: 1.0,
  angleSpan: 360.0,
  areInsideLabelsAngled: false,
  diameter: 1.0,
  explodedDistance: 0.0,
  innerDiameter: 0.0,
  insideLabelColor: OxyColors.Automatic,
  insideLabelPosition: 0.5,
  startAngle: 0.0,
  stroke: OxyColors.White,
  strokeThickness: 1.0,
  tickDistance: 0,
  tickHorizontalLength: 8,
  tickLabelDistance: 4,
  tickRadialLength: 6,
  fontSize: 12,

  colorField: undefined,
  insideLabelFormatter: undefined,
  isExplodedField: undefined,
  labelField: undefined,
  outsideLabelFormatter: undefined,
  slices: undefined,
  valueField: undefined,
}

export const ExtendedDefaultPieSeriesOptions = {
  ...ExtendedDefaultItemsSeriesOptions,
  ...DefaultPieSeriesOptions,
}

export type PieLabelFormatType = (slice: PieSlice, percent: number) => string

/** Represents a series for pie/circle/doughnut charts. */
export class PieSeries extends ItemsSeries {
  /**
   * The default tracker formatter
   */
  public static DefaultTrackerStringFormatter: PieSeriesTrackerStringFormatterType = function (args) {
    return `${args.xTitle}: ${round(args.xValue!, 3)} (${toPercent((args.percent || 0) / 100)})`
  }

  public static DefaultOutsideLabelFormatter = function (slice: PieSlice, percent: number) {
    return `${round(percent, 0)} %`
  }

  public static DefaultInsideLabelFormatter = function (slice: PieSlice, percent: number) {
    return slice.label
  }

  /** The actual points of the slices. */
  private _slicePoints: ScreenPoint[][] = []

  /** The total value of all the pie slices. */
  private _total: number = 0

  /** Initializes a new instance of the PieSeries class. */
  constructor(opt?: CreatePieSeriesOptions) {
    super(opt)

    this.outsideLabelFormatter = PieSeries.DefaultOutsideLabelFormatter
    assignMethod(this, 'outsideLabelFormatter', opt)
    this.insideLabelFormatter = PieSeries.DefaultInsideLabelFormatter
    assignMethod(this, 'insideLabelFormatter', opt)
    this.trackerStringFormatter = PieSeries.DefaultTrackerStringFormatter
    assignMethod(this, 'trackerStringFormatter', opt)

    assignObject(this, DefaultPieSeriesOptions, opt, {
      exclude: ['outsideLabelFormatter', 'insideLabelFormatter', 'trackerStringFormatter'],
    })
  }

  getElementName() {
    return 'PieSeries'
  }

  /** Gets or sets the angle increment. */
  public angleIncrement: number = DefaultPieSeriesOptions.angleIncrement!

  /** Gets or sets the angle span. */
  public angleSpan: number = DefaultPieSeriesOptions.angleSpan!

  /** Gets or sets a value indicating whether inside labels are angled. */
  public areInsideLabelsAngled: boolean = false

  /** Gets or sets the name of the property containing the color. */
  public colorField?: string

  /** Gets or sets the diameter. */
  public diameter: number = DefaultPieSeriesOptions.diameter!

  /** Gets or sets the exploded distance. */
  public explodedDistance: number = DefaultPieSeriesOptions.explodedDistance!

  /** Gets or sets the inner diameter. */
  public innerDiameter: number = DefaultPieSeriesOptions.innerDiameter!

  /** Gets or sets the color of the inside labels. */
  public insideLabelColor: OxyColor = DefaultPieSeriesOptions.insideLabelColor!

  /** Gets or sets the inside label format. */
  public insideLabelFormatter?: PieLabelFormatType

  /** Gets or sets the inside label position. */
  public insideLabelPosition: number = DefaultPieSeriesOptions.insideLabelPosition!

  /** Gets or sets the is exploded field. */
  public isExplodedField?: string

  /** Gets or sets the label field. */
  public labelField?: string

  /** Gets or sets the outside label format. */
  public outsideLabelFormatter?: PieLabelFormatType

  /** Gets or sets the slices. */
  public slices: PieSlice[] = []

  /** Gets or sets the start angle. */
  public startAngle: number = DefaultPieSeriesOptions.startAngle!

  /** Gets or sets the stroke color. */
  public stroke: OxyColor = DefaultPieSeriesOptions.stroke!

  /** Gets or sets the stroke thickness. */
  public strokeThickness: number = DefaultPieSeriesOptions.strokeThickness!

  /** Gets or sets the distance from the edge of the pie slice to the tick line. */
  public tickDistance: number = DefaultPieSeriesOptions.tickDistance!

  /** Gets or sets the length of the horizontal part of the tick. */
  public tickHorizontalLength: number = DefaultPieSeriesOptions.tickHorizontalLength!

  /** Gets or sets the distance from the tick line to the outside label. */
  public tickLabelDistance: number = DefaultPieSeriesOptions.tickLabelDistance!

  /** Gets or sets the length of the radial part of the tick line. */
  public tickRadialLength: number = DefaultPieSeriesOptions.tickRadialLength!

  /** Gets or sets the name of the property containing the value. */
  public valueField?: string

  /**
   * A format function used for the tracker. The default depends on the series.
   * The arguments for the formatter may be different for each type of series. See the documentation.
   */
  public trackerStringFormatter?: PieSeriesTrackerStringFormatterType

  /** Gets the point on the series that is nearest the specified point. */
  public getNearestPoint(point: ScreenPoint, _interpolate: boolean): TrackerHitResult | undefined {
    const trackerStringFormatter = this.trackerStringFormatter

    for (let i = 0; i < this._slicePoints.length; i++) {
      if (ScreenPointHelper.isPointInPolygon(point, this._slicePoints[i])) {
        const slice = this.slices[i]
        const item = this.getItem(i)

        const text = trackerStringFormatter
          ? trackerStringFormatter({
              item,
              title: this.title,
              xTitle: slice.label,
              xValue: slice.value,
              percent: (slice.value / this._total) * 100,
            })
          : undefined

        return new TrackerHitResult({
          series: this,
          position: point,
          item: item,
          index: i,
          text,
        })
      }
    }
    return undefined
  }

  /** Renders the series on the specified render context. */
  public async render(rc: IRenderContext): Promise<void> {
    this._slicePoints = []

    if (this.slices.length === 0) {
      return
    }

    this._total = this.slices.reduce((sum, slice) => sum + slice.value, 0)
    if (Math.abs(this._total) <= 0) {
      return
    }

    // todo: reduce available size due to the labels
    const radius = Math.min(this.plotModel.plotArea.width, this.plotModel.plotArea.height) / 2

    const outerRadius = radius * (this.diameter - this.explodedDistance)
    const innerRadius = radius * this.innerDiameter

    let angle = this.startAngle
    const right = OxyRectHelper.right(this.plotModel.plotArea)
    const bottom = OxyRectHelper.bottom(this.plotModel.plotArea)
    const midPoint = newScreenPoint(
      (this.plotModel.plotArea.left + right) * 0.5,
      (this.plotModel.plotArea.top + bottom) * 0.5,
    )

    for (const slice of this.slices) {
      const outerPoints: ScreenPoint[] = []
      const innerPoints: ScreenPoint[] = []

      const sliceAngle = (slice.value / this._total) * this.angleSpan
      const endAngle = angle + sliceAngle
      const explodedRadius = slice.isExploded ? this.explodedDistance * radius : 0

      const midAngle = angle + sliceAngle / 2
      const midAngleRadians = (midAngle * Math.PI) / 180
      const mp = newScreenPoint(
        midPoint.x + explodedRadius * Math.cos(midAngleRadians),
        midPoint.y + explodedRadius * Math.sin(midAngleRadians),
      )

      // Create the pie sector points for both outside and inside arcs
      // eslint-disable-next-line no-constant-condition
      while (true) {
        let stop = false
        if (angle >= endAngle) {
          angle = endAngle
          stop = true
        }

        const a = (angle * Math.PI) / 180
        const op = newScreenPoint(mp.x + outerRadius * Math.cos(a), mp.y + outerRadius * Math.sin(a))
        outerPoints.push(op)
        const ip = newScreenPoint(mp.x + innerRadius * Math.cos(a), mp.y + innerRadius * Math.sin(a))
        if (innerRadius + explodedRadius > 0) {
          innerPoints.push(ip)
        }

        if (stop) {
          break
        }

        angle += this.angleIncrement
      }

      innerPoints.reverse()
      if (innerPoints.length === 0) {
        innerPoints.push(mp)
      }

      innerPoints.push(outerPoints[0])

      const points = [...outerPoints, ...innerPoints]

      await rc.drawPolygon(
        points,
        getActualFillColor(slice),
        this.stroke,
        this.strokeThickness,
        this.edgeRenderingMode,
        undefined,
        LineJoin.Bevel,
      )

      // keep the point for hit testing
      this._slicePoints.push(points)

      // Render label outside the slice
      if (this.outsideLabelFormatter) {
        const label = this.outsideLabelFormatter(slice, (slice.value / this._total) * 100)
        const sign = Math.sign(Math.cos(midAngleRadians))

        // tick points
        const tp0 = newScreenPoint(
          mp.x + (outerRadius + this.tickDistance) * Math.cos(midAngleRadians),
          mp.y + (outerRadius + this.tickDistance) * Math.sin(midAngleRadians),
        )
        const tp1 = newScreenPoint(
          tp0.x + this.tickRadialLength * Math.cos(midAngleRadians),
          tp0.y + this.tickRadialLength * Math.sin(midAngleRadians),
        )
        const tp2 = newScreenPoint(tp1.x + this.tickHorizontalLength * sign, tp1.y)

        // draw the tick line with the same color as the text
        await rc.drawLine([tp0, tp1, tp2], this.actualTextColor, 1, this.edgeRenderingMode, undefined, LineJoin.Bevel)

        // label
        const labelPosition = newScreenPoint(tp2.x + this.tickLabelDistance * sign, tp2.y)
        await rc.drawText(
          labelPosition,
          label,
          this.actualTextColor,
          this.actualFont,
          this.actualFontSize,
          this.actualFontWeight,
          0,
          sign > 0 ? HorizontalAlignment.Left : HorizontalAlignment.Right,
          VerticalAlignment.Middle,
        )
      }

      // Render a label inside the slice
      if (this.insideLabelFormatter && !OxyColorHelper.isUndefined(this.insideLabelColor)) {
        const label = this.insideLabelFormatter(slice, (slice.value / this._total) * 100)

        const r = innerRadius * (1 - this.insideLabelPosition) + outerRadius * this.insideLabelPosition
        const labelPosition = newScreenPoint(mp.x + r * Math.cos(midAngleRadians), mp.y + r * Math.sin(midAngleRadians))
        let textAngle = 0
        if (this.areInsideLabelsAngled) {
          textAngle = midAngle
          if (Math.cos(midAngleRadians) < 0) {
            textAngle += 180
          }
        }

        const actualInsideLabelColor = OxyColorHelper.isAutomatic(this.insideLabelColor)
          ? this.actualTextColor
          : this.insideLabelColor

        await rc.drawText(
          labelPosition,
          label,
          actualInsideLabelColor,
          this.actualFont,
          this.actualFontSize,
          this.actualFontWeight,
          textAngle,
          HorizontalAlignment.Center,
          VerticalAlignment.Middle,
        )
      }
    }
  }

  /** Renders the legend symbol on the specified render context. */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {}

  /**
   * Checks if this data series requires X/Y axes.
   * @internal
   * */
  areAxesRequired(): boolean {
    return false
  }

  /**
   * Ensures that the axes of the series is defined.
   * @internal
   * */
  ensureAxes(): void {}

  /**
   * Check if the data series is using the specified axis.
   * @internal
   */
  isUsing(axis: Axis): boolean {
    return false
  }

  /**
   * Sets the default values.
   * @internal
   */
  setDefaultValues(): void {
    for (const slice of this.slices) {
      slice.fill = slice.fill || OxyColors.Automatic
      if (OxyColorHelper.isAutomatic(slice.fill)) {
        ;(slice as InternalPieSlice).defaultFillColor = this.plotModel.getDefaultColor()
      }
    }
  }

  /**
   * Updates the maximum and minimum values of the axes used by this series.
   * @internal
   */
  updateAxisMaxMin(): void {}

  /**
   * Updates the data.
   * @internal
   */
  updateData(): void {
    if (!this.itemsSource) {
      return
    }

    this.slices = []

    for (const item of this.itemsSource) {
      const label = getOrDefault(item, this.labelField, '')!
      const value = getOrDefault(item, this.valueField, NaN)!
      const color = getOrDefault(item, this.colorField, OxyColors.Automatic)
      const isExploded = getOrDefault(item, this.isExplodedField, false)
      this.slices.push({
        label,
        value,
        fill: color,
        isExploded: isExploded,
      })
    }
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   * */
  updateMaxMin(): void {}

  protected getElementDefaultValues(): any {
    return ExtendedDefaultPieSeriesOptions
  }
}
