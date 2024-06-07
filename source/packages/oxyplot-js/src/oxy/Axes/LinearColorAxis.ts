import {
  AxisPosition,
  type CreateLinearAxisOptions,
  ExtendedDefaultLinearAxisOptions,
  type INumericColorAxis,
  type IRenderContext,
  LinearAxis,
  NumericColorAxisRenderer,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyPalette,
  OxyPalettes,
} from '@/oxyplot'
import { assertInteger, assignObject, isNaNOrUndef, Number_MIN_VALUE } from '@/patch'

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

const DefaultLinearColorAxisOptions: CreateLinearColorAxisOptions = {
  invalidNumberColor: OxyColors.Gray,
  highColor: OxyColors.Undefined,
  lowColor: OxyColors.Undefined,
  palette: OxyPalettes.viridis(),
  renderAsImage: false,

  position: AxisPosition.None,
  axisDistance: 20,
  isPanEnabled: false,
  isZoomEnabled: false,
} as const

export const ExtendedDefaultLinearColorAxisOptions = {
  ...ExtendedDefaultLinearAxisOptions,
  ...DefaultLinearColorAxisOptions,
}

/**
 * Represents a linear color axis.
 */
export class LinearColorAxis extends LinearAxis implements INumericColorAxis {
  /** The color used to represent NaN values. */
  invalidNumberColor: OxyColor = DefaultLinearColorAxisOptions.invalidNumberColor!

  /** The color of values above the maximum value. */
  highColor: OxyColor = DefaultLinearColorAxisOptions.highColor!

  /** The color of values below the minimum value. */
  lowColor: OxyColor = DefaultLinearColorAxisOptions.lowColor!

  /** The palette. */
  palette: OxyPalette = DefaultLinearColorAxisOptions.palette!

  /** A value indicating whether to render the colors as an image. */
  renderAsImage: boolean = DefaultLinearColorAxisOptions.renderAsImage!

  constructor(opt?: CreateLinearColorAxisOptions) {
    super(opt)
    assignObject(this, DefaultLinearColorAxisOptions, opt)
  }

  getElementName() {
    return 'LinearColorAxis'
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
    if (isNaNOrUndef(value)) {
      return Number_MIN_VALUE
    }

    if (!OxyColorHelper.isUndefined(this.lowColor) && value < this.clipMinimum) {
      return 0
    }

    if (!OxyColorHelper.isUndefined(this.highColor) && value > this.clipMaximum) {
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

  protected getElementDefaultValues(): any {
    return ExtendedDefaultLinearColorAxisOptions
  }
}
