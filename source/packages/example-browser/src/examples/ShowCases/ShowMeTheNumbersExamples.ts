import {
  AxisLayer,
  AxisPosition,
  BarItem,
  BarSeries,
  CategoryAxis,
  LinearAxis,
  LineSeries,
  LineStyle,
  MarkerType,
  newDataPoint,
  OxyColors,
  OxyThickness,
  PlotModel,
  round,
  ScatterSeries,
  TickStyle,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/** Graph1 */
function graph1(): PlotModel {
  const pm = new PlotModel({ title: 'Q1 2003 Calls by Region', plotAreaBorderThickness: new OxyThickness(0) })
  const categoryAxis = new CategoryAxis({
    axislineStyle: LineStyle.Solid,
    tickStyle: TickStyle.None,
    key: 'y',
  })
  categoryAxis.labels.push(...['North', 'East', 'South', 'West'])
  pm.axes.push(categoryAxis)
  pm.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 0,
      maximum: 6000,
      majorStep: 1000,
      minorStep: 1000,
      axislineStyle: LineStyle.Solid,
      tickStyle: TickStyle.Outside,
      // stringFormat: '#,0',
      key: 'x',
    }),
  )
  const series = new BarSeries({ fillColor: OxyColors.Black, xAxisKey: 'x', yAxisKey: 'y' })
  series.items.push(new BarItem({ value: 3000 }))
  series.items.push(new BarItem({ value: 4500 }))
  series.items.push(new BarItem({ value: 2100 }))
  series.items.push(new BarItem({ value: 4800 }))
  pm.series.push(series)
  return pm
}

/** Graph2 */
function graph2(): PlotModel {
  const pm = new PlotModel({
    title: '2003 Sales',
    plotAreaBorderThickness: new OxyThickness(0),
    isLegendVisible: false,
  })
  const sales1 = [1000, 1010, 1020, 1010, 1020, 1030, 1000, 500, 1000, 900, 900, 1000]
  const sales2 = [2250, 2500, 2750, 2500, 2750, 3000, 2500, 2750, 3100, 2800, 3100, 3500]
  const categoryAxis = new CategoryAxis({
    axislineStyle: LineStyle.Solid,
    tickStyle: TickStyle.None,
  })
  categoryAxis.labels.push(...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'])
  pm.axes.push(categoryAxis)
  pm.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 0,
      maximum: 4000,
      majorStep: 500,
      minorStep: 500,
      axislineStyle: LineStyle.Solid,
      tickStyle: TickStyle.Outside,
      //stringFormat: '#,0'
    }),
  )
  const s1 = new LineSeries({ color: OxyColors.Orange })
  for (let i = 0; i < 12; i++) {
    s1.points.push(newDataPoint(i, sales1[i]))
  }

  const s2 = new LineSeries({ color: OxyColors.Gray })
  for (let i = 0; i < 12; i++) {
    s2.points.push(newDataPoint(i, sales2[i]))
  }

  pm.series.push(s1)
  pm.series.push(s2)
  return pm
}

/** Graph3 */
function graph3(): PlotModel {
  const pm = new PlotModel({
    title: 'Headcount',
    plotAreaBorderThickness: new OxyThickness(0),
    plotMargins: new OxyThickness(100, 40, 20, 40),
  })
  const values = new Map<string, number>([
    ['Manufacturing', 240],
    ['Sales', 160],
    ['Engineering', 50],
    ['Operations', 45],
    ['Finance', 40],
    ['Info Systems', 39],
    ['Legal', 25],
    ['Marketing', 10],
  ])
  pm.axes.push(
    new CategoryAxis({
      position: AxisPosition.Left,
      itemsSource: Array.from(values),
      labelField: '0',
      tickStyle: TickStyle.None,
      axisTickToLabelDistance: 10,
      startPosition: 1,
      endPosition: 0,
    }),
  )
  pm.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: 0,
      maximum: 250,
      majorStep: 50,
      minorStep: 50,
      axislineStyle: LineStyle.Solid,
      tickStyle: TickStyle.Outside,
      minimumPadding: 0,
      maximumPadding: 0,
    }),
  )
  pm.series.push(new BarSeries({ fillColor: OxyColors.Black, itemsSource: Array.from(values), valueField: '1' }))
  return pm
}

/** Regional % of Total Expenses */
function graph4(): PlotModel {
  const pm = new PlotModel({ title: 'Regional % of Total Expenses', plotAreaBorderThickness: new OxyThickness(0) })
  const categoryAxis = new CategoryAxis({
    tickStyle: TickStyle.None,
    gapWidth: 0,
    key: 'y',
  })
  categoryAxis.labels.push(...['West\n34%', 'East\n30%', 'North\n20%', 'South\n16%'])
  pm.axes.push(categoryAxis)

  pm.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 0,
      maximum: 0.35 + Number.EPSILON,
      majorStep: 0.05,
      minorStep: 0.05,
      axislineStyle: LineStyle.Solid,
      tickStyle: TickStyle.Outside,
      //stringFormat: 'P0',
      stringFormatter: (value: number) => `${Math.round(value * 100)}%`,
      key: 'x',
    }),
  )

  const series = new BarSeries({
    barWidth: 1.0,
    strokeColor: OxyColors.DarkGray,
    strokeThickness: 1.0,
    fillColor: OxyColors.Black,
    xAxisKey: 'x',
    yAxisKey: 'y',
  })
  const numbers = [0.34, 0.3, 0.2, 0.16]
  series.items = numbers.map((n) => BarItem.fromValue(n))
  pm.series.push(series)
  return pm
}

/** Actual to Plan Variance */
function graph5(): PlotModel {
  const pm = new PlotModel({ title: 'Actual to Plan Variance', plotAreaBorderThickness: new OxyThickness(0) })
  const values = new Map<string, number>([
    ['Sales', 7],
    ['Marketing', -7],
    ['Systems', -2],
    ['HR', -17],
    ['Finance', 5],
  ])
  pm.axes.push(
    new CategoryAxis({
      itemsSource: Array.from(values),
      labelField: '0',
      tickStyle: TickStyle.None,
      key: 'y',
    }),
  )
  pm.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: -20,
      maximum: 10,
      minorStep: 5,
      majorStep: 5,
      layer: AxisLayer.AboveSeries,
      axislineStyle: LineStyle.Solid,
      extraGridlines: [0],
      extraGridlineColor: OxyColors.Black,
      extraGridlineThickness: 3,
      tickStyle: TickStyle.Outside,
      //stringFormat: '+0;-0;0',
      stringFormatter: (value: number) => {
        const sign = value > 0 ? '+' : value < 0 ? '-' : ''
        return sign + round(Math.abs(value), 0)
      },
      key: 'x',
    }),
  )
  pm.series.push(
    new BarSeries({
      fillColor: OxyColors.Orange,
      negativeFillColor: OxyColors.Gray,
      itemsSource: Array.from(values),
      valueField: '1',
      xAxisKey: 'x',
      yAxisKey: 'y',
    }),
  )
  return pm
}

/** Order Count by Order Size */
function graph6(): PlotModel {
  const pm = new PlotModel({
    title: 'Order Count by Order Size',
    plotAreaBorderThickness: new OxyThickness(0),
    plotMargins: new OxyThickness(60, 4, 4, 60),
  })
  const values = new Map<string, number>([
    [' <$10', 5000],
    ['>=$10\n    &\n <$20', 1500],
    ['>=$20\n    &\n <$30', 1000],
    ['>=$40\n    &\n <$40', 500],
    ['>=$40', 200],
  ])
  pm.axes.push(
    new CategoryAxis({
      axislineStyle: LineStyle.Solid,
      itemsSource: Array.from(values),
      labelField: '0',
      tickStyle: TickStyle.None,
      key: 'y',
    }),
  )
  pm.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 0,
      maximum: 6000,
      majorStep: 1000,
      minorStep: 1000,
      axislineStyle: LineStyle.Solid,
      tickStyle: TickStyle.Outside,
      //stringFormat: '+0;-0;0',
      stringFormatter: (value: number) => {
        const sign = value > 0 ? '+' : value < 0 ? '-' : ''
        return sign + round(Math.abs(value), 0)
      },
      key: 'x',
    }),
  )
  pm.series.push(
    new BarSeries({
      fillColor: OxyColors.Orange,
      itemsSource: Array.from(values),
      valueField: '1',
      xAxisKey: 'x',
      yAxisKey: 'y',
    }),
  )
  return pm
}

/** Correlation of Employee Heights and Salaries */
function graph7(): PlotModel {
  const pm = new PlotModel({
    title: 'Correlation of Employee Heights and Salaries',
    plotAreaBorderThickness: new OxyThickness(0),
  })
  const values = [
    newDataPoint(62, 39000),
    newDataPoint(66, 44000),
    newDataPoint(64, 50000),
    newDataPoint(66, 49500),
    newDataPoint(67, 52000),
    newDataPoint(68, 50000),
    newDataPoint(66, 56000),
    newDataPoint(67, 56000),
    newDataPoint(72, 56000),
    newDataPoint(68, 58000),
    newDataPoint(69, 62000),
    newDataPoint(71, 63000),
    newDataPoint(65, 64000),
    newDataPoint(68, 71000),
    newDataPoint(72, 72000),
    newDataPoint(74, 69000),
    newDataPoint(74, 79000),
    newDataPoint(77, 81000),
  ]
  pm.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 30000,
      maximum: 90000,
      majorStep: 10000,
      minorStep: 10000,
      axislineStyle: LineStyle.Solid,
      tickStyle: TickStyle.Outside,
      //stringFormat: '0,0'
    }),
  )
  pm.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: 60,
      maximum: 80,
      majorStep: 5,
      minorStep: 5,
      axislineStyle: LineStyle.Solid,
      tickStyle: TickStyle.Outside,
    }),
  )
  pm.series.push(
    new ScatterSeries({
      itemsSource: values,
      markerType: MarkerType.Circle,
      markerSize: 3.0,
      markerFill: OxyColors.White,
      markerStroke: OxyColors.Black,
      dataFieldX: 'x',
      dataFieldY: 'y',
    }),
  )
  return pm
}

const category = "Examples from the book 'Show Me the Numbers'"

export default {
  category,
  tags: ['Showcase'],
  examples: [
    {
      title: 'Q1 2003 Calls by Region',
      example: {
        model: graph1,
      },
    },
    {
      title: '2003 Sales',
      example: {
        model: graph2,
      },
    },
    {
      title: 'Headcount',
      example: {
        model: graph3,
      },
    },
    {
      title: 'Regional % of Total Expenses',
      example: {
        model: graph4,
      },
    },
    {
      title: 'Actual to Plan Variance',
      example: {
        model: graph5,
      },
    },
    {
      title: 'Order Count by Order Size',
      example: {
        model: graph6,
      },
    },
    {
      title: 'Correlation of Employee Heights and Salaries',
      example: {
        model: graph7,
      },
    },
  ],
} as ExampleCategory
