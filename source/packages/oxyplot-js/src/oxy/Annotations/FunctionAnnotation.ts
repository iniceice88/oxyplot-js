import {
  type CreatePathAnnotationOptions,
  type DataPoint,
  ExtendedDefaultPathAnnotationOptions,
  FunctionAnnotationType,
  newDataPoint,
  PathAnnotation,
  type PlotModelSerializeOptions,
  type ScreenPoint,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateFunctionAnnotationOptions extends CreatePathAnnotationOptions {
  equation?: (arg: number) => number
  resolution?: number
  type?: FunctionAnnotationType
}

const DefaultFunctionAnnotationOptions: CreateFunctionAnnotationOptions = {
  resolution: 400,
  type: FunctionAnnotationType.EquationX,

  equation: undefined,
}

export const ExtendedDefaultFunctionAnnotationOptions = {
  ...ExtendedDefaultPathAnnotationOptions,
  ...DefaultFunctionAnnotationOptions,
}

/**
 * Represents an annotation that shows a function rendered as a path.
 */
export class FunctionAnnotation extends PathAnnotation {
  /**
   * Initializes a new instance of the FunctionAnnotation class.
   */
  constructor(opt?: CreateFunctionAnnotationOptions) {
    super(opt)
    assignObject(this, DefaultFunctionAnnotationOptions, opt)
  }

  getElementName() {
    return 'FunctionAnnotation'
  }

  /**
   * The type of function. Can be either f(x) or f(y).
   */
  public type: FunctionAnnotationType = DefaultFunctionAnnotationOptions.type!

  /**
   * The y=f(x) equation when type is Equation.
   */
  public equation?: (arg: number) => number

  /**
   * The resolution.
   */
  public resolution: number = DefaultFunctionAnnotationOptions.resolution!

  /**
   * Gets the screen points.
   */
  protected getScreenPoints(): ScreenPoint[] {
    let fx: ((arg: number) => number) | undefined = undefined
    let fy: ((arg: number) => number) | undefined = undefined

    switch (this.type) {
      case FunctionAnnotationType.EquationX:
        fx = this.equation
        break
      case FunctionAnnotationType.EquationY:
        fy = this.equation
        break
    }

    const points: DataPoint[] = []

    if (fx) {
      let x = this.actualMinimumX

      // the step size should be adaptive
      const dx = (this.actualMaximumX - this.actualMinimumX) / this.resolution
      // eslint-disable-next-line no-constant-condition
      while (true) {
        points.push(newDataPoint(x, fx(x)))
        if (x > this.actualMaximumX) {
          break
        }

        x += dx
      }
    } else if (fy) {
      let y = this.actualMinimumY

      // todo: the step size should be adaptive
      const dy = (this.actualMaximumY - this.actualMinimumY) / this.resolution
      // eslint-disable-next-line no-constant-condition
      while (true) {
        points.push(newDataPoint(fy(y), y))
        if (y > this.actualMaximumY) {
          break
        }

        y += dy
      }
    }

    return points.map((p) => this.transform(p))
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultFunctionAnnotationOptions
  }

  toJSON(opt?: PlotModelSerializeOptions): any {
    const json = super.toJSON(opt)
    json.equation = this.equation?.toString()
    return json
  }
}
