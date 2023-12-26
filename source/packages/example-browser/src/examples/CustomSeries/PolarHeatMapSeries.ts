import {
  Axis,
  ColorAxisExtensions,
  type CreateXYAxisSeriesOptions,
  type IColorAxis,
  ImageFormat,
  type IRenderContext,
  maxValueOfArray,
  minValueOfArray,
  OxyColor,
  OxyColors,
  OxyImage,
  OxyRect,
  PlotElementExtensions,
  PlotModel,
  PlotType,
  removeUndef,
  RenderingExtensions,
  ScreenPoint,
  toColorAxis,
  TrackerHitResult,
  TwoDimensionalArray,
  XYAxisSeries,
} from 'oxyplot-js'

export interface CreatePolarHeatMapSeriesOptions extends CreateXYAxisSeriesOptions {
  /**
   * The data array.
   * Note that the indices of the data array refer to [x,y].
   */
  data?: number[][]

  /**
   * The size of the image - if set to 0, the image will be generated at every update.
   */
  imageSize?: number

  /**
   * The x-coordinate of the left column mid point.
   */
  angle0?: number

  /**
   * The x-coordinate of the right column mid point.
   */
  angle1?: number

  /**
   * The y-coordinate of the top row mid point.
   */
  magnitude0?: number

  /**
   * The y-coordinate of the bottom row mid point.
   */
  magnitude1?: number

  /**
   * A value indicating whether to interpolate when rendering.
   * This property is not supported on all platforms.
   */
  interpolate?: boolean

  /**
   * The minimum value of the dataset.
   */
  minValue?: number

  /**
   * The maximum value of the dataset.
   */
  maxValue?: number

  /**
   * The color axis key.
   */
  colorAxisKey?: string
}

/**
 * Implements a polar heat map series.
 */
export class PolarHeatMapSeries extends XYAxisSeries {
  /**
   * The image
   */
  private image: OxyImage | undefined

  /**
   * The pixels
   */
  private pixels?: TwoDimensionalArray<OxyColor>

  /**
   * Initializes a new instance of the PolarHeatMapSeries class.
   */
  constructor(opt?: CreatePolarHeatMapSeriesOptions) {
    super(opt)
    this.interpolate = true
    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the size of the image - if set to 0, the image will be generated at every update.
   */
  public imageSize: number = 0

  /**
   * Gets or sets the x-coordinate of the left column mid point.
   */
  public angle0: number = 0

  /**
   * Gets or sets the x-coordinate of the right column mid point.
   */
  public angle1: number = 0

  /**
   * Gets or sets the y-coordinate of the top row mid point.
   */
  public magnitude0: number = 0

  /**
   * Gets or sets the y-coordinate of the bottom row mid point.
   */
  public magnitude1: number = 0

  /**
   * Gets or sets the data array.
   * Note that the indices of the data array refer to [x,y].
   */
  public data?: number[][]

  /**
   * Gets or sets a value indicating whether to interpolate when rendering.
   * This property is not supported on all platforms.
   */
  public interpolate: boolean

  /**
   * Gets or sets the minimum value of the dataset.
   */
  public minValue: number = 0

  /**
   * Gets or sets the maximum value of the dataset.
   */
  public maxValue: number = 0

  /**
   * Gets or sets the color axis.
   */
  public colorAxis: IColorAxis | undefined

  /**
   * Gets or sets the color axis key.
   */
  public colorAxisKey: string | undefined

  /**
   * Renders the series on the specified render context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (!this.data) {
      this.image = undefined
      return
    }

    if (this.imageSize > 0) {
      await this.renderFixed(rc, this.plotModel)
    } else {
      await this.renderDynamic(rc, this.plotModel)
    }
  }

  /**
   * Renders by an image sized from the available plot area.
   * @param rc The rc.
   * @param model The model.
   */
  public async renderDynamic(rc: IRenderContext, model: PlotModel): Promise<void> {
    if (!this.data) return

    const m = this.data.length
    const n = this.data[0].length

    // get the available plot area
    const dest = model.plotArea
    const width = Math.floor(dest.width)
    const height = Math.floor(dest.height)
    if (width === 0 || height === 0) {
      return
    }

    if (!this.pixels || this.pixels.height !== height || this.pixels.width !== width) {
      this.pixels = new TwoDimensionalArray<OxyColor>(width, height)
    }

    const p = this.pixels
    const getColor = ColorAxisExtensions.getColor
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // transform from screen to magnitude/angle
        const sp = new ScreenPoint(dest.left + x, dest.top + y)
        const xy = this.inverseTransform(sp)
        let angle
        let magnitude
        if (this.plotModel.plotType !== PlotType.Polar) {
          angle = (Math.atan2(xy.y, xy.x) / Math.PI) * 180
          magnitude = Math.sqrt(xy.x * xy.x + xy.y * xy.y)
        } else {
          angle = (xy.y / Math.PI) * 180
          magnitude = xy.x
          while (angle < 0) {
            angle += 360
          }
          while (angle > 360) {
            angle -= 360
          }
        }

        // transform to indices in the Data array
        const ii = ((angle - this.angle0) / (this.angle1 - this.angle0)) * m
        const jj = ((magnitude - this.magnitude0) / (this.magnitude1 - this.magnitude0)) * n
        if (ii >= 0 && ii < m && jj >= 0 && jj < n) {
          // get the (interpolated) value
          const value = this.getValue(ii, jj)

          // use the color axis to get the color
          const c = OxyColor.fromAColor(160, getColor(this.colorAxis!, value))
          p.set(x, y, c)
        } else {
          // outside the range of the Data array
          p.set(x, y, OxyColors.Transparent)
        }
      }
    }

    // Create the PNG image
    this.image = await OxyImage.create(p, ImageFormat.Png)

    // Render the image
    await RenderingExtensions.drawImage(rc, this.image, dest.left, dest.top, dest.width, dest.height, 1, false)
  }

  /**
   * Renders by scaling a fixed image.
   * @param rc The render context.
   * @param model The model.
   */
  public async renderFixed(rc: IRenderContext, model: PlotModel): Promise<void> {
    if (!this.data) return

    if (!this.image) {
      const m = this.data.length
      const n = this.data[0].length

      const width = this.imageSize
      const height = this.imageSize
      if (this.pixels === undefined || this.pixels.height !== height || this.pixels.width !== width) {
        this.pixels = new TwoDimensionalArray<OxyColor>(width, height)
      }
      const getColor = ColorAxisExtensions.getColor
      const p = this.pixels
      for (let yi = 0; yi < height; yi++) {
        for (let xi = 0; xi < width; xi++) {
          const x = ((xi - width * 0.5) / (width * 0.5)) * this.magnitude1
          const y = (-(yi - height * 0.5) / (height * 0.5)) * this.magnitude1

          let angle = (Math.atan2(y, x) / Math.PI) * 180
          const magnitude = Math.sqrt(x * x + y * y)

          while (angle < 0) {
            angle += 360
          }
          while (angle > 360) {
            angle -= 360
          }

          // transform to indices in the Data array
          const ii = ((angle - this.angle0) / (this.angle1 - this.angle0)) * m
          const jj = ((magnitude - this.magnitude0) / (this.magnitude1 - this.magnitude0)) * n
          if (ii >= 0 && ii < m && jj >= 0 && jj < n) {
            // get the (interpolated) value
            const value = this.getValue(ii, jj)

            // use the color axis to get the color
            const c = OxyColor.fromAColor(160, getColor(this.colorAxis!, value))
            p.set(xi, yi, c)
          } else {
            // outside the range of the Data array
            p.set(xi, yi, OxyColors.Transparent)
          }
        }
      }

      // Create the PNG image
      this.image = await OxyImage.create(p, ImageFormat.Png)
    }

    if (!this.image) return

    const transform = PlotElementExtensions.transform
    let dest: OxyRect
    if (this.plotModel.plotType !== PlotType.Polar) {
      const topLeft = transform(this, -this.magnitude1, this.magnitude1)
      const bottomRight = transform(this, this.magnitude1, -this.magnitude1)
      dest = new OxyRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
    } else {
      const top = transform(this, this.magnitude1, 90)
      const bottom = transform(this, this.magnitude1, 270)
      const left = transform(this, this.magnitude1, 180)
      const right = transform(this, this.magnitude1, 0)
      dest = new OxyRect(left.x, top.y, right.x - left.x, bottom.y - top.y)
    }

    // Render the image
    await RenderingExtensions.drawImage(rc, this.image, dest.left, dest.top, dest.width, dest.height, 1, false)
  }

  /**
   * Gets the value at the specified data indices.
   * @param ii The first index in the Data array.
   * @param jj The second index in the Data array.
   * @returns The value.
   */
  protected getValue(ii: number, jj: number): number {
    if (!this.data) return NaN

    if (!this.interpolate) {
      const i = Math.floor(ii)
      const j = Math.floor(jj)
      return this.data[i][j]
    }

    ii -= 0.5
    jj -= 0.5

    // bi-linear interpolation http://en.wikipedia.org/wiki/Bilinear_interpolation
    const r = Math.floor(ii)
    const c = Math.floor(jj)

    const r0 = r > 0 ? r : 0
    const r1 = r + 1 < this.data.length ? r + 1 : r
    const c0 = c > 0 ? c : 0
    const c1 = c + 1 < this.data[0].length ? c + 1 : c

    const v00 = this.data[r0][c0]
    const v01 = this.data[r0][c1]
    const v10 = this.data[r1][c0]
    const v11 = this.data[r1][c1]

    const di = ii - r
    const dj = jj - c

    const v0 = v00 * (1 - dj) + v01 * dj
    const v1 = v10 * (1 - dj) + v11 * dj

    return v0 * (1 - di) + v1 * di
  }

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
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()

    const data = this.getData()
    this.minValue = minValueOfArray(data)
    this.maxValue = maxValueOfArray(data)

    const colorAxis = this.colorAxis as unknown as Axis
    if (colorAxis) {
      colorAxis.include(this.minValue)
      colorAxis.include(this.maxValue)
    }
  }

  /**
   * Gets the data as a sequence (LINQ-friendly).
   * @returns The sequence of data.
   */
  protected getData(): number[] {
    if (!this.data) return []

    const m = this.data.length
    const datas: number[] = []
    const n = this.data[0].length
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        datas.push(this.data[i][j])
      }
    }

    return datas
  }
}
