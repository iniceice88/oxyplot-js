import {
  type CreateDataPointSeriesOptions,
  type DataPoint,
  DataPointSeries,
  EdgeRenderingMode,
  ExtendedDefaultDataPointSeriesOptions,
  type IRenderContext,
  newDataPoint,
  newOxyRect,
  newScreenVector,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRect_Empty,
  OxyRectHelper,
  PlotElementExtensions,
  type PlotModelSerializeOptions,
  RenderingExtensions,
  type ScreenPoint,
  screenPointMinusVector,
  screenPointPlus,
  TrackerHitResult,
} from '@/oxyplot'

import { minValueOfArray, assignObject, isNaNOrUndef } from '@/patch'

export interface CreateLinearBarSeriesOptions extends CreateDataPointSeriesOptions {
  fillColor?: OxyColor
  barWidth?: number
  strokeColor?: OxyColor
  strokeThickness?: number
  negativeFillColor?: OxyColor
  negativeStrokeColor?: OxyColor
  baseValue?: number
  baseLine?: number
}

const DefaultLinearBarSeriesOptions: CreateLinearBarSeriesOptions = {
  fillColor: OxyColors.Automatic,
  barWidth: 5,
  strokeColor: OxyColors.Black,
  strokeThickness: 0,
  negativeFillColor: OxyColors.Undefined,
  negativeStrokeColor: OxyColors.Undefined,
  baseValue: 0,
  baseLine: Number.NaN,
} as const

export const ExtendedDefaultLinearBarSeriesOptions = {
  ...ExtendedDefaultDataPointSeriesOptions,
  ...DefaultLinearBarSeriesOptions,
}

/**
 * Represents a series to display bars in a linear axis
 */
export class LinearBarSeries extends DataPointSeries {
  /**
   * The rendered rectangles.
   */
  private readonly _rectangles: OxyRect[] = []

  /**
   * The indexes matching rendered rectangles.
   */
  private readonly _rectanglesPointIndexes: number[] = []

  /**
   * The default color.
   */
  private _defaultColor: OxyColor = OxyColors.Undefined

  /**
   * Initializes a new instance of the LinearBarSeries class.
   */
  constructor(opt?: CreateLinearBarSeriesOptions) {
    super(opt)
    assignObject(this, DefaultLinearBarSeriesOptions, opt)
  }

  getElementName() {
    return 'LinearBarSeries'
  }

  /**
   * Gets or sets the color of the interior of the bars.
   */
  fillColor: OxyColor = DefaultLinearBarSeriesOptions.fillColor!

  /**
   * Gets or sets the width of the bars.
   */
  barWidth: number = DefaultLinearBarSeriesOptions.barWidth!

  /**
   * Gets or sets the thickness of the curve.
   */
  strokeThickness: number = DefaultLinearBarSeriesOptions.strokeThickness!

  /**
   * Gets or sets the color of the border around the bars.
   */
  strokeColor: OxyColor = DefaultLinearBarSeriesOptions.strokeColor!

  /**
   * Gets or sets the color of the interior of the bars when the value is negative.
   */
  negativeFillColor: OxyColor = DefaultLinearBarSeriesOptions.negativeFillColor!

  /**
   * Gets or sets the color of the border around the bars when the value is negative.
   */
  negativeStrokeColor: OxyColor = DefaultLinearBarSeriesOptions.negativeStrokeColor!

  /**
   * Gets the actual color.
   */
  get actualColor(): OxyColor {
    return OxyColorHelper.getActualColor(this.fillColor, this._defaultColor)
  }

  /**
   * Gets or sets the base value. Default value is 0.
   */
  baseValue: number = DefaultLinearBarSeriesOptions.baseValue!

  /**
   * Gets or sets the base value.
   */
  baseLine: number = DefaultLinearBarSeriesOptions.baseLine!

  private _actualBaseLine: number = NaN
  /**
   * Gets or sets the actual baseline.
   */
  get actualBaseLine() {
    return this._actualBaseLine
  }

  set actualBaseLine(value: number) {
    this._actualBaseLine = value
  }

  /**
   * Gets the nearest point.
   * @param point The point.
   * @param interpolate interpolate if set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    const rectangleIndex = this.findRectangleIndex(point)
    if (rectangleIndex < 0) {
      return undefined
    }

    const rectangle = this._rectangles[rectangleIndex]
    if (!OxyRectHelper.containsPoint(rectangle, point)) {
      return undefined
    }

    const pointIndex = this._rectanglesPointIndexes[rectangleIndex]
    const dataPoint = this.actualPoints[pointIndex]
    const item = this.getItem(pointIndex)

    const text = this.formatDefaultTrackerString(item, dataPoint)
    return new TrackerHitResult({
      series: this,
      dataPoint: dataPoint,
      position: point,
      item: item,
      index: pointIndex,
      text: text,
    })
  }

  /**
   * Renders the series on the specified rendering context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    this._rectangles.length = 0
    this._rectanglesPointIndexes.length = 0

    const actualPoints = this.actualPoints
    if (!actualPoints || actualPoints.length === 0) {
      return
    }

    this.verifyAxes()
    await this.renderBars(rc, actualPoints)
  }

  /** Renders the legend symbol for the line series on the specified rendering context. */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const right = OxyRectHelper.right(legendBox)
    const bottom = OxyRectHelper.bottom(legendBox)
    const xmid = (legendBox.left + right) / 2
    const ymid = (legendBox.top + bottom) / 2
    const height = (bottom - legendBox.top) * 0.8
    const width = height
    await rc.drawRectangle(
      newOxyRect(xmid - 0.5 * width, ymid - 0.5 * height, width, height),
      this.getSelectableColor(this.actualColor),
      this.strokeColor,
      this.strokeThickness,
      this.edgeRenderingMode,
    )
  }

  /**
   * Sets default values from the plot model.
   * @internal
   * */
  setDefaultValues(): void {
    if (OxyColorHelper.isAutomatic(this.fillColor)) {
      this._defaultColor = this.plotModel.getDefaultColor()
    }
  }

  /**
   * Updates the axes to include the max and min of this series.
   * @internal
   * */
  updateAxisMaxMin(): void {
    super.updateAxisMaxMin()

    this.computeActualBaseLine()
    this.yAxis!.include(this.actualBaseLine)
  }

  /** Computes the actual base value. */
  protected computeActualBaseLine(): void {
    if (isNaNOrUndef(this.baseLine)) {
      if (this.yAxis!.isLogarithmic()) {
        const lowestPositiveY = !this.actualPoints
          ? 1
          : minValueOfArray(
              this.actualPoints.filter((p) => p.y > 0).map((p) => p.y),
              1,
            )
        this.actualBaseLine = Math.max(lowestPositiveY / 10.0, this.baseValue)
      } else {
        this.actualBaseLine = 0
      }
    } else {
      this.actualBaseLine = this.baseLine
    }
  }

  /**
   * Find the index of a rectangle that contains the specified point.
   * @param point the target point
   * @returns the rectangle index
   */
  private findRectangleIndex(point: ScreenPoint): number {
    let comparer: (a: OxyRect, b: OxyRect) => number
    if (PlotElementExtensions.isTransposed(this)) {
      comparer = (x: OxyRect, _y: OxyRect) => {
        if (OxyRectHelper.bottom(x) < point.y) {
          return 1
        }

        if (x.top > point.y) {
          return -1
        }

        return 0
      }
    } else {
      comparer = (x: OxyRect, _y: OxyRect) => {
        if (OxyRectHelper.right(x) < point.x) {
          return -1
        }

        if (x.left > point.x) {
          return 1
        }

        return 0
      }
    }

    return this._rectangles.findIndex((rect: OxyRect) => comparer(rect, OxyRect_Empty) === 0)
  }

  /** Renders the series bars. */
  private async renderBars(rc: IRenderContext, actualPoints: DataPoint[]): Promise<void> {
    const clampBase = this.yAxis!.isLogarithmic() && !this.yAxis!.isValidValue(this.baseValue)

    const widthOffset = this.getBarWidth(actualPoints) / 2
    const widthVector = PlotElementExtensions.orientateVector(this, newScreenVector(widthOffset, 0))

    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      this.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )

    for (let pointIndex = 0; pointIndex < actualPoints.length; pointIndex++) {
      const actualPoint = actualPoints[pointIndex]
      if (!this.isValidPoint(actualPoint)) {
        continue
      }

      const screenPoint = screenPointMinusVector(this.transform(actualPoint), widthVector)
      const spBase = this.transform(newDataPoint(actualPoint.x, clampBase ? this.yAxis!.clipMinimum : this.baseValue))
      const basePoint = screenPointPlus(spBase, widthVector)
      const rectangle = OxyRectHelper.fromScreenPoints(basePoint, screenPoint)
      this._rectangles.push(rectangle)
      this._rectanglesPointIndexes.push(pointIndex)

      const barColors = this.getBarColors(actualPoint.y)

      await rc.drawRectangle(
        rectangle,
        barColors.fillColor,
        barColors.strokeColor,
        this.strokeThickness,
        actualEdgeRenderingMode,
      )
    }
  }

  /**
   * Computes the bar width.
   * @param actualPoints The list of points.
   * @returns The bars width.
   */
  private getBarWidth(actualPoints: DataPoint[]): number {
    let minDistance = this.barWidth / this.xAxis!.scale
    for (let pointIndex = 1; pointIndex < actualPoints.length; pointIndex++) {
      const distance = actualPoints[pointIndex].x - actualPoints[pointIndex - 1].x
      if (distance < minDistance) {
        minDistance = distance
      }
    }

    return minDistance * this.xAxis!.scale
  }

  /**
   * Gets the colors used to draw a bar.
   * @param y The point y value
   * @returns The bar colors
   */
  private getBarColors(y: number): BarColors {
    const positive = y >= this.baseValue
    const fillColor =
      positive || OxyColorHelper.isUndefined(this.negativeFillColor)
        ? this.getSelectableFillColor(this.actualColor)
        : this.negativeFillColor
    const strokeColor =
      positive || OxyColorHelper.isUndefined(this.negativeStrokeColor) ? this.strokeColor : this.negativeStrokeColor

    return {
      fillColor,
      strokeColor,
    }
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultLinearBarSeriesOptions
  }

  toJSON(opt?: PlotModelSerializeOptions) {
    const json = super.toJSON(opt)
    if (this.points?.length) {
      json.points = this.points
    }
    return json
  }
}

interface BarColors {
  /** The fill color */
  fillColor: OxyColor

  /** The stroke color */
  strokeColor: OxyColor
}
