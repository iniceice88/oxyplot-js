import {
  ArrayBuilder,
  AxisPosition,
  DataVector,
  LinearAxis,
  LinearColorAxis,
  LogarithmicAxis,
  newDataPoint,
  newOxyPalette,
  OxyColorHelper,
  OxyPalettes,
  PlotModel,
  type VectorItem,
  VectorSeries,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { Random } from '../Random'

function fromItems(): PlotModel {
  const { model } = getModel(true)
  return model
}

function fromItemsVeeness(): PlotModel {
  const { model, series } = getModel(true)
  series.arrowVeeness = 2
  return model
}

function fromItemsVectorOriginAndLabelPosition(): PlotModel {
  const { model, series } = getModel(true)
  series.arrowLabelPosition = 0.25
  series.arrowStartPosition = 0.5
  return model
}

function fromItemsWithoutColorAxis(): PlotModel {
  const { model } = getModel(false)
  return model
}

function vectorField(): PlotModel {
  const model = new PlotModel({ title: 'Peaks (Gradient)' })
  const vs = new VectorSeries()
  const columnCoordinates = ArrayBuilder.createVectorWithStep(-3, 3, 0.25)
  const rowCoordinates = ArrayBuilder.createVectorWithStep(-3.1, 3.1, 0.25)
  vs.arrowVeeness = 1
  vs.arrowStartPosition = 0.5
  vs.itemsSource = columnCoordinates.flatMap((x) =>
    rowCoordinates.map((y) => {
      return {
        origin: newDataPoint(x, y),
        direction: new DataVector(dpeaksdx(x, y) / 40, dpeaksdy(x, y) / 40),
        value: NaN,
      } as VectorItem
    }),
  )
  model.series.push(vs)
  return model
}

function logarithmicYAxis(): PlotModel {
  const NumberOfItems = 100
  const model = new PlotModel({ title: 'VectorSeries' })

  const rand = new Random()
  const w = 100.0
  const h = 100.0
  const max = 50.0

  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: OxyPalettes.cool(10),
      minimum: 0.0,
      maximum: max,
    }),
  )

  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: -max,
      maximum: w + max,
    }),
  )

  model.axes.push(
    new LogarithmicAxis({
      position: AxisPosition.Left,
      minimum: 1,
      maximum: h + max,
    }),
  )

  const s = new VectorSeries({ labelFontSize: 12 })
  for (let i = NumberOfItems - 1; i >= 0; i--) {
    const ang = rand.next() * Math.PI * 2.0
    const mag = rand.next() * max

    const origin = newDataPoint(rand.next() * w, rand.next() * h + 1)
    const direction = new DataVector(Math.cos(ang) * mag, Math.sin(ang) * mag)
    s.items.push({
      origin,
      direction,
      value: mag,
    })
  }

  model.series.push(s)

  return model
}

const dpeaksdx = (x: number, y: number): number =>
  -10 *
    ((1 / 5 - 3 * Math.pow(x, 2)) * Math.exp(-Math.pow(x, 2) - Math.pow(y, 2)) -
      2 * x * (x / 5 - Math.pow(x, 3) - Math.pow(y, 5)) * Math.exp(-Math.pow(x, 2) - Math.pow(y, 2))) +
  0.6666666666666666 * (1 + x) * Math.exp(-Math.pow(1 + x, 2) - Math.pow(y, 2)) +
  3 *
    (-2 * (1 - x) * Math.exp(-Math.pow(x, 2) - Math.pow(1 + y, 2)) -
      2 * x * Math.pow(1 - x, 2) * Math.exp(-Math.pow(x, 2) - Math.pow(1 + y, 2)))

const dpeaksdy = (x: number, y: number): number =>
  -10 *
    (-5 * Math.pow(y, 4) * Math.exp(-Math.pow(x, 2) - Math.pow(y, 2)) -
      2 * y * (x / 5 - Math.pow(x, 3) - Math.pow(y, 5)) * Math.exp(-Math.pow(x, 2) - Math.pow(y, 2))) +
  0.6666666666666666 * y * Math.exp(-Math.pow(1 + x, 2) - Math.pow(y, 2)) -
  6 * Math.pow(1 - x, 2) * (1 + y) * Math.exp(-Math.pow(x, 2) - Math.pow(1 + y, 2))

function getModel(includeColorAxis: boolean): {
  model: PlotModel
  series: VectorSeries
} {
  const NumberOfItems = 100
  const model = new PlotModel({ title: 'VectorSeries (Veeness = 2)' })

  const rand = new Random()
  const w = 100.0
  const h = 100.0
  const max = 10.0

  if (includeColorAxis) {
    model.axes.push(
      new LinearColorAxis({
        position: AxisPosition.Right,
        palette: newOxyPalette(OxyPalettes.cool(10).colors.map((c) => OxyColorHelper.fromAColor(100, c))),
        minimum: 0.0,
        maximum: max,
      }),
    )
  }

  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: -max,
      maximum: w + max,
    }),
  )

  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: -max,
      maximum: h + max,
    }),
  )

  const series = new VectorSeries({ labelFontSize: 12 })
  for (let i = NumberOfItems - 1; i >= 0; i--) {
    const ang = rand.next() * Math.PI * 2.0
    const mag = rand.next() * max

    const origin = newDataPoint(rand.next() * w, rand.next() * h)
    const direction = new DataVector(Math.cos(ang) * mag, Math.sin(ang) * mag)
    series.items.push({
      origin,
      direction,
      value: mag,
    } as VectorItem)
  }

  model.series.push(series)

  return { model, series }
}

const category = 'VectorSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'VectorSeries',
      example: {
        model: fromItems,
      },
    },
    {
      title: 'VectorSeries (Veeness = 2)',
      example: {
        model: fromItemsVeeness,
      },
    },
    {
      title: 'VectorSeries (Vector Origin and Label position)',
      example: {
        model: fromItemsVectorOriginAndLabelPosition,
      },
    },
    {
      title: 'VectorSeries (without ColorAxis)',
      example: {
        model: fromItemsWithoutColorAxis,
      },
    },
    {
      title: 'Vector Field',
      example: {
        model: vectorField,
      },
    },
    {
      title: 'VectorSeries on Log Axis',
      example: {
        model: logarithmicYAxis,
      },
    },
  ],
} as ExampleCategory
