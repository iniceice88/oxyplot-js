import type { IPlotController, IPlotView, IViewCommandG, OxyInputEventArgs } from '@/oxyplot'

/**
 * Provides a IViewCommand implemented by a delegate.
 */
export class DelegateViewCommand<T extends OxyInputEventArgs> implements IViewCommandG<T> {
  /**
   * The handler
   */
  private readonly handler: (view: IPlotView, controller: IPlotController, args: T) => void

  /**
   * Initializes a new instance of the DelegateViewCommand class.
   * @param handler The handler.
   */
  constructor(handler: (view: IPlotView, controller: IPlotController, args: T) => void) {
    this.handler = handler
  }

  /**
   * Executes the command on the specified plot.
   * @param view The plot view.
   * @param controller The plot controller.
   * @param args The OxyInputEventArgs instance containing the event data.
   */
  public execute(view: IPlotView, controller: IPlotController, args: T): void {
    this.handler(view, controller, args)
  }

  // /**
  //  * Executes the command on the specified plot.
  //  * @param view The plot view.
  //  * @param controller The plot controller.
  //  * @param args The OxyInputEventArgs instance containing the event data.
  //  */
  // public execute(view: IPlotView, controller: IPlotController, args: OxyInputEventArgs): void {
  //   this.handler(view, controller, args as T)
  // }
}
