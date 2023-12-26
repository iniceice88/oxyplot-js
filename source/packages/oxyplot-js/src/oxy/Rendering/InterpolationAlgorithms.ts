import { CanonicalSpline, CatmullRomSpline, type IInterpolationAlgorithm } from '@/oxyplot'

/**
 * Implements a set of predefined interpolation algorithms.
 */
export class InterpolationAlgorithms {
  /**
   * Canonical spline, also known as Cardinal spline.
   */
  public static readonly CanonicalSpline: IInterpolationAlgorithm = new CanonicalSpline(0.5)

  /**
   * Centripetal Catmull–Rom spline.
   */
  public static readonly CatmullRomSpline: IInterpolationAlgorithm = new CatmullRomSpline(0.5)

  /**
   * Uniform Catmull–Rom spline.
   */
  public static readonly UniformCatmullRomSpline: IInterpolationAlgorithm = new CatmullRomSpline(0.0)

  /**
   * Chordal Catmull–Rom spline.
   */
  public static readonly ChordalCatmullRomSpline: IInterpolationAlgorithm = new CatmullRomSpline(1.0)
}
