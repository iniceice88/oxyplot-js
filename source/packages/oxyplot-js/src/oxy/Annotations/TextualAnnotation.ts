import {
  type CreateTransposableAnnotationOptions,
  DataPoint,
  HorizontalAlignment,
  ScreenPoint,
  TransposableAnnotation,
  VerticalAlignment,
} from '@/oxyplot'

export interface CreateTextualAnnotationOptions extends CreateTransposableAnnotationOptions {
  text?: string
  textPosition?: DataPoint
  textHorizontalAlignment?: HorizontalAlignment
  textVerticalAlignment?: VerticalAlignment
  textRotation?: number
}

/**
 * Provides an abstract base class for annotations that contains text.
 */
export abstract class TextualAnnotation extends TransposableAnnotation {
  /**
   * Initializes a new instance of the TextualAnnotation class.
   */
  protected constructor(opt?: CreateTextualAnnotationOptions) {
    super(opt)
    this.textHorizontalAlignment = HorizontalAlignment.Center
    this.textVerticalAlignment = VerticalAlignment.Middle
    this.textPosition = DataPoint.Undefined
    this.textRotation = 0
  }

  /**
   * Gets or sets the annotation text.
   */
  public text?: string

  /**
   * Gets or sets the position of the text.
   * If the value is DataPoint.Undefined, the default position of the text will be used.
   */
  public textPosition: DataPoint

  /**
   * Gets or sets the horizontal alignment of the text.
   */
  public textHorizontalAlignment: HorizontalAlignment

  /**
   * Gets or sets the vertical alignment of the text.
   */
  public textVerticalAlignment: VerticalAlignment

  /**
   * Gets or sets the rotation of the text.
   * The text rotation in degrees.
   */
  public textRotation: number

  /**
   * Gets the actual position of the text.
   * @param defaultPosition A function that returns the default position. This is used if TextPosition is undefined.
   * @returns The actual position of the text, in screen space.
   */
  protected getActualTextPosition(defaultPosition: () => ScreenPoint): ScreenPoint {
    return this.textPosition.isDefined() ? this.transform(this.textPosition) : defaultPosition()
  }

  /**
   * Gets the actual text alignment.
   */
  protected getActualTextAlignment(): [HorizontalAlignment, VerticalAlignment] {
    return [this.textHorizontalAlignment, this.textVerticalAlignment]
  }
}
