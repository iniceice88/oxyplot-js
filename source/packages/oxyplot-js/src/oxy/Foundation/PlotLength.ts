/**
 * Defines the kind of value that a PlotLength object is holding.
 */
export enum PlotLengthUnit {
  /**
   * The value is in data space (transformed by x/y axis)
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
export class PlotLength {
  /**
   * The unit type
   */
  private readonly _unit: PlotLengthUnit

  /**
   * The value
   */
  private readonly _value: number

  /**
   * Initializes a new instance of the PlotLength class.
   * @param value The value.
   * @param unit The unit.
   */
  constructor(value: number, unit: PlotLengthUnit) {
    this._value = value
    this._unit = unit
  }

  /**
   * Gets the value.
   */
  public get value(): number {
    return this._value
  }

  /**
   * Gets the type of the unit.
   */
  public get unit(): PlotLengthUnit {
    return this._unit
  }

  /**
   * Determines whether this instance and another specified PlotLength object have the same value.
   * @param other The length to compare to this instance.
   * @returns true if the value of the other parameter is the same as the value of this instance; otherwise, false.
   */
  public equals(other: PlotLength): boolean {
    return this._value === other.value && this._unit === other.unit
  }
}
