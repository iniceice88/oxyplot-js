import type { IRenderContext } from '@/oxyplot'
import { CategoryColorAxis, ColorAxisRenderer, PlotModel } from '@/oxyplot'

/**
 * Provides functionality to render category color axes.
 */
export class CategoryColorAxisRenderer extends ColorAxisRenderer<CategoryColorAxis> {
  /**
   * Initializes a new instance of the CategoryColorAxisRenderer class.
   */
  public constructor(rc: IRenderContext, plot: PlotModel) {
    super(rc, plot)
  }

  /**
   * Renders the color block.
   */
  protected async renderColorBlock(axis: CategoryColorAxis) {
    const { majorLabelValues } = axis.getTickValues()

    for (let i = 0; i < axis.palette.colors.length; i++) {
      const low = axis.transform(axis.getLowValue(i, majorLabelValues))
      const high = axis.transform(axis.getHighValue(i, majorLabelValues))
      await this.drawColorRect(axis, low, high, axis.palette.colors[i])
    }
  }
}
