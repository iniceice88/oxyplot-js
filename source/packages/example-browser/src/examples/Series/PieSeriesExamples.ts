import { OxyColors, PieSeries, PlotModel } from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function pieSeries(): PlotModel {
  return createExample()
}

function insideLabelColor(): PlotModel {
  const model = createExample()
  const series = model.series[0] as PieSeries
  series.insideLabelColor = OxyColors.White
  return model
}

function createExample(): PlotModel {
  const model = new PlotModel({ title: 'World population by continent' })

  const ps = new PieSeries({
    strokeThickness: 2.0,
    insideLabelPosition: 0.8,
    angleSpan: 360,
    startAngle: 0,
  })

  // http://www.nationsonline.org/oneworld/world_population.htm
  // http://en.wikipedia.org/wiki/Continent
  ps.slices.push({ label: 'Africa', value: 1030, isExploded: true })
  ps.slices.push({ label: 'Americas', value: 929, isExploded: true })
  ps.slices.push({ label: 'Asia', value: 4157 })
  ps.slices.push({ label: 'Europe', value: 739, isExploded: true })
  ps.slices.push({ label: 'Oceania', value: 35, isExploded: true })

  model.series.push(ps)
  return model
}

const category = 'PieSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'PieSeries',
      example: {
        model: pieSeries,
      },
    },
    {
      title: 'PieSeries with inside label color',
      example: {
        model: insideLabelColor,
      },
    },
  ],
} as ExampleCategory
