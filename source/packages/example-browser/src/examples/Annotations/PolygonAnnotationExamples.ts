import {
  AnnotationLayer,
  AxisPosition,
  DataPoint,
  FunctionSeries,
  HorizontalAlignment,
  LinearAxis,
  LineStyle,
  PlotModel,
  PlotType,
  PolygonAnnotation,
  pushMany,
  VerticalAlignment,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/** PolygonAnnotation */
function polygonAnnotation(): PlotModel {
  const model = new PlotModel({ title: 'PolygonAnnotation' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -20, maximum: 20 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -10, maximum: 10 }))
  const a1 = new PolygonAnnotation({ text: 'Polygon 1' })
  a1.points.push(
    ...[new DataPoint(4, -2), new DataPoint(8, -4), new DataPoint(17, 7), new DataPoint(5, 8), new DataPoint(2, 5)],
  )
  model.annotations.push(a1)
  return model
}

/** PolygonAnnotation with custom text position and alignment */
function polygonAnnotationTextPosition(): PlotModel {
  const model = new PlotModel({ title: 'PolygonAnnotation with fixed text position and alignment' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -20, maximum: 20 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -10, maximum: 10 }))
  const a1 = new PolygonAnnotation({
    text: 'Polygon 1',
    textHorizontalAlignment: HorizontalAlignment.Left,
    textVerticalAlignment: VerticalAlignment.Bottom,
    textPosition: new DataPoint(4.1, -1.9),
  })
  a1.points.push(
    ...[new DataPoint(4, -2), new DataPoint(8, -2), new DataPoint(17, 7), new DataPoint(5, 8), new DataPoint(4, 5)],
  )
  model.annotations.push(a1)
  return model
}

function annotationLayerProperty(): PlotModel {
  const model = new PlotModel({ title: 'Annotation Layers' })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: -20,
      maximum: 30,
      majorGridlineStyle: LineStyle.Solid,
      majorGridlineThickness: 1,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: -10,
      maximum: 10,
      majorGridlineStyle: LineStyle.Solid,
      majorGridlineThickness: 1,
    }),
  )

  const a1 = new PolygonAnnotation({
    layer: AnnotationLayer.BelowAxes,
    text: 'Layer = BelowAxes',
    points: [
      new DataPoint(-11, -2),
      new DataPoint(-7, -4),
      new DataPoint(-3, 7),
      new DataPoint(-10, 8),
      new DataPoint(-13, 5),
    ],
  })
  model.annotations.push(a1)

  const a2 = new PolygonAnnotation({
    layer: AnnotationLayer.BelowSeries,
    text: 'Layer = BelowSeries',
    points: [
      new DataPoint(4, -2),
      new DataPoint(8, -4),
      new DataPoint(12, 7),
      new DataPoint(5, 8),
      new DataPoint(2, 5),
    ],
  })
  model.annotations.push(a2)

  const a3 = new PolygonAnnotation({
    layer: AnnotationLayer.AboveSeries,
    text: 'Layer = AboveSeries',
    points: [
      new DataPoint(19, -2),
      new DataPoint(23, -4),
      new DataPoint(27, 7),
      new DataPoint(20, 8),
      new DataPoint(17, 5),
    ],
  })
  model.annotations.push(a3)

  model.series.push(
    new FunctionSeries({
      f: Math.sin,
      x0: -20,
      x1: 30,
      n: 400,
    }),
  )
  return model
}

/**
 * Koch Snowflakes
 */
function kockSnowflakes(): PlotModel {
  function triangle(centre: DataPoint): DataPoint[] {
    return [
      new DataPoint(centre.x, centre.y + 1),
      new DataPoint(centre.x + Math.sin((Math.PI * 2) / 3), centre.y + Math.cos((Math.PI * 2) / 3)),
      new DataPoint(centre.x + Math.sin((Math.PI * 4) / 3), centre.y + Math.cos((Math.PI * 4) / 3)),
    ]
  }

  const model = new PlotModel({ title: 'PolygonAnnotation', plotType: PlotType.Cartesian })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -4, maximum: 4 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -2, maximum: 2 }))

  const a1 = new PolygonAnnotation({ text: 'MSL = 4', minimumSegmentLength: 4 })
  let points = kochFractal(triangle(new DataPoint(-2, 0)), 8, true, true)
  pushMany(a1.points, points)
  model.annotations.push(a1)

  const a2 = new PolygonAnnotation({ text: 'MSL = 2', minimumSegmentLength: 2 })
  points = kochFractal(triangle(new DataPoint(0, 0)), 8, true, true)
  pushMany(a2.points, points)
  model.annotations.push(a2)

  const a3 = new PolygonAnnotation({ text: 'MSL = 1', minimumSegmentLength: 1 })
  points = kochFractal(triangle(new DataPoint(2, 0)), 8, true, true)
  pushMany(a3.points, points)
  model.annotations.push(a3)

  return model
}

// ===========

function kochFractal(seed: DataPoint[], n: number, clockwise: boolean, closed: boolean): DataPoint[] {
  const cos60 = Math.cos(Math.PI / 3)
  const sin60 = Math.sin(Math.PI / 3)
  let cur = seed

  for (let i = 0; i < n; i++) {
    const next = new Array<DataPoint>(closed ? cur.length * 4 : cur.length * 4 - 3)
    for (let j = 0; j < (closed ? cur.length : cur.length - 1); j++) {
      const p0 = cur[j]
      const p1 = cur[(j + 1) % cur.length]

      const dx = (p1.x - p0.x) / 3
      const dy = (p1.y - p0.y) / 3

      let dx2, dy2
      if (clockwise) {
        dx2 = cos60 * dx - sin60 * dy
        dy2 = cos60 * dy + sin60 * dx
      } else {
        dx2 = cos60 * dx - sin60 * dy
        dy2 = cos60 * dy + sin60 * dx
      }

      next[j * 4] = p0
      next[j * 4 + 1] = new DataPoint(p0.x + dx, p0.y + dy)
      next[j * 4 + 2] = new DataPoint(p0.x + dx + dx2, p0.y + dy + dy2)
      next[j * 4 + 3] = new DataPoint(p0.x + dx * 2, p0.y + dy * 2)
    }

    if (!closed) {
      next[next.length - 1] = cur[cur.length - 1]
    }

    cur = next
  }

  return cur
}

export const PolygonAnnotationExamples = {
  kochFractal,
}

const category = 'PolygonAnnotation'

export default {
  category,
  tags: ['Annotations'],
  examples: [
    {
      title: 'PolygonAnnotation',
      example: {
        model: polygonAnnotation,
      },
    },
    {
      title: 'PolygonAnnotation with custom text position and alignment',
      example: {
        model: polygonAnnotationTextPosition,
      },
    },
    {
      title: 'AnnotationLayer property',
      example: {
        model: annotationLayerProperty,
      },
    },
    {
      title: 'Koch Snowflakes',
      example: {
        model: kockSnowflakes,
      },
    },
  ],
} as ExampleCategory
