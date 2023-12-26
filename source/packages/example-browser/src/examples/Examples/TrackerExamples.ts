import {
  ControllerExtensions,
  DataPoint,
  DelegatePlotCommand,
  FunctionSeries,
  Legend,
  LineSeries,
  MarkerType,
  OxyColors,
  OxyMouseButton,
  type OxyMouseDownEventArgs,
  type OxyTouchEventArgs,
  PlotCommands,
  PlotController,
  PlotModel,
  TouchTrackerManipulator,
  TrackerManipulator,
} from 'oxyplot-js'
import type { Example, ExampleCategory } from '../types'

function noInterpolation(): PlotModel {
  const model = new PlotModel({
    title: 'No tracker interpolation',
    subtitle: 'Used for discrete values or scatter plots.',
  })

  const l = new Legend({
    legendSymbolLength: 30,
  })

  model.legends.push(l)

  const s1 = new LineSeries({
    title: 'Series 1',
    canTrackerInterpolatePoints: false,
    color: OxyColors.SkyBlue,
    markerType: MarkerType.Circle,
    markerSize: 6,
    markerStroke: OxyColors.White,
    markerFill: OxyColors.SkyBlue,
    markerStrokeThickness: 1.5,
  })

  for (let i = 0; i < 63; i++) {
    const x = Math.round(Math.sqrt(i) * Math.cos(i * 0.1))
    const y = Math.round(Math.sqrt(i) * Math.sin(i * 0.1))
    s1.points.push(new DataPoint(x, y))
  }

  model.series.push(s1)

  return model
}

function trackerChangedEvent(): PlotModel {
  const model = new PlotModel({
    title: 'Handling the TrackerChanged event',
    subtitle: 'Press the left mouse button to test the tracker.',
  })

  model.series.push(FunctionSeries.fromN(Math.sin, 0, 10, 100))

  model.trackerChanged = (s, e) => {
    model.subtitle = e.hitResult ? 'Tracker item index = ' + e.hitResult!.index : 'Not tracking'
    model.invalidatePlot(false)
  }

  return model
}

function trackerFiresDistance(): Example {
  const model = new PlotModel({
    title: 'Specified distance of the tracker fires',
    subtitle: 'Press the left mouse button to test the tracker.',
  })
  model.series.push(FunctionSeries.fromN(Math.sin, 0, 10, 100))

  // create a new plot controller with default bindings
  const plotController = new PlotController()

  // remove a tracker command to the mouse-left/touch down event by default
  plotController.unbindViewCommand(PlotCommands.snapTrack)
  plotController.unbindViewCommand(PlotCommands.snapTrackTouch)

  // add a tracker command to the mouse-left/touch down event with specified distance
  ControllerExtensions.bindMouseDown(
    plotController,
    OxyMouseButton.Left,
    new DelegatePlotCommand<OxyMouseDownEventArgs>((view, controller, args) =>
      controller.addMouseManipulator(
        view,
        new TrackerManipulator(view, {
          snap: true,
          pointsOnly: false,
          firesDistance: 2.0,
          checkDistanceBetweenPoints: true,
        }),
        args,
      ),
    ),
  )
  ControllerExtensions.bindTouchDown(
    plotController,
    new DelegatePlotCommand<OxyTouchEventArgs>((view, controller, args) =>
      controller.addTouchManipulator(
        view,
        new TouchTrackerManipulator(view, {
          snap: true,
          pointsOnly: false,
          firesDistance: 2.0,
        }),
        args,
      ),
    ),
  )

  return {
    model: () => model,
    controller: () => plotController,
  }
}

const category = 'Tracker'

export default {
  category,
  examples: [
    {
      title: 'No interpolation',
      example: {
        model: noInterpolation,
      },
    },
    {
      title: 'TrackerChangedEvent',
      example: {
        model: trackerChangedEvent,
      },
    },
    {
      title: 'Specified distance of the tracker fires',
      example: trackerFiresDistance(),
    },
  ],
} as ExampleCategory
