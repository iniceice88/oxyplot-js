import { AxisPosition, LinearAxis, MarkerType, OxyColors, PlotModel, RangeColorAxis, ScatterSeries } from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { Random } from '../Random'

/** ScatterSeries with Reversed RangeColorAxis (Horizontal) */
function reversedHorizontalRangeColorAxis(): PlotModel {
  return rangeColorAxis(AxisPosition.Top, true)
}

/** ScatterSeries with Reversed  RangeColorAxis (Vertical) */
function reversedVerticalRangeColorAxis(): PlotModel {
  return rangeColorAxis(AxisPosition.Right, true)
}

/** ScatterSeries with RangeColorAxis (Horizontal) */
function horizontalRangeColorAxis(): PlotModel {
  return rangeColorAxis(AxisPosition.Top, false)
}

/** ScatterSeries with RangeColorAxis (Vertical) */
function verticalRangeColorAxis(): PlotModel {
  return rangeColorAxis(AxisPosition.Right, false)
}

function rangeColorAxis(position: AxisPosition, reverseAxis: boolean): PlotModel {
  const n = 1000

  const modelTitle = reverseAxis
    ? `ScatterSeries and Reversed RangeColorAxis (n=${n})`
    : `ScatterSeries and RangeColorAxis (n=${n})`

  const model = new PlotModel({
    title: modelTitle,
    background: OxyColors.LightGray,
  })

  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  const rca = new RangeColorAxis({ position: position, maximum: 2, minimum: -2 })
  rca.addRange(0, 0.5, OxyColors.Blue)
  rca.addRange(-0.2, -0.1, OxyColors.Red)

  if (reverseAxis) {
    rca.startPosition = 1
    rca.endPosition = 0
  }

  model.axes.push(rca)

  const s1 = new ScatterSeries({ markerType: MarkerType.Square, markerSize: 6 })

  const r = new Random()
  for (let i = 0; i < n; i++) {
    const x = r.next() * 2.2 - 1.1
    s1.points.push({
      x: x,
      y: r.next(),
      value: x,
    })
  }

  model.series.push(s1)
  return model
}

const category = 'RangeColorAxis'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'ScatterSeries with Reversed RangeColorAxis (Horizontal)',
      example: {
        model: reversedHorizontalRangeColorAxis,
      },
    },
    {
      title: 'ScatterSeries with Reversed  RangeColorAxis (Vertical)',
      example: {
        model: reversedVerticalRangeColorAxis,
      },
    },
    {
      title: 'ScatterSeries with RangeColorAxis (Horizontal)',
      example: {
        model: horizontalRangeColorAxis,
      },
    },
    {
      title: 'ScatterSeries with RangeColorAxis (Vertical)',
      example: {
        model: verticalRangeColorAxis,
      },
    },
  ],
} as ExampleCategory
