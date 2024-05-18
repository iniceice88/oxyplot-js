import {
  AreaSeries,
  AxisPosition,
  type AxisStringFormatterType,
  DateTimeAxis,
  DateTimeIntervalType,
  DayOfWeek,
  formatTimeSpan,
  getDateService,
  LinearAxis,
  LineSeries,
  LineStyle,
  MarkerType,
  newDataPoint,
  OxyColorHelper,
  OxyColors,
  PlotModel,
  TimeSpan,
  TimeSpanAxis,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { Random } from '../Random'
import { Sun } from '../Utilities/Sun'

interface DateValue {
  date: Date
  value: number
}

const defaultValues = (): PlotModel => {
  return createExample(7, undefined)
}

const stringFormat = (): PlotModel => {
  const dateService = getDateService()
  return createExample(7, (d) => dateService.format(d as Date, 'MMM DD\nYYYY'))
}

function createExample(days: number, stringFormatter?: AxisStringFormatterType): PlotModel {
  const model = new PlotModel()
  const startTime = new Date(2000, 0, 1)
  const min = DateTimeAxis.toDouble(startTime)
  const max = min + days
  model.axes.push(
    new DateTimeAxis({
      position: AxisPosition.Bottom,
      minimum: min,
      maximum: max,
      stringFormatter: stringFormatter,
    }),
  )
  model.axes.push(
    new DateTimeAxis({
      position: AxisPosition.Left,
      minimum: min,
      maximum: max,
      stringFormatter: stringFormatter,
    }),
  )
  return model
}

/** TimeZone adjustments */
function daylightSavingsBreak(): PlotModel {
  const m = new PlotModel()

  const xa = new DateTimeAxis()
  xa.position = AxisPosition.Bottom
  // TimeZone not available in TypeScript...

  m.axes.push(xa)
  m.axes.push(new LinearAxis())
  const ls = new LineSeries()
  ls.markerType = MarkerType.Circle
  m.series.push(ls)

  // set the origin of the curve to 2013-03-31 00:00:00 (UTC)
  const o = new Date(Date.UTC(2013, 2, 31, 0, 0, 0))

  // add points at 10min intervals
  // at 2am the clocks are turned forward 1 hour (W. Europe Standard Time)
  for (let i = 0; i < 400; i += 10) {
    const time = new Date(o.getTime() + i * 60000)
    ls.points.push(DateTimeAxis.createDataPoint(time, i))
  }

  return m
}

/**
 * Example plot model with DateTime axis.
 */
function dateTimeAxisPlotModel(): PlotModel {
  const start = new Date(2010, 0, 1)
  const end = new Date(2015, 0, 1)
  const increment = 3600 * 24 * 14

  const dateService = getDateService()

  // Create a random data collection
  const data: DateValue[] = []
  let date = start
  const r = new Random()
  while (date <= end) {
    data.push({ date, value: r.next() })
    date = dateService.addTimespan(date, TimeSpan.fromSeconds(increment))
  }

  const plotModel = new PlotModel({ title: 'DateTime axis' })
  const dateTimeAxis1 = new DateTimeAxis({
    firstDayOfWeek: DayOfWeek.Monday,
    position: AxisPosition.Bottom,
  })
  plotModel.axes.push(dateTimeAxis1)
  const linearAxis1 = new LinearAxis()
  plotModel.axes.push(linearAxis1)

  const lineSeries1 = new LineSeries({
    color: OxyColorHelper.fromArgb(255, 78, 154, 6),
    markerFill: OxyColorHelper.fromArgb(255, 78, 154, 6),
    markerStroke: OxyColors.ForestGreen,
    markerType: MarkerType.Plus,
    strokeThickness: 1,
    dataFieldX: 'date',
    dataFieldY: 'value',
    itemsSource: data,
  })
  plotModel.series.push(lineSeries1)

  return plotModel
}

function sunriseAndSunsetInOslo(): PlotModel {
  const year = new Date().getFullYear()

  // Convert UTC time to Western European Time (WET)
  const utcToLocalTime = (utc: Date) => {
    const offset = isDaylightSaving(utc) ? 2 : 1
    return new Date(utc.getTime() + offset * 60 * 60 * 1000)
  }

  const sunData = createSunData(year, 59.91, 10.75, utcToLocalTime)

  const plotModel1 = new PlotModel({ title: 'Sunrise and sunset in Oslo', subtitle: 'UTC time' })

  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dateTimeAxis1 = new DateTimeAxis({
    firstDayOfWeek: DayOfWeek.Monday,
    intervalType: DateTimeIntervalType.Months,
    majorGridlineStyle: LineStyle.Solid,
    position: AxisPosition.Bottom,
    stringFormatter: (d: Date) => monthsShort[d.getMonth()],
  })
  plotModel1.axes.push(dateTimeAxis1)
  const timeSpanAxis1 = new TimeSpanAxis({
    majorGridlineStyle: LineStyle.Solid,
    maximum: 86400,
    minimum: 0,
    stringFormatter: (ts: TimeSpan) => formatTimeSpan(ts, 'hh:mm'),
  })
  plotModel1.axes.push(timeSpanAxis1)

  const areaSeries1 = new AreaSeries({
    itemsSource: sunData,
    dataFieldX: 'Day',
    dataFieldY: 'Sunrise',
    dataFieldX2: 'Day',
    dataFieldY2: 'Sunset',
    fill: OxyColorHelper.fromArgb(128, 255, 255, 0),
    color: OxyColors.Black,
  })
  plotModel1.series.push(areaSeries1)

  return plotModel1
}

/** Using LabelFormatter to format labels by day of week */
function labelFormatter(): PlotModel {
  const model = new PlotModel({ title: 'Using LabelFormatter to format labels by day of week' })
  model.axes.push(
    new DateTimeAxis({
      labelFormatter: function (x) {
        return DateTimeAxis.toDateTime(x).getDay().toString().substring(0, 3)
      },
    }),
  )
  const series = new LineSeries()
  model.series.push(series)
  for (let i = 0; i < 7; i++) {
    const time = new Date(2014, 9, 10)
    time.setDate(time.getDate() + i)
    const x = DateTimeAxis.toDouble(time)
    const y = Math.sin(i * i)
    series.points.push(newDataPoint(x, y))
  }

  return model
}

// ============
interface SunItem {
  Day: Date
  Sunrise: TimeSpan
  Sunset: TimeSpan
}

function createSunData(year: number, lat: number, lon: number, utcToLocalTime: (utc: Date) => Date): SunItem[] {
  const data: SunItem[] = []
  let day = new Date(year, 0, 1)

  const timeZoneOffset = TimeSpan.fromMinutes(day.getTimezoneOffset())
  const dateService = getDateService()
  while (day.getFullYear() === year) {
    let sunrise = Sun.calculate(day, lat, lon, true, utcToLocalTime)
    sunrise = dateService.addTimespan(sunrise, timeZoneOffset)

    let sunset = Sun.calculate(day, lat, lon, false, utcToLocalTime)
    sunset = dateService.addTimespan(sunset, timeZoneOffset)
    data.push({
      Day: day,
      Sunrise: dateService.diff(sunrise, day),
      Sunset: dateService.diff(sunset, day),
    })
    day = dateService.addTimespan(day, TimeSpan.fromDays(1))
  }

  return data
}

function isDaylightSaving(time: Date): boolean {
  // Daylight saving starts last sunday in March and ends last sunday in October
  // http://en.wikipedia.org/wiki/Daylight_saving_time
  const start = new Date(time.getFullYear(), 2, 31, 2, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(time.getFullYear(), 9, 31, 3, 0, 0)
  end.setDate(end.getDate() - end.getDay())
  return time >= start && time <= end
}

const category = 'DateTimeAxis'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'Default StringFormat',
      example: {
        model: defaultValues,
      },
    },
    {
      title: "StringFormat 'MMM DD\\nYYYY'",
      example: {
        model: stringFormat,
      },
    },
    {
      title: 'TimeZone adjustments',
      example: {
        model: daylightSavingsBreak,
      },
    },
    {
      title: 'DateTime axis',
      example: {
        model: dateTimeAxisPlotModel,
      },
    },
    {
      title: 'Sunrise and sunset in Oslo',
      example: {
        model: sunriseAndSunsetInOslo,
      },
    },
    {
      title: 'LabelFormatter',
      example: {
        model: labelFormatter,
      },
    },
  ],
} as ExampleCategory
