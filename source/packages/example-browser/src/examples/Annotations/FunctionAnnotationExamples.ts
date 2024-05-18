import {
  AxisPosition,
  FunctionAnnotation,
  FunctionAnnotationType,
  LinearAxis,
  OxyColorHelper,
  OxyColors,
  PlotModel,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function annotation(): PlotModel {
  const model = new PlotModel()
  model.title = 'FunctionAnnotation'
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -20, maximum: 80 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -10, maximum: 10 }))
  model.annotations.push(
    new FunctionAnnotation({
      equation: Math.sin,
      strokeThickness: 2,
      color: OxyColorHelper.fromAColor(120, OxyColors.Blue),
      text: 'f(x)=sin(x)',
    }),
  )
  model.annotations.push(
    new FunctionAnnotation({
      equation: (y) => y * y,
      strokeThickness: 2,
      color: OxyColorHelper.fromAColor(120, OxyColors.Red),
      type: FunctionAnnotationType.EquationY,
      text: 'f(y)=y^2',
    }),
  )
  return model
}

const category = 'FunctionAnnotation'

export default {
  category: category,
  tags: ['Annotations'],
  examples: [
    {
      title: 'FunctionAnnotation',
      example: {
        model: annotation,
      },
    },
  ],
} as ExampleCategory
