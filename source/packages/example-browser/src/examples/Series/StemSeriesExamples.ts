import { DataPoint, DataPointSeries, Legend, MarkerType, OxyColors, PlotModel, StemSeries } from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/** StemSeries */
function stemSeries(): PlotModel {
  return createExampleModel(
    new StemSeries({
      color: OxyColors.SkyBlue,
      markerType: MarkerType.Circle,
      markerSize: 6,
      markerStroke: OxyColors.White,
      markerStrokeThickness: 1.5,
    }),
  )
}

/**
 * Creates an example model and fills the specified series with points.
 * @param series The series.
 * @returns A plot model.
 */
function createExampleModel(series: DataPointSeries): PlotModel {
  const model = new PlotModel({ title: 'StemSeries' })
  const l = new Legend({
    legendSymbolLength: 24,
  })

  model.legends.push(l)
  series.title = 'sin(x)'
  for (let x = 0; x < Math.PI * 2; x += 0.1) {
    series.points.push(new DataPoint(x, Math.sin(x)))
  }

  model.series.push(series)
  return model
}

const category = 'StemSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'StemSeries',
      example: {
        model: stemSeries,
      },
    },
  ],
} as ExampleCategory
