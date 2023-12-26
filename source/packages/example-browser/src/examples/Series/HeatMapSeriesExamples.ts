import {
  ArrayBuilder,
  AxisPosition,
  CategoryAxis,
  ContourSeries,
  HeatMapCoordinateDefinition,
  HeatMapRenderMethod,
  HeatMapSeries,
  LinearAxis,
  LinearColorAxis,
  LogarithmicAxis,
  OxyColors,
  OxyPalette,
  OxyPalettes,
  PlotModel,
  PlotType,
  TwoDimensionalArray,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/**
 * Peaks
 */
function peaks(): PlotModel {
  return _createHeatMapPeaks()
}

function interpolated(): PlotModel {
  return _createExample('Interpolated', true)
}

function interpolatedCartesian(): PlotModel {
  const model = _createExample('Interpolated, cartesian axes', true)
  model.plotType = PlotType.Cartesian
  return model
}

function interpolatedWithNanValue(): PlotModel {
  const model = _createExample('Interpolated including two NaN values', true)
  const hms = model.series[0] as HeatMapSeries
  hms.data![0][1] = Number.NaN
  hms.data![1][0] = Number.NaN
  return model
}

function interpolatedWithNanValueFlat(): PlotModel {
  const model = _createExample('Interpolated including two NaN values, otherwise 4.71', true)
  const hms = model.series[0] as HeatMapSeries
  const data = hms.data!

  const datum = 4.71
  data[0][0] = datum
  data[0][1] = datum
  data[0][2] = datum
  data[1][0] = datum
  data[1][1] = datum
  data[1][2] = datum

  data[0][1] = Number.NaN
  data[1][0] = Number.NaN
  return model
}

function notInterpolated(): PlotModel {
  return _createExample('Not interpolated values', false)
}

function notInterpolatedWithNanValue(): PlotModel {
  const model = _createExample('Not interpolated values including two NaN values', false)
  const ca = model.axes[0] as LinearColorAxis
  ca.invalidNumberColor = OxyColors.Transparent
  const hms = model.series[0] as HeatMapSeries
  hms.data![0][1] = Number.NaN
  hms.data![1][0] = Number.NaN
  return model
}

function notInterpolatedWithNanValueFlat(): PlotModel {
  const model = _createExample('Not interpolated values including two NaN values, otherwise 4.71', false)

  const ca = model.axes[0] as LinearColorAxis
  ca.invalidNumberColor = OxyColors.Transparent
  const hms = model.series[0] as HeatMapSeries
  if (!hms.data) return model

  const datum = 4.71
  hms.data[0][0] = datum
  hms.data[0][1] = datum
  hms.data[0][2] = datum
  hms.data[1][0] = datum
  hms.data[1][1] = datum
  hms.data[1][2] = datum

  hms.data[0][1] = Number.NaN
  hms.data[1][0] = Number.NaN
  return model
}

function notInterpolatedReversedX(): PlotModel {
  const model = _createExample('Reversed x-axis', false)
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, startPosition: 1, endPosition: 0 }))
  return model
}

function x0GreaterThanX1(): PlotModel {
  const model = _createExample('X0>X1', false)
  const hms = model.series[0] as HeatMapSeries
  const tmp = hms.x0
  hms.x0 = hms.x1
  hms.x1 = tmp
  return model
}

function reversedX_X0GreaterThanX1(): PlotModel {
  const model = _createExample('Reversed x-axis, X0>X1', false)
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, startPosition: 1, endPosition: 0 }))
  const hms = model.series[0] as HeatMapSeries
  const tmp = hms.x0
  hms.x0 = hms.x1
  hms.x1 = tmp
  return model
}

function notInterpolatedReversedY(): PlotModel {
  const model = _createExample('Reversed y-axis', false)
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, startPosition: 1, endPosition: 0 }))
  return model
}

function y0GreaterThanY1(): PlotModel {
  const model = _createExample('Y0>Y1', false)
  const hms = model.series[0] as HeatMapSeries
  const tmp = hms.y0
  hms.y0 = hms.y1
  hms.y1 = tmp
  return model
}

function reversedY_Y0GreaterThanY1(): PlotModel {
  const model = _createExample('Reversed y-axis, Y0>Y1', false)
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, startPosition: 1, endPosition: 0 }))
  const hms = model.series[0] as HeatMapSeries
  const tmp = hms.y0
  hms.y0 = hms.y1
  hms.y1 = tmp
  return model
}

function notInterpolatedReversedXY(): PlotModel {
  const model = _createExample('Reversed x- and y-axis', false)
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, startPosition: 1, endPosition: 0 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, startPosition: 1, endPosition: 0 }))
  return model
}

function diagonal(): PlotModel {
  const data = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]
  const model = new PlotModel({ title: 'Diagonal (center defined)' })
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.jet(500),
      highColor: OxyColors.Gray,
      lowColor: OxyColors.Black,
    }),
  )
  const hms = new HeatMapSeries({
    coordinateDefinition: HeatMapCoordinateDefinition.Center,
    x0: 0.5,
    x1: 2.5,
    y0: 2.5,
    y1: 0.5,
    data: data,
    interpolate: false,
  })
  model.series.push(hms)
  return model
}

function diagonal2(): PlotModel {
  const data = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]
  const model = new PlotModel({ title: 'Diagonal (edge defined)' })
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.jet(500),
      highColor: OxyColors.Gray,
      lowColor: OxyColors.Black,
    }),
  )
  const hms = new HeatMapSeries({
    coordinateDefinition: HeatMapCoordinateDefinition.Edge,
    x0: 0,
    x1: 3,
    y0: 3,
    y1: 0,
    data: data,
    interpolate: false,
  })
  model.series.push(hms)
  return model
}

function diagonal_6X6(): PlotModel {
  const data: number[][] = Array(6).fill(Array(6).fill(0))
  data[0][0] = 1
  data[1][1] = 1
  data[2][2] = 1
  data[3][3] = 1
  data[4][4] = 1
  data[5][5] = 1

  const model = new PlotModel({ title: 'Diagonal 6×6' })
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.jet(500),
      highColor: OxyColors.Gray,
      lowColor: OxyColors.Black,
    }),
  )

  // note: the coordinates are specifying the centers of the edge cells
  const hms = new HeatMapSeries({ x0: 0, x1: 5, y0: 5, y1: 0, data: data, interpolate: false })
  model.series.push(hms)
  return model
}

function confusionMatrix(): PlotModel {
  // Example provided by Pau Climent Pérez
  // See also http://en.wikipedia.org/wiki/Confusion_matrix
  let data: number[][] = [
    [1, 0, 0],
    [0, 0.8, 0.2],
    [0, 0, 1],
  ]

  // I guess this is where the confusion comes from?
  data = data[0].map((_, i) => data.map((row) => row[i]))

  const cat1 = ['class A', 'class B', 'class C']

  const model = new PlotModel({ title: 'Confusion Matrix' })

  const palette = OxyPalette.interpolate(50, OxyColors.White, OxyColors.Black)

  const lca = new LinearColorAxis({
    position: AxisPosition.Right,
    palette: palette,
    highColor: OxyColors.White,
    lowColor: OxyColors.White,
  })
  model.axes.push(lca)

  const axis1 = new CategoryAxis({ position: AxisPosition.Top, title: 'Actual class' })
  axis1.labels.push(...cat1)
  model.axes.push(axis1)

  // We invert this axis, so that they look "symmetrical"
  const axis2 = new CategoryAxis({
    position: AxisPosition.Left,
    title: 'Predicted class',
    angle: -90,
    startPosition: 1,
    endPosition: 0,
  })
  axis2.labels.push(...cat1)
  model.axes.push(axis2)

  const hms = new HeatMapSeries({
    data: data,
    interpolate: false,
    labelFontSize: 0.25,
    x0: 0,
    x1: data[0].length - 1,
    y0: 0,
    y1: data.length - 1,
  })

  model.series.push(hms)
  return model
}

function logXInterpolated(): PlotModel {
  const data: number[][] = Array(11)
    .fill(0)
    .map(() => Array(21).fill(0))

  const k = Math.pow(2, 0.1)

  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 21; j++) {
      data[i][j] = (Math.pow(k, i) * j) / 40.0
    }
  }

  const model = new PlotModel({ title: 'Logarithmic X, interpolated' })
  model.axes.push(new LogarithmicAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.gray(500),
      highColor: OxyColors.White,
      lowColor: OxyColors.Black,
    }),
  )

  const hms = new HeatMapSeries({ x0: 1.0, x1: 2.0, y0: 0, y1: 20, data: data, interpolate: true })

  model.series.push(hms)
  return model
}

function logXNotInterpolated(): PlotModel {
  const data: number[][] = Array(11)
    .fill(0)
    .map(() => Array(21).fill(0))

  const k = Math.pow(2, 0.1)

  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 21; j++) {
      data[i][j] = (Math.pow(k, i) * j) / 40.0
    }
  }

  const model = new PlotModel({ title: 'Logarithmic X, discrete rectangles' })
  model.axes.push(new LogarithmicAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.gray(500),
      highColor: OxyColors.White,
      lowColor: OxyColors.Black,
    }),
  )

  const hms = new HeatMapSeries({
    x0: 1.0,
    x1: 2.0,
    y0: 0,
    y1: 20,
    data: data,
    interpolate: false,
    renderMethod: HeatMapRenderMethod.Rectangles,
    labelFontSize: 0.4,
  })

  model.series.push(hms)
  return model
}

function normal_6X4(): PlotModel {
  return _create6X4('Normal 6×4 Heatmap')
}

// ==============================

function _createHeatMapPeaks(palette?: OxyPalette, includeContours: boolean = true, n: number = 100): PlotModel {
  const x0 = -3.1
  const x1 = 3.1
  const y0 = -3
  const y1 = 3
  const peaks = (x: number, y: number): number =>
    3 * (1 - x) * (1 - x) * Math.exp(-(x * x) - (y + 1) * (y + 1)) -
    10 * (x / 5 - x * x * x - y * y * y * y * y) * Math.exp(-x * x - y * y) -
    (1.0 / 3) * Math.exp(-(x + 1) * (x + 1) - y * y)
  const xvalues = ArrayBuilder.createVector(x0, x1, n)
  const yvalues = ArrayBuilder.createVector(y0, y1, n)
  const peaksData = ArrayBuilder.evaluate(peaks, xvalues, yvalues)

  const model = new PlotModel({ title: 'Peaks' })
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: palette ?? OxyPalettes.jet(500),
      highColor: OxyColors.Gray,
      lowColor: OxyColors.Black,
    }),
  )

  const hms = new HeatMapSeries({ x0: x0, x1: x1, y0: y0, y1: y1, data: peaksData })
  model.series.push(hms)

  if (includeContours) {
    const cs = new ContourSeries({
      color: OxyColors.Black,
      fontSize: 0,
      contourLevelStep: 1,
      labelBackground: OxyColors.Undefined,
      columnCoordinates: yvalues,
      rowCoordinates: xvalues,
      data: peaksData,
    })
    model.series.push(cs)
  }

  return model
}

function _create6X4(title: string): PlotModel {
  const data = new TwoDimensionalArray<number>(6, 4)
  for (let i = 1; i <= 6; i++) {
    for (let j = 1; j <= 4; j++) {
      data.set(i - 1, j - 1, i * j)
    }
  }

  const model = new PlotModel({ title: title, subtitle: 'Note the positions of the axes' })
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.jet(500),
      highColor: OxyColors.White,
      lowColor: OxyColors.Black,
    }),
  )
  model.series.push(
    new HeatMapSeries({
      x0: 1,
      x1: 6,
      y0: 1,
      y1: 4,
      data: data.toArray(),
      interpolate: true,
      labelFontSize: 0.2,
    }),
  )
  return model
}

function _createExample(title: string, interpolate: boolean): PlotModel {
  const data: number[][] = [
    [0, 0.2, 0.4],
    [0.1, 0.3, 0.2],
  ]

  const model = new PlotModel({ title: 'HeatMapSeries', subtitle: title })
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.rainbow(500),
      highColor: OxyColors.Gray,
      lowColor: OxyColors.Black,
    }),
  )

  // adding half cellwidth/cellheight to bounding box coordinates
  const hms = new HeatMapSeries({
    coordinateDefinition: HeatMapCoordinateDefinition.Center,
    x0: 0.5,
    x1: 1.5,
    y0: 0.5,
    y1: 2.5,
    data: data,
    interpolate: interpolate,
    labelFontSize: 0.2,
  })

  model.series.push(hms)
  return model
}

export const HeatMapSeriesExamples = {
  createPeaks: _createHeatMapPeaks,
}

const category = 'HeatMapSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Peaks',
      example: {
        model: peaks,
      },
    },
    {
      title: '2×3, interpolated',
      example: {
        model: interpolated,
      },
    },
    {
      title: '2×3, interpolated, cartesian axes',
      example: {
        model: interpolatedCartesian,
      },
    },
    {
      title: '2×3, interpolated with two NaN values',
      example: {
        model: interpolatedWithNanValue,
      },
    },
    {
      title: '2×3, interpolated with two NaN values, flat data',
      example: {
        model: interpolatedWithNanValueFlat,
      },
    },
    {
      title: '2×3, not interpolated',
      example: {
        model: notInterpolated,
      },
    },
    {
      title: '2×3, not interpolated with two NaN values',
      example: {
        model: notInterpolatedWithNanValue,
      },
    },
    {
      title: '2×3, not interpolated with two NaN values, flat data',
      example: {
        model: notInterpolatedWithNanValueFlat,
      },
    },
    {
      title: '2×3, reversed x-axis',
      example: {
        model: notInterpolatedReversedX,
      },
    },
    {
      title: '2×3, X0>X1',
      example: {
        model: x0GreaterThanX1,
      },
    },
    {
      title: '2×3, reversed x-axis, X0>X1',
      example: {
        model: reversedX_X0GreaterThanX1,
      },
    },
    {
      title: '2×3, reversed y-axis',
      example: {
        model: notInterpolatedReversedY,
      },
    },
    {
      title: '2×3, Y0>Y1',
      example: {
        model: y0GreaterThanY1,
      },
    },
    {
      title: '2×3, reversed y-axis, Y0>Y1',
      example: {
        model: reversedY_Y0GreaterThanY1,
      },
    },
    {
      title: '2x3, reversed x- and y-axis',
      example: {
        model: notInterpolatedReversedXY,
      },
    },
    {
      title: '3×3, diagonal (center defined)',
      example: {
        model: diagonal,
      },
    },
    {
      title: '3×3, diagonal (edge defined)',
      example: {
        model: diagonal2,
      },
    },
    {
      title: '6×6, diagonal',
      example: {
        model: diagonal_6X6,
      },
    },
    {
      title: 'Confusion matrix',
      example: {
        model: confusionMatrix,
      },
    },
    {
      title: 'Logarithmic X, interpolated',
      example: {
        model: logXInterpolated,
      },
    },
    {
      title: 'Logarithmic X, discrete rectangles',
      example: {
        model: logXNotInterpolated,
      },
    },
    {
      title: '6×4, not transposed',
      example: {
        model: normal_6X4,
      },
    },
  ],
} as ExampleCategory
