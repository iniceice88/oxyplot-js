import {
  ArrowAnnotation,
  AxisPosition,
  DataPoint,
  FunctionSeries,
  getImageService,
  HorizontalAlignment,
  ImageAnnotation,
  Legend,
  LineAnnotation,
  LineAnnotationType,
  LinearAxis,
  LineSeries,
  LineStyle,
  MarkerType,
  OxyColor,
  OxyColors,
  OxyImage,
  OxyMouseButton,
  type OxyMouseDownEventArgs,
  PlotLength,
  PlotLengthUnit,
  PlotModel,
  PolygonAnnotation,
  RectangleAnnotation,
  round,
  ScatterSeries,
  TextAnnotation,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/** PlotModel mouse events */
function mouseEvents(): PlotModel {
  const model = new PlotModel({ title: 'Mouse events', subtitle: 'Left click and drag' })
  const yaxis = new LinearAxis({ position: AxisPosition.Left, minimum: -1, maximum: 1 })
  const xaxis = new LinearAxis({ position: AxisPosition.Bottom, minimum: -1, maximum: 1 })
  model.axes.push(yaxis)
  model.axes.push(xaxis)

  let s1: LineSeries | undefined

  model.mouseDown = (s, e) => {
    if (e.changedButton === OxyMouseButton.Left) {
      s1 = new LineSeries({
        title: 'LineSeries' + (model.series.length + 1),
        markerType: MarkerType.None,
        strokeThickness: 2,
      })
      s1.points.push(xaxis.inverseTransformPoint(e.position.x, e.position.y, yaxis))
      model.series.push(s1)
      model.invalidatePlot(false)
      e.handled = true
    }
  }

  model.mouseMove = (s, e) => {
    if (s1 !== undefined) {
      s1.points.push(xaxis.inverseTransformPoint(e.position.x, e.position.y, yaxis))
      model.invalidatePlot(false)
      e.handled = true
    }
  }

  model.mouseUp = (s, e) => {
    if (s1 !== undefined) {
      s1 = undefined
      e.handled = true
    }
  }

  return model
}

function mouseDownEventHitTestResult(): PlotModel {
  const model = new PlotModel({
    title: 'MouseDown HitTestResult',
    subtitle: 'Reports the index of the nearest point.',
  })

  const s1 = new LineSeries()
  s1.points.push(new DataPoint(0, 10))
  s1.points.push(new DataPoint(10, 40))
  s1.points.push(new DataPoint(40, 20))
  s1.points.push(new DataPoint(60, 30))
  model.series.push(s1)
  s1.mouseDown = (s, e) => {
    model.subtitle = 'Index of nearest point in LineSeries: ' + Math.round(e.hitTestResult.index || 0)
    model.invalidatePlot(false)
  }

  const s2 = new ScatterSeries()
  s2.points.push({ x: 0, y: 15 })
  s2.points.push({ x: 10, y: 45 })
  s2.points.push({ x: 40, y: 25 })
  s2.points.push({ x: 60, y: 35 })
  model.series.push(s2)
  s2.mouseDown = (s, e) => {
    model.subtitle = 'Index of nearest point in ScatterSeries: ' + Math.round(e.hitTestResult.index || 0)
    model.invalidatePlot(false)
  }

  return model
}

function mouseDownEvent(): PlotModel {
  const model = new PlotModel({ title: 'MouseDown', subtitle: 'Left click to edit or add points.' })

  // Add a line series
  const s1 = new LineSeries({
    title: 'LineSeries1',
    markerType: MarkerType.Circle,
    markerSize: 6,
    strokeThickness: 1.5,
  })
  s1.points.push(new DataPoint(0, 10))
  s1.points.push(new DataPoint(10, 40))
  s1.points.push(new DataPoint(40, 20))
  s1.points.push(new DataPoint(60, 30))
  model.series.push(s1)

  let indexOfPointToMove = -1

  // Subscribe to the mouse down event on the line series
  s1.mouseDown = (s, e) => {
    // only handle the left mouse button (right button can still be used to pan)
    if (e.changedButton === OxyMouseButton.Left) {
      const indexOfNearestPoint = Math.round(e.hitTestResult.index!)
      const nearestPoint = s1.transform(s1.points[indexOfNearestPoint])

      // Check if we are near a point
      if (nearestPoint.minus(e.position).length < 10) {
        // Start editing this point
        indexOfPointToMove = indexOfNearestPoint
      } else {
        // otherwise create a point on the current line segment
        const i = e.hitTestResult.index! + 1
        s1.points.splice(i, 0, s1.inverseTransform(e.position))
        indexOfPointToMove = i
      }

      // Change the linestyle while editing
      s1.lineStyle = LineStyle.DashDot

      // Remember to refresh/invalidate of the plot
      model.invalidatePlot(false)

      // Set the event arguments to handled - no other handlers will be called.
      e.handled = true
    }
  }

  s1.mouseMove = (s, e) => {
    if (indexOfPointToMove >= 0) {
      // Move the point being edited.
      s1.points[indexOfPointToMove] = s1.inverseTransform(e.position)
      model.invalidatePlot(false)
      e.handled = true
    }
  }

  s1.mouseUp = (s, e) => {
    // Stop editing
    indexOfPointToMove = -1
    s1.lineStyle = LineStyle.Solid
    model.invalidatePlot(false)
    e.handled = true
  }

  model.mouseDown = (s, e) => {
    if (e.changedButton === OxyMouseButton.Left) {
      // Add a point to the line series.
      s1.points.push(s1.inverseTransform(e.position))
      indexOfPointToMove = s1.points.length - 1

      model.invalidatePlot(false)
      e.handled = true
    }
  }

  return model
}

function addAnnotations(): PlotModel {
  const model = new PlotModel({
    title: 'Add arrow annotations',
    subtitle: 'Press and drag the left mouse button',
  })
  const xaxis = new LinearAxis({ position: AxisPosition.Bottom })
  const yaxis = new LinearAxis({ position: AxisPosition.Left })
  model.axes.push(xaxis)
  model.axes.push(yaxis)
  model.series.push(
    new FunctionSeries({
      f: (x) => Math.sin(x / 4) * Math.acos(Math.sin(x)),
      x0: 0,
      x1: Math.PI * 8,
      n: 2000,
      title: 'sin(x/4)*acos(sin(x))',
    }),
  )

  let tmp: ArrowAnnotation | null = null

  // Add handlers to the PlotModel's mouse events
  model.mouseDown = (s, e) => {
    if (e.changedButton === OxyMouseButton.Left) {
      // Create a new arrow annotation
      tmp = new ArrowAnnotation()
      tmp.startPoint = tmp.endPoint = xaxis.inverseTransformPoint(e.position.x, e.position.y, yaxis)
      model.annotations.push(tmp)
      e.handled = true
    }
  }

  // Handle mouse movements (note: this is only called when the mousedown event was handled)
  model.mouseMove = (s, e) => {
    if (tmp) {
      // Modify the end point
      tmp.endPoint = xaxis.inverseTransformPoint(e.position.x, e.position.y, yaxis)
      tmp.text = `Y = ${tmp.endPoint.y.toFixed(3)}`

      // Redraw the plot
      model.invalidatePlot(false)
      e.handled = true
    }
  }

  model.mouseUp = (s, e) => {
    if (tmp) {
      tmp = null
      e.handled = true
    }
  }

  return model
}

function lineAnnotation(): PlotModel {
  const model = new PlotModel({
    title: 'LineAnnotation',
    subtitle: 'Click and drag the annotation line.',
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -20, maximum: 80 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -10, maximum: 10 }))
  const la = new LineAnnotation({ type: LineAnnotationType.Vertical, x: 4 })

  la.mouseDown = (s, e) => {
    if (e.changedButton !== OxyMouseButton.Left) {
      return
    }

    la.strokeThickness *= 5
    model.invalidatePlot(false)
    e.handled = true
  }

  la.mouseMove = (s, e) => {
    la.x = la.inverseTransform(e.position).x
    model.invalidatePlot(false)
    e.handled = true
  }

  la.mouseUp = (s, e) => {
    la.strokeThickness /= 5
    model.invalidatePlot(false)
    e.handled = true
  }

  model.annotations.push(la)
  return model
}

function arrowAnnotation(): PlotModel {
  const model = new PlotModel({ title: 'ArrowAnnotation', subtitle: 'Click and drag the arrow.' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -40, maximum: 60 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -10, maximum: 10 }))

  const arrow = new ArrowAnnotation({
    startPoint: new DataPoint(8, 4),
    endPoint: new DataPoint(0, 0),
    text: 'Move me!',
  })

  let lastPoint = DataPoint.Undefined
  let moveStartPoint = false
  let moveEndPoint = false
  let originalColor = OxyColors.White

  arrow.mouseDown = (s, e) => {
    if (e.changedButton !== OxyMouseButton.Left) {
      return
    }

    lastPoint = arrow.inverseTransform(e.position)
    moveStartPoint = e.hitTestResult.index !== 2
    moveEndPoint = e.hitTestResult.index !== 1
    originalColor = arrow.color
    arrow.color = OxyColors.Red
    model.invalidatePlot(false)
    e.handled = true
  }

  arrow.mouseMove = (s, e) => {
    const thisPoint = arrow.inverseTransform(e.position)
    const dx = thisPoint.x - lastPoint.x
    const dy = thisPoint.y - lastPoint.y
    if (moveStartPoint) {
      arrow.startPoint = new DataPoint(arrow.startPoint.x + dx, arrow.startPoint.y + dy)
    }

    if (moveEndPoint) {
      arrow.endPoint = new DataPoint(arrow.endPoint.x + dx, arrow.endPoint.y + dy)
    }

    lastPoint = thisPoint
    model.invalidatePlot(false)
    e.handled = true
  }

  arrow.mouseUp = (s, e) => {
    arrow.color = originalColor
  }

  model.annotations.push(arrow)
  return model
}

function polygonAnnotation(): PlotModel {
  const model = new PlotModel({ title: 'PolygonAnnotation', subtitle: 'Click the polygon' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -20, maximum: 20 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -20, maximum: 20 }))

  const pa = new PolygonAnnotation({ text: 'Polygon 1' })
  pa.points.push(
    new DataPoint(4, -2),
    new DataPoint(8, -4),
    new DataPoint(17, 7),
    new DataPoint(5, 8),
    new DataPoint(2, 5),
  )

  let hitCount = 1
  pa.mouseDown = (s, e) => {
    if (e.changedButton !== OxyMouseButton.Left) {
      return
    }

    pa.text = 'Hit # ' + hitCount++
    model.invalidatePlot(false)
    e.handled = true
  }

  model.annotations.push(pa)
  return model
}

function textAnnotation(): PlotModel {
  const model = new PlotModel({ title: 'TextAnnotation', subtitle: 'Click the text' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -20, maximum: 20 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -10, maximum: 10 }))

  const ta = new TextAnnotation({ textPosition: new DataPoint(4, -2), text: 'Click here' })

  ta.mouseDown = (s, e) => {
    console.log('mouseDown')
    if (e.changedButton !== OxyMouseButton.Left) {
      return
    }

    ta.background = ta.background.isUndefined() ? OxyColors.LightGreen : OxyColors.Undefined
    model.invalidatePlot(false)
    e.handled = true
  }

  model.annotations.push(ta)
  return model
}

async function imageAnnotation(): Promise<PlotModel> {
  const model = new PlotModel({
    title: 'ImageAnnotation',
    subtitle: 'Click the image',
  })

  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -20, maximum: 20 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -10, maximum: 10 }))

  const imgPath = (window as any).oxyPlotImg
  if (!imgPath) throw new Error('window.oxyPlotImg not set')

  const image: OxyImage = await getImageService().load(imgPath)

  const ia = new ImageAnnotation({
    imageSource: image,
    x: new PlotLength(4, PlotLengthUnit.Data),
    y: new PlotLength(2, PlotLengthUnit.Data),
    horizontalAlignment: HorizontalAlignment.Right,
  })

  model.annotations.push(ia)

  // Handle left mouse clicks
  ia.mouseDown = (s, e) => {
    if (e.changedButton !== OxyMouseButton.Left) {
      return
    }

    ia.horizontalAlignment =
      ia.horizontalAlignment === HorizontalAlignment.Right ? HorizontalAlignment.Left : HorizontalAlignment.Right
    model.invalidatePlot(false)
    e.handled = true
  }

  return model
}

function addSeriesByMouseDownEvent(): PlotModel {
  const model = new PlotModel({ title: 'MouseDown', subtitle: 'Left click to add series.' })
  const l = new Legend({ legendSymbolLength: 40 })

  model.legends.push(l)

  model.mouseDown = (s, e) => {
    if (e.changedButton === OxyMouseButton.Left) {
      const a = model.series.length + 1
      model.series.push(new FunctionSeries({ f: (x) => Math.sin(a * x), x0: 0, x1: 10, n: 1000 }))
      model.invalidatePlot(true)
      e.handled = true
    }
  }

  return model
}

function selectRange(): PlotModel {
  const model = new PlotModel({
    title: 'Select range',
    subtitle: 'Left click and drag to select a range.',
  })
  model.series.push(new FunctionSeries({ f: Math.cos, x0: 0, x1: 40, dx: 0.1 }))

  const range = new RectangleAnnotation({
    fill: OxyColor.fromAColor(120, OxyColors.SkyBlue),
    minimumX: 0,
    maximumX: 0,
  })
  model.annotations.push(range)

  let startx = Number.NaN

  model.mouseDown = (s, e) => {
    if (e.changedButton === OxyMouseButton.Left) {
      startx = range.inverseTransform(e.position).x
      range.minimumX = startx
      range.maximumX = startx
      model.invalidatePlot(true)
      e.handled = true
    }
  }

  model.mouseMove = (s, e) => {
    if (!Number.isNaN(startx)) {
      const x = range.inverseTransform(e.position).x
      range.minimumX = Math.min(x, startx)
      range.maximumX = Math.max(x, startx)
      range.text = `∫ cos(x) dx =  ${Math.sin(range.maximumX) - round(Math.sin(range.minimumX), 2)}`
      model.subtitle = `Integrating from ${range.minimumX.toFixed(2)} to ${range.maximumX.toFixed(2)}`
      model.invalidatePlot(true)
      e.handled = true
    }
  }

  model.mouseUp = (s, e) => {
    startx = Number.NaN
  }

  return model
}

function hover(): PlotModel {
  const model = new PlotModel({ title: 'Hover' })
  let series: LineSeries | null = null

  model.mouseEnter = (s, e) => {
    model.subtitle = 'The mouse entered'
    series = new LineSeries()
    model.series.push(series)
    model.invalidatePlot(false)
    e.handled = true
  }

  model.mouseMove = (s, e) => {
    if (series && series.xAxis) {
      series.points.push(series.inverseTransform(e.position))
      model.invalidatePlot(false)
    }
  }

  model.mouseLeave = (s, e) => {
    model.subtitle = 'The mouse left'
    model.invalidatePlot(false)
    e.handled = true
  }

  return model
}

/**
 * Touch example
 * @returns A PlotModel.
 */
function touch(): PlotModel {
  const model = new PlotModel({ title: 'Touch' })
  const series = new LineSeries()
  model.series.push(series)

  model.touchStarted = (s, e) => {
    model.subtitle = 'The touch gesture started'
    model.invalidatePlot(false)
    e.handled = true
  }

  model.touchDelta = (s, e) => {
    series.points.push(series.inverseTransform(e.position))
    model.invalidatePlot(false)
  }

  model.touchCompleted = (s, e) => {
    model.subtitle = 'The touch gesture completed'
    model.invalidatePlot(false)
    e.handled = true
  }

  return model
}

/**
 * Touch on a LineSeries example
 * @returns A PlotModel.
 */
function touchSeries(): PlotModel {
  const model = new PlotModel({ title: 'Touch on a LineSeries' })
  const series = new LineSeries()
  series.points.push(new DataPoint(0, 0))
  series.points.push(new DataPoint(10, 10))
  model.series.push(series)

  series.touchStarted = (s, e) => {
    model.subtitle = 'The touch gesture started on the LineSeries'
    model.invalidatePlot(false)
    e.handled = true
  }

  series.touchDelta = (s, e) => {
    series.points.push(series.inverseTransform(e.position))
    model.invalidatePlot(false)
  }

  series.touchCompleted = (s, e) => {
    model.subtitle = 'The touch gesture completed'
    model.invalidatePlot(false)
    e.handled = true
  }

  return model
}

function rectangleAnnotationClick(): PlotModel {
  const plotModel = new PlotModel({ title: 'RectangleAnnotation click' })

  plotModel.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  plotModel.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  const annotation = new RectangleAnnotation({
    minimumX: 10,
    maximumX: 60,
    minimumY: 10,
    maximumY: 20,
  })
  plotModel.annotations.push(annotation)

  let i = 0
  annotation.mouseDown = (s, e) => {
    annotation.text = 'Clicked ' + ++i + ' times.'
    plotModel.invalidatePlot(false)
  }

  return plotModel
}

function clickingOnAnAnnotation(): PlotModel {
  const plotModel = new PlotModel({
    title: 'Clicking on an annotation',
    subtitle: 'Click on the rectangles',
  })

  plotModel.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  plotModel.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  const annotation1 = new RectangleAnnotation({
    fill: OxyColors.Green,
    text: 'RectangleAnnotation 1',
    minimumX: 25,
    maximumX: 75,
    minimumY: 20,
    maximumY: 40,
  })
  plotModel.annotations.push(annotation1)

  const annotation2 = new RectangleAnnotation({
    fill: OxyColors.SkyBlue,
    text: 'RectangleAnnotation 2',
    minimumX: 25,
    maximumX: 75,
    minimumY: 60,
    maximumY: 80,
  })
  plotModel.annotations.push(annotation2)

  const handleMouseClick = (s: RectangleAnnotation, e: OxyMouseDownEventArgs) => {
    plotModel.subtitle = 'You clicked ' + s.text
    plotModel.invalidatePlot(false)
  }

  annotation1.mouseDown = handleMouseClick
  annotation2.mouseDown = handleMouseClick

  return plotModel
}

const category = 'Mouse Events'

export default {
  category,
  examples: [
    {
      title: 'PlotModel mouse events',
      example: {
        model: mouseEvents,
      },
    },
    {
      title: 'MouseDown event and HitTestResult',
      example: {
        model: mouseDownEventHitTestResult,
      },
    },
    {
      title: 'LineSeries and PlotModel MouseDown event',
      example: {
        model: mouseDownEvent,
      },
    },
    {
      title: 'Add arrow annotations',
      example: {
        model: addAnnotations,
      },
    },
    {
      title: 'LineAnnotation',
      example: {
        model: lineAnnotation,
      },
    },
    {
      title: 'ArrowAnnotation',
      example: {
        model: arrowAnnotation,
      },
    },
    {
      title: 'PolygonAnnotation',
      example: {
        model: polygonAnnotation,
      },
    },
    {
      title: 'TextAnnotation',
      example: {
        model: textAnnotation,
      },
    },
    {
      title: 'ImageAnnotation',
      example: {
        model: imageAnnotation,
      },
    },
    {
      title: 'Add Series',
      example: {
        model: addSeriesByMouseDownEvent,
      },
    },
    {
      title: 'Select range',
      example: {
        model: selectRange,
      },
    },
    {
      title: 'Hover',
      example: {
        model: hover,
      },
    },
    {
      title: 'Touch',
      example: {
        model: touch,
      },
    },
    {
      title: 'Touch on a LineSeries',
      example: {
        model: touchSeries,
      },
    },
    {
      title: 'RectangleAnnotation click',
      example: {
        model: rectangleAnnotationClick,
      },
    },
    {
      title: 'Clicking on an annotation',
      example: {
        model: clickingOnAnAnnotation,
      },
    },
  ],
} as ExampleCategory
