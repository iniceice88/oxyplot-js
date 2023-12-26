import {
  AxisPosition,
  DataPoint,
  FunctionSeries,
  Legend,
  LegendOrientation,
  LegendPlacement,
  LegendPosition,
  LinearAxis,
  LineSeries,
  LineStyle,
  LogarithmicAxis,
  MarkerType,
  OxyColor,
  OxyColors,
  OxyThickness,
  PlotModel,
  TickStyle,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function defaultValues(): PlotModel {
  const m = new PlotModel()
  m.axes.push(new LogarithmicAxis({ position: AxisPosition.Bottom }))
  m.axes.push(new LogarithmicAxis({ position: AxisPosition.Left }))
  return m
}

function amdahlsLaw(): PlotModel {
  const model = new PlotModel({ title: "Amdahl's law" })
  const l = new Legend({ legendTitle: 'Parallel portion' })
  model.legends.push(l)

  // http://en.wikipedia.org/wiki/Amdahl's_law
  const maxSpeedup = (p: number, n: number) => 1.0 / (1.0 - p + p / n)
  const createSpeedupCurve = (p: number) => {
    // todo: tracker does not work when smoothing = true (too few points interpolated on the left end of the curve)
    const ls = new LineSeries({ title: p.toFixed(0) })
    for (let n = 1; n <= 65536; n *= 2) ls.points.push(new DataPoint(n, maxSpeedup(p, n)))
    return ls
  }
  model.axes.push(
    new LogarithmicAxis({
      position: AxisPosition.Bottom,
      title: 'Number of processors',
      base: 2,
      majorGridlineStyle: LineStyle.Solid,
      tickStyle: TickStyle.None,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 0,
      maximum: 20,
      minorStep: 2,
      majorStep: 2,
      title: 'Speedup',
      stringFormatter: (n) => n.toFixed(2).toString(),
      majorGridlineStyle: LineStyle.Solid,
      tickStyle: TickStyle.None,
    }),
  )
  model.series.push(createSpeedupCurve(0.5))
  model.series.push(createSpeedupCurve(0.75))
  model.series.push(createSpeedupCurve(0.9))
  model.series.push(createSpeedupCurve(0.95))

  return model
}

function richterMagnitudes(): PlotModel {
  const richterMagnitudes = new PlotModel({
    title: 'The Richter magnitude scale',
    plotMargins: new OxyThickness(80, 0, 80, 40),
  })

  const l = new Legend({
    legendPlacement: LegendPlacement.Inside,
    legendPosition: LegendPosition.TopCenter,
    legendOrientation: LegendOrientation.Horizontal,
    legendSymbolLength: 24,
  })

  richterMagnitudes.legends.push(l)

  richterMagnitudes.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      title: 'Richter magnitude scale',
      majorGridlineStyle: LineStyle.None,
      tickStyle: TickStyle.None,
    }),
  )

  const frequencyCurve = new LineSeries({
    title: 'Frequency',
    color: OxyColor.fromUInt32(0xff3c6c9e),
    strokeThickness: 3,
    markerStroke: OxyColor.fromUInt32(0xff3c6c9e),
    markerFill: OxyColors.White,
    markerType: MarkerType.Circle,
    markerSize: 4,
    markerStrokeThickness: 3,
  })

  frequencyCurve.points.push(new DataPoint(1.5, 8000 * 365 * 100))
  frequencyCurve.points.push(new DataPoint(2.5, 1000 * 365 * 100))
  frequencyCurve.points.push(new DataPoint(3.5, 49000 * 100))
  frequencyCurve.points.push(new DataPoint(4.5, 6200 * 100))
  frequencyCurve.points.push(new DataPoint(5.5, 800 * 100))
  frequencyCurve.points.push(new DataPoint(6.5, 120 * 100))
  frequencyCurve.points.push(new DataPoint(7.5, 18 * 100))
  frequencyCurve.points.push(new DataPoint(8.5, 1 * 100))
  frequencyCurve.points.push(new DataPoint(9.5, (1.0 / 20) * 100))

  richterMagnitudes.axes.push(
    new LogarithmicAxis({
      position: AxisPosition.Left,
      title: 'Frequency / 100 yr',
      useSuperExponentialFormat: true,
      majorGridlineStyle: LineStyle.None,
      tickStyle: TickStyle.Outside,
    }),
  )

  richterMagnitudes.series.push(frequencyCurve)

  const energyCurve = new LineSeries({
    title: 'Energy',
    color: OxyColor.fromUInt32(0xff9e6c3c),
    strokeThickness: 3,
    markerStroke: OxyColor.fromUInt32(0xff9e6c3c),
    markerFill: OxyColors.White,
    markerType: MarkerType.Circle,
    markerSize: 4,
    markerStrokeThickness: 3,
  })

  energyCurve.points.push(new DataPoint(1.5, 11e6))
  energyCurve.points.push(new DataPoint(2.5, 360e6))
  energyCurve.points.push(new DataPoint(3.5, 11e9))
  energyCurve.points.push(new DataPoint(4.5, 360e9))
  energyCurve.points.push(new DataPoint(5.5, 11e12))
  energyCurve.points.push(new DataPoint(6.5, 360e12))
  energyCurve.points.push(new DataPoint(7.5, 11e15))
  energyCurve.points.push(new DataPoint(8.5, 360e15))
  energyCurve.points.push(new DataPoint(9.5, 11e18))

  energyCurve.yAxisKey = 'energyAxis'

  richterMagnitudes.axes.push(
    new LogarithmicAxis({
      position: AxisPosition.Right,
      title: 'Energy / J',
      key: 'energyAxis',
      useSuperExponentialFormat: true,
      majorGridlineStyle: LineStyle.None,
      tickStyle: TickStyle.Outside,
    }),
  )

  richterMagnitudes.series.push(energyCurve)

  return richterMagnitudes
}

const absoluteMaximum = (): PlotModel => {
  const model: PlotModel = new PlotModel({ title: 'AbsoluteMaximum = 1000' })
  model.axes.push(
    new LogarithmicAxis({
      position: AxisPosition.Left,
      minimum: 0.1,
      maximum: 1000,
      absoluteMaximum: 1000,
    }),
  )
  model.series.push(
    new FunctionSeries({
      f: Math.exp,
      x0: 0,
      x1: Math.log(900),
      n: 100,
    }),
  )
  return model
}

const axisChangedEventHAndler = (): PlotModel => {
  const model: PlotModel = new PlotModel({ title: 'AxisChanged event handler' })
  let n = 0
  const logAxis = new LogarithmicAxis({ position: AxisPosition.Left, minimum: 0.1, maximum: 1000 })
  logAxis.axisChanged = (s, e) => {
    model.subtitle = 'Changed ' + n++ + ' times. ActualMaximum=' + logAxis.actualMaximum
  }
  model.axes.push(logAxis)
  model.series.push(
    new FunctionSeries({
      f: Math.exp,
      x0: 0,
      x1: Math.log(900),
      n: 100,
    }),
  )
  return model
}

const negativeValues = (): PlotModel => {
  const model: PlotModel = new PlotModel({
    title: 'LogarithmicAxis',
    subtitle: 'LineSeries with negative values',
  })
  model.axes.push(new LogarithmicAxis({ position: AxisPosition.Left }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  // Math.sin, 0, 40, 1000
  model.series.push(
    new FunctionSeries({
      f: (x) => Math.sin(x),
      x0: 0,
      x1: 40,
      n: 1000,
    }),
  )
  return model
}

function tickCalculation(): PlotModel {
  const tickCalculation = new PlotModel({
    title: 'Tick calculation for different bases',
  })

  // Logarithmic axis for base 10
  tickCalculation.axes.push(
    new LogarithmicAxis({
      title: 'Base 10',
      position: AxisPosition.Left,
      minimum: 20,
      maximum: 20000,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )

  // Logarithmic axis for base 7
  tickCalculation.axes.push(
    new LogarithmicAxis({
      title: 'Base 7',
      position: AxisPosition.Bottom,
      base: 7,
      minimum: 2,
      maximum: 10000,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )

  // Logarithmic axis for base 5.5
  tickCalculation.axes.push(
    new LogarithmicAxis({
      title: 'Base 5.5',
      position: AxisPosition.Top,
      base: 5.5,
      minimum: 1,
      maximum: 100,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )

  // Logarithmic axis for base 2
  tickCalculation.axes.push(
    new LogarithmicAxis({
      title: 'Base 2',
      position: AxisPosition.Right,
      base: 2,
      minimum: 1,
      maximum: 1000000,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )

  return tickCalculation
}

const category = 'LogarithmicAxis'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'LogarithmicAxis with default values',
      example: {
        model: defaultValues,
      },
    },
    {
      title: "Amdahl's Law",
      example: {
        model: amdahlsLaw,
      },
    },
    {
      title: 'Richter magnitudes',
      example: {
        model: richterMagnitudes,
      },
    },
    {
      title: 'LogarithmicAxis with AbsoluteMaximum',
      example: {
        model: absoluteMaximum,
      },
    },
    {
      title: 'LogarithmicAxis with AxisChanged event handler',
      example: {
        model: axisChangedEventHAndler,
      },
    },
    {
      title: 'Negative values',
      example: {
        model: negativeValues,
      },
    },
    {
      title: 'Tick calculation',
      example: {
        model: tickCalculation,
      },
    },
  ],
} as ExampleCategory
