import {
  type CreateTransposableAnnotationOptions,
  type DataPoint,
  DataPoint_isDefined,
  DataPoint_Undefined,
  ExtendedDefaultTransposableAnnotationOptions,
  HorizontalAlignment,
  type ScreenPoint,
  TransposableAnnotation,
  VerticalAlignment,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateTextualAnnotationOptions extends CreateTransposableAnnotationOptions {
  text?: string
  textPosition?: DataPoint
  textHorizontalAlignment?: HorizontalAlignment
  textVerticalAlignment?: VerticalAlignment
  textRotation?: number
}

export const DefaultTextualAnnotationOptions: CreateTextualAnnotationOptions = {
  textHorizontalAlignment: HorizontalAlignment.Center,
  textVerticalAlignment: VerticalAlignment.Middle,
  textPosition: DataPoint_Undefined,
  textRotation: 0,

  text: undefined,
}

export const ExtendedDefaultTextualAnnotationOptions = {
  ...ExtendedDefaultTransposableAnnotationOptions,
  ...DefaultTextualAnnotationOptions,
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
    assignObject(this, DefaultTextualAnnotationOptions, opt)
  }

  /**
   * Gets or sets the annotation text.
   */
  public text?: string

  /**
   * Gets or sets the position of the text.
   * If the value is DataPoint.Undefined, the default position of the text will be used.
   */
  public textPosition: DataPoint = DefaultTextualAnnotationOptions.textPosition!

  /**
   * Gets or sets the horizontal alignment of the text.
   */
  public textHorizontalAlignment: HorizontalAlignment = DefaultTextualAnnotationOptions.textHorizontalAlignment!

  /**
   * Gets or sets the vertical alignment of the text.
   */
  public textVerticalAlignment: VerticalAlignment = DefaultTextualAnnotationOptions.textVerticalAlignment!

  /**
   * Gets or sets the rotation of the text.
   * The text rotation in degrees.
   */
  public textRotation: number = DefaultTextualAnnotationOptions.textRotation!

  /**
   * Gets the actual position of the text.
   * @param defaultPosition A function that returns the default position. This is used if TextPosition is undefined.
   * @returns The actual position of the text, in screen space.
   */
  protected getActualTextPosition(defaultPosition: () => ScreenPoint): ScreenPoint {
    return DataPoint_isDefined(this.textPosition) ? this.transform(this.textPosition) : defaultPosition()
  }

  /**
   * Gets the actual text alignment.
   */
  protected getActualTextAlignment(): [HorizontalAlignment, VerticalAlignment] {
    return [this.textHorizontalAlignment, this.textVerticalAlignment]
  }
}
