import {
  DataPoint,
  DataPoint_Undefined,
  DataPointSeries,
  Legend,
  LegendOrientation,
  LegendPlacement,
  LegendPosition,
  LineStyle,
  MarkerType,
  newDataPoint,
  OxyColors,
  PlotModel,
  round,
  StairStepSeries,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/** StairStepSeries */
function stairStepSeries(): PlotModel {
  return createExampleModel(new StairStepSeries())
}

/** StairStepSeries with labels */
function stairStepSeriesWithLabels(): PlotModel {
  return createExampleModel(
    new StairStepSeries({
      labelStringFormatter: (series, point) => `${round(point[1], 2)}`,
    }),
  )
}

/** StairStepSeries with markers */
function stairStepSeriesWithMarkers(): PlotModel {
  return createExampleModel(
    new StairStepSeries({
      color: OxyColors.SkyBlue,
      markerType: MarkerType.Circle,
      markerSize: 6,
      markerStroke: OxyColors.White,
      markerFill: OxyColors.SkyBlue,
      markerStrokeThickness: 1.5,
    }),
  )
}

/** StairStepSeries with thin vertical lines */
function stairStepSeriesThinVertical(): PlotModel {
  return createExampleModel(
    new StairStepSeries({
      strokeThickness: 3,
      verticalStrokeThickness: 0.4,
      markerType: MarkerType.None,
    }),
  )
}

/** StairStepSeries with dashed vertical lines */
function stairStepSeriesDashedVertical(): PlotModel {
  return createExampleModel(
    new StairStepSeries({
      verticalLineStyle: LineStyle.Dash,
      markerType: MarkerType.None,
    }),
  )
}

/** StairStepSeries with invalid points */
function stairStepSeriesWithInvalidPoints(): PlotModel {
  const model = new PlotModel({
    title: 'StairStepSeries with invalid points',
    subtitle: 'Horizontal lines do not continue',
  })

  populateInvalidPointExampleModel(model, (x) => DataPoint_Undefined)

  return model
}

/** StairStepSeries with invalid Y */
function stairStepSeriesWithInvalidY(): PlotModel {
  const model = new PlotModel({
    title: 'StairStepSeries with invalid Y',
    subtitle: 'Horizontal lines continue until X of point with invalid Y',
  })

  populateInvalidPointExampleModel(model, (x) => newDataPoint(x, NaN))

  return model
}

/** StairStepSeries with non-monotonic X */
function stairStepSeriesWithNonmonotonicX(): PlotModel {
  const model = new PlotModel({
    title: 'StairStepSeries with non-monotonic X',
    subtitle: 'Lines form a boxed I-beam',
  })

  const iBeamSeries = new StairStepSeries({
    markerType: MarkerType.Circle,
    verticalLineStyle: LineStyle.Dash,
    verticalStrokeThickness: 4,
    points: [newDataPoint(1, 1), newDataPoint(3, 1), newDataPoint(2, 3), newDataPoint(1, 3), newDataPoint(3, 3)],
  })
  model.series.push(iBeamSeries)

  const boxBRSeries = new StairStepSeries({
    markerType: MarkerType.Circle,
    verticalLineStyle: LineStyle.Dash,
    verticalStrokeThickness: 4,
    points: [newDataPoint(1, 0), newDataPoint(2, 0), newDataPoint(0, 0), newDataPoint(4, 0), newDataPoint(4, 4)],
  })
  model.series.push(boxBRSeries)

  const boxTLSeries = new StairStepSeries({
    markerType: MarkerType.Circle,
    verticalLineStyle: LineStyle.Dash,
    verticalStrokeThickness: 4,
    points: [newDataPoint(3, 4), newDataPoint(2, 4), newDataPoint(4, 4), newDataPoint(0, 4), newDataPoint(0, 0)],
  })
  model.series.push(boxTLSeries)

  return model
}

/**
 * Creates an example model and fills the specified series with points.
 * @param series The series.
 * @returns A plot model.
 */
function createExampleModel(series: DataPointSeries): PlotModel {
  const model = new PlotModel({ title: 'StairStepSeries' })
  const l = new Legend({
    legendSymbolLength: 24,
  })

  model.legends.push(l)

  series.title = 'sin(x)'
  for (let x = 0; x < Math.PI * 2; x += 0.5) {
    series.points.push(newDataPoint(x, Math.sin(x)))
  }

  model.series.push(series)
  return model
}

function populateInvalidPointExampleModel(model: PlotModel, getInvalidPoint: (x: number) => DataPoint): void {
  model.legends.push(
    new Legend({
      legendOrientation: LegendOrientation.Horizontal,
      legendPlacement: LegendPlacement.Outside,
      legendPosition: LegendPosition.BottomCenter,
    }),
  )

  const series1 = new StairStepSeries({
    title: 'Invalid First Point',
    markerType: MarkerType.Circle,
    points: [getInvalidPoint(0), newDataPoint(1, 3.5), newDataPoint(2, 4.0), newDataPoint(3, 4.5)],
  })
  model.series.push(series1)

  const series2 = new StairStepSeries({
    title: 'Invalid Second Point',
    markerType: MarkerType.Circle,
    points: [newDataPoint(0, 2.0), getInvalidPoint(1), newDataPoint(2, 3.0), newDataPoint(3, 3.5)],
  })
  model.series.push(series2)

  const series3 = new StairStepSeries({
    title: 'Invalid Penultimate Point',
    markerType: MarkerType.Circle,
    points: [newDataPoint(0, 1.0), newDataPoint(1, 1.5), getInvalidPoint(2), newDataPoint(3, 2.5)],
  })
  model.series.push(series3)

  const series4 = new StairStepSeries({
    title: 'Invalid Last Point',
    markerType: MarkerType.Circle,
    points: [newDataPoint(0, 0.0), newDataPoint(1, 0.5), newDataPoint(2, 1.0), getInvalidPoint(3)],
  })
  model.series.push(series4)
}

const category = 'StairStepSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'StairStepSeries',
      example: {
        model: stairStepSeries,
      },
    },
    {
      title: 'StairStepSeries with labels',
      example: {
        model: stairStepSeriesWithLabels,
      },
    },
    {
      title: 'StairStepSeries with markers',
      example: {
        model: stairStepSeriesWithMarkers,
      },
    },
    {
      title: 'StairStepSeries with thin vertical lines',
      example: {
        model: stairStepSeriesThinVertical,
      },
    },
    {
      title: 'StairStepSeries with dashed vertical lines',
      example: {
        model: stairStepSeriesDashedVertical,
      },
    },
    {
      title: 'StairStepSeries with invalid points',
      example: {
        model: stairStepSeriesWithInvalidPoints,
      },
    },
    {
      title: 'StairStepSeries with invalid Y',
      example: {
        model: stairStepSeriesWithInvalidY,
      },
    },
    {
      title: 'StairStepSeries with non-monotonic X',
      example: {
        model: stairStepSeriesWithNonmonotonicX,
      },
    },
  ],
} as ExampleCategory
