/**
 * Defines change types for the AxisChanged event.
 */
export enum AxisChangeTypes {
  /**
   * The axis was zoomed by the user.
   */
  Zoom,

  /**
   * The axis was panned by the user.
   */
  Pan,

  /**
   * The axis zoom/pan was reset by the user.
   */
  Reset,
}

/**
 * Provides additional data for the AxisChanged event.
 */
export interface AxisChangedEventArgs {
  /**
   * The type of the change.
   */
  changeType: AxisChangeTypes

  /**
   * The delta for the minimum.
   */
  deltaMinimum: number

  /**
   * The delta for the maximum.
   */
  deltaMaximum: number
}

/**
 * Specifies the layer of an Axis.
 */
export enum AxisLayer {
  /**
   * Below all series.
   */
  BelowSeries,

  /**
   * Above all series.
   */
  AboveSeries,
}

/**
 * Specifies the position of an Axis.
 */
export enum AxisPosition {
  /**
   * No position.
   */
  None,

  /**
   * Left of the plot area.
   */
  Left,

  /**
   * Right of the plot area.
   */
  Right,

  /**
   * Top of the plot area.
   */
  Top,

  /**
   * Bottom of the plot area.
   */
  Bottom,

  /**
   * All positions.
   */
  All,
}

/**
 * Specifies the interval for a DateTimeAxis.
 */
export enum DateTimeIntervalType {
  /**
   * Automatically determine interval.
   */
  Auto = 0,

  /**
   * Manual definition of intervals.
   */
  Manual = 1,

  /**
   * Interval type is milliseconds.
   */
  Milliseconds = 2,

  /**
   * Interval type is seconds.
   */
  Seconds = 3,

  /**
   * Interval type is minutes.
   */
  Minutes = 4,

  /**
   * Interval type is hours.
   */
  Hours = 5,

  /**
   * Interval type is days.
   */
  Days = 6,

  /**
   * Interval type is weeks.
   */
  Weeks = 7,

  /**
   * Interval type is months.
   */
  Months = 8,

  /**
   * Interval type is years.
   */
  Years = 9,
}

/**
 * Defines the style of axis ticks.
 */
export enum TickStyle {
  /**
   * The ticks are rendered crossing the axis line.
   */
  Crossing,

  /**
   * The ticks are rendered inside the plot area.
   */
  Inside,

  /**
   * The ticks are rendered Outside the plot area.
   */
  Outside,

  /**
   * The ticks are not rendered.
   */
  None,
}
