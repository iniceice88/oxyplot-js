import {
  ArrayBuilder,
  Conrec,
  type ConrecRendererDelegate,
  type CreateXYAxisSeriesOptions,
  type DataPoint,
  ExtendedDefaultXYAxisSeriesOptions,
  HorizontalAlignment,
  type IRenderContext,
  type LabelStringFormatterType,
  LineJoin,
  LineStyle,
  LineStyleHelper,
  newDataPoint,
  newScreenPoint,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  RenderingExtensions,
  type ScreenPoint,
  screenPointDistanceToSquared,
  screenPointMinusEx,
  TrackerHitResult,
  type TrackerStringFormatterArgs,
  VerticalAlignment,
  XYAxisSeries,
} from '@/oxyplot'

import { groupBy, Number_MAX_VALUE, assignObject, isNaNOrUndef } from '@/patch'

export interface CreateContourSeriesOptions extends CreateXYAxisSeriesOptions {
  columnCoordinates?: number[]
  rowCoordinates?: number[]
  contourLevelStep?: number
  contourLevels?: number[]
  contourColors?: OxyColor[]
  data?: number[][]
  labelBackground?: OxyColor
  labelStringFormatter?: LabelStringFormatterType
  labelSpacing?: number
  labelStep?: number
  lineStyle?: LineStyle
  minimumSegmentLength?: number
  multiLabel?: boolean
  strokeThickness?: number
  color?: OxyColor
  trackerStringFormatter?: ContourSeriesTrackerStringFormatterType
}

export const DefaultContourSeriesOptions: CreateContourSeriesOptions = {
  contourLevelStep: NaN,
  labelStep: 1,
  multiLabel: false,
  labelSpacing: 150,
  labelBackground: OxyColorHelper.fromAColor(220, OxyColors.White),
  color: OxyColors.Automatic,
  strokeThickness: 1.0,
  lineStyle: LineStyle.Solid,
  minimumSegmentLength: 2,

  columnCoordinates: [],
  rowCoordinates: [],

  contourLevels: undefined,
  contourColors: undefined,
  data: undefined,
  labelStringFormatter: undefined,
}

export const ExtendedDefaultContourSeriesOptions = {
  ...ExtendedDefaultXYAxisSeriesOptions,
  ...DefaultContourSeriesOptions,
}

export interface ContourSeriesTrackerStringFormatterArgs extends TrackerStringFormatterArgs {
  item?: Contour
  contourLevel?: number
}

export type ContourSeriesTrackerStringFormatterType = (
  args: ContourSeriesTrackerStringFormatterArgs,
) => string | undefined

/**
 * Represents a series that renders contours.
 */
export class ContourSeries extends XYAxisSeries {
  /**
   * The default tracker formatter
   */
  public static readonly DefaultTrackerFormatString: ContourSeriesTrackerStringFormatterType = function (args) {
    return `${args.title}\n${args.xTitle}: ${args.xValue}\n${args.yTitle}: ${args.yValue}\n${args.zTitle}: ${args.contourLevel}`
  }

  getElementName() {
    return 'ContourSeries'
  }

  /**
   * The contour collection.
   */
  private _contours?: Contour[]

  /**
   * The temporary segment collection.
   */
  private _segments: ContourSegment[] = []

  /**
   * The default color.
   */
  private _defaultColor: OxyColor = OxyColors.Undefined

  /**
   * The color.
   */
  public color: OxyColor = DefaultContourSeriesOptions.color!

  /**
   * The column coordinates.
   */
  public columnCoordinates: number[] = []

  /**
   * The contour level step size.
   */
  public contourLevelStep: number = DefaultContourSeriesOptions.contourLevelStep!

  /**
   * The contour levels.
   */
  public contourLevels?: number[]

  /**
   * The contour colors.
   */
  public contourColors: OxyColor[] = []

  /**
   * The data.
   */
  public data?: number[][]

  /**
   * The text background color.
   */
  public labelBackground: OxyColor = DefaultContourSeriesOptions.labelBackground!

  /**
   * The formatter for contour values.
   */
  public labelStringFormatter?: LabelStringFormatterType

  /**
   * A format function used for the tracker. The default depends on the series.
   * The arguments for the formatter may be different for each type of series. See the documentation.
   */
  public trackerStringFormatter?: ContourSeriesTrackerStringFormatterType = undefined

  /**
   * The label spacing.
   */
  public labelSpacing: number = DefaultContourSeriesOptions.labelSpacing!

  /**
   * Multiple labels should be displayed per Contour.
   */
  public multiLabel: boolean = DefaultContourSeriesOptions.multiLabel!

  /**
   * The interval between labeled contours.
   */
  public labelStep: number = DefaultContourSeriesOptions.labelStep!

  /**
   * The line style.
   */
  public lineStyle: LineStyle = DefaultContourSeriesOptions.lineStyle!

  /**
   * The row coordinates.
   */
  public rowCoordinates: number[] = []

  /**
   * The stroke thickness.
   */
  public strokeThickness: number = DefaultContourSeriesOptions.strokeThickness!

  /**
   * The minimum length of the segment.
   */
  public minimumSegmentLength: number = DefaultContourSeriesOptions.minimumSegmentLength!

  constructor(opt?: CreateContourSeriesOptions) {
    super(opt)
    this.trackerStringFormatter = ContourSeries.DefaultTrackerFormatString
    assignObject(this, DefaultContourSeriesOptions, opt)
  }

  /**
   * Gets the actual color.
   */
  public get actualColor(): OxyColor {
    return OxyColorHelper.getActualColor(this.color, this._defaultColor)
  }

  /**
   * Calculates the contours.
   */
  public calculateContours(): void {
    if (!this.data) {
      return
    }

    let actualContourLevels = this.contourLevels

    this._segments = []
    const renderer: ConrecRendererDelegate = (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      contourLevel: number,
    ) => {
      this._segments.push({
        startPoint: newDataPoint(startX, startY),
        endPoint: newDataPoint(endX, endY),
        contourLevel,
      })
    }

    if (!actualContourLevels) {
      let max = this.data[0][0]
      let min = this.data[0][0]
      for (let i = 0; i < this.data.length; i++) {
        for (let j = 0; j < this.data[i].length; j++) {
          max = Math.max(max, this.data[i][j])
          min = Math.min(min, this.data[i][j])
        }
      }

      let actualStep = this.contourLevelStep
      if (isNaNOrUndef(actualStep)) {
        const range = max - min
        const step = range / 20
        const stepExp = Math.round(Math.log(Math.abs(step)) / Math.LN10)
        actualStep = Math.pow(10, Math.floor(stepExp))
        this.contourLevelStep = actualStep
      }

      max = Math.round(actualStep * Math.ceil(max / actualStep) * 1e14) / 1e14
      min = Math.round(actualStep * Math.floor(min / actualStep) * 1e14) / 1e14

      actualContourLevels = ArrayBuilder.createVectorWithStep(min, max, actualStep)
    }

    Conrec.contour(this.data, this.columnCoordinates, this.rowCoordinates, actualContourLevels, renderer)

    this.joinContourSegments()

    if (this.contourColors && this.contourColors.length > 0) {
      for (const c of this._contours!) {
        // get the index of the contour's level
        let index = ContourSeries.indexOf(actualContourLevels, c.contourLevel)
        if (index >= 0) {
          // clamp the index to the range of the ContourColors array
          index = index % this.contourColors.length
          c.color = this.contourColors[index]
        }
      }
    }
  }

  /**
   * Gets the point in the dataset that is nearest the specified point.
   */
  public getNearestPoint(point: ScreenPoint, interpolate: boolean): TrackerHitResult | undefined {
    let result: TrackerHitResult | undefined = undefined

    const zaxisTitle = 'Z'

    for (const c of this._contours!) {
      const r = interpolate
        ? this.getNearestInterpolatedPointInternal(c.points, 0, point)
        : this.getNearestPointInternal(c.points, 0, point)

      if (!r) continue

      if (
        !result ||
        screenPointDistanceToSquared(result.position!, point) > screenPointDistanceToSquared(r.position!, point)
      ) {
        result = r
        result.text = this.formatDefaultTrackerString(c, r.dataPoint!, (args) => {
          const contourArgs = args as ContourSeriesTrackerStringFormatterArgs
          contourArgs.zTitle = zaxisTitle
          contourArgs.contourLevel = c.contourLevel
        })
      }
    }

    return result
  }

  /**
   * Renders the series on the specified rendering context.
   * @param rc The rendering context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (!this._contours) {
      this.calculateContours()
    }

    if (this._contours!.length === 0) {
      return
    }

    this.verifyAxes()

    const contourLabels: ContourLabel[] = []
    const dashArray = LineStyleHelper.getDashArray(this.lineStyle)

    for (const contour of this._contours!) {
      if (this.strokeThickness <= 0 || this.lineStyle === LineStyle.None) {
        continue
      }

      const transformedPoints = contour.points.map((x) => this.transform(x))

      const strokeColor = OxyColorHelper.getActualColor(contour.color, this.actualColor)

      await RenderingExtensions.drawReducedLine(
        rc,
        transformedPoints,
        this.minimumSegmentLength * this.minimumSegmentLength,
        this.getSelectableColor(strokeColor),
        this.strokeThickness,
        this.edgeRenderingMode,
        dashArray,
        LineJoin.Miter,
      )

      // measure total contour length
      let contourLength = 0.0
      for (let i = 1; i < transformedPoints.length; i++) {
        contourLength += screenPointMinusEx(transformedPoints[i], transformedPoints[i - 1]).length
      }

      // don't add label to contours, if ContourLevel is not close to LabelStep
      if (
        transformedPoints.length <= 10 ||
        Math.round(contour.contourLevel / this.contourLevelStep) % this.labelStep !== 0
      ) {
        continue
      }

      if (!this.multiLabel) {
        this.addContourLabels(contour, transformedPoints, contourLabels, (transformedPoints.length - 1) * 0.5)
        continue
      }

      // calculate how many labels fit per contour
      const labelsCount = Math.floor(contourLength / this.labelSpacing)
      if (labelsCount === 0) {
        this.addContourLabels(contour, transformedPoints, contourLabels, (transformedPoints.length - 1) * 0.5)
        continue
      }

      let contourPartLength = 0.0
      let contourPartLengthOld = 0.0
      let intervalIndex = 1
      let contourPartLengthTarget = 0.0
      const contourFirstPartLengthTarget = (contourLength - (labelsCount - 1) * this.labelSpacing) / 2
      for (let j = 0; j < labelsCount; j++) {
        let labelIndex = 0.0

        if (intervalIndex === 1) {
          contourPartLengthTarget = contourFirstPartLengthTarget
        } else {
          contourPartLengthTarget = contourFirstPartLengthTarget + j * this.labelSpacing
        }

        // find index of contour points where next label should be positioned
        for (let k = intervalIndex; k < transformedPoints.length; k++) {
          contourPartLength += screenPointMinusEx(transformedPoints[k], transformedPoints[k - 1]).length

          if (contourPartLength > contourPartLengthTarget) {
            labelIndex =
              k - 1 + (contourPartLengthTarget - contourPartLengthOld) / (contourPartLength - contourPartLengthOld)
            intervalIndex = k + 1
            break
          }

          contourPartLengthOld = contourPartLength
        }

        this.addContourLabels(contour, transformedPoints, contourLabels, labelIndex)
      }
    }

    for (const cl of contourLabels) {
      await this.renderLabelBackground(rc, cl)
    }

    for (const cl of contourLabels) {
      await this.renderLabel(rc, cl)
    }
  }

  /**
   * Sets default values from the plot model.
   * @internal
   */
  setDefaultValues(): void {
    if (OxyColorHelper.isAutomatic(this.color)) {
      this.lineStyle = this.plotModel.getDefaultLineStyle()
      this._defaultColor = this.plotModel.getDefaultColor()
    }
  }

  /**
   * Updates the maximum and minimum values of the series.
   * @internal
   */
  updateMaxMin(): void {
    this.minX = Math.min(...this.columnCoordinates)
    this.maxX = Math.max(...this.columnCoordinates)
    this.minY = Math.min(...this.rowCoordinates)
    this.maxY = Math.max(...this.rowCoordinates)
  }

  /**
   * Gets the index of item that is closest to the specified value.
   * @param values A list of values.
   * @param value A value.
   * @returns An index.
   */
  private static indexOf(values: number[], value: number): number {
    let min = Number_MAX_VALUE
    let index = -1
    for (let i = 0; i < values.length; i++) {
      const d = Math.abs(values[i] - value)
      if (d < min) {
        min = d
        index = i
      }
    }

    return index
  }

  /**
   * The add contour labels.
   * @param contour The contour.
   * @param pts The points of the contour.
   * @param contourLabels The contour labels.
   * @param labelIndex The index of the point in the list of points, where the label should get added.
   */
  private addContourLabels(
    contour: Contour,
    pts: ScreenPoint[],
    contourLabels: ContourLabel[],
    labelIndex: number,
  ): void {
    if (pts.length < 2) {
      return
    }

    // Calculate position and angle of the label
    const i0 = Math.floor(labelIndex)
    const i1 = i0 + 1
    const dx = pts[i1].x - pts[i0].x
    const dy = pts[i1].y - pts[i0].y
    const x = pts[i0].x + dx * (labelIndex - i0)
    const y = pts[i0].y + dy * (labelIndex - i0)

    const pos = newScreenPoint(x, y)
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI
    if (angle > 90) {
      angle -= 180
    }

    if (angle < -90) {
      angle += 180
    }

    const text = this.labelStringFormatter
      ? this.labelStringFormatter(contour.contourLevel, [])
      : contour.contourLevel.toString()
    contourLabels.push({
      position: pos,
      angle,
      text,
    })
  }

  /**
   * Joins the contour segments.
   * @param epsFactor The tolerance for segment ends to connect (maximum allowed [length of distance vector] / [length of position vector]).
   */
  private joinContourSegments(epsFactor: number = 1e-10): void {
    this._contours = new Array<Contour>()

    const getPoints = (segment: ContourSegment): Array<SegmentPoint> => {
      const p1 = new SegmentPoint(segment.startPoint)
      const p2 = new SegmentPoint(segment.endPoint)
      p1.partner = p2
      p2.partner = p1
      return [p1, p2]
    }

    const groups = groupBy(this._segments, 'contourLevel')

    for (const group of groups) {
      const level = group[0]
      const points = group[1].flatMap((x) => getPoints(x)).sort((a, b) => a.point.x - b.point.x)

      // first, go through the sorted points, find identical points and join them together
      for (let i = 0; i < points.length - 1; i++) {
        const currentPoint = points[i]
        if (currentPoint.join) {
          continue
        }

        const positionVectorLength = Math.sqrt(Math.pow(currentPoint.point.x, 2) + Math.pow(currentPoint.point.y, 2))
        const eps = positionVectorLength * epsFactor

        const maxX = currentPoint.point.x + eps
        let i2 = i + 1
        let joinPoint: SegmentPoint | undefined

        // search for a point with the same coordinates (within eps) as the current point
        // as points are sorted by X, we typically only need to check the point immediately following the current point
        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (i2 >= points.length) {
            joinPoint = undefined
            break
          }

          joinPoint = points[i2]
          i2++
          if (joinPoint.join) {
            continue
          }

          if (joinPoint.point.x > maxX) {
            joinPoint = undefined
            break
          }

          const distance = Math.sqrt(
            Math.pow(joinPoint.point.x - currentPoint.point.x, 2) +
              Math.pow(joinPoint.point.y - currentPoint.point.y, 2),
          )
          if (distance < eps) {
            break
          }
        }

        // join the two points together
        if (joinPoint) {
          currentPoint.join = joinPoint
          joinPoint.join = currentPoint
        }
      }

      // go through the points again, this time we follow the joined point chains to obtain the contours
      for (const segmentPoint of points) {
        if (segmentPoint.processed) {
          continue
        }

        let currentPoint = segmentPoint

        // search for the beginning of the contour (or use the entry point if the contour is closed)
        while (currentPoint.join) {
          currentPoint = currentPoint.join.partner!
          if (currentPoint === segmentPoint) {
            break
          }
        }

        const dataPoints = new Array<DataPoint>(currentPoint.point, currentPoint.partner!.point)
        currentPoint.processed = true
        currentPoint = currentPoint.partner!
        currentPoint.processed = true

        // follow the chain of joined points and add their coordinates until we find the last point of the contour (or complete a rotation)
        while (currentPoint.join) {
          currentPoint = currentPoint.join
          if (currentPoint.processed) {
            break
          }

          currentPoint.processed = true
          currentPoint = currentPoint.partner!
          currentPoint.processed = true
          dataPoints.push(currentPoint.point)
        }

        const contour = new Contour(dataPoints, level)
        this._contours.push(contour)
      }
    }
  }

  /**
   * Renders the contour label.
   * @param rc The render context.
   * @param cl The contour label.
   */
  private async renderLabel(rc: IRenderContext, cl: ContourLabel): Promise<void> {
    if (this.actualFontSize > 0) {
      await rc.drawText(
        cl.position,
        cl.text,
        this.actualTextColor,
        this.actualFont,
        this.actualFontSize,
        this.actualFontWeight,
        cl.angle,
        HorizontalAlignment.Center,
        VerticalAlignment.Middle,
      )
    }
  }

  /**
   * Renders the contour label background.
   * @param rc The render context.
   * @param cl The contour label.
   */
  private async renderLabelBackground(rc: IRenderContext, cl: ContourLabel): Promise<void> {
    if (OxyColorHelper.isInvisible(this.labelBackground)) {
      return
    }

    // Calculate background polygon
    const size = rc.measureText(cl.text, this.actualFont, this.actualFontSize, this.actualFontWeight)
    const a = (cl.angle / 180) * Math.PI
    const dx = Math.cos(a)
    const dy = Math.sin(a)

    const ux = dx * 0.6
    const uy = dy * 0.6
    const vx = -dy * 0.5
    const vy = dx * 0.5
    const x = cl.position.x
    const y = cl.position.y

    const bpts = [
      newScreenPoint(x - size.width * ux - size.height * vx, y - size.width * uy - size.height * vy),
      newScreenPoint(x + size.width * ux - size.height * vx, y + size.width * uy - size.height * vy),
      newScreenPoint(x + size.width * ux + size.height * vx, y + size.width * uy + size.height * vy),
      newScreenPoint(x - size.width * ux + size.height * vx, y - size.width * uy + size.height * vy),
    ]
    await rc.drawPolygon(bpts, this.labelBackground, OxyColors.Undefined, 0, this.edgeRenderingMode)
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultContourSeriesOptions
  }
}

/**
 * Represents one of the two points of a segment.
 */
class SegmentPoint {
  /**
   * The partner point. This point and its partner together define a segment.
   */
  public partner?: SegmentPoint

  /**
   * The join point. This is a point from another segment with the same coordinates as this point (within eps).
   */
  public join?: SegmentPoint

  /**
   * A value indicating whether this SegmentPoint already was added to a Contour.
   */
  public processed: boolean

  /**
   * The data point.
   */
  public readonly point: DataPoint

  /**
   * Initializes a new instance of the SegmentPoint class.
   * @param point The segment point.
   */
  constructor(point: DataPoint) {
    this.point = point
    this.processed = false
  }
}

/**
 * Represents a contour.
 */
class Contour {
  /**
   * The contour level.
   */
  public readonly contourLevel: number

  /**
   * The points.
   */
  public readonly points: DataPoint[]

  /**
   * The color of the contour.
   */
  public color: OxyColor

  /**
   * Initializes a new instance of the Contour class.
   * @param points The points.
   * @param contourLevel The contour level.
   */
  constructor(points: DataPoint[], contourLevel: number) {
    this.points = points
    this.contourLevel = contourLevel
    this.color = OxyColors.Automatic
  }
}

/**
 * Represents a contour label.
 */
interface ContourLabel {
  /**
   * The angle.
   */
  angle: number

  /**
   * The position.
   */
  position: ScreenPoint

  /**
   * The text.
   */
  text: string
}

/**
 * Represents a contour segment.
 */
interface ContourSegment {
  /**
   * The contour level.
   */
  contourLevel: number

  /**
   * The start point.
   */
  startPoint: DataPoint

  /**
   * The end point.
   */
  endPoint: DataPoint
}
