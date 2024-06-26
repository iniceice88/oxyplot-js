import {
  AxisPosition,
  type IRenderContext,
  LinearAxis,
  LineStyle,
  newScreenPoint,
  OxyColors,
  OxyRectHelper,
  newOxyThickness,
  PlotModel,
  ScreenPoint,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function customArrowAxis(): PlotModel {
  const model = new PlotModel({
    plotAreaBorderThickness: newOxyThickness(0),
    plotMargins: newOxyThickness(60, 60, 60, 60),
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
      const bottom = OxyRectHelper.bottom(this.plotModel.plotArea)
      const xmax = this.transform(this.actualMaximum)
      points.push(newScreenPoint(xmax + 4, bottom - 4))
      points.push(newScreenPoint(xmax + 18, bottom))
      points.push(newScreenPoint(xmax + 4, bottom + 4))
      // etc.
    } else {
      const ymax = this.transform(this.actualMaximum)
      points.push(newScreenPoint(this.plotModel.plotArea.left - 4, ymax - 4))
      points.push(newScreenPoint(this.plotModel.plotArea.left, ymax - 18))
      points.push(newScreenPoint(this.plotModel.plotArea.left + 4, ymax - 4))
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
