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
