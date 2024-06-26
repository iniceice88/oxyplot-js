import {
  AxisPosition,
  InterpolationAlgorithms,
  Legend,
  LinearAxis,
  MarkerType,
  newDataPoint,
  OxyColors,
  PlotModel,
  PlotModelUtilities,
  round,
  ThreeColorLineSeries,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/**
 * Creates an example showing temperatures.
 * @returns A PlotModel.
 */
function threeColorLineSeries(): PlotModel {
  const model = new PlotModel({ title: 'ThreeColorLineSeries' })
  const l = new Legend({
    legendSymbolLength: 24,
  })

  model.legends.push(l)

  const s1 = new ThreeColorLineSeries({
    title: 'Temperature at Eidesmoen, December 1986.',
    // trackerFormatString: 'December {2:0}: {4:0.0} °C',
    trackerStringFormatter: function (args) {
      return `December ${round(args.xValue, 0)}: ${args.yValue.toFixed(1)} °C`
    },
    markerSize: 4,
    markerStroke: OxyColors.Black,
    markerStrokeThickness: 1.5,
    markerType: MarkerType.Circle,
    interpolationAlgorithm: InterpolationAlgorithms.CanonicalSpline,
    strokeThickness: 3,
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
 * Creates an example showing temperatures with Y Axis reversed.
 * @returns A PlotModel.
 */
function twoColorLineSeriesReversed(): PlotModel {
  const model = threeColorLineSeries()
  PlotModelUtilities.reverseYAxis(model)
  return model
}

const category = 'ThreeColorLineSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Temperatures',
      example: {
        model: threeColorLineSeries,
      },
    },
    {
      title: 'Temperatures (Y Axis reversed)',
      example: {
        model: twoColorLineSeriesReversed,
      },
    },
  ],
} as ExampleCategory
