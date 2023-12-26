import { Axis, AxisPosition, type IRenderContext, OxyPen, PlotModel, TickStyle } from '@/oxyplot'

/**
 * Provides an abstract base class for axis renderers.
 */
export abstract class AxisRendererBase {
  /**
   * The plot.
   */
  private readonly _plot: PlotModel

  /**
   * The render context.
   */
  private readonly rc: IRenderContext

  /**
   * The minor tick values
   */
  protected minorTickValues: number[] = []

  /**
   * Initializes a new instance of the AxisRendererBase class.
   * @param rc The render context.
   * @param plot The plot.
   */
  protected constructor(rc: IRenderContext, plot: PlotModel) {
    this._plot = plot
    this.rc = rc
  }

  /**
   * Gets the plot.
   */
  protected get plot(): PlotModel {
    return this._plot
  }

  /**
   * Gets the render context.
   */
  protected get renderContext(): IRenderContext {
    return this.rc
  }

  /**
   * Gets or sets the axis lines pen.
   */
  protected axislinePen?: OxyPen

  /**
   * Gets or sets the extra grid lines pen.
   */
  protected extraPen?: OxyPen

  /**
   * Gets or sets the major label values.
   */
  protected majorLabelValues: number[] = []

  /**
   * Gets or sets the major grid lines pen.
   */
  protected majorPen?: OxyPen

  /**
   * Gets or sets the major tick pen.
   */
  protected majorTickPen?: OxyPen

  /**
   * Gets or sets the major tick values.
   */
  protected majorTickValues: number[] = []

  /**
   * Gets or sets the minor grid lines pen.
   */
  protected minorPen?: OxyPen

  /**
   * Gets or sets the minor tick pen.
   */
  protected minorTickPen?: OxyPen

  /**
   * Gets or sets the zero grid line pen.
   */
  protected zeroPen?: OxyPen

  /**
   * Renders the specified axis.
   * @param axis The axis.
   * @param pass The pass.
   */
  public async render(axis: Axis, pass: number): Promise<void> {
    if (!axis) {
      return
    }

    const { majorLabelValues, majorTickValues, minorTickValues } = axis.getTickValues()
    this.majorLabelValues = majorLabelValues
    this.majorTickValues = majorTickValues
    this.minorTickValues = minorTickValues
    this.createPens(axis)
  }

  /**
   * Creates the pens.
   * @param axis The axis.
   */
  protected createPens(axis: Axis): void {
    const minorTickColor = axis.minorTicklineColor.isAutomatic() ? axis.ticklineColor : axis.minorTicklineColor

    this.minorPen = OxyPen.create(axis.minorGridlineColor, axis.minorGridlineThickness, axis.minorGridlineStyle)
    this.majorPen = OxyPen.create(axis.majorGridlineColor, axis.majorGridlineThickness, axis.majorGridlineStyle)
    this.minorTickPen = OxyPen.create(minorTickColor, axis.minorGridlineThickness)
    this.majorTickPen = OxyPen.create(axis.ticklineColor, axis.majorGridlineThickness)
    this.zeroPen = OxyPen.create(axis.ticklineColor, axis.majorGridlineThickness)
    this.extraPen = OxyPen.create(axis.extraGridlineColor, axis.extraGridlineThickness, axis.extraGridlineStyle)
    this.axislinePen = OxyPen.create(axis.axislineColor, axis.axislineThickness, axis.axislineStyle)
  }

  /**
   * Gets the tick positions.
   * @param axis The axis.
   * @param tickStyle The tick style.
   * @param tickSize The tick size.
   * @param position The position.
   * @param pos
   */
  protected getTickPositions(
    axis: Axis,
    tickStyle: TickStyle,
    tickSize: number,
    position: AxisPosition,
  ): [number, number] {
    let x0 = 0
    let x1 = 0
    const isTopOrLeft = position === AxisPosition.Top || position === AxisPosition.Left
    const sign = isTopOrLeft ? -1 : 1
    switch (tickStyle) {
      case TickStyle.Crossing:
        x0 = -tickSize * sign * 0.75
        x1 = tickSize * sign * 0.75
        break
      case TickStyle.Inside:
        x0 = -tickSize * sign
        break
      case TickStyle.Outside:
        x1 = tickSize * sign
        break
    }
    return [x0, x1]
  }

  /**
   * Determines whether the specified value is within the specified range.
   * @param d The value to check.
   * @param min The minimum value of the range.
   * @param max The maximum value of the range.
   * @returns true if the specified value is within the range; otherwise, false.
   */
  protected isWithin(d: number, min: number, max: number): boolean {
    if (d < min) {
      return false
    }

    return d <= max
  }
}
