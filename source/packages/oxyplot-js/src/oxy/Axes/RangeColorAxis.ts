import {
  AxisPosition,
  type CreateLinearAxisOptions,
  type IColorAxis,
  type IRenderContext,
  LinearAxis,
  OxyColor,
  OxyColors,
  RangeColorAxisRenderer,
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
  private readonly _ranges: ColorRange[] = []

  get ranges(): ColorRange[] {
    return this._ranges
  }

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
    this._ranges.push({ lowerBound, upperBound, color })
  }

  /** Clears the ranges. */
  public clearRanges(): void {
    this._ranges.length = 0
  }

  /** Gets the palette index of the specified value. */
  public getPaletteIndex(value: number): number {
    if (!this.lowColor.isUndefined() && value < this._ranges[0].lowerBound) {
      return -1
    }

    if (!this.highColor.isUndefined() && value > this._ranges[this._ranges.length - 1].upperBound) {
      return this._ranges.length
    }

    // TODO: change to binary search?
    for (let i = 0; i < this._ranges.length; i++) {
      const range = this._ranges[i]
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

    if (paletteIndex === this._ranges.length) {
      return this.highColor
    }

    return this._ranges[paletteIndex].color
  }

  public async render(rc: IRenderContext, pass: number): Promise<void> {
    const renderer = new RangeColorAxisRenderer(rc, this.plotModel)
    return renderer.render(this, pass)
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
