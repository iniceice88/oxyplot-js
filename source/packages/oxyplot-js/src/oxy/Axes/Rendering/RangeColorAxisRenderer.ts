import type { IRenderContext } from '@/oxyplot'
import { ColorAxisRenderer, PlotModel, RangeColorAxis } from '@/oxyplot'

/**
 * Provides functionality to render range color axes.
 */
export class RangeColorAxisRenderer extends ColorAxisRenderer<RangeColorAxis> {
  /**
   * Initializes a new instance of the RangeColorAxisRenderer class.
   */
  public constructor(rc: IRenderContext, plot: PlotModel) {
    super(rc, plot)
  }

  /**
   * Renders the color block.
   */
  protected async renderColorBlock(axis: RangeColorAxis) {
    const effectiveMaxY = axis.transform(axis.isReversed ? axis.actualMinimum : axis.actualMaximum)
    const effectiveMinY = axis.transform(axis.isReversed ? axis.actualMaximum : axis.actualMinimum)

    for (const range of axis.ranges) {
      let yLow = axis.transform(range.lowerBound)
      let yHigh = axis.transform(range.upperBound)

      if (axis.isHorizontal()) {
        if (yLow < effectiveMinY) {
          yLow = effectiveMinY
        }

        if (yHigh > effectiveMaxY) {
          yHigh = effectiveMaxY
        }
      } else {
        if (yLow > effectiveMinY) {
          yLow = effectiveMinY
        }

        if (yHigh < effectiveMaxY) {
          yHigh = effectiveMaxY
        }
      }

      await this.drawColorRect(axis, yLow, yHigh, range.color)
    }

    let highLowLength = 10
    if (axis.isHorizontal()) {
      highLowLength *= -1
    }

    if (!axis.lowColor.isUndefined()) {
      const yLow = axis.transform(axis.actualMinimum)
      await this.drawColorRect(axis, yLow, yLow + highLowLength, axis.lowColor)
    }

    if (!axis.highColor.isUndefined()) {
      const yHigh = axis.transform(axis.actualMaximum)
      await this.drawColorRect(axis, yHigh, yHigh - highLowLength, axis.highColor)
    }
  }
}
