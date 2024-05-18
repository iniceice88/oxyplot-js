import { AxisPosition, isTransposablePlotElement, LinearAxis, PlotModel, XYAxisSeries } from '@/oxyplot'

/**
 * Provides utility functions for PlotModel used in examples.
 */
export class PlotModelUtilities {
  private static readonly XAXIS_KEY = 'x'
  private static readonly YAXIS_KEY = 'y'

  /**
   * Lists all XYAxisSeries from the core library that are NOT reversible.
   */
  private static readonly NonReversibleSeriesTypes: Set<string> = new Set()

  /**
   * Lists all Annotations that need axes and are NOT reversible.
   */
  private static readonly NonReversibleDataSpaceAnnotationTypes: Set<string> = new Set([])

  /**
   * Lists all XYAxisSeries from the core library that are NOT transposable.
   */
  private static readonly NonTransposableSeriesTypes: Set<string> = new Set([
    'CandleStickAndVolumeSeries',
    'OldCandleStickSeries',
  ])

  /**
   * Lists all Annotations that need axes and are NOT transposable.
   */
  private static readonly NonTransposableDataSpaceAnnotationTypes: Set<string> = new Set()

  /**
   * Returns a value indicating whether a plot model is reversible.
   * @param model The plot model.
   * @returns True if the plot model in reversible; false otherwise.
   */
  public static isReversible(model: PlotModel): boolean {
    if (model.axes.length === 0 && model.series.length === 0) {
      return false
    }

    for (const a of model.axes) {
      if (a.position === AxisPosition.None) {
        return false
      }
      const isReversibleFlag = (a as any)['__isReversible']
      if (isReversibleFlag !== undefined && !isReversibleFlag) {
        return false
      }
    }

    for (const s of model.series) {
      const type = s.getElementName()
      if (!(s instanceof XYAxisSeries) || this.NonReversibleSeriesTypes.has(type)) {
        return false
      }
    }

    for (const a of model.annotations) {
      const type = a.getElementName()
      if (this.NonReversibleDataSpaceAnnotationTypes.has(type)) {
        return false
      }
    }

    return true
  }

  /**
   * Returns a value indicating whether a plot model is transposable.
   * @param model The plot model.
   * @returns True if the plot model in transposable; false otherwise.
   */
  public static isTransposable(model: PlotModel): boolean {
    if (model.axes.length === 0 && model.series.length === 0) {
      return false
    }

    for (const a of model.axes) {
      if (a.position === AxisPosition.None) {
        return false
      }
    }

    for (const s of model.series) {
      const type = s.getElementName()
      if (!isTransposablePlotElement(s) || this.NonTransposableSeriesTypes.has(type)) {
        return false
      }
    }

    for (const a of model.annotations) {
      const type = a.getElementName()
      if (!isTransposablePlotElement(a) || this.NonTransposableDataSpaceAnnotationTypes.has(type)) {
        return false
      }
    }

    return true
  }

  /**
   * Reverses the X Axis of a PlotModel. The given PlotModel is mutated and returned for convenience.
   * @param model The PlotModel.
   * @returns The PlotModel with reversed X Axis.
   */
  public static reverseXAxis(model: PlotModel): PlotModel {
    if (model.title) {
      model.title += ' (reversed X Axis)'
    }

    let foundXAxis = false
    for (const axis of model.axes) {
      if (axis.position === AxisPosition.Bottom) {
        axis.startPosition = 1 - axis.startPosition
        axis.endPosition = 1 - axis.endPosition
        foundXAxis = true
      }
    }

    if (!foundXAxis) {
      model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, startPosition: 1, endPosition: 0 }))
    }

    return model
  }

  /**
   * Reverses the Y Axis of a PlotModel. The given PlotModel is mutated and returned for convenience.
   * @param model The PlotModel.
   * @returns The PlotModel with reversed Y Axis.
   */
  public static reverseYAxis(model: PlotModel): PlotModel {
    if (model.title) {
      model.title += ' (reversed Y Axis)'
    }

    let foundYAxis = false
    for (const axis of model.axes) {
      if (axis.position === AxisPosition.Left) {
        axis.startPosition = 1 - axis.startPosition
        axis.endPosition = 1 - axis.endPosition
        foundYAxis = true
      }
    }

    if (!foundYAxis) {
      model.axes.push(new LinearAxis({ position: AxisPosition.Left, startPosition: 1, endPosition: 0 }))
    }

    return model
  }

  /**
   * Reverses all axes of a PlotModel. The given PlotModel is mutated and returned for convenience.
   * @param model The PlotModel.
   * @returns The PlotModel with reversed axes.
   */
  public static reverseAllAxes(model: PlotModel): PlotModel {
    if (model.title) {
      model.title += ' (reversed all Axes)'
    }

    // Update plot to generate default axes etc.
    model.update(false)

    for (const axis of model.axes) {
      if (
        axis.position === AxisPosition.Left ||
        axis.position === AxisPosition.Bottom ||
        axis.position === AxisPosition.Right ||
        axis.position === AxisPosition.Top
      ) {
        axis.startPosition = 1 - axis.startPosition
        axis.endPosition = 1 - axis.endPosition
      }
    }

    return model
  }

  /**
   * Transposes a PlotModel. The given PlotModel is mutated and returned for convenience.
   * @param model The PlotModel.
   * @returns The transposed PlotModel.
   */
  public static transpose(model: PlotModel): PlotModel {
    if (model.title) {
      model.title += ' (transposed)'
    }

    // Update plot to generate default axes etc.
    model.update(false)

    for (const axis of model.axes) {
      switch (axis.position) {
        case AxisPosition.Bottom:
          axis.position = AxisPosition.Left
          break
        case AxisPosition.Left:
          axis.position = AxisPosition.Bottom
          break
        case AxisPosition.Right:
          axis.position = AxisPosition.Top
          break
        case AxisPosition.Top:
          axis.position = AxisPosition.Right
          break
        case AxisPosition.None:
          break
        default:
          throw new Error('Invalid axis position')
      }
    }

    for (const annotation of model.annotations) {
      if (annotation.xAxis && !annotation.xAxisKey) {
        if (!annotation.xAxis.key) {
          annotation.xAxis.key = this.XAXIS_KEY
        }

        annotation.xAxisKey = annotation.xAxis.key
      }

      if (annotation.yAxis && !annotation.yAxisKey) {
        if (!annotation.yAxis.key) {
          annotation.yAxis.key = this.YAXIS_KEY
        }

        annotation.yAxisKey = annotation.yAxis.key
      }
    }

    for (const series of model.series) {
      if (!(series instanceof XYAxisSeries)) {
        continue
      }

      if (!series.xAxisKey) {
        if (!series.xAxis) {
          series.xAxisKey = this.XAXIS_KEY
        } else {
          if (!series.xAxis.key) {
            series.xAxis.key = this.XAXIS_KEY
          }

          series.xAxisKey = series.xAxis.key
        }
      }
      if (!series.yAxisKey) {
        if (!series.yAxis) {
          series.yAxisKey = this.YAXIS_KEY
        } else {
          if (!series.yAxis.key) {
            series.yAxis.key = this.YAXIS_KEY
          }

          series.yAxisKey = series.yAxis.key
        }
      }
    }

    return model
  }
}
