import {
  type CreateTextualAnnotationOptions,
  DefaultTextualAnnotationOptions,
  ExtendedDefaultTextualAnnotationOptions,
  type OxyColor,
  OxyColors,
  TextualAnnotation,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateShapeAnnotationOptions extends CreateTextualAnnotationOptions {
  fill?: OxyColor
  stroke?: OxyColor
  strokeThickness?: number
}

export const DefaultShapeAnnotationOptions: CreateShapeAnnotationOptions = {
  fill: OxyColors.LightBlue,
  stroke: OxyColors.Black,
  strokeThickness: 0,
}

export const ExtendedDefaultShapeAnnotationOptions = {
  ...ExtendedDefaultTextualAnnotationOptions,
  ...DefaultTextualAnnotationOptions,
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
    assignObject(this, DefaultShapeAnnotationOptions, opt)
  }

  /**
   * The fill color.
   */
  public fill: OxyColor = DefaultShapeAnnotationOptions.fill!

  /**
   * The stroke color.
   */
  public stroke: OxyColor = DefaultShapeAnnotationOptions.stroke!

  /**
   * The stroke thickness.
   */
  public strokeThickness: number = DefaultShapeAnnotationOptions.strokeThickness!
}
