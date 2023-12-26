import {
  ArrayBuilder,
  AxisPosition,
  ContourSeries,
  LinearAxis,
  LogarithmicAxis,
  OxyColors,
  PlotModel,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

const peaks = (x: number, y: number): number =>
  3 * (1 - x) * (1 - x) * Math.exp(-(x * x) - (y + 1) * (y + 1)) -
  10 * (x / 5 - x * x * x - y * y * y * y * y) * Math.exp(-x * x - y * y) -
  (1.0 / 3) * Math.exp(-(x + 1) * (x + 1) - y * y)

const openContours = (x: number, y: number): number => (x * x) / (y * y + 1) + (y * y) / (x * x + 1)

const createVector = (x0: number, x1: number, dx: number): number[] => ArrayBuilder.createVectorWithStep(x0, x1, dx)

/** Peaks */
function peaksModel(): PlotModel {
  const model = new PlotModel({ title: 'Peaks' })
  const cs = new ContourSeries({
    columnCoordinates: createVector(-3, 3, 0.05),
    rowCoordinates: createVector(-3.1, 3.1, 0.05),
  })
  cs.data = ArrayBuilder.evaluate(peaks, cs.columnCoordinates, cs.rowCoordinates)
  model.subtitle = `${cs.data.length}×${cs.data[0].length}`
  model.series.push(cs)
  return model
}

/** Peaks LabelStep = 1, ContourLevelStep = PI/2 */
function peaksLabelStep1LevelStepPI2(): PlotModel {
  const model = new PlotModel({ title: 'Peaks LabelStep = 1, ContourLevelStep = PI/2' })
  const cs = new ContourSeries({
    columnCoordinates: createVector(-3, 3, 0.05),
    rowCoordinates: createVector(-3.1, 3.1, 0.05),
    contourLevelStep: Math.PI / 2,
    labelStep: 1,
  })
  cs.data = ArrayBuilder.evaluate(peaks, cs.columnCoordinates, cs.rowCoordinates)
  model.subtitle = `${cs.data.length}×${cs.data[0].length}`
  model.series.push(cs)
  return model
}

/** Peaks LabelStep = 2, ContourLevelStep = 0.5 */
function peaksLabelStep2(): PlotModel {
  const model = new PlotModel({ title: 'Peaks LabelStep = 2, ContourLevelStep = 0.5' })
  const cs = new ContourSeries({
    columnCoordinates: createVector(-3, 3, 0.05),
    rowCoordinates: createVector(-3.1, 3.1, 0.05),
    contourLevelStep: 0.5,
    labelStep: 2,
  })
  cs.data = ArrayBuilder.evaluate(peaks, cs.columnCoordinates, cs.rowCoordinates)
  model.subtitle = `${cs.data.length}×${cs.data[0].length}`
  model.series.push(cs)
  return model
}

/** Peaks LabelStep = 2, ContourLevelStep = 0.33 */
function peaksLabelStep2LevelStep033(): PlotModel {
  const model = new PlotModel({ title: 'Peaks LabelStep = 2, ContourLevelStep = 0.33' })
  const cs = new ContourSeries({
    columnCoordinates: createVector(-3, 3, 0.05),
    rowCoordinates: createVector(-3.1, 3.1, 0.05),
    contourLevelStep: 0.33,
    labelStep: 2,
  })
  cs.data = ArrayBuilder.evaluate(peaks, cs.columnCoordinates, cs.rowCoordinates)
  model.subtitle = `${cs.data.length}×${cs.data[0].length}`
  model.series.push(cs)
  return model
}

/** Peaks LabelStep = 3, ContourLevelStep = 1 */
function peaksLabelStep3(): PlotModel {
  const model = new PlotModel({ title: 'Peaks LabelStep = 3, ContourLevelStep = 1' })
  const cs = new ContourSeries({
    columnCoordinates: createVector(-3, 3, 0.05),
    rowCoordinates: createVector(-3.1, 3.1, 0.05),
    labelStep: 3,
  })
  cs.data = ArrayBuilder.evaluate(peaks, cs.columnCoordinates, cs.rowCoordinates)
  model.subtitle = `${cs.data.length}×${cs.data[0].length}`
  model.series.push(cs)
  return model
}

/** Peaks MultiLabel */
function peaksMultiLabel(): PlotModel {
  const model = new PlotModel({ title: 'Peaks MultiLabel' })
  const cs = new ContourSeries({
    columnCoordinates: createVector(-3, 3, 0.05),
    rowCoordinates: createVector(-3.1, 3.1, 0.05),
    multiLabel: true,
  })
  cs.data = ArrayBuilder.evaluate(peaks, cs.columnCoordinates, cs.rowCoordinates)
  model.subtitle = `${cs.data.length}×${cs.data[0].length}`
  model.series.push(cs)
  return model
}

/** Peaks LabelSpacing = 400 */
function peaksLabelSpacing400(): PlotModel {
  const model = new PlotModel({ title: 'Peaks LabelSpacing = 400' })
  const cs = new ContourSeries({
    columnCoordinates: createVector(-3, 3, 0.05),
    rowCoordinates: createVector(-3.1, 3.1, 0.05),
    multiLabel: true,
    labelSpacing: 400,
  })
  cs.data = ArrayBuilder.evaluate(peaks, cs.columnCoordinates, cs.rowCoordinates)
  model.subtitle = `${cs.data.length}×${cs.data[0].length}`
  model.series.push(cs)
  return model
}

/** Peaks (different contour colors) */
function peaksWithColors(): PlotModel {
  const model = new PlotModel({ title: 'Peaks' })
  const cs = new ContourSeries({
    columnCoordinates: createVector(-3, 3, 0.05),
    rowCoordinates: createVector(-3.1, 3.1, 0.05),
    contourColors: [OxyColors.SeaGreen, OxyColors.RoyalBlue, OxyColors.IndianRed],
  })
  cs.data = ArrayBuilder.evaluate(peaks, cs.columnCoordinates, cs.rowCoordinates)
  model.subtitle = `${cs.data.length}×${cs.data[0].length}`
  model.series.push(cs)
  return model
}

/** Peaks (wide array) */
function wideArrayPeaks(): PlotModel {
  const model = new PlotModel({ title: 'Peaks' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -3.16262, maximum: 3.162 }))

  const cs = new ContourSeries({
    columnCoordinates: createVector(-3, 3, 0.05),
    rowCoordinates: createVector(-1, 1, 0.05),
  })
  cs.data = ArrayBuilder.evaluate(peaks, cs.columnCoordinates, cs.rowCoordinates)
  model.subtitle = `${cs.data.length}×${cs.data[0].length}`
  model.series.push(cs)
  return model
}

/** Open Contours */
function openContoursModel(): PlotModel {
  const model = new PlotModel()
  const cs = new ContourSeries({
    columnCoordinates: createVector(-3, 3, 0.05),
    rowCoordinates: createVector(-3, 3, 0.05),
  })

  cs.data = ArrayBuilder.evaluate(openContours, cs.columnCoordinates, cs.rowCoordinates)
  model.series.push(cs)
  return model
}

/** Logarithmic Peaks */
function logPeaks(): PlotModel {
  const logPeaks = (x: number, y: number): number => peaks(Math.log(x) / 10, Math.log(y) / 10)

  const model = new PlotModel()
  const coordinates = createVector(-3, 3, 0.05)
  for (let i = 0; i < coordinates.length; i++) {
    coordinates[i] = Math.exp(coordinates[i] * 10)
  }

  const cs = new ContourSeries({
    columnCoordinates: coordinates,
    rowCoordinates: coordinates,
  })

  cs.data = ArrayBuilder.evaluate(logPeaks, cs.columnCoordinates, cs.rowCoordinates)
  model.series.push(cs)
  model.axes.push(new LogarithmicAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LogarithmicAxis({ position: AxisPosition.Left }))
  return model
}

const category = 'ContourSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Peaks',
      example: {
        model: peaksModel,
      },
    },
    {
      title: 'Peaks LabelStep = 1, ContourLevelStep = PI/2',
      example: {
        model: peaksLabelStep1LevelStepPI2,
      },
    },
    {
      title: 'Peaks LabelStep = 2, ContourLevelStep = 0.5',
      example: {
        model: peaksLabelStep2,
      },
    },
    {
      title: 'Peaks LabelStep = 2, ContourLevelStep = 0.33',
      example: {
        model: peaksLabelStep2LevelStep033,
      },
    },
    {
      title: 'Peaks LabelStep = 3, ContourLevelStep = 1',
      example: {
        model: peaksLabelStep3,
      },
    },
    {
      title: 'Peaks MultiLabel',
      example: {
        model: peaksMultiLabel,
      },
    },
    {
      title: 'Peaks LabelSpacing = 400',
      example: {
        model: peaksLabelSpacing400,
      },
    },
    {
      title: 'Peaks (different contour colors)',
      example: {
        model: peaksWithColors,
      },
    },
    {
      title: 'Peaks (wide array)',
      example: {
        model: wideArrayPeaks,
      },
    },
    {
      title: 'Open Contours',
      example: {
        model: openContoursModel,
      },
    },
    {
      title: 'Logarithmic Peaks',
      example: {
        model: logPeaks,
      },
    },
  ],
} as ExampleCategory
