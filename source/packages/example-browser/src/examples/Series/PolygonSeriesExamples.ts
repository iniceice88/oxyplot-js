import type { ExampleCategory } from '../types.ts'
import {
  AxisPosition,
  DataPoint,
  LinearColorAxis,
  newDataPoint,
  newPolygonItem,
  OxyColors,
  PlotModel,
  PlotType,
  PolygonSeries,
} from 'oxyplot-js'

function polygonSeries(): PlotModel {
  const model = new PlotModel({ title: 'Polygon Series', plotType: PlotType.Cartesian })

  model.axes.push(new LinearColorAxis())

  const ps = new PolygonSeries()
  const outlines: DataPoint[][] = []
  for (let i = 0; i < 5; i++) {
    ps.items.push(newPolygonItem(regularPolygon(newDataPoint(i * 5, 0), 2, 3 + i), i))
    outlines.push(regularPolygon(newDataPoint(i * 5, 5), 2, 3 + i))
  }
  ps.items.push(newPolygonItem(outlines, 10))
  model.series.push(ps)

  return model
}

function hexGrid(): PlotModel {
  const model = new PlotModel({ title: 'Hexagonal Grid' })

  model.axes.push(new LinearColorAxis({ position: AxisPosition.Right }))

  const evalFunc = (p: DataPoint) => Math.sin(p.x / 5) + Math.sqrt(p.y)

  const dim = 1.0
  const w = dim * 2 - Math.cos(Math.PI / 3) * dim
  const h = Math.sin(Math.PI / 3) * dim * 2

  const ps = new PolygonSeries({ stroke: OxyColors.Black, strokeThickness: 1 })
  for (let x = 0; x < 40; x++) {
    for (let y = 0; y < 40; y++) {
      const oy = x % 2 === 0 ? 0 : h / 2

      const p = newDataPoint(x * w, y * h + oy)

      ps.items.push(newPolygonItem(regularPolygon(p, dim, 6), evalFunc(p)))
    }
  }
  model.series.push(ps)

  return model
}

// ===================
function regularPolygon(center: DataPoint, dimension: number, polyCount: number): DataPoint[] {
  const res: DataPoint[] = new Array(polyCount)

  for (let i = 0; i < res.length; i++) {
    const angle = (Math.PI * 2 * i) / res.length

    const x = Math.cos(angle) * dimension
    const y = Math.sin(angle) * dimension

    res[i] = newDataPoint(center.x + x, center.y + y)
  }

  return res
}

const category = 'PolygonSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'PolygonSeries',
      example: {
        model: polygonSeries,
      },
    },
    {
      title: 'Hexagonal Grid',
      example: {
        model: hexGrid,
      },
    },
  ],
} as ExampleCategory
