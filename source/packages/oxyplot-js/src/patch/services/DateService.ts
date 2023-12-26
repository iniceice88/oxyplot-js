import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { TimeSpan } from '@/patch'

export interface IDateService {
  format: (date: Date | string, format: string) => string
  convertTime: (date: Date, timezone: string) => Date
  addYears: (date: Date, years: number) => Date
  addMonths: (date: Date, months: number) => Date
  addTimespan: (date: Date, timespan: TimeSpan) => Date
  dayOfWeek: (date: Date) => number
  /**
   * Returns the difference between two dates.
   * day1 - day2
   */
  diff: (day1: Date, day2: Date) => TimeSpan
}

let dateService: IDateService | undefined = undefined

export function getDateService(): IDateService {
  if (dateService) return dateService
  return DefaultDateService
}

export function setDateService(service: IDateService) {
  dateService = service
}

dayjs.extend(utc)
dayjs.extend(timezone)

const DefaultDateService: IDateService = {
  format: (date: Date | string, format: string) => {
    return dayjs(date).format(format)
  },
  convertTime: (date: Date, timezone: string) => {
    return dayjs(date).tz(timezone).toDate()
  },
  addYears: (date: Date, years: number) => {
    return dayjs(date).add(years, 'year').toDate()
  },
  addMonths: (date: Date, months: number) => {
    return dayjs(date).add(months, 'month').toDate()
  },
  addTimespan: (date: Date, timespan: TimeSpan) => {
    let d = dayjs(date)
    if (timespan.days) {
      d = d.add(timespan.days, 'day')
    }
    if (timespan.hours) {
      d = d.add(timespan.hours, 'hour')
    }
    if (timespan.minutes) {
      d = d.add(timespan.minutes, 'minute')
    }
    if (timespan.seconds) {
      d = d.add(timespan.seconds, 'second')
    }
    if (timespan.milliseconds) {
      d = d.add(timespan.milliseconds, 'millisecond')
    }
    return d.toDate()
  },
  dayOfWeek: (date: Date) => {
    return dayjs(date).day()
  },
  diff: (day1: Date, day2: Date) => {
    const ms = dayjs(day1).diff(dayjs(day2))
    return TimeSpan.fromMilliseconds(ms)
  }
}
