import type { CreateAngleAxisOptions, IRenderContext } from '@/oxyplot'
import { AngleAxis, AngleAxisFullPlotAreaRenderer } from '@/oxyplot'

/**
 * Represents an angular axis that covers the whole plot area.
 */
export class AngleAxisFullPlotArea extends AngleAxis {
  constructor(opt?: CreateAngleAxisOptions) {
    super(opt)
  }

  /**
   * Renders the axis on the specified render context.
   */
  async render(rc: IRenderContext, pass: number): Promise<void> {
    const r = new AngleAxisFullPlotAreaRenderer(rc, this.plotModel)
    await r.render(this, pass)
  }

  getElementName() {
    return 'AngleAxisFullPlotArea'
  }
}
