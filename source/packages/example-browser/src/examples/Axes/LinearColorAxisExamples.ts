import { AxisPosition, LinearColorAxis, OxyPalettes, PlotModel } from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { HeatMapSeriesExamples } from '../Series/HeatMapSeriesExamples'

function peaks(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(undefined, false)
}

function peaksRenderAsImage() {
  return _enableRenderAsImage(peaks())
}

function horizontal6() {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(6), false)
}

function horizontal6RenderAsImage() {
  return _enableRenderAsImage(horizontal6())
}

function short(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(600), false)
  const colorAxis = model.axes[0] as LinearColorAxis
  colorAxis.startPosition = 0.02
  colorAxis.endPosition = 0.5
  return model
}

function shortRenderAsImage() {
  return _enableRenderAsImage(short())
}

/** Position_None */
function position_None(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(600), false)
  const colorAxis = model.axes[0] as LinearColorAxis
  colorAxis.position = AxisPosition.None
  return model
}

// =========================
function _enableRenderAsImage(plotModel: PlotModel): PlotModel {
  const axis = plotModel.axes.find((axis) => axis instanceof LinearColorAxis) as LinearColorAxis
  axis.renderAsImage = true
  plotModel.title += ' - RenderAsImage'
  return plotModel
}

export const LinearColorAxisExamples = {
  peaks,
  peaksRenderAsImage,
  horizontal6,
  horizontal6RenderAsImage,
  short,
  shortRenderAsImage,
  position_None,
}

const category = 'LinearColorAxis'

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
