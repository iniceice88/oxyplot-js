import {
  AxisPosition,
  BarItem,
  BarSeries,
  CategoryAxis,
  LabelPlacement,
  Legend,
  LegendPlacement,
  LinearAxis,
  OxyColor,
  OxyColors,
  PlotModel,
  TornadoBarItem,
  TornadoBarSeries,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function tornadoDiagram1(): PlotModel {
  // http://en.wikipedia.org/wiki/Tornado_diagram
  const model = new PlotModel({ title: 'Tornado diagram 1' })
  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
  })

  model.legends.push(l)

  const s1 = new BarSeries({
    title: 'High',
    isStacked: true,
    fillColor: OxyColor.fromRgb(216, 82, 85),
    baseValue: 7,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s1.items.push(new BarItem({ value: 1 }))
  s1.items.push(new BarItem({ value: 1 }))
  s1.items.push(new BarItem({ value: 4 }))
  s1.items.push(new BarItem({ value: 5 }))

  const s2 = new BarSeries({
    title: 'Low',
    isStacked: true,
    fillColor: OxyColor.fromRgb(84, 138, 209),
    baseValue: 7,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s2.items.push(new BarItem({ value: -1 }))
  s2.items.push(new BarItem({ value: -3 }))
  s2.items.push(new BarItem({ value: -2 }))
  s2.items.push(new BarItem({ value: -3 }))

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left })
  categoryAxis.labels.push('F/X rate')
  categoryAxis.labels.push('Inflation')
  categoryAxis.labels.push('Price')
  categoryAxis.labels.push('Conversion')
  const valueAxis = new LinearAxis({ position: AxisPosition.Bottom, extraGridlines: [7.0] })
  model.series.push(s1)
  model.series.push(s2)
  model.axes.push(categoryAxis)
  model.axes.push(valueAxis)
  return model
}

function tornadoDiagram2(): PlotModel {
  const model = new PlotModel({ title: 'Tornado diagram 2' })
  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
  })

  model.legends.push(l)
  const s1 = new TornadoBarSeries({ title: 'TornadoBarSeries', baseValue: 7 })
  s1.items.push(new TornadoBarItem({ minimum: 6, maximum: 8 }))
  s1.items.push(new TornadoBarItem({ minimum: 4, maximum: 8 }))
  s1.items.push(new TornadoBarItem({ minimum: 5, maximum: 11 }))
  s1.items.push(new TornadoBarItem({ minimum: 4, maximum: 12 }))

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left })
  categoryAxis.labels.push('F/X rate')
  categoryAxis.labels.push('Inflation')
  categoryAxis.labels.push('Price')
  categoryAxis.labels.push('Conversion')
  const valueAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    extraGridlines: [7.0],
    minimumPadding: 0.1,
    maximumPadding: 0.1,
  })
  model.series.push(s1)
  model.axes.push(categoryAxis)
  model.axes.push(valueAxis)
  return model
}

function tornadoDiagramWithLabels(): PlotModel {
  const model = new PlotModel({ title: 'Tornado Diagram' })
  const l = new Legend({ legendPlacement: LegendPlacement.Outside })

  model.legends.push(l)

  const s1 = new TornadoBarSeries({ baseValue: 7, labelPlacement: LabelPlacement.Outside })
  s1.items.push(new TornadoBarItem({ minimum: 6, maximum: 8, categoryIndex: 0 }))

  const s2 = new TornadoBarSeries({ baseValue: 7, labelPlacement: LabelPlacement.Inside })
  s2.items.push(new TornadoBarItem({ minimum: 4, maximum: 8, categoryIndex: 1 }))

  const s3 = new TornadoBarSeries({ baseValue: 7, labelPlacement: LabelPlacement.Middle })
  s3.items.push(new TornadoBarItem({ minimum: 5, maximum: 11, categoryIndex: 2 }))

  const s4 = new TornadoBarSeries({ baseValue: 7, labelPlacement: LabelPlacement.Base })
  s4.items.push(new TornadoBarItem({ minimum: 4, maximum: 12, categoryIndex: 3 }))

  const s5 = new TornadoBarSeries({ baseValue: 7, labelPlacement: LabelPlacement.Outside, labelAngle: -45 })
  s5.items.push(new TornadoBarItem({ minimum: 6, maximum: 8, categoryIndex: 4 }))

  const s6 = new TornadoBarSeries({ baseValue: 7, labelPlacement: LabelPlacement.Inside, labelAngle: -45 })
  s6.items.push(new TornadoBarItem({ minimum: 4, maximum: 8, categoryIndex: 5 }))

  const s7 = new TornadoBarSeries({ baseValue: 7, labelPlacement: LabelPlacement.Middle, labelAngle: -45 })
  s7.items.push(new TornadoBarItem({ minimum: 5, maximum: 11, categoryIndex: 6 }))

  const s8 = new TornadoBarSeries({ baseValue: 7, labelPlacement: LabelPlacement.Base, labelAngle: -45 })
  s8.items.push(new TornadoBarItem({ minimum: 4, maximum: 12, categoryIndex: 7 }))

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left, startPosition: 1, endPosition: 0 })
  categoryAxis.labels.push('Labels Outside')
  categoryAxis.labels.push('Labels Inside')
  categoryAxis.labels.push('Labels Middle')
  categoryAxis.labels.push('Labels Base')
  categoryAxis.labels.push('Labels Outside (angled)')
  categoryAxis.labels.push('Labels Inside (angled)')
  categoryAxis.labels.push('Labels Middle (angled)')
  categoryAxis.labels.push('Labels Base (angled)')

  const valueAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    extraGridlines: [7.0],
    minimumPadding: 0.1,
    maximumPadding: 0.1,
  })

  model.series.push(s1)
  model.series.push(s2)
  model.series.push(s3)
  model.series.push(s4)
  model.series.push(s5)
  model.series.push(s6)
  model.series.push(s7)
  model.series.push(s8)

  model.axes.push(categoryAxis)
  model.axes.push(valueAxis)

  return model
}

const category = 'TornadoBarSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Tornado diagram 1',
      example: {
        model: tornadoDiagram1,
      },
    },
    {
      title: 'Tornado diagram 2',
      example: {
        model: tornadoDiagram2,
      },
    },
    {
      title: 'Tornado diagram with various label types',
      example: {
        model: tornadoDiagramWithLabels,
      },
    },
  ],
} as ExampleCategory
