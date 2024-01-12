import type { IRenderContext } from '@/oxyplot'
import {
  AngleAxis,
  Axis,
  AxisRendererBase,
  HorizontalAlignment,
  MathRenderingExtensions,
  newScreenPoint,
  PlotModel,
  RenderingExtensions,
  VerticalAlignment,
} from '@/oxyplot'

/**
 * Provides functionality to render AngleAxis.
 */
export class AngleAxisRenderer extends AxisRendererBase {
  /**
   * Initializes a new instance of the AngleAxisRenderer class.
   * @param rc The render context.
   * @param plot The plot.
   */
  constructor(rc: IRenderContext, plot: PlotModel) {
    super(rc, plot)
  }

  /**
   * Renders the specified axis.
   * @param axis The axis.
   * @param pass The render pass.
   * @throws Error if magnitude axis is not defined.
   */
  public async render(axis: Axis, pass: number): Promise<void> {
    const angleAxis = axis as AngleAxis

    await super.render(axis, pass)

    const magnitudeAxis = this.plot.defaultMagnitudeAxis

    if (!magnitudeAxis) {
      throw new Error('Magnitude axis not defined.')
    }

    const scaledStartAngle = angleAxis.startAngle / angleAxis.scale
    const scaledEndAngle = angleAxis.endAngle / angleAxis.scale

    const axisLength = Math.abs(scaledEndAngle - scaledStartAngle)
    if (this.minorPen) {
      const tickCount = Math.abs((axisLength / axis.actualMinorStep) | 0)
      const screenPoints = this.minorTickValues
        .slice(0, tickCount + 1)
        .map((x) => magnitudeAxis.transformPoint(magnitudeAxis.clipMaximum, x, axis))

      for (const screenPoint of screenPoints) {
        await RenderingExtensions.drawLine(
          this.renderContext,
          magnitudeAxis.midPoint.x,
          magnitudeAxis.midPoint.y,
          screenPoint.x,
          screenPoint.y,
          this.minorPen,
          axis.edgeRenderingMode,
        )
      }
    }

    const isFullCircle =
      Math.abs(
        Math.abs(
          Math.max(angleAxis.endAngle, angleAxis.startAngle) - Math.min(angleAxis.startAngle, angleAxis.endAngle),
        ) - 360,
      ) < 1e-3
    let majorTickCount = (axisLength / axis.actualMajorStep) | 0
    if (!isFullCircle) {
      majorTickCount++
    }

    if (this.majorPen) {
      const screenPoints = this.majorTickValues
        .slice(0, majorTickCount)
        .map((x) => magnitudeAxis.transformPoint(magnitudeAxis.clipMaximum, x, axis))

      for (const point of screenPoints) {
        await RenderingExtensions.drawLine(
          this.renderContext,
          magnitudeAxis.midPoint.x,
          magnitudeAxis.midPoint.y,
          point.x,
          point.y,
          this.majorPen,
          axis.edgeRenderingMode,
        )
      }
    }

    for (const value of this.majorLabelValues.slice(0, majorTickCount)) {
      let pt = magnitudeAxis.transformPoint(magnitudeAxis.clipMaximum, value, axis)
      const angle = Math.atan2(pt.y - magnitudeAxis.midPoint.y, pt.x - magnitudeAxis.midPoint.x)

      let { x, y } = pt
      // add some margin
      x += Math.cos(angle) * axis.axisTickToLabelDistance
      y += Math.sin(angle) * axis.axisTickToLabelDistance
      pt = newScreenPoint(x, y)

      // Convert to degrees
      let angleInDegrees = (angle * 180) / Math.PI

      const text = axis.formatValue(value)

      let ha = HorizontalAlignment.Left
      let va = VerticalAlignment.Middle

      if (Math.abs(Math.abs(angleInDegrees) - 90) < 10) {
        ha = HorizontalAlignment.Center
        va = angleInDegrees >= 90 ? VerticalAlignment.Top : VerticalAlignment.Bottom
        angleInDegrees = 0
      } else if (angleInDegrees > 90 || angleInDegrees < -90) {
        angleInDegrees -= 180
        ha = HorizontalAlignment.Right
      }

      await MathRenderingExtensions.drawMathText(
        this.renderContext,
        pt,
        text,
        axis.actualTextColor,
        axis.actualFont,
        axis.actualFontSize,
        axis.actualFontWeight,
        angleInDegrees,
        ha,
        va,
      )
    }
  }
}
