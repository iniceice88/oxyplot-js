import {
  type CreateLineSeriesOptions,
  ExtendedDefaultLineSeriesOptions,
  type IRenderContext,
  LineSeries,
  LineStyle,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  OxyRectEx,
  OxyRectHelper,
  PlotElementExtensions,
  RenderingExtensions,
  type ScreenPoint,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateTwoColorLineSeriesOptions extends CreateLineSeriesOptions {
  color2?: OxyColor
  limit?: number
}

export const DefaultTwoColorLineSeriesOptions: CreateTwoColorLineSeriesOptions = {
  color2: OxyColorHelper.fromRgb(0, 0, 255), // Blue
  limit: 0.0,
}

export const ExtendedDefaultTwoColorLineSeriesOptions = {
  ...ExtendedDefaultLineSeriesOptions,
  ...DefaultTwoColorLineSeriesOptions,
}

/**
 * Represents a two-color line series.
 */
export class TwoColorLineSeries extends LineSeries {
  /**
   * The default second color.
   */
  private _defaultColor2: OxyColor = OxyColors.Undefined

  /**
   * Initializes a new instance of the TwoColorLineSeries class.
   */
  constructor(opt?: CreateTwoColorLineSeriesOptions) {
    super(opt)
    assignObject(this, DefaultTwoColorLineSeriesOptions, opt)
  }

  getElementName() {
    return 'TwoColorLineSeries'
  }

  /**
   * Gets or sets the color for the part of the line that is below the limit.
   */
  color2: OxyColor = DefaultTwoColorLineSeriesOptions.color2!

  /**
   * Gets the actual second color.
   */
  get actualColor2(): OxyColor {
    return OxyColorHelper.getActualColor(this.color2, this._defaultColor2)
  }

  /**
   * Gets or sets the limit.
   */
  limit: number = DefaultTwoColorLineSeriesOptions.limit!

  /**
   * Sets the default values.
   * @internal
   */
  setDefaultValues(): void {
    super.setDefaultValues()

    if (OxyColorHelper.isAutomatic(this.color2)) {
      this._defaultColor2 = this.plotModel.getDefaultColor()
    }
  }

  /**
   * Renders the line.
   * @param rc The render context.
   * @param pointsToRender The points to render.
   */
  protected async renderLine(rc: IRenderContext, pointsToRender: ScreenPoint[]): Promise<void> {
    const clippingRect = this.getClippingRect()
    const dp1 = this.inverseTransform(OxyRectHelper.bottomLeft(clippingRect))
    const dp2 = this.inverseTransform(OxyRectHelper.topRight(clippingRect))

    const transform = PlotElementExtensions.transform
    let sp1 = transform(this, dp1.x, Math.min(dp1.y, dp2.y))
    const sp2 = transform(this, dp2.x, this.limit)
    const clippingRectLo = OxyRectEx.fromScreenPoints(sp1, sp2).clip(clippingRect).rect

    sp1 = transform(this, dp1.x, Math.max(dp1.y, dp2.y))
    const clippingRectHi = OxyRectEx.fromScreenPoints(sp1, sp2).clip(clippingRect).rect

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

  protected getElementDefaultValues(): any {
    return ExtendedDefaultTwoColorLineSeriesOptions
  }
}
