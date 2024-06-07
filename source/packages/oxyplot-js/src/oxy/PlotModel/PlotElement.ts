import {
  type CreateElementOptions,
  EdgeRenderingMode,
  Element,
  ExtendedDefaultElementOptions,
  FontWeights,
  type IPlotElement,
  type OxyColor,
  OxyColorHelper,
  OxyColors,
  type OxyRect,
  OxyRect_Everything,
  type PlotModel,
} from '@/oxyplot'
import { isUndef, assignObject, isNaNOrUndef } from '@/patch'

export interface CreatePlotElementOptions extends CreateElementOptions {
  font?: string
  fontSize?: number
  fontWeight?: number
  tag?: any
  textColor?: OxyColor
  edgeRenderingMode?: EdgeRenderingMode
  toolTip?: string
}

const DefaultPlotElementOptions: CreatePlotElementOptions = {
  fontSize: NaN,
  fontWeight: FontWeights.Normal,
  textColor: OxyColors.Automatic,
  edgeRenderingMode: EdgeRenderingMode.Automatic,
  font: undefined,
  toolTip: undefined,
}

export const ExtendedDefaultPlotElementOptions = {
  ...ExtendedDefaultElementOptions,
  ...DefaultPlotElementOptions,
}

/**
 * Provides an abstract base class for elements of a PlotModel.
 */
export abstract class PlotElement extends Element implements IPlotElement {
  /**
   * The font. The default is null (use PlotModel.DefaultFont).
   * If the value is null, the DefaultFont of the parent PlotModel will be used.
   */
  public font?: string

  /**
   * The size of the font. The default is NaN (use PlotModel.DefaultFontSize).
   * If the value is NaN, the DefaultFontSize of the parent PlotModel will be used.
   */
  public fontSize: number = DefaultPlotElementOptions.fontSize!

  /**
   * The font weight. The default is normal.
   */
  public fontWeight: number = DefaultPlotElementOptions.fontWeight!

  /**
   * An arbitrary object value that can be used to store custom information about this plot element. The default is null.
   * This property is analogous to Tag properties in other Microsoft programming models. Tag is intended to provide a pre-existing property location where you can store some basic custom information about any PlotElement without requiring you to subclass an element.
   */
  public tag?: any

  /**
   * The color of the text. The default is OxyColors.Automatic (use PlotModel.TextColor).
   * If the value is OxyColors.Automatic, the TextColor of the parent PlotModel will be used.
   */
  public textColor: OxyColor = DefaultPlotElementOptions.textColor!

  /**
   * The edge rendering mode that is used for rendering the plot element.
   * The default is EdgeRenderingMode.Automatic.
   */
  public edgeRenderingMode: EdgeRenderingMode = DefaultPlotElementOptions.edgeRenderingMode!

  /**
   * The tool tip. The default is null.
   */
  public toolTip?: string

  /**
   * Initializes a new instance of the PlotElement class.
   */
  protected constructor(opt?: CreatePlotElementOptions) {
    super(opt)
    assignObject(this, DefaultPlotElementOptions, opt)
  }

  /**
   * Gets the parent PlotModel.
   */
  public get plotModel(): PlotModel {
    return this.parent as PlotModel
  }

  /**
   * Gets the actual font.
   * @internal
   */
  get actualFont(): string {
    return this.font || this.plotModel.defaultFont
  }

  /**
   * Gets the actual size of the font.
   * @internal
   */
  get actualFontSize(): number {
    return !isNaNOrUndef(this.fontSize) ? this.fontSize : this.plotModel.defaultFontSize
  }

  /**
   * Gets the actual font weight.
   * @internal
   */
  get actualFontWeight(): number {
    return this.fontWeight
  }

  /**
   * Gets the actual color of the text.
   * @internal
   */
  get actualTextColor(): OxyColor {
    return OxyColorHelper.getActualColor(this.textColor, this.plotModel.textColor)
  }

  getClippingRect(): OxyRect {
    return OxyRect_Everything
  }

  private _plotElementId?: number = undefined

  /**
   * Returns a hash code for this element.
   * This method creates the hash code by reflecting the value of all public properties.
   * @returns A hash code for this instance, suitable for use in hashing algorithms and data structures like a hash table.
   */
  public getElementHashCode(): number {
    if (isUndef(this._plotElementId)) {
      plotElementId++
      this._plotElementId = plotElementId
    }
    return this._plotElementId
  }
}

let plotElementId = 0
