import {
  AngleAxis,
  Axis,
  AxisRendererBase,
  HorizontalAlignment,
  type IRenderContext,
  MathRenderingExtensions,
  OxyRect,
  PlotModel,
  RenderingExtensions,
  ScreenPoint,
  VerticalAlignment,
} from '@/oxyplot'

/** Provides functionality to render AngleAxis using the full plot area. */
export class AngleAxisFullPlotAreaRenderer extends AxisRendererBase {
  /**
   * Initializes a new instance of the AngleAxisFullPlotAreaRenderer class.
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
  async render(axis: Axis, pass: number): Promise<void> {
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
      const tickCount = Math.abs(axisLength / axis.actualMinorStep)

      const screenPoints = this.minorTickValues
        .slice(0, tickCount + 1)
        .map((x) =>
          this.transformToClientRectangle(
            magnitudeAxis.clipMaximum,
            x,
            axis,
            this.plot.plotArea,
            magnitudeAxis.midPoint,
          ),
        )

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

    let majorTickCount = Math.floor(axisLength / axis.actualMajorStep)
    if (!isFullCircle) {
      majorTickCount++
    }

    if (this.majorPen) {
      const screenPoints = this.majorTickValues
        .slice(0, majorTickCount)
        .map((x) =>
          this.transformToClientRectangle(
            magnitudeAxis.clipMaximum,
            x,
            axis,
            this.plot.plotArea,
            magnitudeAxis.midPoint,
          ),
        )

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

    //Text rendering
    for (const value of this.majorLabelValues.slice(0, majorTickCount)) {
      const pt = this.transformToClientRectangle(
        magnitudeAxis.clipMaximum,
        value,
        axis,
        this.plot.plotArea,
        magnitudeAxis.midPoint,
      )
      const text = axis.formatValue(value)

      let ha = HorizontalAlignment.Center
      let va = VerticalAlignment.Middle
      const plotrect = this.plot.plotArea

      let y = pt.y
      let x = pt.x

      //check on which side of the plotarea it is
      //top
      if (y <= plotrect.top) {
        ha = HorizontalAlignment.Center
        va = VerticalAlignment.Top
        // add some margin
        y += axis.axisTickToLabelDistance
      }
      //bottom
      else if (y >= plotrect.bottom) {
        ha = HorizontalAlignment.Center
        va = VerticalAlignment.Bottom
        y -= axis.axisTickToLabelDistance
      }
      //left
      else if (x <= plotrect.left) {
        ha = HorizontalAlignment.Left
        va = VerticalAlignment.Middle
        x += axis.axisTickToLabelDistance
      }
      //right
      else if (x >= plotrect.right) {
        ha = HorizontalAlignment.Right
        va = VerticalAlignment.Middle
        x -= axis.axisTickToLabelDistance
      }

      const outsideposition = new ScreenPoint(x, y)
      await MathRenderingExtensions.drawMathText(
        this.renderContext,
        outsideposition,
        text,
        axis.actualTextColor,
        axis.actualFont,
        axis.actualFontSize,
        axis.actualFontWeight,
        0,
        ha,
        va,
      )
    }
  }

  /** Transforms the specified point to screen coordinates. */
  public transformToClientRectangle(
    actualMaximum: number,
    x: number,
    axis: Axis,
    plotArea: OxyRect,
    midPoint: ScreenPoint,
  ): ScreenPoint {
    let result = new ScreenPoint()
    let theta = (x - axis.offset) * axis.scale
    theta %= 360.0
    const theta_rad = (theta / 180.0) * Math.PI

    const _x = Math.cos(theta_rad)
    //y is negative because it is from top to bottom
    const _y = -Math.sin(theta_rad)
    //compute intersections with right or lefth side

    if (_x !== 0) {
      let delta_x = 0
      if (_x > 0) delta_x = plotArea.right - midPoint.x
      else if (_x < 0) delta_x = plotArea.left - midPoint.x

      const x_portion = delta_x / _x
      let lineend_x = x_portion * _x
      let lineend_y = x_portion * _y
      if (lineend_y + midPoint.y > plotArea.bottom || lineend_y + midPoint.y < plotArea.top) {
        let delta_y = 0
        if (_y > 0) delta_y = plotArea.bottom - midPoint.y
        else delta_y = plotArea.top - midPoint.y

        const y_portion = delta_y / _y
        lineend_x = y_portion * _x
        lineend_y = y_portion * _y
        result = new ScreenPoint(y_portion * _x + midPoint.x, y_portion * _y + midPoint.y)
      } else result = new ScreenPoint(lineend_x + midPoint.x, lineend_y + midPoint.y)
    }
    return result
  }
}
