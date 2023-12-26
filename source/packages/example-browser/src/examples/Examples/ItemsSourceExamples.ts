import { DataPoint, type IDataPointProvider, LineSeries, PlotModel, ScreenPoint } from 'oxyplot-js'
import type { ExampleCategory } from '../types'

const n = 100000

/**
 * Create a plot for the UsingIDataPoint function.
 * @returns A PlotModel representing the UsingIDataPoint function.
 */
function usingIDataPoint(): PlotModel {
  const points: DataPoint[] = []
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1)
    points.push(new DataPoint(x, y(x)))
  }

  const model = new PlotModel({ title: 'Using IDataPoint' })
  model.series.push(new LineSeries({ itemsSource: points }))
  return model
}

/**
 * Create a plot for the UsingIDataPointProvider function.
 * @returns A PlotModel representing the UsingIDataPointProvider function.
 */
function usingIDataPointProvider(): PlotModel {
  const points: PointType1[] = []
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1)
    points.push(new PointType1(x, y(x)))
  }

  const model = new PlotModel({ title: 'Items implementing IDataPointProvider' })
  model.series.push(new LineSeries({ itemsSource: points }))
  return model
}

/**
 * Create a plot for the UsingMappingProperty function.
 * @returns A PlotModel representing the UsingMappingProperty function.
 */
function usingMappingProperty(): PlotModel {
  const points: PointType2[] = []
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1)
    points.push(new PointType2(x, y(x)))
  }

  const model = new PlotModel({ title: 'Using Mapping property' })
  model.series.push(
    new LineSeries({
      itemsSource: points,
      mapping: (item) => new DataPoint(item.abscissa, item.ordinate),
    }),
  )
  return model
}

/**
 * Create a plot for the UsingReflection function.
 * @returns A PlotModel representing the UsingReflection function.
 */
function usingReflection(): PlotModel {
  const points: PointType2[] = []
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1)
    points.push(new PointType2(x, y(x)))
  }

  const model = new PlotModel({ title: 'Using reflection (slow)' })
  model.series.push(new LineSeries({ itemsSource: points, dataFieldX: 'abscissa', dataFieldY: 'ordinate' }))
  return model
}

// ==================
class PointType1 implements IDataPointProvider {
  constructor(private abscissa: number, private ordinate: number) {}

  getDataPoint(): DataPoint {
    return new DataPoint(this.abscissa, this.ordinate)
  }
}

class PointType2 {
  constructor(public abscissa: number, public ordinate: number) {}
}

class ItemType3 {
  readonly point: ScreenPoint

  constructor(x: number, y: number) {
    this.point = new ScreenPoint(x, y)
  }
}

/**
 * Evaluates a chaotic function.
 * @param x The x value.
 * @returns A y value.
 */
function y(x: number): number {
  // http://computing.dcu.ie/~humphrys/Notes/Neural/chaos.html
  return Math.sin(3 / x) * Math.sin(5 / (1 - x))
}

const category = 'ItemsSource'

export default {
  category,
  examples: [
    {
      title: 'List<DataPoint>',
      example: {
        model: usingIDataPoint,
      },
    },
    {
      title: 'Items implementing IDataPointProvider',
      example: {
        model: usingIDataPointProvider,
      },
    },
    {
      title: 'Mapping property',
      example: {
        model: usingMappingProperty,
      },
    },
    {
      title: 'Using reflection (slow)',
      example: {
        model: usingReflection,
      },
    },
  ],
} as ExampleCategory
