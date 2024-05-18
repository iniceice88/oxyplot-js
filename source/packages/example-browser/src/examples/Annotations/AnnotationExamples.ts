import {
  ArrowAnnotation,
  AxisPosition,
  EllipseAnnotation,
  LineAnnotation,
  LinearAxis,
  newDataPoint, OxyColorHelper,
  OxyColors,
  PlotModel,
  PointAnnotation,
  RectangleAnnotation,
  TextAnnotation,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/**
 * Tool tips example.
 */
function toolTips(): PlotModel {
  const model = new PlotModel({ title: 'Tool tips' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  model.annotations.push(
    new LineAnnotation({
      slope: 0.1,
      intercept: 1,
      text: 'LineAnnotation',
      toolTip: 'This is a tool tip for the LineAnnotation',
    }),
  )
  model.annotations.push(
    new RectangleAnnotation({
      minimumX: 20,
      maximumX: 70,
      minimumY: 10,
      maximumY: 40,
      textRotation: 10,
      text: 'RectangleAnnotation',
      toolTip: 'This is a tooltip for the RectangleAnnotation',
      fill: OxyColorHelper.fromAColor(99, OxyColors.Blue),
      stroke: OxyColors.Black,
      strokeThickness: 2,
    }),
  )
  model.annotations.push(
    new EllipseAnnotation({
      x: 20,
      y: 60,
      width: 20,
      height: 15,
      text: 'EllipseAnnotation',
      toolTip: 'This is a tool tip for the EllipseAnnotation',
      textRotation: 10,
      fill: OxyColorHelper.fromAColor(99, OxyColors.Green),
      stroke: OxyColors.Black,
      strokeThickness: 2,
    }),
  )
  model.annotations.push(
    new PointAnnotation({
      x: 50,
      y: 50,
      text: 'P1',
      toolTip: 'This is a tool tip for the PointAnnotation',
    }),
  )
  model.annotations.push(
    new ArrowAnnotation({
      startPoint: newDataPoint(8, 4),
      endPoint: newDataPoint(0, 0),
      color: OxyColors.Green,
      text: 'ArrowAnnotation',
      toolTip: 'This is a tool tip for the ArrowAnnotation',
    }),
  )
  model.annotations.push(
    new TextAnnotation({
      textPosition: newDataPoint(60, 60),
      text: 'TextAnnotation',
      toolTip: 'This is a tool tip for the TextAnnotation',
    }),
  )
  return model
}

const category = 'Annotations'
export default {
  category: category,
  tags: ['Annotations'],
  examples: [
    {
      title: 'Tool tips',
      example: {
        model: toolTips,
      },
    },
  ],
} as ExampleCategory
