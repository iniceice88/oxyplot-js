import {
  AxisPosition,
  CategoryAxis,
  type CreateCategoryAxisOptions,
  type IColorAxis,
  type IRenderContext,
  OxyColor,
  OxyColors,
  OxyPalette,
  OxyRect,
} from '@/oxyplot'

export interface CreateCategoryColorAxisOptions extends CreateCategoryAxisOptions {
  invalidCategoryColor?: OxyColor
  palette?: OxyPalette
}

/** Represents a categorized color axis. */
export class CategoryColorAxis extends CategoryAxis implements IColorAxis {
  /** The invalid category color. */
  public invalidCategoryColor: OxyColor = OxyColors.Undefined

  /** The palette. */
  public palette: OxyPalette

  constructor(opt?: CreateCategoryColorAxisOptions) {
    super(opt)
    this.palette = new OxyPalette()
    if (opt) {
      Object.assign(this, opt)
    }
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
    if (this.position === AxisPosition.None) {
      return
    }

    if (pass === 0) {
      let left = this.plotModel.plotArea.left
      let top = this.plotModel.plotArea.top
      const width = this.majorTickSize - 2
      const height = this.majorTickSize - 2

      switch (this.position) {
        case AxisPosition.Left:
          left = this.plotModel.plotArea.left - this.positionTierMinShift - width
          top = this.plotModel.plotArea.top
          break
        case AxisPosition.Right:
          left = this.plotModel.plotArea.right + this.positionTierMinShift
          top = this.plotModel.plotArea.top
          break
        case AxisPosition.Top:
          left = this.plotModel.plotArea.left
          top = this.plotModel.plotArea.top - this.positionTierMinShift - height
          break
        case AxisPosition.Bottom:
          left = this.plotModel.plotArea.left
          top = this.plotModel.plotArea.bottom + this.positionTierMinShift
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
      const { majorLabelValues } = this.getTickValues()

      const n = this.palette.colors.length
      for (let i = 0; i < n; i++) {
        const low = this.transform(this.getLowValue(i, majorLabelValues))
        const high = this.transform(this.getHighValue(i, majorLabelValues))
        await drawColorRect(low, high, this.palette.colors[i])
      }
    }

    await super.render(rc, pass)
  }

  /** Gets the high value. */
  private getHighValue(paletteIndex: number, majorLabelValues: number[]): number {
    const highValue =
      paletteIndex >= this.palette.colors.length - 1
        ? this.clipMaximum
        : (majorLabelValues[paletteIndex] + majorLabelValues[paletteIndex + 1]) / 2
    return highValue
  }

  /** Gets the low value. */
  private getLowValue(paletteIndex: number, majorLabelValues: number[]): number {
    const lowValue =
      paletteIndex === 0 ? this.clipMinimum : (majorLabelValues[paletteIndex - 1] + majorLabelValues[paletteIndex]) / 2
    return lowValue
  }
}
