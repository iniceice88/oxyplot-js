import { Legend, LegendPlacement, OxyColors, PlotModel, type RectangleBarItem, RectangleBarSeries } from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function rectangleBarSeries(): PlotModel {
  const model = new PlotModel({ title: 'RectangleBarSeries' })
  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
  })

  model.legends.push(l)
  const s1 = new RectangleBarSeries({ title: 'RectangleBarSeries 1' })
  const createRectangleBarItem = (item: Partial<RectangleBarItem>) => {
    if (!item.color) item.color = OxyColors.Automatic
    return item as RectangleBarItem
  }

  s1.items.push(createRectangleBarItem({ x0: 2, x1: 8, y0: 1, y1: 4 }))
  s1.items.push(createRectangleBarItem({ x0: 6, x1: 12, y0: 6, y1: 7 }))
  model.series.push(s1)

  const s2 = new RectangleBarSeries({ title: 'RectangleBarSeries 2' })
  s2.items.push(createRectangleBarItem({ x0: 2, x1: 8, y0: -4, y1: -1 }))
  s2.items.push(createRectangleBarItem({ x0: 6, x1: 12, y0: -7, y1: -6 }))
  model.series.push(s2)

  return model
}

const category = 'RectangleBarSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'RectangleBarSeries',
      example: {
        model: rectangleBarSeries,
      },
    },
  ],
} as ExampleCategory
