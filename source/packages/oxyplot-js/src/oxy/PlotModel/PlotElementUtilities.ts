import type { DataPoint, ITransposablePlotElement, IXyAxisPlotElement, ScreenPoint } from '@/oxyplot'
import { OxyRect, PlotElementExtensions } from '@/oxyplot'

/**
 * Provides utility functions for plot elements.
 */
export class PlotElementUtilities {
  /**
   * Gets the clipping rectangle defined by the Axis the IXyAxisPlotElement uses.
   * @param element The IXyAxisPlotElement.
   * @returns The clipping rectangle.
   */
  public static getClippingRect(element: IXyAxisPlotElement): OxyRect {
    const xrect = OxyRect.fromScreenPoints(element.xAxis!.screenMin, element.xAxis!.screenMax)
    const yrect = OxyRect.fromScreenPoints(element.yAxis!.screenMin, element.yAxis!.screenMax)
    return xrect.intersect(yrect)
  }

  /**
   * Transforms from a screen point to a data point by the axes of this series.
   * @param element The ITransposablePlotElement.
   * @param p The screen point.
   * @returns A data point.
   */
  public static inverseTransform(element: IXyAxisPlotElement, p: ScreenPoint): DataPoint {
    return element.xAxis!.inverseTransformPoint(p.x, p.y, element.yAxis!)
  }

  /**
   * Transforms from a screen point to a data point by the axes of this series while being aware of the orientation.
   * @param element The ITransposablePlotElement.
   * @param p The screen point.
   * @returns A data point.
   */
  public static inverseTransformOrientated(element: ITransposablePlotElement, p: ScreenPoint): DataPoint {
    return this.inverseTransform(element, PlotElementExtensions.orientate(element, p))
  }

  /**
   * Transforms the specified coordinates to a screen point by the axes of the plot element.
   * @param element The plot element.
   * @param p The data point.
   * @returns A screen point.
   */
  public static transform(element: IXyAxisPlotElement, p: DataPoint): ScreenPoint {
    return element.xAxis!.transformPoint(p.x, p.y, element.yAxis!)
  }

  /**
   * Transforms the specified coordinates to a screen point by the axes of the plot element while being aware of the orientation.
   * @param element The plot element.
   * @param p The data point.
   * @returns A screen point.
   */
  public static transformOrientated(element: ITransposablePlotElement, p: DataPoint): ScreenPoint {
    return PlotElementExtensions.orientate(element, this.transform(element, p))
  }
}
