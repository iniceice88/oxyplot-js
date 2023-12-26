import type { ExampleCategory } from '../types'
import { AxisPosition, EllipseAnnotation, LinearAxis, OxyColor, OxyColors, PlotModel } from 'oxyplot-js'

function ellipseAnnotation(): PlotModel {
  const model = new PlotModel({ title: 'EllipseAnnotation' })

  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  model.annotations.push(
    new EllipseAnnotation({
      x: 20,
      y: 60,
      width: 20,
      height: 15,
      text: 'EllipseAnnotation',
      textRotation: 10,
      fill: OxyColor.fromAColor(99, OxyColors.Green),
      stroke: OxyColors.Black,
      strokeThickness: 2,
    }),
  )

  model.annotations.push(
    new EllipseAnnotation({
      x: 20,
      y: 20,
      width: 20,
      height: 20,
      fill: OxyColor.fromAColor(99, OxyColors.Green),
      stroke: OxyColors.Black,
      strokeThickness: 2,
    }),
  )

  model.annotations.push(
    new EllipseAnnotation({
      x: 30,
      y: 20,
      width: 20,
      height: 20,
      fill: OxyColor.fromAColor(99, OxyColors.Red),
      stroke: OxyColors.Black,
      strokeThickness: 2,
    }),
  )

  model.annotations.push(
    new EllipseAnnotation({
      x: 25,
      y: 30,
      width: 20,
      height: 20,
      fill: OxyColor.fromAColor(99, OxyColors.Blue),
      stroke: OxyColors.Black,
      strokeThickness: 2,
    }),
  )

  return model
}

const category = 'EllipseAnnotation'

export default {
  category: category,
  tags: ['Annotations'],
  examples: [
    {
      title: 'EllipseAnnotation',
      example: {
        model: ellipseAnnotation,
      },
    },
  ],
} as ExampleCategory
