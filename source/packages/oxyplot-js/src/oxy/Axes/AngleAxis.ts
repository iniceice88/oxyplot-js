import type { CreateLinearAxisOptions, DataPoint, IRenderContext, ScreenPoint, TickValuesType } from '@/oxyplot'
import {
  AngleAxisRenderer,
  Axis,
  AxisPosition,
  AxisUtilities,
  LinearAxis,
  LineStyle,
  newScreenPoint,
  OxyRect,
  TickStyle,
} from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface CreateAngleAxisOptions extends CreateLinearAxisOptions {
  /**
   * The start angle (degrees).
   */
  startAngle?: number

  /**
   * The end angle (degrees).
   */
  endAngle?: number
}

/**
 * Represents an angular axis for polar plots.
 */
export class AngleAxis extends LinearAxis {
  /**
   * The start angle (degrees).
   */
  public startAngle: number

  /**
   * The end angle (degrees).
   */
  public endAngle: number

  /**
   * Initializes a new instance of the AngleAxis class.
   */
  constructor(opt?: CreateAngleAxisOptions) {
    super(opt)
    this.position = AxisPosition.All
    this.tickStyle = TickStyle.None
    this.isPanEnabled = false
    this.isZoomEnabled = false
    this.majorGridlineStyle = LineStyle.Solid
    this.minorGridlineStyle = LineStyle.Solid
    this.startAngle = 0
    this.endAngle = 360

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets the coordinates used to draw ticks and tick labels (numbers or category names).
   */
  public getTickValues(): TickValuesType {
    const minimum = this.startAngle / this.scale
    const maximum = this.endAngle / this.scale

    let minorTickValues = this.createTickValues(minimum, maximum, this.actualMinorStep)
    const majorTickValues = this.createTickValues(minimum, maximum, this.actualMajorStep)
    const majorLabelValues = this.createTickValues(this.minimum, this.maximum, this.actualMajorStep)

    minorTickValues = AxisUtilities.filterRedundantMinorTicks(majorTickValues, minorTickValues)

    return { majorLabelValues, majorTickValues, minorTickValues }
  }

  /**
   * Inverse transforms the specified screen point.
   * @throws Error if the method is called.
   */
  public inverseTransformPoint(x: number, y: number, yaxis: Axis): DataPoint {
    throw new Error('Angle axis should always be the y-axis.')
  }

  /**
   * Determines whether the axis is used for X/Y values.
   * @returns false as it is not an XY axis.
   */
  public isXyAxis(): boolean {
    return false
  }

  /**
   * Renders the axis on the specified render context.
   */
  public async render(rc: IRenderContext, pass: number): Promise<void> {
    const r = new AngleAxisRenderer(rc, this.plotModel)
    await r.render(this, pass)
  }

  /**
   * Transforms the specified point to screen coordinates.
   * @throws Error if the method is called.
   */
  public transformPoint(x: number, y: number, yaxis: Axis): ScreenPoint {
    throw new Error('Angle axis should always be the y-axis.')
  }

  /**
   * Updates the scale and offset properties of the transform from the specified boundary rectangle.
   * @internal
   */
  updateTransform(bounds: OxyRect): void {
    const x0 = bounds.left
    const x1 = bounds.right
    const y0 = bounds.bottom
    const y1 = bounds.top

    this.screenMin = newScreenPoint(x0, y1)
    this.screenMax = newScreenPoint(x1, y0)

    const newScale = (this.endAngle - this.startAngle) / (this.actualMaximum - this.actualMinimum)
    const newOffset = this.actualMinimum - this.startAngle / newScale
    this.setTransform(newScale, newOffset)

    this.clipMinimum = this.actualMinimum
    this.clipMaximum = this.actualMaximum
  }
}
