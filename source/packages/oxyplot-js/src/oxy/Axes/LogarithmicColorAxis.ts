import {
  AxisPosition,
  ColorAxisExtensions,
  type CreateLogarithmicAxisOptions,
  ExtendedDefaultLogarithmicAxisOptions,
  type INumericColorAxis,
  type IRenderContext,
  LogarithmicAxis,
  NumericColorAxisRenderer,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyPalette,
  OxyPalettes,
} from '@/oxyplot'
import { assignObject, isNaNOrUndef, Number_MIN_VALUE } from '@/patch'

export interface CreateLogarithmicColorAxisOptions extends CreateLogarithmicAxisOptions {
  /** The color of values above the maximum value. */
  highColor?: OxyColor

  /** The color of values below the minimum value. */
  lowColor?: OxyColor

  /** The invalid category color. */
  invalidNumberColor?: OxyColor

  /** The palette. */
  palette?: OxyPalette

  renderAsImage?: boolean
}

const DefaultLogarithmicColorAxisOptions: CreateLogarithmicColorAxisOptions = {
  highColor: OxyColors.Undefined,
  lowColor: OxyColors.Undefined,
  invalidNumberColor: OxyColors.Gray,
  palette: OxyPalettes.viridis(),

  position: AxisPosition.None,
  axisDistance: 20,
  isPanEnabled: false,
  isZoomEnabled: false,
  renderAsImage: false,
} as const

export const ExtendedDefaultLogarithmicColorAxisOptions = {
  ...ExtendedDefaultLogarithmicAxisOptions,
  ...DefaultLogarithmicColorAxisOptions,
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
    assignObject(this, DefaultLogarithmicColorAxisOptions, opt)
  }

  getElementName() {
    return 'LogarithmicColorAxis'
  }

  invalidNumberColor: OxyColor = DefaultLogarithmicColorAxisOptions.invalidNumberColor!
  highColor: OxyColor = DefaultLogarithmicColorAxisOptions.highColor!
  lowColor: OxyColor = DefaultLogarithmicColorAxisOptions.lowColor!
  palette: OxyPalette = DefaultLogarithmicColorAxisOptions.palette!
  renderAsImage: boolean = DefaultLogarithmicColorAxisOptions.renderAsImage!

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
    if (isNaNOrUndef(value)) {
      return Number_MIN_VALUE
    }

    if (OxyColorHelper.isUndefined(this.lowColor) && value < this.clipMinimum) {
      return 0
    }

    if (OxyColorHelper.isUndefined(this.highColor) && value > this.clipMaximum) {
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

  protected getElementDefaultValues(): any {
    return ExtendedDefaultLogarithmicColorAxisOptions
  }
}
