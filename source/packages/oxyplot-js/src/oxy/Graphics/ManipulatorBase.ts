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
   * @param e The OxyInputEventArgs instance containing the event data.
   */
  completed(e: T): void {}

  /**
   * Occurs when the input device changes position during a manipulation.
   * @param e The OxyInputEventArgs instance containing the event data.
   */
  delta(e: T): void {}

  /**
   * Occurs when an input device begins a manipulation on the plot.
   * @param e The OxyInputEventArgs instance containing the event data.
   */
  started(e: T): void {}
}
