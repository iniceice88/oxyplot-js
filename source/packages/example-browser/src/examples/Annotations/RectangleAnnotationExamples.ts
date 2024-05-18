import {
  AxisPosition,
  LinearAxis,
  LineJoin,
  LineSeries,
  newDataPoint,
  OxyColorHelper,
  OxyColors,
  PlotModel,
  RectangleAnnotation,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function rectangleAnnotation(): PlotModel {
  const model = new PlotModel({ title: 'RectangleAnnotation' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  model.annotations.push(
    new RectangleAnnotation({
      minimumX: 20,
      maximumX: 70,
      minimumY: 10,
      maximumY: 40,
      textRotation: 10,
      text: 'RectangleAnnotation',
      fill: OxyColorHelper.fromAColor(99, OxyColors.Blue),
      stroke: OxyColors.Black,
      strokeThickness: 2,
    }),
  )
  return model
}

function rectangleAnnotationVerticalLimit(): PlotModel {
  const model = new PlotModel({ title: 'RectangleAnnotations - vertical limit' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  model.annotations.push(
    new RectangleAnnotation({
      maximumY: 89.5,
      text: 'Valid area',
      fill: OxyColorHelper.fromAColor(99, OxyColors.Black),
    }),
  )
  return model
}

function rectangleAnnotationHorizontals(): PlotModel {
  const model = new PlotModel({ title: 'RectangleAnnotation - horizontal bands' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: 0, maximum: 10 }))
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 87,
      maximum: 97,
      majorStep: 1,
      minorStep: 1,
    }),
  )
  model.annotations.push(
    new RectangleAnnotation({
      minimumY: 89.5,
      maximumY: 90.8,
      text: 'Invalid',
      fill: OxyColorHelper.fromAColor(99, OxyColors.Red),
    }),
  )
  model.annotations.push(
    new RectangleAnnotation({
      minimumY: 90.8,
      maximumY: 92.1,
      fill: OxyColorHelper.fromAColor(99, OxyColors.Orange),
    }),
  )
  model.annotations.push(
    new RectangleAnnotation({
      minimumY: 92.1,
      maximumY: 94.6,
      fill: OxyColorHelper.fromAColor(99, OxyColors.Yellow),
    }),
  )
  model.annotations.push(
    new RectangleAnnotation({
      minimumY: 94.6,
      maximumY: 96,
      text: 'Ok',
      fill: OxyColorHelper.fromAColor(99, OxyColors.Green),
    }),
  )
  const series1 = new LineSeries({ color: OxyColors.Black, strokeThickness: 6.0, lineJoin: LineJoin.Round })
  series1.points.push(newDataPoint(0.5, 90.7))
  series1.points.push(newDataPoint(1.5, 91.2))
  series1.points.push(newDataPoint(2.5, 91))
  series1.points.push(newDataPoint(3.5, 89.5))
  series1.points.push(newDataPoint(4.5, 92.5))
  series1.points.push(newDataPoint(5.5, 93.1))
  series1.points.push(newDataPoint(6.5, 94.5))
  series1.points.push(newDataPoint(7.5, 95.5))
  series1.points.push(newDataPoint(8.5, 95.7))
  series1.points.push(newDataPoint(9.5, 96.0))
  model.series.push(series1)
  return model
}

function rectangleAnnotationVerticals(): PlotModel {
  const model = new PlotModel({ title: 'RectangleAnnotation - vertical bands' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: 0, maximum: 10 }))
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 87,
      maximum: 97,
      majorStep: 1,
      minorStep: 1,
    }),
  )
  model.annotations.push(
    new RectangleAnnotation({
      minimumX: 2.5,
      maximumX: 2.8,
      textRotation: 90,
      text: 'Red',
      fill: OxyColorHelper.fromAColor(99, OxyColors.Red),
    }),
  )
  model.annotations.push(
    new RectangleAnnotation({
      minimumX: 2.8,
      maximumX: 6.1,
      textRotation: 90,
      text: 'Orange',
      fill: OxyColorHelper.fromAColor(99, OxyColors.Orange),
    }),
  )
  model.annotations.push(
    new RectangleAnnotation({
      minimumX: 6.1,
      maximumX: 7.6,
      textRotation: 90,
      text: 'Yellow',
      fill: OxyColorHelper.fromAColor(99, OxyColors.Yellow),
    }),
  )
  model.annotations.push(
    new RectangleAnnotation({
      minimumX: 7.6,
      maximumX: 9.7,
      textRotation: 270,
      text: 'Green',
      fill: OxyColorHelper.fromAColor(99, OxyColors.Green),
    }),
  )
  const series1 = new LineSeries({
    color: OxyColors.Black,
    strokeThickness: 6.0,
    lineJoin: LineJoin.Round,
  })
  series1.points.push(newDataPoint(0.5, 90.7))
  series1.points.push(newDataPoint(1.5, 91.2))
  series1.points.push(newDataPoint(2.5, 91))
  series1.points.push(newDataPoint(3.5, 89.5))
  series1.points.push(newDataPoint(4.5, 92.5))
  series1.points.push(newDataPoint(5.5, 93.1))
  series1.points.push(newDataPoint(6.5, 94.5))
  series1.points.push(newDataPoint(7.5, 95.5))
  series1.points.push(newDataPoint(8.5, 95.7))
  series1.points.push(newDataPoint(9.5, 96.0))
  model.series.push(series1)
  return model
}

const category = 'RectangleAnnotation'

export default {
  category,
  tags: ['Annotations'],
  examples: [
    {
      title: 'RectangleAnnotation',
      example: {
        model: rectangleAnnotation,
      },
    },
    {
      title: 'RectangleAnnotations - vertical limit',
      example: {
        model: rectangleAnnotationVerticalLimit,
      },
    },
    {
      title: 'RectangleAnnotation - horizontal bands',
      example: {
        model: rectangleAnnotationHorizontals,
      },
    },
    {
      title: 'RectangleAnnotation - vertical bands',
      example: {
        model: rectangleAnnotationVerticals,
      },
    },
  ],
} as ExampleCategory
