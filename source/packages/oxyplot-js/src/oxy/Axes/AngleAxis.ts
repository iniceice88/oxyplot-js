import {
  AngleAxisRenderer,
  Axis,
  AxisPosition,
  AxisUtilities,
  type CreateLinearAxisOptions,
  type DataPoint,
  ExtendedDefaultLinearAxisOptions,
  type IRenderContext,
  LinearAxis,
  LineStyle,
  newScreenPoint,
  type OxyRect,
  OxyRectHelper,
  type ScreenPoint,
  TickStyle,
  type TickValuesType,
} from '@/oxyplot'
import { assignObject } from '@/patch'

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

export const DefaultAngleAxisOptions: CreateAngleAxisOptions = {
  position: AxisPosition.All,
  tickStyle: TickStyle.None,
  isPanEnabled: false,
  isZoomEnabled: false,
  majorGridlineStyle: LineStyle.Solid,
  minorGridlineStyle: LineStyle.Solid,
  startAngle: 0,
  endAngle: 360,
} as const

export const ExtendedDefaultAngleAxisOptions = {
  ...ExtendedDefaultLinearAxisOptions,
  ...DefaultAngleAxisOptions,
}

/**
 * Represents an angular axis for polar plots.
 */
export class AngleAxis extends LinearAxis {
  /**
   * The start angle (degrees).
   */
  public startAngle: number = DefaultAngleAxisOptions.startAngle!

  /**
   * The end angle (degrees).
   */
  public endAngle: number = DefaultAngleAxisOptions.endAngle!

  /**
   * Initializes a new instance of the AngleAxis class.
   */
  constructor(opt?: CreateAngleAxisOptions) {
    super(opt)
    assignObject(this, DefaultAngleAxisOptions, opt)
  }

  getElementName() {
    return 'AngleAxis'
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
    const x1 = OxyRectHelper.right(bounds)
    const y0 = OxyRectHelper.bottom(bounds)
    const y1 = bounds.top

    this.screenMin = newScreenPoint(x0, y1)
    this.screenMax = newScreenPoint(x1, y0)

    const newScale = (this.endAngle - this.startAngle) / (this.actualMaximum - this.actualMinimum)
    const newOffset = this.actualMinimum - this.startAngle / newScale
    this.setTransform(newScale, newOffset)

    this.clipMinimum = this.actualMinimum
    this.clipMaximum = this.actualMaximum
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultAngleAxisOptions
  }
}
