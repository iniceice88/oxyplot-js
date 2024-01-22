const $1Second = 1000
const $1Minute = 60_000
const $1Hour = 3600_000
const $1Day = 86400_000

export class TimeSpan {
  private readonly _totalMs: number = 0

  private readonly _ms: number = 0
  private readonly _seconds: number = 0
  private readonly _minutes: number = 0
  private readonly _hours: number = 0
  private readonly _days: number = 0

  private constructor(private ms: number) {
    this._totalMs = ms
    const sign = ms < 0 ? -1 : 1
    let remainMs = Math.abs(ms)
    if (remainMs >= $1Day) {
      this._days = sign * Math.floor(remainMs / $1Day)
      remainMs = remainMs % $1Day
    }
    if (remainMs >= $1Hour) {
      this._hours = sign * Math.floor(remainMs / $1Hour)
      remainMs = remainMs % $1Hour
    }
    if (remainMs >= $1Minute) {
      this._minutes = sign * Math.floor(remainMs / $1Minute)
      remainMs = remainMs % $1Minute
    }
    if (remainMs >= $1Second) {
      this._seconds = sign * Math.floor(remainMs / $1Second)
      remainMs = remainMs % $1Second
    }
    this._ms = sign * remainMs
  }

  get milliseconds() {
    return this._ms
  }

  get seconds() {
    return this._seconds
  }

  get minutes() {
    return this._minutes
  }

  get hours() {
    return this._hours
  }

  get days() {
    return this._days
  }

  get totalMs() {
    return this._totalMs
  }

  get totalSeconds() {
    return this._totalMs / $1Second
  }

  get totalMinutes() {
    return this._totalMs / $1Minute
  }

  get totalHours() {
    return this._totalMs / $1Hour
  }

  get totalDays() {
    return this._totalMs / $1Day
  }

  static fromMilliseconds(ms: number) {
    return new TimeSpan(ms)
  }

  static fromSeconds(sec: number) {
    return new TimeSpan(sec * $1Second)
  }

  static fromMinutes(min: number) {
    return new TimeSpan(min * $1Minute)
  }

  static fromHours(hours: number) {
    return new TimeSpan(hours * $1Hour)
  }

  static fromDays(days: number) {
    return new TimeSpan(days * $1Day)
  }

  static from(days: number = 0, hours: number = 0, minutes: number = 0, seconds: number = 0, ms: number = 0) {
    return new TimeSpan(days * $1Day + hours * $1Hour + minutes * $1Minute + seconds * $1Second + ms)
  }

  public toString = (): string => {
    return `${this._days}day ${this._hours}hour ${this._minutes}minute ${this._seconds}second ${this._ms}ms`
  }
}
