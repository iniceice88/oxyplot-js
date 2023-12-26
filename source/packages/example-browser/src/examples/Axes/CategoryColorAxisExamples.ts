import { AxisPosition, CategoryColorAxis, LinearAxis, OxyPalettes, PlotModel, ScatterSeries } from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/** CategoryColorAxis */
function standardCategoryColorAxis(): PlotModel {
  const plotModel1 = new PlotModel({ title: 'CategoryColorAxis' })
  const catAxis = new CategoryColorAxis({ key: 'ccc', palette: OxyPalettes.blackWhiteRed(12) })
  catAxis.labels.push(...['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
  plotModel1.axes.push(catAxis)
  const linearAxis = new LinearAxis({ position: AxisPosition.Left })
  const ss = new ScatterSeries({ colorAxisKey: catAxis.key })
  ss.points.push({
    x: 0,
    y: 0,
    size: NaN,
    value: 0,
  })
  ss.points.push({
    x: 3,
    y: 0,
    size: NaN,
    value: 3,
  })
  plotModel1.series.push(ss)
  plotModel1.axes.push(linearAxis)
  return plotModel1
}

/** Centered ticks, MajorStep = 4 */
function majorStep4(): PlotModel {
  const plotModel1 = new PlotModel({ title: 'Major Step = 4, IsTickCentered = true' })
  const catAxis = new CategoryColorAxis({
    palette: OxyPalettes.blackWhiteRed(3),
    isTickCentered: true,
    majorStep: 4,
  })
  catAxis.labels.push(...['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
  plotModel1.axes.push(catAxis)
  const linearAxis = new LinearAxis({ position: AxisPosition.Left })
  plotModel1.axes.push(linearAxis)
  return plotModel1
}

const category = 'CategoryColorAxis'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'CategoryColorAxis',
      example: {
        model: standardCategoryColorAxis,
      },
    },
    {
      title: 'Centered ticks, MajorStep = 4',
      example: {
        model: majorStep4,
      },
    },
  ],
} as ExampleCategory
