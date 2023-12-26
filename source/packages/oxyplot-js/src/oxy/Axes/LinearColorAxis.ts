import {
  AxisPosition,
  type CreateLinearAxisOptions,
  type IColorAxis,
  ImageFormat,
  type IRenderContext,
  LinearAxis,
  OxyColor,
  OxyColors,
  OxyImage,
  OxyPalette,
  OxyPalettes,
  OxyRect,
  RenderingExtensions,
} from '@/oxyplot'
import { assertInteger, Number_MIN_VALUE, removeUndef, TwoDimensionalArray } from '@/patch'

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
export class LinearColorAxis extends LinearAxis implements IColorAxis {
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

  /** Gets the colors. */
  getColors(): OxyColor[] {
    return [this.lowColor, ...this.palette.colors, this.highColor]
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

  /** Renders the axis on the specified render context. */
  public async render(rc: IRenderContext, pass: number): Promise<void> {
    if (this.position === AxisPosition.None) {
      return
    }

    if (this.palette === undefined) {
      throw new Error('No Palette defined for color axis.')
    }

    if (pass === 0) {
      const distance = this.axisDistance
      let left = this.plotModel.plotArea.left
      let top = this.plotModel.plotArea.top
      const width = this.majorTickSize - 2
      const height = this.majorTickSize - 2

      switch (this.position) {
        case AxisPosition.Left:
          left = this.plotModel.plotArea.left - this.positionTierMinShift - width - distance
          top = this.plotModel.plotArea.top
          break
        case AxisPosition.Right:
          left = this.plotModel.plotArea.right + this.positionTierMinShift + distance
          top = this.plotModel.plotArea.top
          break
        case AxisPosition.Top:
          left = this.plotModel.plotArea.left
          top = this.plotModel.plotArea.top - this.positionTierMinShift - height - distance
          break
        case AxisPosition.Bottom:
          left = this.plotModel.plotArea.left
          top = this.plotModel.plotArea.bottom + this.positionTierMinShift + distance
          break
      }

      if (this.renderAsImage) {
        const axisLength = this.transform(this.clipMaximum) - this.transform(this.clipMinimum)
        const reverse = axisLength > 0
        const absoluteAxisLength = Math.abs(axisLength)

        if (this.isHorizontal()) {
          const colorAxisImage = await this.generateColorAxisImage(reverse)
          await RenderingExtensions.drawImage(rc, colorAxisImage, left, top, absoluteAxisLength, height, 1, true)
        } else {
          const colorAxisImage = await this.generateColorAxisImage(reverse)
          await RenderingExtensions.drawImage(rc, colorAxisImage, left, top, width, absoluteAxisLength, 1, true)
        }
      } else {
        const drawColorRect = async (ylow: number, yhigh: number, color: OxyColor) => {
          const ymin = Math.min(ylow, yhigh)
          const ymax = Math.max(ylow, yhigh) + 0.5
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

        const n = this.palette.colors.length
        for (let i = 0; i < n; i++) {
          const ylow = this.transform(this.getLowValue(i))
          const yhigh = this.transform(this.getHighValue(i))
          await drawColorRect(ylow, yhigh, this.palette.colors[i])
        }

        let highLowLength = 10
        if (this.isHorizontal()) {
          highLowLength *= -1
        }

        if (!this.lowColor.isUndefined()) {
          const ylow = this.transform(this.clipMinimum)
          await drawColorRect(ylow, ylow + highLowLength, this.lowColor)
        }

        if (!this.highColor.isUndefined()) {
          const yhigh = this.transform(this.clipMaximum)
          await drawColorRect(yhigh, yhigh - highLowLength, this.highColor)
        }
      }
    }

    await super.render(rc, pass)
  }

  /** Gets the high value of the specified palette index. */
  protected getHighValue(paletteIndex: number): number {
    return this.getLowValue(paletteIndex + 1)
  }

  /** Gets the low value of the specified palette index. */
  protected getLowValue(paletteIndex: number): number {
    return (paletteIndex / this.palette.colors.length) * (this.clipMaximum - this.clipMinimum) + this.clipMinimum
  }

  /**
   * Generates the image used to render the color axis.
   * @param reverse Reverse the colors if true.
   * @returns An OxyImage used to render the color axis.
   */
  private generateColorAxisImage(reverse: boolean): Promise<OxyImage> {
    const n = this.palette.colors.length
    const col = this.isHorizontal() ? n : 1
    const row = this.isHorizontal() ? 1 : n
    const buffer = new TwoDimensionalArray<OxyColor>(col, row)
    for (let i = 0; i < n; i++) {
      const color = this.palette.colors[i]
      const i2 = reverse ? n - 1 - i : i
      if (this.isHorizontal()) {
        buffer.set(i2, 0, color)
      } else {
        buffer.set(0, i2, color)
      }
    }

    return OxyImage.create(buffer, ImageFormat.Png)
  }
}
