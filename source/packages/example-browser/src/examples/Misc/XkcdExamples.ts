import {
  AxisPosition,
  BarItem,
  BarSeries,
  CategoryAxis,
  FunctionSeries,
  Legend,
  LegendOrientation,
  LegendPlacement,
  LegendPosition,
  LinearAxis,
  LineSeries,
  newDataPoint,
  OxyColors,
  PlotModel,
  XkcdRenderingDecorator,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function test1(): PlotModel {
  const model = new PlotModel({
    title: 'XKCD style plot',
    subtitle: "Install the 'Humor Sans' font for the best experience",
  })
  model.renderingDecorator = (rc) => new XkcdRenderingDecorator(rc)

  const series = FunctionSeries.fromN(Math.sin, 0, 10, 50, 'sin(x)')

  model.series.push(series)

  return model
}

/**
 * Xkcd style example #2.
 * @returns A PlotModel.
 */
function test2(): PlotModel {
  const model = new PlotModel({
    title: 'Test #2',
  })
  model.renderingDecorator = (rc) => new XkcdRenderingDecorator(rc)

  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: 0, maximum: 8, title: 'INTENSITY' }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'TIME' }))

  const s1 = new LineSeries({
    color: OxyColors.Cyan,
    strokeThickness: 4,
  })

  const s2 = new LineSeries({
    color: OxyColors.White,
    strokeThickness: 14,
  })

  const s3 = new LineSeries({
    color: OxyColors.Red,
    strokeThickness: 4,
  })

  const n = 257
  const x0 = 1
  const x1 = 9
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1)
    const y1 = 1.5 + 10.0 * ((Math.sin(x) * Math.sin(x)) / Math.sqrt(x)) * Math.exp(-0.5 * (x - 5.0) * (x - 5.0))
    const y2 = 3.0 + 10.0 * ((Math.sin(x) * Math.sin(x)) / Math.sqrt(x)) * Math.exp(-0.5 * (x - 7.0) * (x - 7.0))
    s1.points.push(newDataPoint(x, y1))
    s2.points.push(newDataPoint(x, y2))
    s3.points.push(newDataPoint(x, y2))
  }

  model.series.push(s1, s2, s3)

  return model
}

function test3(): PlotModel {
  const model = new PlotModel({
    title: 'Test #3',
  })
  model.renderingDecorator = (rc) => new XkcdRenderingDecorator(rc)

  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.BottomCenter,
    legendOrientation: LegendOrientation.Horizontal,
    legendBorderThickness: 0,
  })

  model.legends.push(l)

  const s1 = new BarSeries({
    title: 'Series 1',
    isStacked: false,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
    xAxisKey: 'x',
    yAxisKey: 'y',
  })

  s1.items.push(new BarItem({ value: 25 }))
  s1.items.push(new BarItem({ value: 137 }))
  s1.items.push(new BarItem({ value: 18 }))
  s1.items.push(new BarItem({ value: 40 }))

  const s2 = new BarSeries({
    title: 'Series 2',
    isStacked: false,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
    xAxisKey: 'x',
    yAxisKey: 'y',
  })

  s2.items.push(new BarItem({ value: 12 }))
  s2.items.push(new BarItem({ value: 14 }))
  s2.items.push(new BarItem({ value: 120 }))
  s2.items.push(new BarItem({ value: 26 }))

  const categoryAxis = new CategoryAxis({
    position: AxisPosition.Bottom,
    key: 'y',
  })
  categoryAxis.labels.push(...['Category A', 'Category B', 'Category C', 'Category D'])

  const valueAxis = new LinearAxis({
    position: AxisPosition.Left,
    minimumPadding: 0,
    maximumPadding: 0.06,
    absoluteMinimum: 0,
    key: 'x',
  })

  model.series.push(s1)
  model.series.push(s2)
  model.axes.push(categoryAxis)
  model.axes.push(valueAxis)

  return model
}

const category = 'XKCD'

export default {
  category,
  examples: [
    {
      title: 'XKCD Test #1',
      example: {
        model: test1,
      },
    },
    {
      title: 'XKCD Test #2',
      example: {
        model: test2,
      },
    },
    {
      title: 'XKCD Test #3',
      example: {
        model: test3,
      },
    },
  ],
} as ExampleCategory
