import {
  type AxisChangedEventArgs,
  AxisChangeTypes,
  AxisPosition,
  AxisUtilities,
  type CreateMagnitudeAxisOptions,
  type IRenderContext,
  LineStyle,
  MagnitudeAxis,
  MagnitudeAxisFullPlotAreaRenderer,
  newScreenPoint,
  OxyRect,
  ScreenPoint,
  screenPointDistanceTo,
  type TickValuesType,
} from '@/oxyplot'

export interface CreateMagnitudeAxisFullPlotAreaOptions extends CreateMagnitudeAxisOptions {
  midShiftH?: number
  midShiftV?: number
}

/** Represents a magnitude axis that covers the whole plot area. */
export class MagnitudeAxisFullPlotArea extends MagnitudeAxis {
  private _midShiftH = 0

  /** Portion to shift the center in horizontal direction relative to the plot area size (from -0.5 to +0.5 meaning +-50% of the width) */
  get midShiftH(): number {
    return this._midShiftH
  }

  set midShiftH(value: number) {
    this._midShiftH = value
    this._midShiftH = Math.max(this._midShiftH, -0.5)
    this._midShiftH = Math.min(this._midShiftH, 0.5)
  }

  private _midShiftV = 0

  /** Portion to shift the center in vertical direction relative to the plot area size (from -0.5 to +0.5 meaning +-50% of the height) */
  get midShiftV(): number {
    return this._midShiftV
  }

  set midShiftV(value: number) {
    this._midShiftV = value
    this._midShiftV = Math.max(this._midShiftV, -0.5)
    this._midShiftV = Math.min(this._midShiftV, 0.5)
  }

  /** Initializes a new instance of the MagnitudeAxis class. */
  constructor(opt?: CreateMagnitudeAxisFullPlotAreaOptions) {
    super(opt)
    this.position = AxisPosition.None
    this.isPanEnabled = true
    this.isZoomEnabled = false

    this.majorGridlineStyle = LineStyle.Solid
    this.minorGridlineStyle = LineStyle.Solid

    if (opt) {
      Object.assign(this, opt)
    }
  }

  /** Renders the axis on the specified render context. */
  public async render(rc: IRenderContext, pass: number): Promise<void> {
    const r = new MagnitudeAxisFullPlotAreaRenderer(rc, this.plotModel)
    await r.render(this, pass)
  }

  public getTickValues(): TickValuesType {
    const axisRect = OxyRect.fromScreenPoints(this.screenMin, this.screenMax)
    const distanceTopLeft = screenPointDistanceTo(axisRect.topLeft, this.midPoint)
    const distanceTopRight = screenPointDistanceTo(axisRect.topRight, this.midPoint)
    const distanceBottomRight = screenPointDistanceTo(axisRect.bottomRight, this.midPoint)
    const distanceBottomLeft = screenPointDistanceTo(axisRect.bottomLeft, this.midPoint)

    let maxDistance = Math.max(distanceTopLeft, distanceTopRight)
    maxDistance = Math.max(maxDistance, distanceBottomRight)
    maxDistance = Math.max(maxDistance, distanceBottomLeft)

    const actualMaximum = this.inverseTransform(maxDistance)

    const majorTickValues = AxisUtilities.createTickValues(this.actualMinimum, actualMaximum, this.actualMajorStep)
    let minorTickValues = AxisUtilities.createTickValues(this.actualMinimum, actualMaximum, this.actualMinorStep)
    minorTickValues = AxisUtilities.filterRedundantMinorTicks(majorTickValues, minorTickValues)

    const majorLabelValues = majorTickValues

    return {
      majorLabelValues,
      majorTickValues,
      minorTickValues,
    }
  }

  /**
   * Updates the scale and offset properties of the transform from the specified boundary rectangle.
   * @internal
   * */
  updateTransform(bounds: OxyRect): void {
    const x0 = bounds.left
    const x1 = bounds.right
    const y0 = bounds.bottom
    const y1 = bounds.top

    this.screenMin = newScreenPoint(x0, y1)
    this.screenMax = newScreenPoint(x1, y0)

    this.midPoint = newScreenPoint(
      (x0 + x1) / 2 + this.midShiftH * bounds.width,
      (y0 + y1) / 2 + this.midShiftV * bounds.height,
    )

    const r = Math.min(Math.abs(x1 - x0), Math.abs(y1 - y0))

    let a0 = 0.0
    let a1 = r * 0.5

    const dx = a1 - a0
    a1 = a0 + this.endPosition * dx
    a0 = a0 + this.startPosition * dx

    const marginSign = this.isReversed ? -1.0 : 1.0

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

  /** Pans the specified axis. */
  public pan(ppt: ScreenPoint, cpt: ScreenPoint): void {
    if (!this.isPanEnabled) {
      return
    }

    const dsx = cpt.x - ppt.x
    const dsy = cpt.y - ppt.y

    const dsxp = dsx / this.plotModel.plotArea.width
    const dsyp = dsy / this.plotModel.plotArea.height

    this.midShiftH += dsxp
    this.midShiftV += dsyp

    this.onAxisChanged({
      changeType: AxisChangeTypes.Pan,
      deltaMinimum: 0,
      deltaMaximum: 0,
    } as AxisChangedEventArgs)
  }

  /** Zooms the axis at the specified coordinate. */
  public zoomAt(factor: number, x: number): void {
    if (!this.isZoomEnabled) {
      return
    }

    super.zoomAt(factor, 0)
    return
  }
}
