import {
  AngleAxis,
  Axis,
  AxisPosition,
  type CreateLinearAxisOptions,
  type DataPoint,
  ExtendedDefaultLinearAxisOptions,
  type IRenderContext,
  LinearAxis,
  LineStyle,
  MagnitudeAxisRenderer,
  newDataPoint,
  newScreenPoint,
  type OxyRect,
  OxyRectHelper,
  type ScreenPoint,
  ScreenPoint_LeftTop,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateMagnitudeAxisOptions extends CreateLinearAxisOptions {
  /**
   * The midpoint (screen coordinates) of the plot area. This is used by polar coordinate systems.
   */
  midPoint?: ScreenPoint
}

const DefaultMagnitudeAxisOptions: CreateMagnitudeAxisOptions = {
  midPoint: ScreenPoint_LeftTop,
  position: AxisPosition.None,
  isPanEnabled: false,
  isZoomEnabled: false,
  majorGridlineStyle: LineStyle.Solid,
  minorGridlineStyle: LineStyle.Solid,
} as const

export const ExtendedDefaultMagnitudeAxisOptions = {
  ...ExtendedDefaultLinearAxisOptions,
  ...DefaultMagnitudeAxisOptions,
}

/**
 * Represents a magnitude axis for polar plots.
 */
export class MagnitudeAxis extends LinearAxis {
  /**
   * The midpoint (screen coordinates) of the plot area. This is used by polar coordinate systems.
   * @internal
   */
  midPoint: ScreenPoint = DefaultMagnitudeAxisOptions.midPoint!

  /**
   * Initializes a new instance of the MagnitudeAxis class.
   */
  constructor(opt?: CreateMagnitudeAxisOptions) {
    super(opt)
    assignObject(this, DefaultMagnitudeAxisOptions, opt)
  }

  getElementName() {
    return 'MagnitudeAxis'
  }

  /**
   * Inverse transform the specified screen point.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param yaxis The y-axis.
   * @returns The data point.
   * @throws Error if polar angle axis not defined.
   */
  inverseTransformPoint(x: number, y: number, yaxis: Axis): DataPoint {
    if (!(yaxis instanceof AngleAxis)) {
      throw new Error('Polar angle axis not defined!')
    }

    const angleAxis = yaxis as AngleAxis
    x -= this.midPoint.x
    y -= this.midPoint.y
    y *= -1
    const th = Math.atan2(y, x)
    const r = Math.sqrt(x * x + y * y)
    x = r / this.scale + this.offset
    y = th / angleAxis.scale + (angleAxis.offset * Math.PI) / 180.0
    return newDataPoint(x, y)
  }

  /**
   * Determines whether the axis is used for X/Y values.
   * @returns false as it is not an XY axis.
   */
  isXyAxis(): boolean {
    return false
  }

  /**
   * Renders the axis on the specified render context.
   * @param rc The render context.
   * @param pass The rendering pass.
   */
  async render(rc: IRenderContext, pass: number): Promise<void> {
    const r = new MagnitudeAxisRenderer(rc, this.plotModel)
    await r.render(this, pass)
  }

  /**
   * Transforms the specified point to screen coordinates.
   * @param x The x value (for the current axis).
   * @param y The y value.
   * @param yaxis The y-axis.
   * @returns The transformed point.
   * @throws Error if polar angle axis not defined.
   */
  transformPoint(x: number, y: number, yaxis: Axis): ScreenPoint {
    if (!(yaxis instanceof AngleAxis)) {
      throw new Error('Polar angle axis not defined!')
    }

    const angleAxis = yaxis as AngleAxis
    const r = (x - this.offset) * this.scale
    const theta = (y - angleAxis.offset) * angleAxis.scale

    return newScreenPoint(
      this.midPoint.x + r * Math.cos((theta / 180) * Math.PI),
      this.midPoint.y - r * Math.sin((theta / 180) * Math.PI),
    )
  }

  /**
   * Updates the scale and offset properties of the transform from the specified boundary rectangle.
   * @param bounds The bounds.
   */
  updateTransform(bounds: OxyRect): void {
    const x0 = bounds.left
    const x1 = OxyRectHelper.right(bounds)
    const y0 = OxyRectHelper.bottom(bounds)
    const y1 = bounds.top

    this.screenMin = newScreenPoint(x0, y1)
    this.screenMax = newScreenPoint(x1, y0)

    this.midPoint = newScreenPoint((x0 + x1) / 2, (y0 + y1) / 2)

    const r = Math.min(Math.abs(x1 - x0), Math.abs(y1 - y0))

    let a0 = 0.0
    let a1 = r * 0.5

    const dx = a1 - a0
    a1 = a0 + this.endPosition * dx
    a0 = a0 + this.startPosition * dx

    const marginSign = this.isReversed ? -1.0 : 1.0

    if (this.minimumMargin > 0) {
      a0 += this.minimumMargin * marginSign
    }

    if (this.maximumMargin > 0) {
      a1 -= this.maximumMargin * marginSign
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
    let newOffset: number, newScale: number
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
      this.clipMinimum = this.inverseTransform(0.0)
    } else {
      this.clipMinimum = this.actualMinimum
    }

    if (this.maximumDataMargin > 0) {
      this.clipMaximum = this.inverseTransform(r * 0.5)
    } else {
      this.clipMaximum = this.actualMaximum
    }

    this.actualMaximumAndMinimumChangedOverride()
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultMagnitudeAxisOptions
  }
}
