import dayjs from 'dayjs'

/**
 * Calculation of sunrise/sunset
 * http://williams.best.vwh.net/sunrise_sunset_algorithm.htm
 */
export class Sun {
  private static deg2Rad(angle: number): number {
    return (Math.PI * angle) / 180.0
  }

  private static rad2Deg(angle: number): number {
    return (180.0 * angle) / Math.PI
  }

  private static fixValue(value: number, min: number, max: number): number {
    while (value < min) {
      value += max - min
    }

    while (value >= max) {
      value -= max - min
    }

    return value
  }

  public static calculate(
    date: Date,
    latitude: number,
    longitude: number,
    sunrise: boolean,
    utcToLocalTime: (utc: Date) => Date,
    zenith = 90.5,
  ): Date {
    // 1. first calculate the day of the year
    const n = dayjs(date).dayOfYear()

    // 2. convert the longitude to hour value and calculate an approximate time
    const lngHour = longitude / 15.0

    let t: number

    if (sunrise) {
      t = n + (6.0 - lngHour) / 24.0
    } else {
      t = n + (18.0 - lngHour) / 24.0
    }

    // 3. calculate the Sun's mean anomaly
    const m = 0.9856 * t - 3.289

    // 4. calculate the Sun's true longitude
    let l = m + 1.916 * Math.sin(this.deg2Rad(m)) + 0.02 * Math.sin(this.deg2Rad(2 * m)) + 282.634
    l = this.fixValue(l, 0, 360)

    // 5a. calculate the Sun's right ascension
    let ra = this.rad2Deg(Math.atan(0.91764 * Math.tan(this.deg2Rad(l))))
    ra = this.fixValue(ra, 0, 360)

    // 5b. right ascension value needs to be in the same quadrant as L
    const lquadrant = Math.floor(l / 90.0) * 90.0
    const raquadrant = Math.floor(ra / 90.0) * 90.0
    ra = ra + (lquadrant - raquadrant)

    // 5c. right ascension value needs to be converted into hours
    ra = ra / 15.0

    // 6. calculate the Sun's declination
    const sinDec = 0.39782 * Math.sin(this.deg2Rad(l))
    const cosDec = Math.cos(Math.asin(sinDec))

    // 7a. calculate the Sun's local hour angle
    const cosH =
      (Math.cos(this.deg2Rad(zenith)) - sinDec * Math.sin(this.deg2Rad(latitude))) /
      (cosDec * Math.cos(this.deg2Rad(latitude)))

    // 7b. finish calculating H and convert into hours
    let h: number

    if (sunrise) {
      h = 360.0 - this.rad2Deg(Math.acos(cosH))
    } else {
      h = this.rad2Deg(Math.acos(cosH))
    }

    h = h / 15.0

    // 8. calculate local mean time of rising/setting
    const localMeanTime = h + ra - 0.06571 * t - 6.622

    // 9. adjust back to UTC
    let utc = localMeanTime - lngHour

    // 10. convert UT value to local time zone of latitude/longitude
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0))
    const utctime = new Date(date.getTime() + utc * 60 * 60 * 1000)
    const localTime = utcToLocalTime(utctime)

    utc = (localTime.getTime() - date.getTime()) / (60 * 60 * 1000)
    utc = this.fixValue(utc, 0, 24)
    return new Date(date.getTime() + utc * 60 * 60 * 1000)
  }
}
