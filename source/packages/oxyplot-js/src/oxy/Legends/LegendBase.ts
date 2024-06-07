import {
  type CreatePlotElementOptions,
  ExtendedDefaultPlotElementOptions,
  type HitTestArguments,
  type HitTestResult,
  HorizontalAlignment,
  type IRenderContext,
  type OxyColor,
  OxyColors,
  type OxyRect,
  OxyRect_Empty,
  type OxySize,
  PlotElement,
} from '@/oxyplot'
import { assignObject } from '@/patch'
import { LegendItemOrder, LegendOrientation, LegendPlacement, LegendPosition, LegendSymbolPlacement } from './types'

export const isLeftLegend = (position: LegendPosition) => {
  return (
    position === LegendPosition.LeftTop ||
    position === LegendPosition.LeftMiddle ||
    position === LegendPosition.LeftBottom
  )
}

export const isRightLegend = (position: LegendPosition) => {
  return (
    position === LegendPosition.RightTop ||
    position === LegendPosition.RightMiddle ||
    position === LegendPosition.RightBottom
  )
}

export const isTopLegend = (position: LegendPosition) => {
  return (
    position === LegendPosition.TopLeft || position === LegendPosition.TopCenter || position === LegendPosition.TopRight
  )
}

export const isBottomLegend = (position: LegendPosition) => {
  return (
    position === LegendPosition.BottomLeft ||
    position === LegendPosition.BottomCenter ||
    position === LegendPosition.BottomRight
  )
}

export interface CreateLegendBaseOptions extends CreatePlotElementOptions {
  key?: string
  isLegendVisible?: boolean
  legendOrientation?: LegendOrientation
  legendPadding?: number
  legendSymbolLength?: number
  legendSymbolMargin?: number
  legendSymbolPlacement?: LegendSymbolPlacement
  legendTitle?: string
  legendTitleColor?: OxyColor
  legendTitleFont?: string
  legendTitleFontSize?: number
  legendTitleFontWeight?: number
  legendBackground?: OxyColor
  legendBorder?: OxyColor
  legendBorderThickness?: number
  legendColumnSpacing?: number
  legendFont?: string
  legendFontSize?: number
  legendTextColor?: OxyColor
  legendFontWeight?: number
  legendItemAlignment?: HorizontalAlignment
  legendItemOrder?: LegendItemOrder
  legendItemSpacing?: number
  legendLineSpacing?: number
  legendMargin?: number
  legendMaxWidth?: number
  legendMaxHeight?: number
  legendPlacement?: LegendPlacement
  legendPosition?: LegendPosition
  allowUseFullExtent?: boolean
  showInvisibleSeries?: boolean
}

const DefaultLegendBaseOptions: CreateLegendBaseOptions = {
  isLegendVisible: false,
  legendOrientation: LegendOrientation.Horizontal,
  legendPadding: 0,
  legendSymbolLength: 0,
  legendSymbolMargin: 0,
  legendSymbolPlacement: LegendSymbolPlacement.Left,
  legendTitleColor: OxyColors.Undefined,
  legendTitleFontSize: 0,
  legendTitleFontWeight: 0,
  legendBackground: OxyColors.Undefined,
  legendBorder: OxyColors.Undefined,
  legendBorderThickness: 0,
  legendColumnSpacing: 0,
  legendFontSize: 0,
  legendFontWeight: 0,
  legendItemAlignment: HorizontalAlignment.Left,
  legendItemOrder: LegendItemOrder.Normal,
  legendItemSpacing: 0,
  legendLineSpacing: 0,
  legendMargin: 0,
  legendMaxWidth: 0,
  legendMaxHeight: 0,
  legendPlacement: LegendPlacement.Inside,
  legendPosition: LegendPosition.TopLeft,
  allowUseFullExtent: false,
  showInvisibleSeries: false,

  key: undefined,
  legendTitle: undefined,
  legendTitleFont: undefined,
  legendFont: undefined,
  legendTextColor: undefined,
} as const

export const ExtendedDefaultLegendBaseOptions = {
  ...ExtendedDefaultPlotElementOptions,
  ...DefaultLegendBaseOptions,
}

/**
 * The abstract Legend class.
 */
export abstract class LegendBase extends PlotElement {
  protected constructor(opt?: CreateLegendBaseOptions) {
    super(opt)
    assignObject(this, DefaultLegendBaseOptions, opt)
  }

  /**
   * Override for legend hit test.
   * @param args - Arguments passed to the hit test.
   * @returns The hit test results.
   */
  protected hitTestOverride(args: HitTestArguments): HitTestResult | undefined {
    return this.legendHitTest(args)
  }

  /**
   * Defines the legend hit test behavior.
   * @param args - The hit test arguments.
   * @returns The hit test result.
   */
  protected abstract legendHitTest(args: HitTestArguments): HitTestResult | undefined

  /**
   * Gets or sets a key to identify this legend. The default is `null`.
   * The key is used to identify which series to show in the legends by comparing with the Series.LegendKey property.
   */
  public key?: string

  /**
   * Gets or sets a value indicating whether the legend is visible. The titles of the series must be set to use the legend.
   */
  public isLegendVisible: boolean = DefaultLegendBaseOptions.isLegendVisible!

  /**
   * Gets or sets the legend orientation.
   * Horizontal orientation is reverted to Vertical if Legend is positioned Left or Right of the plot.
   */
  public legendOrientation: LegendOrientation = DefaultLegendBaseOptions.legendOrientation!

  /**
   * Gets or sets the legend padding.
   */
  public legendPadding: number = DefaultLegendBaseOptions.legendPadding!

  /**
   * Gets or sets the length of the legend symbols (the default value is 16).
   */
  public legendSymbolLength: number = DefaultLegendBaseOptions.legendSymbolLength!

  /**
   * Gets or sets the legend symbol margins (distance between the symbol and the text).
   */
  public legendSymbolMargin: number = DefaultLegendBaseOptions.legendSymbolMargin!

  /**
   * Gets or sets the legend symbol placement.
   */
  public legendSymbolPlacement: LegendSymbolPlacement = DefaultLegendBaseOptions.legendSymbolPlacement!

  /**
   * Gets or sets the legend title.
   */
  public legendTitle?: string

  /**
   * Gets or sets the color of the legend title.
   * If this value is `null`, the TextColor will be used.
   */
  public legendTitleColor: OxyColor = DefaultLegendBaseOptions.legendTitleColor!

  /**
   * Gets or sets the legend title font.
   */
  public legendTitleFont?: string

  /**
   * Gets or sets the size of the legend title font.
   */
  public legendTitleFontSize: number = DefaultLegendBaseOptions.legendTitleFontSize!

  /**
   * Gets or sets the legend title font weight.
   */
  public legendTitleFontWeight: number = DefaultLegendBaseOptions.legendTitleFontWeight!

  /**
   * Gets the legend area.
   */
  public legendArea: OxyRect = OxyRect_Empty

  /**
   * Gets or sets the size of the legend.
   */
  public legendSize: OxySize = OxyRect_Empty

  /**
   * Gets or sets the background color of the legend. Use `null` for no background.
   */
  public legendBackground: OxyColor = DefaultLegendBaseOptions.legendBackground!

  /**
   * Gets or sets the border color of the legend.
   */
  public legendBorder: OxyColor = DefaultLegendBaseOptions.legendBorder!

  /**
   * Gets or sets the thickness of the legend border. Use 0 for no border.
   */
  public legendBorderThickness: number = DefaultLegendBaseOptions.legendBorderThickness!

  /**
   * Gets or sets the spacing between columns of legend items (only for vertical orientation).
   */
  public legendColumnSpacing: number = DefaultLegendBaseOptions.legendColumnSpacing!

  /**
   * Gets or sets the legend font.
   */
  public legendFont?: string

  /**
   * Gets or sets the size of the legend font.
   */
  public legendFontSize: number = DefaultLegendBaseOptions.legendFontSize!

  /**
   * Gets or sets the color of the legend text.
   * If this value is `null`, the TextColor will be used.
   */
  public legendTextColor?: OxyColor

  /**
   * Gets or sets the legend font weight.
   */
  public legendFontWeight: number = DefaultLegendBaseOptions.legendFontWeight!

  /**
   * Gets or sets the legend item alignment.
   */
  public legendItemAlignment: HorizontalAlignment = DefaultLegendBaseOptions.legendItemAlignment!

  /**
   * Gets or sets the legend item order.
   */
  public legendItemOrder: LegendItemOrder = DefaultLegendBaseOptions.legendItemOrder!

  /**
   * Gets or sets the horizontal spacing between legend items when the orientation is horizontal.
   */
  public legendItemSpacing: number = DefaultLegendBaseOptions.legendItemSpacing!

  /**
   * Gets or sets the vertical spacing between legend items.
   */
  public legendLineSpacing: number = DefaultLegendBaseOptions.legendLineSpacing!

  /**
   * Gets or sets the legend margin.
   */
  public legendMargin: number = DefaultLegendBaseOptions.legendMargin!

  /**
   * Gets or sets the max width of the legend.
   */
  public legendMaxWidth: number = DefaultLegendBaseOptions.legendMaxWidth!

  /**
   * Gets or sets the max height of the legend.
   */
  public legendMaxHeight: number = DefaultLegendBaseOptions.legendMaxHeight!

  /**
   * Gets or sets the legend placement.
   */
  public legendPlacement: LegendPlacement = DefaultLegendBaseOptions.legendPlacement!

  /**
   * Gets or sets the legend position.
   */
  public legendPosition: LegendPosition = DefaultLegendBaseOptions.legendPosition!

  /**
   * Gets or sets a value indicating whether the legend should use the full extend of the plot when LegendPlacement equals LegendPlacement.Outside.
   */
  public allowUseFullExtent: boolean = DefaultLegendBaseOptions.allowUseFullExtent!

  /**
   * Gets or sets a value indicating whether the legend should show invisible series. The default is true.
   * Invisible series will appear in the listening, but will be grayed out.
   */
  public showInvisibleSeries: boolean = DefaultLegendBaseOptions.showInvisibleSeries!

  /**
   * Makes the LegendOrientation property safe.
   * If Legend is positioned left or right, force it to vertical orientation
   */
  public abstract ensureLegendProperties(): void

  /**
   * Measures the legend area and gets the legend size.
   * @param rc The rendering context.
   * @param availableLegendArea The area available to legend.
   */
  public abstract getLegendSize(rc: IRenderContext, availableLegendArea: OxySize): Promise<OxySize>

  /**
   * Gets the rectangle of the legend box.
   * @param legendSize Size of the legend box.
   * @returns The legend area rectangle.
   */
  public abstract getLegendRectangle(legendSize: OxySize): OxyRect

  /**
   * Renders or measures the legends.
   * @param rc The render context.
   */
  public abstract renderLegends(rc: IRenderContext): Promise<void>
}
