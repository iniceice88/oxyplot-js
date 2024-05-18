import {
  AxisPosition,
  BarSeries,
  CategoryAxis,
  getEnumKeys,
  LabelPlacement,
  type LabelStringFormatterType,
  Legend,
  LegendOrientation,
  LegendPlacement,
  LegendPosition,
  LinearAxis,
  LineSeries,
  LineStyle,
  LogarithmicAxis,
  newBarItem,
  newDataPoint,
  OxyColorHelper,
  OxyColors,
  PlotModel,
} from 'oxyplot-js'
import { Random } from '../Random'
import type { ExampleCategory } from '../types'

function withLabels(): PlotModel {
  const model = new PlotModel()
  model.title = 'With labels'

  const labelStringFormatter: LabelStringFormatterType = function (item, trackerParameters) {
    return item.value.toString()
  }

  const rnd = new Random(1)
  const series: BarSeries[] = [
    new BarSeries({
      labelStringFormatter,
      labelPlacement: LabelPlacement.Base,
      textColor: OxyColors.White,
      title: 'Base',
    }),
    new BarSeries({
      labelStringFormatter,
      labelPlacement: LabelPlacement.Inside,
      textColor: OxyColors.White,
      title: 'Inside',
    }),
    new BarSeries({
      labelStringFormatter,
      labelPlacement: LabelPlacement.Middle,
      textColor: OxyColors.White,
      title: 'Middle',
    }),
    new BarSeries({
      labelStringFormatter,
      labelPlacement: LabelPlacement.Outside,
      title: 'Outside',
    }),
  ]

  for (let i = 0; i < 4; i++) {
    for (const s of series) {
      s.items.push(newBarItem(rnd.next(-100, 100)))
    }
  }

  const categoryAxis = new CategoryAxis()
  categoryAxis.position = AxisPosition.Left
  categoryAxis.labels.push(...['Category A', 'Category B', 'Category C', 'Category D'])

  const valueAxis = new LinearAxis()
  valueAxis.position = AxisPosition.Bottom
  valueAxis.minimumPadding = 0.06
  valueAxis.maximumPadding = 0.06
  valueAxis.extraGridlines = [0]

  for (const s of series) {
    model.series.push(s)
  }

  model.axes.push(categoryAxis)
  model.axes.push(valueAxis)

  return model
}

function withLabelsAtAnAngle(): PlotModel {
  const model = withLabels()

  for (const b of model.series) {
    ;(b as BarSeries).labelAngle = -45
  }

  return model
}

const stackedSeries = (): PlotModel => {
  return createSimpleModel(true, 'Simple stacked model')
}

const multipleValueAxes = (): PlotModel => {
  const model = new PlotModel({ title: 'Multiple Value Axes' })

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left })
  const valueAxis1 = new LinearAxis({
    title: 'Value Axis 1',
    position: AxisPosition.Bottom,
    minimumPadding: 0.06,
    maximumPadding: 0.06,
    extraGridlines: [0],
    endPosition: 0.5,
    key: 'x1',
  })
  const valueAxis2 = new LinearAxis({
    title: 'Value Axis 2',
    position: AxisPosition.Bottom,
    minimumPadding: 0.06,
    maximumPadding: 0.06,
    extraGridlines: [0],
    startPosition: 0.5,
    key: 'x2',
  })
  model.axes.push(categoryAxis, valueAxis1, valueAxis2)

  const series: BarSeries[] = [
    new BarSeries({ xAxisKey: 'x1' }),
    new BarSeries({ xAxisKey: 'x1' }),
    new BarSeries({ xAxisKey: 'x2' }),
    new BarSeries({ xAxisKey: 'x2' }),
  ]

  const rnd = new Random(1)
  for (const s of series) {
    for (let i = 0; i < 4; i++) {
      s.items.push(newBarItem(rnd.next(-100, 100)))
    }

    model.series.push(s)
  }

  return model
}

const stackedMultipleValueAxes = (): PlotModel => {
  const model = multipleValueAxes()
  model.title = `Stacked, ${model.title}`
  for (const series of model.series) {
    ;(series as BarSeries).isStacked = true
  }
  return model
}

const multipleCategoryAxes = (): PlotModel => {
  const model = new PlotModel({ title: 'Multiple Category Axes' })
  model.legends.push(
    new Legend({
      isLegendVisible: true,
      legendPosition: LegendPosition.TopLeft,
      legendPlacement: LegendPlacement.Inside,
    }),
  )

  const valueAxis = new LinearAxis({ position: AxisPosition.Bottom, key: 'x', extraGridlines: [0] })
  const categoryAxis1 = new CategoryAxis({
    title: 'Category Axis 1',
    position: AxisPosition.Left,
    minimumPadding: 0.06,
    maximumPadding: 0.06,
    endPosition: 0.5,
    key: 'y1',
  })
  const categoryAxis2 = new CategoryAxis({
    title: 'Category Axis 2',
    position: AxisPosition.Left,
    minimumPadding: 0.06,
    maximumPadding: 0.06,
    startPosition: 0.5,
    key: 'y2',
  })
  model.axes.push(valueAxis, categoryAxis1, categoryAxis2)

  const series: BarSeries[] = [
    new BarSeries({ yAxisKey: 'y1', xAxisKey: 'x', renderInLegend: true, title: 'Y1A' }),
    new BarSeries({ yAxisKey: 'y1', xAxisKey: 'x', renderInLegend: true, title: 'Y1B' }),
    new BarSeries({ yAxisKey: 'y2', xAxisKey: 'x', renderInLegend: true, title: 'Y2A' }),
    new BarSeries({ yAxisKey: 'y2', xAxisKey: 'x', renderInLegend: true, title: 'Y2B' }),
  ]

  const rnd = new Random()
  for (const s of series) {
    for (let i = 0; i < 4; i++) {
      s.items.push(newBarItem(rnd.next(-100, 100)))
    }
    model.series.push(s)
  }

  return model
}

const stackedMultipleCategoryAxes = (): PlotModel => {
  const model = multipleCategoryAxes()
  model.title = `Stacked, ${model.title}`
  for (const series of model.series) {
    ;(series as BarSeries).isStacked = true
  }
  return model
}

const emptySeries = (): PlotModel => {
  const model = new PlotModel({ title: 'Empty series' })

  const s1 = new BarSeries({ title: 'Series 1' })
  const s2 = new BarSeries({ title: 'Series 2' })
  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left })
  const valueAxis = new LinearAxis({ position: AxisPosition.Bottom, minimumPadding: 0 })
  model.series.push(s1, s2)
  model.axes.push(categoryAxis, valueAxis)
  return model
}

const noCategoryAxisDefined = (): PlotModel => {
  const model = new PlotModel({ title: 'No category axis defined' })

  const s1 = new BarSeries({
    title: 'Series 1',
    itemsSource: [newBarItem(25), newBarItem(137)],
  })
  const s2 = new BarSeries({
    title: 'Series 2',
    itemsSource: [newBarItem(52), newBarItem(317)],
  })
  const valueAxis = new LinearAxis({ position: AxisPosition.Bottom, minimumPadding: 0 })
  model.series.push(s1, s2)
  model.axes.push(valueAxis)
  return model
}

interface Item {
  label: string
  value1: number
  value2: number
  value3: number
}

const bindingItemsSource = (): PlotModel => {
  const items: Item[] = [
    { label: 'Apples', value1: 37, value2: 12, value3: 19 },
    { label: 'Pears', value1: 7, value2: 21, value3: 9 },
    { label: 'Bananas', value1: 23, value2: 2, value3: 29 },
  ]

  const plotModel1 = new PlotModel({ title: 'Binding to ItemsSource' })
  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
  })

  plotModel1.legends.push(l)

  const categoryAxis1 = new CategoryAxis({
    position: AxisPosition.Left,
    labelField: 'label',
    itemsSource: items,
    majorStep: 1,
    minorStep: 1,
  })
  plotModel1.axes.push(categoryAxis1)
  const linearAxis1 = new LinearAxis({
    position: AxisPosition.Bottom,
    absoluteMinimum: 0,
    minimumPadding: 0,
  })
  plotModel1.axes.push(linearAxis1)
  const series1 = new BarSeries({
    fillColor: OxyColorHelper.fromArgb(255, 78, 154, 6),
    valueField: 'value1',
    title: '2009',
    itemsSource: items,
  })
  plotModel1.series.push(series1)
  const series2 = new BarSeries({
    fillColor: OxyColorHelper.fromArgb(255, 200, 141, 0),
    valueField: 'value2',
    title: '2010',
    itemsSource: items,
  })
  plotModel1.series.push(series2)
  const series3 = new BarSeries({
    fillColor: OxyColorHelper.fromArgb(255, 204, 0, 0),
    valueField: 'value3',
    title: '2011',
    itemsSource: items,
  })
  plotModel1.series.push(series3)
  return plotModel1
}

const bindingToItemsSourceArray = (): PlotModel => {
  const model = new PlotModel({
    title: 'Binding to ItemsSource',
    subtitle: 'The items are defined by an array of BarItem/ColumnItem',
  })
  model.series.push(
    new BarSeries({
      title: 'Series 1',
      itemsSource: [newBarItem({ value: 25 }), newBarItem({ value: 137 })],
    }),
  )
  model.series.push(
    new BarSeries({
      title: 'Series 2',
      itemsSource: [newBarItem({ value: 52 }), newBarItem({ value: 317 })],
    }),
  )
  model.axes.push(new CategoryAxis({ position: AxisPosition.Left }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimumPadding: 0 }))
  return model
}

const bindingToItemsSourceListT = (): PlotModel => {
  const model = new PlotModel({
    title: 'Binding to ItemsSource',
    subtitle: 'The items are defined by a List of BarItem/ColumnItem',
  })
  model.series.push(
    new BarSeries({
      title: 'Series 1',
      itemsSource: [newBarItem({ value: 25 }), newBarItem({ value: 137 })],
    }),
  )
  model.series.push(
    new BarSeries({
      title: 'Series 2',
      itemsSource: [newBarItem({ value: 52 }), newBarItem({ value: 317 })],
    }),
  )
  model.axes.push(new CategoryAxis({ position: AxisPosition.Left }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimumPadding: 0 }))
  return model
}

interface Item {
  value1: number
}

const bindingToItemsSourceReflection = (): PlotModel => {
  const model = new PlotModel({
    title: 'Binding to ItemsSource',
    subtitle: "Reflect by 'ValueField'",
  })
  model.series.push(
    new BarSeries({
      title: 'Series 1',
      valueField: 'value1',
      itemsSource: [{ value1: 25 }, { value1: 137 }],
    }),
  )
  model.series.push(
    new BarSeries({
      title: 'Series 2',
      valueField: 'value1',
      itemsSource: [{ value1: 52 }, { value1: 317 }],
    }),
  )
  model.axes.push(new CategoryAxis({ position: AxisPosition.Left }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimumPadding: 0 }))
  return model
}

const definedByItems = (): PlotModel => {
  const model = new PlotModel({
    title: 'Defined by Items',
    subtitle: 'The items are added to the `Items` property.',
  })

  const s1 = new BarSeries({ title: 'Series 1' })
  s1.items.push(...[newBarItem({ value: 25 }), newBarItem({ value: 137 })])
  const s2 = new BarSeries({ title: 'Series 2' })
  s2.items.push(...[newBarItem({ value: 52 }), newBarItem({ value: 317 })])
  model.series.push(s1, s2)

  model.axes.push(new CategoryAxis({ position: AxisPosition.Left }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimumPadding: 0 }))
  return model
}

/** Empty category axis */
function emptyCategoryAxis(): PlotModel {
  const model = new PlotModel({ title: 'Empty category axis' })

  const s1 = new BarSeries({ title: 'Series 1' })
  s1.items.push(newBarItem({ value: 25 }))
  s1.items.push(newBarItem({ value: 137 }))
  s1.items.push(newBarItem({ value: 18 }))
  s1.items.push(newBarItem({ value: 40 }))

  const s2 = new BarSeries({ title: 'Series 2' })
  s2.items.push(newBarItem({ value: -12 }))
  s2.items.push(newBarItem({ value: -14 }))
  s2.items.push(newBarItem({ value: -120 }))
  s2.items.push(newBarItem({ value: -26 }))

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left })

  const valueAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    minimumPadding: 0.06,
    maximumPadding: 0.06,
    extraGridlines: [0],
    extraGridlineStyle: LineStyle.Solid,
    extraGridlineColor: OxyColors.Black,
    extraGridlineThickness: 1,
  })

  model.series.push(s1, s2)
  model.axes.push(categoryAxis, valueAxis)

  return model
}

/** With negative values */
function withNegativeValue(): PlotModel {
  return createModelWithNegativeValues(false, 'With negative values')
}

/** Stacked with negative values */
function stackedWithNegativeValue(): PlotModel {
  return createModelWithNegativeValues(true, 'Stacked with negative values')
}

/** Mixed with LineSeries */
function mixedWithLineSeries(): PlotModel {
  const model = createSimpleModel(false, 'Mixed with LineSeries')
  model.title = 'Mixed with LineSeries'

  const s1 = new LineSeries({ title: 'LineSeries 1' })
  s1.points.push(newDataPoint(25, 0))
  s1.points.push(newDataPoint(137, 1))
  s1.points.push(newDataPoint(18, 2))
  s1.points.push(newDataPoint(40, 3))

  model.series.push(s1)
  return model
}

/** No axes defined */
function noAxes(): PlotModel {
  const model = createSimpleModel(false, 'No axes defined')
  model.axes.length = 0 // default axes will be generated
  return model
}

/** Stacked and no axes defined */
function stackedNoAxes(): PlotModel {
  const model = createSimpleModel(true, 'Stacked and no axes defined')
  model.axes.length = 0 // default axes will be generated
  return model
}

/** Logarithmic axis (Base Value) */
function logAxisBaseValue(): PlotModel {
  const model = new PlotModel({ title: 'Logarithmic axis' })

  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.BottomCenter,
    legendOrientation: LegendOrientation.Horizontal,
    legendBorderThickness: 0,
  })

  model.legends.push(l)

  const s1 = new BarSeries({
    title: 'Series 1',
    baseValue: 0.1,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s1.items.push(newBarItem({ value: 25 }))
  s1.items.push(newBarItem({ value: 37 }))
  s1.items.push(newBarItem({ value: 18 }))
  s1.items.push(newBarItem({ value: 40 }))

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left })
  categoryAxis.labels.push('Category A', 'Category B', 'Category C', 'Category D')

  model.series.push(s1)
  model.axes.push(categoryAxis)
  model.axes.push(
    new LogarithmicAxis({
      position: AxisPosition.Bottom,
      minimum: 0.1,
      minimumPadding: 0,
      absoluteMinimum: 0,
    }),
  )

  return model
}

/** Logarithmic axis (Base Line) */
function logAxisBaseLine(): PlotModel {
  const model = new PlotModel({ title: 'Logarithmic axis' })

  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.BottomCenter,
    legendOrientation: LegendOrientation.Horizontal,
    legendBorderThickness: 0,
  })

  model.legends.push(l)

  const s1 = new BarSeries({
    title: 'Series 1',
    baseLine: 0.1,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s1.items.push(newBarItem({ value: 25 }))
  s1.items.push(newBarItem({ value: 37 }))
  s1.items.push(newBarItem({ value: 18 }))
  s1.items.push(newBarItem({ value: 40 }))

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left })
  categoryAxis.labels.push('Category A', 'Category B', 'Category C', 'Category D')

  model.series.push(s1)
  model.axes.push(categoryAxis)
  model.axes.push(new LogarithmicAxis({ position: AxisPosition.Bottom, minimumPadding: 0, absoluteMinimum: 0 }))

  return model
}

/** Logarithmic axis (not stacked) */
function logAxisNotStacked(): PlotModel {
  const model = new PlotModel({ title: 'Logarithmic axis' })

  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
  })

  model.legends.push(l)

  const items = [
    { label: 'Apples', value1: 37, value2: 12, value3: 19 },
    { label: 'Pears', value1: 7, value2: 21, value3: 9 },
    { label: 'Bananas', value1: 23, value2: 2, value3: 29 },
  ]

  model.series.push(new BarSeries({ title: '2009', itemsSource: items, valueField: 'value1' }))
  model.series.push(new BarSeries({ title: '2010', itemsSource: items, valueField: 'value2' }))
  model.series.push(new BarSeries({ title: '2011', itemsSource: items, valueField: 'value3' }))

  model.axes.push(new CategoryAxis({ position: AxisPosition.Left, itemsSource: items, labelField: 'label' }))
  model.axes.push(new LogarithmicAxis({ position: AxisPosition.Bottom, minimum: 1 }))

  return model
}

/** Logarithmic axis (stacked series) */
function logAxisStacked(): PlotModel {
  const model = logAxisNotStacked()
  for (const s of model.series) {
    if (s instanceof BarSeries) {
      s.isStacked = true
    }
  }

  return model
}

/**
 * Histogram with 5 bins.
 */
function histogram3(): PlotModel {
  return createHistogram(100000, 5)
}

/**
 * Histogram with 20 bins.
 */
function histogram20(): PlotModel {
  return createHistogram(100000, 20)
}

/**
 * Histogram with 200 bins.
 */
function histogram200(): PlotModel {
  return createHistogram(100000, 200)
}

/**
 * Histogram of a standard normal distribution.
 */
function histogramStandardNormalDistribution(): PlotModel {
  return createNormalDistributionHistogram(100000, 2000)
}

/** Different colors within the same series */
function differentColors(): PlotModel {
  const model = new PlotModel({ title: 'Different colors within the same series' })
  const series = new BarSeries({ title: 'Series 1' })
  series.items.push(newBarItem({ value: 1, color: OxyColors.Red }))
  series.items.push(newBarItem({ value: 2, color: OxyColors.Green }))
  series.items.push(newBarItem({ value: 1, color: OxyColors.Blue }))

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
  })
  categoryAxis.labels.push(...['A', 'B', 'C'])
  model.axes.push(categoryAxis)

  model.series.push(series)
  return model
}

/** Different stacking groups */
function stackingGroups(): PlotModel {
  const model = new PlotModel({ title: 'Stacking groups' })
  const series = new BarSeries({ title: 'Series 1', stackGroup: '1', isStacked: true })
  series.items.push(newBarItem({ value: 1 }))
  series.items.push(newBarItem({ value: 2 }))
  model.series.push(series)

  const series2 = new BarSeries({ title: 'Series 2', stackGroup: '2', isStacked: true })
  series2.items.push(newBarItem({ value: 2 }))
  series2.items.push(newBarItem({ value: 1 }))
  model.series.push(series2)

  const series3 = new BarSeries({ title: 'Series 3', stackGroup: '1', isStacked: true })
  series3.items.push(newBarItem({ value: 3 }))
  series3.items.push(newBarItem({ value: 1 }))
  model.series.push(series3)

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
  })
  categoryAxis.labels.push(...['A', 'B'])
  model.axes.push(categoryAxis)
  return model
}

/** Different widths */
function differentWidths(): PlotModel {
  const model = new PlotModel({
    title: 'Different widths',
    subtitle: 'Series1=0.6 and Series2=0.3',
  })
  const series1 = new BarSeries({ title: 'Series 1', barWidth: 0.6 })
  series1.items.push(newBarItem({ value: 1 }))
  series1.items.push(newBarItem({ value: 2 }))
  model.series.push(series1)

  const series2 = new BarSeries({ title: 'Series 2', barWidth: 0.3 })
  series2.items.push(newBarItem({ value: 3 }))
  series2.items.push(newBarItem({ value: 1 }))
  model.series.push(series2)

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
  })
  categoryAxis.labels.push(...['A', 'B'])
  model.axes.push(categoryAxis)

  return model
}

/** Different widths (stacked) */
function differentWidthsStacked(): PlotModel {
  const model = new PlotModel({ title: 'Different widths (stacked)' })
  const series1 = new BarSeries({ title: 'Series 1', isStacked: true, barWidth: 0.6 })
  series1.items.push(newBarItem({ value: 1 }))
  series1.items.push(newBarItem({ value: 2 }))
  model.series.push(series1)

  const series2 = new BarSeries({ title: 'Series 2', isStacked: true, barWidth: 0.3 })
  series2.items.push(newBarItem({ value: 3 }))
  series2.items.push(newBarItem({ value: 1 }))
  model.series.push(series2)

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
  })
  categoryAxis.labels.push(...['A', 'B'])
  model.axes.push(categoryAxis)

  return model
}

/** Invalid values */
function invalidValues(): PlotModel {
  const model = new PlotModel({
    title: 'Invalid values',
    subtitle: 'Series 1 contains a NaN value for category B.',
  })
  const series1 = new BarSeries({ title: 'Series 1' })
  series1.items.push(newBarItem({ value: 1 }))
  series1.items.push(newBarItem({ value: NaN }))
  model.series.push(series1)

  const series2 = new BarSeries({ title: 'Series 2' })
  series2.items.push(newBarItem({ value: 3 }))
  series2.items.push(newBarItem({ value: 1 }))
  model.series.push(series2)

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
  })
  categoryAxis.labels.push(...['A', 'B'])
  model.axes.push(categoryAxis)

  return model
}

/** Missing values */
function missingValues(): PlotModel {
  const model = new PlotModel({
    title: 'Missing values',
    subtitle: 'Series 1 contains only one item with CategoryIndex = 1',
  })
  const series1 = new BarSeries({ title: 'Series 1' })
  series1.items.push(newBarItem({ value: 1, categoryIndex: 1 }))
  model.series.push(series1)

  const series2 = new BarSeries({ title: 'Series 2' })
  series2.items.push(newBarItem({ value: 3 }))
  series2.items.push(newBarItem({ value: 1.2 }))
  model.series.push(series2)

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
  })
  categoryAxis.labels.push(...['A', 'B'])
  model.axes.push(categoryAxis)

  return model
}

/** CategoryIndex */
function categoryIndex(): PlotModel {
  const model = new PlotModel({
    title: 'CategoryIndex',
    subtitle: 'Setting CategoryIndex = 0 for both items in the series.',
  })
  const series = new BarSeries({ title: 'Series 1', strokeThickness: 1 })
  series.items.push(newBarItem({ value: 1, categoryIndex: 0 }))
  series.items.push(newBarItem({ value: 2, categoryIndex: 0 }))
  model.series.push(series)

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
  })
  categoryAxis.labels.push(...['A', 'B'])
  model.axes.push(categoryAxis)

  return model
}

/** CategoryIndex (stacked) */
function categoryIndexStacked(): PlotModel {
  const model = new PlotModel({
    title: 'CategoryIndex (stacked)',
    subtitle: 'Setting CategoryIndex = 0 for both items in the series.',
  })
  const series = new BarSeries({ title: 'Series 1', isStacked: true, strokeThickness: 1 })
  series.items.push(newBarItem({ value: 1, categoryIndex: 0 }))
  series.items.push(newBarItem({ value: 2, categoryIndex: 0 }))
  model.series.push(series)

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
  })
  categoryAxis.labels.push(...['A', 'B'])
  model.axes.push(categoryAxis)

  return model
}

/**
 * Base value example.
 */
function baseValue(): PlotModel {
  const model = new PlotModel({
    title: 'BaseValue',
    subtitle: 'BaseValue = -1',
  })

  const series1 = new BarSeries({
    title: 'Series 1',
    baseValue: -1,
  })
  series1.items.push(newBarItem({ value: 1 }))
  series1.items.push(newBarItem({ value: 2 }))
  model.series.push(series1)

  const series2 = new BarSeries({
    title: 'Series 2',
    baseValue: -1,
  })
  series2.items.push(newBarItem({ value: 4 }))
  series2.items.push(newBarItem({ value: 7 }))
  model.series.push(series2)

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
  })
  categoryAxis.labels.push(...['A', 'B'])
  model.axes.push(categoryAxis)

  return model
}

/**
 * Base value with stacking example.
 */
function baseValueStacked(): PlotModel {
  const model = new PlotModel({
    title: 'BaseValue (stacked)',
    subtitle: 'BaseValue = -1',
  })

  const series1 = new BarSeries({
    title: 'Series 1',
    isStacked: true,
    baseValue: -1,
  })
  series1.items.push(newBarItem({ value: 1 }))
  series1.items.push(newBarItem({ value: 2 }))
  model.series.push(series1)

  const series2 = new BarSeries({
    title: 'Series 2',
    isStacked: true,
    baseValue: -1,
  })
  series2.items.push(newBarItem({ value: 4 }))
  series2.items.push(newBarItem({ value: 7 }))
  model.series.push(series2)

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
  })
  categoryAxis.labels.push(...['A', 'B'])
  model.axes.push(categoryAxis)

  return model
}

/**
 * Base value with overlapping bars example.
 */
function baseValueOverlaping(): PlotModel {
  const model = new PlotModel({
    title: 'BaseValue (overlaping)',
    subtitle: 'BaseValue = -1',
  })

  const series1 = new BarSeries({
    title: 'Series 1',
    isStacked: true,
    overlapsStack: true,
    baseValue: -1,
  })
  series1.items.push(newBarItem({ value: 1 }))
  series1.items.push(newBarItem({ value: 2 }))
  model.series.push(series1)

  const series2 = new BarSeries({
    title: 'Series 2',
    isStacked: true,
    overlapsStack: true,
    baseValue: -1,
    barWidth: 0.5,
  })
  series2.items.push(newBarItem({ value: 4 }))
  series2.items.push(newBarItem({ value: 7 }))
  model.series.push(series2)

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
  })
  categoryAxis.labels.push(...['A', 'B'])
  model.axes.push(categoryAxis)

  return model
}

/**
 * Base value with label placements example.
 */
function baseValueLabels(): PlotModel {
  const model = new PlotModel({ title: 'BaseValue with Labels' })

  for (const placement of getEnumKeys(LabelPlacement)) {
    const series = new BarSeries({
      title: placement.toString(),
      baseValue: -25,
      labelPlacement: placement,
      labelStringFormatter: BarSeriesLabelStringFormatter,
    })
    series.items.push(newBarItem({ value: -40 }))
    series.items.push(newBarItem({ value: -25 }))
    series.items.push(newBarItem({ value: -10 }))
    series.items.push(newBarItem({ value: 0 }))
    series.items.push(newBarItem({ value: 10 }))
    model.series.push(series)
  }

  const categoryAxis = new CategoryAxis({
    title: 'Category',
    position: AxisPosition.Left,
    startPosition: 1,
    endPosition: 0,
  })
  categoryAxis.labels.push(...['A', 'B', 'C', 'D', 'E'])
  model.axes.push(categoryAxis)

  model.legends.push(new Legend())

  return model
}

/**
 * Stacked bars with labels example.
 */
function stackedLabels(): PlotModel {
  const model = new PlotModel({ title: 'Stacked with Labels' })

  let i = 0
  for (const placement of getEnumKeys(LabelPlacement)) {
    const categoryAxis = new CategoryAxis({
      title: 'Category',
      position: AxisPosition.Left,
      startPosition: 1 - i * 0.25,
      endPosition: 0.75 - i * 0.25,
      key: `C${i}`,
    })

    const bs1 = new BarSeries({
      title: placement.toString(),
      labelPlacement: placement,
      labelStringFormatter: BarSeriesLabelStringFormatter,
      isStacked: true,
      yAxisKey: categoryAxis.key,
    })
    bs1.items.push(newBarItem({ value: 5 }))
    bs1.items.push(newBarItem({ value: 10 }))
    bs1.items.push(newBarItem({ value: 15 }))
    model.series.push(bs1)

    const bs2 = new BarSeries({
      title: placement.toString(),
      labelPlacement: placement,
      labelStringFormatter: BarSeriesLabelStringFormatter,
      isStacked: true,
      yAxisKey: categoryAxis.key,
    })
    bs2.items.push(newBarItem({ value: 15 }))
    bs2.items.push(newBarItem({ value: 10 }))
    bs2.items.push(newBarItem({ value: 5 }))
    model.series.push(bs2)

    categoryAxis.labels.push(...['A', 'B', 'C'])
    model.axes.push(categoryAxis)

    i++
  }

  model.legends.push(new Legend())

  return model
}

/**
 * Gap width 0% example.
 */
function gapWidth0(): PlotModel {
  return createGapWidthModel(0, 'GapWidth 0%')
}

/**
 * Gap width 100% (default) example.
 */
function gapWidth100(): PlotModel {
  return createGapWidthModel(1, 'GapWidth 100% (default)')
}

/**
 * Gap width 200% example.
 */
function gapWidth200(): PlotModel {
  return createGapWidthModel(2, 'GapWidth 200%')
}

/**
 * All-in-one example with various features showcased.
 */
function allInOne(): PlotModel {
  const model = new PlotModel({ title: 'All in one' })

  const legend = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.BottomCenter,
    legendOrientation: LegendOrientation.Horizontal,
    legendBorderThickness: 0,
  })
  model.legends.push(legend)

  const categoryAxis = new CategoryAxis({
    position: AxisPosition.Left,
    gapWidth: 0.01,
  })
  categoryAxis.labels.push('Category A', 'Category B', 'Category C', 'Category D')
  model.axes.push(categoryAxis)

  const valueAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    minimumPadding: 0.06,
    maximumPadding: 0.06,
    extraGridlines: [0.0],
    extraGridlineStyle: LineStyle.Solid,
    extraGridlineColor: OxyColors.Black,
    extraGridlineThickness: 1,
  })
  model.axes.push(valueAxis)

  const categoryA = 0
  const categoryB = 1
  const categoryC = 2
  const categoryD = 3

  // Stacked bars
  const series1 = new BarSeries({
    title: 'Series 1',
    isStacked: true,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
    stackGroup: '3',
  })
  series1.items.push(
    newBarItem({ value: 25 }),
    newBarItem({ value: 137 }),
    newBarItem({ value: 18 }),
    newBarItem({ value: 40 }),
  )
  model.series.push(series1)

  const series2 = new BarSeries({
    title: 'Series 2',
    isStacked: true,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
    stackGroup: '3',
  })
  series2.items.push(
    newBarItem({ value: -12 }),
    newBarItem({ value: -14 }),
    newBarItem({ value: -120 }),
    newBarItem({ value: -26 }),
  )
  model.series.push(series2)

  // Hidden stacked bars
  const series3 = new BarSeries({
    title: 'Series 3',
    isStacked: true,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
    stackGroup: '5',
    isVisible: false,
  })
  series3.items.push(
    newBarItem({ value: 21 }),
    newBarItem({ value: 8 }),
    newBarItem({ value: 48 }),
    newBarItem({ value: 3 }),
  )
  model.series.push(series3)

  const series4 = new BarSeries({
    title: 'Series 4',
    isStacked: true,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
    stackGroup: '5',
    labelStringFormatter: BarSeriesLabelStringFormatter,
    labelPlacement: LabelPlacement.Middle,
  })
  series4.items.push(
    newBarItem({ value: -8, categoryIndex: categoryA }),
    newBarItem({ value: -8, categoryIndex: categoryA }),
    newBarItem({ value: -8, categoryIndex: categoryA }),
    newBarItem({ value: -21, categoryIndex: categoryB }),
    newBarItem({ value: -3, categoryIndex: categoryC }),
    newBarItem({ value: -48, categoryIndex: categoryD }),
    newBarItem({ value: 8, categoryIndex: categoryA }),
    newBarItem({ value: 21, categoryIndex: categoryB }),
    newBarItem({ value: 3, categoryIndex: categoryC }),
    newBarItem({ value: 48, categoryIndex: categoryD }),
  )
  model.series.push(series4)
  // Non-stacked bars
  const series5 = new BarSeries({
    title: 'Series 5',
    isStacked: false,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  series5.items.push(
    newBarItem({ value: 17, categoryIndex: categoryA }),
    newBarItem({ value: 179, categoryIndex: categoryB }),
    newBarItem({ value: 45, categoryIndex: categoryC }),
    newBarItem({ value: 65, categoryIndex: categoryD }),
    newBarItem({ value: 97, categoryIndex: categoryA }),
    newBarItem({ value: 21, categoryIndex: categoryD }),
  )
  model.series.push(series5)

  // Bars with labels
  const series6 = new BarSeries({
    title: 'Series 6',
    isStacked: false,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
    labelStringFormatter: BarSeriesLabelStringFormatter,
    labelPlacement: LabelPlacement.Base,
  })
  series6.items.push(
    newBarItem({ value: 7 }),
    newBarItem({ value: 54 }),
    newBarItem({ value: 68 }),
    newBarItem({ value: 12 }),
  )
  model.series.push(series6)

  // Overlapping bars
  const series7 = new BarSeries({
    title: 'Series 7',
    isStacked: true,
    overlapsStack: true,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
    labelStringFormatter: BarSeriesLabelStringFormatter,
    labelPlacement: LabelPlacement.Base,
    stackGroup: '3',
    barWidth: 0.5,
  })
  series7.items.push(
    newBarItem({ value: 10 }),
    newBarItem({ value: 80 }),
    newBarItem({ value: 100, categoryIndex: categoryD }),
  )
  model.series.push(series7)

  return model
}

// =======================================
const BarSeriesLabelStringFormatter: LabelStringFormatterType = (item) => item.value.toString()

interface Item {
  label: string
  value1: number
  value2: number
  value3: number
}

function createGapWidthModel(gapWidth: number, title: string): PlotModel {
  const model = createSimpleModel(false, title)
  ;(model.axes[0] as CategoryAxis).gapWidth = gapWidth
  return model
}

function createSimpleModel(stacked: boolean, title: string): PlotModel {
  const model = new PlotModel({ title })

  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.BottomCenter,
    legendOrientation: LegendOrientation.Horizontal,
    legendBorderThickness: 0,
  })

  model.legends.push(l)

  const s1 = new BarSeries({
    title: 'Series 1',
    isStacked: stacked,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s1.items.push(newBarItem(25))
  s1.items.push(newBarItem(137))
  s1.items.push(newBarItem(18))
  s1.items.push(newBarItem(40))

  const s2 = new BarSeries({
    title: 'Series 2',
    isStacked: stacked,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s2.items.push(newBarItem(12))
  s2.items.push(newBarItem(14))
  s2.items.push(newBarItem(120))
  s2.items.push(newBarItem(26))

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left })
  categoryAxis.labels.push('Category A', 'Category B', 'Category C', 'Category D')

  const valueAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    minimumPadding: 0,
    maximumPadding: 0.06,
    absoluteMinimum: 0,
  })

  model.series.push(s1, s2)
  model.axes.push(categoryAxis, valueAxis)

  return model
}

function createModelWithNegativeValues(stacked: boolean, title: string): PlotModel {
  const model = new PlotModel({ title })

  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.BottomCenter,
    legendOrientation: LegendOrientation.Horizontal,
    legendBorderThickness: 0,
  })

  model.legends.push(l)

  const s1 = new BarSeries({
    title: 'Series 1',
    isStacked: stacked,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s1.items.push(newBarItem(25))
  s1.items.push(newBarItem(137))
  s1.items.push(newBarItem(18))
  s1.items.push(newBarItem(40))

  const s2 = new BarSeries({
    title: 'Series 2',
    isStacked: stacked,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s2.items.push(newBarItem(-12))
  s2.items.push(newBarItem(-14))
  s2.items.push(newBarItem(-120))
  s2.items.push(newBarItem(-26))

  const s3 = new BarSeries({
    title: 'Series 3',
    isStacked: stacked,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s3.items.push(newBarItem(21))
  s3.items.push(newBarItem(8))
  s3.items.push(newBarItem(48))
  s3.items.push(newBarItem(3))

  const s4 = new BarSeries({
    title: 'Series 4',
    isStacked: stacked,
    strokeColor: OxyColors.Black,
    strokeThickness: 1,
  })
  s4.items.push(newBarItem(-8))
  s4.items.push(newBarItem(-21))
  s4.items.push(newBarItem(-3))
  s4.items.push(newBarItem(-48))

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left })
  categoryAxis.labels.push('Category A', 'Category B', 'Category C', 'Category D')

  const valueAxis = new LinearAxis({
    position: AxisPosition.Bottom,
    minimumPadding: 0.06,
    maximumPadding: 0.06,
    extraGridlines: [0],
    extraGridlineStyle: LineStyle.Solid,
    extraGridlineColor: OxyColors.Black,
    extraGridlineThickness: 1,
  })

  model.series.push(s1, s2, s3, s4)
  model.axes.push(categoryAxis, valueAxis)

  return model
}

export interface HistogramBin {
  label: string
  value: number
}

function createHistogram(n: number, binCount: number): PlotModel {
  const bins: HistogramBin[] = []

  for (let i = 0; i < binCount; i++) {
    bins.push({
      label: i.toString(),
      value: 0,
    })
  }

  const r = new Random()
  for (let i = 0; i < n; i++) {
    const value = r.next(0, binCount - 1)
    bins[value].value++
  }

  const temp = new PlotModel()
  temp.title = `Histogram (bins=${binCount}, n=${n})`
  temp.subtitle = 'Pseudorandom numbers'
  const series1 = new BarSeries()

  series1.itemsSource = bins
  series1.valueField = 'value'
  if (binCount < 100) {
    series1.labelStringFormatter = (item, trackerParameters) => trackerParameters[0].toString()
  }

  temp.series.push(series1)

  temp.axes.push(
    new CategoryAxis({
      position: AxisPosition.Left,
      itemsSource: bins,
      labelField: 'label',
      gapWidth: 0,
    }),
  )
  temp.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimumPadding: 0,
      maximumPadding: 0.1,
      absoluteMinimum: 0,
    }),
  )

  return temp
}

function createNormalDistributionHistogram(n: number, binCount: number): PlotModel {
  const bins: HistogramBin[] = []
  const min = -10
  const max = 10
  for (let i = 0; i < binCount; i++) {
    const v = min + ((max - min) * i) / (bins.length - 1)
    bins.push({
      label: v.toFixed(1),
      value: 0,
    })
  }

  const r = new Random(31)
  for (let i = 0; i < n; i++) {
    const u1 = r.next()
    const u2 = r.next()
    const v = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

    const bin = Math.round(((v - min) / (max - min)) * (bins.length - 1))
    if (bin >= 0 && bin < bins.length) {
      bins[bin].value++
    }
  }

  const temp = new PlotModel()
  temp.title = `Histogram (bins=${binCount}, n=${n})`
  temp.subtitle = 'Standard normal distribution by Box-Muller transform'
  const series1 = new BarSeries()
  series1.itemsSource = bins
  series1.valueField = 'value'
  temp.series.push(series1)

  const categoryAxis = new CategoryAxis({ position: AxisPosition.Left, gapWidth: 0 })
  categoryAxis.labels.push(...bins.map((b) => b.label))
  categoryAxis.isAxisVisible = false
  temp.axes.push(categoryAxis)

  temp.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: min, maximum: max }))
  temp.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimumPadding: 0, absoluteMinimum: 0 }))

  return temp
}

const category = 'BarSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'With labels',
      example: {
        model: withLabels,
      },
    },
    {
      title: 'With labels (at an angle)',
      example: {
        model: withLabelsAtAnAngle,
      },
    },
    {
      title: 'Stacked',
      example: {
        model: stackedSeries,
      },
    },
    {
      title: 'Multiple Value Axes',
      example: {
        model: multipleValueAxes,
      },
    },
    {
      title: 'Stacked, Multiple Value Axes',
      example: {
        model: stackedMultipleValueAxes,
      },
    },
    {
      title: 'Multiple Category Axes',
      example: {
        model: multipleCategoryAxes,
      },
    },
    {
      title: 'Stacked, Multiple Category Axes',
      example: {
        model: stackedMultipleCategoryAxes,
      },
    },
    {
      title: 'Empty series',
      example: {
        model: emptySeries,
      },
    },
    {
      title: 'No category axis defined',
      example: {
        model: noCategoryAxisDefined,
      },
    },
    {
      title: 'Binding to ItemsSource',
      example: {
        model: bindingItemsSource,
      },
    },
    {
      title: 'Binding to ItemsSource (array)',
      example: {
        model: bindingToItemsSourceArray,
      },
    },
    {
      title: 'Binding to ItemsSource (list)',
      example: {
        model: bindingToItemsSourceListT,
      },
    },
    {
      title: 'Binding to ItemsSource (reflection)',
      example: {
        model: bindingToItemsSourceReflection,
      },
    },
    {
      title: 'Defined by Items',
      example: {
        model: definedByItems,
      },
    },
    {
      title: 'Empty category axis',
      example: {
        model: emptyCategoryAxis,
      },
    },
    {
      title: 'With negative values',
      example: {
        model: withNegativeValue,
      },
    },
    {
      title: 'Stacked with negative values',
      example: {
        model: stackedWithNegativeValue,
      },
    },
    {
      title: 'Mixed with LineSeries',
      example: {
        model: mixedWithLineSeries,
      },
    },
    {
      title: 'No axes defined',
      example: {
        model: noAxes,
      },
    },
    {
      title: 'Stacked and no axes defined',
      example: {
        model: stackedNoAxes,
      },
    },
    {
      title: 'Logarithmic axis (Base Value)',
      example: {
        model: logAxisBaseValue,
      },
    },
    {
      title: 'Logarithmic axis (Base Line)',
      example: {
        model: logAxisBaseLine,
      },
    },
    {
      title: 'Logarithmic axis (not stacked)',
      example: {
        model: logAxisNotStacked,
      },
    },
    {
      title: 'Logarithmic axis (stacked series)',
      example: {
        model: logAxisStacked,
      },
    },
    {
      title: 'Histogram (bins=5)',
      example: {
        model: histogram3,
      },
    },
    {
      title: 'Histogram (bins=20)',
      example: {
        model: histogram20,
      },
    },
    {
      title: 'Histogram (bins=200)',
      example: {
        model: histogram200,
      },
    },
    {
      title: 'Histogram (standard normal distribution)',
      example: {
        model: histogramStandardNormalDistribution,
      },
    },
    {
      title: 'Different colors within the same series',
      example: {
        model: differentColors,
      },
    },
    {
      title: 'Different stacking groups',
      example: {
        model: stackingGroups,
      },
    },
    {
      title: 'Different widths',
      example: {
        model: differentWidths,
      },
    },
    {
      title: 'Different widths (stacked)',
      example: {
        model: differentWidthsStacked,
      },
    },
    {
      title: 'Invalid values',
      example: {
        model: invalidValues,
      },
    },
    {
      title: 'Missing values',
      example: {
        model: missingValues,
      },
    },
    {
      title: 'CategoryIndex',
      example: {
        model: categoryIndex,
      },
    },
    {
      title: 'CategoryIndex (stacked)',
      example: {
        model: categoryIndexStacked,
      },
    },
    {
      title: 'BaseValue',
      example: {
        model: baseValue,
      },
    },
    {
      title: 'BaseValue (stacked)',
      example: {
        model: baseValueStacked,
      },
    },
    {
      title: 'BaseValue (overlaping)',
      example: {
        model: baseValueOverlaping,
      },
    },
    {
      title: 'BaseValue (labels)',
      example: {
        model: baseValueLabels,
      },
    },
    {
      title: 'Stacked (labels)',
      example: {
        model: stackedLabels,
      },
    },
    {
      title: 'GapWidth 0%',
      example: {
        model: gapWidth0,
      },
    },
    {
      title: 'GapWidth 100% (default)',
      example: {
        model: gapWidth100,
      },
    },
    {
      title: 'GapWidth 200%',
      example: {
        model: gapWidth200,
      },
    },
    {
      title: 'All in one',
      example: {
        model: allInOne,
      },
    },
  ],
} as ExampleCategory
