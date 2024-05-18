import {
  AngleAxis,
  AxisPosition,
  CategoryAxis,
  DateTimeAxis,
  DelegateAnnotation,
  EdgeRenderingMode,
  FunctionSeries,
  getDateService,
  getEnumName,
  type IRenderContext,
  Legend,
  LinearAxis,
  LineSeries,
  LineStyle,
  LogarithmicAxis,
  MagnitudeAxis,
  MarkerType,
  newDataPoint,
  newOxyThickness,
  OxyColor,
  OxyColorHelper,
  OxyColors,
  OxyPen,
  PlotModel,
  PlotType,
  RenderingExtensions,
  ScatterSeries,
  TickStyle,
  TimeSpan,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { createNormalDistributionSeries } from '../ShowCases/ShowCases'
import { Random } from '../Random'

/**
 * Creates an example for the TickStyle property using TickStyle.None.
 * @returns A PlotModel.
 */
function tickStyleNone(): PlotModel {
  return createTickStyleExample(TickStyle.None)
}

/**
 * Creates an example for the TickStyle property using TickStyle.Inside.
 * @returns A PlotModel.
 */
function tickStyleInside(): PlotModel {
  return createTickStyleExample(TickStyle.Inside)
}

/**
 * Creates an example for the TickStyle property using TickStyle.Crossing.
 * @returns A PlotModel.
 */
function tickStyleCrossing(): PlotModel {
  return createTickStyleExample(TickStyle.Crossing)
}

/**
 * Creates an example for the TickStyle property using TickStyle.Outside.
 * @returns A PlotModel.
 */
function tickStyleOutside(): PlotModel {
  return createTickStyleExample(TickStyle.Outside)
}

/**
 * Color major and minor ticks differently
 * @returns A PlotModel.
 */
function tickLineColor(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'Color major and minor ticks differently' })
  plotModel1.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      majorGridlineThickness: 3,
      minorGridlineThickness: 3,
      ticklineColor: OxyColors.Blue,
      minorTicklineColor: OxyColors.Gray,
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      majorGridlineThickness: 3,
      minorGridlineThickness: 3,
      ticklineColor: OxyColors.Blue,
      minorTicklineColor: OxyColors.Gray,
    }),
  )
  return plotModel1
}

/**
 * No gridlines
 * @returns A PlotModel.
 */
function gridlineStyleNone(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'No gridlines' })
  plotModel1.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  plotModel1.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  return plotModel1
}

/**
 * Vertical gridlines
 * @returns A PlotModel.
 */
function gridLinestyleVertical(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'Vertical gridlines' })
  plotModel1.axes.push(new LinearAxis())
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      position: AxisPosition.Bottom,
    }),
  )
  return plotModel1
}

/**
 * Horizontal gridlines
 * @returns A PlotModel.
 */
function gridLinestyleHorizontal(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'Horizontal gridlines' })
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
    }),
  )
  plotModel1.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  return plotModel1
}

/**
 * Horizontal and vertical gridlines
 * @returns A PlotModel.
 */
function gridLinestyleBoth(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'Horizontal and vertical gridlines' })
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      position: AxisPosition.Bottom,
    }),
  )
  return plotModel1
}

/**
 * Axis position left/bottom
 * @returns A PlotModel.
 */
function axisPositionLeftAndBottom(): PlotModel {
  const plotModel1: PlotModel = new PlotModel()
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      title: 'Left',
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      position: AxisPosition.Bottom,
      title: 'Bottom',
    }),
  )
  return plotModel1
}

/**
 * Axis position top/right
 * @returns A PlotModel.
 */
function axisPositionTopRight(): PlotModel {
  const plotModel1: PlotModel = new PlotModel()
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      position: AxisPosition.Right,
      title: 'Right',
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      position: AxisPosition.Top,
      title: 'Top',
    }),
  )
  return plotModel1
}

/**
 * Axis label angle 45deg
 * @returns A PlotModel.
 */
function axisAngle45(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ plotMargins: newOxyThickness(60, 40, 60, 30) })
  plotModel1.axes.push(
    new LinearAxis({
      angle: 45,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      title: 'Left',
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      angle: 45,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      position: AxisPosition.Bottom,
      title: 'Bottom',
    }),
  )
  return plotModel1
}

/**
 * Zero crossing axis
 * @returns A PlotModel.
 */
function zeroCrossing(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({
    title: 'PositionAtZeroCrossing = true',
    plotAreaBorderThickness: newOxyThickness(0),
    plotMargins: newOxyThickness(10, 10, 10, 10),
  })
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 50,
      minimum: -30,
      positionAtZeroCrossing: true,
      axislineStyle: LineStyle.Solid,
      tickStyle: TickStyle.Crossing,
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 70,
      minimum: -50,
      position: AxisPosition.Bottom,
      positionAtZeroCrossing: true,
      axislineStyle: LineStyle.Solid,
      tickStyle: TickStyle.Crossing,
    }),
  )
  return plotModel1
}

/**
 * Bottom axis: PositionAtZeroCrossing = true
 * @returns A PlotModel.
 */
function horizontalZeroCrossing(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({
    title: 'Bottom axis: PositionAtZeroCrossing = true',
  })
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 50,
      minimum: -30,
      position: AxisPosition.Left,
      positionAtZeroCrossing: false,
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 70,
      minimum: -50,
      position: AxisPosition.Bottom,
      positionAtZeroCrossing: true,
      axislineStyle: LineStyle.Solid,
    }),
  )
  return plotModel1
}

/**
 * Left axis: PositionAtZeroCrossing = true
 * @returns A PlotModel.
 */
function verticalZeroCrossing(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'Left axis: PositionAtZeroCrossing = true' })
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 50,
      minimum: -30,
      position: AxisPosition.Left,
      positionAtZeroCrossing: true,
      axislineStyle: LineStyle.Solid,
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 70,
      minimum: -50,
      position: AxisPosition.Bottom,
      positionAtZeroCrossing: false,
    }),
  )
  return plotModel1
}

/**
 * EndPosition = 0, StartPosition = 1
 * @returns A PlotModel.
 */
function reversed(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'EndPosition = 0, StartPosition = 1' })
  plotModel1.axes.push(
    new LinearAxis({
      endPosition: 0,
      startPosition: 1,
      maximum: 50,
      minimum: -30,
      position: AxisPosition.Left,
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      endPosition: 0,
      startPosition: 1,
      maximum: 70,
      minimum: -50,
      position: AxisPosition.Bottom,
    }),
  )
  return plotModel1
}

/**
 * Sharing Y axis
 * @returns A PlotModel.
 */
function sharingY(): PlotModel {
  const plotModel1: PlotModel = new PlotModel()
  plotModel1.axes.push(
    new LinearAxis({
      endPosition: 0,
      startPosition: 1,
      maximum: 1.5,
      minimum: -1.5,
      position: AxisPosition.Left,
    }),
  )

  const x1 = new LinearAxis({
    startPosition: 0,
    endPosition: 0.45,
    maximum: 7,
    minimum: 0,
    position: AxisPosition.Bottom,
    key: 'x1',
  })
  plotModel1.axes.push(x1)

  const x2 = new LinearAxis({
    startPosition: 0.55,
    endPosition: 1,
    maximum: 10,
    minimum: 0,
    position: AxisPosition.Bottom,
    key: 'x2',
  })
  plotModel1.axes.push(x2)

  plotModel1.series.push(
    new FunctionSeries({
      f: Math.sin,
      x0: 0,
      x1: 10,
      n: 1000,
      xAxisKey: x1.key,
    }),
  )

  plotModel1.series.push(
    new FunctionSeries({
      f: Math.sin,
      x0: 0,
      x1: 10,
      n: 1000,
      xAxisKey: x2.key,
    }),
  )

  return plotModel1
}

/**
 * Four axes
 * @returns A PlotModel.
 */
function fourAxes(): PlotModel {
  const plotModel1: PlotModel = new PlotModel()
  plotModel1.axes.push(new LinearAxis({ maximum: 36, minimum: 0, title: 'km/h' }))
  plotModel1.axes.push(new LinearAxis({ maximum: 10, minimum: 0, position: AxisPosition.Right, title: 'm/s' }))
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 10,
      minimum: 0,
      position: AxisPosition.Bottom,
      title: 'meter',
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 10000,
      minimum: 0,
      position: AxisPosition.Top,
      title: 'millimeter',
    }),
  )
  return plotModel1
}

/**
 * Five axes
 * @returns A PlotModel.
 */
function fiveAxes(): PlotModel {
  const plotModel1: PlotModel = new PlotModel()
  plotModel1.axes.push(new LinearAxis({ endPosition: 0.25, maximum: 1, minimum: -1, title: 'C1' }))
  plotModel1.axes.push(
    new LinearAxis({
      endPosition: 0.5,
      maximum: 1,
      minimum: -1,
      position: AxisPosition.Right,
      startPosition: 0.25,
      title: 'C2',
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      endPosition: 0.75,
      maximum: 1,
      minimum: -1,
      startPosition: 0.5,
      title: 'C3',
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 1,
      minimum: -1,
      position: AxisPosition.Right,
      startPosition: 0.75,
      title: 'C4',
    }),
  )
  plotModel1.axes.push(new LinearAxis({ maximum: 100, minimum: 0, position: AxisPosition.Bottom, title: 's' }))
  return plotModel1
}

/**
 * Logarithmic axes
 * @returns A PlotModel.
 */
function logarithmicAxes(): PlotModel {
  const plotModel1: PlotModel = new PlotModel()
  plotModel1.axes.push(
    new LogarithmicAxis({
      maximum: 1000000,
      minimum: 1,
      title: 'Log axis',
      useSuperExponentialFormat: true,
    }),
  )
  plotModel1.axes.push(
    new LogarithmicAxis({
      maximum: 10000,
      minimum: 0.001,
      position: AxisPosition.Bottom,
      title: 'Log axis',
      useSuperExponentialFormat: true,
    }),
  )
  return plotModel1
}

const cartesianPlotLogarithmicAxes = (): PlotModel => {
  return new PlotModel({
    plotType: PlotType.Cartesian,
    axes: [
      new LogarithmicAxis({
        maximum: 1000000,
        minimum: 1,
        title: 'Log x axis',
        useSuperExponentialFormat: true,
        majorGridlineStyle: LineStyle.Solid,
        isPanEnabled: true,
      }),
      new LogarithmicAxis({
        maximum: 10000,
        minimum: 0.001,
        position: AxisPosition.Bottom,
        title: 'Log y axis',
        useSuperExponentialFormat: true,
        majorGridlineStyle: LineStyle.Solid,
        isPanEnabled: true,
      }),
    ],
  })
}

/**
 * Big numbers
 * @returns A PlotModel.
 */
function bigNumbers(): PlotModel {
  const plotModel1: PlotModel = new PlotModel()
  plotModel1.axes.push(new LinearAxis({ maximum: 6e32, minimum: -1e47, title: 'big numbers' }))
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 3e50,
      minimum: -1e40,
      position: AxisPosition.Bottom,
      title: 'big numbers',
    }),
  )
  return plotModel1
}

/**
 * Big numbers with super exponential format
 * @returns A PlotModel.
 */
function bigNumbersSuperExponentialFormat(): PlotModel {
  const plotModel1: PlotModel = new PlotModel()
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 6e32,
      minimum: -1e47,
      title: 'big numbers',
      useSuperExponentialFormat: true,
    }),
  )

  plotModel1.axes.push(
    new LinearAxis({
      maximum: 3e50,
      minimum: -1e40,
      position: AxisPosition.Bottom,
      title: 'big numbers',
      useSuperExponentialFormat: true,
    }),
  )
  return plotModel1
}

/**
 * Small numbers
 * @returns A PlotModel.
 */
function smallNumbers(): PlotModel {
  const plotModel1: PlotModel = new PlotModel()
  plotModel1.axes.push(new LinearAxis({ maximum: 6e-15, minimum: -5e-15, title: 'small numbers' }))
  plotModel1.axes.push(
    new LinearAxis({
      maximum: 3e-15,
      minimum: -4e-15,
      position: AxisPosition.Bottom,
      title: 'small numbers',
    }),
  )
  return plotModel1
}

/**
 * Default padding
 * @returns A PlotModel.
 */
function defaultPadding(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'Default padding' })
  plotModel1.axes.push(new LinearAxis())
  plotModel1.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  const lineSeries1 = new LineSeries({
    color: OxyColorHelper.fromArgb(255, 78, 154, 6),
    markerFill: OxyColorHelper.fromArgb(255, 78, 154, 6),
  })
  lineSeries1.points.push(newDataPoint(10, 4))
  lineSeries1.points.push(newDataPoint(12, 7))
  lineSeries1.points.push(newDataPoint(16, 3))
  lineSeries1.points.push(newDataPoint(20, 9))
  plotModel1.series.push(lineSeries1)
  return plotModel1
}

/**
 * No padding
 * @returns A PlotModel.
 */
function noPadding(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'No padding' })
  plotModel1.axes.push(new LinearAxis({ maximumPadding: 0, minimumPadding: 0 }))
  plotModel1.axes.push(new LinearAxis({ maximumPadding: 0, minimumPadding: 0, position: AxisPosition.Bottom }))
  const lineSeries1: LineSeries = new LineSeries({
    color: OxyColorHelper.fromArgb(255, 78, 154, 6),
    markerFill: OxyColorHelper.fromArgb(255, 78, 154, 6),
  })
  lineSeries1.points.push(newDataPoint(10, 4))
  lineSeries1.points.push(newDataPoint(12, 7))
  lineSeries1.points.push(newDataPoint(16, 3))
  lineSeries1.points.push(newDataPoint(20, 9))
  plotModel1.series.push(lineSeries1)
  return plotModel1
}

/**
 * Padding 10%
 * @returns A PlotModel.
 */
function padding(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'Padding 10%' })
  plotModel1.axes.push(new LinearAxis({ maximumPadding: 0.1, minimumPadding: 0.1 }))
  plotModel1.axes.push(
    new LinearAxis({
      maximumPadding: 0.1,
      minimumPadding: 0.1,
      position: AxisPosition.Bottom,
    }),
  )
  const lineSeries1: LineSeries = new LineSeries({
    color: OxyColorHelper.fromArgb(255, 78, 154, 6),
    markerFill: OxyColorHelper.fromArgb(255, 78, 154, 6),
  })
  lineSeries1.points.push(newDataPoint(10, 4))
  lineSeries1.points.push(newDataPoint(12, 7))
  lineSeries1.points.push(newDataPoint(16, 3))
  lineSeries1.points.push(newDataPoint(20, 9))
  plotModel1.series.push(lineSeries1)
  return plotModel1
}

/**
 * X-axis MinimumPadding=0.1
 * @returns A PlotModel.
 */
function xaxisMinimumPadding(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'X-axis MinimumPadding=0.1' })
  plotModel1.axes.push(new LinearAxis())
  plotModel1.axes.push(new LinearAxis({ minimumPadding: 0.1, position: AxisPosition.Bottom }))
  const lineSeries1: LineSeries = new LineSeries({
    color: OxyColorHelper.fromArgb(255, 78, 154, 6),
    markerFill: OxyColorHelper.fromArgb(255, 78, 154, 6),
  })
  lineSeries1.points.push(newDataPoint(10, 4))
  lineSeries1.points.push(newDataPoint(12, 7))
  lineSeries1.points.push(newDataPoint(16, 3))
  lineSeries1.points.push(newDataPoint(20, 9))
  plotModel1.series.push(lineSeries1)
  return plotModel1
}

/**
 * X-axis MaximumPadding=0.1
 * @returns A PlotModel.
 */
function xaxisMaximumPadding(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'X-axis MaximumPadding=0.1' })
  plotModel1.axes.push(new LinearAxis())
  plotModel1.axes.push(new LinearAxis({ maximumPadding: 0.1, position: AxisPosition.Bottom }))
  const lineSeries1: LineSeries = new LineSeries({
    color: OxyColorHelper.fromArgb(255, 78, 154, 6),
    markerFill: OxyColorHelper.fromArgb(255, 78, 154, 6),
  })
  lineSeries1.points.push(newDataPoint(10, 4))
  lineSeries1.points.push(newDataPoint(12, 7))
  lineSeries1.points.push(newDataPoint(16, 3))
  lineSeries1.points.push(newDataPoint(20, 9))
  plotModel1.series.push(lineSeries1)
  return plotModel1
}

/**
 * AbsoluteMinimum=-17, AbsoluteMaximum=63
 * @returns A PlotModel.
 */
function absoluteMinimumAndMaximum(): PlotModel {
  const model: PlotModel = new PlotModel({
    title: 'AbsoluteMinimum=-17, AbsoluteMaximum=63',
    subtitle: 'Zooming and panning is limited to these values.',
  })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: 0,
      maximum: 50,
      absoluteMinimum: -17,
      absoluteMaximum: 63,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 0,
      maximum: 50,
      absoluteMinimum: -17,
      absoluteMaximum: 63,
    }),
  )
  return model
}

/**
 * MinimumRange = 400
 * @returns A PlotModel.
 */
function minimumRange(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'MinimumRange = 400' })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimumRange: 400,
    }),
  )

  return model
}

/**
 * MaximumRange = 40
 * @returns A PlotModel.
 */
function maximumRange(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'MaximumRange = 40' })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      maximumRange: 40,
    }),
  )

  return model
}

/**
 * Axis titles with units
 * @returns A PlotModel.
 */
function titleWithUnit(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Axis titles with units' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'Speed', unit: 'km/h' }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, title: 'Temperature', unit: '°C' }))
  return model
}

/**
 * Invisible vertical axis
 * @returns A PlotModel.
 */
function invisibleVerticalAxis(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Invisible vertical axis' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, isAxisVisible: false }))
  model.series.push(
    new FunctionSeries({
      f: (x) => Math.sin(x) / x,
      x0: -5,
      x1: 5,
      dx: 0.1,
    }),
  )
  return model
}

/**
 * Invisible horizontal axis
 * @returns A PlotModel.
 */
function invisibleHorizontalAxis(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Invisible horizontal axis' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, isAxisVisible: false }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  model.series.push(
    new FunctionSeries({
      f: (x) => Math.sin(x) * x * x,
      x0: -5,
      x1: 5,
      dx: 0.1,
    }),
  )
  return model
}

/**
 * Zooming disabled
 * @returns A PlotModel.
 */
function zoomingDisabled(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Zooming disabled' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, isZoomEnabled: false }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, isZoomEnabled: false }))
  return model
}

/**
 * Panning disabled
 * @returns A PlotModel.
 */
function panningDisabled(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Panning disabled' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, isPanEnabled: false }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, isPanEnabled: false }))
  return model
}

/**
 * Dense intervals
 * @returns A PlotModel.
 */
function denseIntervals(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Dense intervals' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, intervalLength: 30 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, intervalLength: 20 }))
  return model
}

/**
 * Graph Paper
 * @returns A PlotModel.
 */
function graphPaper(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Graph Paper' })
  const c: OxyColor = OxyColors.DarkBlue
  model.plotType = PlotType.Cartesian
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'X',
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Y',
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  return model
}

/**
 * Log-Log Paper
 * @returns A PlotModel.
 */
function logLogPaper(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Log-Log Paper' })
  const c: OxyColor = OxyColors.DarkBlue
  model.axes.push(
    new LogarithmicAxis({
      position: AxisPosition.Bottom,
      title: 'X',
      minimum: 0.1,
      maximum: 1000,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  model.axes.push(
    new LogarithmicAxis({
      position: AxisPosition.Left,
      title: 'Y',
      minimum: 0.1,
      maximum: 1000,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  return model
}

/**
 * Black background
 * @returns A PlotModel.
 */
function onBlack(): PlotModel {
  const model: PlotModel = new PlotModel({
    title: 'Black background',
    background: OxyColors.Black,
    textColor: OxyColors.White,
    plotAreaBorderColor: OxyColors.White,
  })
  const c: OxyColor = OxyColors.White
  model.plotType = PlotType.Cartesian
  model.series.push(
    new FunctionSeries({
      f: Math.sin,
      x0: 0,
      x1: Math.PI * 2,
      n: 1000,
      title: 'f(x)=sin(x)',
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'x',
      majorStep: Math.PI / 2,
      formatAsFractions: true,
      fractionUnit: Math.PI,
      fractionUnitSymbol: 'π',
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
      ticklineColor: OxyColors.White,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'f(x)',
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
      ticklineColor: OxyColors.White,
    }),
  )
  return model
}

/**
 * Background and PlotAreaBackground
 * @returns A PlotModel.
 */
function backgrounds(): PlotModel {
  const model: PlotModel = new PlotModel({
    title: 'Background and PlotAreaBackground',
    background: OxyColors.Silver,
    plotAreaBackground: OxyColors.Gray,
    plotAreaBorderColor: OxyColors.Black,
    plotAreaBorderThickness: newOxyThickness(3),
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

/**
 * Current culture
 * @returns A PlotModel.
 */
function currentCulture(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Current culture' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -1, maximum: 1 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -1, maximum: 1 }))
  model.series.push(
    new FunctionSeries({
      f: Math.sin,
      x0: -1,
      x1: 1,
      n: 100,
    }),
  )
  return model
}

/**
 * Long axis titles (clipped at 90%)
 * @returns A PlotModel.
 */
function longAxisTitlesClipped90(): PlotModel {
  const longTitle = 'Long title 12345678901234567890123456789012345678901234567890123456789012345678901234567890'
  const tooltip = 'The tool tip is ' + longTitle
  const plotModel1: PlotModel = new PlotModel({ title: 'Long axis titles (clipped at 90%)' })
  plotModel1.axes.push(new LinearAxis({ position: AxisPosition.Left, title: longTitle, toolTip: tooltip }))
  plotModel1.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: longTitle, toolTip: tooltip }))
  return plotModel1
}

/**
 * Long axis titles (clipped at 100%)
 * @returns A PlotModel.
 */
function longAxisTitlesClipped100(): PlotModel {
  const longTitle = 'Long title 12345678901234567890123456789012345678901234567890123456789012345678901234567890'
  const tooltip = 'The tool tip is ' + longTitle
  const plotModel1: PlotModel = new PlotModel({ title: 'Long axis titles (clipped at 100%)' })
  plotModel1.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: longTitle,
      toolTip: tooltip,
      titleClippingLength: 1.0,
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: longTitle,
      toolTip: tooltip,
      titleClippingLength: 1.0,
    }),
  )
  return plotModel1
}

/**
 * Long axis titles (not clipped)
 * @returns A PlotModel.
 */
function longAxisTitlesNotClipped(): PlotModel {
  const longTitle = 'Long title 12345678901234567890123456789012345678901234567890123456789012345678901234567890'
  const tooltip = 'The tool tip is ' + longTitle
  const plotModel1: PlotModel = new PlotModel({ title: 'Long axis titles (not clipped)' })
  plotModel1.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: longTitle,
      toolTip: tooltip,
      clipTitle: false,
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: longTitle,
      toolTip: tooltip,
      clipTitle: false,
    }),
  )
  return plotModel1
}

/**
 * PositionTier
 * @returns A PlotModel.
 */
function positionTier(): PlotModel {
  const plotModel1: PlotModel = new PlotModel()
  const linearAxis1: LinearAxis = new LinearAxis({
    maximum: 1,
    minimum: -1,
    title: 'PositionTier=0',
  })
  plotModel1.axes.push(linearAxis1)
  const linearAxis2: LinearAxis = new LinearAxis({
    axislineStyle: LineStyle.Solid,
    maximum: 2,
    minimum: -2,
    positionTier: 1,
    title: 'PositionTier=1',
  })
  plotModel1.axes.push(linearAxis2)
  const linearAxis3: LinearAxis = new LinearAxis({
    maximum: 1,
    minimum: -1,
    position: AxisPosition.Right,
    title: 'PositionTier=0',
  })
  plotModel1.axes.push(linearAxis3)
  const linearAxis4: LinearAxis = new LinearAxis({
    axislineStyle: LineStyle.Solid,
    maximum: 2,
    minimum: -2,
    position: AxisPosition.Right,
    positionTier: 1,
    title: 'PositionTier=1',
  })
  plotModel1.axes.push(linearAxis4)
  const linearAxis5: LinearAxis = new LinearAxis({
    maximum: 1,
    minimum: -1,
    position: AxisPosition.Top,
    title: 'PositionTier=0',
  })
  plotModel1.axes.push(linearAxis5)
  const linearAxis6: LinearAxis = new LinearAxis({
    axislineStyle: LineStyle.Solid,
    maximum: 2,
    minimum: -2,
    position: AxisPosition.Top,
    positionTier: 1,
    title: 'PositionTier=1',
  })
  plotModel1.axes.push(linearAxis6)
  const linearAxis7: LinearAxis = new LinearAxis({
    axislineStyle: LineStyle.Solid,
    maximum: 10,
    minimum: -10,
    position: AxisPosition.Top,
    positionTier: 2,
    title: 'PositionTier=2',
  })
  plotModel1.axes.push(linearAxis7)
  const linearAxis8: LinearAxis = new LinearAxis({
    maximum: 1,
    minimum: -1,
    position: AxisPosition.Bottom,
    title: 'PositionTier=0',
  })
  plotModel1.axes.push(linearAxis8)
  const linearAxis9: LinearAxis = new LinearAxis({
    axislineStyle: LineStyle.Solid,
    maximum: 2,
    minimum: -2,
    position: AxisPosition.Bottom,
    positionTier: 1,
    title: 'PositionTier=1',
  })
  plotModel1.axes.push(linearAxis9)
  const linearAxis10: LinearAxis = new LinearAxis({
    axislineStyle: LineStyle.Solid,
    maximum: 10,
    minimum: -10,
    position: AxisPosition.Bottom,
    positionTier: 2,
    title: 'PositionTier=2',
  })
  plotModel1.axes.push(linearAxis10)
  return plotModel1
}

/**
 * Custom axis title color
 * @returns A PlotModel.
 */
function titleColor(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Custom axis title color' })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: -1,
      maximum: 1,
      title: 'Bottom axis',
      titleColor: OxyColors.Red,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: -1,
      maximum: 1,
      title: 'Left axis',
      titleColor: OxyColors.Blue,
    }),
  )
  model.series.push(
    new FunctionSeries({
      f: Math.sin,
      x0: -1,
      x1: 1,
      n: 100,
    }),
  )
  return model
}

/**
 * Custom axis label color
 * @returns A PlotModel.
 */
function labelColor(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Custom axis label color' })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: -1,
      maximum: 1,
      title: 'Bottom axis',
      textColor: OxyColors.Red,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: -1,
      maximum: 1,
      title: 'Left axis',
      textColor: OxyColors.Blue,
    }),
  )
  model.series.push(
    new FunctionSeries({
      f: Math.sin,
      x0: -1,
      x1: 1,
      n: 100,
    }),
  )
  return model
}

/**
 * Angled axis numbers
 * @returns A PlotModel.
 */
function angledAxisNumbers(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Angled axis numbers' })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: -1,
      maximum: 1,
      title: 'Bottom axis',
      angle: 45,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: -1,
      maximum: 1,
      title: 'Left axis',
      angle: 45,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Top,
      minimum: -1,
      maximum: 1,
      title: 'Top axis',
      angle: 45,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Right,
      minimum: -1,
      maximum: 1,
      title: 'Right axis',
      angle: 45,
    }),
  )
  return model
}

/**
 * Axis distance
 * @returns A PlotModel.
 */
function axisDistance(): PlotModel {
  const plotModel: PlotModel = new PlotModel({ title: 'AxisDistance = 20' })
  plotModel.axes.push(
    new LinearAxis({
      axislineStyle: LineStyle.Solid,
      axisDistance: 20,
      position: AxisPosition.Bottom,
    }),
  )
  plotModel.axes.push(
    new LinearAxis({
      axislineStyle: LineStyle.Solid,
      axisDistance: 20,
      position: AxisPosition.Left,
    }),
  )
  plotModel.axes.push(
    new LinearAxis({
      axislineStyle: LineStyle.Solid,
      axisDistance: 20,
      position: AxisPosition.Right,
    }),
  )
  plotModel.axes.push(new LinearAxis({ axislineStyle: LineStyle.Solid, axisDistance: 20, position: AxisPosition.Top }))
  return plotModel
}

/**
 * No axes defined
 * @returns A PlotModel.
 */
function noAxesDefined(): PlotModel {
  const plotModel: PlotModel = new PlotModel({
    title: 'No axes defined',
    subtitle: 'Bottom and left axes are auto-generated.',
  })
  plotModel.series.push(
    new FunctionSeries({
      f: Math.sin,
      x0: 0,
      x1: 10,
      n: 400,
    }),
  )
  return plotModel
}

/**
 * LabelFormatter
 * @returns A PlotModel.
 */
function labelFormatter(): PlotModel {
  const plotModel: PlotModel = new PlotModel({ title: 'LabelFormatter' })
  plotModel.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: -10,
      maximum: 10,
      labelFormatter: function (x) {
        return Math.abs(x) < Number.EPSILON ? 'ZERO' : x.toString()
      },
    }),
  )
  const charCodeA = 'A'.charCodeAt(0)
  plotModel.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 0,
      maximum: 25,
      majorStep: 1,
      minorStep: 1,
      maximumPadding: 0,
      minimumPadding: 0,
      labelFormatter: function (y) {
        return String.fromCharCode(y + charCodeA)
      },
    }),
  )
  return plotModel
}

/**
 * Tool tips
 * @returns A PlotModel.
 */
function toolTips(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'Tool tips' })
  plotModel1.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Left axis',
      toolTip: 'Tool tip for the left axis',
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'Bottom axis',
      toolTip: 'Tool tip for the bottom axis',
    }),
  )
  return plotModel1
}

/**
 * Sub- and superscript in axis titles
 * @returns A PlotModel.
 */
function subSuperscriptInAxisTitles(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'Sub- and superscript in axis titles' })
  plotModel1.axes.push(new LinearAxis({ title: 'Title with^{super}_{sub}script' }))
  plotModel1.axes.push(new LinearAxis({ title: 'Title with^{super}_{sub}script', position: AxisPosition.Bottom }))
  return plotModel1
}

/**
 * MinimumMajorStep
 * @returns A PlotModel.
 */
function minimumMajorStep(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Axes with MinimumMajorStep' })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'MinimuMajorStep = 1',
      minimum: 0,
      maximum: 2,
      minimumMajorStep: 1,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'MinimuMajorStep = 10',
      minimum: 0,
      maximum: 15,
      minimumMajorStep: 10,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Top,
      title: 'MinimuMajorStep = 0 (default)',
      minimum: 0,
      maximum: 2,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Right,
      title: 'MinimuMajorStep = 0 (default)',
      minimum: 0,
      maximum: 15,
    }),
  )
  return model
}

/**
 * MinimumMinorStep
 * @returns A PlotModel.
 */
function minimumMinorStep(): PlotModel {
  const model: PlotModel = new PlotModel({
    title: 'Axes with MinimumMinorStep',
  })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'MinimumMinorStep = 1',
      minimum: 0,
      maximum: 20,
      minimumMinorStep: 1,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'MinimumMinorStep = 10',
      minimum: 0,
      maximum: 150,
      minimumMinorStep: 10,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Top,
      title: 'MinimumMinorStep = 0 (default)',
      minimum: 0,
      maximum: 20,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Right,
      title: 'MinimumMinorStep = 0 (default)',
      minimum: 0,
      maximum: 150,
    }),
  )
  return model
}

/**
 * Default AxisTitleDistance
 * @returns A PlotModel.
 */
function defaultAxisTitleDistance(): PlotModel {
  const model: PlotModel = new PlotModel({
    title: 'AxisTitleDistance = 4 (default)',
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'Bottom', minimum: 0, maximum: 20 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, title: 'Left', minimum: 0, maximum: 150 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Top, title: 'Top', minimum: 0, maximum: 20 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Right, title: 'Right', minimum: 0, maximum: 150 }))
  return model
}

/**
 * Custom AxisTitleDistance
 * @returns A PlotModel.
 */
function customAxisTitleDistance(): PlotModel {
  const model: PlotModel = new PlotModel({
    title: 'AxisTitleDistance = 40',
  })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'Bottom',
      minimum: 0,
      maximum: 20,
      axisTitleDistance: 40,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Left',
      minimum: 0,
      maximum: 150,
      axisTitleDistance: 40,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Top,
      title: 'Top',
      minimum: 0,
      maximum: 20,
      axisTitleDistance: 40,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Right,
      title: 'Right',
      minimum: 0,
      maximum: 150,
      axisTitleDistance: 40,
    }),
  )
  return model
}

/**
 * MajorGridlineStyle
 * @returns A PlotModel.
 */
function majorGridlineStyle(): PlotModel {
  const pm: PlotModel = new PlotModel({ title: 'MajorGridlineStyle and MajorGridlineThickness' })
  pm.axes.push(new LinearAxis({ majorGridlineStyle: LineStyle.Solid, majorGridlineThickness: 10 }))
  pm.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      majorGridlineThickness: 10,
      position: AxisPosition.Bottom,
    }),
  )
  return pm
}

/**
 * Gridlines Cropping: Horizontal and vertical
 * @returns A PlotModel.
 */
function gridlineCroppingBoth(): PlotModel {
  const plotModel1: PlotModel = new PlotModel({ title: 'Gridline cropping' })
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      extraGridlines: [46],
      extraGridlineColor: OxyColors.Red,
      startPosition: 0.1,
      endPosition: 0.4,
      cropGridlines: true,
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      extraGridlines: [46],
      extraGridlineColor: OxyColors.Red,
      startPosition: 0.6,
      endPosition: 0.9,
      cropGridlines: true,
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      position: AxisPosition.Bottom,
      extraGridlines: [46],
      extraGridlineColor: OxyColors.Red,
      startPosition: 0.1,
      endPosition: 0.4,
      cropGridlines: true,
    }),
  )
  plotModel1.axes.push(
    new LinearAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Dot,
      position: AxisPosition.Bottom,
      extraGridlines: [46],
      extraGridlineColor: OxyColors.Red,
      startPosition: 0.6,
      endPosition: 0.9,
      cropGridlines: true,
    }),
  )
  return plotModel1
}

/**
 * Multi vertical axes with lineSeries
 * @returns A PlotModel.
 */
function multiVerticalAxes(): PlotModel {
  const keyAxisY_Temperature = 'axisY_Temperature'
  const keyAxisY_Pressure = 'axisY_Pressure'
  const keyAxisY_Humidity = 'axisY_Humidity'

  const plotModel: PlotModel = new PlotModel({
    title: 'Multi vertical axes with lineSeries',
  })

  const l: Legend = new Legend({
    legendBackground: OxyColors.White,
  })
  plotModel.legends.push(l)

  const axisX_Time: DateTimeAxis = new DateTimeAxis({
    title: 'Time',
    position: AxisPosition.Bottom,
    majorGridlineStyle: LineStyle.Solid,
    fontSize: 13,
  })
  plotModel.axes.push(axisX_Time)

  let lineSeriesTemperature: LineSeries | null = null
  let lineSeriesPressure: LineSeries | null = null
  let lineSeriesHumidity: LineSeries | null = null
  let axisY_Temperature: LinearAxis | null = null
  let axisY_Pressure: LinearAxis | null = null
  let axisY_Humidity: LinearAxis | null = null

  //Initialization lineSeries temperature
  {
    axisY_Temperature = new LinearAxis({
      title: 'Temperature',
      position: AxisPosition.Left,
      majorGridlineStyle: LineStyle.None,
      positionTier: 1,
      key: keyAxisY_Temperature,
      isAxisVisible: true,
    })

    lineSeriesTemperature = new LineSeries({
      title: 'Temperature',
      color: OxyColors.Tomato,
      lineStyle: LineStyle.Solid,
      markerType: MarkerType.Circle,
      markerSize: 3,
      markerFill: OxyColors.Red,
      yAxisKey: keyAxisY_Temperature,
      isVisible: true,
    })

    plotModel.axes.push(axisY_Temperature)
    plotModel.series.push(lineSeriesTemperature)
  }

  // Initialization lineSeries pressure
  {
    axisY_Pressure = new LinearAxis({
      title: 'Pressure',
      position: AxisPosition.Left,
      majorGridlineStyle: LineStyle.None,
      positionTier: 2,
      key: keyAxisY_Pressure,
      isAxisVisible: true,
    })

    lineSeriesPressure = new LineSeries({
      title: 'Pressure',
      color: OxyColors.Peru,
      lineStyle: LineStyle.Solid,
      markerType: MarkerType.Circle,
      markerSize: 3,
      markerFill: OxyColors.Sienna,
      yAxisKey: keyAxisY_Pressure,
      isVisible: true,
    })

    plotModel.axes.push(axisY_Pressure)
    plotModel.series.push(lineSeriesPressure)
  }

  // Initialization lineSeries humidity
  {
    axisY_Humidity = new LinearAxis({
      title: 'Humidity',
      position: AxisPosition.Left,
      majorGridlineStyle: LineStyle.None,
      positionTier: 3,
      key: keyAxisY_Humidity,
      isAxisVisible: true,
    })

    lineSeriesHumidity = new LineSeries({
      title: 'Humidity',
      color: OxyColors.LightSkyBlue,
      lineStyle: LineStyle.Solid,
      markerType: MarkerType.Circle,
      markerSize: 3,
      markerFill: OxyColors.DeepSkyBlue,
      yAxisKey: keyAxisY_Humidity,
      isVisible: true,
    })

    plotModel.axes.push(axisY_Humidity)
    plotModel.series.push(lineSeriesHumidity)
  }

  // Add points
  {
    lineSeriesTemperature.points.length = 0
    lineSeriesPressure.points.length = 0
    lineSeriesHumidity.points.length = 0

    const timeSpan = TimeSpan.fromMilliseconds(1000) // in milliseconds
    const dataService = getDateService()
    let time = new Date(2018, 8, 10) // months are 0-based in JavaScript
    const countPoints = 100
    for (let i = 1; i <= countPoints; i++) {
      const temperature = 20 + Math.sin(i)
      const pressure = 760 + 1.5 * Math.cos(1.5 * i)
      const humidity = 50 + 2.0 * Math.sin(2.0 * i)

      lineSeriesTemperature.points.push(DateTimeAxis.createDataPoint(time, temperature))
      lineSeriesPressure.points.push(DateTimeAxis.createDataPoint(time, pressure))
      lineSeriesHumidity.points.push(DateTimeAxis.createDataPoint(time, humidity))

      time = dataService.addTimespan(time, timeSpan)
    }

    axisY_Temperature.minimum = 10
    axisY_Temperature.maximum = 23

    axisY_Pressure.minimum = 750
    axisY_Pressure.maximum = 770

    axisY_Humidity.minimum = 47
    axisY_Humidity.maximum = 60
  }

  return plotModel
}

/**
 * Auto Margins
 * @returns A PlotModel.
 */
function autoMargin(): PlotModel {
  const plotModel: PlotModel = new PlotModel({
    title: 'Auto-adjusting plot margins',
    subtitle: 'When zooming in and out the plot margins should adjust accordingly',
  })
  plotModel.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'X Axis', titleFontSize: 16 }))
  return plotModel
}

/**
 * Manual Margins
 * @returns A PlotModel.
 */
function manualMargins(): PlotModel {
  const plotModel: PlotModel = new PlotModel({
    title: 'Manual Margins',
    subtitle: 'PlotMargins = 40',
    plotMargins: newOxyThickness(40),
  })
  plotModel.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  return plotModel
}

/**
 * Manual Left Margin
 * @returns A PlotModel.
 */
function manualLeftMargin(): PlotModel {
  const plotModel: PlotModel = new PlotModel({
    title: 'Manual Left Margin',
    subtitle: 'PlotMargins = 40,NaN,NaN,NaN',
    plotMargins: newOxyThickness(40, NaN, NaN, NaN),
  })
  plotModel.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  return plotModel
}

/**
 * Auto Margins - Wide Labels
 * @returns A PlotModel.
 */
function autoMarginWideLabels(): PlotModel {
  const plotModel: PlotModel = new PlotModel({
    title: 'Auto-adjusting plot margins - wide axis labels',
    subtitle: 'There should be enough space reserved such that the axis labels always fit in the viewport',
  })
  plotModel.axes.push(getLongLabelSeries())
  return plotModel
}

/**
 * Auto Margins - Wide Labels, rotated
 * @returns A PlotModel.
 */
function autoMarginWideLabelsRotated(): PlotModel {
  const plotModel: PlotModel = new PlotModel({
    title: 'Auto-adjusting plot margins - wide rotated axis labels',
    subtitle: 'There should be enough space reserved such that the axis labels always fit in the viewport',
  })
  const axis = getLongLabelSeries()
  axis.angle = -90
  plotModel.axes.push(axis)
  return plotModel
}

/**
 * Auto Margins - Wide Labels, fixed Range
 * @returns A PlotModel.
 */
function autoMarginWideLabelsFixedRange(): PlotModel {
  const plotModel: PlotModel = new PlotModel({
    title: 'Auto-adjusting plot margins - wide axis labels, fixed range',
    subtitle: 'When the axis range is fixed there should be no unnecessary space reserved for axis labels',
  })
  const axis = getLongLabelSeries()
  axis.isPanEnabled = false
  axis.isZoomEnabled = false
  plotModel.axes.push(axis)
  return plotModel
}

/**
 * Auto Margins - Wide Labels, fixed Range 2
 * @returns A PlotModel.
 */
function autoMarginWideLabelsFixedRange2(): PlotModel {
  const plotModel: PlotModel = new PlotModel({
    title: 'Auto-adjusting plot margins - wide axis labels, fixed range',
    subtitle: 'The axis labels should exactly fit in the viewport',
  })
  const axis = getLongLabelSeries()
  axis.isPanEnabled = false
  axis.isZoomEnabled = false
  axis.minimum = -0.01
  axis.maximum = 3.01
  plotModel.axes.push(axis)
  return plotModel
}

function getLongLabelSeries(): CategoryAxis {
  const axis: CategoryAxis = new CategoryAxis({ position: AxisPosition.Bottom })
  axis.labels.push('Label')
  axis.labels.push('Long Label')
  axis.labels.push('Longer Label')
  axis.labels.push('Even Longer Label')
  return axis
}

/**
 * Data Margins
 * @returns A PlotModel.
 */
function minimumAndMaximumDataMargins(): PlotModel {
  const plot: PlotModel = new PlotModel({
    title: 'Normal distribution',
    subtitle: 'Probability density function',
  })

  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimumPadding: 0,
      maximumPadding: 0,
      minimumDataMargin: 20,
      maximumDataMargin: 20,
      minimum: 0,
      tickStyle: TickStyle.Inside,
    }),
  )
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimumPadding: 0,
      maximumPadding: 0,
      minimumDataMargin: 20,
      maximumDataMargin: 20,
      tickStyle: TickStyle.Inside,
    }),
  )
  plot.series.push(createNormalDistributionSeries(-5, 5, 0, 0.2))
  plot.series.push(createNormalDistributionSeries(-5, 5, 0, 1))
  plot.series.push(createNormalDistributionSeries(-5, 5, 0, 5))
  plot.series.push(createNormalDistributionSeries(-5, 5, -2, 0.5))

  return plot
}

/**
 * Data Margins with Zero-Crossing
 * @returns A PlotModel.
 */
function minimumAndMaximumDataMarginsZeroCrossing(): PlotModel {
  const plot: PlotModel = new PlotModel({
    title: 'Normal distribution',
    subtitle: 'Probability density function',
  })

  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimumPadding: 0,
      maximumPadding: 0,
      minimumDataMargin: 20,
      maximumDataMargin: 20,
      minimum: 0,
      tickStyle: TickStyle.Crossing,
      axislineStyle: LineStyle.Solid,
      positionAtZeroCrossing: true,
    }),
  )
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimumPadding: 0,
      maximumPadding: 0,
      minimumDataMargin: 20,
      maximumDataMargin: 20,
      tickStyle: TickStyle.Crossing,
      axislineStyle: LineStyle.Solid,
      positionAtZeroCrossing: true,
    }),
  )
  plot.series.push(createNormalDistributionSeries(-5, 5, 0, 0.2))
  plot.series.push(createNormalDistributionSeries(-5, 5, 0, 1))
  plot.series.push(createNormalDistributionSeries(-5, 5, 0, 5))
  plot.series.push(createNormalDistributionSeries(-5, 5, -2, 0.5))

  return plot
}

/**
 * Data Margins on Log Axis
 * @returns A PlotModel.
 */
function minimumAndMaximumDataMarginsLog(): PlotModel {
  const plot: PlotModel = new PlotModel({
    title: 'Exponentials',
  })

  plot.axes.push(
    new LogarithmicAxis({
      position: AxisPosition.Bottom,
      minimumPadding: 0,
      maximumPadding: 0,
      minimumDataMargin: 20,
      maximumDataMargin: 20,
      tickStyle: TickStyle.Inside,
    }),
  )

  plot.axes.push(
    new LogarithmicAxis({
      position: AxisPosition.Left,
      minimumPadding: 0,
      maximumPadding: 0,
      minimumDataMargin: 20,
      maximumDataMargin: 20,
      tickStyle: TickStyle.Inside,
    }),
  )

  for (let i = 1; i <= 5; i++) {
    plot.series.push(
      new FunctionSeries({
        f: (x) => Math.pow(i, x),
        x0: 0,
        x1: 10,
        dx: 0.01,
        title: `${i}^x`,
      }),
    )
  }

  return plot
}

/**
 * Data Margins on Polar Plot
 * @returns A PlotModel.
 */
function minimumAndMaximumMarginsPolar(): PlotModel {
  const model: PlotModel = new PlotModel({
    title: 'Spiral',
    plotType: PlotType.Polar,
    plotAreaBorderThickness: newOxyThickness(0),
  })

  model.axes.push(
    new AngleAxis({
      majorStep: Math.PI / 4,
      minorStep: Math.PI / 16,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      formatAsFractions: true,
      fractionUnit: Math.PI,
      fractionUnitSymbol: 'π',
      minimum: 0,
      maximum: 2 * Math.PI,
    }),
  )

  model.axes.push(
    new MagnitudeAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      minimumPadding: 0,
      maximumPadding: 0,
      minimumDataMargin: 0,
      maximumDataMargin: 20,
    }),
  )

  model.series.push(
    new FunctionSeries({
      fx: (t) => t,
      fy: (t) => t,
      t0: 0,
      t1: Math.PI * 6,
      dt: 0.01,
    }),
  )
  return model
}

/**
 * Axis Margins
 * @returns A PlotModel.
 */
function axisOutMargins(): PlotModel {
  const plot: PlotModel = new PlotModel({
    title: 'YAxes are evenly distributed with a constant gap',
    plotAreaBorderThickness: newOxyThickness(0),
  })

  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      axislineStyle: LineStyle.Solid,
      key: 'X',
    }),
  )

  const n = 4
  const gap = 10

  for (let i = 0; i < n; i++) {
    plot.axes.push(
      new LinearAxis({
        position: AxisPosition.Left,
        startPosition: i / n,
        endPosition: (i + 1) / n,
        minimumMargin: (i / n) * gap,
        maximumMargin: ((n - i - 1) / n) * gap,
        axislineStyle: LineStyle.Solid,
        key: `Y${i}`,
      }),
    )

    plot.series.push(
      new FunctionSeries({
        f: (x) => Math.sin(x * (i + 1)),
        x0: 1,
        x1: 10,
        dx: 0.01,
        title: `x^${i}`,
        xAxisKey: 'X',
        yAxisKey: `Y${i}`,
      }),
    )
  }

  return plot
}

/**
 * Axis Margins Clipping
 * @returns A PlotModel.
 */
function axisMarginsClipping(): PlotModel {
  const plot: PlotModel = new PlotModel({
    title: 'Axis Margins Clipping',
    subtitle: 'Data Points and Visual Elements are clipped outside the Clip Bounds',
  })

  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimumPadding: 0,
      maximumPadding: 0,
      minimumMargin: 20,
      maximumMargin: 20,
    }),
  )
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimumPadding: 0,
      maximumPadding: 0,
      minimumMargin: 20,
      maximumMargin: 20,
    }),
  )

  const rnd = new Random(1)

  const scatter: ScatterSeries = new ScatterSeries({
    markerType: MarkerType.Diamond,
  })

  for (let i = 0; i < 100; i++) {
    scatter.points.push({ x: rnd.next(), y: rnd.next() })
  }

  plot.series.push(scatter)

  return plot
}

/**
 * Axis Margins on Polar Plot
 * @returns A PlotModel.
 */
function polarOuterMargins(): PlotModel {
  const model: PlotModel = new PlotModel({
    title: 'Spiral',
    plotType: PlotType.Polar,
    plotAreaBorderThickness: newOxyThickness(0),
  })

  model.axes.push(
    new AngleAxis({
      majorStep: Math.PI / 4,
      minorStep: Math.PI / 16,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      formatAsFractions: true,
      fractionUnit: Math.PI,
      fractionUnitSymbol: 'π',
      minimum: 0,
      maximum: 2 * Math.PI,
    }),
  )

  model.axes.push(
    new MagnitudeAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      minimumPadding: 0,
      maximumPadding: 0,
      minimumMargin: 0,
      maximumMargin: 100,
    }),
  )

  model.series.push(
    new FunctionSeries({
      fx: (t) => t,
      fy: (t) => t,
      t0: 0,
      t1: Math.PI * 6,
      dt: 0.01,
    }),
  )
  return model
}

/**
 * Axis Margins, Data Margins, and Padding
 * @returns A PlotModel.
 */
function marginsAndPadding(): PlotModel {
  const plot: PlotModel = new PlotModel({
    title: 'Try resizing the plot',
    subtitle: 'ClipMinimum/Maximum are Blue\nActualMinimum/Maximum are Red\nDataMinimum/Maximum are Green',
  })

  const xaxis: LinearAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    minimumPadding: 0.1,
    maximumPadding: 0.1,
    minimumDataMargin: 20,
    maximumDataMargin: 20,
    minimumMargin: 30,
    maximumMargin: 30,
    majorGridlineStyle: LineStyle.Solid,
    minorGridlineStyle: LineStyle.Dash,
    cropGridlines: true,
  })

  plot.axes.push(xaxis)

  const yaxis: LinearAxis = new LinearAxis({
    position: AxisPosition.Left,
    minimumPadding: 0.1,
    maximumPadding: 0.1,
    minimumDataMargin: 20,
    maximumDataMargin: 20,
    minimumMargin: 30,
    maximumMargin: 30,
    majorGridlineStyle: LineStyle.Solid,
    minorGridlineStyle: LineStyle.Dash,
    cropGridlines: true,
  })

  plot.axes.push(yaxis)

  const rectangle: LineSeries = new LineSeries()
  rectangle.color = OxyColors.Green
  rectangle.points.push(newDataPoint(-5.0, 0.0))
  rectangle.points.push(newDataPoint(-5.0, 20.0))
  rectangle.points.push(newDataPoint(25.0, 20.0))
  rectangle.points.push(newDataPoint(25.0, 0.0))
  rectangle.points.push(newDataPoint(-5.0, 0.0))
  plot.series.push(rectangle)

  _addAxisMarginAnnotations(plot)

  return plot
}

function _addAxisMarginAnnotations(plot: PlotModel): void {
  plot.annotations.push(
    new DelegateAnnotation(async (rc: IRenderContext) => {
      const drawLine = RenderingExtensions.drawLine
      for (const axis of plot.axes) {
        if (axis.isHorizontal()) {
          const h = axis
          await drawLine(
            rc,
            h.transform(h.clipMinimum),
            0.0,
            h.transform(h.clipMinimum),
            plot.height,
            new OxyPen(OxyColors.Blue, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )
          await drawLine(
            rc,
            h.transform(h.clipMaximum),
            0.0,
            h.transform(h.clipMaximum),
            plot.height,
            new OxyPen(OxyColors.Blue, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )

          await drawLine(
            rc,
            h.transform(h.actualMinimum),
            0.0,
            h.transform(h.actualMinimum),
            plot.height,
            new OxyPen(OxyColors.Red, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )
          await drawLine(
            rc,
            h.transform(h.actualMaximum),
            0.0,
            h.transform(h.actualMaximum),
            plot.height,
            new OxyPen(OxyColors.Red, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )

          await drawLine(
            rc,
            h.transform(h.dataMinimum),
            0.0,
            h.transform(h.dataMinimum),
            plot.height,
            new OxyPen(OxyColors.Green, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )
          await drawLine(
            rc,
            h.transform(h.dataMaximum),
            0.0,
            h.transform(h.dataMaximum),
            plot.height,
            new OxyPen(OxyColors.Green, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )
        } else {
          const v = axis
          await drawLine(
            rc,
            0.0,
            v.transform(v.clipMinimum),
            plot.width,
            v.transform(v.clipMinimum),
            new OxyPen(OxyColors.Blue, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )
          await drawLine(
            rc,
            0.0,
            v.transform(v.clipMaximum),
            plot.width,
            v.transform(v.clipMaximum),
            new OxyPen(OxyColors.Blue, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )

          await drawLine(
            rc,
            0.0,
            v.transform(v.actualMinimum),
            plot.width,
            v.transform(v.actualMinimum),
            new OxyPen(OxyColors.Red, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )
          await drawLine(
            rc,
            0.0,
            v.transform(v.actualMaximum),
            plot.width,
            v.transform(v.actualMaximum),
            new OxyPen(OxyColors.Red, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )

          await drawLine(
            rc,
            0.0,
            v.transform(v.dataMinimum),
            plot.width,
            v.transform(v.dataMinimum),
            new OxyPen(OxyColors.Green, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )
          await drawLine(
            rc,
            0.0,
            v.transform(v.dataMaximum),
            plot.width,
            v.transform(v.dataMaximum),
            new OxyPen(OxyColors.Green, 1, LineStyle.Dot),
            EdgeRenderingMode.Automatic,
          )
        }
      }
    }),
  )
}

/**
 * Axis Margins, Data Margins, and Padding, Asymmetrical
 * @returns A PlotModel.
 */
function marginsAndPaddingAsymmetrical(): PlotModel {
  const plot: PlotModel = new PlotModel({
    title: 'Try resizing the plot',
    subtitle: 'ClipMinimum/Maximum are Blue\nActualMinimum/Maximum are Red\nDataMinimum/Maximum are Green',
  })

  const xaxis: LinearAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    minimumPadding: 0.1,
    maximumPadding: 0.05,
    minimumDataMargin: 20,
    maximumDataMargin: 10,
    minimumMargin: 30,
    maximumMargin: 15,
    majorGridlineStyle: LineStyle.Solid,
    minorGridlineStyle: LineStyle.Dash,
    cropGridlines: true,
  })

  plot.axes.push(xaxis)

  const yaxis: LinearAxis = new LinearAxis({
    position: AxisPosition.Left,
    minimumPadding: 0.2,
    maximumPadding: 0.1,
    minimumDataMargin: 40,
    maximumDataMargin: 20,
    minimumMargin: 60,
    maximumMargin: 30,
    majorGridlineStyle: LineStyle.Solid,
    minorGridlineStyle: LineStyle.Dash,
    cropGridlines: true,
  })

  plot.axes.push(yaxis)

  const rectangle: LineSeries = new LineSeries()
  rectangle.color = OxyColors.Green
  rectangle.points.push(newDataPoint(-5.0, 0.0))
  rectangle.points.push(newDataPoint(-5.0, 20.0))
  rectangle.points.push(newDataPoint(25.0, 20.0))
  rectangle.points.push(newDataPoint(25.0, 0.0))
  rectangle.points.push(newDataPoint(-5.0, 0.0))
  plot.series.push(rectangle)

  _addAxisMarginAnnotations(plot)

  return plot
}

/**
 * Minimum Major Interval Count
 * @returns A PlotModel.
 */
function minimumMajorIntervalCount(): PlotModel {
  const plot: PlotModel = new PlotModel({
    title: 'MinimumMajorIntervalCount = 10',
  })

  const xaxis: LinearAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    minimumMajorIntervalCount: 10,
  })

  plot.axes.push(xaxis)

  const yaxis: LinearAxis = new LinearAxis({
    position: AxisPosition.Left,
    minimumMajorIntervalCount: 10,
  })

  plot.axes.push(yaxis)

  return plot
}

/**
 * Maximum Major Interval Count
 * @returns A PlotModel.
 */
function maximumMajorIntervalCount(): PlotModel {
  const plot: PlotModel = new PlotModel({
    title: 'MaximumMajorIntervalCount = 5',
  })

  const xaxis: LinearAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    maximumMajorIntervalCount: 5,
  })

  plot.axes.push(xaxis)

  const yaxis: LinearAxis = new LinearAxis({
    position: AxisPosition.Left,
    maximumMajorIntervalCount: 5,
  })

  plot.axes.push(yaxis)

  return plot
}

/**
 * Minimum and Maximum Major Interval Count
 * @returns A PlotModel.
 */
function minimumAndMaximumMajorIntervalCount(): PlotModel {
  const plot: PlotModel = new PlotModel({
    title: 'MinimumMajorIntervalCount = MaximumMajorIntervalCount = 4',
  })

  const xaxis: LinearAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    minimumMajorIntervalCount: 4,
    maximumMajorIntervalCount: 4,
  })

  plot.axes.push(xaxis)

  const yaxis: LinearAxis = new LinearAxis({
    position: AxisPosition.Left,
    minimumMajorIntervalCount: 4,
    maximumMajorIntervalCount: 4,
  })

  plot.axes.push(yaxis)

  return plot
}

/**
 * Creates an example with the specified TickStyle.
 * @param tickStyle The tick style.
 * @returns A PlotModel.
 */
function createTickStyleExample(tickStyle: TickStyle): PlotModel {
  const tickStyleStr = getEnumName(TickStyle, tickStyle)
  const plotModel1: PlotModel = new PlotModel({ title: 'TickStyle = ' + tickStyleStr })
  plotModel1.axes.push(new LinearAxis({ position: AxisPosition.Left, tickStyle: tickStyle }))
  plotModel1.axes.push(new LinearAxis({ position: AxisPosition.Bottom, tickStyle: tickStyle }))
  return plotModel1
}

const category = 'Axis examples'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'TickStyle: None',
      example: {
        model: tickStyleNone,
      },
    },
    {
      title: 'TickStyle: Inside',
      example: {
        model: tickStyleInside,
      },
    },
    {
      title: 'TickStyle: Crossing',
      example: {
        model: tickStyleCrossing,
      },
    },
    {
      title: 'TickStyle: Outside',
      example: {
        model: tickStyleOutside,
      },
    },
    {
      title: 'TickStyle: Color major and minor ticks differently',
      example: {
        model: tickLineColor,
      },
    },
    {
      title: 'GridLinestyle: None (default)',
      example: {
        model: gridlineStyleNone,
      },
    },
    {
      title: 'GridLinestyle: Vertical',
      example: {
        model: gridLinestyleVertical,
      },
    },
    {
      title: 'GridLinestyle: Horizontal',
      example: {
        model: gridLinestyleHorizontal,
      },
    },
    {
      title: 'GridLinestyle: Horizontal and vertical',
      example: {
        model: gridLinestyleBoth,
      },
    },
    {
      title: 'Axis position left/bottom',
      example: {
        model: axisPositionLeftAndBottom,
      },
    },
    {
      title: 'Axis position top/right',
      example: {
        model: axisPositionTopRight,
      },
    },
    {
      title: 'Axis label angle 45deg',
      example: {
        model: axisAngle45,
      },
    },
    {
      title: 'Zero crossing axis',
      example: {
        model: zeroCrossing,
      },
    },
    {
      title: 'Horizontal zero crossing axis',
      example: {
        model: horizontalZeroCrossing,
      },
    },
    {
      title: 'Vertical zero crossing axis',
      example: {
        model: verticalZeroCrossing,
      },
    },
    {
      title: 'Reversed',
      example: {
        model: reversed,
      },
    },
    {
      title: 'Sharing Y axis',
      example: {
        model: sharingY,
      },
    },
    {
      title: 'Four axes',
      example: {
        model: fourAxes,
      },
    },
    {
      title: 'Five axes',
      example: {
        model: fiveAxes,
      },
    },
    {
      title: 'Logarithmic axes',
      example: {
        model: logarithmicAxes,
      },
    },
    {
      title: 'Logarithmic axes Cartesian Plot',
      example: {
        model: cartesianPlotLogarithmicAxes,
      },
    },
    {
      title: 'Big numbers',
      example: {
        model: bigNumbers,
      },
    },
    {
      title: 'Big numbers with super exponential format',
      example: {
        model: bigNumbersSuperExponentialFormat,
      },
    },
    {
      title: 'Small numbers',
      example: {
        model: smallNumbers,
      },
    },
    {
      title: 'Default padding',
      example: {
        model: defaultPadding,
      },
    },
    {
      title: 'No padding',
      example: {
        model: noPadding,
      },
    },
    {
      title: 'Padding 10%',
      example: {
        model: padding,
      },
    },
    {
      title: 'X-axis MinimumPadding=0.1',
      example: {
        model: xaxisMinimumPadding,
      },
    },
    {
      title: 'X-axis MaximumPadding=0.1',
      example: {
        model: xaxisMaximumPadding,
      },
    },
    {
      title: 'AbsoluteMinimum and AbsoluteMaximum',
      example: {
        model: absoluteMinimumAndMaximum,
      },
    },
    {
      title: 'MinimumRange',
      example: {
        model: minimumRange,
      },
    },
    {
      title: 'MaximumRange',
      example: {
        model: maximumRange,
      },
    },
    {
      title: 'Title with unit',
      example: {
        model: titleWithUnit,
      },
    },
    {
      title: 'Invisible vertical axis',
      example: {
        model: invisibleVerticalAxis,
      },
    },
    {
      title: 'Invisible horizontal axis',
      example: {
        model: invisibleHorizontalAxis,
      },
    },
    {
      title: 'Zooming disabled',
      example: {
        model: zoomingDisabled,
      },
    },
    {
      title: 'Panning disabled',
      example: {
        model: panningDisabled,
      },
    },
    {
      title: 'Dense intervals',
      example: {
        model: denseIntervals,
      },
    },
    {
      title: 'Graph Paper',
      example: {
        model: graphPaper,
      },
    },
    {
      title: 'Log-Log Paper',
      example: {
        model: logLogPaper,
      },
    },
    {
      title: 'Black background',
      example: {
        model: onBlack,
      },
    },
    {
      title: 'Background and PlotAreaBackground',
      example: {
        model: backgrounds,
      },
    },
    {
      title: 'Current culture',
      example: {
        model: currentCulture,
      },
    },
    {
      title: 'Long axis titles (clipped at 90%)',
      example: {
        model: longAxisTitlesClipped90,
      },
    },
    {
      title: 'Long axis titles (clipped at 100%)',
      example: {
        model: longAxisTitlesClipped100,
      },
    },
    {
      title: 'Long axis titles (not clipped)',
      example: {
        model: longAxisTitlesNotClipped,
      },
    },
    {
      title: 'PositionTier',
      example: {
        model: positionTier,
      },
    },
    {
      title: 'Custom axis title color',
      example: {
        model: titleColor,
      },
    },
    {
      title: 'Custom axis label color',
      example: {
        model: labelColor,
      },
    },
    {
      title: 'Angled axis numbers',
      example: {
        model: angledAxisNumbers,
      },
    },
    {
      title: 'Axis distance',
      example: {
        model: axisDistance,
      },
    },
    {
      title: 'No axes defined',
      example: {
        model: noAxesDefined,
      },
    },
    {
      title: 'LabelFormatter',
      example: {
        model: labelFormatter,
      },
    },
    {
      title: 'Tool tips',
      example: {
        model: toolTips,
      },
    },
    {
      title: 'Sub- and superscript in axis titles',
      example: {
        model: subSuperscriptInAxisTitles,
      },
    },
    {
      title: 'MinimumMajorStep',
      example: {
        model: minimumMajorStep,
      },
    },
    {
      title: 'MinimumMinorStep',
      example: {
        model: minimumMinorStep,
      },
    },
    {
      title: 'Default AxisTitleDistance',
      example: {
        model: defaultAxisTitleDistance,
      },
    },
    {
      title: 'Custom AxisTitleDistance',
      example: {
        model: customAxisTitleDistance,
      },
    },
    {
      title: 'MajorGridlineStyle',
      example: {
        model: majorGridlineStyle,
      },
    },
    {
      title: 'Gridlines Cropping: Horizontal and vertical',
      example: {
        model: gridlineCroppingBoth,
      },
    },
    {
      title: 'Multi vertical axes with lineSeries',
      example: {
        model: multiVerticalAxes,
      },
    },
    {
      title: 'Auto Margins',
      example: {
        model: autoMargin,
      },
    },
    {
      title: 'Manual Margins',
      example: {
        model: manualMargins,
      },
    },
    {
      title: 'Manual Left Margin',
      example: {
        model: manualLeftMargin,
      },
    },
    {
      title: 'Auto Margins - Wide Labels',
      example: {
        model: autoMarginWideLabels,
      },
    },
    {
      title: 'Auto Margins - Wide Labels, rotated',
      example: {
        model: autoMarginWideLabelsRotated,
      },
    },
    {
      title: 'Auto Margins - Wide Labels, fixed Range',
      example: {
        model: autoMarginWideLabelsFixedRange,
      },
    },
    {
      title: 'Auto Margins - Wide Labels, fixed Range 2',
      example: {
        model: autoMarginWideLabelsFixedRange2,
      },
    },
    {
      title: 'Data Margins',
      example: {
        model: minimumAndMaximumDataMargins,
      },
    },
    {
      title: 'Data Margins with Zero-Crossing',
      example: {
        model: minimumAndMaximumDataMarginsZeroCrossing,
      },
    },
    {
      title: 'Data Margins on Log Axis',
      example: {
        model: minimumAndMaximumDataMarginsLog,
      },
    },
    {
      title: 'Data Margins on Polar Plot',
      example: {
        model: minimumAndMaximumMarginsPolar,
      },
    },
    {
      title: 'Axis Margins',
      example: {
        model: axisOutMargins,
      },
    },
    {
      title: 'Axis Margins Clipping',
      example: {
        model: axisMarginsClipping,
      },
    },
    {
      title: 'Axis Margins on Polar Plot',
      example: {
        model: polarOuterMargins,
      },
    },
    {
      title: 'Axis Margins, Data Margins, and Padding',
      example: {
        model: marginsAndPadding,
      },
    },
    {
      title: 'Axis Margins, Data Margins, and Padding, Asymmetrical',
      example: {
        model: marginsAndPaddingAsymmetrical,
      },
    },
    {
      title: 'Minimum Major Interval Count',
      example: {
        model: minimumMajorIntervalCount,
      },
    },
    {
      title: 'Maximum Major Interval Count',
      example: {
        model: maximumMajorIntervalCount,
      },
    },
    {
      title: 'Minimum and Maximum Major Interval Count',
      example: {
        model: minimumAndMaximumMajorIntervalCount,
      },
    },
  ],
} as ExampleCategory
