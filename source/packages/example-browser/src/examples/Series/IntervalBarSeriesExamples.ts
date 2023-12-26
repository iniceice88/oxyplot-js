import {
  AxisPosition,
  CategoryAxis,
  IntervalBarItem,
  IntervalBarSeries,
  LabelPlacement,
  Legend,
  LegendPlacement,
  LinearAxis,
  OxyColors,
  PlotModel,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/**
 * Creates a PlotModel for an IntervalBarSeries.
 */
function intervalBarSeries(): PlotModel {
  const model = new PlotModel({ title: 'IntervalBarSeries' })
  const l = new Legend({ legendPlacement: LegendPlacement.Outside })

  model.legends.push(l)

  const s1 = new IntervalBarSeries({ title: 'IntervalBarSeries 1' })
  s1.items.push(new IntervalBarItem({ start: 6, end: 8 }))
  s1.items.push(new IntervalBarItem({ start: 4, end: 8 }))
  s1.items.push(new IntervalBarItem({ start: 5, end: 11 }))
  s1.items.push(new IntervalBarItem({ start: 4, end: 12 }))
  model.series.push(s1)

  const s2 = new IntervalBarSeries({ title: 'IntervalBarSeries 2' })
  s2.items.push(new IntervalBarItem({ start: 8, end: 9 }))
  s2.items.push(new IntervalBarItem({ start: 8, end: 10 }))
  s2.items.push(new IntervalBarItem({ start: 11, end: 12 }))
  s2.items.push(new IntervalBarItem({ start: 12, end: 12.5 }))
  model.series.push(s2)

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left })
  categoryAxis.labels.push('Activity A')
  categoryAxis.labels.push('Activity B')
  categoryAxis.labels.push('Activity C')
  categoryAxis.labels.push('Activity D')

  const valueAxis = new LinearAxis({ position: AxisPosition.Bottom, minimumPadding: 0.1, maximumPadding: 0.1 })

  model.axes.push(categoryAxis)
  model.axes.push(valueAxis)

  return model
}

function intervalBarSeriesWithLabels(): PlotModel {
  const model = new PlotModel({ title: 'IntervalBarSeries' })
  const l = new Legend({ legendPlacement: LegendPlacement.Outside })

  model.legends.push(l)

  const s1 = new IntervalBarSeries({
    title: 'IntervalBarSeries 1',
    labelPlacement: LabelPlacement.Outside,
  })
  s1.items.push(new IntervalBarItem({ start: 6, end: 8, categoryIndex: 0 }))
  s1.items.push(new IntervalBarItem({ start: 10, end: 12, categoryIndex: 0 }))
  model.series.push(s1)

  const s2 = new IntervalBarSeries({
    title: 'IntervalBarSeries 2',
    labelPlacement: LabelPlacement.Inside,
  })
  s2.items.push(new IntervalBarItem({ start: 4, end: 8, categoryIndex: 1 }))
  s2.items.push(new IntervalBarItem({ start: 10, end: 12, categoryIndex: 1 }))
  model.series.push(s2)

  const s3 = new IntervalBarSeries({
    title: 'IntervalBarSeries 3',
    labelPlacement: LabelPlacement.Middle,
  })
  s3.items.push(new IntervalBarItem({ start: 5, end: 11, categoryIndex: 2 }))
  s3.items.push(new IntervalBarItem({ start: 13, end: 17, categoryIndex: 2 }))
  model.series.push(s3)

  const s4 = new IntervalBarSeries({
    title: 'IntervalBarSeries 4',
    labelPlacement: LabelPlacement.Base,
    textColor: OxyColors.White,
  })
  s4.items.push(new IntervalBarItem({ start: 4, end: 12, categoryIndex: 3 }))
  s4.items.push(new IntervalBarItem({ start: 13, end: 17, categoryIndex: 3 }))
  model.series.push(s4)

  const s5 = new IntervalBarSeries({
    title: 'IntervalBarSeries 5',
    labelPlacement: LabelPlacement.Outside,
    labelAngle: -45,
  })
  s5.items.push(new IntervalBarItem({ start: 6, end: 8, categoryIndex: 4 }))
  s5.items.push(new IntervalBarItem({ start: 10, end: 12, categoryIndex: 4 }))
  model.series.push(s5)

  const s6 = new IntervalBarSeries({
    title: 'IntervalBarSeries 6',
    labelPlacement: LabelPlacement.Inside,
    labelAngle: -45,
  })
  s6.items.push(new IntervalBarItem({ start: 4, end: 8, categoryIndex: 5 }))
  s6.items.push(new IntervalBarItem({ start: 10, end: 12, categoryIndex: 5 }))
  model.series.push(s6)

  const s7 = new IntervalBarSeries({
    title: 'IntervalBarSeries 7',
    labelPlacement: LabelPlacement.Middle,
    labelAngle: -45,
  })
  s7.items.push(new IntervalBarItem({ start: 5, end: 11, categoryIndex: 6 }))
  s7.items.push(new IntervalBarItem({ start: 13, end: 17, categoryIndex: 6 }))
  model.series.push(s7)

  const s8 = new IntervalBarSeries({
    title: 'IntervalBarSeries 8',
    labelPlacement: LabelPlacement.Base,
    labelAngle: -45,
  })
  s8.items.push(new IntervalBarItem({ start: 4, end: 12, categoryIndex: 7 }))
  s8.items.push(new IntervalBarItem({ start: 13, end: 17, categoryIndex: 7 }))
  model.series.push(s8)

  const categoryAxis = new CategoryAxis({
    key: 'CategoryAxis',
    position: AxisPosition.Left,
    startPosition: 1,
    endPosition: 0,
  })
  categoryAxis.labels.push('Label Outside')
  categoryAxis.labels.push('Label Inside')
  categoryAxis.labels.push('Label Middle')
  categoryAxis.labels.push('Label Base')
  categoryAxis.labels.push('Label Outside (angled)')
  categoryAxis.labels.push('Label Inside (angled)')
  categoryAxis.labels.push('Label Middle (angled)')
  categoryAxis.labels.push('Label Base (angled)')

  const valueAxis = new LinearAxis({
    key: 'ValueAxis',
    position: AxisPosition.Bottom,
    minimumPadding: 0.1,
    maximumPadding: 0.1,
  })

  model.axes.push(categoryAxis)
  model.axes.push(valueAxis)

  return model
}

const category = 'IntervalBarSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'IntervalBarSeries',
      example: {
        model: intervalBarSeries,
      },
    },
    {
      title: 'IntervalBarSeries with various label types',
      example: {
        model: intervalBarSeriesWithLabels,
      },
    },
  ],
} as ExampleCategory
