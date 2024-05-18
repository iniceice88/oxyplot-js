import {
  AngleAxisFullPlotArea,
  Axis,
  AxisRendererBase,
  HorizontalAlignment,
  type IRenderContext,
  MathRenderingExtensions,
  newScreenPoint,
  type OxyRect,
  OxyRectHelper,
  PlotModel,
  RenderingExtensions,
  type ScreenPoint,
  ScreenPoint_LeftTop,
  VerticalAlignment,
} from '@/oxyplot'

/** Provides functionality to render AngleAxis using the full plot area. */
export class AngleAxisFullPlotAreaRenderer extends AxisRendererBase<AngleAxisFullPlotArea> {
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
  async render(axis: AngleAxisFullPlotArea, pass: number): Promise<void> {
    await super.render(axis, pass)

    const magnitudeAxis = this.plot.defaultMagnitudeAxis

    if (!magnitudeAxis) {
      throw new Error('Magnitude axis not defined.')
    }

    const scaledStartAngle = axis.startAngle / axis.scale
    const scaledEndAngle = axis.endAngle / axis.scale

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
      Math.abs(Math.abs(Math.max(axis.endAngle, axis.startAngle) - Math.min(axis.startAngle, axis.endAngle)) - 360) <
      1e-3

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
      else if (y >= OxyRectHelper.bottom(plotrect)) {
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
      else if (x >= OxyRectHelper.right(plotrect)) {
        ha = HorizontalAlignment.Right
        va = VerticalAlignment.Middle
        x -= axis.axisTickToLabelDistance
      }

      const outsideposition = newScreenPoint(x, y)
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
    let result = ScreenPoint_LeftTop
    let theta = (x - axis.offset) * axis.scale
    theta %= 360.0
    const theta_rad = (theta / 180.0) * Math.PI

    const _x = Math.cos(theta_rad)
    //y is negative because it is from top to bottom
    const _y = -Math.sin(theta_rad)
    //compute intersections with right or lefth side

    if (_x !== 0) {
      let delta_x = 0
      if (_x > 0) delta_x = OxyRectHelper.right(plotArea) - midPoint.x
      else if (_x < 0) delta_x = plotArea.left - midPoint.x

      const x_portion = delta_x / _x
      let lineend_x = x_portion * _x
      let lineend_y = x_portion * _y
      if (lineend_y + midPoint.y > OxyRectHelper.bottom(plotArea) || lineend_y + midPoint.y < plotArea.top) {
        let delta_y = 0
        if (_y > 0) delta_y = OxyRectHelper.bottom(plotArea) - midPoint.y
        else delta_y = plotArea.top - midPoint.y

        const y_portion = delta_y / _y
        lineend_x = y_portion * _x
        lineend_y = y_portion * _y
        result = newScreenPoint(y_portion * _x + midPoint.x, y_portion * _y + midPoint.y)
      } else result = newScreenPoint(lineend_x + midPoint.x, lineend_y + midPoint.y)
    }
    return result
  }
}
