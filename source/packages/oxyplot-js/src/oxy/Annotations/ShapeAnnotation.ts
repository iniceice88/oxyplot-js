import { type CreateTextualAnnotationOptions, OxyColor, OxyColors, TextualAnnotation } from '@/oxyplot'

export interface CreateShapeAnnotationOptions extends CreateTextualAnnotationOptions {
  fill?: OxyColor
  stroke?: OxyColor
  strokeThickness?: number
}

/**
 * Provides an abstract base class for shape annotations.
 */
export abstract class ShapeAnnotation extends TextualAnnotation {
  /**
   * Initializes a new instance of the ShapeAnnotation class.
   */
  protected constructor(opt?: CreateShapeAnnotationOptions) {
    super(opt)
    this.stroke = OxyColors.Black
    this.fill = OxyColors.LightBlue
  }

  /**
   * The fill color.
   */
  public fill: OxyColor

  /**
   * The stroke color.
   */
  public stroke: OxyColor

  /**
   * The stroke thickness.
   */
  public strokeThickness: number = 0
}
