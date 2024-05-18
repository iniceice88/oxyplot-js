import {
  Axis,
  ColorAxisExtensions,
  ColorAxisRenderer,
  ImageFormat,
  type INumericColorAxis,
  type IRenderContext,
  OxyColorHelper,
  OxyColors,
  type OxyImage,
  OxyImageEx,
  PlotModel,
  RenderingExtensions,
} from '@/oxyplot'
import { TwoDimensionalArray } from '@/patch'

/**
 * Provides functionality to render numeric color axes.
 */
export class NumericColorAxisRenderer<T extends Axis & INumericColorAxis> extends ColorAxisRenderer<T> {
  /**
   * Initializes a new instance of the NumericColorAxisRenderer class.
   */
  public constructor(rc: IRenderContext, plot: PlotModel) {
    super(rc, plot)
  }

  /**
   * Renders the color block.
   */
  protected async renderColorBlock(axis: T) {
    if (!axis.palette) {
      throw new Error('No Palette defined for color axis.')
    }

    if (axis.renderAsImage) {
      const axisLength = axis.transform(axis.clipMaximum) - axis.transform(axis.clipMinimum)
      const reverse = axisLength < 0
      const absoluteAxisLength = Math.abs(axisLength)

      if (axis.isHorizontal()) {
        const colorAxisImage = await this.generateColorAxisImage(axis, reverse)
        await RenderingExtensions.drawImage(
          this.renderContext,
          colorAxisImage,
          this.left,
          this.top,
          absoluteAxisLength,
          this.size,
          1,
          true,
        )
      } else {
        const colorAxisImage = await this.generateColorAxisImage(axis, reverse)
        await RenderingExtensions.drawImage(
          this.renderContext,
          colorAxisImage,
          this.left,
          this.top,
          this.size,
          absoluteAxisLength,
          1,
          true,
        )
      }
    } else {
      for (let i = 0; i < axis.palette.colors.length; i++) {
        const yLow = this.transform(axis, ColorAxisExtensions.getLowValue(axis, i))
        const yHigh = this.transform(axis, ColorAxisExtensions.getHighValue(axis, i))
        await this.drawColorRect(axis, yLow, yHigh, axis.palette.colors[i])
      }

      let highLowLength = 10
      if (axis.isHorizontal()) {
        highLowLength *= -1
      }

      if (!OxyColorHelper.isUndefined(axis.lowColor)) {
        await this.drawColorRect(axis, this.minScreenPosition, this.minScreenPosition + highLowLength, axis.lowColor)
      }

      if (!OxyColorHelper.isUndefined(axis.highColor)) {
        await this.drawColorRect(axis, this.maxScreenPosition, this.maxScreenPosition - highLowLength, axis.highColor)
      }
    }
  }

  /**
   * Generates the image used to render the color axis.
   */
  private async generateColorAxisImage(axis: T, reverse: boolean): Promise<OxyImage> {
    const n = axis.palette.colors.length
    const buffer = axis.isHorizontal()
      ? new TwoDimensionalArray(n, 1, OxyColors.Undefined)
      : new TwoDimensionalArray(1, n, OxyColors.Undefined)

    for (let i = 0; i < n; i++) {
      const color = axis.palette.colors[i]
      const i2 = reverse ? n - 1 - i : i
      if (axis.isHorizontal()) {
        buffer.set(i2, 0, color)
      } else {
        buffer.set(0, i2, color)
      }
    }

    return OxyImageEx.create(buffer, ImageFormat.Png)
  }

  /**
   * Transforms a value to a screen position. We don't use the regular Transform functions of the axis here, as the color block should always be drawn with linear scaling.
   */
  private transform(axis: T, value: number): number {
    return this.linearInterpolation(
      axis.clipMinimum,
      this.minScreenPosition,
      axis.clipMaximum,
      this.maxScreenPosition,
      value,
    )
  }

  /**
   * Helper function for linear interpolation.
   */
  private linearInterpolation(x1: number, y1: number, x2: number, y2: number, x: number): number {
    return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1)
  }
}
