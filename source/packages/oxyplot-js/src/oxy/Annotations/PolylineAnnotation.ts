import type { CreatePathAnnotationOptions, IInterpolationAlgorithm } from '@/oxyplot'
import { DataPoint, PathAnnotation, ScreenPoint, ScreenPointHelper } from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface CreateSplineOptions extends CreatePathAnnotationOptions {
  /**
   * The interpolation algorithm.
   */
  interpolationAlgorithm?: IInterpolationAlgorithm
}

/**
 * Represents an annotation that shows a polyline.
 */
export class PolylineAnnotation extends PathAnnotation {
  constructor(opt?: CreateSplineOptions) {
    super(opt)
    if (opt) {
      Object.assign(this, removeUndef(opt))
    }
  }

  /**
   * The points.
   */
  private _points: DataPoint[] = []

  /**
   * The interpolation algorithm.
   */
  public interpolationAlgorithm?: IInterpolationAlgorithm

  /**
   * Gets the points.
   */
  public get points(): DataPoint[] {
    return this._points
  }

  /**
   * Gets the screen points.
   */
  protected getScreenPoints(): ScreenPoint[] {
    const screenPoints = this.points.map((x) => this.transform(x))

    if (this.interpolationAlgorithm) {
      const resampledPoints = ScreenPointHelper.resamplePoints(screenPoints, this.minimumSegmentLength)
      return this.interpolationAlgorithm.createSplineSp(resampledPoints, false, 0.25)
    }

    return this.points.map((x) => this.transform(x))
  }
}
