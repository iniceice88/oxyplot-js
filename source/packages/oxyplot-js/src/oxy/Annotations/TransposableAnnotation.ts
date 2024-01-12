import type { CreateAnnotationOptions, DataPoint, ITransposablePlotElement, ScreenPoint } from '@/oxyplot'
import {
  Annotation,
  newScreenPoint,
  OxyRect,
  PlotElementExtensions,
  PlotElementUtilities,
  setTransposablePlotElement,
} from '@/oxyplot'

export type CreateTransposableAnnotationOptions = CreateAnnotationOptions

/**
 * Provides an abstract base class for transposable annotations.
 */
export abstract class TransposableAnnotation extends Annotation implements ITransposablePlotElement {
  protected constructor(opt?: CreateTransposableAnnotationOptions) {
    super(opt)
    setTransposablePlotElement(this)
  }

  /**
   * Gets the clipping rectangle.
   */
  public getClippingRect(): OxyRect {
    const rect = this.plotModel.plotArea
    const axisRect = PlotElementUtilities.getClippingRect(this)

    let minX = 0
    let maxX = Number.POSITIVE_INFINITY
    let minY = 0
    let maxY = Number.POSITIVE_INFINITY

    if (this.clipByXAxis) {
      minX = PlotElementExtensions.orientate(this, axisRect.topLeft).x
      maxX = PlotElementExtensions.orientate(this, axisRect.bottomRight).x
    }

    if (this.clipByYAxis) {
      minY = PlotElementExtensions.orientate(this, axisRect.topLeft).y
      maxY = PlotElementExtensions.orientate(this, axisRect.bottomRight).y
    }

    const minPoint = PlotElementExtensions.orientate(this, newScreenPoint(minX, minY))
    const maxPoint = PlotElementExtensions.orientate(this, newScreenPoint(maxX, maxY))

    const axisClipRect = OxyRect.fromScreenPoints(minPoint, maxPoint)
    return rect.clip(axisClipRect)
  }

  /**
   * Transforms the specified data point to a screen point.
   * @param p The data point.
   */
  public transform(p: DataPoint): ScreenPoint {
    return PlotElementUtilities.transformOrientated(this, p)
  }

  /**
   * Transforms the specified screen point to a data point.
   * @param p The screen point.
   */
  public inverseTransform(p: ScreenPoint): DataPoint {
    return PlotElementUtilities.inverseTransformOrientated(this, p)
  }
}
