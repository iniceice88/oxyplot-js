import { AxisPosition, CategoryAxis, LinearAxis, PlotModel } from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/** StandardCategoryAxis */
function standardCategoryAxis(): PlotModel {
  const plotModel1 = new PlotModel({ title: 'Standard' })
  const catAxis = new CategoryAxis()
  catAxis.labels.push(...['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
  plotModel1.axes.push(catAxis)
  const linearAxis = new LinearAxis({ position: AxisPosition.Left })
  plotModel1.axes.push(linearAxis)
  return plotModel1
}

/** ItemsSourceStrings */
function itemsSourceStrings(): PlotModel {
  const model = new PlotModel({ title: 'CategoryAxis with string[] as ItemsSource' })
  model.axes.push(
    new CategoryAxis({
      stringFormatter: (value: string) => `Item ${value}`,
      itemsSource: ['A', 'B', 'C'],
    }),
  )
  const linearAxis = new LinearAxis({ position: AxisPosition.Left })
  model.axes.push(linearAxis)
  return model
}

/** ItemsSourceValues */
function itemsSourceValues(): PlotModel {
  const model = new PlotModel({ title: 'CategoryAxis with int[] as ItemsSource' })
  model.axes.push(
    new CategoryAxis({
      stringFormatter: (value: string) => `Item ${value}`,
      itemsSource: [10, 100, 123],
    }),
  )
  const linearAxis = new LinearAxis({ position: AxisPosition.Left })
  model.axes.push(linearAxis)
  return model
}

/** MajorStepCategoryAxis */
function majorStepCategoryAxis(): PlotModel {
  const plotModel1 = new PlotModel({ title: 'Major Step = 4, IsTickCentered = false' })
  const catAxis = new CategoryAxis({ isTickCentered: false, majorStep: 4 })
  catAxis.labels.push(...['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
  plotModel1.axes.push(catAxis)
  const linearAxis = new LinearAxis({ position: AxisPosition.Left })
  plotModel1.axes.push(linearAxis)
  return plotModel1
}

/** MajorStepCategoryTickCenteredAxis */
function majorStepCategoryTickCenteredAxis(): PlotModel {
  const plotModel1 = new PlotModel({ title: 'Major Step = 4, IsTickCentered = true' })
  const catAxis = new CategoryAxis({ isTickCentered: true, majorStep: 4 })
  catAxis.labels.push(...['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
  plotModel1.axes.push(catAxis)
  const linearAxis = new LinearAxis({ position: AxisPosition.Left })
  plotModel1.axes.push(linearAxis)
  return plotModel1
}

const category = 'CategoryAxis'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'Standard',
      example: {
        model: standardCategoryAxis,
      },
    },
    {
      title: 'ItemsSource - string[]',
      example: {
        model: itemsSourceStrings,
      },
    },
    {
      title: 'ItemsSource - int[]',
      example: {
        model: itemsSourceValues,
      },
    },
    {
      title: 'MajorStep',
      example: {
        model: majorStepCategoryAxis,
      },
    },
    {
      title: 'MajorStep, TickCentered',
      example: {
        model: majorStepCategoryTickCenteredAxis,
      },
    },
  ],
} as ExampleCategory
