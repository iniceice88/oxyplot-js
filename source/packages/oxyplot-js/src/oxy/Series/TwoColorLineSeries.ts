import {
  type CreateLineSeriesOptions,
  type IRenderContext,
  LineSeries,
  LineStyle,
  OxyColor,
  OxyColors,
  OxyRect,
  PlotElementExtensions,
  RenderingExtensions,
  ScreenPoint,
} from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface CreateTwoColorLineSeriesOptions extends CreateLineSeriesOptions {
  color2?: OxyColor
  limit?: number
}

/**
 * Represents a two-color line series.
 */
export class TwoColorLineSeries extends LineSeries {
  /**
   * The default second color.
   */
  private defaultColor2: OxyColor = OxyColors.Undefined

  /**
   * Initializes a new instance of the TwoColorLineSeries class.
   */
  constructor(opt?: CreateTwoColorLineSeriesOptions) {
    super(opt)
    this.limit = 0.0
    this.color2 = OxyColor.fromRgb(0, 0, 255) // Blue

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * Gets or sets the color for the part of the line that is below the limit.
   */
  color2: OxyColor

  /**
   * Gets the actual second color.
   */
  get actualColor2(): OxyColor {
    return this.color2.getActualColor(this.defaultColor2)
  }

  /**
   * Gets or sets the limit.
   */
  limit: number

  /**
   * Sets the default values.
   * @internal
   */
  setDefaultValues(): void {
    super.setDefaultValues()

    if (this.color2.isAutomatic()) {
      this.defaultColor2 = this.plotModel.getDefaultColor()
    }
  }

  /**
   * Renders the line.
   * @param rc The render context.
   * @param pointsToRender The points to render.
   */
  protected async renderLine(rc: IRenderContext, pointsToRender: ScreenPoint[]): Promise<void> {
    const clippingRect = this.getClippingRect()
    const dp1 = this.inverseTransform(clippingRect.bottomLeft)
    const dp2 = this.inverseTransform(clippingRect.topRight)

    const transform = PlotElementExtensions.transform
    let sp1 = transform(this, dp1.x, Math.min(dp1.y, dp2.y))
    const sp2 = transform(this, dp2.x, this.limit)
    const clippingRectLo = OxyRect.fromScreenPoints(sp1, sp2).clip(clippingRect)

    sp1 = transform(this, dp1.x, Math.max(dp1.y, dp2.y))
    const clippingRectHi = OxyRect.fromScreenPoints(sp1, sp2).clip(clippingRect)

    if (this.strokeThickness <= 0 || this.actualLineStyle === LineStyle.None) {
      return
    }

    const renderLine = async (color: OxyColor) => {
      await RenderingExtensions.drawReducedLine(
        rc,
        pointsToRender,
        this.minimumSegmentLength * this.minimumSegmentLength,
        this.getSelectableColor(color),
        this.strokeThickness,
        this.edgeRenderingMode,
        this.actualDashArray,
        this.lineJoin,
      )
    }

    let autoResetClipDisp = RenderingExtensions.autoResetClip(rc, clippingRectLo)
    await renderLine(this.actualColor2)
    autoResetClipDisp.dispose()

    autoResetClipDisp = RenderingExtensions.autoResetClip(rc, clippingRectHi)
    await renderLine(this.actualColor)
    autoResetClipDisp.dispose()
  }
}
