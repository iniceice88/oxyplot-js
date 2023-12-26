import {
  AxisPosition,
  type IRenderContext,
  LinearAxis,
  LineStyle,
  OxyColors,
  OxyThickness,
  PlotModel,
  ScreenPoint,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function customArrowAxis(): PlotModel {
  const model = new PlotModel({
    plotAreaBorderThickness: new OxyThickness(0),
    plotMargins: new OxyThickness(60, 60, 60, 60),
  })
  model.axes.push(new ArrowAxis({ position: AxisPosition.Bottom, axislineStyle: LineStyle.Solid }))
  model.axes.push(new ArrowAxis({ position: AxisPosition.Left, axislineStyle: LineStyle.Solid }))
  return model
}

export class ArrowAxis extends LinearAxis {
  async render(rc: IRenderContext, pass: number): Promise<void> {
    await super.render(rc, pass)
    const points: ScreenPoint[] = []
    if (this.isHorizontal()) {
      const xmax = this.transform(this.actualMaximum)
      points.push(new ScreenPoint(xmax + 4, this.plotModel.plotArea.bottom - 4))
      points.push(new ScreenPoint(xmax + 18, this.plotModel.plotArea.bottom))
      points.push(new ScreenPoint(xmax + 4, this.plotModel.plotArea.bottom + 4))
      // etc.
    } else {
      const ymax = this.transform(this.actualMaximum)
      points.push(new ScreenPoint(this.plotModel.plotArea.left - 4, ymax - 4))
      points.push(new ScreenPoint(this.plotModel.plotArea.left, ymax - 18))
      points.push(new ScreenPoint(this.plotModel.plotArea.left + 4, ymax - 4))
      // etc.
    }

    await rc.drawPolygon(points, OxyColors.Black, OxyColors.Undefined, 0, this.edgeRenderingMode)
  }
}

const category = 'Custom axes'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'ArrowAxis',
      example: {
        model: customArrowAxis,
      },
    },
  ],
} as ExampleCategory
