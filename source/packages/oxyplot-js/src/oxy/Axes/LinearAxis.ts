import { Axis, type CreateAxisOptions, ExtendedDefaultAxisOptions, FractionHelper } from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateLinearAxisOptions extends CreateAxisOptions {
  fractionUnit?: number
  fractionUnitSymbol?: string
  formatAsFractions?: boolean
}

export const DefaultLinearAxisOptions: CreateLinearAxisOptions = {
  fractionUnit: 1.0,
  formatAsFractions: false,

  fractionUnitSymbol: undefined,
} as const

export const ExtendedDefaultLinearAxisOptions = {
  ...ExtendedDefaultAxisOptions,
  ...DefaultLinearAxisOptions,
}

/**
 * Represents an axis with linear scale.
 */
export class LinearAxis extends Axis {
  /**
   * Initializes a new instance of the LinearAxis class.
   */
  public constructor(opt?: CreateLinearAxisOptions) {
    super(opt)
    assignObject(this, DefaultLinearAxisOptions, opt)
  }

  getElementName() {
    return 'LinearAxis'
  }

  /**
   * Gets or sets a value indicating whether to format numbers as fractions.
   */
  public formatAsFractions: boolean = DefaultLinearAxisOptions.formatAsFractions!

  /**
   * Gets or sets the fraction unit. Remember to set formatAsFractions to true.
   */
  public fractionUnit: number = DefaultLinearAxisOptions.fractionUnit!

  /**
   * Gets or sets the fraction unit symbol. Use fractionUnit = Math.PI and fractionUnitSymbol = "π" if you want the axis to show "π/2,π,3π/2,2π" etc. Use fractionUnit = 1 and fractionUnitSymbol = "L" if you want the axis to show "0,L/2,L" etc. Remember to set formatAsFractions to true.
   */
  public fractionUnitSymbol?: string

  /**
   * Determines whether the axis is used for X/Y values.
   * @returns true if it is an XY axis; otherwise, false.
   */
  public isXyAxis(): boolean {
    return true
  }

  /**
   * Determines whether the axis is logarithmic.
   * @returns true if it is a logarithmic axis; otherwise, false.
   */
  public isLogarithmic(): boolean {
    return false
  }

  /**
   * Formats the value to be used on the axis.
   * @param x The value to format.
   * @returns The formatted value.
   */
  protected formatValueOverride(x: number): string {
    if (this.formatAsFractions) {
      return FractionHelper.convertToFractionString(
        x,
        this.fractionUnit,
        this.fractionUnitSymbol,
        1e-6,
        this.stringFormatter,
      )
    }

    return super.formatValueOverride(x)
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultLinearAxisOptions
  }
}
