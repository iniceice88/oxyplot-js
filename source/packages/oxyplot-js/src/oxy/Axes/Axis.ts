import type { AxisChangedEventArgs, CreatePlotElementOptions, DataPoint, IRenderContext, ScreenPoint } from '@/oxyplot'
import {
  AxisChangeTypes,
  AxisLayer,
  AxisPosition,
  AxisUtilities,
  FontWeights,
  HorizontalAndVerticalAxisRenderer,
  LineStyle,
  newDataPoint,
  newScreenPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  OxySize,
  OxyThickness,
  PlotElement,
  RenderingExtensions,
  ScreenPoint_Undefined,
  TickStyle,
} from '@/oxyplot'
import { isInfinity, isNullOrUndef, Number_MAX_VALUE, Number_MIN_VALUE, pettyNumber } from '@/patch'

export type AxisStringFormatterType = (x: any, ...args: any[]) => string
export type AxisLabelFormatType = AxisStringFormatterType
export type AxisTitleFormatterType = (title: string, unit: string) => string

export interface TickValuesType {
  /* The major label values */
  majorLabelValues: number[]
  /* The major tick values */
  majorTickValues: number[]
  /* The minor tick values */
  minorTickValues: number[]
}

export interface CreateAxisAxisOptions extends CreatePlotElementOptions {
  position?: AxisPosition
  positionTier?: number
  isAxisVisible?: boolean
  layer?: AxisLayer
  viewMaximum?: number
  viewMinimum?: number
  absoluteMaximum?: number
  absoluteMinimum?: number
  minimum?: number
  maximum?: number
  minorStep?: number
  majorStep?: number
  minimumMinorStep?: number
  minimumMajorStep?: number
  minimumMajorIntervalCount?: number
  maximumMajorIntervalCount?: number
  minimumPadding?: number
  maximumPadding?: number
  minimumRange?: number
  maximumRange?: number
  minimumDataMargin?: number
  maximumDataMargin?: number
  minimumMargin?: number
  maximumMargin?: number
  tickStyle?: TickStyle
  ticklineColor?: OxyColor
  minorTicklineColor?: OxyColor
  axislineStyle?: LineStyle
  axislineColor?: OxyColor
  axislineThickness?: number
  majorGridlineStyle?: LineStyle
  majorGridlineColor?: OxyColor
  majorGridlineThickness?: number
  minorGridlineStyle?: LineStyle
  minorGridlineColor?: OxyColor
  minorGridlineThickness?: number
  extraGridlines?: number[]
  extraGridlineStyle?: LineStyle
  extraGridlineColor?: OxyColor
  extraGridlineThickness?: number
  minorTickSize?: number
  majorTickSize?: number
  startPosition?: number
  stringFormatter?: AxisStringFormatterType
  endPosition?: number
  title?: string
  titlePosition?: number
  unit?: string
  useSuperExponentialFormat?: boolean
  titleFormatter?: AxisTitleFormatterType
  titleClippingLength?: number
  titleColor?: OxyColor
  titleFontSize?: number
  titleFontWeight?: FontWeights
  clipTitle?: boolean
  angle?: number
  isZoomEnabled?: boolean
  key?: string
  isPanEnabled?: boolean
  filterMinValue?: number
  filterMaxValue?: number
  filterFunction?: any
  intervalLength?: number
  axisDistance?: number
  axisTitleDistance?: number
  axisTickToLabelDistance?: number
  dataMaximum?: number
  dataMinimum?: number
  labelFormatter?: AxisLabelFormatType
  positionAtZeroCrossing?: boolean
  cropGridlines?: boolean
}

/**
 * Provides an abstract base class for axes.
 */
export abstract class Axis extends PlotElement {
  /**
   * Exponent function.
   */
  protected static readonly Exponent = (x: number): number =>
    Math.floor(this.ThresholdRound(Math.log(Math.abs(x)) / Math.LN10))

  /**
   * Mantissa function.
   */
  protected static readonly Mantissa = (x: number): number => this.ThresholdRound(x / Math.pow(10, this.Exponent(x)))

  /**
   * Rounds a value if the difference between the rounded value and the original value is less than 1e-6.
   */
  protected static readonly ThresholdRound = (x: number): number =>
    Math.abs(Math.round(x) - x) < 1e-6 ? Math.round(x) : x

  /**
   * The offset.
   */
  private _offset: number = 0

  /**
   * The scale.
   */
  private _scale: number = 1

  /**
   * Initializes a new instance of the Axis class.
   */
  protected constructor(opt?: CreateAxisAxisOptions) {
    super(opt)
    this.position = AxisPosition.Left
    this.positionTier = 0
    this.isAxisVisible = true
    this.layer = AxisLayer.BelowSeries

    this.viewMaximum = Number.NaN
    this.viewMinimum = Number.NaN

    this.absoluteMaximum = Number_MAX_VALUE
    this.absoluteMinimum = Number_MIN_VALUE

    this.minimum = Number.NaN
    this.maximum = Number.NaN
    this.minorStep = Number.NaN
    this.majorStep = Number.NaN
    this.minimumMinorStep = 0
    this.minimumMajorStep = 0
    this.minimumMajorIntervalCount = 2
    this.maximumMajorIntervalCount = Number_MAX_VALUE

    this.minimumPadding = 0.01
    this.maximumPadding = 0.01
    this.minimumRange = 0
    this.maximumRange = Number.POSITIVE_INFINITY
    this.minimumDataMargin = 0
    this.maximumDataMargin = 0
    this.minimumMargin = 0
    this.maximumMargin = 0

    this.tickStyle = TickStyle.Outside
    this.ticklineColor = OxyColors.Black
    this.minorTicklineColor = OxyColors.Automatic

    this.axislineStyle = LineStyle.None
    this.axislineColor = OxyColors.Black
    this.axislineThickness = 1.0

    this.majorGridlineStyle = LineStyle.None
    this.majorGridlineColor = OxyColor.fromArgb(0x40, 0, 0, 0)
    this.majorGridlineThickness = 1

    this.minorGridlineStyle = LineStyle.None
    this.minorGridlineColor = OxyColor.fromArgb(0x20, 0, 0, 0x00)
    this.minorGridlineThickness = 1

    this.extraGridlineStyle = LineStyle.Solid
    this.extraGridlineColor = OxyColors.Black
    this.extraGridlineThickness = 1

    this.minorTickSize = 4
    this.majorTickSize = 7

    this.startPosition = 0
    this.endPosition = 1

    this.titlePosition = 0.5
    this.titleFormatter = (title: string, unit: string) => `${title || ''} [${unit || ''}]`
    this.titleClippingLength = 0.9
    this.titleColor = OxyColors.Automatic
    this.titleFontSize = Number.NaN
    this.titleFontWeight = FontWeights.Normal
    this.clipTitle = true

    this.angle = 0

    this.isZoomEnabled = true
    this.isPanEnabled = true

    this.filterMinValue = Number_MIN_VALUE
    this.filterMaxValue = Number_MAX_VALUE
    this.filterFunction = undefined

    this.intervalLength = 60

    this.axisDistance = 0
    this.axisTitleDistance = 4
    this.axisTickToLabelDistance = 4

    this.dataMaximum = Number.NaN
    this.dataMinimum = Number.NaN
  }

  /**
   * Occurs when the axis has been changed (by zooming, panning or resetting).
   * @deprecated May be removed in v4.0 (#111)
   */
  public axisChanged?: (sender: any, event: AxisChangedEventArgs) => void

  /**
   * Occurs when the transform changed (size or axis range was changed).
   * @deprecated May be removed in v4.0 (#111)
   */
  public transformChanged?: (sender: any) => void

  /**
   * Gets or sets the absolute maximum. This is only used for the UI control. It will not be possible to zoom/pan beyond this limit. The default value is Number.MAX_VALUE.
   */
  public absoluteMaximum: number

  /**
   * Gets or sets the absolute minimum. This is only used for the UI control. It will not be possible to zoom/pan beyond this limit. The default value is Number.MIN_VALUE.
   */
  public absoluteMinimum: number

  private _actualMajorStep: number = 0
  /**
   * Gets or sets the actual major step.
   */
  public get actualMajorStep(): number {
    return this._actualMajorStep
  }

  protected set actualMajorStep(value: number) {
    this._actualMajorStep = value
  }

  /**
   * Gets or sets the minimum number of major intervals on the axis.
   * Non-integer values are accepted.
   */
  public minimumMajorIntervalCount: number

  /**
   * Gets or sets the minimum number of major intervals on the axis.
   * Non-integer values are accepted.
   * The maximum will be bounded according to the IntervalLength.
   * The MinimumMajorIntervalCount takes precedence over the MaximumMajorIntervalCount when determining the major step.
   */
  public maximumMajorIntervalCount: number

  private _actualMaximum: number = 0
  /**
   * Gets or sets the actual maximum value of the axis.
   * If ViewMaximum is not NaN, this value will be defined by ViewMaximum.
   * Otherwise, if Maximum is not NaN, this value will be defined by Maximum.
   * Otherwise, this value will be defined by the maximum (+padding) of the data.
   */
  public get actualMaximum(): number {
    return this._actualMaximum
  }

  protected set actualMaximum(value: number) {
    this._actualMaximum = value
  }

  private _actualMinimum: number = 0
  /**
   * Gets or sets the actual minimum value of the axis.
   * If ViewMinimum is not NaN, this value will be defined by ViewMinimum.
   * Otherwise, if Minimum is not NaN, this value will be defined by Minimum.
   * Otherwise, this value will be defined by the minimum (+padding) of the data.
   */
  public get actualMinimum(): number {
    return this._actualMinimum
  }

  protected set actualMinimum(value: number) {
    this._actualMinimum = value
  }

  private _clipMaximum: number = 0
  /**
   * Gets or sets the maximum displayed value on the axis, as determined by the ActualMaximum and MaximumDataMargin.
   * The value is refreshed by UpdateTransform(OxyRect), which is called before any plot elements are rendered.
   */
  public get clipMaximum(): number {
    return this._clipMaximum
  }

  protected set clipMaximum(value: number) {
    this._clipMaximum = value
  }

  private _clipMinimum: number = 0
  /**
   * Gets or sets the minimum displayed value on the axis, as determined by the ActualMinimum and MinimumDataMargin.
   * The value is refreshed by UpdateTransform(OxyRect), which is called before any plot elements are rendered.
   */
  public get clipMinimum(): number {
    return this._clipMinimum
  }

  protected set clipMinimum(value: number) {
    this._clipMinimum = value
  }

  private _actualMinorStep: number = 0
  /**
   * Gets or sets the actual minor step.
   */
  public get actualMinorStep(): number {
    return this._actualMinorStep
  }

  protected set actualMinorStep(value: number) {
    this._actualMinorStep = value
  }

  private _actualStringFormatter?: AxisStringFormatterType
  /**
   * Gets or sets the actual string format being used.
   */
  public get actualStringFormatter(): AxisStringFormatterType | undefined {
    return this._actualStringFormatter
  }

  protected set actualStringFormatter(value: AxisStringFormatterType | undefined) {
    this._actualStringFormatter = value
  }

  /**
   * Gets the actual title of the axis.
   * If the Unit property is set, the titleFormatter property is used to format the actual title.
   */
  public get actualTitle(): string | undefined {
    if (this.unit) {
      return `${this.title} [${this.unit}]`
    }

    return this.title
  }

  /**
   * Gets or sets the orientation angle (degrees) for the axis labels. The default value is 0.
   */
  public angle: number

  /**
   * Gets or sets the distance from the end of the tick lines to the labels. The default value is 4.
   */
  public axisTickToLabelDistance: number

  /**
   * Gets or sets the minimum distance from the axis labels to the axis title. The default value is 4.
   */
  public axisTitleDistance: number

  /**
   * Gets or sets the distance between the plot area and the axis. The default value is 0.
   */
  public axisDistance: number

  /**
   * Gets or sets the color of the axis line. The default value is OxyColors.Black.
   */
  public axislineColor: OxyColor

  /**
   * Gets or sets the line style of the axis line. The default value is LineStyle.None.
   */
  public axislineStyle: LineStyle

  /**
   * Gets or sets the thickness of the axis line. The default value is 1.
   */
  public axislineThickness: number

  /**
   * Gets or sets a value indicating whether to clip the axis title. The default value is true.
   */
  public clipTitle: boolean

  /**
   * Gets or sets a value indicating whether to crop gridlines with perpendicular axes Start/EndPositions. The default value is false.
   */
  public cropGridlines: boolean = false

  private _dataMaximum: number = 0
  /**
   * Gets or sets the maximum value of the data displayed on this axis.
   */
  public get dataMaximum(): number {
    return this._dataMaximum
  }

  protected set dataMaximum(value: number) {
    this._dataMaximum = value
  }

  private _dataMinimum: number = 0
  /**
   * Gets or sets the minimum value of the data displayed on this axis.
   */
  public get dataMinimum(): number {
    return this._dataMinimum
  }

  protected set dataMinimum(value: number) {
    this._dataMinimum = value
  }

  /**
   * Gets or sets the end position of the axis on the plot area. The default value is 1.
   * The position is defined by a fraction in the range from 0 to 1, where 0 is at the bottom/left
   * and 1 is at the top/right.
   */
  public endPosition: number

  /**
   * Gets or sets the color of the extra gridlines. The default value is OxyColors.Black.
   */
  public extraGridlineColor: OxyColor

  /**
   * Gets or sets the line style of the extra gridlines. The default value is LineStyle.Solid.
   */
  public extraGridlineStyle: LineStyle

  /**
   * Gets or sets the thickness of the extra gridlines. The default value is 1.
   */
  public extraGridlineThickness: number

  /**
   * Gets or sets the values for the extra gridlines. The default value is null.
   */
  public extraGridlines?: number[]

  /**
   * Gets or sets the filter function. The default value is null.
   */
  public filterFunction?: (value: number) => boolean

  /**
   * Gets or sets the maximum value that can be shown using this axis. Values greater or equal to this value will not be shown. The default value is Number.MAX_VALUE.
   */
  public filterMaxValue: number

  /**
   * Gets or sets the minimum value that can be shown using this axis. Values smaller or equal to this value will not be shown. The default value is Number.MIN_VALUE.
   */
  public filterMinValue: number

  /**
   * Gets or sets the maximum length (screen space) of the intervals. The available length of the axis will be divided by this length to get the approximate number of major intervals on the axis. The default value is 60.
   */
  public intervalLength: number

  /**
   * Gets or sets a value indicating whether this axis is visible. The default value is true.
   */
  public isAxisVisible: boolean

  /**
   * Gets or sets a value indicating whether panning is enabled. The default value is true.
   */
  public isPanEnabled: boolean

  /**
   * Gets a value indicating whether this axis is reversed. It is reversed if StartPosition > EndPosition.
   */
  public get isReversed(): boolean {
    return this.startPosition > this.endPosition
  }

  /**
   * Gets or sets a value indicating whether zooming is enabled. The default value is true.
   */
  public isZoomEnabled: boolean

  /**
   * Gets or sets the key of the axis. This can be used to specify an axis if you have defined multiple axes in a plot. The default value is null.
   */
  public key?: string

  /**
   * Gets or sets the formatting function for the labels. The default value is null.
   * This function can be used instead of overriding the FormatValue method.
   */
  public labelFormatter?: AxisLabelFormatType

  /**
   * Gets or sets the layer of the axis. The default value is AxisLayer.BelowSeries.
   */
  public layer: AxisLayer

  /**
   * Gets or sets the color of the major gridlines. The default value is #40000000.
   */
  public majorGridlineColor: OxyColor

  /**
   * Gets or sets the line style of the major gridlines. The default value is LineStyle.None.
   */
  public majorGridlineStyle: LineStyle

  /**
   * Gets or sets the thickness of the major gridlines. The default value is 1.
   */
  public majorGridlineThickness: number

  /**
   * Gets or sets the interval between major ticks. The default value is NaN.
   */
  public majorStep: number

  /**
   * Gets or sets the size of the major ticks. The default value is 7.
   */
  public majorTickSize: number

  /**
   * Gets or sets the maximum value of the axis. The default value is NaN.
   */
  public maximum: number

  /**
   * Gets or sets the 'padding' fraction of the maximum value. The default value is 0.01.
   * A value of 0.01 gives 1% more space on the maximum end of the axis. This property is not used if the Maximum property is set.
   */
  public maximumPadding: number

  /**
   * Gets or sets the screen-space data margin at the maximum. The default value is 0.
   * The number of device independent units to included between the ClipMaximum and ActualMaximum.
   */
  public maximumDataMargin: number

  /**
   * Gets or sets the screen-space margin at the maximum. The default value is 0.
   * The number of device independent units to be left empty between the axis and the EndPosition.
   */
  public maximumMargin: number

  /**
   * Gets or sets the maximum range of the axis. Setting this property ensures that ActualMaximum-ActualMinimum < MaximumRange. The default value is Number.POSITIVE_INFINITY.
   */
  public maximumRange: number

  /**
   * Gets or sets the minimum value of the axis. The default value is NaN.
   */
  public minimum: number

  /**
   * Gets or sets the minimum value for the interval between major ticks. The default value is 0.
   */
  public minimumMajorStep: number

  /**
   * Gets or sets the minimum value for the interval between minor ticks. The default value is 0.
   */
  public minimumMinorStep: number

  /**
   * Gets or sets the 'padding' fraction of the minimum value. The default value is 0.01.
   * A value of 0.01 gives 1% more space on the minimum end of the axis. This property is not used if the Minimum property is set.
   */
  public minimumPadding: number

  /**
   * Gets or sets the screen-space data margin at the minimum. The default value is 0.
   * The number of device independent units to included between the ClipMinimum and ActualMinimum.
   */
  public minimumDataMargin: number

  /**
   * Gets or sets the screen-space margin at the minimum. The default value is 0.
   * The number of device independent units to be left empty between the axis the StartPosition.
   */
  public minimumMargin: number

  /**
   * Gets or sets the minimum range of the axis. Setting this property ensures that ActualMaximum-ActualMinimum > MinimumRange. The default value is 0.
   */
  public minimumRange: number

  /**
   * Gets or sets the color of the minor gridlines. The default value is #20000000.
   */
  public minorGridlineColor: OxyColor

  /**
   * Gets or sets the line style of the minor gridlines. The default value is LineStyle.None.
   */
  public minorGridlineStyle: LineStyle

  /**
   * Gets or sets the thickness of the minor gridlines. The default value is 1.
   */
  public minorGridlineThickness: number

  /**
   * Gets or sets the interval between minor ticks. The default value is NaN.
   */
  public minorStep: number

  /**
   * Gets or sets the color of the minor ticks. The default value is OxyColors.Automatic.
   * If the value is OxyColors.Automatic, the value of
   * Axis.TicklineColor will be used.
   */
  public minorTicklineColor: OxyColor

  /**
   * Gets or sets the size of the minor ticks. The default value is 4.
   */
  public minorTickSize: number

  /**
   * Gets the offset. This is used to transform between data and screen coordinates.
   */
  public get offset(): number {
    return this._offset
  }

  /**
   * Gets or sets the position of the axis. The default value is AxisPosition.Left.
   */
  public position: AxisPosition = AxisPosition.Left

  /**
   * Gets or sets a value indicating whether the axis should be positioned at the zero-crossing of the related axis. The default value is false.
   */
  public positionAtZeroCrossing = false

  /**
   * Gets or sets the position tier which defines in which tier the axis is displayed. The default value is 0.
   * The bigger the value the further afar is the axis from the graph.
   */
  public positionTier = 0

  /**
   * Gets the scaling factor of the axis. This is used to transform between data and screen coordinates.
   */
  public get scale(): number {
    return this._scale
  }

  private _screenMax: ScreenPoint = ScreenPoint_Undefined
  /**
   * Gets or sets the screen coordinate of the maximum end of the axis.
   */
  public get screenMax(): ScreenPoint {
    return this._screenMax
  }

  protected set screenMax(value: ScreenPoint) {
    this._screenMax = value
  }

  private _screenMin: ScreenPoint = ScreenPoint_Undefined
  /**
   * Gets or sets the screen coordinate of the minimum end of the axis.
   */
  public get screenMin(): ScreenPoint {
    return this._screenMin
  }

  protected set screenMin(value: ScreenPoint) {
    this._screenMin = value
  }

  /**
   * Gets or sets the start position of the axis on the plot area. The default value is 0.
   * The position is defined by a fraction in the range from 0 to 1, where 0 is at the bottom/left
   * and 1 is at the top/right.
   */
  public startPosition: number

  /**
   * Gets or sets the string format used for formatting the axis values. The default value is null.
   */
  public stringFormatter?: AxisStringFormatterType

  /**
   * Gets or sets the tick style for major and minor ticks. The default value is TickStyle.Outside.
   */
  public tickStyle: TickStyle

  /**
   * Gets or sets the color of the major and minor ticks. The default value is OxyColors.Black.
   */
  public ticklineColor: OxyColor

  /**
   * Gets or sets the title of the axis. The default value is null.
   */
  public title?: string

  /**
   * Gets or sets the length of the title clipping rectangle (fraction of the available length of the axis). The default value is 0.9.
   */
  public titleClippingLength: number

  /**
   * Gets or sets the color of the title. The default value is OxyColors.Automatic.
   * If the value is null, the PlotModel.TextColor will be used.
   */
  public titleColor: OxyColor

  /**
   * Gets or sets the title font. The default value is null.
   */
  public titleFont?: string

  /**
   * Gets or sets the size of the title font. The default value is NaN.
   */
  public titleFontSize: number

  /**
   * Gets or sets the weight of the title font. The default value is FontWeights.Normal.
   */
  public titleFontWeight: number

  /**
   * Gets or sets the formatter used for formatting the title and unit when Unit is defined.
   * The default value is "{0} [{1}]", where {0} refers to the Title and {1} refers to the Unit.
   * If Unit is null, the actual title is defined by Title only.
   */
  public titleFormatter: AxisTitleFormatterType

  /**
   * Gets or sets the position of the title. The default value is 0.5.
   * The position is defined by a fraction in the range 0 to 1.
   */
  public titlePosition: number

  /**
   * Gets or sets the unit of the axis. The default value is null.
   * The titleFormatter is used to format the title including this unit.
   */
  public unit?: string

  /**
   * Gets or sets a value indicating whether to use superscript exponential format. The default value is false.
   * This format will convert 1.5E+03 to 1.5·10^{3} and render the superscript properly.
   * If StringFormatter is null, 1.0E+03 will be converted to 10^{3}, otherwise it will use the formatter for the mantissa.
   */
  public useSuperExponentialFormat: boolean = false

  private _desiredMargin: OxyThickness = OxyThickness.Zero
  /**
   * Gets or sets the desired margins such that the axis text ticks will not be clipped.
   * The actual margins may be smaller or larger than the desired margins if they are set manually.
   */
  public get desiredMargin(): OxyThickness {
    return this._desiredMargin
  }

  protected set desiredMargin(value: OxyThickness) {
    this._desiredMargin = value
  }

  /**
   * Gets or sets the position tier max shift.
   * @internal
   */
  positionTierMaxShift: number = 0

  /**
   * Gets or sets the position tier min shift.
   * @internal
   */
  positionTierMinShift: number = 0

  /**
   * Gets or sets the size of the position tier.
   * @internal
   */
  positionTierSize: number = 0

  /**
   * Gets the actual color of the title.
   * @internal
   */
  get actualTitleColor(): OxyColor {
    return this.titleColor.getActualColor(this.plotModel.textColor)
  }

  /**
   * Gets the actual title font.
   * @internal
   */
  get actualTitleFont(): string {
    return this.titleFont || this.plotModel.defaultFont
  }

  /**
   * Gets the actual size of the title font.
   * @internal
   */
  get actualTitleFontSize(): number {
    return !isNaN(this.titleFontSize) ? this.titleFontSize : this.actualFontSize
  }

  /**
   * Gets the actual title font weight.
   * @internal
   */
  get actualTitleFontWeight(): number {
    return !isNaN(this.titleFontWeight) ? this.titleFontWeight : this.actualFontWeight
  }

  /**
   * Gets or sets the current view's maximum. This value is used when the user zooms or pans.
   */
  protected viewMaximum: number

  /**
   * Gets or sets the current view's minimum. This value is used when the user zooms or pans.
   */
  protected viewMinimum: number

  /**
   * Converts the specified value to a number.
   * @param item
   * @protected
   */
  itemToDouble(item: any): number {
    return Number(item)
  }

  /**
   * Transforms the specified point from screen space to data space.
   * @param p The point.
   * @param xaxis The x axis.
   * @param yaxis The y axis.
   * @returns The data point.
   */
  public static inverseTransform(p: ScreenPoint, xaxis: Axis, yaxis: Axis): DataPoint {
    return xaxis.inverseTransformPoint(p.x, p.y, yaxis)
  }

  /**
   * Formats the value to be used on the axis.
   * @param x The value.
   * @returns The formatted value.
   */
  public formatValue(x: number): string {
    if (this.labelFormatter) {
      return this.labelFormatter(x)
    }

    return this.formatValueOverride(x)
  }

  /**
   * Gets the coordinates used to draw ticks and tick labels (numbers or category names).
   */
  public getTickValues(): TickValuesType {
    const majorLabelValues: number[] = []
    const majorTickValues: number[] = []
    const minorTickValues: number[] = []

    const minorTickValuesTemp = this.createTickValues(this.clipMinimum, this.clipMaximum, this.actualMinorStep)
    majorTickValues.push(...this.createTickValues(this.clipMinimum, this.clipMaximum, this.actualMajorStep))
    majorLabelValues.push(...majorTickValues)

    minorTickValues.push(...AxisUtilities.filterRedundantMinorTicks(majorTickValues, minorTickValuesTemp))
    return {
      majorLabelValues,
      majorTickValues,
      minorTickValues,
    }
  }

  /**
   * Gets the value from an axis coordinate, converts from a coordinate number value to the actual data type.
   * @param x The coordinate.
   * @returns The converted value.
   */
  public getValue(x: number): any {
    return x
  }

  /**
   * Inverse transform the specified .
   * @param x The x or screen coordinate.
   * @param y The y coordinate.
   * @param yaxis The y-axis.
   * @returns The data point.
   */
  public inverseTransformPoint(x: number, y: number, yaxis: Axis): DataPoint {
    return newDataPoint(this.inverseTransform(x), yaxis ? yaxis.inverseTransform(y) : 0)
  }

  /**
   * Inverse transforms the specified screen coordinate. This method can only be used with non-polar coordinate systems.
   * @param sx The screen coordinate.
   * @returns The value.
   */
  public inverseTransform(sx: number): number {
    return sx / this._scale + this._offset
  }

  /**
   * Determines whether the axis is horizontal.
   * @returns true if the axis is horizontal; otherwise, false.
   */
  public isHorizontal(): boolean {
    return this.position === AxisPosition.Top || this.position === AxisPosition.Bottom
  }

  /**
   * Determines whether the specified value is valid.
   * @param value The value.
   * @returns true if the specified value is valid; otherwise, false.
   */
  public isValidValue(value: number): boolean {
    return (
      Number.isFinite(value) &&
      value < this.filterMaxValue &&
      value > this.filterMinValue &&
      (!this.filterFunction || this.filterFunction(value))
    )
  }

  /**
   * Determines whether the axis is vertical.
   * @returns true if the axis is vertical; otherwise, false.
   */
  public isVertical(): boolean {
    return this.position === AxisPosition.Left || this.position === AxisPosition.Right
  }

  /**
   * Determines whether the axis is used for X/Y values.
   * @returns true if it is an XY axis; otherwise, false.
   */
  public abstract isXyAxis(): boolean

  /**
   * Determines whether the axis is logarithmic.
   * @returns true if it is a logarithmic axis; otherwise, false.
   */
  public isLogarithmic(): boolean {
    return false
  }

  /**
   * Measures the size of the axis and updates DesiredMargin accordingly. This takes into account the axis title as well as tick labels
   * potentially exceeding the axis range.
   * @param rc The render context.
   */
  public measure(rc: IRenderContext): void {
    if (this.position === AxisPosition.None) {
      this.desiredMargin = new OxyThickness(0)
      return
    }

    const { majorLabelValues } = this.getTickValues()

    let maximumTextSize = new OxySize()
    for (const v of majorLabelValues) {
      const s = this.formatValue(v)
      const size = RenderingExtensions.measureText(
        rc,
        s,
        this.actualFont,
        this.actualFontSize,
        this.actualFontWeight,
        this.angle,
      )
      maximumTextSize = maximumTextSize.include(size)
    }

    const titleTextSize = rc.measureText(
      this.actualTitle || '',
      this.actualTitleFont,
      this.actualTitleFontSize,
      this.actualTitleFontWeight,
    )

    let marginLeft = 0
    let marginTop = 0
    let marginRight = 0
    let marginBottom = 0

    const minOuterMargin = Math.max(0, this.isReversed ? this.maximumMargin : this.minimumMargin)
    const maxOuterMargin = Math.max(0, this.isReversed ? this.minimumMargin : this.maximumMargin)

    let margin = 0
    switch (this.tickStyle) {
      case TickStyle.Outside:
        margin = this.majorTickSize
        break
      case TickStyle.Crossing:
        margin = this.majorTickSize * 0.75
        break
    }

    margin += this.axisDistance + this.axisTickToLabelDistance

    if (titleTextSize.height > 0) {
      margin += this.axisTitleDistance + titleTextSize.height
    }

    switch (this.position) {
      case AxisPosition.Left:
        marginLeft = margin + maximumTextSize.width
        break
      case AxisPosition.Right:
        marginRight = margin + maximumTextSize.width
        break
      case AxisPosition.Top:
        marginTop = margin + maximumTextSize.height
        break
      case AxisPosition.Bottom:
        marginBottom = margin + maximumTextSize.height
        break
      case AxisPosition.All:
        marginLeft = marginRight = margin + maximumTextSize.width
        marginTop = marginBottom = margin + maximumTextSize.height
        break
      default:
        throw new Error('Invalid operation')
    }

    if (this.isPanEnabled || this.isZoomEnabled) {
      const reachesMinPosition = Math.min(this.startPosition, this.endPosition) < 0.01
      const reachesMaxPosition = Math.max(this.startPosition, this.endPosition) > 0.99

      switch (this.position) {
        case AxisPosition.Left:
        case AxisPosition.Right:
          if (reachesMinPosition) {
            marginBottom = Math.max(0, maximumTextSize.height / 2 - minOuterMargin)
          }

          if (reachesMaxPosition) {
            marginTop = Math.max(0, maximumTextSize.height / 2 - maxOuterMargin)
          }

          break
        case AxisPosition.Top:
        case AxisPosition.Bottom:
          if (reachesMinPosition) {
            marginLeft = Math.max(0, maximumTextSize.width / 2 - minOuterMargin)
          }

          if (reachesMaxPosition) {
            marginRight = Math.max(0, maximumTextSize.width / 2 - maxOuterMargin)
          }

          break
      }
    } else if (majorLabelValues.length > 0) {
      const minLabel = Math.min(...majorLabelValues)
      const maxLabel = Math.max(...majorLabelValues)

      const minLabelText = this.formatValue(minLabel)
      const maxLabelText = this.formatValue(maxLabel)

      let minLabelSize = RenderingExtensions.measureText(
        rc,
        minLabelText,
        this.actualFont,
        this.actualFontSize,
        this.actualFontWeight,
        this.angle,
      )
      let maxLabelSize = RenderingExtensions.measureText(
        rc,
        maxLabelText,
        this.actualFont,
        this.actualFontSize,
        this.actualFontWeight,
        this.angle,
      )

      let minLabelPosition = this.transform(minLabel)
      let maxLabelPosition = this.transform(maxLabel)

      if (minLabelPosition > maxLabelPosition) {
        ;[minLabelPosition, maxLabelPosition] = [maxLabelPosition, minLabelPosition]
        ;[minLabelSize, maxLabelSize] = [maxLabelSize, minLabelSize]
      }

      let screenMinY = 0,
        screenMaxY = 0,
        screenMinX = 0,
        screenMaxX = 0
      switch (this.position) {
        case AxisPosition.Left:
        case AxisPosition.Right:
          screenMinY = Math.min(this.screenMin.y, this.screenMax.y)
          screenMaxY = Math.max(this.screenMin.y, this.screenMax.y)

          marginTop = Math.max(0, screenMinY - minLabelPosition + minLabelSize.height / 2 - minOuterMargin)
          marginBottom = Math.max(0, maxLabelPosition - screenMaxY + maxLabelSize.height / 2 - maxOuterMargin)
          break
        case AxisPosition.Top:
        case AxisPosition.Bottom:
          screenMinX = Math.min(this.screenMin.x, this.screenMax.x)
          screenMaxX = Math.max(this.screenMin.x, this.screenMax.x)

          marginLeft = Math.max(0, screenMinX - minLabelPosition + minLabelSize.width / 2 - minOuterMargin)
          marginRight = Math.max(0, maxLabelPosition - screenMaxX + maxLabelSize.width / 2 - maxOuterMargin)
          break
      }
    }

    this.desiredMargin = new OxyThickness(marginLeft, marginTop, marginRight, marginBottom)
  }

  pan(ppt_or_delta: ScreenPoint | number, cpt?: ScreenPoint): void
  /**
   * Pans the specified axis.
   * @param ppt_or_delta The previous point (screen coordinates) or The delta.
   * @param cpt
   */
  public pan(ppt_or_delta: ScreenPoint | number, cpt?: ScreenPoint): void {
    if (typeof ppt_or_delta === 'number') {
      this.pan2(ppt_or_delta)
      return
    }
    this.pan1(ppt_or_delta, cpt!)
  }

  /**
   * Pans the specified axis.
   * @param ppt The previous point (screen coordinates).
   * @param cpt The current point (screen coordinates).
   */
  private pan1(ppt: ScreenPoint, cpt: ScreenPoint): void {
    if (!this.isPanEnabled) {
      return
    }

    const isHorizontal = this.isHorizontal()

    const dsx = isHorizontal ? cpt.x - ppt.x : cpt.y - ppt.y
    this.pan(dsx)
  }

  /**
   * Pans the specified axis.
   * @param delta The delta.
   */
  private pan2(delta: number): void {
    if (!this.isPanEnabled) {
      return
    }

    const oldMinimum = this.actualMinimum
    const oldMaximum = this.actualMaximum

    const dx = delta / this._scale

    let newMinimum = this.actualMinimum - dx
    let newMaximum = this.actualMaximum - dx
    if (newMinimum < this.absoluteMinimum) {
      newMinimum = this.absoluteMinimum
      newMaximum = Math.min(newMinimum + this.actualMaximum - this.actualMinimum, this.absoluteMaximum)
    }

    if (newMaximum > this.absoluteMaximum) {
      newMaximum = this.absoluteMaximum
      newMinimum = Math.max(newMaximum - (this.actualMaximum - this.actualMinimum), this.absoluteMinimum)
    }

    this.viewMinimum = newMinimum
    this.viewMaximum = newMaximum
    this.updateActualMaxMin()

    const deltaMinimum = this.actualMinimum - oldMinimum
    const deltaMaximum = this.actualMaximum - oldMaximum

    this.onAxisChanged({
      changeType: AxisChangeTypes.Pan,
      deltaMaximum,
      deltaMinimum,
    } as AxisChangedEventArgs)
  }

  /**
   * Renders the axis on the specified render context.
   * @param rc The render context.
   * @param pass The pass.
   */
  public async render(rc: IRenderContext, pass: number): Promise<void> {
    if (this.position === AxisPosition.None) {
      return
    }

    const r = new HorizontalAndVerticalAxisRenderer(rc, this.plotModel)
    await r.render(this, pass)
  }

  /**
   * Resets the user's modification (zooming/panning) to minimum and maximum of this axis.
   */
  public reset(): void {
    const oldMinimum = this.actualMinimum
    const oldMaximum = this.actualMaximum

    this.viewMinimum = NaN
    this.viewMaximum = NaN
    this.updateActualMaxMin()

    const deltaMinimum = this.actualMinimum - oldMinimum
    const deltaMaximum = this.actualMaximum - oldMaximum

    this.onAxisChanged({
      changeType: AxisChangeTypes.Reset,
      deltaMinimum,
      deltaMaximum,
    })
  }

  /**
   * Returns a string that represents this instance.
   * @returns A string that represents this instance.
   */
  public toString(): string {
    return `${this.constructor.name}(${this.position}, ${this.clipMinimum}, ${this.clipMaximum}, ${this.actualMajorStep})`
  }

  /**
   * Transforms the specified point to screen coordinates.
   * @param x The x value (for the current axis).
   * @param y The y value.
   * @param yaxis The y-axis.
   * @returns The transformed point.
   */
  public transformPoint(x: number, y: number, yaxis: Axis): ScreenPoint {
    if (!yaxis) {
      throw new Error('Y axis should not be null when transforming.')
    }

    return newScreenPoint(this.transform(x), yaxis.transform(y))
  }

  /**
   * Transforms the specified coordinate to screen coordinates. This method can only be used with non-polar coordinate systems.
   * @param x The value.
   * @returns The transformed value (screen coordinate).
   */
  public transform(x: number): number {
    const isDebugMode = false
    if (isDebugMode) {
      // check if the screen coordinate is very big, this could cause issues
      // only do this in DEBUG builds, as it affects performance
      const s = (x - this._offset) * this._scale
      if (s * s > 1e12) {
        throw new Error(`Invalid transform (screen coordinate=${s}). This could cause issues.`)
      }

      return s
    }
    return (x - this._offset) * this._scale
  }

  /**
   * Zoom to the specified scale.
   * @param newScale The new scale.
   */
  public zoomScale(newScale: number): void {
    const oldMinimum = this.actualMinimum
    const oldMaximum = this.actualMaximum

    const sx1 = this.transform(this.actualMaximum)
    const sx0 = this.transform(this.actualMinimum)

    const sgn = Math.sign(this._scale)
    const mid = (this.preTransform(this.actualMaximum) + this.preTransform(this.actualMinimum)) / 2

    const dx = (this._offset - mid) * this._scale
    const newOffset = dx / (sgn * newScale) + mid
    this.setTransform(sgn * newScale, newOffset)

    let newMaximum = this.inverseTransform(sx1)
    let newMinimum = this.inverseTransform(sx0)

    if (newMinimum < this.absoluteMinimum && newMaximum > this.absoluteMaximum) {
      newMinimum = this.absoluteMinimum
      newMaximum = this.absoluteMaximum
    } else {
      if (newMinimum < this.absoluteMinimum) {
        const d = newMaximum - newMinimum
        newMinimum = this.absoluteMinimum
        newMaximum = this.absoluteMinimum + d
        if (newMaximum > this.absoluteMaximum) {
          newMaximum = this.absoluteMaximum
        }
      } else if (newMaximum > this.absoluteMaximum) {
        const d = newMaximum - newMinimum
        newMaximum = this.absoluteMaximum
        newMinimum = this.absoluteMaximum - d
        if (newMinimum < this.absoluteMinimum) {
          newMinimum = this.absoluteMinimum
        }
      }
    }

    this.clipMaximum = this.viewMaximum = newMaximum
    this.clipMinimum = this.viewMinimum = newMinimum
    this.updateActualMaxMin()

    const deltaMinimum = this.actualMinimum - oldMinimum
    const deltaMaximum = this.actualMaximum - oldMaximum

    this.actualMaximumAndMinimumChangedOverride()
    this.onAxisChanged({ changeType: AxisChangeTypes.Zoom, deltaMinimum, deltaMaximum })
  }

  /**
   * Zooms the axis to the range [x0,x1].
   * @param x0 The new minimum.
   * @param x1 The new maximum.
   */
  public zoom(x0: number, x1: number): void {
    if (!this.isZoomEnabled) {
      return
    }

    const oldMinimum = this.actualMinimum
    const oldMaximum = this.actualMaximum

    const newMinimum = Math.max(Math.min(x0, x1), this.absoluteMinimum)
    const newMaximum = Math.min(Math.max(x0, x1), this.absoluteMaximum)

    this.viewMinimum = newMinimum
    this.viewMaximum = newMaximum
    this.updateActualMaxMin()

    const deltaMinimum = this.actualMinimum - oldMinimum
    const deltaMaximum = this.actualMaximum - oldMaximum

    this.onAxisChanged({ changeType: AxisChangeTypes.Zoom, deltaMinimum, deltaMaximum })
  }

  /**
   * Zooms the axis at the specified coordinate.
   * @param factor The zoom factor.
   * @param x The coordinate to zoom at.
   */
  public zoomAt(factor: number, x: number): void {
    if (!this.isZoomEnabled) {
      return
    }

    const oldMinimum = this.actualMinimum
    const oldMaximum = this.actualMaximum

    const dx0 = (this.actualMinimum - x) * this._scale
    const dx1 = (this.actualMaximum - x) * this._scale
    this._scale *= factor

    let newMinimum = dx0 / this._scale + x
    let newMaximum = dx1 / this._scale + x

    if (newMaximum - newMinimum > this.maximumRange) {
      const mid = (newMinimum + newMaximum) * 0.5
      newMaximum = mid + this.maximumRange * 0.5
      newMinimum = mid - this.maximumRange * 0.5
    }

    if (newMaximum - newMinimum < this.minimumRange) {
      const mid = (newMinimum + newMaximum) * 0.5
      newMaximum = mid + this.minimumRange * 0.5
      newMinimum = mid - this.minimumRange * 0.5
    }

    newMinimum = Math.max(newMinimum, this.absoluteMinimum)
    newMaximum = Math.min(newMaximum, this.absoluteMaximum)

    this.viewMinimum = newMinimum
    this.viewMaximum = newMaximum
    this.updateActualMaxMin()

    const deltaMinimum = this.actualMinimum - oldMinimum
    const deltaMaximum = this.actualMaximum - oldMaximum

    this.onAxisChanged({ changeType: AxisChangeTypes.Zoom, deltaMinimum, deltaMaximum })
  }

  /**
   * Zooms the axis with the specified zoom factor at the center of the axis.
   * @param factor The zoom factor.
   */
  public zoomAtCenter(factor: number): void {
    const sx = (this.transform(this.clipMaximum) + this.transform(this.clipMinimum)) * 0.5
    const x = this.inverseTransform(sx)
    this.zoomAt(factor, x)
  }

  /**
   * Modifies the data range of the axis [DataMinimum,DataMaximum] to includes the specified value.
   * @param value The value.
   */
  public include(value: number): void {
    if (!this.isValidValue(value)) {
      return
    }

    this.dataMinimum = isNaN(this.dataMinimum) ? value : Math.min(this.dataMinimum, value)
    this.dataMaximum = isNaN(this.dataMaximum) ? value : Math.max(this.dataMaximum, value)
  }

  /**
   * Resets the DataMaximum and DataMinimum values.
   * @internal
   */
  resetDataMaxMin(): void {
    this.dataMaximum = this.dataMinimum = this.actualMaximum = this.actualMinimum = NaN
  }

  /**
   * Updates the ActualMaximum and ActualMinimum values.
   * @internal
   */
  updateActualMaxMin(): void {
    if (!isNaN(this.viewMaximum)) {
      this.actualMaximum = this.viewMaximum
    } else if (!isNaN(this.maximum)) {
      this.actualMaximum = this.maximum
    } else {
      this.actualMaximum = this.calculateActualMaximum()
    }

    if (!isNaN(this.viewMinimum)) {
      this.actualMinimum = this.viewMinimum
    } else if (!isNaN(this.minimum)) {
      this.actualMinimum = this.minimum
    } else {
      this.actualMinimum = this.calculateActualMinimum()
    }

    this.coerceActualMaxMin()
  }

  /**
   * Updates the actual minor and major step intervals.
   * @param plotArea The plot area rectangle.
   * @internal
   */
  updateIntervals(plotArea: OxyRect): void {
    const labelSize = this.intervalLength
    let length = this.isHorizontal() ? plotArea.width : plotArea.height
    length *= Math.abs(this.endPosition - this.startPosition)
    this.actualMajorStep = !isNaN(this.majorStep)
      ? this.majorStep
      : this.calculateActualInterval(length, labelSize, this.minimumMajorIntervalCount, this.maximumMajorIntervalCount)

    this.actualMinorStep = !isNaN(this.minorStep) ? this.minorStep : this.calculateMinorInterval(this.actualMajorStep)

    if (isNaN(this.actualMinorStep)) {
      this.actualMinorStep = 2
    }

    if (isNaN(this.actualMajorStep)) {
      this.actualMajorStep = 10
    }

    this.actualMinorStep = Math.max(this.actualMinorStep, this.minimumMinorStep)
    this.actualMajorStep = Math.max(this.actualMajorStep, this.minimumMajorStep)

    this.actualStringFormatter = this.stringFormatter || this.getDefaultStringFormatter()
  }

  /**
   * Updates the scale and offset properties of the transform from the specified boundary rectangle.
   * @param bounds The bounds.
   * @internal
   */
  updateTransform(bounds: OxyRect): void {
    const x0 = bounds.left
    const x1 = bounds.right
    const y0 = bounds.bottom
    const y1 = bounds.top

    let a0 = this.isHorizontal() ? x0 : y0
    let a1 = this.isHorizontal() ? x1 : y1

    const dx = a1 - a0
    a1 = a0 + this.endPosition * dx
    a0 = a0 + this.startPosition * dx

    //const marginSign = (this.isHorizontal() ^ this.IsReversed) ? 1.0 : -1.0
    const marginSign = this.isHorizontal() != this.isReversed ? 1.0 : -1.0

    if (this.minimumMargin > 0) {
      a0 += this.minimumMargin * marginSign
    }

    if (this.maximumMargin > 0) {
      a1 -= this.maximumMargin * marginSign
    }

    if (this.isHorizontal()) {
      this.screenMin = newScreenPoint(a0, y1)
      this.screenMax = newScreenPoint(a1, y0)
    } else if (this.isVertical()) {
      this.screenMin = newScreenPoint(x0, a1)
      this.screenMax = newScreenPoint(x1, a0)
    }

    if (this.minimumDataMargin > 0) {
      a0 += this.minimumDataMargin * marginSign
    }

    if (this.maximumDataMargin > 0) {
      a1 -= this.maximumDataMargin * marginSign
    }

    if (this.actualMaximum - this.actualMinimum <= 0) {
      this.actualMaximum = this.actualMinimum + 1
    }

    const max = this.preTransform(this.actualMaximum)
    const min = this.preTransform(this.actualMinimum)

    const da = a0 - a1
    let newOffset, newScale

    if (Math.abs(da) > Number.EPSILON) {
      newOffset = (a0 / da) * max - (a1 / da) * min
    } else {
      newOffset = 0
    }

    const range = max - min
    if (Math.abs(range) > Number.EPSILON) {
      newScale = (a1 - a0) / range
    } else {
      newScale = 1
    }

    this.setTransform(newScale, newOffset)

    if (this.minimumDataMargin > 0) {
      this.clipMinimum = this.inverseTransform(a0 - this.minimumDataMargin * marginSign)
    } else {
      this.clipMinimum = this.actualMinimum
    }

    if (this.maximumDataMargin > 0) {
      this.clipMaximum = this.inverseTransform(a1 + this.maximumDataMargin * marginSign)
    } else {
      this.clipMaximum = this.actualMaximum
    }

    this.actualMaximumAndMinimumChangedOverride()
  }

  /**
   * Invoked when ActualMinimum, ActualMaximum, ClipMinimum, and ClipMaximum are changed.
   */
  protected actualMaximumAndMinimumChangedOverride(): void {}

  /**
   * Gets the default formatter.
   * @returns A formatter.
   * @remarks This formatter is used if the StringFormat is not set.
   */
  protected getDefaultStringFormatter(): AxisStringFormatterType | undefined {
    return (x: number) => {
      return pettyNumber(x, 4)
    }
  }

  /**
   * Applies a transformation after the inverse transform of the value.
   * @param x The value to transform.
   * @returns The transformed value.
   * @remarks If this method is overridden, the inverseTransform method must also be overridden.
   * See LogarithmicAxis for examples on how to implement this.
   */
  protected postInverseTransform(x: number): number {
    return x
  }

  /**
   * Applies a transformation before the transform the value.
   * @param x The value to transform.
   * @returns The transformed value.
   * @remarks If this method is overridden, the transform method must also be overridden.
   * See LogarithmicAxis for examples on how to implement this.
   */
  protected preTransform(x: number): number {
    return x
  }

  /**
   * Calculates the minor interval.
   * @param majorInterval The major interval.
   * @returns The minor interval.
   */
  protected calculateMinorInterval(majorInterval: number): number {
    return AxisUtilities.calculateMinorInterval(majorInterval)
  }

  /**
   * Creates tick values at the specified interval.
   * @param from The start value.
   * @param to The end value.
   * @param step The interval.
   * @param maxTicks The maximum number of ticks (optional). The default value is 1000.
   * @returns A sequence of values.
   */
  protected createTickValues(from: number, to: number, step: number, maxTicks: number = 1000): number[] {
    return AxisUtilities.createTickValues(from, to, step, maxTicks)
  }

  /**
   * Coerces the actual maximum and minimum values.
   */
  protected coerceActualMaxMin(): void {
    // Check consistency of properties
    if (this.absoluteMaximum <= this.absoluteMinimum) {
      throw new Error('AbsoluteMaximum must be larger than AbsoluteMinimum.')
    }
    if (this.absoluteMaximum - this.absoluteMinimum < this.minimumRange) {
      throw new Error('MinimumRange must not be larger than AbsoluteMaximum-AbsoluteMinimum.')
    }
    if (this.maximumRange < this.minimumRange) {
      throw new Error('MinimumRange must not be larger than MaximumRange.')
    }

    // Coerce actual minimum
    if (isNaN(this.actualMinimum) || isInfinity(this.actualMinimum)) {
      this.actualMinimum = 0
    }

    // Coerce actual maximum
    if (isNaN(this.actualMaximum) || isInfinity(this.actualMaximum)) {
      this.actualMaximum = 100
    }

    if (this.absoluteMinimum > Number_MIN_VALUE && this.absoluteMinimum < Number_MAX_VALUE) {
      this.actualMinimum = Math.max(this.actualMinimum, this.absoluteMinimum)
      if (this.maximumRange < Number_MAX_VALUE) {
        this.actualMaximum = Math.min(this.actualMaximum, this.absoluteMinimum + this.maximumRange)
      }
    }
    if (this.absoluteMaximum > Number_MIN_VALUE && this.absoluteMaximum < Number_MAX_VALUE) {
      this.actualMaximum = Math.min(this.actualMaximum, this.absoluteMaximum)
      if (this.maximumRange < Number_MAX_VALUE) {
        this.actualMinimum = Math.max(this.actualMinimum, this.absoluteMaximum - this.maximumRange)
      }
    }

    // Coerce the minimum range
    if (this.actualMaximum - this.actualMinimum < this.minimumRange) {
      if (this.actualMinimum + this.minimumRange < this.absoluteMaximum) {
        const average = (this.actualMaximum + this.actualMinimum) * 0.5
        const delta = this.minimumRange / 2
        this.actualMinimum = average - delta
        this.actualMaximum = average + delta

        if (this.actualMinimum < this.absoluteMinimum) {
          const diff = this.absoluteMinimum - this.actualMinimum
          this.actualMinimum = this.absoluteMinimum
          this.actualMaximum += diff
        }

        if (this.actualMaximum > this.absoluteMaximum) {
          const diff = this.absoluteMaximum - this.actualMaximum
          this.actualMaximum = this.absoluteMaximum
          this.actualMinimum += diff
        }
      } else {
        if (this.absoluteMaximum - this.minimumRange > this.absoluteMinimum) {
          this.actualMinimum = this.absoluteMaximum - this.minimumRange
          this.actualMaximum = this.absoluteMaximum
        } else {
          this.actualMaximum = this.absoluteMaximum
          this.actualMinimum = this.absoluteMinimum
        }
      }
    }

    // Coerce the maximum range
    if (this.actualMaximum - this.actualMinimum > this.maximumRange) {
      if (this.actualMinimum + this.maximumRange < this.absoluteMaximum) {
        const average = (this.actualMaximum + this.actualMinimum) * 0.5
        const delta = this.maximumRange / 2
        this.actualMinimum = average - delta
        this.actualMaximum = average + delta

        if (this.actualMinimum < this.absoluteMinimum) {
          const diff = this.absoluteMinimum - this.actualMinimum
          this.actualMinimum = this.absoluteMinimum
          this.actualMaximum += diff
        }

        if (this.actualMaximum > this.absoluteMaximum) {
          const diff = this.absoluteMaximum - this.actualMaximum
          this.actualMaximum = this.absoluteMaximum
          this.actualMinimum += diff
        }
      } else {
        if (this.absoluteMaximum - this.maximumRange > this.absoluteMinimum) {
          this.actualMinimum = this.absoluteMaximum - this.maximumRange
          this.actualMaximum = this.absoluteMaximum
        } else {
          this.actualMaximum = this.absoluteMaximum
          this.actualMinimum = this.absoluteMinimum
        }
      }
    }

    // Coerce the absolute maximum/minimum
    if (this.actualMaximum <= this.actualMinimum) {
      this.actualMaximum = this.actualMinimum + 100
    }
  }

  /**
   * Formats the value to be used on the axis.
   * @param x The value to format.
   * @returns The formatted value.
   */
  protected formatValueOverride(x: number): string {
    let stringFormatter = this.stringFormatter
    // The "SuperExponentialFormat" renders the number with superscript exponents. E.g. 10^2
    if (this.useSuperExponentialFormat && x !== 0) {
      const exp = Axis.Exponent(x)
      const mantissa = Axis.Mantissa(x)
      if (!stringFormatter) {
        return Math.abs(mantissa - 1.0) < 1e-6 ? `10^{${exp}}` : `${mantissa}·10^{${exp}}`
      } else if (typeof stringFormatter === 'function') {
        return `${stringFormatter(x)}·10^{${exp}}`
      }

      throw new Error('invalid stringFormat')
    }

    stringFormatter = this.actualStringFormatter || this.stringFormatter

    if (typeof stringFormatter === 'function') {
      return stringFormatter(x)
    }

    if (!stringFormatter) return x.toString()
    throw new Error('invalid stringFormat')
  }

  /**
   * Calculates the actual maximum value of the axis, including the MaximumPadding.
   * @returns The new actual maximum value of the axis.
   * @remarks Must be called before CalculateActualMinimum
   */
  protected calculateActualMaximum(): number {
    let actualMaximum = this.dataMaximum
    const range = this.dataMaximum - this.dataMinimum
    if (range <= 0) {
      const zeroRange = this.dataMaximum > 0 ? this.dataMaximum : 1
      actualMaximum += zeroRange * 0.5
    }

    if (!isNaN(this.dataMinimum) && !isNaN(actualMaximum)) {
      const x1 = this.preTransform(actualMaximum)
      const x0 = this.preTransform(this.dataMinimum)
      const dx = this.maximumPadding * (x1 - x0)
      return this.postInverseTransform(x1 + dx)
    }

    return actualMaximum
  }

  /**
   * Calculates the actual minimum value of the axis, including the MinimumPadding.
   * @returns The new actual minimum value of the axis.
   * @remarks Must be called after CalculateActualMaximum
   */
  protected calculateActualMinimum(): number {
    let actualMinimum = this.dataMinimum
    const range = this.dataMaximum - this.dataMinimum

    if (range <= 0) {
      const zeroRange = this.dataMaximum > 0 ? this.dataMaximum : 1
      actualMinimum -= zeroRange * 0.5
    }

    if (!isNaN(this.actualMaximum)) {
      const x1 = this.preTransform(this.actualMaximum)
      const x0 = this.preTransform(actualMinimum)
      const existingPadding = this.maximumPadding
      const dx = this.minimumPadding * ((x1 - x0) / (1.0 + existingPadding))
      return this.postInverseTransform(x0 - dx)
    }

    return actualMinimum
  }

  /**
   * Sets the transform.
   * @param newScale The new scale.
   * @param newOffset The new offset.
   */
  protected setTransform(newScale: number, newOffset: number): void {
    this._scale = newScale
    this._offset = newOffset
    this.onTransformChanged()
  }

  /**
   * Returns the actual interval to use to determine which values are displayed in the axis.
   * @param availableSize The available size.
   * @param maxIntervalSize The maximum interval size.
   * @param range The range.
   * @param minIntervalCount The minimum number of intervals.
   * @param maxIntervalCount The maximum number of intervals, once the minimum number of intervals is satisfied.
   * @returns Actual interval to use to determine which values are displayed in the axis.
   */
  protected calculateActualInterval(
    availableSize: number,
    maxIntervalSize: number,
    minIntervalCount: number,
    maxIntervalCount: number,
    range?: number,
  ): number {
    if (isNullOrUndef(range)) {
      range = Math.abs(this.clipMinimum - this.clipMaximum)
    }

    if (availableSize <= 0) {
      return maxIntervalSize
    }

    if (Math.abs(maxIntervalSize) <= 0) {
      throw new Error('Maximum interval size cannot be zero.')
    }

    if (Math.abs(range) <= 0) {
      throw new Error('Range cannot be zero.')
    }

    const exponent = (x: number): number => Math.ceil(Math.log10(x))
    const mantissa = (x: number): number => x / Math.pow(10, exponent(x) - 1)

    // bound min/max interval counts
    minIntervalCount = Math.max(minIntervalCount, 0)
    maxIntervalCount = Math.min(maxIntervalCount, availableSize / maxIntervalSize)

    range = Math.abs(range)
    let interval = Math.pow(10, exponent(range))
    let intervalCandidate = interval

    // Function to remove 'double precision noise'
    const removeNoise = (x: number): number => parseFloat(x.toPrecision(14))

    // decrease interval until interval count becomes less than maxIntervalCount
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const m = mantissa(intervalCandidate)
      if (m === 5) {
        // reduce 5 to 2
        intervalCandidate = removeNoise(intervalCandidate / 2.5)
      } else if (m === 2 || m === 1 || m === 10) {
        // reduce 2 to 1, 10 to 5, 1 to 0.5
        intervalCandidate = removeNoise(intervalCandidate / 2.0)
      } else {
        intervalCandidate = removeNoise(intervalCandidate / 2.0)
      }

      if (range / interval >= minIntervalCount && range / intervalCandidate > maxIntervalCount) {
        break
      }

      if (isNaN(intervalCandidate) || isInfinity(intervalCandidate)) {
        break
      }

      interval = intervalCandidate
    }

    return interval
  }

  /**
   * Raises the AxisChanged event.
   * @param args The AxisChangedEventArgs instance containing the event data.
   */
  protected onAxisChanged(args: AxisChangedEventArgs): void {
    this.updateActualMaxMin()

    const handler = this.axisChanged
    if (handler) {
      handler(this, args)
    }
  }

  /**
   * Raises the TransformChanged event.
   */
  protected onTransformChanged(): void {
    const handler = this.transformChanged
    if (handler) {
      handler(this)
    }
  }
}
