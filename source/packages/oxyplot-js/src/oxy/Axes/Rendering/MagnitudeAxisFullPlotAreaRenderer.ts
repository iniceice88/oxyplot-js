import type { IRenderContext, ScreenPoint } from '@/oxyplot'
import {
  AngleAxis,
  Axis,
  AxisRendererBase,
  HorizontalAlignment,
  MathRenderingExtensions,
  newScreenPoint,
  OxyPen,
  OxyRect,
  PlotModel,
  RenderingExtensions,
  VerticalAlignment,
} from '@/oxyplot'

const degree = 180.0 / Math.PI
/** constants to simplify angular calculations */
const rad = Math.PI / 180.0

/** Provides functionality to render MagnitudeAxis using the full plot area. */
export class MagnitudeAxisFullPlotAreaRenderer extends AxisRendererBase {
  /** this constant limit the number of segments to draw a tick arc */
  private static readonly maxSegments = 180.0

  /** Initializes a new instance of the MagnitudeAxisFullPlotAreaRenderer class. */
  constructor(rc: IRenderContext, plot: PlotModel) {
    super(rc, plot)
  }

  /**
   * Renders the specified axis.
   * @param axis The axis.
   * @param pass The pass.
   * @throws Error Angle axis should not be undefined.
   */
  public async render(axis: Axis, pass: number): Promise<void> {
    await super.render(axis, pass)

    const angleAxis = this.plot.defaultAngleAxis!
    const magnitudeAxis = this.plot.defaultMagnitudeAxis!

    if (!angleAxis) {
      throw new Error('Angle axis should not be undefined.')
    }

    angleAxis.updateActualMaxMin()

    const topDistance = Math.abs(axis.plotModel.plotArea.top - magnitudeAxis.midPoint.y)
    const bottomDistance = Math.abs(axis.plotModel.plotArea.bottom - magnitudeAxis.midPoint.y)
    const leftDistance = Math.abs(axis.plotModel.plotArea.left - magnitudeAxis.midPoint.x)
    const rightDistance = Math.abs(axis.plotModel.plotArea.right - magnitudeAxis.midPoint.x)
    const distanceRect = axis.plotModel.plotArea.offset(-magnitudeAxis.midPoint.x, -magnitudeAxis.midPoint.y)

    const cornerAngleTopRight = -degree * Math.atan2(distanceRect.top, distanceRect.right)
    let cornerAngleTopLeft = -degree * Math.atan2(distanceRect.top, distanceRect.left)
    let cornerAngleBottomLeft = 360 - degree * Math.atan2(distanceRect.bottom, distanceRect.left)
    const cornerAngleBottomRight = 360 - degree * Math.atan2(distanceRect.bottom, distanceRect.right)

    // detect and filter dodgy values caused by zero values
    if (cornerAngleTopLeft < 0) cornerAngleTopLeft += 360
    if (cornerAngleBottomLeft > 360) cornerAngleBottomLeft -= 360

    const cornerDistanceTopRight = Math.sqrt(Math.pow(distanceRect.top, 2) + Math.pow(distanceRect.right, 2))
    const cornerDistanceTopLeft = Math.sqrt(Math.pow(distanceRect.top, 2) + Math.pow(distanceRect.left, 2))
    const cornerDistanceBottomLeft = Math.sqrt(Math.pow(distanceRect.bottom, 2) + Math.pow(distanceRect.left, 2))
    const cornerDistanceBottomRight = Math.sqrt(Math.pow(distanceRect.bottom, 2) + Math.pow(distanceRect.right, 2))

    if (pass === 0 && this.minorPen) {
      const pen = this.minorPen

      for (const tickValue of this.minorTickValues) {
        //a circle consists - in this case - of 4 arcs
        //the start and end of each arc has to be computed

        const r = axis.transform(tickValue)

        //this works by putting the limits of the plotArea into the circular equation and solving it to gain t for each intersection

        let startAngle_0_90 = 0
        let endAngle_0_90 = 90
        let startAngle_90_180 = 90
        let endAngle_90_180 = 180
        let startAngle_180_270 = 180
        let endAngle_180_270 = 270
        let startAngle_270_360 = 270
        let endAngle_270_360 = 360

        const rightPortion = rightDistance / r
        const topPortion = topDistance / r
        const leftPortion = leftDistance / r
        const bottomPortion = bottomDistance / r

        if (r > rightDistance) {
          //will hit the right bound
          endAngle_270_360 = 360 - degree * Math.acos(rightPortion)
          startAngle_0_90 = degree * Math.acos(rightPortion)
        }
        if (r > topDistance) {
          //will hit the top bound
          endAngle_0_90 = degree * Math.asin(topPortion)
          startAngle_90_180 = 180 - degree * Math.asin(topPortion)
        }
        if (r > leftDistance) {
          //will hit the left bound
          endAngle_90_180 = 180 - degree * Math.acos(leftPortion)
          startAngle_180_270 = 180 + degree * Math.acos(leftPortion)
        }
        if (r > bottomDistance) {
          //will hit the bottom bound
          endAngle_180_270 = 180 + degree * Math.asin(bottomPortion)
          startAngle_270_360 = 360 - degree * Math.asin(bottomPortion)
        }

        //Top right
        if (r <= cornerDistanceTopRight) {
          if (startAngle_0_90 < cornerAngleTopRight)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              startAngle_0_90 + angleAxis.offset,
              cornerAngleTopRight + angleAxis.offset,
            )
          if (cornerAngleTopRight < endAngle_0_90)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              cornerAngleTopRight + angleAxis.offset,
              endAngle_0_90 + angleAxis.offset,
            )
        }

        //Top left
        if (r <= cornerDistanceTopLeft) {
          if (startAngle_90_180 < cornerAngleTopLeft)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              startAngle_90_180 + angleAxis.offset,
              cornerAngleTopLeft + angleAxis.offset,
            )
          if (cornerAngleTopLeft < endAngle_90_180)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              cornerAngleTopLeft + angleAxis.offset,
              endAngle_90_180 + angleAxis.offset,
            )
        }

        //Bottom left
        if (r <= cornerDistanceBottomLeft) {
          if (startAngle_180_270 < cornerAngleBottomLeft)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              startAngle_180_270 + angleAxis.offset,
              cornerAngleBottomLeft + angleAxis.offset,
            )
          if (cornerAngleBottomLeft < endAngle_180_270)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              cornerAngleBottomLeft + angleAxis.offset,
              endAngle_180_270 + angleAxis.offset,
            )
        }

        //Bottom right
        if (r <= cornerDistanceBottomRight) {
          if (startAngle_270_360 < cornerAngleBottomRight)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              startAngle_270_360 + angleAxis.offset,
              cornerAngleBottomRight + angleAxis.offset,
            )
          if (cornerAngleBottomRight < endAngle_270_360)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              cornerAngleBottomRight + angleAxis.offset,
              endAngle_270_360 + angleAxis.offset,
            )
        }
      }
    }

    if (pass === 0 && this.majorPen) {
      const pen: OxyPen = this.majorPen
      for (const tickValue of this.majorTickValues) {
        // a circle consists - in this case - of 4 arcs
        // the start and end of each arc has to be computed

        const r: number = axis.transform(tickValue)

        // this works by putting the limits of the plotarea into the circular equation and solving it to gain t for each intersection

        let startangle_0_90: number = 0
        let endangle_0_90: number = 90
        let startangle_90_180: number = 90
        let endangle_90_180: number = 180
        let startangle_180_270: number = 180
        let endangle_180_270: number = 270
        let startangle_270_360: number = 270
        let endangle_270_360: number = 360

        const rightportion: number = rightDistance / r
        const topportion: number = topDistance / r
        const leftportion: number = leftDistance / r
        const bottomportion: number = bottomDistance / r

        if (r > rightDistance) {
          // will hit the right bound
          endangle_270_360 = 360 - degree * Math.acos(rightportion)
          startangle_0_90 = degree * Math.acos(rightportion)
        }
        if (r > topDistance) {
          // will hit the top bound
          endangle_0_90 = degree * Math.asin(topportion)
          startangle_90_180 = 180 - degree * Math.asin(topportion)
        }
        if (r > leftDistance) {
          // will hit the left bound
          endangle_90_180 = 180 - degree * Math.acos(leftportion)
          startangle_180_270 = 180 + degree * Math.acos(leftportion)
        }
        if (r > bottomDistance) {
          // will hit the bottom bound
          endangle_180_270 = 180 + degree * Math.asin(bottomportion)
          startangle_270_360 = 360 - degree * Math.asin(bottomportion)
        }

        // Top right
        if (r <= cornerDistanceTopRight) {
          if (startangle_0_90 < cornerAngleTopRight)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              startangle_0_90 + angleAxis.offset,
              cornerAngleTopRight + angleAxis.offset,
            )
          if (cornerAngleTopRight < endangle_0_90)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              cornerAngleTopRight + angleAxis.offset,
              endangle_0_90 + angleAxis.offset,
            )
        }

        // Top left
        if (r <= cornerDistanceTopLeft) {
          if (startangle_90_180 < cornerAngleTopLeft)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              startangle_90_180 + angleAxis.offset,
              cornerAngleTopLeft + angleAxis.offset,
            )
          if (cornerAngleTopLeft < endangle_90_180)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              cornerAngleTopLeft + angleAxis.offset,
              endangle_90_180 + angleAxis.offset,
            )
        }

        // Bottom left
        if (r <= cornerDistanceBottomLeft) {
          if (startangle_180_270 < cornerAngleBottomLeft)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              startangle_180_270 + angleAxis.offset,
              cornerAngleBottomLeft + angleAxis.offset,
            )
          if (cornerAngleBottomLeft < endangle_180_270)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              cornerAngleBottomLeft + angleAxis.offset,
              endangle_180_270 + angleAxis.offset,
            )
        }

        // Bottom right
        if (r <= cornerDistanceBottomRight) {
          if (startangle_270_360 < cornerAngleBottomRight)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              startangle_270_360 + angleAxis.offset,
              cornerAngleBottomRight + angleAxis.offset,
            )
          if (cornerAngleBottomRight < endangle_270_360)
            await this.renderTickArc(
              axis,
              angleAxis,
              tickValue,
              pen,
              cornerAngleBottomRight + angleAxis.offset,
              endangle_270_360 + angleAxis.offset,
            )
        }
      }
    }

    if (pass === 1) {
      const autoResetClipDisp = RenderingExtensions.autoResetClip(
        this.renderContext,
        OxyRect.fromScreenPoints(axis.screenMin, axis.screenMax),
      )
      for (const tickValue of this.majorLabelValues) {
        await this.renderTickText(axis, tickValue, angleAxis)
      }
      autoResetClipDisp.dispose()
    }
  }

  /** Returns the angle (in radian) of the axis line in screen coordinate */
  private static getActualAngle(axis: Axis, angleAxis: Axis): number {
    const a = axis.transformPoint(0, angleAxis.angle, angleAxis)
    const b = axis.transformPoint(1, angleAxis.angle, angleAxis)
    return Math.atan2(b.y - a.y, b.x - a.x)
  }

  /** Choose the most appropriate alignment for tick text */
  private static getTickTextAligment(actualAngle: number): [HorizontalAlignment, va: VerticalAlignment] {
    let ha: HorizontalAlignment = HorizontalAlignment.Center
    let va: VerticalAlignment = VerticalAlignment.Bottom

    //top
    if (actualAngle > (3 * Math.PI) / 4 || actualAngle < (-3 * Math.PI) / 4) {
      ha = HorizontalAlignment.Center
      va = VerticalAlignment.Top
    }
    //right
    else if (actualAngle < -Math.PI / 4) {
      ha = HorizontalAlignment.Right
      va = VerticalAlignment.Middle
    }
    //left
    else if (actualAngle > Math.PI / 4) {
      ha = HorizontalAlignment.Left
      va = VerticalAlignment.Middle
    }
    //bottom
    else {
      ha = HorizontalAlignment.Center
      va = VerticalAlignment.Bottom
    }

    return [ha, va]
  }

  /** Renders a tick by drawing an lot of segments */
  private async renderTickArc(
    axis: Axis,
    angleAxis: AngleAxis,
    x: number,
    pen: OxyPen,
    startAngle: number,
    endAngle: number,
  ): Promise<void> {
    if (startAngle > endAngle) {
      // Handle this case
    }

    // caution: make sure angleAxis.updateActualMaxMin(); has been called

    // number of segment to draw a full circle
    // - decrease if you want get more speed
    // - increase if you want more detail
    // (making a public property of it would be a great idea)

    // compute the actual number of segments
    let segmentCount = (MagnitudeAxisFullPlotAreaRenderer.maxSegments * Math.abs(endAngle - startAngle)) / 360.0
    if (angleAxis.fractionUnit === Math.PI || angleAxis.actualMaximum === 2 * Math.PI) {
      segmentCount = (MagnitudeAxisFullPlotAreaRenderer.maxSegments * Math.abs(endAngle - startAngle)) / (2 * Math.PI)
      startAngle *= rad
      endAngle *= rad
    }

    segmentCount = Math.max(segmentCount, 2)
    segmentCount = Math.min(segmentCount, MagnitudeAxisFullPlotAreaRenderer.maxSegments)
    const angleStep = Math.abs(endAngle - startAngle) / (segmentCount - 1)

    const points: ScreenPoint[] = []

    for (let i = 0; i < segmentCount; i++) {
      const angle = startAngle + i * angleStep
      const toAdd: ScreenPoint = axis.transformPoint(x, angle, angleAxis)
      points.push(toAdd)
    }

    await this.renderContext.drawLine(points, pen.color, pen.thickness, axis.edgeRenderingMode, pen.actualDashArray)
  }

  /** Renders major tick text */
  private async renderTickText(axis: Axis, x: number, angleAxis: Axis): Promise<void> {
    const actualAngle = MagnitudeAxisFullPlotAreaRenderer.getActualAngle(axis, angleAxis)
    const dx = axis.axisTickToLabelDistance * Math.sin(actualAngle)
    const dy = -axis.axisTickToLabelDistance * Math.cos(actualAngle)

    const [ha, va] = MagnitudeAxisFullPlotAreaRenderer.getTickTextAligment(actualAngle)

    let pt = axis.transformPoint(x, angleAxis.angle, angleAxis)
    pt = newScreenPoint(pt.x + dx, pt.y + dy)

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
