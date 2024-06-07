import {
  type AxisStringFormatterType,
  type CreateLinearAxisOptions,
  ExtendedDefaultLinearAxisOptions,
  LinearAxis,
} from '@/oxyplot'
import { assignObject, TimeSpan } from '@/patch'

export interface CreateTimeSpanAxisOptions extends CreateLinearAxisOptions {}

const DefaultTimeSpanAxisOptions: CreateTimeSpanAxisOptions = {}

export const ExtendedDefaultTimeSpanAxisOptions = {
  ...ExtendedDefaultLinearAxisOptions,
  ...DefaultTimeSpanAxisOptions,
}

/**
 * Represents an axis presenting TimeSpan values.
 * The values should be in seconds.
 * The StringFormat value can be used to force formatting of the axis values
 * "h:mm" shows hours and minutes
 * "m:ss" shows minutes and seconds
 */
export class TimeSpanAxis extends LinearAxis {
  constructor(opt?: CreateTimeSpanAxisOptions) {
    super(opt)
    assignObject(this, DefaultTimeSpanAxisOptions, opt)
  }

  getElementName() {
    return 'TimeSpanAxis'
  }

  /**
   * Converts a time span to a double.
   * @param s The time span.
   * @returns A double value.
   */
  public static toDouble(s: TimeSpan): number {
    return s.totalSeconds
  }

  /**
   * Converts a time span to a double.
   * @returns A double value.
   */
  itemToDouble(item: any): number {
    if (item instanceof TimeSpan) return TimeSpanAxis.toDouble(item)
    return super.itemToDouble(item)
  }

  /**
   * Converts a double to a time span.
   * @param value The value.
   * @returns A time span.
   */
  public static toTimeSpan(value: number): TimeSpan {
    return TimeSpan.fromSeconds(value)
  }

  /**
   * Gets the value from an axis coordinate, converts from double to the correct data type if necessary. e.g. DateTimeAxis returns the DateTime and CategoryAxis returns category strings.
   * @param x The coordinate.
   * @returns The value.
   */
  public getValue(x: number): any {
    return TimeSpanAxis.toTimeSpan(x)
  }

  /**
   * Gets the default formatter.
   * @returns The default formatter.
   */
  protected getDefaultStringFormatter(): AxisStringFormatterType | undefined {
    function padZero(n: number): string {
      return n.toString().padStart(2, '0')
    }

    return (ts: TimeSpan) => {
      return `${ts.hours}:${padZero(ts.minutes)}:${padZero(ts.seconds)}`
    }
  }

  /**
   * Formats the value to be used on the axis.
   * @param x The value to format.
   * @returns The formatted value.
   */
  protected formatValueOverride(x: number): string {
    const span = TimeSpanAxis.toTimeSpan(x)

    const fmt = this.actualStringFormatter ?? this.stringFormatter
    if (!fmt) return span.toString()

    return fmt(span)
  }

  /**
   * Calculates the actual interval.
   * @param availableSize The available size.
   * @param maxIntervalSize The maximum interval size.
   * @param minIntervalCount The minimum number of intervals.
   * @param maxIntervalCount The maximum number of intervals.
   * @returns The actual interval size.
   */
  protected calculateActualInterval(
    availableSize: number,
    maxIntervalSize: number,
    minIntervalCount: number,
    maxIntervalCount: number,
  ): number {
    const range = Math.abs(this.clipMinimum - this.clipMaximum)
    let interval = 1
    const goodIntervals = [1.0, 5, 10, 30, 60, 120, 300, 600, 900, 1200, 1800, 3600]

    // bound min/max interval counts
    minIntervalCount = Math.max(minIntervalCount, 0)
    maxIntervalCount = Math.min(maxIntervalCount, Math.max(Math.floor(availableSize / maxIntervalSize), 2))

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (range / interval < maxIntervalCount) {
        break
      }

      let nextInterval = goodIntervals.find((i) => i > interval)!
      if (!nextInterval) {
        nextInterval = interval * 2
      }

      if (range / nextInterval < minIntervalCount) {
        break
      }

      interval = nextInterval
    }

    return interval
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultTimeSpanAxisOptions
  }
}
