import {
  AngleAxis,
  Annotation,
  AnnotationLayer,
  Axis,
  AxisLayer,
  AxisPosition,
  BarSeries,
  BarSeriesManager,
  CategoryAxis,
  type CreateModelOptions,
  EdgeRenderingMode,
  ExtendedModelOptions,
  FontWeights,
  HorizontalAlignment,
  type IBarSeries,
  type IColorAxis,
  type IPlotModel,
  type IPlotView,
  type IRenderContext,
  isBarSeries,
  isBottomLegend,
  isColorAxis,
  isLeftLegend,
  isRightLegend,
  isTopLegend,
  LegendBase,
  LegendPlacement,
  LinearAxis,
  LineStyle,
  MagnitudeAxis,
  MathRenderingExtensions,
  Model,
  newElementCollection,
  newOxyRect,
  newOxySize,
  newOxyThickness,
  newScreenPoint,
  newScreenVector,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRect_Empty,
  OxyRect_Everything,
  OxyRectHelper,
  type OxySize,
  type OxyThickness,
  OxyThickness_Zero,
  OxyThicknessEx,
  PlotElement,
  type PlotModelSerializeOptions,
  RenderingExtensions,
  type ScreenPoint,
  screenPointDistanceTo,
  screenPointPlus,
  Series,
  toColorAxis,
  type TrackerEventArgs,
  TrackerHitResult,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'

import {
  assignObject,
  copyPlotElementProperties,
  getReversedCopy,
  type IDisposable,
  isInfinity,
  isNaNOrUndef,
  isNullOrUndef,
  Number_MAX_VALUE,
  removeProperties,
} from '@/patch'

/**
 * Specifies the coordinate system type.
 */
export enum PlotType {
  /**
   * XY coordinate system - two perpendicular axes
   */
  XY,

  /**
   * Cartesian coordinate system - perpendicular axes with the same scaling.
   * See http://en.wikipedia.org/wiki/Cartesian_coordinate_system
   */
  Cartesian,

  /**
   * Polar coordinate system - with radial and angular axes
   * See http://en.wikipedia.org/wiki/Polar_coordinate_system
   */
  Polar,
}

/**
 * Specifies the horizontal alignment of the titles.
 */
export enum TitleHorizontalAlignment {
  /**
   * Centered within the plot area.
   */
  CenteredWithinPlotArea,

  /**
   * Centered within the client view (excluding padding defined in PlotModel.Padding).
   */
  CenteredWithinView,
}

export interface CreatePlotModelOptions extends CreateModelOptions {
  axes?: Axis[]
  series?: Series[]
  annotations?: Annotation[]
  legends?: LegendBase[]

  plotType?: PlotType
  plotMargins?: OxyThickness
  padding?: OxyThickness
  background?: OxyColor
  plotAreaBackground?: OxyColor
  textColor?: OxyColor
  titleColor?: OxyColor
  subtitleColor?: OxyColor
  defaultFont?: string
  defaultFontSize?: number
  titleToolTip?: string
  titleFont?: string
  titleFontSize?: number
  titleFontWeight?: number
  subtitleFont?: string
  subtitleFontSize?: number
  subtitleFontWeight?: number
  titlePadding?: number
  clipTitle?: boolean
  titleClippingLength?: number
  plotAreaBorderColor?: OxyColor
  plotAreaBorderThickness?: OxyThickness
  edgeRenderingMode?: EdgeRenderingMode
  assignColorsToInvisibleSeries?: boolean
  isLegendVisible?: boolean
  defaultColors?: OxyColor[]
  axisTierDistance?: number
  title?: string
  subtitle?: string
  titleHorizontalAlignment?: TitleHorizontalAlignment
}

const DefaultPlotModelOptions: CreatePlotModelOptions = {
  plotType: PlotType.XY,
  plotMargins: newOxyThickness(NaN),
  padding: newOxyThickness(8),
  background: OxyColors.Undefined,
  plotAreaBackground: OxyColors.Undefined,
  textColor: OxyColors.Black,
  titleColor: OxyColors.Automatic,
  subtitleColor: OxyColors.Automatic,
  defaultFont: 'Segoe UI',
  defaultFontSize: 12,
  titleToolTip: undefined,
  titleFont: undefined,
  titleFontSize: 18,
  titleFontWeight: FontWeights.Bold,
  subtitleFont: undefined,
  subtitleFontSize: 14,
  subtitleFontWeight: FontWeights.Normal,
  titlePadding: 6,
  clipTitle: true,
  titleClippingLength: 0.9,
  plotAreaBorderColor: OxyColors.Black,
  plotAreaBorderThickness: newOxyThickness(1),
  edgeRenderingMode: EdgeRenderingMode.Automatic,
  assignColorsToInvisibleSeries: true,
  isLegendVisible: true,
  axisTierDistance: 4.0,
  title: undefined,
  subtitle: undefined,
  titleHorizontalAlignment: TitleHorizontalAlignment.CenteredWithinPlotArea,
  defaultColors: [
    OxyColorHelper.fromRgb(0x4e, 0x9a, 0x06),
    OxyColorHelper.fromRgb(0xc8, 0x8d, 0x00),
    OxyColorHelper.fromRgb(0xcc, 0x00, 0x00),
    OxyColorHelper.fromRgb(0x20, 0x4a, 0x87),
    OxyColors.Red,
    OxyColors.Orange,
    OxyColors.Yellow,
    OxyColors.Green,
    OxyColors.Blue,
    OxyColors.Indigo,
    OxyColors.Violet,
  ],
}

export const ExtendedPlotModelOptions = {
  ...ExtendedModelOptions,
  ...DefaultPlotModelOptions,
}

/**
 * Represents a plot.
 */
export class PlotModel extends Model implements IPlotModel {
  /**
   * The bar series managers.
   */
  private _barSeriesManagers: BarSeriesManager[] = []

  /**
   * The plot view that renders this plot.
   */
  private _plotViewReference?: IPlotView

  /**
   * The current color index.
   */
  private _currentColorIndex: number = 0

  /**
   * Flags if the data has been updated.
   */
  private _isDataUpdated: boolean = false

  /**
   * The last update exception.
   */
  private _lastPlotException?: any | null

  /**
   * Initializes a new instance of the PlotModel class.
   */
  constructor(opt?: CreatePlotModelOptions) {
    super(opt)
    this._axes = newElementCollection<Axis>(this)
    this._series = newElementCollection<Series>(this)
    this._annotations = newElementCollection<Annotation>(this)
    this._legends = newElementCollection<LegendBase>(this)

    if (opt) {
      this.applyOptions(opt)
    }
    assignObject(this, DefaultPlotModelOptions, opt)
  }

  private applyOptions(opt: CreatePlotModelOptions) {
    removeProperties(opt, '_axes', '_series', '_annotations', '_legends')
    if (opt.axes && opt.axes.length > 0) {
      this._axes.push(...opt.axes)
    }
    if (opt.series && opt.series.length > 0) {
      this._series.push(...opt.series)
    }
    if (opt.annotations && opt.annotations.length > 0) {
      this._annotations.push(...opt.annotations)
    }
    if (opt.legends && opt.legends.length > 0) {
      this._legends.push(...opt.legends)
    }
    removeProperties(opt, 'axes', 'series', 'annotations', 'legends')
  }

  /**
   * Occurs when the tracker has been changed.
   */
  public trackerChanged?: (sender: any, event: TrackerEventArgs) => void

  /**
   * Occurs when the plot has been updated.
   */
  public updated?: (sender: any) => void

  /**
   * Occurs when the plot is about to be updated.
   */
  public updating?: (sender: any) => void

  /**
   * Gets or sets the default font.
   */
  public defaultFont: string = DefaultPlotModelOptions.defaultFont!

  /**
   * Gets or sets the default size of the fonts.
   */
  public defaultFontSize: number = DefaultPlotModelOptions.defaultFontSize!

  private _actualPlotMargins: OxyThickness = OxyThickness_Zero
  /**
   * The actual plot margins.
   */
  public get actualPlotMargins(): OxyThickness {
    return this._actualPlotMargins
  }

  /**
   * The plot view that renders this plot.
   * Only one view can render the plot at the same time.
   */
  public get plotView() {
    return this._plotViewReference
  }

  private readonly _annotations: Annotation[]
  /**
   * The annotations.
   */
  public get annotations(): Annotation[] {
    return this._annotations
  }

  private readonly _axes: Axis[]
  /**
   * The axes.
   */
  public get axes(): Axis[] {
    return this._axes
  }

  private readonly _legends: LegendBase[]
  /**
   * The legends.
   */
  public get legends(): LegendBase[] {
    return this._legends
  }

  /**
   * The color of the background of the plot.
   * If the background color is set to OxyColors.Undefined or is otherwise invisible then the background will be determined by the plot view or exporter.
   */
  public background: OxyColor = OxyColors.Undefined

  /**
   * The default colors.
   */
  public defaultColors: OxyColor[] = DefaultPlotModelOptions.defaultColors!

  /**
   * The edge rendering mode that is used for rendering the plot bounds and backgrounds.
   */
  public edgeRenderingMode: EdgeRenderingMode = DefaultPlotModelOptions.edgeRenderingMode!

  /**
   * A value indicating whether invisible series should be assigned automatic colors.
   */
  public assignColorsToInvisibleSeries: boolean = DefaultPlotModelOptions.assignColorsToInvisibleSeries!

  /**
   * A value indicating whether the legend is visible. The titles of the series must be set to use the legend.
   */
  public isLegendVisible: boolean = DefaultPlotModelOptions.isLegendVisible!

  /**
   * The padding around the plot.
   */
  public padding: OxyThickness = DefaultPlotModelOptions.padding!

  private _plotBounds: OxyRect = OxyRect_Empty
  /**
   * The PlotBounds of the plot (in device units).
   */
  public get plotBounds(): OxyRect {
    return this._plotBounds
  }

  /**
   * The total width of the plot (in device units).
   */
  public get width(): number {
    return this.plotBounds.width
  }

  /**
   * The total height of the plot (in device units).
   */
  public get height(): number {
    return this.plotBounds.height
  }

  private _plotAndAxisArea: OxyRect = OxyRect_Empty
  /**
   * The area including both the plot and the axes. Outside legends are rendered outside this rectangle.
   */
  public get plotAndAxisArea(): OxyRect {
    return this._plotAndAxisArea
  }

  private _plotArea: OxyRect = OxyRect_Empty
  /**
   * The plot area. This area is used to draw the series (not including axes or legends).
   */
  public get plotArea(): OxyRect {
    return this._plotArea
  }

  /**
   * The distance between two neighborhood tiers of the same AxisPosition.
   */
  public axisTierDistance: number = DefaultPlotModelOptions.axisTierDistance!

  /**
   * The color of the background of the plot area.
   */
  public plotAreaBackground: OxyColor = DefaultPlotModelOptions.plotAreaBackground!

  /**
   * The color of the border around the plot area.
   */
  public plotAreaBorderColor: OxyColor = DefaultPlotModelOptions.plotAreaBorderColor!

  /**
   * The thickness of the border around the plot area.
   */
  public plotAreaBorderThickness: OxyThickness = DefaultPlotModelOptions.plotAreaBorderThickness!

  /**
   * The margins around the plot (this should be large enough to fit the axes).
   * If any of the values is set to NaN, the margin is adjusted to the value required by the axes.
   */
  public plotMargins: OxyThickness = DefaultPlotModelOptions.plotMargins!

  /**
   * The type of the coordinate system.
   */
  public plotType: PlotType = DefaultPlotModelOptions.plotType!

  private readonly _series: Series[]
  /**
   * The series.
   */
  public get series(): Series[] {
    return this._series
  }

  /**
   * The rendering decorator.
   */
  public renderingDecorator?: (context: IRenderContext) => IRenderContext

  /**
   * The subtitle.
   */
  public subtitle?: string

  /**
   * The subtitle font. If this property is null, the Title font will be used.
   */
  public subtitleFont?: string

  /**
   * The size of the subtitle font.
   */
  public subtitleFontSize: number = DefaultPlotModelOptions.subtitleFontSize!

  /**
   * The subtitle font weight.
   */
  public subtitleFontWeight: number = DefaultPlotModelOptions.subtitleFontWeight!

  /**
   * The default color of the text in the plot (titles, legends, annotations, axes).
   */
  public textColor: OxyColor = OxyColors.Black

  /**
   * The title.
   */
  public title?: string

  /**
   * The title tool tip.
   */
  public titleToolTip?: string

  /**
   * The color of the title.
   * If the value is null, the TextColor will be used.
   */
  public titleColor: OxyColor = OxyColors.Automatic

  /**
   * A value indicating whether to clip the title. The default value is true.
   */
  public clipTitle: boolean = DefaultPlotModelOptions.clipTitle!

  /**
   * The length of the title clipping rectangle (fraction of the available length of the title area). The default value is 0.9.
   */
  public titleClippingLength: number = DefaultPlotModelOptions.titleClippingLength!

  /**
   * The color of the subtitle.
   */
  public subtitleColor: OxyColor = OxyColors.Automatic

  /**
   * The horizontal alignment of the title and subtitle.
   */
  public titleHorizontalAlignment: TitleHorizontalAlignment = DefaultPlotModelOptions.titleHorizontalAlignment!

  private _titleArea: OxyRect = OxyRect_Empty
  /**
   * The title area.
   */
  public get titleArea(): OxyRect {
    return this._titleArea
  }

  /**
   * The title font.
   */
  public titleFont?: string

  /**
   * The size of the title font.
   */
  public titleFontSize: number = DefaultPlotModelOptions.titleFontSize!

  /**
   * The title font weight.
   */
  public titleFontWeight: number = DefaultPlotModelOptions.titleFontWeight!

  /**
   * The padding around the title.
   */
  public titlePadding: number = DefaultPlotModelOptions.titlePadding!

  private _defaultAngleAxis?: AngleAxis
  /**
   * The default angle axis.
   */
  public get defaultAngleAxis(): AngleAxis | undefined {
    return this._defaultAngleAxis
  }

  private _defaultMagnitudeAxis?: MagnitudeAxis
  /**
   * The default magnitude axis.
   */
  public get defaultMagnitudeAxis(): MagnitudeAxis | undefined {
    return this._defaultMagnitudeAxis
  }

  private _defaultXAxis?: Axis
  /**
   * The default X axis.
   */
  public get defaultXAxis(): Axis | undefined {
    return this._defaultXAxis
  }

  private _defaultYAxis?: Axis
  /**
   * The default Y axis.
   */
  public get defaultYAxis(): Axis | undefined {
    return this._defaultYAxis
  }

  private _defaultColorAxis?: IColorAxis
  /**
   * The default color axis.
   */
  public get defaultColorAxis(): IColorAxis | undefined {
    return this._defaultColorAxis
  }

  /**
   * Gets the actual title font.
   */
  protected get actualTitleFont(): string {
    return this.titleFont || this.defaultFont
  }

  /**
   * Gets the actual subtitle font.
   */
  protected get actualSubtitleFont(): string {
    return this.subtitleFont || this.defaultFont
  }

  /**
   * Attaches this model to the specified plot view.
   * @param plotView The plot view.
   * @remarks Only one plot view can be attached to the plot model.
   * The plot model contains data (e.g. axis scaling) that is only relevant to the current plot view.
   */
  attachPlotView(plotView?: IPlotView): void {
    const currentPlotView = this.plotView
    if (currentPlotView && plotView && currentPlotView !== plotView) {
      throw new Error('This PlotModel is already in use by some other PlotView control.')
    }

    this._plotViewReference = plotView
  }

  /**
   * Invalidates the plot.
   * @param updateData Updates all data sources if set to true.
   */
  public invalidatePlot(updateData: boolean): void {
    this.plotView?.invalidatePlot(updateData)
  }

  /**
   * Gets the first axes that covers the area of the specified point.
   * @param pt The point.
   */
  public getAxesFromPoint(pt: ScreenPoint): [Axis?, Axis?] {
    let xaxis: Axis | undefined = undefined
    let yaxis: Axis | undefined = undefined

    // Get the axis position of the given point. Using null if the point is inside the plot area.
    let position: AxisPosition | undefined = undefined
    let plotAreaValue = 0
    const right = OxyRectHelper.right(this.plotArea)
    const bottom = OxyRectHelper.bottom(this.plotArea)
    if (pt.x < this.plotArea.left) {
      position = AxisPosition.Left
      plotAreaValue = this.plotArea.left
    }

    if (pt.x > right) {
      position = AxisPosition.Right
      plotAreaValue = right
    }

    if (pt.y < this.plotArea.top) {
      position = AxisPosition.Top
      plotAreaValue = this.plotArea.top
    }

    if (pt.y > bottom) {
      position = AxisPosition.Bottom
      plotAreaValue = bottom
    }

    for (const axis of this.axes) {
      if (!axis.isAxisVisible) {
        continue
      }

      if (isColorAxis(axis)) {
        continue
      }

      if (axis instanceof MagnitudeAxis) {
        xaxis = axis
        continue
      }

      if (axis instanceof AngleAxis) {
        yaxis = axis
        continue
      }

      let x = NaN
      if (axis.isHorizontal()) {
        x = axis.inverseTransform(pt.x)
      }

      if (axis.isVertical()) {
        x = axis.inverseTransform(pt.y)
      }

      if (x >= axis.clipMinimum && x <= axis.clipMaximum) {
        if (!position) {
          if (axis.isHorizontal()) {
            if (!xaxis) {
              xaxis = axis
            }
          } else if (axis.isVertical()) {
            if (!yaxis) {
              yaxis = axis
            }
          }
        } else if (position === axis.position) {
          // Choose right tier
          const positionTierMinShift = axis.positionTierMinShift
          const positionTierMaxShift = axis.positionTierMaxShift

          const posValue = axis.isHorizontal() ? pt.y : pt.x
          const isLeftOrTop = position === AxisPosition.Top || position === AxisPosition.Left
          if (
            (posValue >= plotAreaValue + positionTierMinShift &&
              posValue < plotAreaValue + positionTierMaxShift &&
              !isLeftOrTop) ||
            (posValue <= plotAreaValue - positionTierMinShift &&
              posValue > plotAreaValue - positionTierMaxShift &&
              isLeftOrTop)
          ) {
            if (axis.isHorizontal()) {
              if (isNullOrUndef(xaxis)) {
                xaxis = axis
              }
            } else if (axis.isVertical()) {
              if (isNullOrUndef(yaxis)) {
                yaxis = axis
              }
            }
          }
        }
      }
    }

    return [xaxis, yaxis]
  }

  /**
   * Gets the default color from the DefaultColors palette.
   * @returns The next default color.
   */
  public getDefaultColor(): OxyColor {
    return this.defaultColors[this._currentColorIndex++ % this.defaultColors.length]
  }

  /**
   * Gets the default line style.
   * @returns The next default line style.
   */
  public getDefaultLineStyle(): LineStyle {
    const lineStyleIdx = (this._currentColorIndex / this.defaultColors.length) % Number(LineStyle.None)
    return lineStyleIdx as LineStyle
  }

  /**
   * Gets a series from the specified point.
   * @param point The point.
   * @param limit The limit.
   * @returns The nearest series.
   */
  public getSeriesFromPoint(point: ScreenPoint, limit: number = 100): Series | undefined {
    let mindist = Number_MAX_VALUE
    let nearestSeries: Series | undefined = undefined
    const reversedSeries = getReversedCopy(this.series)
    for (const series of reversedSeries.filter((s) => s.isVisible)) {
      const thr = series.getNearestPoint(point, true) || series.getNearestPoint(point, false)

      if (!thr?.position) {
        continue
      }

      // find distance to this point on the screen
      const dist = screenPointDistanceTo(point, thr.position)
      if (dist < mindist) {
        nearestSeries = series
        mindist = dist
      }
    }

    if (mindist < limit) {
      return nearestSeries
    }
  }

  /**
   * Returns a string that represents this instance.
   * @returns A string that represents this instance.
   */
  public toString(): string {
    return this.title || ''
  }

  /**
   * Gets any exception thrown during the last IPlotModel.Update call.
   * @returns The exception or null if there was no exception.
   */
  public getLastPlotException(): Error | null | undefined {
    return this._lastPlotException
  }

  /**
   * Updates all axes and series.
   * 0. Updates the owner PlotModel of all plot items (axes, series and annotations)
   * 1. Updates the data of each Series (only if updateData==true).
   * 2. Ensure that all series have axes assigned.
   * 3. Updates the max and min of the axes.
   * @param updateData if set to true, all data collections will be updated.
   */
  public update(updateData: boolean): void {
    try {
      this._lastPlotException = null
      this.onUpdating()

      // Updates the default axes
      this.ensureDefaultAxes()

      const visibleSeries = this.series.filter((s) => s.isVisible)
      // Update data of the series
      if (updateData || !this._isDataUpdated) {
        for (const s of visibleSeries) {
          s.updateData()
        }

        this._isDataUpdated = true
      }

      // Updates bar series managers and associated category axes
      this.updateBarSeriesManagers()

      // Update the max and min of the axes
      this.updateMaxMin(updateData)

      // Update category axes that are not managed by bar series managers
      this.updateUnmanagedCategoryAxes()

      // Update undefined colors
      const automaticColorSeries = this.assignColorsToInvisibleSeries ? this.series : visibleSeries

      this.resetDefaultColor()
      for (const s of automaticColorSeries) {
        s.setDefaultValues()
      }
      this.onUpdated()
    } catch (e: any) {
      console.log(e)
      this._lastPlotException = e
    }
  }

  /**
   * Gets the axis for the specified key.
   * @param key The axis key.
   * @returns The axis that corresponds with the key.
   * @throws Error if the axis with the specified key cannot be found.
   */
  public getAxis(key: string): Axis {
    if (!key) {
      throw new Error('Axis key cannot be null.')
    }

    const axis = this.axes.find((a) => a.key === key)
    if (!axis) {
      throw new Error(`Cannot find axis with Key = "${key}"`)
    }
    return axis
  }

  /**
   * Gets the axis for the specified key, or returns a default value.
   * @param key The axis key.
   * @param defaultAxis The default axis.
   * @returns defaultAxis if key is empty or does not exist; otherwise, the axis that corresponds with the key.
   */
  public getAxisOrDefault(key: string, defaultAxis: Axis): Axis {
    if (!key) {
      const axis = this.axes.find((a) => a.key === key)
      return axis || defaultAxis
    }

    return defaultAxis
  }

  /**
   * Resets all axes in the model.
   */
  public resetAllAxes(): void {
    for (const a of this.axes) {
      a.reset()
    }
  }

  /**
   * Pans all axes.
   * @param dx The horizontal distance to pan (screen coordinates).
   * @param dy The vertical distance to pan (screen coordinates).
   */
  public panAllAxes(dx: number, dy: number): void {
    for (const a of this.axes) {
      a.pan(a.isHorizontal() ? dx : dy)
    }
  }

  /**
   * Zooms all axes.
   * @param factor The zoom factor.
   */
  public zoomAllAxes(factor: number): void {
    for (const a of this.axes) {
      a.zoomAtCenter(factor)
    }
  }

  /**
   * Raises the TrackerChanged event.
   * @param result The result.
   */
  public raiseTrackerChanged(result?: TrackerHitResult): void {
    const handler = this.trackerChanged
    if (handler) {
      const args = { hitResult: result }
      handler(this, args)
    }
  }

  /**
   * Raises the TrackerChanged event.
   * @param result The result.
   */
  protected onTrackerChanged(result: TrackerHitResult): void {
    this.raiseTrackerChanged(result)
  }

  /**
   * Gets all elements of the model, top-level elements first.
   * @returns An iterator of the elements.
   */
  protected getHitTestElements(): PlotElement[] {
    const elements: PlotElement[] = []
    const reversedAxes = getReversedCopy(this.axes)
    for (const axis of reversedAxes.filter((a) => a.isAxisVisible && a.layer === AxisLayer.AboveSeries)) {
      elements.push(axis)
    }

    const reversedAnnotations = getReversedCopy(this.annotations)
    for (const annotation of reversedAnnotations.filter((a) => a.layer === AnnotationLayer.AboveSeries)) {
      elements.push(annotation)
    }

    const reversedSeries = getReversedCopy(this.series)
    for (const s of reversedSeries.filter((s) => s.isVisible)) {
      elements.push(s)
    }

    for (const annotation of reversedAnnotations.filter((a) => a.layer === AnnotationLayer.BelowSeries)) {
      elements.push(annotation)
    }

    for (const axis of reversedAxes.filter((a) => a.isAxisVisible && a.layer === AxisLayer.BelowSeries)) {
      elements.push(axis)
    }

    for (const annotation of reversedAnnotations.filter((a) => a.layer === AnnotationLayer.BelowAxes)) {
      elements.push(annotation)
    }

    for (const legend of this.legends) {
      elements.push(legend)
    }

    return elements
  }

  /**
   * Raises the Updated event.
   */
  protected onUpdated(): void {
    const handler = this.updated
    if (handler) {
      handler(this)
    }
  }

  /**
   * Raises the Updating event.
   */
  protected onUpdating(): void {
    const handler = this.updating
    if (handler) {
      handler(this)
    }
  }

  /**
   * Updates the axis transforms.
   */
  private updateAxisTransforms(): void {
    // Update the axis transforms
    for (const a of this.axes) {
      a.updateTransform(this.plotArea)
    }
  }

  /**
   * Enforces the same scale on all axes.
   */
  private enforceCartesianTransforms(): void {
    const notColorAxes = this.axes.filter((a) => !isColorAxis(a))

    // Set the same scaling on all axes
    let sharedScale = Math.min(...notColorAxes.map((a) => Math.abs(a.scale)))
    for (const a of notColorAxes) {
      a.zoomScale(sharedScale)
    }

    sharedScale = Math.max(...notColorAxes.map((a) => Math.abs(a.scale)))
    for (const a of notColorAxes) {
      a.zoomScale(sharedScale)
    }

    for (const a of notColorAxes) {
      a.updateTransform(this.plotArea)
    }
  }

  /**
   * Updates the intervals (major and minor step values).
   */
  private updateIntervals(): void {
    // Update the intervals for all axes
    for (const a of this.axes) {
      a.updateIntervals(this.plotArea)
    }
  }

  /**
   * Finds and sets the default horizontal and vertical axes (the first horizontal/vertical axes in the Axes collection).
   */
  private ensureDefaultAxes(): void {
    const axes = this.axes
    const series = this.series

    this._defaultXAxis = axes.find((a) => a.isHorizontal() && a.isXyAxis())
    this._defaultYAxis = axes.find((a) => a.isVertical() && a.isXyAxis())
    this._defaultMagnitudeAxis = axes.find((a) => a instanceof MagnitudeAxis) as MagnitudeAxis
    this._defaultAngleAxis = axes.find((a) => a instanceof AngleAxis) as AngleAxis
    this._defaultColorAxis = toColorAxis(axes.find((a) => isColorAxis(a)))

    if (isNullOrUndef(this.defaultXAxis)) {
      this._defaultXAxis = this.defaultMagnitudeAxis
    }

    if (isNullOrUndef(this.defaultYAxis)) {
      this._defaultYAxis = this.defaultAngleAxis
    }

    if (this.plotType === PlotType.Polar) {
      if (isNullOrUndef(this.defaultXAxis)) {
        this._defaultXAxis = this._defaultMagnitudeAxis = new MagnitudeAxis()
      }

      if (isNullOrUndef(this.defaultYAxis)) {
        this._defaultYAxis = this._defaultAngleAxis = new AngleAxis()
      }
    } else {
      let createdLinearXAxis = false
      let createdLinearYAxis = false
      if (isNullOrUndef(this.defaultXAxis)) {
        this._defaultXAxis = new LinearAxis({ position: AxisPosition.Bottom })
        createdLinearXAxis = true
      }

      if (isNullOrUndef(this.defaultYAxis)) {
        if (series.some((s) => s.isVisible && s instanceof BarSeries)) {
          this._defaultYAxis = new CategoryAxis({ position: AxisPosition.Left })
        } else {
          this._defaultYAxis = new LinearAxis({ position: AxisPosition.Left })
          createdLinearYAxis = true
        }
      }

      if (createdLinearXAxis && this.defaultXAxis && this.defaultYAxis instanceof CategoryAxis) {
        this.defaultXAxis.minimumPadding = 0
      }

      if (createdLinearYAxis && this.defaultYAxis && this.defaultXAxis instanceof CategoryAxis) {
        this.defaultYAxis.minimumPadding = 0
      }
    }

    const areAxesRequired = series.some((s) => s.isVisible && s.areAxesRequired())

    if (areAxesRequired) {
      if (!axes.includes(this.defaultXAxis!)) {
        console.assert(this.defaultXAxis, 'Default x-axis not created.')
        if (this.defaultXAxis) {
          this.axes.push(this.defaultXAxis)
        }
      }

      if (!axes.includes(this.defaultYAxis!)) {
        console.assert(this.defaultYAxis, 'Default y-axis not created.')
        if (this.defaultYAxis) {
          this.axes.push(this.defaultYAxis)
        }
      }
    }

    // Update the axes of series without axes defined
    for (const s of this.series) {
      if (s.isVisible && s.areAxesRequired()) {
        s.ensureAxes()
      }
    }

    // Update the axes of annotations without axes defined
    for (const a of this.annotations) {
      a.ensureAxes()
    }
  }

  /**
   * Resets the default color index.
   */
  private resetDefaultColor(): void {
    this._currentColorIndex = 0
  }

  /**
   * Updates maximum and minimum values of the axes from values of all data series.
   * @param isDataUpdated if set to true, the data has been updated.
   */
  private updateMaxMin(isDataUpdated: boolean): void {
    if (isDataUpdated) {
      for (const a of this.axes) {
        a.resetDataMaxMin()
      }

      // data has been updated, so we need to calculate the max/min of the series again
      for (const s of this.series.filter((s) => s.isVisible)) {
        s.updateMaxMin()
      }
    }

    for (const s of this.series.filter((s) => s.isVisible)) {
      s.updateAxisMaxMin()
    }

    for (const a of this.axes) {
      a.updateActualMaxMin()
    }
  }

  /**
   * Updates the bar series managers.
   */
  private updateBarSeriesManagers(): void {
    this._barSeriesManagers = []
    const barSeries = this.series.filter((s) => s.isVisible && isBarSeries(s)).map((s) => s as unknown as IBarSeries)

    const barSeriesGroups = new Map<{ ca: CategoryAxis; va?: Axis }, IBarSeries[]>()
    for (const bs of barSeries) {
      const key = [...barSeriesGroups.keys()].find((x) => x.ca === bs.categoryAxis && x.va === bs.valueAxis)
      if (key) {
        barSeriesGroups.get(key)!.push(bs)
        continue
      }
      barSeriesGroups.set(
        {
          ca: bs.categoryAxis,
          va: bs.valueAxis,
        },
        [bs],
      )
    }
    barSeriesGroups.forEach((group, key) => {
      const manager = new BarSeriesManager(key.ca, key.va!, group)
      manager.update()
      this._barSeriesManagers.push(manager)
    })
  }

  /**
   * Updates category axes that are not managed by a BarSeriesManager.
   */
  private updateUnmanagedCategoryAxes(): void {
    const managedCategoryAxes = this._barSeriesManagers.map((manager) => manager.categoryAxis)
    const allCategoryAxis = this.axes.filter((s) => s instanceof CategoryAxis).map((s) => s as CategoryAxis)
    const unmanagedCategoryAxes = allCategoryAxis.filter((a) => !managedCategoryAxes.includes(a))

    for (const unmanagedAxis of unmanagedCategoryAxes as CategoryAxis[]) {
      let defaultCategoryCount = 0
      if (
        !isInfinity(unmanagedAxis.dataMaximum) &&
        !isNaNOrUndef(unmanagedAxis.dataMaximum) &&
        unmanagedAxis.dataMaximum > 0
      ) {
        // support default categories for e.g. heat maps
        defaultCategoryCount = Math.floor(unmanagedAxis.dataMaximum) + 1
      }

      unmanagedAxis.updateLabels(defaultCategoryCount)
    }
  }

  // =============Rendering================

  /**
   * Renders the plot with the specified rendering context within the given rectangle.
   * @param rc The rendering context.
   * @param rect The plot bounds.
   */
  render(rc: IRenderContext, rect: OxyRect): Promise<void> {
    return this.renderOverride(rc, rect)
  }

  /**
   * Renders the plot with the specified rendering context.
   * @param rc The rendering context.
   * @param rect The plot bounds.
   */
  protected async renderOverride(rc: IRenderContext, rect: OxyRect): Promise<void> {
    // Locking mechanism in JavaScript/TypeScript is handled differently than in C#,
    // so we don't translate the lock statement.

    const initialClipCount = rc.clipCount
    let autoResetClipDisp: IDisposable | undefined = undefined
    try {
      autoResetClipDisp = RenderingExtensions.autoResetClip(rc, rect)
      if (this._lastPlotException) {
        const errorMessage = `An exception of type ${this._lastPlotException.constructor.name} was thrown when updating the plot model.\r\n${this._lastPlotException.stack}`
        await this.renderErrorMessage(rc, `OxyPlot exception: ${this._lastPlotException.message}`, errorMessage)
        return
      }

      if (this.renderingDecorator) {
        rc = this.renderingDecorator(rc)
      }

      this._plotBounds = rect

      this._actualPlotMargins = newOxyThickness(
        isNaNOrUndef(this.plotMargins.left) ? 0 : this.plotMargins.left,
        isNaNOrUndef(this.plotMargins.top) ? 0 : this.plotMargins.top,
        isNaNOrUndef(this.plotMargins.right) ? 0 : this.plotMargins.right,
        isNaNOrUndef(this.plotMargins.bottom) ? 0 : this.plotMargins.bottom,
      )

      for (const l of this.legends) {
        l.ensureLegendProperties()
      }

      for (let i = 0; i < 10; i++) {
        await this.updatePlotArea(rc)
        this.updateAxisTransforms()
        this.updateIntervals()

        if (!this.adjustPlotMargins(rc)) {
          break
        }
      }

      if (this.plotType === PlotType.Cartesian) {
        this.enforceCartesianTransforms()
        this.updateIntervals()
      }

      await this.renderBackgrounds(rc)
      await this.renderAnnotations(rc, AnnotationLayer.BelowAxes)
      await this.renderAxes(rc, AxisLayer.BelowSeries)
      await this.renderAnnotations(rc, AnnotationLayer.BelowSeries)
      await this.renderSeries(rc)
      await this.renderAnnotations(rc, AnnotationLayer.AboveSeries)
      await this.renderTitle(rc)
      await this.renderBox(rc)
      await this.renderAxes(rc, AxisLayer.AboveSeries)

      if (this.isLegendVisible) {
        await this.renderLegends(rc)
      }

      if (rc.clipCount !== initialClipCount + 1) {
        throw new Error('Unbalanced calls to IRenderContext.pushClip were made during rendering.')
      }
    } catch (exception: any) {
      try {
        autoResetClipDisp?.dispose()
      } catch (e2) {
        exception = e2
      } finally {
        autoResetClipDisp = undefined
      }

      debugger
      console.log(exception)

      while (rc.clipCount > initialClipCount) {
        rc.popClip()
      }

      const errorMessage = `An exception of type ${exception.constructor?.name} was thrown when rendering the plot model.\r\n${exception.stack}`
      this._lastPlotException = exception
      await this.renderErrorMessage(rc, `OxyPlot exception: ${exception.message}`, errorMessage)
    } finally {
      autoResetClipDisp?.dispose()
      rc.cleanUp()
    }
  }

  /**
   * Renders the specified error message.
   * @param rc The rendering context.
   * @param title The title.
   * @param errorMessage The error message.
   * @param fontSize The font size. The default value is 12.
   */
  private async renderErrorMessage(
    rc: IRenderContext,
    title: string,
    errorMessage: string,
    fontSize: number = 12,
  ): Promise<void> {
    const p0 = newScreenPoint(10, 10)
    await rc.drawText(p0, title, this.textColor, undefined, fontSize, FontWeights.Bold)
    await RenderingExtensions.drawMultilineText(
      rc,
      screenPointPlus(p0, newScreenVector(0, fontSize * 1.5)),
      errorMessage,
      this.textColor,
      undefined,
      fontSize,
      fontSize * 1.25,
    )
  }

  /**
   * Adjusts the plot margins.
   * @param rc The render context.
   * @returns true if the margins were adjusted.
   */
  private adjustPlotMargins(rc: IRenderContext): boolean {
    const visibleAxes = this.axes.filter((axis) => axis.isAxisVisible)
    visibleAxes.forEach((axis) => {
      axis.measure(rc)
    })

    let desiredMargin = OxyThickness_Zero

    const includeInMargin = (size: number, borderPosition: AxisPosition) => {
      switch (borderPosition) {
        case AxisPosition.Bottom:
          desiredMargin = newOxyThickness(
            desiredMargin.left,
            desiredMargin.top,
            desiredMargin.right,
            Math.max(desiredMargin.bottom, size),
          )
          break
        case AxisPosition.Left:
          desiredMargin = newOxyThickness(
            Math.max(desiredMargin.left, size),
            desiredMargin.top,
            desiredMargin.right,
            desiredMargin.bottom,
          )
          break
        case AxisPosition.Right:
          desiredMargin = newOxyThickness(
            desiredMargin.left,
            desiredMargin.top,
            Math.max(desiredMargin.right, size),
            desiredMargin.bottom,
          )
          break
        case AxisPosition.Top:
          desiredMargin = newOxyThickness(
            desiredMargin.left,
            Math.max(desiredMargin.top, size),
            desiredMargin.right,
            desiredMargin.bottom,
          )
          break
      }
    }

    // include the value of the outermost position tier on each side ('normal' axes only)
    for (let position = AxisPosition.Left; position <= AxisPosition.Bottom; position++) {
      const axesOfPosition = visibleAxes.filter((a) => a.position === position)
      const requiredSize = this.adjustAxesPositions(axesOfPosition)
      includeInMargin(requiredSize, position)
    }

    // include the desired margin of all visible axes (including polar axes)
    visibleAxes.forEach((axis) => {
      desiredMargin = OxyThicknessEx.include(desiredMargin, axis.desiredMargin)
    })

    let currentMargin = this.plotMargins
    currentMargin = newOxyThickness(
      isNaNOrUndef(currentMargin.left) ? desiredMargin.left : currentMargin.left,
      isNaNOrUndef(currentMargin.top) ? desiredMargin.top : currentMargin.top,
      isNaNOrUndef(currentMargin.right) ? desiredMargin.right : currentMargin.right,
      isNaNOrUndef(currentMargin.bottom) ? desiredMargin.bottom : currentMargin.bottom,
    )

    if (OxyThicknessEx.equals(currentMargin, this.actualPlotMargins)) {
      return false
    }

    this._actualPlotMargins = currentMargin
    return true
  }

  /**
   * Adjust the positions of parallel axes, returns total size
   * @param parallelAxes The parallel axes.
   * @returns The maximum value of the position tier.
   */
  private adjustAxesPositions(parallelAxes: Axis[]): number {
    let maxValueOfPositionTier = 0

    const getSize = (axis: Axis) => {
      switch (axis.position) {
        case AxisPosition.Left:
          return axis.desiredMargin.left
        case AxisPosition.Right:
          return axis.desiredMargin.right
        case AxisPosition.Top:
          return axis.desiredMargin.top
        case AxisPosition.Bottom:
          return axis.desiredMargin.bottom
        default:
          throw new Error(`We don't do this for polar axes`)
      }
    }

    const groups = parallelAxes.reduce((groups: Map<number, Axis[]>, a: Axis) => {
      const key = a.positionTier
      const group = groups.get(key)
      if (group) {
        group.push(a)
      } else {
        groups.set(key, [a])
      }
      return groups
    }, new Map<number, Axis[]>())

    groups.forEach((axesOfPositionTier, key) => {
      const maxSizeOfPositionTier = Math.max(...axesOfPositionTier.map(getSize))

      const minValueOfPositionTier = maxValueOfPositionTier

      if (Math.abs(maxValueOfPositionTier) > 1e-5) {
        maxValueOfPositionTier += this.axisTierDistance
      }

      maxValueOfPositionTier += maxSizeOfPositionTier

      axesOfPositionTier.forEach((axis) => {
        axis.positionTierSize = maxSizeOfPositionTier
        axis.positionTierMinShift = minValueOfPositionTier
        axis.positionTierMaxShift = maxValueOfPositionTier
      })
    })

    return maxValueOfPositionTier
  }

  /**
   * Measures the size of the title and subtitle.
   * @param rc The rendering context.
   * @returns Size of the titles.
   */
  private measureTitles(rc: IRenderContext): OxySize {
    const titleSize = rc.measureText(this.title || '', this.actualTitleFont, this.titleFontSize, this.titleFontWeight)
    const subtitleSize = rc.measureText(
      this.subtitle || '',
      this.subtitleFont || this.actualSubtitleFont,
      this.subtitleFontSize,
      this.subtitleFontWeight,
    )
    const height = titleSize.height + subtitleSize.height
    const width = Math.max(titleSize.width, subtitleSize.width)
    return newOxySize(width, height)
  }

  /**
   * Renders the annotations.
   * @param rc The render context.
   * @param layer The layer.
   */
  private renderAnnotations(rc: IRenderContext, layer: AnnotationLayer): Promise<void> {
    return this.renderPlotElements(
      this.annotations.filter((a) => a.layer === layer),
      rc,
      async (annotation) => annotation.render(rc),
    )
  }

  /**
   * Renders the axes.
   * @param rc The render context.
   * @param layer The layer.
   */
  private async renderAxes(rc: IRenderContext, layer: AxisLayer): Promise<void> {
    // render pass 0
    for (const a of this.axes.filter((a) => a.isAxisVisible && a.layer === layer)) {
      rc.setToolTip(a.toolTip)
      await a.render(rc, 0)
    }

    // render pass 1
    for (const a of this.axes.filter((a) => a.isAxisVisible && a.layer === layer)) {
      rc.setToolTip(a.toolTip)
      await a.render(rc, 1)
    }
    rc.setToolTip(undefined)
  }

  private async renderLegends(rc: IRenderContext): Promise<void> {
    if (!this.isLegendVisible) return

    for (const l of this.legends.filter((l) => l.isLegendVisible)) {
      rc.setToolTip(l.toolTip)
      await l.renderLegends(rc)
    }
  }

  /**
   * Renders the series backgrounds.
   * @param rc The render context.
   */
  private async renderBackgrounds(rc: IRenderContext): Promise<void> {
    // Render the main background of the plot area (only if there are axes)
    if (this.axes.length > 0 && OxyColorHelper.isVisible(this.plotAreaBackground)) {
      await rc.drawRectangle(this.plotArea, this.plotAreaBackground, OxyColors.Undefined, 0, this.edgeRenderingMode)
    }

    const xyAxisSeries = this.series.filter((s) => s instanceof XYAxisSeries).map((s) => s as XYAxisSeries)

    const visibleXyAxisSeries = xyAxisSeries.filter((s) => s.isVisible && OxyColorHelper.isVisible(s.background))
    for (const s of visibleXyAxisSeries) {
      await rc.drawRectangle(s.getScreenRectangle(), s.background, OxyColors.Undefined, 0, this.edgeRenderingMode)
    }
  }

  /**
   * Renders the border around the plot area.
   * @param rc The render context.
   * @remarks The border will only by rendered if there are axes in the plot.
   */
  private async renderBox(rc: IRenderContext): Promise<void> {
    if (this.axes.length > 0) {
      const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
        this.edgeRenderingMode,
        EdgeRenderingMode.PreferSharpness,
      )
      await RenderingExtensions.drawRectangle(
        rc,
        this.plotArea,
        this.plotAreaBorderColor,
        this.plotAreaBorderThickness,
        actualEdgeRenderingMode,
      )
    }
  }

  /**
   * Renders the series.
   * @param rc The render context.
   */
  private async renderSeries(rc: IRenderContext): Promise<void> {
    this._barSeriesManagers.forEach((barSeriesManager) => {
      barSeriesManager.initializeRender()
    })

    return this.renderPlotElements(
      this.series.filter((s) => s.isVisible),
      rc,
      async (series) => series.render(rc),
    )
  }

  /**
   * Renders the plot elements.
   * @param plotElements The plot elements.
   * @param rc The render context.
   * @param renderAction The render action.
   */
  private async renderPlotElements<T extends PlotElement>(
    plotElements: T[],
    rc: IRenderContext,
    renderAction: (plotElement: T) => Promise<void>,
  ): Promise<void> {
    let previousClippingRect = OxyRect_Everything

    function eq(r: OxyRect, other: OxyRect) {
      return OxyRectHelper.equals(r, other)
    }

    for (const plotElement of plotElements) {
      const currentClippingRect = plotElement.getClippingRect()
      if (!eq(currentClippingRect, previousClippingRect)) {
        if (!eq(previousClippingRect, OxyRect_Everything)) {
          rc.popClip()
          previousClippingRect = OxyRect_Everything
        }

        if (!eq(currentClippingRect, OxyRect_Everything)) {
          rc.pushClip(currentClippingRect)
          previousClippingRect = currentClippingRect
        }
      }

      rc.setToolTip(plotElement.toolTip)
      await renderAction(plotElement)
    }

    if (!eq(previousClippingRect, OxyRect_Everything)) {
      rc.popClip()
    }

    rc.setToolTip(undefined)
  }

  /**
   * Renders the title and subtitle.
   * @param rc The render context.
   */
  private async renderTitle(rc: IRenderContext): Promise<void> {
    let maxSize: OxySize | undefined = undefined

    if (this.clipTitle) {
      maxSize = newOxySize(this.titleArea.width * this.titleClippingLength, Number_MAX_VALUE)
    }

    const titleSize = rc.measureText(this.title || '', this.actualTitleFont, this.titleFontSize, this.titleFontWeight)

    const x = (this.titleArea.left + OxyRectHelper.right(this.titleArea)) * 0.5
    let y = this.titleArea.top

    if (this.title) {
      rc.setToolTip(this.titleToolTip)

      await MathRenderingExtensions.drawMathText(
        rc,
        newScreenPoint(x, y),
        this.title,
        OxyColorHelper.getActualColor(this.titleColor, this.textColor),
        this.actualTitleFont,
        this.titleFontSize,
        this.titleFontWeight,
        0,
        HorizontalAlignment.Center,
        VerticalAlignment.Top,
        maxSize,
      )
      y += titleSize.height

      rc.setToolTip(undefined)
    }

    if (this.subtitle) {
      await MathRenderingExtensions.drawMathText(
        rc,
        newScreenPoint(x, y),
        this.subtitle,
        OxyColorHelper.getActualColor(this.subtitleColor, this.textColor),
        this.actualSubtitleFont,
        this.subtitleFontSize,
        this.subtitleFontWeight,
        0,
        HorizontalAlignment.Center,
        VerticalAlignment.Top,
        maxSize,
      )
    }
  }

  /**
   * Calculates the plot area (subtract padding, title size and outside legends)
   * @param rc The rendering context.
   */
  private async updatePlotArea(rc: IRenderContext): Promise<void> {
    let plotAndAxisArea = newOxyRect(
      this.plotBounds.left + this.padding.left,
      this.plotBounds.top + this.padding.top,
      Math.max(0, this.width - this.padding.left - this.padding.right),
      Math.max(0, this.height - this.padding.top - this.padding.bottom),
    )

    const titleSize = this.measureTitles(rc)

    if (titleSize.height > 0) {
      const titleHeight = titleSize.height + this.titlePadding
      plotAndAxisArea = newOxyRect(
        plotAndAxisArea.left,
        plotAndAxisArea.top + titleHeight,
        plotAndAxisArea.width,
        Math.max(0, plotAndAxisArea.height - titleHeight),
      )
    }

    let plotArea = OxyRectHelper.deflate(plotAndAxisArea, this.actualPlotMargins)

    if (this.isLegendVisible) {
      // Make space for legends

      let maxLegendSize = newOxySize(0, 0)
      let legendMargin = 0
      const outsideVisibleLegends = this.legends.filter(
        (l) => l.legendPlacement === LegendPlacement.Outside && l.isLegendVisible,
      )
      // first run Outside Left-Side legends
      for (const legend of outsideVisibleLegends.filter((l) => isLeftLegend(l.legendPosition))) {
        // Find the available size for the legend box
        const availableLegendWidth = legend.allowUseFullExtent ? plotAndAxisArea.width : plotArea.width
        let availableLegendHeight = legend.allowUseFullExtent ? plotAndAxisArea.height : plotArea.height
        availableLegendHeight = isNaN(legend.legendMaxHeight)
          ? availableLegendHeight
          : Math.min(availableLegendHeight, legend.legendMaxHeight)

        const lsiz = await legend.getLegendSize(rc, newOxySize(availableLegendWidth, availableLegendHeight))
        legend.legendSize = lsiz
        maxLegendSize = newOxySize(
          Math.max(maxLegendSize.width, lsiz.width),
          Math.max(maxLegendSize.height, lsiz.height),
        )

        if (legend.legendMargin > legendMargin) legendMargin = legend.legendMargin
      }

      // Adjust the plot area after the size of the legend has been calculated
      if (maxLegendSize.width > 0 || maxLegendSize.height > 0) {
        plotArea = newOxyRect(
          plotArea.left + maxLegendSize.width + legendMargin,
          plotArea.top,
          Math.max(0, plotArea.width - (maxLegendSize.width + legendMargin)),
          plotArea.height,
        )
      }

      maxLegendSize = newOxySize(0, 0)
      legendMargin = 0
      // second run Outside Right-Side legends
      for (const legend of outsideVisibleLegends.filter((l) => isRightLegend(l.legendPosition))) {
        // Find the available size for the legend box
        const availableLegendWidth = legend.allowUseFullExtent ? plotAndAxisArea.width : plotArea.width
        let availableLegendHeight = legend.allowUseFullExtent ? plotAndAxisArea.height : plotArea.height
        availableLegendHeight = isNaN(legend.legendMaxHeight)
          ? availableLegendHeight
          : Math.min(availableLegendHeight, legend.legendMaxHeight)

        const lsiz = await legend.getLegendSize(rc, newOxySize(availableLegendWidth, availableLegendHeight))
        legend.legendSize = lsiz
        maxLegendSize = newOxySize(
          Math.max(maxLegendSize.width, lsiz.width),
          Math.max(maxLegendSize.height, lsiz.height),
        )

        if (legend.legendMargin > legendMargin) legendMargin = legend.legendMargin
      }

      // Adjust the plot area after the size of the legend has been calculated
      if (maxLegendSize.width > 0 || maxLegendSize.height > 0) {
        plotArea = newOxyRect(
          plotArea.left,
          plotArea.top,
          Math.max(0, plotArea.width - (maxLegendSize.width + legendMargin)),
          plotArea.height,
        )
      }

      maxLegendSize = newOxySize(0, 0)
      legendMargin = 0
      // third run Outside Top legends
      for (const legend of outsideVisibleLegends.filter((l) => isTopLegend(l.legendPosition))) {
        // Find the available size for the legend box
        const availableLegendWidth = legend.allowUseFullExtent ? plotAndAxisArea.width : plotArea.width
        let availableLegendHeight = legend.allowUseFullExtent ? plotAndAxisArea.height : plotArea.height
        availableLegendHeight = isNaN(legend.legendMaxHeight)
          ? availableLegendHeight
          : Math.min(availableLegendHeight, legend.legendMaxHeight)

        const lsiz = await legend.getLegendSize(rc, newOxySize(availableLegendWidth, availableLegendHeight))
        legend.legendSize = lsiz
        maxLegendSize = newOxySize(
          Math.max(maxLegendSize.width, lsiz.width),
          Math.max(maxLegendSize.height, lsiz.height),
        )

        if (legend.legendMargin > legendMargin) legendMargin = legend.legendMargin
      }

      // Adjust the plot area after the size of the legend has been calculated
      if (maxLegendSize.width > 0 || maxLegendSize.height > 0) {
        plotArea = newOxyRect(
          plotArea.left,
          plotArea.top + maxLegendSize.height + legendMargin,
          plotArea.width,
          Math.max(0, plotArea.height - (maxLegendSize.height + legendMargin)),
        )
      }

      maxLegendSize = newOxySize(0, 0)
      legendMargin = 0
      // fourth run Outside Bottom legends
      for (const legend of outsideVisibleLegends.filter((l) => isBottomLegend(l.legendPosition))) {
        // Find the available size for the legend box
        const availableLegendWidth = legend.allowUseFullExtent ? plotAndAxisArea.width : plotArea.width
        let availableLegendHeight = legend.allowUseFullExtent ? plotAndAxisArea.height : plotArea.height
        availableLegendHeight = isNaN(legend.legendMaxHeight)
          ? availableLegendHeight
          : Math.min(availableLegendHeight, legend.legendMaxHeight)

        const lsiz = await legend.getLegendSize(rc, newOxySize(availableLegendWidth, availableLegendHeight))
        legend.legendSize = lsiz
        maxLegendSize = newOxySize(
          Math.max(maxLegendSize.width, lsiz.width),
          Math.max(maxLegendSize.height, lsiz.height),
        )

        if (legend.legendMargin > legendMargin) legendMargin = legend.legendMargin
      }

      // Adjust the plot area after the size of the legend has been calculated
      if (maxLegendSize.width > 0 || maxLegendSize.height > 0) {
        plotArea = newOxyRect(
          plotArea.left,
          plotArea.top,
          plotArea.width,
          Math.max(0, plotArea.height - (maxLegendSize.height + legendMargin)),
        )
      }

      // Finally calculate size of inside legends
      for (const legend of this.legends.filter(
        (l) => l.legendPlacement === LegendPlacement.Inside && l.isLegendVisible,
      )) {
        // Find the available size for the legend box
        let availableLegendWidth = plotArea.width
        let availableLegendHeight = isNaN(legend.legendMaxHeight)
          ? plotArea.height
          : Math.min(plotArea.height, legend.legendMaxHeight)

        if (legend.legendPlacement === LegendPlacement.Inside) {
          availableLegendWidth -= legend.legendMargin * 2
          availableLegendHeight -= legend.legendMargin * 2
        }

        legend.legendSize = await legend.getLegendSize(rc, newOxySize(availableLegendWidth, availableLegendHeight))
      }
    }

    /** Ensure the plot area is valid */
    if (plotArea.height < 0) {
      plotArea = newOxyRect(plotArea.left, plotArea.top, plotArea.width, 1)
    }

    if (plotArea.width < 0) {
      plotArea = newOxyRect(plotArea.left, plotArea.top, 1, plotArea.height)
    }

    this._plotArea = plotArea
    this._plotAndAxisArea = OxyRectHelper.inflateAll(plotArea, this.actualPlotMargins)

    switch (this.titleHorizontalAlignment) {
      case TitleHorizontalAlignment.CenteredWithinView:
        this._titleArea = newOxyRect(
          this.plotBounds.left,
          this.plotBounds.top + this.padding.top,
          this.width,
          titleSize.height + this.titlePadding * 2,
        )
        break
      default:
        this._titleArea = newOxyRect(
          this.plotArea.left,
          this.plotBounds.top + this.padding.top,
          this.plotArea.width,
          titleSize.height + this.titlePadding * 2,
        )
        break
    }

    /** Calculate the legend area for each legend. */
    for (const l of this.legends) {
      l.legendArea = l.getLegendRectangle(l.legendSize)
    }
  }

  toJSON(opt?: PlotModelSerializeOptions) {
    const plotModel = copyPlotElementProperties(this, ExtendedPlotModelOptions, {
      excludeDefault: opt?.excludeDefault,
    })
    if (this._axes.length > 0) {
      plotModel.axes = this.arrayToJson(this._axes, opt)
    }
    if (this._legends.length > 0) {
      plotModel.legends = this.arrayToJson(this._legends, opt)
    }
    if (this._series.length > 0) {
      plotModel.series = this.arrayToJson(this._series, opt)
    }
    if (this._annotations.length > 0) {
      plotModel.annotations = this.arrayToJson(this._annotations, opt)
    }

    return plotModel
  }

  private arrayToJson(elements: any[], opt?: PlotModelSerializeOptions) {
    const jsonList = []
    for (const ele of elements) {
      if (!ele.toJSON) {
        console.warn(`'${ele.getElementName()}' does not have a toJSON method`)
        continue
      }
      jsonList.push(ele.toJSON(opt))
    }

    return jsonList
  }
}
