import type { ExampleCategory } from '../types'
import { HeatMapSeries, LinearColorAxis, LogarithmicColorAxis, PlotModel } from 'oxyplot-js'
import { LinearColorAxisExamples } from './LinearColorAxisExamples'

function peaks(): PlotModel {
  return _convertToLogarithmic(LinearColorAxisExamples.peaks())
}

function peaksRenderAsImage() {
  return _convertToLogarithmic(LinearColorAxisExamples.peaksRenderAsImage())
}

function horizontal6() {
  return _convertToLogarithmic(LinearColorAxisExamples.horizontal6())
}

function horizontal6RenderAsImage() {
  return _convertToLogarithmic(LinearColorAxisExamples.horizontal6RenderAsImage())
}

function short(): PlotModel {
  return _convertToLogarithmic(LinearColorAxisExamples.short())
}

function shortRenderAsImage() {
  return _convertToLogarithmic(LinearColorAxisExamples.shortRenderAsImage())
}

/** Position_None */
function position_None(): PlotModel {
  return _convertToLogarithmic(LinearColorAxisExamples.position_None())
}

// ====================
function _convertToLogarithmic(model: PlotModel): PlotModel {
  const linearAxis = model.axes.find((axis) => axis instanceof LinearColorAxis) as LinearColorAxis
  const index = model.axes.indexOf(linearAxis)
  if (index > -1) {
    model.axes.splice(index, 1)
  }

  const logarithmicAxis = new LogarithmicColorAxis({
    position: linearAxis.position,
    palette: linearAxis.palette,
    startPosition: linearAxis.startPosition,
    endPosition: linearAxis.endPosition,
    highColor: linearAxis.highColor,
    lowColor: linearAxis.lowColor,
    invalidNumberColor: linearAxis.invalidNumberColor,
  })

  const series = model.series.find((s) => s instanceof HeatMapSeries) as HeatMapSeries
  if (series.data) {
    for (let x = 0; x < series.data.length; x++) {
      for (let y = 0; y < series.data[x].length; y++) {
        series.data[x][y] += 6.6
      }
    }
  }

  model.axes.push(logarithmicAxis)
  return model
}

const category = 'LogarithmicColorAxis'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'Peaks',
      example: {
        model: peaks,
      },
    },
    {
      title: 'Peaks - RenderAsImage',
      example: {
        model: peaksRenderAsImage,
      },
    },
    {
      title: '6 Colors',
      example: {
        model: horizontal6,
      },
    },
    {
      title: '6 Colors - RenderAsImage',
      example: {
        model: horizontal6RenderAsImage,
      },
    },
    {
      title: 'Short',
      example: {
        model: short,
      },
    },
    {
      title: 'Short - RenderAsImage',
      example: {
        model: shortRenderAsImage,
      },
    },
    {
      title: 'Position None',
      example: {
        model: position_None,
      },
    },
  ],
} as ExampleCategory
