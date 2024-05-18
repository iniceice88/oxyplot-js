import {
  AxisPosition,
  InterpolationAlgorithms,
  Legend,
  LinearAxis,
  MarkerType,
  newDataPoint,
  OxyColors,
  PlotModel,
  round,
  TwoColorAreaSeries,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function twoColorAreaSeries(): PlotModel {
  const model = new PlotModel({ title: 'TwoColorAreaSeries' })
  const l = new Legend({
    legendSymbolLength: 24,
  })

  model.legends.push(l)

  const s1 = new TwoColorAreaSeries({
    title: 'Temperature at Eidesmoen, December 1986.',
    //trackerFormatString: 'December {2:0}: {4:0.0} °C',
    trackerStringFormatter: function (args) {
      return `December ${round(args.xValue, 0)}: ${args.yValue.toFixed(1)} °C`
    },
    color: OxyColors.Tomato,
    color2: OxyColors.LightBlue,
    markerFill: OxyColors.Tomato,
    markerFill2: OxyColors.LightBlue,
    strokeThickness: 2,
    limit: -1,
    markerType: MarkerType.Circle,
    markerSize: 3,
  })

  const temperatures = [
    5, 0, 7, 7, 4, 3, 5, 5, 11, 4, 2, 3, 2, 1, 0, 2, -1, 0, 0, -3, -6, -13, -10, -10, 0, -4, -5, -4, 3, 0, -5,
  ]

  for (let i = 0; i < temperatures.length; i++) {
    s1.points.push(newDataPoint(i + 1, temperatures[i]))
  }

  model.series.push(s1)
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Temperature',
      unit: '°C',
      extraGridlines: [0.0],
    }),
  )
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'Date' }))

  return model
}

function twoColorAreaSeries2(): PlotModel {
  const model = new PlotModel({ title: 'TwoColorAreaSeries' })
  const l = new Legend({
    legendSymbolLength: 24,
  })

  model.legends.push(l)

  const s1 = new TwoColorAreaSeries({
    title: 'Temperature at Eidesmoen, December 1986.',
    //trackerFormatString: 'December {2:0}: {4:0.0} °C',
    trackerStringFormatter: function (args) {
      return `December ${round(args.xValue, 0)}: ${args.yValue.toFixed(1)} °C`
    },
    color: OxyColors.Black,
    color2: OxyColors.Brown,
    markerFill: OxyColors.Red,
    fill: OxyColors.Tomato,
    fill2: OxyColors.LightBlue,
    markerFill2: OxyColors.Blue,
    markerStroke: OxyColors.Brown,
    markerStroke2: OxyColors.Black,
    strokeThickness: 2,
    limit: 0,
    markerType: MarkerType.Circle,
    markerSize: 3,
  })

  const temperatures = [
    5, 0, 7, 7, 4, 3, 5, 5, 11, 4, 2, 3, 2, 1, 0, 2, -1, 0, 0, -3, -6, -13, -10, -10, 0, -4, -5, -4, 3, 0, -5,
  ]

  for (let i = 0; i < temperatures.length; i++) {
    s1.points.push(newDataPoint(i + 1, temperatures[i]))
  }

  model.series.push(s1)
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Temperature',
      unit: '°C',
      extraGridlines: [0.0],
    }),
  )
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'Date' }))

  return model
}

/**
 * Creates an example showing temperatures by a red/blue area chart.
 * @returns A PlotModel.
 */
function twoColorAreaSeries3(): PlotModel {
  const model = new PlotModel({ title: 'TwoColorAreaSeries' })
  const l = new Legend({
    legendSymbolLength: 24,
  })

  model.legends.push(l)

  const s1 = new TwoColorAreaSeries({
    title: 'Temperature at Eidesmoen, December 1986.',
    //trackerFormatString: 'December {2:0}: {4:0.0} °C',
    trackerStringFormatter: function (args) {
      return `December ${round(args.xValue, 0)}: ${args.yValue.toFixed(1)} °C`
    },
    color: OxyColors.Black,
    color2: OxyColors.Brown,
    markerFill: OxyColors.Red,
    fill: OxyColors.Tomato,
    fill2: OxyColors.LightBlue,
    markerFill2: OxyColors.Blue,
    markerStroke: OxyColors.Brown,
    markerStroke2: OxyColors.Black,
    strokeThickness: 1,
    limit: 0,
    interpolationAlgorithm: InterpolationAlgorithms.CanonicalSpline,
    markerType: MarkerType.Circle,
    markerSize: 1,
  })

  const temperatures = [
    5, 0, 7, 7, 4, 3, 5, 5, 11, 4, 2, 3, 2, 1, 0, 2, -1, 0, 0, -3, -6, -13, -10, -10, 0, -4, -5, -4, 3, 0, -5,
  ]

  for (let i = 0; i < temperatures.length; i++) {
    s1.points.push(newDataPoint(i + 1, temperatures[i]))
  }

  model.series.push(s1)
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Temperature',
      unit: '°C',
      extraGridlines: [0.0],
    }),
  )
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'Date' }))

  return model
}

/**
 * Creates an example showing temperatures by a red/blue area chart.
 * @returns A PlotModel.
 */
function twoColorAreaSeriesTwoPolygons(): PlotModel {
  const model = new PlotModel({ title: 'Two polygons' })
  const l = new Legend({
    legendSymbolLength: 24,
  })

  model.legends.push(l)

  const s1 = new TwoColorAreaSeries({
    color: OxyColors.Tomato,
    color2: OxyColors.LightBlue,
    markerFill: OxyColors.Tomato,
    markerFill2: OxyColors.LightBlue,
    strokeThickness: 2,
    markerType: MarkerType.Circle,
    markerSize: 3,
  })

  s1.points.push(
    ...[newDataPoint(0, 3), newDataPoint(1, 5), newDataPoint(2, 1), newDataPoint(3, 0), newDataPoint(4, 3)],
  )
  s1.points2.push(
    ...[newDataPoint(0, -3), newDataPoint(1, -1), newDataPoint(2, 0), newDataPoint(3, -6), newDataPoint(4, -4)],
  )

  model.series.push(s1)
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))

  return model
}

const category = 'TwoColorAreaSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Temperatures',
      example: {
        model: twoColorAreaSeries,
      },
    },
    {
      title: 'Temperatures ver2',
      example: {
        model: twoColorAreaSeries2,
      },
    },
    {
      title: 'Temperatures ver3',
      example: {
        model: twoColorAreaSeries3,
      },
    },
    {
      title: 'Two polygons',
      example: {
        model: twoColorAreaSeriesTwoPolygons,
      },
    },
  ],
} as ExampleCategory
