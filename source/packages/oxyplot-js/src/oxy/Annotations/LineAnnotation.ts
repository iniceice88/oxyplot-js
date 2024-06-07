import {
  type CreatePathAnnotationOptions,
  type DataPoint,
  ExtendedDefaultPathAnnotationOptions,
  LineAnnotationType,
  LinearAxis,
  newDataPoint,
  PathAnnotation,
  type ScreenPoint,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateLineAnnotationOptions extends CreatePathAnnotationOptions {
  intercept?: number
  slope?: number
  type?: LineAnnotationType
  x?: number
  y?: number
}

const DefaultLineAnnotationOptions: CreateLineAnnotationOptions = {
  intercept: 0,
  slope: 0,
  type: LineAnnotationType.LinearEquation,
  x: 0,
  y: 0,
}

export const ExtendedDefaultLineAnnotationOptions = {
  ...ExtendedDefaultPathAnnotationOptions,
  ...DefaultLineAnnotationOptions,
}

/**
 * Represents an annotation that shows a straight line.
 */
export class LineAnnotation extends PathAnnotation {
  /**
   * Initializes a new instance of the LineAnnotation class.
   */
  constructor(opt?: CreateLineAnnotationOptions) {
    super(opt)
    assignObject(this, DefaultLineAnnotationOptions, opt)
  }

  getElementName() {
    return 'LineAnnotation'
  }

  /**
   * The y-intercept when type is LinearEquation.
   */
  public intercept: number = DefaultLineAnnotationOptions.intercept!

  /**
   * The slope when type is LinearEquation.
   */
  public slope: number = DefaultLineAnnotationOptions.slope!

  /**
   * The type of line equation.
   */
  public type: LineAnnotationType = DefaultLineAnnotationOptions.type!

  /**
   * The X position for vertical lines (only for type==Vertical).
   */
  public x: number = DefaultLineAnnotationOptions.x!

  /**
   * The Y position for horizontal lines (only for type==Horizontal)
   */
  public y: number = DefaultLineAnnotationOptions.y!

  /**
   * Gets the screen points.
   */
  protected getScreenPoints(): ScreenPoint[] {
    // y=f(x)
    let fx: ((arg: number) => number) | undefined = undefined

    // x=f(y)
    let fy: ((arg: number) => number) | undefined = undefined

    switch (this.type) {
      case LineAnnotationType.Horizontal:
        fx = (x) => this.y
        break
      case LineAnnotationType.Vertical:
        fy = (y) => this.x
        break
      default:
        fx = (x) => this.slope * x + this.intercept
        break
    }

    const points: DataPoint[] = []

    const isCurvedLine = !(this.xAxis instanceof LinearAxis && this.yAxis instanceof LinearAxis)

    if (!isCurvedLine) {
      // we only need to calculate two points if it is a straight line
      if (fx) {
        points.push(newDataPoint(this.actualMinimumX, fx(this.actualMinimumX)))
        points.push(newDataPoint(this.actualMaximumX, fx(this.actualMaximumX)))
      } else if (fy) {
        points.push(newDataPoint(fy(this.actualMinimumY), this.actualMinimumY))
        points.push(newDataPoint(fy(this.actualMaximumY), this.actualMaximumY))
      } else {
        throw new Error('fx or fy must be non-undefined.')
      }
    } else {
      if (fx) {
        // todo: the step size should be adaptive
        const n = 100
        const dx = (this.actualMaximumX - this.actualMinimumX) / 100
        for (let i = 0; i <= n; i++) {
          const x = this.actualMinimumX + i * dx
          points.push(newDataPoint(x, fx(x)))
        }
      } else if (fy) {
        // todo: the step size should be adaptive
        const n = 100
        const dy = (this.actualMaximumY - this.actualMinimumY) / n
        for (let i = 0; i <= n; i++) {
          const y = this.actualMinimumY + i * dy
          points.push(newDataPoint(fy(y), y))
        }
      }
    }

    // transform to screen coordinates
    return points.map((p) => this.transform(p))
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultLineAnnotationOptions
  }
}
