import {
  AxisPosition,
  type CreateLinearAxisOptions,
  type INumericColorAxis,
  type IRenderContext,
  LinearAxis,
  NumericColorAxisRenderer,
  OxyColor,
  OxyColors,
  OxyPalette,
  OxyPalettes,
} from '@/oxyplot'
import { assertInteger, Number_MIN_VALUE, removeUndef } from '@/patch'

export interface CreateLinearColorAxisOptions extends CreateLinearAxisOptions {
  /** The color used to represent NaN values. */
  invalidNumberColor?: OxyColor

  /** The color of values above the maximum value. */
  highColor?: OxyColor

  /** The color of values below the minimum value. */
  lowColor?: OxyColor

  /** The palette. */
  palette?: OxyPalette

  /** A value indicating whether to render the colors as an image. */
  renderAsImage?: boolean
}

/**
 * Represents a linear color axis.
 */
export class LinearColorAxis extends LinearAxis implements INumericColorAxis {
  /** The color used to represent NaN values. */
  invalidNumberColor: OxyColor

  /** The color of values above the maximum value. */
  highColor: OxyColor

  /** The color of values below the minimum value. */
  lowColor: OxyColor

  /** The palette. */
  palette: OxyPalette

  /** A value indicating whether to render the colors as an image. */
  renderAsImage: boolean = false

  constructor(opt?: CreateLinearColorAxisOptions) {
    super(opt)
    this.position = AxisPosition.None
    this.axisDistance = 20

    this.isPanEnabled = false
    this.isZoomEnabled = false
    this.palette = OxyPalettes.viridis()

    this.lowColor = OxyColors.Undefined
    this.highColor = OxyColors.Undefined
    this.invalidNumberColor = OxyColors.Gray

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /** Determines whether the axis is used for X/Y values. */
  isXyAxis(): boolean {
    return false
  }

  public async render(rc: IRenderContext, pass: number): Promise<void> {
    const renderer = new NumericColorAxisRenderer<LinearColorAxis>(rc, this.plotModel)
    return renderer.render(this, pass)
  }

  /** Gets the color. */
  getColor(paletteIndex: number): OxyColor {
    assertInteger(paletteIndex, 'paletteIndex')

    if (paletteIndex === Number_MIN_VALUE) {
      return this.invalidNumberColor
    }

    if (paletteIndex === 0) {
      return this.lowColor
    }

    if (paletteIndex === this.palette.colors.length + 1) {
      return this.highColor
    }

    return this.palette.colors[paletteIndex - 1]
  }

  /** Gets the palette index of the specified value. */
  getPaletteIndex(value: number): number {
    if (isNaN(value)) {
      return Number_MIN_VALUE
    }

    if (!this.lowColor.isUndefined() && value < this.clipMinimum) {
      return 0
    }

    if (!this.highColor.isUndefined() && value > this.clipMaximum) {
      return this.palette.colors.length + 1
    }

    let index =
      1 + Math.floor(((value - this.clipMinimum) / (this.clipMaximum - this.clipMinimum)) * this.palette.colors.length)

    if (index < 1) {
      index = 1
    }

    if (index > this.palette.colors.length) {
      index = this.palette.colors.length
    }

    return index
  }
}
