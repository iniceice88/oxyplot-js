import {
  type CreatePathAnnotationOptions,
  type DataPoint,
  ExtendedDefaultPathAnnotationOptions,
  type IInterpolationAlgorithm,
  PathAnnotation,
  type ScreenPoint,
  ScreenPointHelper,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateSplineOptions extends CreatePathAnnotationOptions {
  /**
   * The interpolation algorithm.
   */
  interpolationAlgorithm?: IInterpolationAlgorithm
  /**
   * The points.
   */
  points?: DataPoint[]
}

const DefaultPolylineOptions: CreateSplineOptions = {
  interpolationAlgorithm: undefined,
  points: undefined,
}

export const ExtendedDefaultPolylineOptions = {
  ...ExtendedDefaultPathAnnotationOptions,
  ...DefaultPolylineOptions,
}

/**
 * Represents an annotation that shows a polyline.
 */
export class PolylineAnnotation extends PathAnnotation {
  constructor(opt?: CreateSplineOptions) {
    super(opt)
    assignObject(this, DefaultPolylineOptions, opt)
  }

  getElementName() {
    return 'PolylineAnnotation'
  }

  /**
   * The points.
   */
  public points: DataPoint[] = []

  /**
   * The interpolation algorithm.
   */
  public interpolationAlgorithm?: IInterpolationAlgorithm

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

  protected getElementDefaultValues(): any {
    return ExtendedDefaultPolylineOptions
  }
}
