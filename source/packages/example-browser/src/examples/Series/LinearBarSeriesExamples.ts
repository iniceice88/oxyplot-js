import { AxisPosition, DataPoint, LinearAxis, LinearBarSeries, LogarithmicAxis, OxyColor, PlotModel } from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { Random } from '../Random'

/** LinearBarSeries with default style */
function defaultStyle(): PlotModel {
  const model = new PlotModel({ title: 'LinearBarSeries with default style' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  const linearBarSeries = _createExampleLinearBarSeries()
  linearBarSeries.title = 'LinearBarSeries'
  model.series.push(linearBarSeries)

  return model
}

/** LinearBarSeries with stroke */
function withStroke(): PlotModel {
  const model = new PlotModel({ title: 'LinearBarSeries with stroke' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  const linearBarSeries = _createExampleLinearBarSeries()
  linearBarSeries.title = 'LinearBarSeries'
  linearBarSeries.fillColor = OxyColor.parse('#454CAF50')
  linearBarSeries.strokeColor = OxyColor.parse('#4CAF50')
  linearBarSeries.strokeThickness = 1
  model.series.push(linearBarSeries)

  return model
}

function withNegativeColors(): PlotModel {
  return _createWithNegativeColors()
}

function withNegativeColorsLogarithmic(): PlotModel {
  return _createWithNegativeColors(true)
}

function withBaseValue(): PlotModel {
  return _createWithNegativeColors(undefined, 50)
}

function withBaseValueLogarithmic(): PlotModel {
  return _createWithNegativeColors(true, 50)
}

// ===================

function _createWithNegativeColors(logarithmic: boolean = false, baseValue: number = 0): PlotModel {
  const model = new PlotModel({
    title: logarithmic ? 'LinearBarSeries with stroke (logarithmic)' : 'LinearBarSeries with stroke',
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(
    logarithmic
      ? new LogarithmicAxis({ position: AxisPosition.Left })
      : new LinearAxis({ position: AxisPosition.Left }),
  )
  const linearBarSeries = _createExampleLinearBarSeriesWithNegativeValues()
  linearBarSeries.title = 'LinearBarSeries'
  linearBarSeries.fillColor = OxyColor.parse('#454CAF50')
  linearBarSeries.strokeColor = OxyColor.parse('#4CAF50')
  linearBarSeries.negativeFillColor = OxyColor.parse('#45BF360C')
  linearBarSeries.negativeStrokeColor = OxyColor.parse('#BF360C')
  linearBarSeries.strokeThickness = 1
  linearBarSeries.baseValue = baseValue
  model.series.push(linearBarSeries)

  return model
}

/**
 * Creates an example linear bar series.
 * @returns A linear bar series containing random points.
 */
function _createExampleLinearBarSeries(): LinearBarSeries {
  const linearBarSeries = new LinearBarSeries()
  const r = new Random()
  let y = r.next(10, 31)
  for (let x = 0; x <= 50; x++) {
    linearBarSeries.points.push(new DataPoint(x, y))
    y += r.next(-5, 5)
  }
  return linearBarSeries
}

/**
 * Creates an example linear bar series with negative values.
 * @returns A linear bar series containing random points.
 */
function _createExampleLinearBarSeriesWithNegativeValues(): LinearBarSeries {
  const linearBarSeries = new LinearBarSeries()
  const r = new Random()
  for (let x = 0; x <= 50; x++) {
    const y = -200 + r.next(0, 1000)
    linearBarSeries.points.push(new DataPoint(x, y))
  }
  return linearBarSeries
}

const category = 'LinearBarSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Default style',
      example: {
        model: defaultStyle,
      },
    },
    {
      title: 'With stroke',
      example: {
        model: withStroke,
      },
    },
    {
      title: 'With negative colors',
      example: {
        model: withNegativeColors,
      },
    },
    {
      title: 'With negative colors (logaritmic)',
      example: {
        model: withNegativeColorsLogarithmic,
      },
    },
    {
      title: 'With BaseValue',
      example: {
        model: withBaseValue,
      },
    },
    {
      title: 'With BaseValue (Logarithmic)',
      example: {
        model: withBaseValueLogarithmic,
      },
    },
  ],
} as ExampleCategory
