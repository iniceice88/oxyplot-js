import {
  AnnotationLayer,
  AxisPosition,
  HorizontalAlignment,
  LinearAxis,
  newDataPoint,
  PlotModel,
  PolygonAnnotation,
  TextAnnotation,
  VerticalAlignment,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/** TextAnnotation */
function textAnnotations(): PlotModel {
  const model = new PlotModel({ title: 'TextAnnotation' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -15, maximum: 25 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -5, maximum: 18 }))
  model.annotations.push(new TextAnnotation({ textPosition: newDataPoint(-6, 0), text: 'Text annotation 1' }))
  model.annotations.push(
    new TextAnnotation({
      textPosition: newDataPoint(-7, 10),
      textRotation: 80,
      text: 'Text annotation 2',
    }),
  )
  model.annotations.push(
    new TextAnnotation({
      textPosition: newDataPoint(2, 2),
      textRotation: 20,
      textHorizontalAlignment: HorizontalAlignment.Right,
      textVerticalAlignment: VerticalAlignment.Top,
      text: 'Right/Top',
    }),
  )
  model.annotations.push(
    new TextAnnotation({
      textPosition: newDataPoint(2, 4),
      textRotation: 20,
      textHorizontalAlignment: HorizontalAlignment.Right,
      textVerticalAlignment: VerticalAlignment.Middle,
      text: 'Right/Middle',
    }),
  )
  model.annotations.push(
    new TextAnnotation({
      textPosition: newDataPoint(2, 6),
      textRotation: 20,
      textHorizontalAlignment: HorizontalAlignment.Right,
      textVerticalAlignment: VerticalAlignment.Bottom,
      text: 'Right/Bottom',
    }),
  )
  model.annotations.push(
    new TextAnnotation({
      textPosition: newDataPoint(10, 2),
      textRotation: 20,
      textHorizontalAlignment: HorizontalAlignment.Center,
      textVerticalAlignment: VerticalAlignment.Top,
      text: 'Center/Top',
    }),
  )
  model.annotations.push(
    new TextAnnotation({
      textPosition: newDataPoint(10, 4),
      textRotation: 20,
      textHorizontalAlignment: HorizontalAlignment.Center,
      textVerticalAlignment: VerticalAlignment.Middle,
      text: 'Center/Middle',
    }),
  )
  model.annotations.push(
    new TextAnnotation({
      textPosition: newDataPoint(10, 6),
      textRotation: 20,
      textHorizontalAlignment: HorizontalAlignment.Center,
      textVerticalAlignment: VerticalAlignment.Bottom,
      text: 'Center/Bottom',
    }),
  )
  model.annotations.push(
    new TextAnnotation({
      textPosition: newDataPoint(18, 2),
      textRotation: 20,
      textHorizontalAlignment: HorizontalAlignment.Left,
      textVerticalAlignment: VerticalAlignment.Top,
      text: 'Left/Top',
    }),
  )
  model.annotations.push(
    new TextAnnotation({
      textPosition: newDataPoint(18, 4),
      textRotation: 20,
      textHorizontalAlignment: HorizontalAlignment.Left,
      textVerticalAlignment: VerticalAlignment.Middle,
      text: 'Left/Middle',
    }),
  )
  model.annotations.push(
    new TextAnnotation({
      textPosition: newDataPoint(18, 6),
      textRotation: 20,
      textHorizontalAlignment: HorizontalAlignment.Left,
      textVerticalAlignment: VerticalAlignment.Bottom,
      text: 'Left/Bottom',
    }),
  )

  const d = 0.05

  const addPoint = (x: number, y: number) => {
    const annotation = new PolygonAnnotation({
      layer: AnnotationLayer.BelowAxes,
      points: [
        newDataPoint(x - d, y - d),
        newDataPoint(x + d, y - d),
        newDataPoint(x + d, y + d),
        newDataPoint(x - d, y + d),
        newDataPoint(x - d, y - d),
      ],
    })
    model.annotations.push(annotation)
  }

  for (const a of [...model.annotations]) {
    const ta = a as TextAnnotation
    if (ta) {
      addPoint(ta.textPosition.x, ta.textPosition.y)
    }
  }

  return model
}

/** Rotations */
function rotations(): PlotModel {
  const model = new PlotModel({ title: 'TextAnnotation Rotations' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -5, maximum: 45 }))
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      startPosition: 1,
      endPosition: 0,
      minimum: -1,
      maximum: 8,
    }),
  )
  for (let i = 0; i < 360; i += 5) {
    model.annotations.push(
      new TextAnnotation({
        textRotation: i,
        textPosition: newDataPoint(i % 45, i / 45),
        text: `${i}°`,
        textVerticalAlignment: VerticalAlignment.Middle,
        textHorizontalAlignment: HorizontalAlignment.Center,
      }),
    )
  }

  return model
}

const category = 'TextAnnotation'

export default {
  category,
  tags: ['Annotations'],
  examples: [
    {
      title: 'TextAnnotation',
      example: {
        model: textAnnotations,
      },
    },
    {
      title: 'Rotations',
      example: {
        model: rotations,
      },
    },
  ],
} as ExampleCategory
