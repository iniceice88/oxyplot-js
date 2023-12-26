import type { IRenderContext } from '@/oxyplot'
import {
  Axis,
  AxisPosition,
  AxisRendererBase,
  EdgeRenderingMode,
  HorizontalAlignment,
  MathRenderingExtensions,
  OxySize,
  PlotModel,
  RenderingExtensions,
  ScreenPoint,
  TickStyle,
  VerticalAlignment,
} from '@/oxyplot'
import { Number_MAX_VALUE } from '@/patch'

/**
 * Provides functionality to render horizontal and vertical axes.
 */
export class HorizontalAndVerticalAxisRenderer extends AxisRendererBase {
  /**
   * Initializes a new instance of the HorizontalAndVerticalAxisRenderer class.
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
   */
  public async render(axis: Axis, pass: number): Promise<void> {
    await super.render(axis, pass)

    let drawAxisLine = true
    const totalShift = axis.axisDistance + axis.positionTierMinShift
    const tierSize = axis.positionTierSize - this.plot.axisTierDistance

    // store properties locally for performance
    const plotAreaLeft = this.plot.plotArea.left
    const plotAreaRight = this.plot.plotArea.right
    const plotAreaTop = this.plot.plotArea.top
    const plotAreaBottom = this.plot.plotArea.bottom

    // Axis position (x or y screen coordinate)
    let axisPosition = 0
    let titlePosition = 0

    switch (axis.position) {
      case AxisPosition.Left:
        axisPosition = plotAreaLeft - totalShift
        break
      case AxisPosition.Right:
        axisPosition = plotAreaRight + totalShift
        break
      case AxisPosition.Top:
        axisPosition = plotAreaTop - totalShift
        break
      case AxisPosition.Bottom:
        axisPosition = plotAreaBottom + totalShift
        break
    }

    if (axis.positionAtZeroCrossing) {
      const perpendicularAxis = (axis.isHorizontal() ? this.plot.defaultYAxis : this.plot.defaultXAxis)!

      // the axis should be positioned at the origin of the perpendicular axis
      axisPosition = perpendicularAxis.transform(0)

      const p0 = axis.isHorizontal() ? perpendicularAxis.screenMin.y : perpendicularAxis.screenMin.x
      const p1 = axis.isHorizontal() ? perpendicularAxis.screenMax.y : perpendicularAxis.screenMax.x

      // find the min/max positions
      let min = Math.min(p0, p1)
      let max = Math.max(p0, p1)

      // also consider the plot area
      const areaMin = axis.isHorizontal() ? plotAreaTop : plotAreaLeft
      const areaMax = axis.isHorizontal() ? plotAreaBottom : plotAreaRight
      min = Math.max(min, areaMin)
      max = Math.min(max, areaMax)

      if (axisPosition < min) {
        axisPosition = min

        const borderThickness = axis.isHorizontal()
          ? this.plot.plotAreaBorderThickness.top
          : this.plot.plotAreaBorderThickness.left
        const borderPosition = axis.isHorizontal() ? this.plot.plotArea.top : this.plot.plotArea.left
        if (axisPosition <= borderPosition && borderThickness > 0 && this.plot.plotAreaBorderColor.isVisible()) {
          // there is already a line here...
          drawAxisLine = false
        }
      }

      if (axisPosition > max) {
        axisPosition = max

        const borderThickness = axis.isHorizontal()
          ? this.plot.plotAreaBorderThickness.bottom
          : this.plot.plotAreaBorderThickness.right
        const borderPosition = axis.isHorizontal() ? this.plot.plotArea.bottom : this.plot.plotArea.right
        if (axisPosition >= borderPosition && borderThickness > 0 && this.plot.plotAreaBorderColor.isVisible()) {
          // there is already a line here...
          drawAxisLine = false
        }
      }
    }

    switch (axis.position) {
      case AxisPosition.Left:
        titlePosition = axisPosition - tierSize
        break
      case AxisPosition.Right:
        titlePosition = axisPosition + tierSize
        break
      case AxisPosition.Top:
        titlePosition = axisPosition - tierSize
        break
      case AxisPosition.Bottom:
        titlePosition = axisPosition + tierSize
        break
    }

    switch (axis.position) {
      case AxisPosition.Left:
      case AxisPosition.Top:
        titlePosition += axis.axisDistance
        break
      case AxisPosition.Right:
      case AxisPosition.Bottom:
        titlePosition -= axis.axisDistance
        break
    }

    if (pass == 0) {
      await this.renderMinorItems(axis, axisPosition)
    }

    if (pass == 1) {
      await this.renderMajorItems(axis, axisPosition, titlePosition, drawAxisLine)
      await this.renderAxisTitle(axis, titlePosition)
    }
  }

  /**
   * Interpolates linearly between two values.
   * @param x0 The x0.
   * @param x1 The x1.
   * @param f The interpolation factor.
   * @returns The interpolated value.
   */
  protected static lerp(x0: number, x1: number, f: number): number {
    // http://en.wikipedia.org/wiki/Linear_interpolation
    return x0 * (1.0 - f) + x1 * f
  }

  /**
   * Snaps v to value if it is within the specified distance.
   * @param target The target value.
   * @param v The value to snap.
   * @param eps The distance tolerance.
   */
  protected static snapTo(target: number, v: number, eps: number = 0.5): number {
    if (v > target - eps && v < target + eps) {
      return target
    }
    return v
  }

  /**
   * Gets the axis title position, rotation and alignment.
   * @param axis The axis.
   * @param titlePosition The title position.
   * @returns The ScreenPoint.
   */
  protected getAxisTitlePositionAndAlignment(axis: Axis, titlePosition: number) {
    let angle = -90
    let halign = HorizontalAlignment.Center
    let valign = VerticalAlignment.Top

    let middle = axis.isHorizontal()
      ? HorizontalAndVerticalAxisRenderer.lerp(axis.screenMin.x, axis.screenMax.x, axis.titlePosition)
      : HorizontalAndVerticalAxisRenderer.lerp(axis.screenMax.y, axis.screenMin.y, axis.titlePosition)

    if (axis.positionAtZeroCrossing) {
      middle = HorizontalAndVerticalAxisRenderer.lerp(
        axis.transform(axis.clipMaximum),
        axis.transform(axis.clipMinimum),
        axis.titlePosition,
      )
    }

    let point = ScreenPoint.LeftTop
    switch (axis.position) {
      case AxisPosition.Left:
        point = new ScreenPoint(titlePosition, middle)
        break
      case AxisPosition.Right:
        valign = VerticalAlignment.Bottom
        point = new ScreenPoint(titlePosition, middle)
        break
      case AxisPosition.Top:
        halign = HorizontalAlignment.Center
        valign = VerticalAlignment.Top
        angle = 0
        point = new ScreenPoint(middle, titlePosition)
        break
      case AxisPosition.Bottom:
        halign = HorizontalAlignment.Center
        valign = VerticalAlignment.Bottom
        angle = 0
        point = new ScreenPoint(middle, titlePosition)
        break
      default:
        throw new Error('Invalid axis position')
    }
    return {
      point,
      angle,
      halign,
      valign,
    }
  }

  /**
   * Renders the axis title.
   * @param axis The axis.
   * @param titlePosition The title position.
   */
  protected async renderAxisTitle(axis: Axis, titlePosition: number): Promise<void> {
    if (!axis.actualTitle) {
      return
    }

    const isHorizontal = axis.isHorizontal()

    let maxSize: OxySize | undefined = undefined

    if (axis.clipTitle) {
      // Calculate the title clipping dimensions
      const screenLength = isHorizontal
        ? Math.abs(axis.screenMax.x - axis.screenMin.x)
        : Math.abs(axis.screenMax.y - axis.screenMin.y)

      maxSize = new OxySize(screenLength * axis.titleClippingLength, Number_MAX_VALUE)
    }

    const { point, angle, halign, valign } = this.getAxisTitlePositionAndAlignment(axis, titlePosition)

    await MathRenderingExtensions.drawMathText(
      this.renderContext,
      point,
      axis.actualTitle,
      axis.actualTitleColor,
      axis.actualTitleFont,
      axis.actualTitleFontSize,
      axis.actualTitleFontWeight,
      angle,
      halign,
      valign,
      maxSize,
    )
  }

  /**
   * Renders the major items.
   * @param axis The axis.
   * @param axisPosition The axis position.
   * @param titlePosition The title position.
   * @param drawAxisLine Draw the axis line if set to true.
   */
  protected async renderMajorItems(
    axis: Axis,
    axisPosition: number,
    titlePosition: number,
    drawAxisLine: boolean,
  ): Promise<void> {
    const eps = axis.actualMinorStep * 1e-3

    const clipMinimum = axis.clipMinimum
    const clipMaximum = axis.clipMaximum

    const plotAreaLeft = this.plot.plotArea.left
    const plotAreaRight = this.plot.plotArea.right
    const plotAreaTop = this.plot.plotArea.top
    const plotAreaBottom = this.plot.plotArea.bottom
    const isHorizontal = axis.isHorizontal()
    const cropGridlines = axis.cropGridlines

    const majorSegments: ScreenPoint[] = []
    const majorTickSegments: ScreenPoint[] = []
    const [a0, a1] = this.getTickPositions(axis, axis.tickStyle, axis.majorTickSize, axis.position)
    const perpendicularAxis = axis.isHorizontal() ? this.plot.defaultYAxis : this.plot.defaultXAxis
    const dontRenderZero = axis.positionAtZeroCrossing && perpendicularAxis?.positionAtZeroCrossing

    let perpAxes: Axis[] = []
    if (cropGridlines) {
      if (isHorizontal) {
        perpAxes = this.plot.axes.filter((x) => x.isXyAxis() && x.isVertical())
      } else {
        perpAxes = this.plot.axes.filter((x) => x.isXyAxis() && x.isHorizontal())
      }
    }

    const snapTo = HorizontalAndVerticalAxisRenderer.snapTo

    for (const value of this.majorTickValues) {
      if (dontRenderZero && Math.abs(value) < eps) {
        continue
      }

      let transformedValue = axis.transform(value)
      if (isHorizontal) {
        transformedValue = snapTo(plotAreaLeft, transformedValue)
        transformedValue = snapTo(plotAreaRight, transformedValue)
      } else {
        transformedValue = snapTo(plotAreaTop, transformedValue)
        transformedValue = snapTo(plotAreaBottom, transformedValue)
      }

      if (this.majorPen) {
        this.addSegments(
          majorSegments,
          perpAxes,
          isHorizontal,
          cropGridlines,
          transformedValue,
          plotAreaLeft,
          plotAreaRight,
          plotAreaTop,
          plotAreaBottom,
        )
      }

      if (axis.tickStyle != TickStyle.None && axis.majorTickSize > 0) {
        if (isHorizontal) {
          majorTickSegments.push(new ScreenPoint(transformedValue, axisPosition + a0))
          majorTickSegments.push(new ScreenPoint(transformedValue, axisPosition + a1))
        } else {
          majorTickSegments.push(new ScreenPoint(axisPosition + a0, transformedValue))
          majorTickSegments.push(new ScreenPoint(axisPosition + a1, transformedValue))
        }
      }
    }

    // Render the axis labels (numbers or category names)
    for (const value of this.majorLabelValues) {
      if (value < clipMinimum - eps || value > clipMaximum + eps) {
        continue
      }

      if (dontRenderZero && Math.abs(value) < eps) {
        continue
      }

      let transformedValue = axis.transform(value)
      if (isHorizontal) {
        transformedValue = snapTo(plotAreaLeft, transformedValue)
        transformedValue = snapTo(plotAreaRight, transformedValue)
      } else {
        transformedValue = snapTo(plotAreaTop, transformedValue)
        transformedValue = snapTo(plotAreaBottom, transformedValue)
      }

      let pt = new ScreenPoint()
      let haVa: [HorizontalAlignment, VerticalAlignment] = [HorizontalAlignment.Center, VerticalAlignment.Middle]
      switch (axis.position) {
        case AxisPosition.Left:
          pt = new ScreenPoint(axisPosition + a1 - axis.axisTickToLabelDistance, transformedValue)
          haVa = this.getRotatedAlignments(axis.angle, -90)
          break
        case AxisPosition.Right:
          pt = new ScreenPoint(axisPosition + a1 + axis.axisTickToLabelDistance, transformedValue)
          haVa = this.getRotatedAlignments(axis.angle, 90)
          break
        case AxisPosition.Top:
          pt = new ScreenPoint(transformedValue, axisPosition + a1 - axis.axisTickToLabelDistance)
          haVa = this.getRotatedAlignments(axis.angle, 0)
          break
        case AxisPosition.Bottom:
          pt = new ScreenPoint(transformedValue, axisPosition + a1 + axis.axisTickToLabelDistance)
          haVa = this.getRotatedAlignments(axis.angle, -180)
          break
      }

      const [ha, va] = haVa
      const text = axis.formatValue(value)
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
    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      axis.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )

    // Draw extra grid lines
    if (axis.extraGridlines && this.extraPen) {
      const extraSegments: ScreenPoint[] = []

      for (const value of axis.extraGridlines) {
        if (!this.isWithin(value, clipMinimum, clipMaximum)) {
          continue
        }

        const transformedValue = axis.transform(value)
        this.addSegments(
          extraSegments,
          perpAxes,
          isHorizontal,
          cropGridlines,
          transformedValue,
          plotAreaLeft,
          plotAreaRight,
          plotAreaTop,
          plotAreaBottom,
        )
      }

      await RenderingExtensions.drawLineSegments(
        this.renderContext,
        extraSegments,
        this.extraPen,
        actualEdgeRenderingMode,
      )
    }

    if (drawAxisLine) {
      // Draw the axis line (across the tick marks)
      if (isHorizontal) {
        await RenderingExtensions.drawLine(
          this.renderContext,
          axis.transform(clipMinimum),
          axisPosition,
          axis.transform(clipMaximum),
          axisPosition,
          this.axislinePen,
          actualEdgeRenderingMode,
        )
      } else {
        await RenderingExtensions.drawLine(
          this.renderContext,
          axisPosition,
          axis.transform(clipMinimum),
          axisPosition,
          axis.transform(clipMaximum),
          this.axislinePen,
          actualEdgeRenderingMode,
        )
      }
    }

    if (this.majorPen) {
      await RenderingExtensions.drawLineSegments(
        this.renderContext,
        majorSegments,
        this.majorPen,
        actualEdgeRenderingMode,
      )
    }

    if (this.majorTickPen) {
      await RenderingExtensions.drawLineSegments(
        this.renderContext,
        majorTickSegments,
        this.majorTickPen,
        actualEdgeRenderingMode,
      )
    }
  }

  /**
   * Renders the minor items.
   * @param axis The axis.
   * @param axisPosition The axis position.
   */
  protected async renderMinorItems(axis: Axis, axisPosition: number): Promise<void> {
    const eps = axis.actualMinorStep * 1e-3

    const plotAreaLeft = this.plot.plotArea.left
    const plotAreaRight = this.plot.plotArea.right
    const plotAreaTop = this.plot.plotArea.top
    const plotAreaBottom = this.plot.plotArea.bottom
    const cropGridlines = axis.cropGridlines
    const isHorizontal = axis.isHorizontal()

    const minorSegments: ScreenPoint[] = []
    const minorTickSegments: ScreenPoint[] = []

    let perpAxes: Axis[] = []
    if (cropGridlines) {
      if (isHorizontal) {
        perpAxes = this.plot.axes.filter((x) => x.isXyAxis() && x.isVertical())
      } else {
        perpAxes = this.plot.axes.filter((x) => x.isXyAxis() && x.isHorizontal())
      }
    }

    const [a0, a1] = this.getTickPositions(axis, axis.tickStyle, axis.minorTickSize, axis.position)
    const snapTo = HorizontalAndVerticalAxisRenderer.snapTo
    for (const value of this.minorTickValues) {
      if (axis.positionAtZeroCrossing && Math.abs(value) < eps) {
        continue
      }

      let transformedValue = axis.transform(value)

      if (isHorizontal) {
        transformedValue = snapTo(plotAreaLeft, transformedValue)
        transformedValue = snapTo(plotAreaRight, transformedValue)
      } else {
        transformedValue = snapTo(plotAreaTop, transformedValue)
        transformedValue = snapTo(plotAreaBottom, transformedValue)
      }

      // Draw the minor grid line
      if (this.minorPen) {
        this.addSegments(
          minorSegments,
          perpAxes,
          isHorizontal,
          cropGridlines,
          transformedValue,
          plotAreaLeft,
          plotAreaRight,
          plotAreaTop,
          plotAreaBottom,
        )
      }

      // Draw the minor tick
      if (axis.tickStyle != TickStyle.None && axis.minorTickSize > 0) {
        if (isHorizontal) {
          minorTickSegments.push(new ScreenPoint(transformedValue, axisPosition + a0))
          minorTickSegments.push(new ScreenPoint(transformedValue, axisPosition + a1))
        } else {
          minorTickSegments.push(new ScreenPoint(axisPosition + a0, transformedValue))
          minorTickSegments.push(new ScreenPoint(axisPosition + a1, transformedValue))
        }
      }
    }

    const actualEdgeRenderingMode = RenderingExtensions.getActualEdgeRenderingMode(
      axis.edgeRenderingMode,
      EdgeRenderingMode.PreferSharpness,
    )

    // Draw all the line segments
    if (this.minorPen) {
      await RenderingExtensions.drawLineSegments(
        this.renderContext,
        minorSegments,
        this.minorPen,
        actualEdgeRenderingMode,
      )
    }

    if (this.minorTickPen) {
      await RenderingExtensions.drawLineSegments(
        this.renderContext,
        minorTickSegments,
        this.minorTickPen,
        actualEdgeRenderingMode,
      )
    }
  }

  /**
   * Adds segments to segments array.
   * If cropGridlines is true, then lines will be cropped with perpAxes lists axes.
   * @param segments The target segments.
   * @param perpAxes Perpendicular axes list.
   * @param isHorizontal True, if current axis is horizontal.
   * @param cropGridlines True, if gridlines should be cropped.
   * @param transformedValue Starting point position.
   * @param plotAreaLeft Plot area left position.
   * @param plotAreaRight Plot area right position.
   * @param plotAreaTop Plot area top position.
   * @param plotAreaBottom Plot area bottom position.
   */
  private addSegments(
    segments: ScreenPoint[],
    perpAxes: Axis[],
    isHorizontal: boolean,
    cropGridlines: boolean,
    transformedValue: number,
    plotAreaLeft: number,
    plotAreaRight: number,
    plotAreaTop: number,
    plotAreaBottom: number,
  ): void {
    if (isHorizontal) {
      if (!cropGridlines) {
        segments.push(new ScreenPoint(transformedValue, plotAreaTop))
        segments.push(new ScreenPoint(transformedValue, plotAreaBottom))
      } else {
        for (const perpAxis of perpAxes) {
          segments.push(new ScreenPoint(transformedValue, perpAxis.transform(perpAxis.clipMinimum)))
          segments.push(new ScreenPoint(transformedValue, perpAxis.transform(perpAxis.clipMaximum)))
        }
      }
    } else {
      if (!cropGridlines) {
        segments.push(new ScreenPoint(plotAreaLeft, transformedValue))
        segments.push(new ScreenPoint(plotAreaRight, transformedValue))
      } else {
        for (const perpAxis of perpAxes) {
          segments.push(new ScreenPoint(perpAxis.transform(perpAxis.clipMinimum), transformedValue))
          segments.push(new ScreenPoint(perpAxis.transform(perpAxis.clipMaximum), transformedValue))
        }
      }
    }
  }

  /**
   * Gets the alignments given the specified rotation angle.
   * @param boxAngle The angle of a box to rotate (usually it is label angle).
   * @param axisAngle The axis angle, the original angle belongs to. The Top axis should have 0, next angles are computed clockwise.
   * The angle should be in [-180, 180). (T, R, B, L) is (0, 90, -180, -90).
   * @remarks This method is supposed to compute the alignment of the labels that are put near axis.
   * Because such labels can have different angles, and the axis can have different angles as well,
   * computing the alignment is not straightforward.
   */
  private getRotatedAlignments(boxAngle: number, axisAngle: number): [HorizontalAlignment, VerticalAlignment] {
    const AngleTolerance = 10.0

    // The axis angle if it would have been turned on 180 and leave it in [-180, 180)
    const flippedAxisAngle = ((axisAngle + 360.0) % 360.0) - 180.0

    // When the box (assuming the axis and box have the same angle) box starts to turn clockwise near the axis
    // It leans on the right until it gets to 180 rotation, when it is started to lean on the left.
    // In real computation we need to compute this in relation with axisAngle
    // So if axisAngle <= boxAngle < (axisAngle + 180), we align Right, else - left.
    // The check looks inverted because flippedAxisAngle has the opposite sign.
    let ha =
      boxAngle >= Math.min(axisAngle, flippedAxisAngle) && boxAngle < Math.max(axisAngle, flippedAxisAngle)
        ? HorizontalAlignment.Left
        : HorizontalAlignment.Right

    let va = VerticalAlignment.Middle

    // If axisAngle was < 0, we need to shift the previous computation on 180.
    if (axisAngle < 0) {
      ha = ha === HorizontalAlignment.Left ? HorizontalAlignment.Right : HorizontalAlignment.Left
    }

    // If the angle almost the same as axisAngle (or axisAngle + 180) - set horizontal alignment to Center
    if (Math.abs(boxAngle - flippedAxisAngle) < AngleTolerance || Math.abs(boxAngle - axisAngle) < AngleTolerance) {
      ha = HorizontalAlignment.Center
    }

    // And vertical alignment according to whether it is near to axisAngle or flippedAxisAngle
    if (Math.abs(boxAngle - axisAngle) < AngleTolerance) {
      va = VerticalAlignment.Bottom
    }

    if (Math.abs(boxAngle - flippedAxisAngle) < AngleTolerance) {
      va = VerticalAlignment.Top
    }

    return [ha, va]
  }
}
