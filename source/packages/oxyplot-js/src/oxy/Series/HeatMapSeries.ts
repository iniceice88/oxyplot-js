import type {
  CreateXYAxisSeriesOptions,
  DataPoint,
  IColorAxis,
  IRenderContext,
  LabelStringFormatterType,
  ScreenPoint,
  TrackerStringFormatterArgs,
  TrackerStringFormatterType,
} from '@/oxyplot'
import {
  Axis,
  ColorAxisExtensions,
  HorizontalAlignment,
  ImageFormat,
  newDataPoint,
  newScreenPoint,
  OxyColor,
  OxyColorExtensions,
  OxyColors,
  OxyImage,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
  toColorAxis,
  TrackerHitResult,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'
import { hashCode, maxValueOfArray, minValueOfArray, removeUndef, TwoDimensionalArray } from '@/patch'

/**
 * Specifies how the heat map coordinates are defined.
 */
export enum HeatMapCoordinateDefinition {
  /**
   * The coordinates defines the center of the cells
   */
  Center,

  /**
   * The coordinates defines the edge of the cells
   */
  Edge,
}

/**
 * Specifies how the heat map coordinates are defined.
 */
export enum HeatMapRenderMethod {
  /**
   * The heat map is rendered as a bitmap
   */
  Bitmap,

  /**
   * The heat map is rendered as a collection of discrete rectangles
   */
  Rectangles,
}

export interface CreateHeatMapSeriesOptions extends CreateXYAxisSeriesOptions {
  x0?: number
  x1?: number
  y0?: number
  y1?: number
  data?: number[][]
  interpolate?: boolean
  colorAxis?: IColorAxis
  colorAxisKey?: string
  coordinateDefinition?: HeatMapCoordinateDefinition
  renderMethod?: HeatMapRenderMethod
  labelStringFormatter?: LabelStringFormatterType
  labelFontSize?: number
}

/**
 * Represents a heat map.
 */
export class HeatMapSeries extends XYAxisSeries {
  /**
   * The default tracker format string
   */
  static readonly DefaultTrackerFormatString: TrackerStringFormatterType = (args: TrackerStringFormatterArgs) =>
    `${args.title}\n${args.xTitle}: ${args.xValue}\n${args.yTitle}: ${args.yValue}\n${args.colorAxisTitle}: ${args.value}`
  //'{0}\n{1}: {2}\n{3}: {4}\n{5}: {6}'

  /**
   * The default color-axis title
   */
  private static readonly DefaultColorAxisTitle = 'Value'

  /**
   * The hash code of the data when the image was updated.
   */
  private dataHash: number = 0

  /**
   * The hash code of the color axis when the image was updated.
   */
  private colorAxisHash: number = 0

  /**
   * The image
   */
  private image?: OxyImage

  /**
   * Initializes a new instance of the HeatMapSeries class.
   */
  constructor(opt?: CreateHeatMapSeriesOptions) {
    super(opt)
    this.trackerStringFormatter = HeatMapSeries.DefaultTrackerFormatString
    this.interpolate = true
    this.labelFontSize = 0

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the x-coordinate of the elements at index [0,*] in the data set.
   */
  x0: number = 0

  /**
   * Gets or sets the x-coordinate of the mid point for the elements at index [m-1,*] in the data set.
   */
  x1: number = 0

  /**
   * Gets or sets the y-coordinate of the mid point for the elements at index [*,0] in the data set.
   */
  y0: number = 0

  /**
   * Gets or sets the y-coordinate of the mid point for the elements at index [*,n-1] in the data set.
   */
  y1: number = 0

  /**
   * Gets or sets the data array.
   */
  data?: number[][]

  /**
   * Gets or sets a value indicating whether to interpolate when rendering. The default value is true.
   */
  interpolate: boolean = true

  /**
   * Gets the minimum value of the dataset.
   */
  minValue: number = 0

  /**
   * Gets the maximum value of the dataset.
   */
  maxValue: number = 0

  /**
   * Gets or sets the color axis.
   */
  colorAxis?: IColorAxis

  /**
   * Gets or sets the color axis key.
   */
  colorAxisKey?: string

  /**
   * Gets or sets the coordinate definition. The default value is HeatMapCoordinateDefinition.Center.
   */
  coordinateDefinition: HeatMapCoordinateDefinition = HeatMapCoordinateDefinition.Center

  /**
   * Gets or sets the render method. The default value is HeatMapRenderMethod.Bitmap.
   */
  renderMethod: HeatMapRenderMethod = HeatMapRenderMethod.Bitmap

  /**
   * Gets or sets the format string for the cell labels. The default value is "0.00".
   */
  labelStringFormatter: LabelStringFormatterType = (item) => item.toFixed(2)

  /**
   * Gets or sets the font size of the labels. The default value is 0 (labels not visible).
   */
  labelFontSize: number = 0

  /**
   * Invalidates the image that renders the heat map. The image will be regenerated the next time the HeatMapSeries is rendered.
   * Call PlotModel.invalidatePlot to refresh the view.
   */
  public invalidate(): void {
    this.image = undefined
  }

  /**
   * Renders the series on the specified render context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (!this.data) {
      this.image = undefined
      return
    }

    if (!this.colorAxis) {
      throw new Error('Color axis not specified.')
    }

    let left = this.x0
    let right = this.x1
    let bottom = this.y0
    let top = this.y1

    const m = this.data.length
    const n = this.data[0].length
    const dx = (this.x1 - this.x0) / (m - 1)
    const dy = (this.y1 - this.y0) / (n - 1)

    if (this.coordinateDefinition === HeatMapCoordinateDefinition.Center) {
      if (this.xAxis!.isLogarithmic()) {
        const gx = Math.log(this.x1 / this.x0) / (m - 1)
        left *= Math.exp(gx / -2)
        right *= Math.exp(gx / 2)
      } else {
        left -= dx / 2
        right += dx / 2
      }

      if (this.yAxis!.isLogarithmic()) {
        const gy = Math.log(this.y1 / this.y0) / (n - 1)
        bottom *= Math.exp(gy / -2)
        top *= Math.exp(gy / 2)
      } else {
        bottom -= dy / 2
        top += dy / 2
      }
    }

    const s00 = PlotElementExtensions.transform(this, left, bottom)
    const s11 = PlotElementExtensions.transform(this, right, top)
    const rect = OxyRect.fromScreenPoints(s00, s11)

    const needImage = this.renderMethod === HeatMapRenderMethod.Bitmap

    const currentDataHash = calculateHashcode(this.data)
    const currentColorAxisHash = this.colorAxis.getElementHashCode()
    if (
      (needImage && !this.image) ||
      currentDataHash !== this.dataHash ||
      currentColorAxisHash !== this.colorAxisHash
    ) {
      if (needImage) {
        await this.updateImage()
      }

      this.dataHash = currentDataHash
      this.colorAxisHash = currentColorAxisHash
    }

    const orientate = PlotElementExtensions.orientate
    if (needImage) {
      if (this.image) {
        await RenderingExtensions.drawImage(
          rc,
          this.image,
          rect.left,
          rect.top,
          rect.width,
          rect.height,
          1,
          this.interpolate,
        )
      }
    } else {
      const s00Orientated = orientate(this, s00) // disorientate
      const s11Orientated = orientate(this, s11) // disorientate

      const sdx = (s11Orientated.x - s00Orientated.x) / m
      const sdy = (s11Orientated.y - s00Orientated.y) / n
      const getColor = ColorAxisExtensions.getColor
      // draw lots of rectangles
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          const rectcolor = getColor(this.colorAxis, this.data[i][j])

          const pointa = orientate(this, newScreenPoint(s00Orientated.x + i * sdx, s00Orientated.y + j * sdy)) // re-orientate
          const pointb = orientate(
            this,
            newScreenPoint(s00Orientated.x + (i + 1) * sdx, s00Orientated.y + (j + 1) * sdy),
          ) // re-orientate
          const rectrect = OxyRect.fromScreenPoints(pointa, pointb)

          await rc.drawRectangle(rectrect, rectcolor, OxyColors.Undefined, 0, this.edgeRenderingMode)
        }
      }
    }

    if (this.labelFontSize > 0) {
      await this.renderLabels(rc, rect)
    }
  }

  /**
   * Gets the point on the series that is nearest the specified point.
   * @param point The point.
   * @param interpolate Interpolate the series if this flag is set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (!this.data) return undefined

    if (!this.interpolate) {
      // It makes no sense to interpolate the tracker when the plot is not interpolated.
      interpolate = false
    }

    let p = this.inverseTransform(point)

    if (!this.isPointInRange(p)) {
      return undefined
    }

    let i: number
    let j: number

    if (this.xAxis!.isLogarithmic()) {
      const gx = Math.log(this.x1 / this.x0) / (this.data.length - 1)
      i = Math.log(p.x / this.x0) / gx
    } else {
      const dx = (this.x1 - this.x0) / (this.data.length - 1)
      i = (p.x - this.x0) / dx
    }

    if (this.yAxis!.isLogarithmic()) {
      const gy = Math.log(this.y1 / this.y0) / (this.data[0].length - 1)
      j = Math.log(p.y / this.y0) / gy
    } else {
      const dy = (this.y1 - this.y0) / (this.data[0].length - 1)
      j = (p.y - this.y0) / dy
    }

    if (!interpolate) {
      i = Math.round(i)
      j = Math.round(j)

      let px: number
      let py: number

      if (this.xAxis!.isLogarithmic()) {
        const gx = Math.log(this.x1 / this.x0) / (this.data.length - 1)
        px = this.x0 * Math.exp(i * gx)
      } else {
        const dx = (this.x1 - this.x0) / (this.data.length - 1)
        px = i * dx + this.x0
      }

      if (this.yAxis!.isLogarithmic()) {
        const gy = Math.log(this.y1 / this.y0) / (this.data[0].length - 1)
        py = this.y0 * Math.exp(j * gy)
      } else {
        const dy = (this.y1 - this.y0) / (this.data[0].length - 1)
        py = j * dy + this.y0
      }

      p = newDataPoint(px, py)
      point = this.transform(p)
    }

    // perform a second range check in index space to accomodate rounding
    if (i < -0.5 || i > this.data.length - 0.5 || j < -0.5 || j > this.data[0].length - 0.5) {
      return undefined
    }

    const value = HeatMapSeries.getValue(this.data, i, j)
    const colorAxis = this.colorAxis as unknown as Axis
    const colorAxisTitle = colorAxis?.title ?? HeatMapSeries.DefaultColorAxisTitle

    const text = this.formatDefaultTrackerString(undefined, p, (args) => {
      args.colorAxisTitle = colorAxisTitle
      args.value = value
    })
    return new TrackerHitResult({
      series: this,
      dataPoint: p,
      position: point,
      item: null,
      index: -1,
      text,
    })
  }

  /**
   * Ensures that the axes of the series is defined.
   * @internal
   */
  ensureAxes(): void {
    super.ensureAxes()

    this.colorAxis = this.colorAxisKey
      ? toColorAxis(this.plotModel.getAxis(this.colorAxisKey))
      : toColorAxis(this.plotModel.defaultColorAxis)
  }

  /**
   * Updates the maximum and minimum values of the series for the x and y dimensions only.
   * @internal
   */
  updateMaxMinXY(): void {
    if (!this.data) return

    const m = this.data.length
    const n = this.data[0].length

    this.minX = Math.min(this.x0, this.x1)
    this.maxX = Math.max(this.x0, this.x1)

    this.minY = Math.min(this.y0, this.y1)
    this.maxY = Math.max(this.y0, this.y1)

    if (this.coordinateDefinition === HeatMapCoordinateDefinition.Center) {
      if (this.xAxis!.isLogarithmic()) {
        const gx = Math.log(this.maxX / this.minX) / (m - 1)
        this.minX *= Math.exp(gx / -2)
        this.maxX *= Math.exp(gx / 2)
      } else {
        const dx = (this.maxX - this.minX) / (m - 1)
        this.minX -= dx / 2
        this.maxX += dx / 2
      }

      if (this.yAxis!.isLogarithmic()) {
        const gy = Math.log(this.maxY / this.minY) / (n - 1)
        this.minY *= Math.exp(gy / -2)
        this.maxY *= Math.exp(gy / 2)
      } else {
        const dy = (this.maxY - this.minY) / (n - 1)
        this.minY -= dy / 2
        this.maxY += dy / 2
      }
    }
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()

    this.updateMaxMinXY()

    if (!this.data) return

    const validDatas = this.data.flat().filter((x) => !isNaN(x))
    this.minValue = minValueOfArray(validDatas)
    this.maxValue = maxValueOfArray(validDatas)
  }

  /**
   * Updates the axes to include the max and min of this series.
   * @internal
   */
  updateAxisMaxMin(): void {
    super.updateAxisMaxMin()
    const colorAxis = this.colorAxis as unknown as Axis
    if (colorAxis) {
      colorAxis.include(this.minValue)
      colorAxis.include(this.maxValue)
    }
  }

  /**
   * Renders the labels.
   * @param rc The IRenderContext
   * @param rect The bounding rectangle for the data.
   */
  protected async renderLabels(rc: IRenderContext, rect: OxyRect): Promise<void> {
    if (!this.data) return

    const m = this.data.length
    const n = this.data[0].length
    const fontSize = (rect.height / n) * this.labelFontSize

    const left = this.x0
    const right = this.x1
    const bottom = this.y0
    const top = this.y1

    const orientate = PlotElementExtensions.orientate
    const transform = PlotElementExtensions.transform
    const s00 = orientate(this, transform(this, left, bottom)) // disorientate
    const s11 = orientate(this, transform(this, right, top)) // disorientate

    const sdx = (s11.x - s00.x) / (m - 1)
    const sdy = (s11.y - s00.y) / (n - 1)
    const getColor = ColorAxisExtensions.getColor
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const point = orientate(this, newScreenPoint(s00.x + i * sdx, s00.y + j * sdy)) // re-orientate
        const v = HeatMapSeries.getValue(this.data, i, j)
        const color = getColor(this.colorAxis!, v)
        const hsv = OxyColorExtensions.toHsv(color)
        const textColor = hsv[2] > 0.6 ? OxyColors.Black : OxyColors.White
        const label = this.getLabel(v, i, j)
        await rc.drawText(
          point,
          label,
          textColor,
          this.actualFont,
          fontSize,
          500,
          0,
          HorizontalAlignment.Center,
          VerticalAlignment.Middle,
        )
      }
    }
  }

  /**
   * Gets the label for the specified cell.
   * @param v The value of the cell.
   * @param i The first index.
   * @param j The second index.
   * @returns The label string.
   */
  protected getLabel(v: number, i: number, j: number): string {
    return this.labelStringFormatter(v, [])
  }

  /**
   * Gets the interpolated value at the specified position in the data array (by bilinear interpolation).
   * Where interpolation is impossible, return NaN, rather than a calculated nonsense value.
   * @param data The data.
   * @param i The first index.
   * @param j The second index.
   * @returns The interpolated value.
   */
  private static getValue(data: number[][], i: number, j: number): number {
    // Note data[0][0] is displayed in quadrant 1, not exactly at the origin, and that implies the invoker can produce negative coordinates.
    i = Math.max(i, 0)
    j = Math.max(j, 0)

    const i0 = Math.floor(i)
    const i1 = i0 + 1 < data.length ? i0 + 1 : i0

    const j0 = Math.floor(j)
    const j1 = j0 + 1 < data[0].length ? j0 + 1 : j0

    i = Math.min(i, i1)
    j = Math.min(j, j1)

    if (i === i0 && j === j0) {
      return data[i0][j0]
    }

    if (i !== i0 && j === j0) {
      // interpolate only by i
      if (isNaN(data[i0][j0]) || isNaN(data[i1][j0])) {
        return NaN
      }

      const ifraction = i - i0
      if (i0 !== i1) {
        return data[i0][j0] * (1 - ifraction) + data[i1][j0] * ifraction
      }

      return data[i0][j0]
    }

    if (i === i0 && j !== j0) {
      // interpolate only by j
      if (isNaN(data[i0][j0]) || isNaN(data[i0][j1])) {
        return NaN
      }

      const jfraction = j - j0
      if (j0 !== j1) {
        return data[i0][j0] * (1 - jfraction) + data[i0][j1] * jfraction
      }

      return data[i0][j0]
    } else {
      if (isNaN(data[i0][j0]) || isNaN(data[i1][j0]) || isNaN(data[i0][j1]) || isNaN(data[i1][j1])) {
        return NaN
      }

      const ifraction = i - i0
      const jfraction = j - j0
      let v0: number
      let v1: number
      if (i0 !== i1) {
        v0 = data[i0][j0] * (1 - ifraction) + data[i1][j0] * ifraction
        v1 = data[i0][j1] * (1 - ifraction) + data[i1][j1] * ifraction
      } else {
        v0 = data[i0][j0]
        v1 = data[i0][j1]
      }

      if (j0 !== j1) {
        return v0 * (1 - jfraction) + v1 * jfraction
      }

      return v0
    }
  }

  /**
   * Tests if a DataPoint is inside the heat map
   * @param p The DataPoint to test.
   * @returns True if the point is inside the heat map.
   */
  private isPointInRange(p: DataPoint): boolean {
    this.updateMaxMinXY()
    return p.x >= this.minX && p.x <= this.maxX && p.y >= this.minY && p.y <= this.maxY
  }

  /**
   * Updates the image.
   */
  private async updateImage(): Promise<void> {
    if (!this.data) return

    // determine if the provided data should be reversed in x-direction
    const reverseX = this.xAxis!.transform(this.x0) > this.xAxis!.transform(this.x1)

    // determine if the provided data should be reversed in y-direction
    const reverseY = this.yAxis!.transform(this.y0) > this.yAxis!.transform(this.y1)

    // determine if the data should be transposed
    const swapXY = PlotElementExtensions.isTransposed(this)

    const m = this.data.length
    const n = this.data[0].length
    const buffer = swapXY ? new TwoDimensionalArray<OxyColor>(n, m) : new TwoDimensionalArray<OxyColor>(m, n)
    const getColor = ColorAxisExtensions.getColor
    for (let i = 0; i < m; i++) {
      const ii = reverseX ? m - 1 - i : i
      for (let j = 0; j < n; j++) {
        const jj = reverseY ? n - 1 - j : j
        const color = getColor(this.colorAxis!, this.data[ii][jj])
        if (swapXY) {
          buffer.set(j, i, color)
        } else {
          buffer.set(i, j, color)
        }
      }
    }

    this.image = await OxyImage.create(buffer, ImageFormat.Png)
  }
}

function calculateHashcode(data: number[][]) {
  return hashCode(data.flat())
}
