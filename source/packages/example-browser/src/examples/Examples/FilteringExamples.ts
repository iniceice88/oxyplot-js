import {
  AreaSeries,
  AxisPosition,
  DataPoint_Undefined,
  LinearAxis,
  LineSeries,
  LogarithmicAxis,
  newDataPoint,
  PlotModel,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/** Filtering NaN points */
function filteringInvalidPoints(): PlotModel {
  const plot = new PlotModel({ title: 'Filtering NaN points' })
  plot.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  plot.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  const ls1 = new LineSeries()
  ls1.points.push(newDataPoint(NaN, NaN))
  ls1.points.push(newDataPoint(1, 0))
  ls1.points.push(newDataPoint(2, 10))
  ls1.points.push(newDataPoint(NaN, 20))
  ls1.points.push(newDataPoint(3, 10))
  ls1.points.push(newDataPoint(4, 0))
  ls1.points.push(newDataPoint(4.5, NaN))
  ls1.points.push(newDataPoint(5, 0))
  ls1.points.push(newDataPoint(7, 7))
  ls1.points.push(newDataPoint(NaN, NaN))
  ls1.points.push(newDataPoint(NaN, NaN))
  ls1.points.push(newDataPoint(7, 0))
  ls1.points.push(newDataPoint(NaN, NaN))
  plot.series.push(ls1)

  return plot
}

/** Filtering NaN points with AreaSeries */
function filteringInvalidPointsAreaSeries(): PlotModel {
  const plot = new PlotModel({ title: 'Filtering NaN points in an AreaSeries' })
  plot.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  plot.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  const as1 = new AreaSeries()
  as1.points.push(newDataPoint(1, 0))
  as1.points.push(newDataPoint(2, 10))
  as1.points.push(newDataPoint(3, 10))
  as1.points.push(newDataPoint(4, 0))
  as1.points.push(newDataPoint(5, 0))
  as1.points.push(newDataPoint(6, 7))
  as1.points.push(newDataPoint(7, 7))
  as1.points.push(newDataPoint(NaN, NaN))
  as1.points.push(newDataPoint(NaN, NaN))
  as1.points.push(newDataPoint(8, 0))
  as1.points.push(newDataPoint(9, 0))
  as1.points.push(newDataPoint(NaN, NaN))

  as1.points2.push(newDataPoint(1, 10))
  as1.points2.push(newDataPoint(2, 110))
  as1.points2.push(newDataPoint(3, 110))
  as1.points2.push(newDataPoint(4, 10))
  as1.points2.push(newDataPoint(5, 10))
  as1.points2.push(newDataPoint(6, 17))
  as1.points2.push(newDataPoint(7, 17))
  as1.points2.push(newDataPoint(NaN, NaN))
  as1.points2.push(newDataPoint(NaN, NaN))
  as1.points2.push(newDataPoint(8, 10))
  as1.points2.push(newDataPoint(9, 10))
  as1.points2.push(newDataPoint(NaN, NaN))

  plot.series.push(as1)

  return plot
}

/**
 * Create a plot for the FilteringUndefinedPoints function.
 * @returns A PlotModel representing the FilteringUndefinedPoints function.
 */
function filteringUndefinedPoints(): PlotModel {
  const plot = new PlotModel({ title: 'Filtering undefined points' })
  plot.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  plot.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  const ls1 = new LineSeries()
  ls1.points.push(DataPoint_Undefined)
  ls1.points.push(newDataPoint(1, 0))
  ls1.points.push(newDataPoint(2, 10))
  ls1.points.push(DataPoint_Undefined)
  ls1.points.push(newDataPoint(3, 10))
  ls1.points.push(newDataPoint(4, 0))
  ls1.points.push(DataPoint_Undefined)
  ls1.points.push(newDataPoint(5, 0))
  ls1.points.push(newDataPoint(7, 7))
  ls1.points.push(DataPoint_Undefined)
  ls1.points.push(DataPoint_Undefined)
  ls1.points.push(newDataPoint(7, 0))
  ls1.points.push(DataPoint_Undefined)
  plot.series.push(ls1)

  return plot
}

/**
 * Create a plot for the FilteringInvalidPointsLog function.
 * @returns A PlotModel representing the FilteringInvalidPointsLog function.
 */
function filteringInvalidPointsLog(): PlotModel {
  const plot = new PlotModel({ title: 'Filtering invalid points on logarithmic axes' })
  plot.axes.push(new LogarithmicAxis({ position: AxisPosition.Bottom }))
  plot.axes.push(new LogarithmicAxis({ position: AxisPosition.Left }))

  const ls = new LineSeries()
  ls.points.push(newDataPoint(NaN, NaN))
  ls.points.push(newDataPoint(1, 1))
  ls.points.push(newDataPoint(10, 10))
  ls.points.push(newDataPoint(0, 20))
  ls.points.push(newDataPoint(100, 2))
  ls.points.push(newDataPoint(1000, 12))
  ls.points.push(newDataPoint(4.5, 0))
  ls.points.push(newDataPoint(10000, 4))
  ls.points.push(newDataPoint(100000, 14))
  ls.points.push(newDataPoint(NaN, NaN))
  ls.points.push(newDataPoint(1000000, 5))
  ls.points.push(newDataPoint(NaN, NaN))
  plot.series.push(ls)

  return plot
}

/**
 * Create a plot for the FilteringPointsOutsideRange function.
 * @returns A PlotModel representing the FilteringPointsOutsideRange function.
 */
function filteringPointsOutsideRange(): PlotModel {
  const plot = new PlotModel({ title: 'Filtering points outside (-1,1)' })
  plot.axes.push(new LinearAxis({ position: AxisPosition.Bottom, filterMinValue: -1, filterMaxValue: 1 }))
  plot.axes.push(new LinearAxis({ position: AxisPosition.Left, filterMinValue: -1, filterMaxValue: 1 }))

  const ls = new LineSeries()
  for (let i = 0; i < 200; i += 0.01) {
    ls.points.push(newDataPoint(0.01 * i * Math.sin(i), 0.01 * i * Math.cos(i)))
  }

  plot.series.push(ls)
  return plot
}

const category = 'Filtering data points'

export default {
  category,
  examples: [
    {
      title: 'Filtering NaN points',
      example: {
        model: filteringInvalidPoints,
      },
    },
    {
      title: 'Filtering NaN points with AreaSeries',
      example: {
        model: filteringInvalidPointsAreaSeries,
      },
    },
    {
      title: 'Filtering undefined points',
      example: {
        model: filteringUndefinedPoints,
      },
    },
    {
      title: 'Filtering invalid points (log axis)',
      example: {
        model: filteringInvalidPointsLog,
      },
    },
    {
      title: 'Filtering points outside (-1,1)',
      example: {
        model: filteringPointsOutsideRange,
      },
    },
  ],
} as ExampleCategory
