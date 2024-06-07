import {
  type CreateTextualAnnotationOptions,
  ExtendedDefaultTextualAnnotationOptions,
  type HitTestArguments,
  type HitTestResult,
  HorizontalAlignment,
  type IRenderContext,
  MathRenderingExtensions,
  newOxyThickness,
  type OxyColor,
  OxyColors,
  OxyRectHelper,
  type OxySize,
  type OxyThickness,
  PlotElementExtensions,
  type ScreenPoint,
  ScreenPointHelper,
  screenPointPlus,
  type ScreenVector,
  ScreenVector_Zero,
  ScreenVectorEx,
  TextualAnnotation,
  VerticalAlignment,
} from '@/oxyplot'

import { assignObject } from '@/patch'

export interface CreateTextAnnotationOptions extends CreateTextualAnnotationOptions {
  background?: OxyColor
  offset?: ScreenVector
  padding?: OxyThickness
  stroke?: OxyColor
  strokeThickness?: number
}

const DefaultTextAnnotationOptions: CreateTextAnnotationOptions = {
  background: OxyColors.Undefined,
  offset: ScreenVector_Zero,
  padding: newOxyThickness(4),
  stroke: OxyColors.Black,
  strokeThickness: 1,
  textVerticalAlignment: VerticalAlignment.Bottom,
}

export const ExtendedDefaultTextAnnotationOptions = {
  ...ExtendedDefaultTextualAnnotationOptions,
  ...DefaultTextAnnotationOptions,
}

/**
 * Represents an annotation that shows text.
 */
export class TextAnnotation extends TextualAnnotation {
  /**
   * The actual bounds of the text.
   */
  private _actualBounds?: ScreenPoint[]

  /**
   * Initializes a new instance of the TextAnnotation class.
   */
  constructor(opt?: CreateTextAnnotationOptions) {
    super(opt)
    assignObject(this, DefaultTextAnnotationOptions, opt)
  }

  getElementName() {
    return 'TextAnnotation'
  }

  /**
   * The fill color of the background rectangle.
   */
  public background: OxyColor = DefaultTextAnnotationOptions.background!

  /**
   * The position offset (screen coordinates).
   */
  public offset: ScreenVector = DefaultTextAnnotationOptions.offset!

  /**
   * The padding of the background rectangle.
   */
  public padding: OxyThickness = DefaultTextAnnotationOptions.padding!

  /**
   * The stroke color of the background rectangle.
   */
  public stroke: OxyColor = DefaultTextAnnotationOptions.stroke!

  /**
   * The stroke thickness of the background rectangle.
   */
  public strokeThickness: number = DefaultTextAnnotationOptions.strokeThickness!

  /**
   * Renders the text annotation.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (!this.text) {
      throw new Error(`text must be non-undefined before rendering.`)
    }

    const position = screenPointPlus(
      this.transform(this.textPosition),
      PlotElementExtensions.orientateVector(this, this.offset),
    )

    const textSize = rc.measureText(this.text, this.actualFont, this.actualFontSize, this.actualFontWeight)
    const [ha, va] = this.getActualTextAlignment()

    this._actualBounds = TextAnnotation.getTextBounds(position, textSize, this.padding, this.textRotation, ha, va)

    if (this.textRotation % 90 === 0) {
      const actualRect = OxyRectHelper.fromScreenPoints(this._actualBounds[0], this._actualBounds[2])
      await rc.drawRectangle(actualRect, this.background, this.stroke, this.strokeThickness, this.edgeRenderingMode)
    } else {
      await rc.drawPolygon(
        this._actualBounds,
        this.background,
        this.stroke,
        this.strokeThickness,
        this.edgeRenderingMode,
      )
    }

    await MathRenderingExtensions.drawMathText(
      rc,
      position,
      this.text,
      this.getSelectableFillColor(this.actualTextColor),
      this.actualFont,
      this.actualFontSize,
      this.actualFontWeight,
      this.textRotation,
      ha,
      va,
    )
  }

  /**
   * Tests if the plot element is hit by the specified point.
   */
  protected hitTestOverride(args: HitTestArguments): HitTestResult | undefined {
    if (!this._actualBounds) {
      return undefined
    }

    // todo: see if performance can be improved by checking rectangle (with rotation and alignment), not polygon
    return ScreenPointHelper.isPointInPolygon(args.point, this._actualBounds)
      ? { element: this, nearestHitPoint: args.point }
      : undefined
  }

  /**
   * Gets the coordinates of the (rotated) background rectangle.
   * @internal
   */
  static getTextBounds(
    position: ScreenPoint,
    size: OxySize,
    padding: OxyThickness,
    rotation: number,
    horizontalAlignment: HorizontalAlignment,
    verticalAlignment: VerticalAlignment,
  ): ScreenPoint[] {
    let left: number, right: number, top: number, bottom: number
    switch (horizontalAlignment) {
      case HorizontalAlignment.Center:
        left = -size.width * 0.5
        right = -left
        break
      case HorizontalAlignment.Right:
        left = -size.width
        right = 0
        break
      default:
        left = 0
        right = size.width
        break
    }

    switch (verticalAlignment) {
      case VerticalAlignment.Middle:
        top = -size.height * 0.5
        bottom = -top
        break
      case VerticalAlignment.Bottom:
        top = -size.height
        bottom = 0
        break
      default:
        top = 0
        bottom = size.height
        break
    }

    const cost = Math.cos((rotation / 180) * Math.PI)
    const sint = Math.sin((rotation / 180) * Math.PI)
    const u = ScreenVectorEx.fromXY(cost, sint)
    const v = ScreenVectorEx.fromXY(-sint, cost)
    const polygon = new Array<ScreenPoint>(4)
    polygon[0] = screenPointPlus(screenPointPlus(position, u.times(left - padding.left)), v.times(top - padding.top))
    polygon[1] = screenPointPlus(screenPointPlus(position, u.times(right + padding.right)), v.times(top - padding.top))
    polygon[2] = screenPointPlus(
      screenPointPlus(position, u.times(right + padding.right)),
      v.times(bottom + padding.bottom),
    )
    polygon[3] = screenPointPlus(
      screenPointPlus(position, u.times(left - padding.left)),
      v.times(bottom + padding.bottom),
    )
    return polygon
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultTextAnnotationOptions
  }
}
