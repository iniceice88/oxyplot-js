import type { ExampleCategory } from '../types'

import {
  AxisPosition,
  type AxisStringFormatterType,
  formatTimeSpan,
  LinearAxis,
  LineSeries,
  MarkerType,
  OxyColorHelper,
  OxyColors,
  PlotModel,
  TimeSpan,
  TimeSpanAxis,
} from 'oxyplot-js'
import { Random } from '../Random'

interface TimeValue {
  time: number
  value: number
}

function timeSpanaxisPlotModelDefault() {
  return timeSpanAxisPlotModel(undefined)
}

function timeSpanaxisPlotModel1() {
  return timeSpanAxisPlotModel((ts: TimeSpan) => {
    return `${formatTimeSpan(ts, 'hh:mm')}`
  })
}

function timeSpanAxisPlotModel(stringFormatter?: AxisStringFormatterType): PlotModel {
  const start = 0
  const end = 24 * 60 * 60 // 24 hours in seconds
  const increment = 3600

  // Create a random data collection
  const data: TimeValue[] = []
  let current = start
  const r = new Random()
  while (current <= end) {
    data.push({ time: current, value: r.next() })
    current += increment
  }

  const plotModel1 = new PlotModel({ title: 'TimeSpan axis' })
  const timeSpanAxis1 = new TimeSpanAxis({
    position: AxisPosition.Bottom,
    stringFormatter: stringFormatter,
  })
  plotModel1.axes.push(timeSpanAxis1)
  const linearAxis1 = new LinearAxis({ position: AxisPosition.Left })
  plotModel1.axes.push(linearAxis1)
  const lineSeries1 = new LineSeries({
    color: OxyColorHelper.fromArgb(255, 78, 154, 6),
    markerFill: OxyColorHelper.fromArgb(255, 78, 154, 6),
    markerStroke: OxyColors.ForestGreen,
    markerType: MarkerType.Plus,
    strokeThickness: 1,
    dataFieldX: 'time',
    dataFieldY: 'value',
    itemsSource: data,
  })
  plotModel1.series.push(lineSeries1)
  return plotModel1
}

const category = 'TimeSpanAxis'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'Default StringFormat',
      example: {
        model: timeSpanaxisPlotModelDefault,
      },
    },
    {
      title: "StringFormat = 'h:mm'",
      example: {
        model: timeSpanaxisPlotModel1,
      },
    },
  ],
} as ExampleCategory
