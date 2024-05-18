import {
  AxisPosition,
  CategoryAxis,
  LinearAxis,
  LineLegendPosition,
  LineSeries,
  LineStyle,
  newDataPoint,
  newOxyThickness,
  PlotModel,
  TickStyle,
  type TrackerStringFormatterType,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/**
 * Normal distribution
 */
function createNormalDistributionModel() {
  // http://en.wikipedia.org/wiki/Normal_distribution
  const plot: PlotModel = new PlotModel({
    title: 'Normal distribution',
    subtitle: 'Probability density function',
  })

  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: -0.05,
      maximum: 1.05,
      majorStep: 0.2,
      minorStep: 0.05,
      tickStyle: TickStyle.Inside,
    }),
  )
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: -5.25,
      maximum: 5.25,
      majorStep: 1,
      minorStep: 0.25,
      tickStyle: TickStyle.Inside,
    }),
  )
  plot.series.push(createNormalDistributionSeries(-5, 5, 0, 0.2))
  plot.series.push(createNormalDistributionSeries(-5, 5, 0, 1))
  plot.series.push(createNormalDistributionSeries(-5, 5, 0, 5))
  plot.series.push(createNormalDistributionSeries(-5, 5, -2, 0.5))
  return plot
}

export const createNormalDistributionSeries = (
  x0: number,
  x1: number,
  mean: number,
  variance: number,
  n: number = 1001,
): LineSeries => {
  const ls = new LineSeries()
  ls.title = `μ=${mean}, σ²=${variance}`

  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1)
    const f = (1.0 / Math.sqrt(2 * Math.PI * variance)) * Math.exp((-(x - mean) * (x - mean)) / 2 / variance)
    ls.points.push(newDataPoint(x, f))
  }

  return ls
}

/**
 * Average (Mean) monthly temperatures in 2003
 */
function lineLegendPositionAtEnd() {
  // http://www.perceptualedge.com/example2.php
  // Define plot model
  const model = new PlotModel({
    title: 'Average (Mean) monthly temperatures in 2003',
    plotMargins: newOxyThickness(60, 4, 60, 40),
    plotAreaBorderThickness: newOxyThickness(0),
    isLegendVisible: false,
  })

  // Define tracker formatter
  const trackerStringFormatter: TrackerStringFormatterType = function (args) {
    return `${args.title}: ${Number(args.yValue).toFixed(1)}ºF`
  }

  // Create line series with different titles and legend positions
  const phoenix = new LineSeries({
    title: 'Phoenix',
    lineLegendPosition: LineLegendPosition.End,
    trackerStringFormatter,
  })
  const raleigh = new LineSeries({
    title: 'Raleigh',
    lineLegendPosition: LineLegendPosition.End,
    trackerStringFormatter,
  })
  const minneapolis = new LineSeries({
    title: 'Minneapolis',
    lineLegendPosition: LineLegendPosition.End,
    trackerStringFormatter,
  })

  // Define data points for each series
  const phoenixTemps = [52.1, 55.1, 59.7, 67.7, 76.3, 84.6, 91.2, 89.1, 83.8, 72.2, 59.8, 52.5]
  const raleighTemps = [40.5, 42.2, 49.2, 59.5, 67.4, 74.4, 77.5, 76.5, 70.6, 60.2, 50.0, 41.2]
  const minneapolisTemps = [12.2, 16.5, 28.3, 45.1, 57.1, 66.9, 71.9, 70.2, 60.0, 50.0, 32.4, 18.6]

  for (let i = 0; i < 12; i++) {
    phoenix.points.push(newDataPoint(i, phoenixTemps[i]))
    raleigh.points.push(newDataPoint(i, raleighTemps[i]))
    minneapolis.points.push(newDataPoint(i, minneapolisTemps[i]))
  }

  // Add series and axes to the model
  model.series.push(phoenix)
  model.series.push(raleigh)
  model.series.push(minneapolis)

  const categoryAxis = new CategoryAxis({
    axislineStyle: LineStyle.Solid,
  })
  categoryAxis.labels.push(...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
  model.axes.push(categoryAxis)
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Fahrenheit',
      axislineStyle: LineStyle.Solid,
    }),
  )

  return model
}

const category = '1 ShowCases'
export default {
  category: category,
  tags: ['Showcase'],
  examples: [
    {
      title: 'Normal distribution',
      example: {
        model: createNormalDistributionModel,
      },
    },
    {
      title: 'Average (Mean) monthly temperatures in 2003',
      example: {
        model: lineLegendPositionAtEnd,
      },
    },
  ],
} as ExampleCategory
