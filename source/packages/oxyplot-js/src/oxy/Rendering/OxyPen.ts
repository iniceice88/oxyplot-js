import { LineStyleHelper, type OxyColor, OxyColorHelper } from '@/oxyplot'
import { LineJoin, LineStyle } from './types'

/**
 * Describes a pen in terms of color, thickness, line style and line join type.
 */
export class OxyPen {
  /**
   * Initializes a new instance of the OxyPen class.
   * @param color The color.
   * @param thickness The thickness.
   * @param lineStyle The line style.
   * @param lineJoin The line join.
   */
  constructor(
    public color: OxyColor,
    public thickness: number = 1.0,
    public lineStyle: LineStyle = LineStyle.Solid,
    public lineJoin: LineJoin = LineJoin.Miter,
  ) {
    this.dashArray = LineStyleHelper.getDashArray(lineStyle)
  }

  /**
   * The dash array (overrides lineStyle).
   */
  public dashArray?: number[]

  /**
   * Gets the actual dash array.
   */
  public get actualDashArray(): number[] | undefined {
    return this.dashArray || LineStyleHelper.getDashArray(this.lineStyle)
  }

  /**
   * Creates the specified pen.
   * @param color The color.
   * @param thickness The thickness.
   * @param lineStyle The line style.
   * @param lineJoin The line join.
   * @returns A pen.
   */
  public static create(
    color: OxyColor,
    thickness: number,
    lineStyle: LineStyle = LineStyle.Solid,
    lineJoin: LineJoin = LineJoin.Miter,
  ): OxyPen | undefined {
    if (OxyColorHelper.isInvisible(color) || lineStyle === LineStyle.None || Math.abs(thickness) <= 0) {
      return undefined
    }

    return new OxyPen(color, thickness, lineStyle, lineJoin)
  }
}
