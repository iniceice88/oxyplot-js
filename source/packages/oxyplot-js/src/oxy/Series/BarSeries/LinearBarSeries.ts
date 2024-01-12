import type { CreateDataPointSeriesOptions, DataPoint, IRenderContext, ScreenPoint } from '@/oxyplot'
import {
  DataPointSeries,
  EdgeRenderingMode,
  newDataPoint,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
  screenPointMinusVector,
  screenPointPlus,
  ScreenVector,
  TrackerHitResult,
} from '@/oxyplot'
import { minValueOfArray, removeUndef } from '@/patch'

export interface CreateLinearBarSeriesOptions extends CreateDataPointSeriesOptions {
  barWidth?: number
  strokeColor?: OxyColor
  strokeThickness?: number
  negativeFillColor?: OxyColor
  negativeStrokeColor?: OxyColor
  baseValue?: number
  baseLine?: number
}

/**
 * Represents a series to display bars in a linear axis
 */
export class LinearBarSeries extends DataPointSeries {
  /**
   * The rendered rectangles.
   */
  private readonly rectangles: OxyRect[] = []

  /**
   * The indexes matching rendered rectangles.
   */
  private readonly rectanglesPointIndexes: number[] = []

  /**
   * The default color.
   */
  private defaultColor: OxyColor = OxyColors.Undefined

  /**
   * Initializes a new instance of the LinearBarSeries class.
   */
  constructor(opt?: CreateLinearBarSeriesOptions) {
    super(opt)
    this.fillColor = OxyColors.Automatic
    this.barWidth = 5
    this.strokeColor = OxyColors.Black
    this.strokeThickness = 0
    this.negativeFillColor = OxyColors.Undefined
    this.negativeStrokeColor = OxyColors.Undefined
    this.baseValue = 0
    this.baseLine = Number.NaN
    this.actualBaseLine = Number.NaN

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the color of the interior of the bars.
   */
  fillColor: OxyColor

  /**
   * Gets or sets the width of the bars.
   */
  barWidth: number

  /**
   * Gets or sets the thickness of the curve.
   */
  strokeThickness: number

  /**
   * Gets or sets the color of the border around the bars.
   */
  strokeColor: OxyColor

  /**
   * Gets or sets the color of the interior of the bars when the value is negative.
   */
  negativeFillColor: OxyColor

  /**
   * Gets or sets the color of the border around the bars when the value is negative.
   */
  negativeStrokeColor: OxyColor

  /**
   * Gets the actual color.
   */
  get actualColor(): OxyColor {
    return this.fillColor.getActualColor(this.defaultColor)
  }

  /**
   * Gets or sets the base value. Default value is 0.
   */
  baseValue: number

  /**
   * Gets or sets the base value.
   */
  baseLine: number

  /**
   * Gets or sets the actual base line.
   */
  actualBaseLine: number

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

    const rectangle = this.rectangles[rectangleIndex]
    if (!rectangle.containsPoint(point)) {
      return undefined
    }

    const pointIndex = this.rectanglesPointIndexes[rectangleIndex]
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
    this.rectangles.length = 0
    this.rectanglesPointIndexes.length = 0

    const actualPoints = this.actualPoints
    if (!actualPoints || actualPoints.length === 0) {
      return
    }

    this.verifyAxes()
    await this.renderBars(rc, actualPoints)
  }

  /** Renders the legend symbol for the line series on the specified rendering context. */
  public async renderLegend(rc: IRenderContext, legendBox: OxyRect): Promise<void> {
    const xmid = (legendBox.left + legendBox.right) / 2
    const ymid = (legendBox.top + legendBox.bottom) / 2
    const height = (legendBox.bottom - legendBox.top) * 0.8
    const width = height
    await rc.drawRectangle(
      new OxyRect(xmid - 0.5 * width, ymid - 0.5 * height, width, height),
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
    if (this.fillColor.isAutomatic()) {
      this.defaultColor = this.plotModel.getDefaultColor()
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
    if (isNaN(this.baseLine)) {
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
      comparer = (x: OxyRect, y: OxyRect) => {
        if (x.bottom < point.y) {
          return 1
        }

        if (x.top > point.y) {
          return -1
        }

        return 0
      }
    } else {
      comparer = (x: OxyRect, y: OxyRect) => {
        if (x.right < point.x) {
          return -1
        }

        if (x.left > point.x) {
          return 1
        }

        return 0
      }
    }

    return this.rectangles.findIndex((rect: OxyRect) => comparer(rect, OxyRect.Empty) === 0)
  }

  /** Renders the series bars. */
  private async renderBars(rc: IRenderContext, actualPoints: DataPoint[]): Promise<void> {
    const clampBase = this.yAxis!.isLogarithmic() && !this.yAxis!.isValidValue(this.baseValue)

    const widthOffset = this.getBarWidth(actualPoints) / 2
    const widthVector = PlotElementExtensions.orientateVector(this, new ScreenVector(widthOffset, 0))

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
      const rectangle = OxyRect.fromScreenPoints(basePoint, screenPoint)
      this.rectangles.push(rectangle)
      this.rectanglesPointIndexes.push(pointIndex)

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
   * Computes the bars width.
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
      positive || this.negativeFillColor.isUndefined()
        ? this.getSelectableFillColor(this.actualColor)
        : this.negativeFillColor
    const strokeColor = positive || this.negativeStrokeColor.isUndefined() ? this.strokeColor : this.negativeStrokeColor

    return {
      fillColor,
      strokeColor,
    }
  }
}

interface BarColors {
  /** The fill color */
  fillColor: OxyColor

  /** The stroke color */
  strokeColor: OxyColor
}
