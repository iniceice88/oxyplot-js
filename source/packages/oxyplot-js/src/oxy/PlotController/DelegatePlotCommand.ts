import { DelegateViewCommand, type IPlotController, type IPlotView, type OxyInputEventArgs } from '@/oxyplot'

/**
 * Provides a controller command for the IPlotView implemented by a delegate.
 */
export class DelegatePlotCommand<T extends OxyInputEventArgs> extends DelegateViewCommand<T> {
  /**
   * Initializes a new instance of the DelegatePlotCommand class.
   * @param handler The handler.
   */
  constructor(handler: (view: IPlotView, controller: IPlotController, args: T) => void) {
    super((v, c, e) => handler(v as IPlotView, c, e))
  }
}
