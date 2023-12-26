import { ArrowAnnotation, AxisPosition, DataPoint, LinearAxis, OxyColors, PlotModel, ScreenVector } from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function arrowAnnotation() {
  const model = new PlotModel()
  model.title = 'ArrowAnnotations'
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -40, maximum: 60 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -10, maximum: 10 }))
  model.annotations.push(
    new ArrowAnnotation({
      startPoint: new DataPoint(8, 4),
      endPoint: new DataPoint(0, 0),
      color: OxyColors.Green,
      text: 'StartPoint and EndPoint',
    }),
  )

  model.annotations.push(
    new ArrowAnnotation({
      arrowDirection: new ScreenVector(30, 70),
      endPoint: new DataPoint(40, -3),
      color: OxyColors.Blue,
      text: 'ArrowDirection and EndPoint',
    }),
  )

  model.annotations.push(
    new ArrowAnnotation({
      arrowDirection: new ScreenVector(30, -70),
      endPoint: new DataPoint(10, -3),
      headLength: 14,
      headWidth: 6,
      veeness: 4,
      color: OxyColors.Red,
      text: 'HeadLength = 20, HeadWidth = 10, Veeness = 4',
    }),
  )

  return model
}

const category = 'ArrowAnnotation'

export default {
  category: category,
  tags: ['Annotations'],
  examples: [
    {
      title: 'ArrowAnnotation',
      example: {
        model: arrowAnnotation,
      },
    },
  ],
} as ExampleCategory
