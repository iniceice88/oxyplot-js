import {
  AxisPosition,
  CandleStickSeries,
  createHighLowItem,
  DateTimeAxis,
  LinearAxis,
  Number_MAX_VALUE,
  Number_MIN_VALUE,
  OxyColors,
  PlotModel,
} from 'oxyplot-js'
import type { ExampleCategory } from '../../types'
import { HighLowItemGenerator } from './HighLowItemGenerator'

/**
 * Creates an example showing a large data set with a wide window.
 * @returns A PlotModel.
 */
function largeDataSetWide(): PlotModel {
  const pm = new PlotModel({ title: 'Large Data Set (wide window)' })

  const timeSpanAxis1 = new DateTimeAxis({ position: AxisPosition.Bottom })
  pm.axes.push(timeSpanAxis1)
  const linearAxis1 = new LinearAxis({ position: AxisPosition.Left })
  pm.axes.push(linearAxis1)
  const n = 100_000
  const items = HighLowItemGenerator.mrProcess(n)
  const series = new CandleStickSeries({
    color: OxyColors.Black,
    increasingColor: OxyColors.DarkGreen,
    decreasingColor: OxyColors.Red,
    dataFieldX: 'Time',
    dataFieldHigh: 'H',
    dataFieldLow: 'L',
    dataFieldOpen: 'O',
    dataFieldClose: 'C',
    //trackerFormatString: 'High: {2:0.00}\nLow: {3:0.00}\nOpen: {4:0.00}\nClose: {5:0.00}',
    trackerStringFormatter: (args) =>
      `High: ${args.high!.toFixed(2)}
Low: ${args.low!.toFixed(2)}
Open: ${args.open!.toFixed(2)}
Close: ${args.close!.toFixed(2)}`,
    itemsSource: items,
  })

  const skip = n - 200,
    take = 70

  timeSpanAxis1.minimum = items[skip].x
  timeSpanAxis1.maximum = items[skip + take].x

  const partialItems = items.slice(skip, skip + take)

  linearAxis1.minimum = Math.min(...partialItems.map((x) => x.low))
  linearAxis1.maximum = Math.max(...partialItems.map((x) => x.high))

  pm.series.push(series)

  timeSpanAxis1.axisChanged = (sender, e) => _adjustYExtent(series, timeSpanAxis1, linearAxis1)

  return pm
}

/**
 * Creates an example showing a large data set with a narrow window.
 * @returns A PlotModel.
 */
function largeDataSetNarrow(): PlotModel {
  const pm = new PlotModel({ title: 'Large Data Set (narrow window)' })

  const timeSpanAxis1 = new DateTimeAxis({ position: AxisPosition.Bottom })
  pm.axes.push(timeSpanAxis1)
  const linearAxis1 = new LinearAxis({ position: AxisPosition.Left })
  pm.axes.push(linearAxis1)
  const n = 100_000
  const items = HighLowItemGenerator.mrProcess(n)
  const series = new CandleStickSeries({
    color: OxyColors.Black,
    increasingColor: OxyColors.DarkGreen,
    decreasingColor: OxyColors.Red,
    //trackerFormatString: 'High: {2:0.00}\nLow: {3:0.00}\nOpen: {4:0.00}\nClose: {5:0.00}',
    trackerStringFormatter: (args) =>
      `High: ${args.high!.toFixed(2)}
Low: ${args.low!.toFixed(2)}
Open: ${args.open!.toFixed(2)}
Close: ${args.close!.toFixed(2)}`,
    itemsSource: items,
  })

  timeSpanAxis1.minimum = items[0].x
  timeSpanAxis1.maximum = items[29].x

  linearAxis1.minimum = items
    .slice(0, 30)
    .map((x) => x.low)
    .reduce((a, b) => Math.min(a, b))
  linearAxis1.maximum = items
    .slice(0, 30)
    .map((x) => x.high)
    .reduce((a, b) => Math.max(a, b))

  pm.series.push(series)

  timeSpanAxis1.axisChanged = (sender, e) => _adjustYExtent(series, timeSpanAxis1, linearAxis1)

  return pm
}

/**
 * Creates an example showing a small data set.
 * @returns A PlotModel.
 */
function smallDataSet(): PlotModel {
  const pm = new PlotModel({ title: 'Small Data Set' })

  const timeSpanAxis1 = new DateTimeAxis({ position: AxisPosition.Bottom })
  pm.axes.push(timeSpanAxis1)
  const linearAxis1 = new LinearAxis({ position: AxisPosition.Left })
  pm.axes.push(linearAxis1)
  const n = 100
  const items = HighLowItemGenerator.mrProcess(n)
  const series = new CandleStickSeries({
    color: OxyColors.Black,
    increasingColor: OxyColors.DarkGreen,
    decreasingColor: OxyColors.Red,
    dataFieldX: 'X',
    dataFieldHigh: 'High',
    dataFieldLow: 'Low',
    dataFieldOpen: 'Open',
    dataFieldClose: 'Close',
    //trackerFormatString: 'High: {2:0.00}\nLow: {3:0.00}\nOpen: {4:0.00}\nClose: {5:0.00}',
    trackerStringFormatter: (args) =>
      `High: ${args.high!.toFixed(2)}
Low: ${args.low!.toFixed(2)}
Open: ${args.open!.toFixed(2)}
Close: ${args.close!.toFixed(2)}`,
    itemsSource: items,
  })

  pm.series.push(series)

  timeSpanAxis1.axisChanged = (sender, e) => _adjustYExtent(series, timeSpanAxis1, linearAxis1)

  return pm
}

/**
 * Creates a simple CandleStickSeries example.
 * @returns A PlotModel.
 */
function simpleExample(): PlotModel {
  const startTimeValue = DateTimeAxis.toDouble(new Date(2016, 1, 1))
  const pm = new PlotModel({ title: 'Simple CandleStickSeries example' })
  pm.axes.push(
    new DateTimeAxis({
      position: AxisPosition.Bottom,
      minimum: startTimeValue - 7,
      maximum: startTimeValue + 7,
    }),
  )
  pm.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  const series = new CandleStickSeries()
  series.items.push(createHighLowItem(startTimeValue, 100, 80, 92, 94))
  series.items.push(createHighLowItem(startTimeValue + 1, 102, 77, 94, 93))
  series.items.push(createHighLowItem(startTimeValue + 2, 99, 85, 93, 93))
  pm.series.push(series)
  return pm
}

// ==================
/**
 * Adjusts the Y extent.
 * @param series The series.
 * @param xaxis The x axis.
 * @param yaxis The y axis.
 */
function _adjustYExtent(series: CandleStickSeries, xaxis: DateTimeAxis, yaxis: LinearAxis): void {
  const xmin = xaxis.actualMinimum
  const xmax = xaxis.actualMaximum

  const istart = series.findByX(xmin)
  const iend = series.findByX(xmax, istart)

  let ymin = Number_MAX_VALUE
  let ymax = Number_MIN_VALUE
  for (let i = istart; i <= iend; i++) {
    const bar = series.items[i]
    ymin = Math.min(ymin, bar.low)
    ymax = Math.max(ymax, bar.high)
  }

  const extent = ymax - ymin
  const margin = extent * 0.1

  yaxis.zoom(ymin - margin, ymax + margin)
}

const category = 'CandleStickSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Large Data Set (wide window)',
      example: {
        model: largeDataSetWide,
      },
    },
    {
      title: 'Large Data Set (narrow window)',
      example: {
        model: largeDataSetNarrow,
      },
    },
    {
      title: 'Small Set',
      example: {
        model: smallDataSet,
      },
    },
    {
      title: 'Simple CandleStickSeries example',
      example: {
        model: simpleExample,
      },
    },
  ],
} as ExampleCategory
