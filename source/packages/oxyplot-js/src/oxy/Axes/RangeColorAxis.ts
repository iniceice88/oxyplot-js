import {
  AxisPosition,
  type CreateLinearAxisOptions,
  HorizontalAndVerticalAxisRenderer,
  type IColorAxis,
  type IRenderContext,
  LinearAxis,
  OxyColor,
  OxyColors,
  OxyRect,
} from '@/oxyplot'
import { Number_MIN_VALUE } from '@/patch'

export interface CreateRangeColorAxisOptions extends CreateLinearAxisOptions {
  /** The color of values above the maximum value. */
  highColor?: OxyColor

  /** The color of values below the minimum value. */
  lowColor?: OxyColor

  /** The invalid category color. */
  invalidNumberColor?: OxyColor
}

/** Represents a color axis that contains colors for specified ranges. */
export class RangeColorAxis extends LinearAxis implements IColorAxis {
  /** The ranges */
  private readonly ranges: ColorRange[] = []

  /** The invalid category color. */
  public invalidNumberColor: OxyColor

  /** The color of values above the maximum value. */
  public highColor: OxyColor

  /** The color of values below the minimum value. */
  public lowColor: OxyColor

  constructor(opt?: CreateRangeColorAxisOptions) {
    super(opt)
    this.position = AxisPosition.None
    this.axisDistance = 20

    this.lowColor = OxyColors.Undefined
    this.highColor = OxyColors.Undefined
    this.invalidNumberColor = OxyColors.Gray

    this.isPanEnabled = false
    this.isZoomEnabled = false

    if (opt) {
      Object.assign(this, opt)
    }
  }

  /** Adds a range. */
  public addRange(lowerBound: number, upperBound: number, color: OxyColor): void {
    this.ranges.push({ lowerBound, upperBound, color })
  }

  /** Clears the ranges. */
  public clearRanges(): void {
    this.ranges.length = 0
  }

  /** Gets the palette index of the specified value. */
  public getPaletteIndex(value: number): number {
    if (!this.lowColor.isUndefined() && value < this.ranges[0].lowerBound) {
      return -1
    }

    if (!this.highColor.isUndefined() && value > this.ranges[this.ranges.length - 1].upperBound) {
      return this.ranges.length
    }

    // TODO: change to binary search?
    for (let i = 0; i < this.ranges.length; i++) {
      const range = this.ranges[i]
      if (range.lowerBound <= value && range.upperBound > value) {
        return i
      }
    }

    return Number_MIN_VALUE
  }

  /** Gets the color. */
  public getColor(paletteIndex: number): OxyColor {
    if (paletteIndex === Number_MIN_VALUE) {
      return this.invalidNumberColor
    }

    if (paletteIndex === -1) {
      return this.lowColor
    }

    if (paletteIndex === this.ranges.length) {
      return this.highColor
    }

    return this.ranges[paletteIndex].color
  }

  public async render(rc: IRenderContext, pass: number): Promise<void> {
    if (this.position === AxisPosition.None) {
      return
    }

    if (pass === 0) {
      const distance = this.axisDistance
      let left = this.plotModel.plotArea.left
      let top = this.plotModel.plotArea.top
      const width = this.majorTickSize - 2
      const height = this.majorTickSize - 2

      const TierShift = 0

      switch (this.position) {
        case AxisPosition.Left:
          left = this.plotModel.plotArea.left - TierShift - width - distance
          top = this.plotModel.plotArea.top
          break
        case AxisPosition.Right:
          left = this.plotModel.plotArea.right + TierShift + distance
          top = this.plotModel.plotArea.top
          break
        case AxisPosition.Top:
          left = this.plotModel.plotArea.left
          top = this.plotModel.plotArea.top - TierShift - height - distance
          break
        case AxisPosition.Bottom:
          left = this.plotModel.plotArea.left
          top = this.plotModel.plotArea.bottom + TierShift + distance
          break
      }

      const drawColorRect = async (ylow: number, yhigh: number, color: OxyColor) => {
        const ymin = Math.min(ylow, yhigh)
        const ymax = Math.max(ylow, yhigh)
        await rc.drawRectangle(
          this.isHorizontal()
            ? new OxyRect(ymin, top, ymax - ymin, height)
            : new OxyRect(left, ymin, width, ymax - ymin),
          color,
          OxyColors.Undefined,
          0,
          this.edgeRenderingMode,
        )
      }

      // if the axis is reversed then the min and max values need to be swapped.
      const effectiveMaxY = this.transform(this.isReversed ? this.actualMinimum : this.actualMaximum)
      const effectiveMinY = this.transform(this.isReversed ? this.actualMaximum : this.actualMinimum)

      for (const range of this.ranges) {
        let ylow = this.transform(range.lowerBound)
        let yhigh = this.transform(range.upperBound)

        if (this.isHorizontal()) {
          if (ylow < effectiveMinY) {
            ylow = effectiveMinY
          }

          if (yhigh > effectiveMaxY) {
            yhigh = effectiveMaxY
          }
        } else {
          if (ylow > effectiveMinY) {
            ylow = effectiveMinY
          }

          if (yhigh < effectiveMaxY) {
            yhigh = effectiveMaxY
          }
        }

        await drawColorRect(ylow, yhigh, range.color)
      }

      let highLowLength = 10
      if (this.isHorizontal()) {
        highLowLength *= -1
      }

      if (!this.lowColor.isUndefined()) {
        const ylow = this.transform(this.actualMinimum)
        await drawColorRect(ylow, ylow + highLowLength, this.lowColor)
      }

      if (!this.highColor.isUndefined()) {
        const yhigh = this.transform(this.actualMaximum)
        await drawColorRect(yhigh, yhigh - highLowLength, this.highColor)
      }
    }

    const r = new HorizontalAndVerticalAxisRenderer(rc, this.plotModel)
    await r.render(this, pass)
  }
}

/** Defines a range. */
interface ColorRange {
  /** The color. */
  color: OxyColor

  /** The lower bound. */
  lowerBound: number

  /** The upper bound. */
  upperBound: number
}
