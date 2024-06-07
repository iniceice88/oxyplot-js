import type { IPlotView, OxyInputEventArgs } from '@/oxyplot'

/**
 * Provides an abstract base class for controller manipulators.
 */
export abstract class ManipulatorBase<T extends OxyInputEventArgs> {
  protected constructor(plotView: IPlotView) {
    this.view = plotView
  }

  /**
   * The plot view where the event was raised.
   */
  readonly view: IPlotView

  /**
   * Occurs when a manipulation is complete.
   * @param _e The OxyInputEventArgs instance containing the event data.
   */
  completed(_e: T): void {}

  /**
   * Occurs when the input device changes position during a manipulation.
   * @param _e The OxyInputEventArgs instance containing the event data.
   */
  delta(_e: T): void {}

  /**
   * Occurs when an input device begins a manipulation on the plot.
   * @param _e The OxyInputEventArgs instance containing the event data.
   */
  started(_e: T): void {}
}
