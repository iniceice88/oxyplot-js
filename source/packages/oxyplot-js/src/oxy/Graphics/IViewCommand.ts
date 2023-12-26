import type { IPlotController, IPlotView, OxyInputEventArgs } from '@/oxyplot'

/**
 * Specifies functionality to execute a command on a view.
 */
export interface IViewCommand {
  /**
   * Executes the command on the specified plot.
   * @param view The view.
   * @param controller The controller.
   * @param args The OxyInputEventArgs instance containing the event data.
   */
  execute(view: IPlotView, controller: IPlotController, args: OxyInputEventArgs): void
}

/**
 * Specifies functionality to execute a command on a view.
 */
export interface IViewCommandG<T extends OxyInputEventArgs> extends IViewCommand {
  /**
   * Executes the command on the specified plot.
   * @param view The view.
   * @param controller The controller.
   * @param args The OxyInputEventArgs instance containing the event data.
   */
  execute(view: IPlotView, controller: IPlotController, args: T): void
}
