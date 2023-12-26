import type { AngleAxis, Axis } from '@/oxyplot'
import {
  AxisRendererBase,
  HorizontalAlignment,
  type IRenderContext,
  MathRenderingExtensions,
  OxyColors,
  OxyPen,
  OxyRect,
  PlotModel,
  ScreenPoint,
  VerticalAlignment,
} from '@/oxyplot'

/**
 * Provides functionality to render MagnitudeAxis.
 */
export class MagnitudeAxisRenderer extends AxisRendererBase {
  /**
   * Initializes a new instance of the MagnitudeAxisRenderer class.
   * @param rc The render context.
   * @param plot The plot.
   */
  constructor(rc: IRenderContext, plot: PlotModel) {
    super(rc, plot)
  }

  /**
   * Renders the specified axis.
   * @param axis The axis.
   * @param pass The pass.
   * @throws Error if angle axis is not defined.
   */
  async render(axis: Axis, pass: number): Promise<void> {
    await super.render(axis, pass)

    const angleAxis = this.plot.defaultAngleAxis

    if (!angleAxis) {
      throw new Error('Angle axis should not be null.')
    }

    angleAxis.updateActualMaxMin()

    if (pass === 0 && this.extraPen) {
      const extraTicks = axis.extraGridlines
      if (extraTicks) {
        for (let i = 0; i < extraTicks.length; i++) {
          await this.renderTick(axis, angleAxis, extraTicks[i], this.extraPen)
        }
      }
    }

    if (pass === 0 && this.minorPen) {
      for (const tickValue of this.minorTickValues) {
        await this.renderTick(axis, angleAxis, tickValue, this.minorPen)
      }
    }

    if (pass === 0 && this.majorPen) {
      for (const tickValue of this.majorTickValues) {
        await this.renderTick(axis, angleAxis, tickValue, this.majorPen)
      }
    }

    if (pass === 1) {
      for (const tickValue of this.majorTickValues) {
        await this.renderTickText(axis, tickValue, angleAxis)
      }
    }
  }

  /**
   * Returns the angle (in radian) of the axis line in screen coordinate
   * @param axis The axis.
   * @param angleAxis The angle axis.
   * @returns The angle (in radians).
   */
  private static getActualAngle(axis: Axis, angleAxis: Axis): number {
    const a = axis.transformPoint(0, angleAxis.angle, angleAxis)
    const b = axis.transformPoint(1, angleAxis.angle, angleAxis)
    return Math.atan2(b.y - a.y, b.x - a.x)
  }

  /**
   * Choose the most appropriate alignment for tick text
   * @param actualAngle The actual angle.
   */
  private static getTickTextAlignment(actualAngle: number): [HorizontalAlignment, VerticalAlignment] {
    let ha: HorizontalAlignment = HorizontalAlignment.Center
    let va: VerticalAlignment = VerticalAlignment.Bottom

    if (actualAngle > (3 * Math.PI) / 4 || actualAngle < (-3 * Math.PI) / 4) {
      ha = HorizontalAlignment.Center
      va = VerticalAlignment.Top
    } else if (actualAngle < -Math.PI / 4) {
      ha = HorizontalAlignment.Right
      va = VerticalAlignment.Middle
    } else if (actualAngle > Math.PI / 4) {
      ha = HorizontalAlignment.Left
      va = VerticalAlignment.Middle
    } else {
      ha = HorizontalAlignment.Center
      va = VerticalAlignment.Bottom
    }

    return [ha, va]
  }

  /**
   * Renders a tick, chooses the best implementation
   * @param axis The axis.
   * @param angleAxis The angle axis.
   * @param x The x-value.
   * @param pen The pen.
   */
  private async renderTick(axis: Axis, angleAxis: AngleAxis, x: number, pen: OxyPen): Promise<void> {
    const isFullCircle = Math.abs(Math.abs(angleAxis.endAngle - angleAxis.startAngle) - 360) < 1e-6

    if (isFullCircle && !pen.actualDashArray) {
      await this.renderTickCircle(axis, angleAxis, x, pen)
    } else {
      await this.renderTickArc(axis, angleAxis, x, pen)
    }
  }

  /**
   * Renders a tick by drawing an ellipse
   * @param axis The axis.
   * @param angleAxis The angle axis.
   * @param x The x-value.
   * @param pen The pen.
   */
  private async renderTickCircle(axis: Axis, angleAxis: Axis, x: number, pen: OxyPen): Promise<void> {
    const zero = angleAxis.offset
    const center = axis.transformPoint(axis.clipMinimum, zero, angleAxis)
    const right = axis.transformPoint(x, zero, angleAxis).x
    const radius = right - center.x
    const width = radius * 2
    const left = right - width
    const top = center.y - radius
    const height = width

    await this.renderContext.drawEllipse(
      new OxyRect(left, top, width, height),
      OxyColors.Undefined,
      pen.color,
      pen.thickness,
      axis.edgeRenderingMode,
    )
  }

  /**
   * Renders a tick by drawing a lot of segments
   * @param axis The axis.
   * @param angleAxis The angle axis.
   * @param x The x-value.
   * @param pen The pen.
   */
  private async renderTickArc(axis: Axis, angleAxis: AngleAxis, x: number, pen: OxyPen): Promise<void> {
    // caution: make sure angleAxis.updateActualMaxMin(); has been called
    const minAngle = angleAxis.clipMinimum
    const maxAngle = angleAxis.clipMaximum

    // number of segment to draw a full circle
    // - decrease if you want get more speed
    // - increase if you want more detail
    // (making a public property of it would be a great idea)
    const maxSegments = 90.0

    // compute the actual number of segments
    const segmentCount = Math.round((maxSegments * Math.abs(angleAxis.endAngle - angleAxis.startAngle)) / 360.0)

    const angleStep = (maxAngle - minAngle) / (segmentCount - 1)

    const points: ScreenPoint[] = []

    for (let i = 0; i < segmentCount; i++) {
      const angle = minAngle + i * angleStep
      points.push(axis.transformPoint(x, angle, angleAxis))
    }

    await this.renderContext.drawLine(points, pen.color, pen.thickness, axis.edgeRenderingMode, pen.actualDashArray)
  }

  /**
   * Renders major tick text
   * @param axis The axis.
   * @param x The x-value.
   * @param angleAxis The angle axis.
   */
  private async renderTickText(axis: Axis, x: number, angleAxis: Axis): Promise<void> {
    const actualAngle = MagnitudeAxisRenderer.getActualAngle(axis, angleAxis)
    const dx = axis.axisTickToLabelDistance * Math.sin(actualAngle)
    const dy = -axis.axisTickToLabelDistance * Math.cos(actualAngle)

    const [ha, va] = MagnitudeAxisRenderer.getTickTextAlignment(actualAngle)

    let pt = axis.transformPoint(x, angleAxis.angle, angleAxis)
    pt = new ScreenPoint(pt.x + dx, pt.y + dy)

    const text = axis.formatValue(x)
    await MathRenderingExtensions.drawMathText(
      this.renderContext,
      pt,
      text,
      axis.actualTextColor,
      axis.actualFont,
      axis.actualFontSize,
      axis.actualFontWeight,
      axis.angle,
      ha,
      va,
    )
  }
}
