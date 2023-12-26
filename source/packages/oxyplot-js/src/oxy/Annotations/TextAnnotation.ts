import {
  type CreateTextualAnnotationOptions,
  HitTestArguments,
  type HitTestResult,
  HorizontalAlignment,
  type IRenderContext,
  MathRenderingExtensions,
  OxyColor,
  OxyColors,
  OxyRect,
  OxySize,
  OxyThickness,
  PlotElementExtensions,
  ScreenPoint,
  ScreenPointHelper,
  ScreenVector,
  TextualAnnotation,
  VerticalAlignment,
} from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface CreateTextAnnotationOptions extends CreateTextualAnnotationOptions {
  background?: OxyColor
  offset?: ScreenVector
  padding?: OxyThickness
  stroke?: OxyColor
  strokeThickness?: number
}

/**
 * Represents an annotation that shows text.
 */
export class TextAnnotation extends TextualAnnotation {
  /**
   * The actual bounds of the text.
   */
  private actualBounds?: ScreenPoint[]

  /**
   * Initializes a new instance of the TextAnnotation class.
   */
  constructor(opt?: CreateTextAnnotationOptions) {
    super(opt)
    this.stroke = OxyColors.Black
    this.background = OxyColors.Undefined
    this.strokeThickness = 1
    this.textVerticalAlignment = VerticalAlignment.Bottom
    this.padding = new OxyThickness(4)

    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * The fill color of the background rectangle.
   */
  public background: OxyColor

  /**
   * The position offset (screen coordinates).
   */
  public offset: ScreenVector = ScreenVector.Zero

  /**
   * The padding of the background rectangle.
   */
  public padding: OxyThickness

  /**
   * The stroke color of the background rectangle.
   */
  public stroke: OxyColor

  /**
   * The stroke thickness of the background rectangle.
   */
  public strokeThickness: number

  /**
   * Renders the text annotation.
   */
  public async render(rc: IRenderContext): Promise<void> {
    if (!this.text) {
      throw new Error(`text must be non-undefined before rendering.`)
    }

    const position = this.transform(this.textPosition).plus(PlotElementExtensions.orientateVector(this, this.offset))

    const textSize = rc.measureText(this.text, this.actualFont, this.actualFontSize, this.actualFontWeight)
    const [ha, va] = this.getActualTextAlignment()

    this.actualBounds = TextAnnotation.getTextBounds(position, textSize, this.padding, this.textRotation, ha, va)

    if (this.textRotation % 90 === 0) {
      const actualRect = OxyRect.fromScreenPoints(this.actualBounds[0], this.actualBounds[2])
      await rc.drawRectangle(actualRect, this.background, this.stroke, this.strokeThickness, this.edgeRenderingMode)
    } else {
      await rc.drawPolygon(
        this.actualBounds,
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
    if (!this.actualBounds) {
      return undefined
    }

    // Todo: see if performance can be improved by checking rectangle (with rotation and alignment), not polygon
    return ScreenPointHelper.isPointInPolygon(args.point, this.actualBounds)
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
    const u = new ScreenVector(cost, sint)
    const v = new ScreenVector(-sint, cost)
    const polygon = new Array<ScreenPoint>(4)
    polygon[0] = position.plus(u.times(left - padding.left)).plus(v.times(top - padding.top))
    polygon[1] = position.plus(u.times(right + padding.right)).plus(v.times(top - padding.top))
    polygon[2] = position.plus(u.times(right + padding.right)).plus(v.times(bottom + padding.bottom))
    polygon[3] = position.plus(u.times(left - padding.left)).plus(v.times(bottom + padding.bottom))
    return polygon
  }
}
