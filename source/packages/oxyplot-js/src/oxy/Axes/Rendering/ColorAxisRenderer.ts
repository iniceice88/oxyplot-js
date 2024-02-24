import type { IColorAxis, IRenderContext } from '@/oxyplot'
import {
  Axis,
  AxisPosition,
  HorizontalAndVerticalAxisRenderer,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotModel,
} from '@/oxyplot'

/**
 * Provides functionality to render color axes.
 */
export abstract class ColorAxisRenderer<T extends Axis & IColorAxis> extends HorizontalAndVerticalAxisRenderer {
  /**
   * Position of the left edge of the color block.
   */
  protected left: number = 0

  /**
   * Position of the top edge of the color block.
   */
  protected top: number = 0

  /**
   * 'Size' of the color block; this is the width for vertical axes, or the height for horizontal axes.
   */
  protected size: number = 0

  /**
   * Screen position of the minimum value of the axis.
   */
  protected minScreenPosition: number = 0

  /**
   * Screen position of the maximum value of the axis.
   */
  protected maxScreenPosition: number = 0

  /**
   * Initializes a new instance of the ColorAxisRenderer class.
   */
  protected constructor(rc: IRenderContext, plot: PlotModel) {
    super(rc, plot)
  }

  /**
   * Initializes fields containing information about position and size of the color axis on screen.
   */
  protected initPosition(axis: T): void {
    this.size = axis.majorTickSize - 2
    const distance = axis.axisDistance
    this.minScreenPosition = axis.transform(axis.clipMinimum)
    this.maxScreenPosition = axis.transform(axis.clipMaximum)

    switch (axis.position) {
      case AxisPosition.Left:
        this.left = axis.plotModel.plotArea.left - axis.positionTierMinShift - this.size - distance
        this.top = axis.plotModel.plotArea.top
        break
      case AxisPosition.Right:
        this.left = axis.plotModel.plotArea.right + axis.positionTierMinShift + distance
        this.top = axis.plotModel.plotArea.top
        break
      case AxisPosition.Top:
        this.left = axis.plotModel.plotArea.left
        this.top = axis.plotModel.plotArea.top - axis.positionTierMinShift - this.size - distance
        break
      case AxisPosition.Bottom:
        this.left = axis.plotModel.plotArea.left
        this.top = axis.plotModel.plotArea.bottom + axis.positionTierMinShift + distance
        break
    }
  }

  public async render(axis: T, pass: number) {
    if (![AxisPosition.Left, AxisPosition.Right, AxisPosition.Top, AxisPosition.Bottom].includes(axis.position)) {
      return
    }

    if (pass === 0) {
      this.initPosition(axis)
      await this.renderColorBlock(axis)
    }

    await super.render(axis, pass)
  }

  /**
   * Renders the color block.
   */
  protected abstract renderColorBlock(axis: T): Promise<void>

  /**
   * Draws a single colored rectangle at the provided screen position.
   */
  protected async drawColorRect(axis: T, yLow: number, yHigh: number, color: OxyColor) {
    const yMin = Math.min(yLow, yHigh)
    const yMax = Math.max(yLow, yHigh) + 0.5
    const rect = axis.isHorizontal()
      ? new OxyRect(yMin, this.top, yMax - yMin, this.size)
      : new OxyRect(this.left, yMin, this.size, yMax - yMin)

    await this.renderContext.drawRectangle(rect, color, OxyColors.Undefined, 0, axis.edgeRenderingMode)
  }
}
