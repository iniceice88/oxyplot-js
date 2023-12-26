import type { TimeSpan } from './TimeSpan'

export const DateTime_MaxValue = new Date(9999, 11, 31, 23, 59, 59, 999)
export const DateTime_MinValue = new Date(1, 0, 1, 0, 0, 0, 0)
DateTime_MinValue.setUTCFullYear(1)
DateTime_MinValue.setUTCMonth(0)
DateTime_MinValue.setUTCDate(1)
DateTime_MinValue.setUTCHours(0)
DateTime_MinValue.setUTCMinutes(0)
DateTime_MinValue.setUTCSeconds(0)
DateTime_MinValue.setUTCMilliseconds(0)

export type TimeSpanFormat = 'd:hh:mm:ss' | 'hh:mm:ss' | 'hh:mm'

export function formatTimeSpan(ts: TimeSpan, format: TimeSpanFormat) {
  let result = ''
  if (format.includes('d')) {
    result += ts.days.toString().padStart(2, '0') + ':'
  }
  if (format.includes('hh')) {
    result += ts.hours.toString().padStart(2, '0') + ':'
  }
  if (format.includes('mm')) {
    result += ts.minutes.toString().padStart(2, '0') + ':'
  }
  if (format.includes('ss')) {
    result += ts.seconds.toString().padStart(2, '0')
  }

  if (!result) throw new Error('Invalid format')
  return result
}
