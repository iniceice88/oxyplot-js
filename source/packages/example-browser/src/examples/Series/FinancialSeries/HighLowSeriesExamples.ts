import {
  AxisPosition,
  createHighLowItem,
  DateTimeAxis,
  DateTimeIntervalType,
  getDateService,
  HighLowSeries,
  Legend,
  LinearAxis,
  OxyColors,
  PlotModel,
} from 'oxyplot-js'
import type { ExampleCategory } from '../../types'
import { Random } from '../../Random'

function highLowSeries(): PlotModel {
  const model = new PlotModel({ title: 'HighLowSeries' })
  const l = new Legend({
    legendSymbolLength: 24,
  })

  model.legends.push(l)

  const s1 = new HighLowSeries({ title: 'HighLowSeries 1', color: OxyColors.Black })
  const r = new Random(314)
  let price = 100.0
  for (let x = 0; x < 24; x++) {
    price = price + r.next() + 0.1
    const high = price + 10 + r.next() * 10
    const low = price - (10 + r.next() * 10)
    const open = low + r.next() * (high - low)
    const close = low + r.next() * (high - low)
    s1.items.push({ x, high, low, open, close })
  }

  model.series.push(s1)
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, maximumPadding: 0.3, minimumPadding: 0.3 }))

  return model
}

function highLowSeriesDateTimeAxis(): PlotModel {
  const m = new PlotModel()
  const x0 = DateTimeAxis.toDouble(new Date(2013, 5, 4))
  const dateService = getDateService()
  const a = new DateTimeAxis({
    position: AxisPosition.Bottom,
    minimum: x0 - 0.9,
    maximum: x0 + 1.9,
    intervalType: DateTimeIntervalType.Days,
    majorStep: 1,
    minorStep: 1,
    //stringFormat: 'yyyy-MM-dd'
    stringFormatter: (d) => dateService.format(d, 'YYYY-MM-DD'),
  })
  m.axes.push(a)
  const s = new HighLowSeries({
    //trackerFormatString: 'X: {1:yyyy-MM-dd}\nHigh: {2:0.00}\nLow: {3:0.00}\nOpen: {4:0.00}\nClose: {5:0.00}'
    trackerStringFormatter: (args) =>
      `X: ${dateService.format(args.xValue, 'YYYY-MM-DD')}
High: ${args.high!.toFixed(2)}
Low: ${args.low!.toFixed(2)}
Open: ${args.open!.toFixed(2)}
Close: ${args.close!.toFixed(2)}`,
  })

  s.items.push(createHighLowItem(x0, 14, 10, 13, 12.4))
  s.items.push(createHighLowItem(x0 + 1, 17, 8, 12.4, 16.3))
  m.series.push(s)

  return m
}

const category = 'HighLowSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'HighLowSeries',
      example: {
        model: highLowSeries,
      },
    },
    {
      title: 'HighLowSeries (DateTime axis)',
      example: {
        model: highLowSeriesDateTimeAxis,
      },
    },
  ],
} as ExampleCategory
