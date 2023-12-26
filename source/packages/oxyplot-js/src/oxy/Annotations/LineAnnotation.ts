import { type CreatePathAnnotationOptions, DataPoint, LinearAxis, PathAnnotation, ScreenPoint } from '@/oxyplot'
import { removeUndef } from '@/patch'

/**
 * Specifies the definition of the line in a LineAnnotation.
 */
export enum LineAnnotationType {
  /**
   * Horizontal line given by the Y property
   */
  Horizontal,

  /**
   * Vertical line given by the X property
   */
  Vertical,

  /**
   * Linear equation y=mx+b given by the Slope and Intercept properties
   */
  LinearEquation,
}

interface CreateLineAnnotationOptions extends CreatePathAnnotationOptions {
  intercept?: number
  slope?: number
  type?: LineAnnotationType
  x?: number
  y?: number
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
    this.type = LineAnnotationType.LinearEquation
    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * The y-intercept when type is LinearEquation.
   */
  public intercept: number = 0

  /**
   * The slope when type is LinearEquation.
   */
  public slope: number = 0

  /**
   * The type of line equation.
   */
  public type: LineAnnotationType

  /**
   * The X position for vertical lines (only for type==Vertical).
   */
  public x: number = 0

  /**
   * The Y position for horizontal lines (only for type==Horizontal)
   */
  public y: number = 0

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
        points.push(new DataPoint(this.actualMinimumX, fx(this.actualMinimumX)))
        points.push(new DataPoint(this.actualMaximumX, fx(this.actualMaximumX)))
      } else if (fy) {
        points.push(new DataPoint(fy(this.actualMinimumY), this.actualMinimumY))
        points.push(new DataPoint(fy(this.actualMaximumY), this.actualMaximumY))
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
          points.push(new DataPoint(x, fx(x)))
        }
      } else if (fy) {
        // todo: the step size should be adaptive
        const n = 100
        const dy = (this.actualMaximumY - this.actualMinimumY) / n
        for (let i = 0; i <= n; i++) {
          const y = this.actualMinimumY + i * dy
          points.push(new DataPoint(fy(y), y))
        }
      }
    }

    // transform to screen coordinates
    return points.map((p) => this.transform(p))
  }
}
