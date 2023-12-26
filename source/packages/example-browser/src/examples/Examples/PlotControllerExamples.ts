import {
  AxisPosition,
  AxisPreference,
  ControllerExtensions,
  DataPoint,
  DelegatePlotCommand,
  FunctionSeries,
  HitTestArguments,
  type IPlotView,
  Legend,
  LinearAxis,
  LineSeries,
  OxyColors,
  OxyModifierKeys,
  OxyModifierKeysExtensions,
  OxyMouseButton,
  type OxyMouseDownEventArgs,
  OxyMouseDownGesture,
  type OxyMouseWheelEventArgs,
  PlotCommands,
  PlotController,
  PlotModel,
  RectangleAnnotation,
  ScatterSeries,
  ZoomStepManipulator,
} from 'oxyplot-js'
import type { Example, ExampleCategory } from '../types'

/**
 * Create a basic example of a PlotModel with a custom PlotController.
 * @returns An Example representing the basic example.
 */
function basicExample(): Example {
  const model = new PlotModel({
    title: 'Basic Controller example',
    subtitle: 'Panning with left mouse button',
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  const controller = new PlotController()
  controller.unbindAll()
  ControllerExtensions.bindMouseDown(controller, OxyMouseButton.Left, PlotCommands.panAt)

  return {
    model: () => model,
    controller: () => controller,
  }
}

/**
 * Create an example of a PlotModel with hover tracking.
 * @returns An Example representing the hover tracking example.
 */
function hoverTracking(): Example {
  const model = new PlotModel({ title: 'Show tracker without clicking' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  model.series.push(
    FunctionSeries.fromFxFyN(
      (t) => Math.cos(t) * 5 + Math.cos(t * 50),
      (t) => Math.sin(t) * 5 + Math.sin(t * 50),
      0,
      Math.PI * 2,
      20000,
    ),
  )

  const controller = new PlotController()
  ControllerExtensions.bindMouseEnter(controller, PlotCommands.hoverPointsOnlyTrack)

  return {
    model: () => model,
    controller: () => controller,
  }
}

/**
 * Create an example of a PlotModel with custom mouse handling.
 * @returns An Example representing the mouse handling example.
 */
function mouseHandlingExample(): Example {
  const model = new PlotModel({ title: 'Mouse handling example' })
  const series = new ScatterSeries()
  model.series.push(series)

  const command = new DelegatePlotCommand<OxyMouseDownEventArgs>((v, c, a) => {
    a.handled = true
    const point = series.inverseTransform(a.position)
    series.points.push({
      x: point.x,
      y: point.y,
    })
    model.invalidatePlot(true)
  })

  const controller = new PlotController()
  ControllerExtensions.bindMouseDown(controller, OxyMouseButton.Left, command)

  return {
    model: () => model,
    controller: () => controller,
  }
}

/** ClickingOnAnAnnotation */
function clickingOnAnAnnotation(): Example {
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

  const controller = new PlotController()
  const handleClick = new DelegatePlotCommand<OxyMouseDownEventArgs>((v, c, e) => {
    const args = new HitTestArguments(e.position, 10)
    const firstHit = v.actualModel!.hitTest(args).find((x) => x.element instanceof RectangleAnnotation)
    if (firstHit) {
      e.handled = true
      plotModel.subtitle = 'You clicked ' + (firstHit.element as RectangleAnnotation).text
      plotModel.invalidatePlot(false)
    }
  })
  controller.bindMouseDown(new OxyMouseDownGesture(OxyMouseButton.Left), handleClick)

  return {
    model: () => plotModel,
    controller: () => controller,
  }
}

/** PreferringAnAxisForManipulation */
function preferringAnAxisForManipulation(): Example {
  function handleZoomByWheel(view: IPlotView, args: OxyMouseWheelEventArgs, factor = 1) {
    const m = new ZoomStepManipulator(view, args.delta * 0.001 * factor, OxyModifierKeysExtensions.isControlDown(args))
    m.axisPreference = AxisPreference.X
    m.started(args)
  }

  const model = new PlotModel({
    title: 'Preferring an axis for manipulation',
    subtitle: 'Mouse wheel over plot area prefers X axis',
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  model.series.push(FunctionSeries.fromDx(Math.cos, -7, 7, 0.01))

  const controller = new PlotController()
  controller.unbindAll()
  ControllerExtensions.bindMouseWheel(
    controller,
    new DelegatePlotCommand<OxyMouseWheelEventArgs>((view, _, args) => handleZoomByWheel(view, args)),
  )

  ControllerExtensions.bindMouseWheel(
    controller,
    new DelegatePlotCommand<OxyMouseWheelEventArgs>((view, _, args) => handleZoomByWheel(view, args, 0.1)),
    OxyModifierKeys.Control,
  )

  return {
    model: () => model,
    controller: () => controller,
  }
}

/** ShowHideLegend */
function showHideLegend(): Example {
  const plotModel = new PlotModel({
    title: 'Show/Hide Legend',
    subtitle: 'Click on the rectangles',
  })

  const n = 3
  for (let i = 1; i <= n; i++) {
    const s = new LineSeries({ title: 'Series ' + i })
    plotModel.series.push(s)
    for (let x = 0; x < 2 * Math.PI; x += 0.1) {
      s.points.push(new DataPoint(x, Math.sin(x * i) / i + i))
    }
  }
  const l = new Legend()

  plotModel.legends.push(l)

  const annotation1 = new RectangleAnnotation({
    fill: OxyColors.Green,
    text: 'Show Legend',
    minimumX: 0.5,
    maximumX: 1.5,
    minimumY: 0.2,
    maximumY: 0.4,
  })
  plotModel.annotations.push(annotation1)

  const annotation2 = new RectangleAnnotation({
    fill: OxyColors.SkyBlue,
    text: 'Hide Legend',
    minimumX: 0.5,
    maximumX: 1.5,
    minimumY: 0.6,
    maximumY: 0.8,
  })
  plotModel.annotations.push(annotation2)

  const handleMouseClick = (s: RectangleAnnotation, e: OxyMouseDownEventArgs) => {
    const annotationText = s.text
    if (annotationText === 'Show Legend') {
      plotModel.isLegendVisible = true
    } else if (annotationText === 'Hide Legend') {
      plotModel.isLegendVisible = false
    }

    plotModel.subtitle = 'You clicked ' + s.text
    plotModel.invalidatePlot(false)
  }

  annotation1.mouseDown = handleMouseClick
  annotation2.mouseDown = handleMouseClick

  const controller = new PlotController()
  const handleClick = new DelegatePlotCommand<OxyMouseDownEventArgs>((v, c, e) => {
    const args = new HitTestArguments(e.position, 10)
    const firstHit = v.actualModel!.hitTest(args).find((x) => x.element instanceof RectangleAnnotation)
    if (firstHit) {
      e.handled = true
      plotModel.subtitle = 'You clicked ' + (firstHit.element as RectangleAnnotation).text
      plotModel.invalidatePlot(false)
    }
  })
  controller.bindMouseDown(new OxyMouseDownGesture(OxyMouseButton.Left), handleClick)

  return {
    model: () => plotModel,
    controller: () => controller,
  }
}

const category = 'PlotController examples'

export default {
  category,
  examples: [
    {
      title: 'Basic controller example',
      example: basicExample(),
    },
    {
      title: 'Show tracker without clicking',
      example: hoverTracking(),
    },
    {
      title: 'Mouse handling example',
      example: mouseHandlingExample(),
    },
    {
      title: 'Clicking on an annotation',
      example: clickingOnAnAnnotation(),
    },
    {
      title: 'Preferring an axis for manipulation',
      example: preferringAnAxisForManipulation(),
    },
    {
      title: 'Show/Hide Legend',
      example: showHideLegend(),
    },
  ],
} as ExampleCategory
