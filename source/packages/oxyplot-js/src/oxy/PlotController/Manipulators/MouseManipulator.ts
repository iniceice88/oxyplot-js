import { type IPlotView, type OxyMouseEventArgs, PlotManipulator, ScreenPoint } from '@/oxyplot'

/**
 * Provides an abstract base class for manipulators that handles mouse events.
 */
export abstract class MouseManipulator extends PlotManipulator<OxyMouseEventArgs> {
  /**
   * The first position of the manipulation.
   */
  public startPosition: ScreenPoint | undefined

  /**
   * Initializes a new instance of the MouseManipulator class.
   * @param plotView The plot view.
   */
  protected constructor(plotView: IPlotView) {
    super(plotView)
  }

  /**
   * Occurs when an input device begins a manipulation on the plot.
   * @param e The OxyInputEventArgs instance containing the event data.
   */
  public started(e: OxyMouseEventArgs): void {
    this.assignAxes(e.position)
    this.startPosition = e.position
  }
}
