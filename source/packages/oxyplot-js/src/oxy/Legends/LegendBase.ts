import {
  type CreatePlotElementOptions,
  HitTestArguments,
  type HitTestResult,
  HorizontalAlignment,
  type IRenderContext,
  OxyColor,
  OxyColors,
  OxyRect,
  OxySize,
  PlotElement,
} from '@/oxyplot'

/**
 * Specifies the placement of the legend box.
 */
export enum LegendPlacement {
  /**
   * Place the legends inside the plot area.
   */
  Inside,

  /**
   * Place the legends outside the plot area.
   */
  Outside,
}

/**
 * Specifies the position of the legend box.
 */
export enum LegendPosition {
  /**
   * Place the legend box in the top-left corner.
   */
  TopLeft,

  /**
   * Place the legend box centered at the top.
   */
  TopCenter,

  /**
   * Place the legend box in the top-right corner.
   */
  TopRight,

  /**
   * Place the legend box in the bottom-left corner.
   */
  BottomLeft,

  /**
   * Place the legend box centered at the bottom.
   */
  BottomCenter,

  /**
   * Place the legend box in the bottom-right corner.
   */
  BottomRight,

  /**
   * Place the legend box in the left-top corner.
   */
  LeftTop,

  /**
   * Place the legend box centered at the left.
   */
  LeftMiddle,

  /**
   * Place the legend box in the left-bottom corner.
   */
  LeftBottom,

  /**
   * Place the legend box in the right-top corner.
   */
  RightTop,

  /**
   * Place the legend box centered at the right.
   */
  RightMiddle,

  /**
   * Place the legend box in the right-bottom corner.
   */
  RightBottom,
}

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

/**
 * Specifies the orientation of the items in the legend box.
 */
export enum LegendOrientation {
  /**
   * Orient the items horizontally.
   */
  Horizontal,

  /**
   * Orient the items vertically.
   */
  Vertical,
}

/**
 * Specifies the item order of the legends.
 */
export enum LegendItemOrder {
  /**
   * Render the items in the normal order.
   */
  Normal,

  /**
   * Render the items in the reverse order.
   */
  Reverse,
}

/**
 * Specifies the placement of the legend symbols.
 */
export enum LegendSymbolPlacement {
  /**
   * Render symbols to the left of the labels.
   */
  Left,

  /**
   * Render symbols to the right of the labels.
   */
  Right,
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
  legendArea?: OxyRect
  legendSize?: OxySize
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

/**
 * The abstract Legend class.
 */
export abstract class LegendBase extends PlotElement {
  protected constructor(opt?: CreateLegendBaseOptions) {
    super(opt)
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
  public isLegendVisible: boolean = false

  /**
   * Gets or sets the legend orientation.
   * Horizontal orientation is reverted to Vertical if Legend is positioned Left or Right of the plot.
   */
  public legendOrientation: LegendOrientation = LegendOrientation.Horizontal

  /**
   * Gets or sets the legend padding.
   */
  public legendPadding: number = 0

  /**
   * Gets or sets the length of the legend symbols (the default value is 16).
   */
  public legendSymbolLength: number = 0

  /**
   * Gets or sets the legend symbol margins (distance between the symbol and the text).
   */
  public legendSymbolMargin: number = 0

  /**
   * Gets or sets the legend symbol placement.
   */
  public legendSymbolPlacement: LegendSymbolPlacement = LegendSymbolPlacement.Left

  /**
   * Gets or sets the legend title.
   */
  public legendTitle?: string

  /**
   * Gets or sets the color of the legend title.
   * If this value is `null`, the TextColor will be used.
   */
  public legendTitleColor: OxyColor = OxyColors.Undefined

  /**
   * Gets or sets the legend title font.
   */
  public legendTitleFont?: string

  /**
   * Gets or sets the size of the legend title font.
   */
  public legendTitleFontSize: number = 0

  /**
   * Gets or sets the legend title font weight.
   */
  public legendTitleFontWeight: number = 0

  /**
   * Gets the legend area.
   */
  public legendArea: OxyRect = OxyRect.Empty

  /**
   * Gets or sets the size of the legend.
   */
  public legendSize: OxySize = OxySize.Empty

  /**
   * Gets or sets the background color of the legend. Use `null` for no background.
   */
  public legendBackground: OxyColor = OxyColors.Undefined

  /**
   * Gets or sets the border color of the legend.
   */
  public legendBorder: OxyColor = OxyColors.Undefined

  /**
   * Gets or sets the thickness of the legend border. Use 0 for no border.
   */
  public legendBorderThickness: number = 0

  /**
   * Gets or sets the spacing between columns of legend items (only for vertical orientation).
   */
  public legendColumnSpacing: number = 0

  /**
   * Gets or sets the legend font.
   */
  public legendFont?: string

  /**
   * Gets or sets the size of the legend font.
   */
  public legendFontSize: number = 0

  /**
   * Gets or sets the color of the legend text.
   * If this value is `null`, the TextColor will be used.
   */
  public legendTextColor?: OxyColor

  /**
   * Gets or sets the legend font weight.
   */
  public legendFontWeight: number = 0

  /**
   * Gets or sets the legend item alignment.
   */
  public legendItemAlignment: HorizontalAlignment = HorizontalAlignment.Left

  /**
   * Gets or sets the legend item order.
   */
  public legendItemOrder: LegendItemOrder = LegendItemOrder.Normal

  /**
   * Gets or sets the horizontal spacing between legend items when the orientation is horizontal.
   */
  public legendItemSpacing: number = 0

  /**
   * Gets or sets the vertical spacing between legend items.
   */
  public legendLineSpacing: number = 0

  /**
   * Gets or sets the legend margin.
   */
  public legendMargin: number = 0

  /**
   * Gets or sets the max width of the legend.
   */
  public legendMaxWidth: number = 0

  /**
   * Gets or sets the max height of the legend.
   */
  public legendMaxHeight: number = 0

  /**
   * Gets or sets the legend placement.
   */
  public legendPlacement: LegendPlacement = LegendPlacement.Inside

  /**
   * Gets or sets the legend position.
   */
  public legendPosition: LegendPosition = LegendPosition.TopLeft

  /**
   * Gets or sets a value indicating whether the legend should use the full extend of the plot when LegendPlacement equals LegendPlacement.Outside.
   */
  public allowUseFullExtent: boolean = false

  /**
   * Gets or sets a value indicating whether the legend should show invisible series. The default is true.
   * Invisible series will appear in the listening, but will be grayed out.
   */
  public showInvisibleSeries: boolean = false

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
