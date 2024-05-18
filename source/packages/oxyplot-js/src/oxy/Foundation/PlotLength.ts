/**
 * Defines the kind of value that a PlotLength object is holding.
 */
export enum PlotLengthUnit {
  /**
   * The value is in data space (transformed by x/y-axis)
   */
  Data = 0,

  /**
   * The value is in screen units
   */
  ScreenUnits = 1,

  /**
   * The value is relative to the plot viewport (0-1)
   */
  RelativeToViewport = 2,

  /**
   * The value is relative to the plot area (0-1)
   */
  RelativeToPlotArea = 3,
}

/**
 * Represents absolute or relative lengths in data or screen space.
 */
export interface PlotLength {
  /**
   * The unit type
   */
  unit: PlotLengthUnit
  /**
   * The value
   */
  value: number
}

/**
 * create a PlotLength object
 * @param v
 * @param u
 */
export function newPlotLength(v: number, u: PlotLengthUnit): PlotLength {
  return { value: v, unit: u }
}
