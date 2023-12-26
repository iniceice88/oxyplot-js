import {
  AxisPosition,
  BinningExtremeValueMode,
  BinningIntervalType,
  BinningOptions,
  BinningOutlierMode,
  HistogramHelpers,
  HistogramItem,
  HistogramSeries,
  LabelPlacement,
  LinearAxis,
  LogarithmicAxis,
  OxyColors,
  PlotModel,
  PlotModelUtilities,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { Random } from '../Random'

/** Exponential Distribution */
function exponentialDistribution(): PlotModel {
  return createExponentialDistribution()
}

/** Exponential Distribution (logarithmic) */
function exponentialDistributionLogarithmicAxis(): PlotModel {
  return createExponentialDistribution(true)
}

/** Exponential Distribution (logarithmic,with BaseValue) */
function exponentialDistributionLogarithmicAxisWithBaseValue(): PlotModel {
  return createExponentialDistribution(true, 1, 10000, 0.1)
}

/** Label Placement */
function histogramLabelPlacement(): PlotModel {
  const model = new PlotModel({ title: 'Label Placement' })

  const s1 = new HistogramSeries({
    labelPlacement: LabelPlacement.Base,
    labelStringFormatter: (item) => 'Base',
    strokeThickness: 1,
    labelMargin: 5,
  })
  const s2 = new HistogramSeries({
    labelPlacement: LabelPlacement.Inside,
    labelStringFormatter: (item) => 'Inside',
    strokeThickness: 1,
    labelMargin: 5,
  })
  const s3 = new HistogramSeries({
    labelPlacement: LabelPlacement.Middle,
    labelStringFormatter: (item) => 'Middle',
    strokeThickness: 1,
    labelMargin: 5,
  })
  const s4 = new HistogramSeries({
    labelPlacement: LabelPlacement.Outside,
    labelStringFormatter: (item) => 'Outside',
    strokeThickness: 1,
    labelMargin: 5,
  })

  s1.items.push(new HistogramItem(1, 2, 4, 4))
  s1.items.push(new HistogramItem(2, 3, -4, 4))
  s2.items.push(new HistogramItem(3, 4, 2, 2))
  s2.items.push(new HistogramItem(4, 5, -2, 2))
  s3.items.push(new HistogramItem(5, 6, 3, 3))
  s3.items.push(new HistogramItem(6, 7, -3, 3))
  s4.items.push(new HistogramItem(7, 8, 1, 1))
  s4.items.push(new HistogramItem(8, 9, -1, -1))

  model.series.push(s1)
  model.series.push(s2)
  model.series.push(s3)
  model.series.push(s4)

  return model
}

/** Label Placement (reversed Y Axis) */
function labelPlacementReversed(): PlotModel {
  const model = histogramLabelPlacement()
  PlotModelUtilities.reverseYAxis(model)
  return model
}

/** Label Format String */
function labelFormatString(): PlotModel {
  const model = createDisconnectedBins()
  const hs = model.series[0] as HistogramSeries
  //hs.labelFormatString = 'Start: {1:0.00}\nEnd: {2:0.00}\nValue: {0:0.00}\nArea: {3:0.00}\nCount: {4}'
  hs.labelStringFormatter = (item) =>
    `Start: ${item.rangeStart.toFixed(2)}\nEnd: ${item.rangeEnd.toFixed(2)}\nValue: ${item.value.toFixed(
      2,
    )}\nArea: ${item.area.toFixed(2)}\nCount: ${item.count}`
  hs.labelPlacement = LabelPlacement.Inside
  return model
}

/** Custom Bins */
function customBins(): PlotModel {
  return createExponentialDistributionCustomBins()
}

/** Disconnected Bins */
function disconnectedBins(): PlotModel {
  return createDisconnectedBins()
}

/** Normal Distribution Three Colors */
function normalDistribution(): PlotModel {
  return createNormalDistribution()
}

/** Individual Bin Colors */
function individualBinColors(): PlotModel {
  return createIndividualBinColors()
}

/** Custom Item Mapping */
function customItemMapping(): PlotModel {
  const model = new PlotModel({ title: 'Custom Item Mapping' })

  const s = new HistogramSeries({
    mapping: (obj) => obj as HistogramItem,
    trackerStringFormatter: (args) => (args.item! as CustomHistogramItem).description,
  })
  s.items.push(new CustomHistogramItem(1, 2, 4, 4, 'Item 1'))
  s.items.push(new CustomHistogramItem(2, 3, -4, 4, 'Item 2'))
  s.items.push(new CustomHistogramItem(3, 4, 2, 2, 'Item 3'))
  s.items.push(new CustomHistogramItem(4, 5, -2, 2, 'Item 4'))
  model.series.push(s)

  return model
}

// ==================

class CustomHistogramItem extends HistogramItem {
  constructor(rangeStart: number, rangeEnd: number, area: number, count: number, public readonly description: string) {
    super(rangeStart, rangeEnd, area, count)
  }
}

/** Creates an Exponential Distribution */
function createExponentialDistribution(
  logarithmicYAxis: boolean = false,
  mean: number = 1,
  n: number = 10000,
  baseValue: number = 0,
): PlotModel {
  const model = new PlotModel({
    title: logarithmicYAxis ? 'Exponential Distribution (logarithmic)' : 'Exponential Distribution',
    subtitle: `Uniformly distributed bins (${n} samples)`,
  })
  model.axes.push(
    logarithmicYAxis
      ? new LogarithmicAxis({ position: AxisPosition.Left, title: 'Frequency' })
      : new LinearAxis({ position: AxisPosition.Left, title: 'Frequency' }),
  )
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'x' }))

  const rnd = new Random(1)

  const chs = new HistogramSeries()

  const binningOptions = new BinningOptions(
    BinningOutlierMode.CountOutliers,
    BinningIntervalType.InclusiveLowerBound,
    BinningExtremeValueMode.ExcludeExtremeValues,
  )
  const binBreaks = HistogramHelpers.createUniformBins(0, 5, 15)
  chs.items.push(...HistogramHelpers.collect(sampleExps(rnd, mean, n), binBreaks, binningOptions))
  chs.strokeThickness = 1
  chs.baseValue = baseValue
  chs.negativeFillColor = OxyColors.Red
  model.series.push(chs)

  return model
}

function createExponentialDistributionCustomBins(mean: number = 1, n: number = 50000): PlotModel {
  const model: PlotModel = new PlotModel({
    title: 'Exponential Distribution',
    subtitle: `Custom bins (${n} samples)`,
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, title: 'Frequency' }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'x' }))

  const rnd: Random = new Random(1)

  const chs: HistogramSeries = new HistogramSeries()

  const binningOptions: BinningOptions = new BinningOptions(
    BinningOutlierMode.CountOutliers,
    BinningIntervalType.InclusiveLowerBound,
    BinningExtremeValueMode.ExcludeExtremeValues,
  )
  chs.items.push(
    ...HistogramHelpers.collect(
      sampleExps(rnd, mean, n),
      [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 2.0, 3.0, 4.0, 5.0],
      binningOptions,
    ),
  )
  chs.strokeThickness = 1
  chs.fillColor = OxyColors.Purple
  model.series.push(chs)

  return model
}

function createNormalDistribution(mean: number = 0, std: number = 1, n: number = 1000000): PlotModel {
  const model = new PlotModel({
    title: `Normal Distribution (μ=${mean}, σ=${std})`,
    subtitle: `95% of the distribution (${n} samples)`,
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, title: 'Frequency' }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'x' }))

  const rnd = new Random(1)

  const chs = new HistogramSeries()
  const binningOptions = new BinningOptions(
    BinningOutlierMode.CountOutliers,
    BinningIntervalType.InclusiveLowerBound,
    BinningExtremeValueMode.ExcludeExtremeValues,
  )
  const binBreaks = HistogramHelpers.createUniformBins(-std * 4, std * 4, 100)
  chs.items.push(...HistogramHelpers.collect(sampleNormal(rnd, mean, std, n), binBreaks, binningOptions))
  chs.strokeThickness = 1

  const limitHi = mean + 1.96 * std
  const limitLo = mean - 1.96 * std
  const colorHi = OxyColors.DarkRed
  const colorLo = OxyColors.DarkRed

  chs.colorMapping = (item) => {
    if (item.rangeCenter > limitHi) {
      return colorHi
    } else if (item.rangeCenter < limitLo) {
      return colorLo
    }
    return chs.actualFillColor
  }

  model.series.push(chs)

  return model
}

function createDisconnectedBins(): PlotModel {
  const model = new PlotModel({ title: 'Disconnected Bins' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, title: 'Representation' }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'x' }))

  const chs = new HistogramSeries()
  chs.items.push(new HistogramItem(0, 0.5, 10, 7), new HistogramItem(0.75, 1.0, 10, 7))
  chs.labelStringFormatter = (x) => x.toFixed(2)
  //chs.labelFormatString = '{0:0.00}'
  chs.labelPlacement = LabelPlacement.Middle
  model.series.push(chs)

  return model
}

function createIndividualBinColors(mean: number = 1, n: number = 10000): PlotModel {
  const model = new PlotModel({ title: 'Individual Bin Colors', subtitle: 'Minimum is Red, Maximum is Green' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, title: 'Frequency' }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, title: 'Observation' }))

  const rnd = new Random(1)

  const chs = new HistogramSeries({ fillColor: OxyColors.Gray, renderInLegend: true, title: 'Measurements' })

  const binningOptions = new BinningOptions(
    BinningOutlierMode.CountOutliers,
    BinningIntervalType.InclusiveLowerBound,
    BinningExtremeValueMode.ExcludeExtremeValues,
  )
  const binBreaks = HistogramHelpers.createUniformBins(0, 10, 20)
  const bins = HistogramHelpers.collect(sampleUniform(rnd, 0, 10, 1000), binBreaks, binningOptions).sort(
    (a, b) => a.count - b.count,
  )
  bins[0].color = OxyColors.Red
  bins[bins.length - 1].color = OxyColors.Green
  chs.items.push(...bins)
  chs.strokeThickness = 1
  model.series.push(chs)

  return model
}

function sampleExps(rnd: Random, mean: number, count: number): number[] {
  const samples: number[] = []
  for (let i = 0; i < count; i++) {
    samples.push(sampleExp(rnd, mean))
  }
  return samples
}

function sampleExp(rnd: Random, mean: number): number {
  return Math.log(1.0 - rnd.next()) / -mean
}

function sampleNormal(rnd: Random, mean: number, std: number, count: number): number[] {
  const samples: number[] = []
  for (let i = 0; i < count; i++) {
    samples.push(sampleNormalSingle(rnd, mean, std))
  }
  return samples
}

function sampleNormalSingle(rnd: Random, mean: number, std: number): number {
  // http://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
  const u1 = 1.0 - rnd.next()
  const u2 = rnd.next()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * std + mean
}

function sampleUniform(rnd: Random, min: number, max: number, count: number): number[] {
  const samples: number[] = []
  for (let i = 0; i < count; i++) {
    samples.push(rnd.next() * (max - min) + min)
  }
  return samples
}

const category = 'HistogramSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Exponential Distribution',
      example: {
        model: exponentialDistribution,
      },
    },
    {
      title: 'Exponential Distribution (logarithmic)',
      example: {
        model: exponentialDistributionLogarithmicAxis,
      },
    },
    {
      title: 'Exponential Distribution (logarithmic,with BaseValue)',
      example: {
        model: exponentialDistributionLogarithmicAxisWithBaseValue,
      },
    },
    {
      title: 'Label Placement',
      example: {
        model: histogramLabelPlacement,
      },
    },
    {
      title: 'Label Placement (reversed Y Axis)',
      example: {
        model: labelPlacementReversed,
      },
    },
    {
      title: 'Label Format String',
      example: {
        model: labelFormatString,
      },
    },
    {
      title: 'Custom Bins',
      example: {
        model: customBins,
      },
    },
    {
      title: 'Disconnected Bins',
      example: {
        model: disconnectedBins,
      },
    },
    {
      title: 'Normal Distribution Three Colors',
      example: {
        model: normalDistribution,
      },
    },
    {
      title: 'Individual Bin Colors',
      example: {
        model: individualBinColors,
      },
    },
    {
      title: 'Custom Item Mapping',
      example: {
        model: customItemMapping,
      },
    },
  ],
} as ExampleCategory
