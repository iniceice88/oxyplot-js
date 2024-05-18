import {
  AxisPosition,
  DataPoint_Undefined,
  FunctionSeries,
  LinearAxis,
  LineSeries,
  LineStyle,
  newDataPoint,
  newOxyThickness,
  OxyColorHelper,
  OxyColors,
  PlotModel,
  PlotType,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function functionSeries(): PlotModel {
  const pm = new PlotModel({ title: 'Trigonometric functions', plotType: PlotType.Cartesian })
  pm.series.push(FunctionSeries.fromDx(Math.sin, -10, 10, 0.1, 'sin(x)'))
  pm.series.push(FunctionSeries.fromDx(Math.cos, -10, 10, 0.1, 'cos(x)'))
  pm.series.push(
    FunctionSeries.fromFxFyN(
      (t) => 5 * Math.cos(t),
      (t) => 5 * Math.sin(t),
      0,
      2 * Math.PI,
      1000,
      'cos(t),sin(t)',
    ),
  )
  return pm
}

function clover(): PlotModel {
  const plot = new PlotModel({ title: 'Parametric function', plotType: PlotType.Cartesian })
  plot.series.push(
    FunctionSeries.fromFxFyN(
      (t) => 2 * Math.cos(2 * t) * Math.cos(t),
      (t) => 2 * Math.cos(2 * t) * Math.sin(t),
      0,
      Math.PI * 2,
      1000,
      '2cos(2t)cos(t) , 2cos(2t)sin(t)',
    ),
  )
  return plot
}

function absoluteYmin(): PlotModel {
  const plot = new PlotModel({ title: 'Y: AbsoluteMinimum = 0', plotType: PlotType.Cartesian })
  const c = OxyColors.DarkBlue
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'X-axis',
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Y-axis',
      absoluteMinimum: 0,
      minimum: 0,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.series.push(createTestSeries())
  return plot
}

function absoluteYmin2(): PlotModel {
  const plot = new PlotModel({
    title: 'Y: AbsoluteMinimum = 0',
    subtitle: 'AutoAdjustPlotMargins = false',
    plotType: PlotType.Cartesian,
    plotMargins: newOxyThickness(60, 4, 4, 40),
  })
  const c = OxyColors.DarkBlue
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'X-axis',
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Y-axis',
      absoluteMinimum: 0,
      minimum: 0,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.series.push(createTestSeries())
  return plot
}

function absoluteYminXmin(): PlotModel {
  const plot = new PlotModel({
    title: 'X: AbsoluteMinimum = -10, Y: AbsoluteMinimum = 0',
    plotType: PlotType.Cartesian,
  })

  const c = OxyColors.DarkBlue
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'X-axis',
      absoluteMinimum: -10,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Y-axis',
      absoluteMinimum: 0,
      minimum: 0,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.series.push(createTestSeries())
  return plot
}

function absoluteYminYmax(): PlotModel {
  const plot = new PlotModel({ title: 'Y: AbsoluteMinimum = 0, AbsoluteMaximum = 2', plotType: PlotType.Cartesian })
  const c = OxyColors.DarkBlue
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'X-axis',
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Y-axis',
      absoluteMinimum: 0,
      minimum: 0,
      absoluteMaximum: 2,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.series.push(createTestSeries())
  return plot
}

function absoluteYminXminXmax(): PlotModel {
  const plot = new PlotModel({
    title: 'Y: AbsoluteMinimum = 0, X: AbsoluteMinimum = -10, AbsoluteMaximum = 10',
    plotType: PlotType.Cartesian,
  })

  const c = OxyColors.DarkBlue
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'X-axis',
      absoluteMinimum: -10,
      absoluteMaximum: 10,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Y-axis',
      absoluteMinimum: 0,
      minimum: 0,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.series.push(createTestSeries())

  return plot
}

function absoluteYminYmaxXminXmax(): PlotModel {
  const plot = new PlotModel({
    title: 'Y: AbsoluteMinimum = 0, AbsoluteMaximum = 2, X: AbsoluteMinimum = -10, AbsoluteMaximum = 10',
    plotType: PlotType.Cartesian,
  })

  const c = OxyColors.DarkBlue
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'X-axis',
      absoluteMinimum: -10,
      absoluteMaximum: 10,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Y-axis',
      absoluteMinimum: 0,
      minimum: 0,
      absoluteMaximum: 2,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      majorGridlineColor: OxyColorHelper.fromAColor(40, c),
      minorGridlineColor: OxyColorHelper.fromAColor(20, c),
    }),
  )
  plot.series.push(createTestSeries())

  return plot
}

// ============
function createTestSeries(): LineSeries {
  const absSerie = new LineSeries()

  absSerie.points.push(
    newDataPoint(-8.0, 0.0),
    newDataPoint(-7.5, 0.1),
    newDataPoint(-7.0, 0.2),
    newDataPoint(-6.0, 0.4),
    newDataPoint(-5.0, 0.5),
    newDataPoint(-4.0, 0.6),
    newDataPoint(-3.0, 0.7),
    newDataPoint(-2.0, 0.8),
    newDataPoint(-1.0, 0.9),
    newDataPoint(0.0, 1.0),
    newDataPoint(1.0, 0.9),
    newDataPoint(2.0, 0.8),
    newDataPoint(3.0, 0.7),
    newDataPoint(4.0, 0.6),
    newDataPoint(5.0, 0.5),
    newDataPoint(6.0, 0.4),
    newDataPoint(7.0, 0.2),
    newDataPoint(7.5, 0.1),
    newDataPoint(8.0, 0.0),
    DataPoint_Undefined,
    newDataPoint(-0.5, 0.5),
    newDataPoint(-0.5, 1.5),
    newDataPoint(0.5, 1.5),
    newDataPoint(0.5, 0.5),
    newDataPoint(-0.5, 0.5),
  )

  return absSerie
}

const category = 'Cartesian axes'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'Trigonometric functions',
      example: {
        model: functionSeries,
      },
    },
    {
      title: 'Clover',
      example: {
        model: clover,
      },
    },
    {
      title: 'AbsoluteMinimum Y',
      example: {
        model: absoluteYmin,
      },
    },
    {
      title: 'AbsoluteMinimum Y, manual plotmargins',
      example: {
        model: absoluteYmin2,
      },
    },
    {
      title: 'AbsoluteMinimum X/Y',
      example: {
        model: absoluteYminXmin,
      },
    },
    {
      title: 'AbsoluteMinimum/Maximum Y',
      example: {
        model: absoluteYminYmax,
      },
    },
    {
      title: 'AbsoluteMinimum Y, AbsoluteMinimum/Maximum X',
      example: {
        model: absoluteYminXminXmax,
      },
    },
    {
      title: 'AbsoluteMinimum/Maximum X/Y',
      example: {
        model: absoluteYminYmaxXminXmax,
      },
    },
  ],
} as ExampleCategory
