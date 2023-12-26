import { LineStyle } from '@/oxyplot'

/**
 * Provides functionality to convert from LineStyle to a stroke dash array.
 */
export class LineStyleHelper {
  /**
   * Gets the stroke dash array for a given LineStyle.
   * @param style The line style.
   * @returns A dash array.
   */
  public static getDashArray(style: LineStyle): number[] | undefined {
    switch (style) {
      case LineStyle.Solid:
        return undefined
      case LineStyle.Dash:
        return [4, 1]
      case LineStyle.Dot:
        return [1, 1]
      case LineStyle.DashDot:
        return [4, 1, 1, 1]
      case LineStyle.DashDashDot:
        return [4, 1, 4, 1, 1, 1]
      case LineStyle.DashDotDot:
        return [4, 1, 1, 1, 1, 1]
      case LineStyle.DashDashDotDot:
        return [4, 1, 4, 1, 1, 1, 1, 1]
      case LineStyle.LongDash:
        return [10, 1]
      case LineStyle.LongDashDot:
        return [10, 1, 1, 1]
      case LineStyle.LongDashDotDot:
        return [10, 1, 1, 1, 1, 1]
      default:
        return undefined
    }
  }
}
