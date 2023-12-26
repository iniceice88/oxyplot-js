import type { ITransposablePlotElement, IXyAxisPlotElement } from '@/oxyplot'
import { DataPoint, HorizontalAlignment, ScreenPoint, ScreenVector, VerticalAlignment } from '@/oxyplot'

/**
 * The transposable plot element extensions.
 */
export class PlotElementExtensions {
  /**
   * Transforms from a screen point to a data point by the axes of this series.
   * @param element The ITransposablePlotElement.
   * @param x The x coordinate of the screen point.
   * @param y The y coordinate of the screen point.
   * @returns A data point.
   */
  public static inverseTransform(element: IXyAxisPlotElement, x: number, y: number): DataPoint {
    return element.inverseTransform(new ScreenPoint(x, y))
  }

  /**
   * Checks if the series is transposed.
   * @param element The ITransposablePlotElement.
   * @returns True if the series is transposed, False otherwise.
   */
  public static isTransposed(element: ITransposablePlotElement): boolean {
    return element.xAxis!.isVertical()
  }

  /**
   * Transposes the ScreenPoint if the series is transposed.
   * @param element The ITransposablePlotElement.
   * @param point The ScreenPoint to orientate.
   * @returns The oriented point.
   */
  public static orientate(element: ITransposablePlotElement, point: ScreenPoint): ScreenPoint {
    return PlotElementExtensions.isTransposed(element) ? new ScreenPoint(point.y, point.x) : point
  }

  /**
   * Transposes the ScreenVector if the series is transposed. Reverses the respective direction if X or Y axis are reversed.
   * @param element The ITransposablePlotElement.
   * @param vector The ScreenVector to orientate.
   * @returns The oriented vector.
   */
  public static orientateVector(element: ITransposablePlotElement, vector: ScreenVector): ScreenVector {
    vector = new ScreenVector(
      element.xAxis!.isReversed ? -vector.x : vector.x,
      element.yAxis!.isReversed ? -vector.y : vector.y,
    )
    return PlotElementExtensions.isTransposed(element) ? new ScreenVector(-vector.y, -vector.x) : vector
  }

  /**
   * Orientates a HorizontalAlignment and a VerticalAlignment according to whether the Series is transposed or the Axes are reversed.
   * @param element The ITransposablePlotElement.
   * @param ha The HorizontalAlignment to orientate.
   * @param va The VerticalAlignment to orientate.
   */
  public static orientateAlignment(
    element: ITransposablePlotElement,
    ha: HorizontalAlignment,
    va: VerticalAlignment,
  ): [HorizontalAlignment, VerticalAlignment] {
    if (element.xAxis!.isReversed) {
      ha = -ha as HorizontalAlignment
    }

    if (element.yAxis!.isReversed) {
      va = -va as VerticalAlignment
    }

    if (PlotElementExtensions.isTransposed(element)) {
      const orientatedHa = -va as HorizontalAlignment
      va = -ha as VerticalAlignment
      ha = orientatedHa
    }
    return [ha, va]
  }

  /**
   * Transforms the specified data point to a screen point by the axes of this series.
   * @param element The ITransposablePlotElement.
   * @param x The x coordinate of the data point.
   * @param y The y coordinate of the data point.
   * @returns A screen point.
   */
  public static transform(element: IXyAxisPlotElement, x: number, y: number): ScreenPoint {
    return element.transform(new DataPoint(x, y))
  }
}
