import { type CreatePathAnnotationOptions, DataPoint, newDataPoint, PathAnnotation, ScreenPoint } from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface CreateFunctionAnnotationOptions extends CreatePathAnnotationOptions {
  equation?: (arg: number) => number
  resolution?: number
  type?: FunctionAnnotationType
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
    this.resolution = 400
    this.type = FunctionAnnotationType.EquationX
    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * The type of function. Can be either f(x) or f(y).
   */
  public type: FunctionAnnotationType

  /**
   * The y=f(x) equation when type is Equation.
   */
  public equation?: (arg: number) => number

  /**
   * The resolution.
   */
  public resolution: number

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

      // todo: the step size should be adaptive
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
}

/**
 * Defines the definition of function in a FunctionAnnotation.
 */
export enum FunctionAnnotationType {
  /**
   * Curve equation x=f(y) given by the Equation property
   */
  EquationX,
  /**
   * Curve equation y=f(x) given by the Equation property
   */
  EquationY,
}
