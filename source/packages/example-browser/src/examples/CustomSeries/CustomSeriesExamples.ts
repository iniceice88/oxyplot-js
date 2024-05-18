import {
  AngleAxis,
  AxisPosition,
  CategoryAxis,
  type CreateHeatMapSeriesOptions,
  HeatMapSeries,
  Legend,
  LegendPosition,
  LinearAxis,
  LinearColorAxis,
  MagnitudeAxis,
  newDataPoint,
  newOxyPalette,
  newOxyThickness,
  OxyColors,
  OxyPalettes,
  PlotModel,
  PlotType,
  TwoDimensionalArray,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { ErrorItem, ErrorSeries } from './ErrorSeries'
import { FlagSeries } from './FlagSeries'
import { LineSegmentSeries } from './LineSegmentSeries'
import { MatrixSeries } from './MatrixSeries'
import { PolarHeatMapSeries } from './PolarHeatMapSeries'
import { Random } from '../Random.ts'

function errorSeries(): PlotModel {
  const n = 20

  const model = new PlotModel({ title: 'ErrorSeries' })
  const l = new Legend({
    legendPosition: LegendPosition.BottomRight,
  })

  model.legends.push(l)

  const s1 = new ErrorSeries()
  s1.title = 'Measurements'
  const random = new Random().next()
  let x = 0
  let y = 0
  for (let i = 0; i < n; i++) {
    x += 2 + random * 10
    y += 1 + random
    const xe = 1 + random * 2
    const ye = 1 + random * 2
    s1.pointsList.push(new ErrorItem(x, y, xe, ye))
  }

  model.series.push(s1)
  return model
}

function lineSegmentSeries(): PlotModel {
  const model = new PlotModel({ title: 'LineSegmentSeries' })

  const lss1 = new LineSegmentSeries()
  lss1.title = 'The first series'

  // First segment
  lss1.points.push(newDataPoint(0, 3), newDataPoint(2, 3.2))

  // Second segment
  lss1.points.push(newDataPoint(2, 2.7), newDataPoint(7, 2.9))

  model.series.push(lss1)

  const lss2 = new LineSegmentSeries()
  lss2.title = 'The second series'

  // First segment
  lss2.points.push(newDataPoint(1, -3), newDataPoint(2, 10))

  // Second segment
  lss2.points.push(newDataPoint(0, 4.8), newDataPoint(7, 2.3))

  // A very short segment
  lss2.points.push(newDataPoint(6, 4), newDataPoint(6, 4 + 1e-8))

  model.series.push(lss2)

  return model
}

function flagSeries(): PlotModel {
  const model = new PlotModel({ title: 'FlagSeries' })

  const s1 = new FlagSeries()
  s1.title = 'Incidents'
  s1.color = OxyColors.Red
  s1.values.push(2, 3, 5, 7, 11, 13, 17, 19)

  model.series.push(s1)
  return model
}

function diagonalMatrix(): PlotModel {
  const model = new PlotModel()

  const matrix: number[][] = [
    [1, 0, 0],
    [0, 2, 0],
    [0, 0, 3],
    [5, 5, 5],
  ]

  // Reverse the vertical axis
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, startPosition: 1, endPosition: 0 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.series.push(new MatrixSeries({ matrix: matrix, showDiagonal: true }))

  return model
}

function polarHeatMap(): PlotModel {
  const model = new PlotModel({
    title: 'Polar heat map',
    plotMargins: newOxyThickness(40, 80, 40, 40),
    plotType: PlotType.Polar,
    plotAreaBorderThickness: newOxyThickness(0),
  })

  const matrix: number[][] = [
    [0, 2],
    [1.5, 0.2],
  ]

  model.axes.push(
    new AngleAxis({
      startAngle: 0,
      endAngle: 360,
      minimum: 0,
      maximum: 360,
      majorStep: 30,
      minorStep: 15,
    }),
  )
  model.axes.push(new MagnitudeAxis({ minimum: 0, maximum: 100, majorStep: 25, minorStep: 5 }))
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.rainbow(500),
      highColor: OxyColors.Gray,
      lowColor: OxyColors.Black,
    }),
  )
  model.series.push(
    new PolarHeatMapSeries({
      data: matrix,
      angle0: 30,
      angle1: 150,
      magnitude0: 0,
      magnitude1: 80,
      interpolate: false,
    }),
  )

  return model
}

function polarHeatMapReversedAngleAxis(): PlotModel {
  const model = polarHeatMap()

  model.axes[0] = new AngleAxis({
    startAngle: 360,
    endAngle: 0,
    minimum: 0,
    maximum: 360,
    majorStep: 30,
    minorStep: 15,
  })

  return model
}

function polarHeatMapRotatedCounterClockwise90(): PlotModel {
  const model = polarHeatMap()

  model.axes[0] = new AngleAxis({
    startAngle: 90,
    endAngle: 90 + 360,
    minimum: 0,
    maximum: 360,
    majorStep: 30,
    minorStep: 15,
  })

  return model
}

function polarHeatMapRotatedCounterClockwisePi(): PlotModel {
  const model = polarHeatMap()

  model.axes[0] = new AngleAxis({
    startAngle: Math.PI,
    endAngle: Math.PI + 360,
    minimum: 0,
    maximum: 360,
    majorStep: 30,
    minorStep: 15,
  })

  return model
}

function polarHeatMapInterpolated(): PlotModel {
  const model = polarHeatMap()
  model.title = 'Polar heat map (interpolated)'
  ;(model.series[0] as PolarHeatMapSeries).interpolate = true
  return model
}

function polarHeatMapFixed(): PlotModel {
  const model = polarHeatMap()
  model.title = 'Polar heat map with fixed size image'
  ;(model.series[0] as PolarHeatMapSeries).imageSize = 800
  return model
}

function polarHeatMapLinearAxes(): PlotModel {
  const model = new PlotModel({ title: 'Polar heat map on linear axes' })

  const matrix: number[][] = [
    [0, 2],
    [1.5, 0.2],
  ]

  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -100, maximum: 100 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: 0, maximum: 100 }))
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.rainbow(500),
      highColor: OxyColors.Gray,
      lowColor: OxyColors.Black,
    }),
  )
  model.series.push(
    new PolarHeatMapSeries({
      data: matrix,
      angle0: 30,
      angle1: 150,
      magnitude0: 0,
      magnitude1: 80,
      interpolate: true,
    }),
  )

  return model
}

function polarHeatMapLinearAxesFixed256(): PlotModel {
  const model = polarHeatMapLinearAxes()
  model.title = 'Polar heat map on linear axes & fixed size image (256x256)'
  ;(model.series[0] as PolarHeatMapSeries).imageSize = 256
  return model
}

function polarHeatMapLinearAxesFixed1000(): PlotModel {
  const model = polarHeatMapLinearAxes()
  model.title = 'Polar heat map on linear axes & fixed size image (1000x1000)'
  ;(model.series[0] as PolarHeatMapSeries).imageSize = 1000
  return model
}

function designStructureMatrix(): PlotModel {
  // See also http://en.wikipedia.org/wiki/Design_structure_matrix
  const data = new TwoDimensionalArray<number>(7, 7, 0)

  // indexing: data[column,row]
  data.set(1, 0, 1)
  data.set(5, 0, 1)
  data.set(3, 1, 1)
  data.set(0, 2, 1)
  data.set(6, 2, 1)
  data.set(4, 3, 1)
  data.set(1, 4, 1)
  data.set(5, 4, 1)
  data.set(2, 5, 1)
  data.set(0, 6, 1)
  data.set(4, 6, 1)

  for (let i = 0; i < 7; i++) {
    data.set(i, i, -1)
  }

  const model = new PlotModel({ title: 'Design structure matrix (DSM)' })
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.None,
      palette: newOxyPalette([OxyColors.White, OxyColors.LightGreen]),
      lowColor: OxyColors.Black,
      minimum: 0,
      isAxisVisible: false,
    }),
  )
  const topAxis = new CategoryAxis({
    position: AxisPosition.Top,
  })
  topAxis.labels.push(...['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  model.axes.push(topAxis)
  const leftAxis = new CategoryAxis({
    position: AxisPosition.Left,
    startPosition: 1,
    endPosition: 0,
  })
  leftAxis.labels.push(...['Element A', 'Element B', 'Element C', 'Element D', 'Element E', 'Element F', 'Element G'])
  model.axes.push(leftAxis)

  const hms = new DesignStructureMatrixSeries({
    data: data.toArray(),
    interpolate: false,
    labelStringFormatter: (item, args) => `${item || ''}`,
    labelFontSize: 0.25,
    x0: 0,
    x1: data.width - 1,
    y0: 0,
    y1: data.height - 1,
  })

  model.series.push(hms)
  return model
}

// =========================

class DesignStructureMatrixSeries extends HeatMapSeries {
  constructor(opt?: CreateHeatMapSeriesOptions) {
    super(opt)
  }

  protected getLabel(v: number, i: number, j: number): string {
    if (i === j) {
      return (this.xAxis as CategoryAxis).labels[i]
    }

    return super.getLabel(v, i, j)
  }
}

const category = 'Custom series'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'ErrorSeries',
      example: {
        model: errorSeries,
      },
    },
    {
      title: 'LineSegmentSeries',
      example: {
        model: lineSegmentSeries,
      },
    },
    {
      title: 'FlagSeries',
      example: {
        model: flagSeries,
      },
    },
    {
      title: 'MatrixSeries - diagonal matrix',
      example: {
        model: diagonalMatrix,
      },
    },
    {
      title: 'PolarHeatMap',
      example: {
        model: polarHeatMap,
      },
    },
    {
      title: 'PolarHeatMap Reversed Angle Axis',
      example: {
        model: polarHeatMapReversedAngleAxis,
      },
    },
    {
      title: 'PolarHeatMap Rotated CounterClockwise 90',
      example: {
        model: polarHeatMapRotatedCounterClockwise90,
      },
    },
    {
      title: 'PolarHeatMap Rotated CounterClockwise on PI degrees',
      example: {
        model: polarHeatMapRotatedCounterClockwisePi,
      },
    },
    {
      title: 'PolarHeatMap (interpolated)',
      example: {
        model: polarHeatMapInterpolated,
      },
    },
    {
      title: 'PolarHeatMap fixed size image',
      example: {
        model: polarHeatMapFixed,
      },
    },
    {
      title: 'PolarHeatMap on linear axes',
      example: {
        model: polarHeatMapLinearAxes,
      },
    },
    {
      title: 'PolarHeatMap linear axes, fixed size image (256x256)',
      example: {
        model: polarHeatMapLinearAxesFixed256,
      },
    },
    {
      title: 'PolarHeatMap linear axes, fixed size image (1000x1000)',
      example: {
        model: polarHeatMapLinearAxesFixed1000,
      },
    },
    {
      title: 'Design structure matrix (DSM)',
      example: {
        model: designStructureMatrix,
      },
    },
  ],
} as ExampleCategory
