import {
  type CreateXYAxisSeriesOptions,
  ImageFormat,
  type IRenderContext,
  LineJoin,
  OxyColor,
  OxyColorHelper,
  OxyColors,
  OxyImage, OxyImageEx,
  PlotElementExtensions,
  removeUndef,
  RenderingExtensions,
  ScreenPoint,
  TrackerHitResult,
  TwoDimensionalArray,
  XYAxisSeries,
} from 'oxyplot-js'

export interface CreateMatrixSeriesOptions extends CreateXYAxisSeriesOptions {
  /**
   * The matrix.
   */
  matrix?: number[][]

  /**
   * The interval between the grid lines (the grid is hidden if value is 0).
   */
  gridInterval?: number

  /**
   * A value indicating whether to show the diagonal.
   */
  showDiagonal?: boolean

  /**
   * The minimum grid line distance.
   */
  minimumGridLineDistance?: number

  /**
   * The color of the grid.
   */
  gridColor?: OxyColor

  /**
   * The color of the border around the matrix.
   */
  borderColor?: OxyColor

  /**
   * The color of the not zero elements of the matrix.
   */
  notZeroColor?: OxyColor

  /**
   * The zero tolerance (inclusive).
   */
  zeroTolerance?: number
}

/**
 * Provides a series that visualizes the structure of a matrix.
 */
export class MatrixSeries extends XYAxisSeries {
  /**
   * The image
   */
  private image: OxyImage | undefined

  private _matrix: number[][] | undefined
  /**
   * The matrix
   */
  get matrix(): number[][] | undefined {
    return this._matrix
  }

  set matrix(m: number[][] | undefined) {
    this._matrix = m
    this.image = undefined
  }

  /**
   * Initializes a new instance of the MatrixSeries class.
   */
  constructor(opt?: CreateMatrixSeriesOptions) {
    super(opt)
    this.gridInterval = 1
    this.showDiagonal = false
    this.minimumGridLineDistance = 4
    this.gridColor = OxyColors.LightGray
    this.borderColor = OxyColors.Gray
    this.notZeroColor = OxyColors.Black
    this.zeroTolerance = 0
    this.trackerStringFormatter = function (args) {
      return `${args.title || ''}
[${args.xValue},${args.yValue}] = ${args.item}`
    }

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  getElementName() {
    return 'MatrixSeries'
  }

  /**
   * Gets or sets the matrix.
   */
  public get matrixValue(): number[][] | undefined {
    return this.matrix
  }

  public set matrixValue(value: number[][] | undefined) {
    this.image = undefined
    this.matrix = value
  }

  /**
   * Gets or sets the interval between the grid lines (the grid is hidden if value is 0).
   */
  public gridInterval: number

  /**
   * Gets or sets a value indicating whether to show the diagonal.
   */
  public showDiagonal: boolean

  /**
   * Gets or sets the minimum grid line distance.
   */
  public minimumGridLineDistance: number

  /**
   * Gets or sets the color of the grid.
   */
  public gridColor: OxyColor

  /**
   * Gets or sets the color of the border around the matrix.
   */
  public borderColor: OxyColor

  /**
   * Gets or sets the color of the not zero elements of the matrix.
   */
  public notZeroColor: OxyColor

  /**
   * Gets or sets the zero tolerance (inclusive).
   */
  public zeroTolerance: number

  /**
   * Renders the series on the specified render context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (!this.matrixValue) {
      return
    }

    const transform = PlotElementExtensions.transform

    const m = this.matrixValue.length
    const n = this.matrixValue[0].length
    const p0 = transform(this, 0, 0)
    const p1 = transform(this, n, m)

    // note matrix index [i,j] maps to image index [j,i]
    if (!this.image) {
      const pixels = new TwoDimensionalArray<OxyColor>(n, m)
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          const c = Math.abs(this.matrixValue[i][j]) <= this.zeroTolerance ? OxyColors.Transparent : this.notZeroColor
          pixels.set(j, i, c)
        }
      }

      this.image = await OxyImageEx.create(pixels, ImageFormat.Png)
    }

    const x0 = Math.min(p0.x, p1.x)
    const y0 = Math.min(p0.y, p1.y)
    const w = Math.abs(p0.x - p1.x)
    const h = Math.abs(p0.y - p1.y)
    await RenderingExtensions.drawImage(rc, this.image, x0, y0, w, h, 1, false)

    const points: ScreenPoint[] = []
    if (this.gridInterval > 0) {
      const p2 = transform(this, this.gridInterval, this.gridInterval)
      if (Math.abs(p2.y - p0.y) > this.minimumGridLineDistance) {
        for (let i = 1; i < n; i += this.gridInterval) {
          points.push(transform(this, 0, i))
          points.push(transform(this, n, i))
        }
      }

      if (Math.abs(p2.x - p0.x) > this.minimumGridLineDistance) {
        for (let j = 1; j < m; j += this.gridInterval) {
          points.push(transform(this, j, 0))
          points.push(transform(this, j, m))
        }
      }
    }

    if (this.showDiagonal) {
      points.push(transform(this, 0, 0))
      points.push(transform(this, n, m))
    }

    await rc.drawLineSegments(points, this.gridColor, 1, this.edgeRenderingMode, undefined, LineJoin.Miter)

    if (OxyColorHelper.isVisible(this.borderColor)) {
      const borderPoints: ScreenPoint[] = [
        transform(this, 0, 0),
        transform(this, m, 0),
        transform(this, 0, n),
        transform(this, m, n),
        transform(this, 0, 0),
        transform(this, 0, n),
        transform(this, m, 0),
        transform(this, m, n),
      ]

      await rc.drawLineSegments(borderPoints, this.borderColor, 1, this.edgeRenderingMode, undefined, LineJoin.Miter)
    }
  }

  /**
   * Gets the point on the series that is nearest the specified point.
   * @param point The point.
   * @param interpolate Interpolate the series if this flag is set to true.
   * @returns A TrackerHitResult for the current hit.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    if (!this.matrix) return undefined

    const dp = this.inverseTransform(point)
    const y = Math.floor(dp.y)
    const x = Math.floor(dp.x)

    if (y >= 0 && y < this.matrix.length && x >= 0 && x < this.matrix[0].length) {
      const value = this.matrix[y][x]
      return new TrackerHitResult({
        series: this,
        dataPoint: dp,
        position: point,
        item: null,
        index: -1,
        text: this.trackerStringFormatter!({
          item: value,
          title: this.title,
          xValue: x,
          yValue: y,
        }),
      })
    }

    return undefined
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    super.updateMaxMin()
    if (!this.matrix) {
      return
    }

    this.minX = 0
    this.maxX = this.matrix[0].length
    this.minY = 0
    this.maxY = this.matrix.length
  }
}
