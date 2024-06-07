import {
  AxisPosition,
  type AxisStringFormatterType,
  AxisUtilities,
  type CreateLinearAxisOptions,
  type DataPoint,
  DateTimeIntervalType,
  ExtendedDefaultLinearAxisOptions,
  LinearAxis,
  newDataPoint,
  type OxyRect,
} from '@/oxyplot'
import {
  DateTime_MaxValue,
  DateTime_MinValue,
  getDateService,
  type IDateService,
  isNullOrUndef,
  isUndef,
  assignObject,
  TimeSpan,
} from '@/patch'
import { DayOfWeek } from '../types'

export interface CreateDateTimeAxisOptions extends CreateLinearAxisOptions {
  firstDayOfWeek?: DayOfWeek
  intervalType?: DateTimeIntervalType
  minorIntervalType?: DateTimeIntervalType
  timeZone?: string
}

const DefaultDateTimeAxisOptions: CreateDateTimeAxisOptions = {
  firstDayOfWeek: DayOfWeek.Monday,
  intervalType: DateTimeIntervalType.Auto,
  minorIntervalType: DateTimeIntervalType.Auto,
  position: AxisPosition.Bottom,

  timeZone: undefined,
} as const

export const ExtendedDefaultDateTimeAxisOptions = {
  ...ExtendedDefaultLinearAxisOptions,
  ...DefaultDateTimeAxisOptions,
}

/** Represents an axis presenting DateTime values. */
export class DateTimeAxis extends LinearAxis {
  /**
   * The time origin.
   * Note: The time origin in c# is 1899-12-31
   */
  private static readonly TimeOrigin = new Date(Date.UTC(1901, 0, 1, 0, 0, 0))

  /**
   * The time origin difference in days to the c# time origin.
   */
  public static readonly TimeOriginDiffDaysToCSharp = 366

  /** The maximum day value */
  private static MaxDayValue = TimeSpan.fromMilliseconds(
    DateTime_MaxValue.getTime() - DateTimeAxis.TimeOrigin.getTime(),
  ).totalDays

  /** The minimum day value */
  private static MinDayValue = TimeSpan.fromMilliseconds(
    DateTime_MinValue.getTime() - DateTimeAxis.TimeOrigin.getTime(),
  ).totalDays

  /** The actual interval type. */
  private _actualIntervalType: DateTimeIntervalType = DateTimeIntervalType.Auto

  /** The actual minor interval type. */
  private _actualMinorIntervalType: DateTimeIntervalType = DateTimeIntervalType.Auto

  /** Initializes a new instance of the DateTimeAxis class. */
  constructor(opt?: CreateDateTimeAxisOptions) {
    super(opt)
    this._dateService = getDateService()
    assignObject(this, DefaultDateTimeAxisOptions, opt)
  }

  getElementName() {
    return 'DateTimeAxis'
  }

  private readonly _dateService: IDateService

  /** Gets or sets FirstDayOfWeek. */
  public firstDayOfWeek: DayOfWeek = DefaultDateTimeAxisOptions.firstDayOfWeek!

  /** Gets or sets IntervalType. */
  public intervalType: DateTimeIntervalType = DefaultDateTimeAxisOptions.intervalType!

  /** Gets or sets MinorIntervalType. */
  public minorIntervalType: DateTimeIntervalType = DefaultDateTimeAxisOptions.minorIntervalType!

  /** Gets or sets the time zone (used when formatting date/time values). */
  public timeZone?: string

  /** Creates a data point. */
  public static createDataPoint(x: Date, y: number): DataPoint {
    return newDataPoint(DateTimeAxis.toDouble(x), y)
  }

  /** Converts a numeric representation of the date (number of days after the time origin) to a DateTime structure. */
  public static toDateTime(value: number): Date {
    if (isNaN(value) || value < DateTimeAxis.MinDayValue || value > DateTimeAxis.MaxDayValue) {
      return new Date()
    }
    const dateService = getDateService()
    return dateService.addTimespan(DateTimeAxis.TimeOrigin, TimeSpan.fromDays(value - 1))
  }

  /**
   * Converts a numeric representation of the date (number of days after the time origin of .net version) to a DateTime structure.
   */
  public static fromDotNetValue(value: number): Date {
    value = value - DateTimeAxis.TimeOriginDiffDaysToCSharp
    return DateTimeAxis.toDateTime(value)
  }

  /** Converts a DateTime to days after the time origin. */
  public static toDouble(value: Date): number {
    const dateService = getDateService()
    return dateService.diff(value, DateTimeAxis.TimeOrigin).totalDays + 1
  }

  /** Converts a DateTime to days after the time origin. */
  itemToDouble(item: any): number {
    if (item instanceof Date) return DateTimeAxis.toDouble(item)
    return super.itemToDouble(item)
  }

  /** Gets the tick values. */
  public getTickValues() {
    let minorTickValues = this.createDateTimeTickValues(
      this.clipMinimum,
      this.clipMaximum,
      this.actualMinorStep,
      this._actualMinorIntervalType,
    )

    const majorTickValues = this.createDateTimeTickValues(
      this.clipMinimum,
      this.clipMaximum,
      this.actualMajorStep,
      this._actualIntervalType,
    )

    const majorLabelValues = majorTickValues

    minorTickValues = AxisUtilities.filterRedundantMinorTicks(majorTickValues, minorTickValues)

    return {
      majorLabelValues,
      majorTickValues,
      minorTickValues,
    }
  }

  /** Gets the value from an axis coordinate, converts from double to the correct data type if necessary. */
  public getValue(x: number): Date {
    const time = DateTimeAxis.toDateTime(x)

    if (this.timeZone) {
      return this._dateService.convertTime(time, this.timeZone)
    }

    return time
  }

  updateIntervals(plotArea: OxyRect): void {
    super.updateIntervals(plotArea)
    const hasStringFormatter = !isNullOrUndef(this.stringFormatter)
    switch (this._actualIntervalType) {
      case DateTimeIntervalType.Years:
        this.actualMinorStep = 31
        this._actualMinorIntervalType = DateTimeIntervalType.Years
        if (!hasStringFormatter) {
          this.actualStringFormatter = (d: any) => this._dateService.format(d, 'YYYY')
        }
        break
      case DateTimeIntervalType.Months:
        this._actualMinorIntervalType = DateTimeIntervalType.Months
        if (!hasStringFormatter) {
          this.actualStringFormatter = (d: any) => this._dateService.format(d, 'YYYY-MM-DD')
        }
        break
      case DateTimeIntervalType.Weeks:
        this._actualMinorIntervalType = DateTimeIntervalType.Days
        this.actualMajorStep = 7
        this.actualMinorStep = 1
        if (!hasStringFormatter) {
          this.actualStringFormatter = (d: any) => this._dateService.format(d, 'YYYY/ww')
        }
        break
      case DateTimeIntervalType.Days:
        this.actualMinorStep = this.actualMajorStep
        if (!hasStringFormatter) {
          this.actualStringFormatter = (d: any) => this._dateService.format(d, 'YYYY-MM-DD')
        }
        break
      case DateTimeIntervalType.Hours:
        this.actualMinorStep = this.actualMajorStep
        if (!hasStringFormatter) {
          this.actualStringFormatter = (d: any) => this._dateService.format(d, 'HH:mm')
        }
        break
      case DateTimeIntervalType.Minutes:
        this.actualMinorStep = this.actualMajorStep
        if (!hasStringFormatter) {
          this.actualStringFormatter = (d: any) => this._dateService.format(d, 'HH:mm')
        }
        break
      case DateTimeIntervalType.Seconds:
        this.actualMinorStep = this.actualMajorStep
        if (!hasStringFormatter) {
          this.actualStringFormatter = (d: any) => this._dateService.format(d, 'HH:mm:ss')
        }
        break
      case DateTimeIntervalType.Milliseconds:
        this.actualMinorStep = this.actualMajorStep
        if (!hasStringFormatter) {
          this.actualStringFormatter = (d: any) => this._dateService.format(d, 'HH:mm:ss.SSS')
        }
        break
      case DateTimeIntervalType.Manual:
        break
      case DateTimeIntervalType.Auto:
        break
    }
  }

  protected getDefaultStringFormatter(): AxisStringFormatterType {
    return (d) => this._dateService.format(d as Date, 'yyyy-MM-dd')
  }

  protected formatValueOverride(x: number): string {
    // convert the double value to a Date
    let time = DateTimeAxis.toDateTime(x)
    // If a time zone is specified, convert the time
    if (this.timeZone) {
      time = this._dateService.convertTime(time, this.timeZone)
    }

    const fmt = this.actualStringFormatter
    if (!fmt) {
      // CultureInfo.CurrentCulture.DateTimeFormat.ShortDatePattern
      return time.toLocaleDateString()
    }

    return fmt(time)
  }

  /**
   * Calculates the actual interval for a DateTimeAxis.
   * @param availableSize The available size for the axis.
   * @param maxIntervalSize The maximum size of an interval.
   * @param minIntervalCount The minimum number of intervals.
   * @param maxIntervalCount The maximum number of intervals.
   * @returns The actual interval size.
   */
  protected override calculateActualInterval(
    availableSize: number,
    maxIntervalSize: number,
    minIntervalCount: number,
    maxIntervalCount: number,
    range?: number,
  ): number {
    // Constants for different time units
    const year = 365.25
    const month = 30.5
    const week = 7
    const day = 1.0
    const hour = day / 24
    const minute = hour / 60
    const second = minute / 60
    const milliSecond = second / 1000

    // Calculate the range of the axis
    range = Math.abs(this.clipMinimum - this.clipMaximum)

    // List of potential intervals
    const goodIntervals = [
      milliSecond,
      2 * milliSecond,
      10 * milliSecond,
      100 * milliSecond,
      second,
      2 * second,
      5 * second,
      10 * second,
      30 * second,
      minute,
      2 * minute,
      5 * minute,
      10 * minute,
      30 * minute,
      hour,
      4 * hour,
      8 * hour,
      12 * hour,
      day,
      2 * day,
      5 * day,
      week,
      2 * week,
      month,
      2 * month,
      3 * month,
      4 * month,
      6 * month,
      year,
    ]
    // Start with the smallest interval
    let interval = goodIntervals[0]

    // Bound min/max interval counts
    minIntervalCount = Math.max(minIntervalCount, 0)
    maxIntervalCount = Math.min(maxIntervalCount, Math.max(Math.floor(availableSize / maxIntervalSize), 2))

    // Find the first interval that fits the desired range and number of intervals
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (range / interval < maxIntervalCount) {
        break
      }

      let nextInterval = goodIntervals.find((i) => i > interval)
      if (isUndef(nextInterval)) throw new Error(`cannot calculate interval,range=${range}`)

      if (Math.abs(nextInterval) <= 0) {
        nextInterval = interval * 2
      }

      if (range / nextInterval < minIntervalCount) {
        break
      }

      interval = nextInterval
    }

    // Determine the actual interval type based on the calculated interval
    this._actualIntervalType = this.intervalType
    this._actualMinorIntervalType = this.minorIntervalType

    if (this.intervalType === DateTimeIntervalType.Auto) {
      this._actualIntervalType = DateTimeIntervalType.Milliseconds

      if (interval >= 1.0 / 24 / 60 / 60) {
        this._actualIntervalType = DateTimeIntervalType.Seconds
      }

      if (interval >= 1.0 / 24 / 60) {
        this._actualIntervalType = DateTimeIntervalType.Minutes
      }

      if (interval >= 1.0 / 24) {
        this._actualIntervalType = DateTimeIntervalType.Hours
      }

      if (interval >= 1) {
        this._actualIntervalType = DateTimeIntervalType.Days
      }

      if (interval >= 30) {
        this._actualIntervalType = DateTimeIntervalType.Months
      }

      if (range >= 365.25) {
        this._actualIntervalType = DateTimeIntervalType.Years
      }
    }

    // Handle special cases for months and years
    if (this._actualIntervalType === DateTimeIntervalType.Months) {
      const monthsRange = range / 30.5
      interval = super.calculateActualInterval(
        availableSize,
        maxIntervalSize,
        this.minimumMajorIntervalCount,
        this.maximumMajorIntervalCount,
        monthsRange,
      )
    }

    if (this._actualIntervalType === DateTimeIntervalType.Years) {
      const yearsRange = range / 365.25
      interval = super.calculateActualInterval(
        availableSize,
        maxIntervalSize,
        this.minimumMajorIntervalCount,
        this.maximumMajorIntervalCount,
        yearsRange,
      )
    }

    // Determine the actual minor interval type based on the actual interval type
    if (this._actualMinorIntervalType === DateTimeIntervalType.Auto) {
      switch (this._actualIntervalType) {
        case DateTimeIntervalType.Years:
          this._actualMinorIntervalType = DateTimeIntervalType.Months
          break
        case DateTimeIntervalType.Months:
          this._actualMinorIntervalType = DateTimeIntervalType.Days
          break
        case DateTimeIntervalType.Weeks:
          this._actualMinorIntervalType = DateTimeIntervalType.Days
          break
        case DateTimeIntervalType.Days:
          this._actualMinorIntervalType = DateTimeIntervalType.Hours
          break
        case DateTimeIntervalType.Hours:
          this._actualMinorIntervalType = DateTimeIntervalType.Minutes
          break
        default:
          this._actualMinorIntervalType = DateTimeIntervalType.Days
          break
      }
    }

    return interval
  }

  /**
   * Creates the date tick values.
   * @param min The minimum value of the axis.
   * @param max The maximum value of the axis.
   * @param step The step size for generating ticks.
   * @param intervalType The type of interval for generating ticks.
   * @returns A list of date tick values.
   */
  private createDateTickValues(min: number, max: number, step: number, intervalType: DateTimeIntervalType): number[] {
    const values: number[] = []

    // Convert minimum value to DateTime object
    let start = DateTimeAxis.toDateTime(min)
    if (!start) {
      // Invalid start time
      return values
    }

    let dayOfWeek = 0
    switch (intervalType) {
      case DateTimeIntervalType.Weeks:
        // Ensure the first tick is on the first day of the week according to `FirstDayOfWeek`
        dayOfWeek = this._dateService.dayOfWeek(start)
        start = this._dateService.addTimespan(start, TimeSpan.fromDays(-dayOfWeek + this.firstDayOfWeek))
        break
      case DateTimeIntervalType.Months:
        // Ensure the first tick is on the first day of the month
        start = new Date(start.getFullYear(), start.getMonth(), 1)
        break
      case DateTimeIntervalType.Years:
        // Ensure the first tick is on January 1st
        start = new Date(start.getFullYear(), 0, 1)
        break
    }

    // Add a tick to the end time to include the ending DateTime
    const end = this._dateService.addTimespan(DateTimeAxis.toDateTime(max), TimeSpan.fromMilliseconds(1))
    if (!end) {
      // Invalid end time
      return values
    }

    let current = start
    const eps = step * 1e-3
    const minDateTime = DateTimeAxis.toDateTime(min - eps)
    const maxDateTime = DateTimeAxis.toDateTime(max + eps)

    if (!minDateTime || !maxDateTime) {
      // Invalid min/max time
      return values
    }

    while (current < end) {
      if (current > minDateTime && current < maxDateTime) {
        values.push(DateTimeAxis.toDouble(current))
      }

      switch (intervalType) {
        case DateTimeIntervalType.Months:
          current = this._dateService.addMonths(current, Math.ceil(step))
          break
        case DateTimeIntervalType.Years:
          current = this._dateService.addYears(current, Math.ceil(step))
          break
        default:
          current = this._dateService.addTimespan(current, TimeSpan.fromDays(step))
          break
      }
    }

    return values
  }

  /**
   * Creates DateTime tick values.
   * @param min The minimum value of the axis.
   * @param max The maximum value of the axis.
   * @param interval The interval value for tick generation.
   * @param intervalType The type of interval used for tick generation.
   * @returns A list of DateTime tick values.
   */
  private createDateTimeTickValues(
    min: number,
    max: number,
    interval: number,
    intervalType: DateTimeIntervalType,
  ): number[] {
    // For longer intervals (e.g. months or years), use a specialized method that adds ticks with uneven spacing
    if (intervalType > DateTimeIntervalType.Days) {
      return this.createDateTickValues(min, max, interval, intervalType)
    }

    const a = 1
    a.toLocaleString(undefined, {})

    // For shorter intervals, use the standard Axis method for tick generation
    return this.createTickValues(min, max, interval)
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultDateTimeAxisOptions
  }
}
