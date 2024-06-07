import {
  CategoryAxis,
  CategoryColorAxisRenderer,
  type CreateCategoryAxisOptions,
  ExtendedDefaultCategoryAxisOptions,
  type IColorAxis,
  type IRenderContext,
  newOxyPalette,
  type OxyColor,
  OxyColors,
  type OxyPalette,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateCategoryColorAxisOptions extends CreateCategoryAxisOptions {
  invalidCategoryColor?: OxyColor
  palette?: OxyPalette
}

const DefaultCategoryColorAxisOptions: CreateCategoryColorAxisOptions = {
  invalidCategoryColor: OxyColors.Undefined,
  palette: newOxyPalette(),
}

export const ExtendedDefaultCategoryColorAxisOptions = {
  ...ExtendedDefaultCategoryAxisOptions,
  ...DefaultCategoryColorAxisOptions,
}

/** Represents a categorized color axis. */
export class CategoryColorAxis extends CategoryAxis implements IColorAxis {
  /** The invalid category color. */
  public invalidCategoryColor: OxyColor = DefaultCategoryColorAxisOptions.invalidCategoryColor!

  /** The palette. */
  public palette: OxyPalette = DefaultCategoryColorAxisOptions.palette!

  constructor(opt?: CreateCategoryColorAxisOptions) {
    super(opt)
    assignObject(this, DefaultCategoryColorAxisOptions, opt)
  }

  getElementName() {
    return 'CategoryColorAxis'
  }

  /** Gets the color of the specified index in the color palette. */
  public getColor(paletteIndex: number): OxyColor {
    if (paletteIndex === -1) {
      return this.invalidCategoryColor
    }

    if (paletteIndex >= this.palette.colors.length) {
      return this.invalidCategoryColor
    }

    return this.palette.colors[paletteIndex]
  }

  /** Gets the palette index of the specified value. */
  public getPaletteIndex(value: number): number {
    return Math.floor(value)
  }

  /** Renders the axis on the specified render context. */
  public async render(rc: IRenderContext, pass: number): Promise<void> {
    const renderer = new CategoryColorAxisRenderer(rc, this.plotModel)
    return renderer.render(this, pass)
  }

  /**
   * Gets the high value.
   * @internal
   * */
  getHighValue(paletteIndex: number, majorLabelValues: number[]): number {
    const highValue =
      paletteIndex >= this.palette.colors.length - 1
        ? this.clipMaximum
        : (majorLabelValues[paletteIndex] + majorLabelValues[paletteIndex + 1]) / 2
    return highValue
  }

  /**
   * Gets the low value.
   * @internal
   * */
  getLowValue(paletteIndex: number, majorLabelValues: number[]): number {
    const lowValue =
      paletteIndex === 0 ? this.clipMinimum : (majorLabelValues[paletteIndex - 1] + majorLabelValues[paletteIndex]) / 2
    return lowValue
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultCategoryColorAxisOptions
  }
}
