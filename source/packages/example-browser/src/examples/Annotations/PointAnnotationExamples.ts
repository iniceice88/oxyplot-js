import {
  AxisPosition,
  getEnumName,
  HorizontalAlignment,
  LinearAxis,
  MarkerType,
  newScreenPoint,
  OxyColors,
  PlotModel,
  PointAnnotation,
  VerticalAlignment,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function pointAnnotation(): PlotModel {
  const model = new PlotModel({ title: 'PointAnnotation' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  model.annotations.push(new PointAnnotation({ x: 50, y: 50, text: 'P1' }))
  return model
}

function pointAnnotationShapes(): PlotModel {
  const model = new PlotModel({ title: 'PointAnnotation - shapes' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, maximum: 120 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  // filled
  model.annotations.push(
    new PointAnnotation({
      x: 20,
      y: 60,
      text: 'Circle',
      shape: MarkerType.Circle,
      fill: OxyColors.LightGray,
      stroke: OxyColors.DarkGray,
      strokeThickness: 1,
    }),
  )
  model.annotations.push(
    new PointAnnotation({
      x: 40,
      y: 60,
      text: 'Square',
      shape: MarkerType.Square,
      fill: OxyColors.LightBlue,
      stroke: OxyColors.DarkBlue,
      strokeThickness: 1,
    }),
  )
  model.annotations.push(
    new PointAnnotation({
      x: 60,
      y: 60,
      text: 'Triangle',
      shape: MarkerType.Triangle,
      fill: OxyColors.IndianRed,
      stroke: OxyColors.Black,
      strokeThickness: 1,
    }),
  )
  model.annotations.push(
    new PointAnnotation({
      x: 80,
      y: 60,
      text: 'Diamond',
      shape: MarkerType.Diamond,
      fill: OxyColors.ForestGreen,
      stroke: OxyColors.Black,
      strokeThickness: 1,
    }),
  )
  model.annotations.push(
    new PointAnnotation({
      x: 100,
      y: 60,
      text: 'Custom',
      shape: MarkerType.Custom,
      customOutline: [newScreenPoint(-1, -1), newScreenPoint(1, 1), newScreenPoint(-1, 1), newScreenPoint(1, -1)],
      stroke: OxyColors.Black,
      fill: OxyColors.CadetBlue,
      strokeThickness: 1,
    }),
  )

  // not filled
  model.annotations.push(
    new PointAnnotation({
      x: 20,
      y: 40,
      text: 'Cross',
      shape: MarkerType.Cross,
      stroke: OxyColors.IndianRed,
      strokeThickness: 1,
    }),
  )
  model.annotations.push(
    new PointAnnotation({
      x: 40,
      y: 40,
      text: 'Plus',
      shape: MarkerType.Plus,
      stroke: OxyColors.Navy,
      strokeThickness: 1,
    }),
  )
  model.annotations.push(
    new PointAnnotation({
      x: 60,
      y: 40,
      text: 'Star',
      shape: MarkerType.Star,
      stroke: OxyColors.DarkOliveGreen,
      strokeThickness: 1,
    }),
  )

  return model
}

function pointAnnotationTextAlignment(): PlotModel {
  const model = new PlotModel({ title: 'PointAnnotation - text alignments' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -50, maximum: 50 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -50, maximum: 50 }))

  for (let ha = -1; ha <= 1; ha++) {
    const h = ha as HorizontalAlignment
    const hStr = getEnumName(HorizontalAlignment, h)
    for (let va = -1; va <= 1; va++) {
      const v = va as VerticalAlignment
      const vStr = getEnumName(VerticalAlignment, v)
      model.annotations.push(
        new PointAnnotation({
          x: ha * 20,
          y: va * 20,
          size: 10,
          text: `${hStr},${vStr}`,
          textHorizontalAlignment: h,
          textVerticalAlignment: v,
        }),
      )
    }
  }

  return model
}

const category = 'PointAnnotation'

export default {
  category,
  tags: ['Annotations'],
  examples: [
    {
      title: 'PointAnnotation',
      example: {
        model: pointAnnotation,
      },
    },
    {
      title: 'PointAnnotation - shapes',
      example: {
        model: pointAnnotationShapes,
      },
    },
    {
      title: 'PointAnnotation - text alignments',
      example: {
        model: pointAnnotationTextAlignment,
      },
    },
  ],
} as ExampleCategory
