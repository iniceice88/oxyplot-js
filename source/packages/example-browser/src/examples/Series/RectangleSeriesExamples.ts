import { AxisPosition, LinearColorAxis, newRectangleItem, OxyPalettes, PlotModel, RectangleSeries } from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function fromItems(): PlotModel {
  const numberOfItems = 10
  const model = new PlotModel({ title: 'RectangleSeries' })

  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.jet(100),
    }),
  )

  const s = new RectangleSeries({ labelFontSize: 12 })
  for (let i = numberOfItems - 1; i >= 0; i--) {
    s.items.push(newRectangleItem(-i * 0.5, i * 0.5, i * i, i * (i + 3), i))
  }

  model.series.push(s)

  return model
}

function fromItemsSource(): PlotModel {
  const numberOfItems = 10
  const model = new PlotModel({ title: 'RectangleSeries' })

  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.jet(100),
    }),
  )

  const items: MyItem[] = []
  for (let i = 0; i < numberOfItems; i++) {
    items.push({ x: i, value: i })
  }

  model.series.push(
    new RectangleSeries({
      itemsSource: items,
      mapping: (x) => {
        const r = x as MyItem
        return newRectangleItem(r.x, r.x * 2, r.x, r.x * 2, r.value)
      },
    }),
  )

  return model
}

// =============
interface MyItem {
  x: number
  value: number
}

const category = 'RectangleSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'RectangleSeries',
      example: {
        model: fromItems,
      },
    },
    {
      title: 'RectangleSeries from ItemsSource and Mapping',
      example: {
        model: fromItemsSource,
      },
    },
  ],
} as ExampleCategory
