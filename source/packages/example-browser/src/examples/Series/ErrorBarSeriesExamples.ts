import {
  AxisPosition,
  CategoryAxis,
  ErrorBarSeries,
  Legend,
  LegendOrientation,
  LegendPlacement,
  LegendPosition,
  LinearAxis,
  newErrorBarItem,
  OxyColors,
  PlotModel,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function getErrorBarSeries(): PlotModel {
  const model = new PlotModel({ title: 'ErrorBarSeries' })

  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.BottomCenter,
    legendOrientation: LegendOrientation.Horizontal,
    legendBorderThickness: 0,
  })

  model.legends.push(l)

  const s1 = new ErrorBarSeries({
    title: 'Series 1',
    isStacked: false,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s1.items.push(newErrorBarItem({ value: 25, error: 2 }))
  s1.items.push(newErrorBarItem({ value: 137, error: 25 }))
  s1.items.push(newErrorBarItem({ value: 18, error: 4 }))
  s1.items.push(newErrorBarItem({ value: 40, error: 29 }))

  const s2 = new ErrorBarSeries({
    title: 'Series 2',
    isStacked: false,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s2.items.push(newErrorBarItem({ value: 35, error: 20 }))
  s2.items.push(newErrorBarItem({ value: 17, error: 7 }))
  s2.items.push(newErrorBarItem({ value: 118, error: 44 }))
  s2.items.push(newErrorBarItem({ value: 49, error: 29 }))

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left })
  categoryAxis.labels.push('Category A')
  categoryAxis.labels.push('Category B')
  categoryAxis.labels.push('Category C')
  categoryAxis.labels.push('Category D')

  const valueAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    minimumPadding: 0,
    maximumPadding: 0.06,
    absoluteMinimum: 0,
  })
  model.series.push(s1)
  model.series.push(s2)
  model.axes.push(categoryAxis)
  model.axes.push(valueAxis)

  return model
}

function getErrorBarSeriesThickErrorLines(): PlotModel {
  const model = getErrorBarSeries()
  for (const s of model.series) {
    if (s instanceof ErrorBarSeries) {
      s.errorWidth = 0
      s.errorStrokeThickness = 4
    }
  }

  return model
}

const category = 'ErrorBarSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'ErrorBarSeries',
      example: {
        model: getErrorBarSeries,
      },
    },
    {
      title: 'ErrorBarSeries (thick error lines)',
      example: {
        model: getErrorBarSeriesThickErrorLines,
      },
    },
  ],
} as ExampleCategory
