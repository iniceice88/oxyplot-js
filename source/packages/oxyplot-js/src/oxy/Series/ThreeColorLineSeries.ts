import {
  type CreateLineSeriesOptions,
  ExtendedDefaultLineSeriesOptions,
  type IRenderContext,
  LineSeries,
  LineStyle,
  LineStyleHelper,
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

export interface CrateThreeColorLineSeriesOptions extends CreateLineSeriesOptions {
  colorLo?: OxyColor
  colorHi?: OxyColor
  limitLo?: number
  limitHi?: number
  dashesLo?: number[]
  dashesHi?: number[]
  lineStyleLo?: LineStyle
  lineStyleHi?: LineStyle
}

const DefaultThreeColorLineSeriesOptions: CrateThreeColorLineSeriesOptions = {
  colorLo: OxyColorHelper.fromRgb(0, 0, 255), // Blue
  colorHi: OxyColorHelper.fromRgb(255, 0, 0), // Red
  limitLo: -5.0,
  limitHi: 5.0,
  lineStyleLo: LineStyle.Solid,
  lineStyleHi: LineStyle.Solid,

  dashesLo: undefined,
  dashesHi: undefined,
}

export const ExtendedDefaultThreeColorLineSeriesOptions = {
  ...ExtendedDefaultLineSeriesOptions,
  ...DefaultThreeColorLineSeriesOptions,
}

/**
 * Represents a three-color line series.
 */
export class ThreeColorLineSeries extends LineSeries {
  /**
   * The default low color.
   */
  private defaultColorLo: OxyColor = OxyColors.Undefined

  /**
   * The default hi color.
   */
  private defaultColorHi: OxyColor = OxyColors.Undefined

  /**
   * Initializes a new instance of the ThreeColorLineSeries class.
   */
  constructor(opt?: CrateThreeColorLineSeriesOptions) {
    super(opt)
    assignObject(this, DefaultThreeColorLineSeriesOptions, opt)
  }

  getElementName() {
    return 'ThreeColorLineSeries'
  }

  /**
   * Gets or sets the color for the part of the line that is below the limit.
   */
  colorLo: OxyColor = DefaultThreeColorLineSeriesOptions.colorLo!

  /**
   * Gets or sets the color for the part of the line that is above the limit.
   */
  colorHi: OxyColor = DefaultThreeColorLineSeriesOptions.colorHi!

  /**
   * Gets the actual low color.
   */
  get actualColorLo(): OxyColor {
    return OxyColorHelper.getActualColor(this.colorLo, this.defaultColorLo)
  }

  /**
   * Gets the actual hi color.
   */
  get actualColorHi(): OxyColor {
    return OxyColorHelper.getActualColor(this.colorHi, this.defaultColorHi)
  }

  /**
   * Gets or sets the high limit.
   */
  limitHi: number = DefaultThreeColorLineSeriesOptions.limitHi!

  /**
   * Gets or sets the low limit.
   */
  limitLo: number = DefaultThreeColorLineSeriesOptions.limitLo!

  /**
   * Gets or sets the dash array for the rendered line that is above the limit (overrides LineStyle).
   */
  dashesHi?: number[]

  /**
   * Gets or sets the dash array for the rendered line that is below the limit (overrides LineStyle).
   */
  dashesLo?: number[]

  /**
   * Gets or sets the line style for the part of the line that is above the limit.
   */
  lineStyleHi: LineStyle = DefaultThreeColorLineSeriesOptions.lineStyleHi!

  /**
   * Gets or sets the line style for the part of the line that is below the limit.
   */
  lineStyleLo: LineStyle = DefaultThreeColorLineSeriesOptions.lineStyleLo!

  /**
   * Gets the actual line style for the part of the line that is above the limit.
   */
  get actualLineStyleHi(): LineStyle {
    return this.lineStyleHi !== LineStyle.Automatic ? this.lineStyleHi : LineStyle.Solid
  }

  /**
   * Gets the actual line style for the part of the line that is below the limit.
   */
  get actualLineStyleLo(): LineStyle {
    return this.lineStyleLo !== LineStyle.Automatic ? this.lineStyleLo : LineStyle.Solid
  }

  /**
   * Gets the actual dash array for the line that is above the limit.
   */
  get actualDashArrayHi(): number[] | undefined {
    return this.dashesHi ?? LineStyleHelper.getDashArray(this.actualLineStyleHi)
  }

  /**
   * Gets the actual dash array for the line that is below the limit.
   */
  get actualDashArrayLo(): number[] | undefined {
    return this.dashesLo ?? LineStyleHelper.getDashArray(this.actualLineStyleLo)
  }

  /**
   * Sets the default values.
   * @internal
   */
  setDefaultValues(): void {
    super.setDefaultValues()

    if (OxyColorHelper.isAutomatic(this.colorLo)) {
      this.defaultColorLo = this.plotModel.getDefaultColor()
    }

    if (this.lineStyleLo === LineStyle.Automatic) {
      this.lineStyleLo = this.plotModel.getDefaultLineStyle()
    }

    if (OxyColorHelper.isAutomatic(this.colorHi)) {
      this.defaultColorHi = this.plotModel.getDefaultColor()
    }

    if (this.lineStyleHi === LineStyle.Automatic) {
      this.lineStyleHi = this.plotModel.getDefaultLineStyle()
    }
  }

  /**
   * Renders the line.
   * @param rc The render context.
   * @param pointsToRender The points to render.
   */
  protected async renderLine(rc: IRenderContext, pointsToRender: ScreenPoint[]): Promise<void> {
    const clippingRect = this.getClippingRect()
    const p1 = this.inverseTransform(OxyRectHelper.bottomLeft(clippingRect))
    const p2 = this.inverseTransform(OxyRectHelper.topRight(clippingRect))

    const transform = PlotElementExtensions.transform

    let sp1 = transform(this, p1.x, Math.min(p1.y, p2.y))
    let sp2 = transform(this, p2.x, this.limitLo)
    const clippingRectLo = OxyRectEx.fromScreenPoints(sp1, sp2).clip(clippingRect).rect

    sp1 = transform(this, p1.x, this.limitLo)
    sp2 = transform(this, p2.x, this.limitHi)
    const clippingRectMid = OxyRectEx.fromScreenPoints(sp1, sp2).clip(clippingRect).rect

    sp1 = transform(this, p1.x, Math.max(p1.y, p2.y))
    sp2 = transform(this, p2.x, this.limitHi)
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

    let autoResetClipDisp = RenderingExtensions.autoResetClip(rc, clippingRectMid)
    await renderLine(this.actualColor)
    autoResetClipDisp.dispose()

    autoResetClipDisp = RenderingExtensions.autoResetClip(rc, clippingRectLo)
    await renderLine(this.actualColorLo)
    autoResetClipDisp.dispose()

    autoResetClipDisp = RenderingExtensions.autoResetClip(rc, clippingRectHi)
    await renderLine(this.actualColorHi)
    autoResetClipDisp.dispose()
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultThreeColorLineSeriesOptions
  }
}
