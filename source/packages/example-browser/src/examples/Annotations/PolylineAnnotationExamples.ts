import {
  AxisPosition,
  DataPoint,
  InterpolationAlgorithms,
  LinearAxis,
  LineStyle,
  PlotModel,
  PlotType,
  PolylineAnnotation,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { PolygonAnnotationExamples } from './PolygonAnnotationExamples'

function polylineAnnotations(): PlotModel {
  const model = new PlotModel({ title: 'PolylineAnnotation' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: 0, maximum: 30 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: 0, maximum: 30 }))

  const a1 = new PolylineAnnotation({ text: 'Polyline' })
  a1.points.push(new DataPoint(0, 10), new DataPoint(5, 5), new DataPoint(20, 1), new DataPoint(30, 20))

  const a2 = new PolylineAnnotation({
    text: 'Smooth Polyline',
    interpolationAlgorithm: InterpolationAlgorithms.CanonicalSpline,
  })
  a2.points.push(
    new DataPoint(0, 15),
    new DataPoint(3, 23),
    new DataPoint(9, 30),
    new DataPoint(20, 12),
    new DataPoint(30, 10),
  )

  model.annotations.push(a1, a2)

  return model
}

function kochSurface(): PlotModel {
  function plane(centre: DataPoint): DataPoint[] {
    return [new DataPoint(centre.x - 1, centre.y), new DataPoint(centre.x + 1, centre.y)]
  }

  const model = new PlotModel({ title: 'PolygonAnnotation', plotType: PlotType.Cartesian })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -2, maximum: 2 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -2, maximum: 2 }))

  const a1 = new PolylineAnnotation({
    text: 'MSL = 4',
    minimumSegmentLength: 4,
    lineStyle: LineStyle.Solid,
    textPosition: new DataPoint(0, 1),
  })
  a1.points.push(...PolygonAnnotationExamples.kochFractal(plane(new DataPoint(0, 1)), 8, true, false))
  model.annotations.push(a1)

  const a2 = new PolylineAnnotation({
    text: 'MSL = 2',
    minimumSegmentLength: 2,
    lineStyle: LineStyle.Solid,
    textPosition: new DataPoint(0, 0),
  })
  a2.points.push(...PolygonAnnotationExamples.kochFractal(plane(new DataPoint(0, 0)), 8, true, false))
  model.annotations.push(a2)

  const a3 = new PolylineAnnotation({
    text: 'MSL = 1',
    minimumSegmentLength: 1,
    lineStyle: LineStyle.Solid,
    textPosition: new DataPoint(0, -1),
  })
  a3.points.push(...PolygonAnnotationExamples.kochFractal(plane(new DataPoint(0, -1)), 8, true, false))
  model.annotations.push(a3)

  return model
}

const category = 'PolylineAnnotation'

export default {
  category,
  tags: ['Annotations'],
  examples: [
    {
      title: 'PolylineAnnotation',
      example: {
        model: polylineAnnotations,
      },
    },
    {
      title: 'Koch Surfaces',
      example: {
        model: kochSurface,
      },
    },
  ],
} as ExampleCategory
