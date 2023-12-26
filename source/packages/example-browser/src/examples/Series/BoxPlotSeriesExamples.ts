import {
  AxisPosition,
  BoxPlotSeries,
  CategoryAxis,
  DateTimeAxis,
  DateTimeIntervalType,
  getDateService,
  Legend,
  LegendPlacement,
  LineAnnotation,
  LineAnnotationType,
  LinearAxis,
  LineStyle,
  MarkerType,
  maxValueOfArray,
  minValueOfArray,
  OxyColors,
  PlotModel,
  ScreenPoint,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { Random } from '../Random'

/**
 * BoxPlot example
 */
function boxPlot(): PlotModel {
  const boxes = 10

  const model = new PlotModel({ title: `BoxPlot (n=${boxes})` })
  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
  })

  model.legends.push(l)

  const s1 = new BoxPlotSeries({
    title: 'BoxPlotSeries',
    boxWidth: 0.3,
  })

  const random = new Random(31)
  for (let i = 0; i < boxes; i++) {
    const x = i
    const points = 5 + random.next(15)
    const values: number[] = []
    for (let j = 0; j < points; j++) {
      values.push(random.next(0, 20))
    }

    values.sort()
    const median = getMedian(values)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const r = values.length % 2
    const firstQuartil = getMedian(values.slice(0, (values.length + r) / 2))
    const thirdQuartil = getMedian(values.slice((values.length - r) / 2))

    const iqr = thirdQuartil - firstQuartil
    const step = iqr * 1.5
    let upperWhisker = thirdQuartil + step
    upperWhisker = maxValueOfArray(values.filter((v) => v <= upperWhisker))
    let lowerWhisker = firstQuartil - step
    lowerWhisker = minValueOfArray(values.filter((v) => v >= lowerWhisker))

    const outliers = [upperWhisker + random.next(1, 10), lowerWhisker - random.next(1, 10)]

    s1.items.push({
      x,
      lowerWhisker,
      boxBottom: firstQuartil,
      median,
      boxTop: thirdQuartil,
      upperWhisker,
      mean,
      outliers,
    })
  }

  model.series.push(s1)
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimumPadding: 0.1, maximumPadding: 0.1 }))
  return model
}

/**
 * Gets the median.
 * @param values The values.
 * @returns The median value.
 */
function getMedian(values: number[]): number {
  const sortedInterval = [...values].sort((a, b) => a - b)
  const count = sortedInterval.length
  if (count % 2 === 1) {
    return sortedInterval[(count - 1) / 2]
  }

  return 0.5 * sortedInterval[count / 2] + 0.5 * sortedInterval[count / 2 - 1]
}

/**
 * BoxPlot (minimal data/ink ratio) example
 */
function boxPlot2(): PlotModel {
  const model = boxPlot()
  const boxPlotSeries = model.series[0] as BoxPlotSeries
  boxPlotSeries.showMedianAsDot = true
  boxPlotSeries.outlierType = MarkerType.Cross
  boxPlotSeries.fill = OxyColors.Black
  boxPlotSeries.showBox = false
  boxPlotSeries.whiskerWidth = 0
  return model
}

/**
 * BoxPlot (dashed line) example
 */
function boxPlot3(): PlotModel {
  const model = boxPlot()
  const boxPlotSeries = model.series[0] as BoxPlotSeries
  boxPlotSeries.lineStyle = LineStyle.Dash
  return model
}

/**
 * Outlier type = Cross example
 */
function outlierTypeCross(): PlotModel {
  const model = boxPlot()
  const boxPlotSeries = model.series[0] as BoxPlotSeries
  boxPlotSeries.outlierType = MarkerType.Cross
  return model
}

/**
 * Outlier type = Custom example
 */
function outlierTypeCustom(): PlotModel {
  const model = boxPlot()
  const boxPlotSeries = model.series[0] as BoxPlotSeries
  boxPlotSeries.outlierType = MarkerType.Custom
  boxPlotSeries.outlierOutline = [
    new ScreenPoint(-1, -1),
    new ScreenPoint(1, 1),
    new ScreenPoint(-1, 1),
    new ScreenPoint(1, -1),
  ]
  return model
}

/**
 * Michelson-Morley experiment example
 */
function michelsonMorleyExperiment(): PlotModel {
  const model = new PlotModel()

  const boxPlotSeries: BoxPlotSeries = new BoxPlotSeries({
    title: 'Results',
    stroke: OxyColors.Black,
    strokeThickness: 1,
    outlierSize: 2,
    boxWidth: 0.4,
    items: [],
  })

  boxPlotSeries.items.push({
    x: 0,
    lowerWhisker: 740,
    boxBottom: 850,
    median: 945,
    boxTop: 980,
    upperWhisker: 1070,
    outliers: [650.0],
  })
  boxPlotSeries.items.push({
    x: 1,
    lowerWhisker: 750,
    boxBottom: 805,
    median: 845,
    boxTop: 890,
    upperWhisker: 970,
    outliers: [],
  })
  boxPlotSeries.items.push({
    x: 2,
    lowerWhisker: 845,
    boxBottom: 847,
    median: 855,
    boxTop: 880,
    upperWhisker: 910,
    outliers: [640.0, 950, 970],
  })
  boxPlotSeries.items.push({
    x: 3,
    lowerWhisker: 720,
    boxBottom: 760,
    median: 820,
    boxTop: 870,
    upperWhisker: 910,
    outliers: [],
  })
  boxPlotSeries.items.push({
    x: 4,
    lowerWhisker: 730,
    boxBottom: 805,
    median: 807,
    boxTop: 870,
    upperWhisker: 950,
    outliers: [],
  })

  model.series.push(boxPlotSeries)
  model.annotations.push(
    new LineAnnotation({
      type: LineAnnotationType.Horizontal,
      lineStyle: LineStyle.Solid,
      y: 792.458,
      text: 'true speed',
    }),
  )

  const categoryAxis = new CategoryAxis({
    title: 'Experiment No.',
  })
  categoryAxis.labels.push(...['1', '2', '3', '4', '5'])

  model.axes.push(categoryAxis)
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Speed of light (km/s minus 299,000)',
      majorStep: 100,
      minorStep: 100,
    }),
  )

  return model
}

/**
 * BoxPlot (DateTime axis) example
 */
function boxPlotSeries_DateTimeAxis(): PlotModel {
  const dateService = getDateService()
  const model = new PlotModel()
  const x0 = DateTimeAxis.toDouble(new Date(2013, 5, 4))

  model.axes.push(
    new DateTimeAxis({
      position: AxisPosition.Bottom,
      minimum: x0 - 0.9,
      maximum: x0 + 1.9,
      intervalType: DateTimeIntervalType.Days,
      majorStep: 1,
      minorStep: 1,
      stringFormatter: (d) => dateService.format(d, 'YYYY-MM-DD'),
    }),
  )

  const boxPlotSeries: BoxPlotSeries = new BoxPlotSeries({
    //'X: {1:yyyy-MM-dd}\nUpper Whisker: {2:0.00}\nThird Quartil: {3:0.00}\nMedian: {4:0.00}\nFirst Quartil: {5:0.00}\nLower Whisker: {6:0.00}\nMean: {7:0.00}',
    trackerStringFormatter: (args) =>
      `X: ${dateService.format(args.xValue, 'YYYY-MM-DD')}
Upper Whisker: ${args.upperWhisker!.toFixed(2)}
Third Quartil: ${args.boxTop!.toFixed(2)}
Median: ${args.median!.toFixed(2)}
First Quartil: ${args.boxBottom!.toFixed(2)}
Lower Whisker: ${args.lowerWhisker!.toFixed(2)}
Mean: ${args.mean!.toFixed(2)}`,
    items: [],
  })

  boxPlotSeries.items.push({
    x: x0,
    lowerWhisker: 10,
    boxBottom: 14,
    median: 16,
    boxTop: 20,
    upperWhisker: 22,
    mean: 17,
    outliers: [23.5],
  })
  boxPlotSeries.items.push({
    x: x0 + 1,
    lowerWhisker: 11,
    boxBottom: 13,
    median: 14,
    boxTop: 15,
    upperWhisker: 18,
    outliers: [23.4],
  })

  model.series.push(boxPlotSeries)

  return model
}

const category = 'BoxPlotSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'BoxPlot',
      example: {
        model: boxPlot,
      },
    },
    {
      title: 'BoxPlot (minimal data/ink ratio)',
      example: {
        model: boxPlot2,
      },
    },
    {
      title: 'BoxPlot (dashed line)',
      example: {
        model: boxPlot3,
      },
    },
    {
      title: 'Outlier type = Cross',
      example: {
        model: outlierTypeCross,
      },
    },
    {
      title: 'Outlier type = Custom',
      example: {
        model: outlierTypeCustom,
      },
    },
    {
      title: 'Michelson-Morley experiment',
      example: {
        model: michelsonMorleyExperiment,
      },
    },
    {
      title: 'BoxPlot (DateTime axis)',
      example: {
        model: boxPlotSeries_DateTimeAxis,
      },
    },
  ],
} as ExampleCategory
