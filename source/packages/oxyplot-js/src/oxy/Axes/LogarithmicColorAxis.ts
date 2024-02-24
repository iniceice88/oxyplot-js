import {
  AxisPosition,
  ColorAxisExtensions,
  type CreateLogarithmicAxisOptions,
  type INumericColorAxis,
  type IRenderContext,
  LogarithmicAxis,
  NumericColorAxisRenderer,
  OxyColor,
  OxyColors,
  OxyPalette,
  OxyPalettes,
} from '@/oxyplot'
import { Number_MIN_VALUE, removeUndef } from '@/patch'

export interface CreateLogarithmicColorAxisOptions extends CreateLogarithmicAxisOptions {
  /** The color of values above the maximum value. */
  highColor?: OxyColor

  /** The color of values below the minimum value. */
  lowColor?: OxyColor

  /** The invalid category color. */
  invalidNumberColor?: OxyColor

  /** The palette. */
  palette?: OxyPalette
}

/**
 * Represents a logarithmic color axis.
 */
export class LogarithmicColorAxis extends LogarithmicAxis implements INumericColorAxis {
  /**
   * Initializes a new instance of the LinearColorAxis class.
   */
  public constructor(opt?: CreateLogarithmicColorAxisOptions) {
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

  invalidNumberColor: OxyColor
  highColor: OxyColor
  lowColor: OxyColor
  palette: OxyPalette
  renderAsImage: boolean = false

  public isXyAxis(): boolean {
    return false
  }

  public async render(rc: IRenderContext, pass: number) {
    const renderer = new NumericColorAxisRenderer<LogarithmicColorAxis>(rc, this.plotModel)
    await renderer.render(this, pass)
  }

  public getColor(paletteIndex: number): OxyColor {
    return ColorAxisExtensions.getColorByPaletteIndex(this, paletteIndex)
  }

  public getPaletteIndex(value: number): number {
    if (isNaN(value)) {
      return Number_MIN_VALUE
    }

    if (this.lowColor.isUndefined() && value < this.clipMinimum) {
      return 0
    }

    if (this.highColor.isUndefined() && value > this.clipMaximum) {
      return this.palette.colors.length + 1
    }

    const logValue = this.preTransform(value)

    let index =
      1 +
      Math.floor(
        ((logValue - this.logClipMinimum) / (this.logClipMaximum - this.logClipMinimum)) * this.palette.colors.length,
      )

    if (index < 1) {
      index = 1
    }

    if (index > this.palette.colors.length) {
      index = this.palette.colors.length
    }

    return index
  }
}
