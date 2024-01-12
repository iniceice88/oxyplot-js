import type { IPlotView, OxyTouchEventArgs, ScreenPoint } from '@/oxyplot'
import { Series, TouchManipulator, TrackerHelper } from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface TouchTrackerManipulatorOptions {
  /**
   * Gets or sets a value indicating whether to show tracker on points only (not interpolating).
   */
  pointsOnly?: boolean

  /**
   * Gets or sets a value indicating whether to snap to the nearest point.
   */
  snap?: boolean

  /**
   * Gets or sets a value indicating whether to lock the tracker to the initial series.
   */
  lockToInitialSeries?: boolean

  /**
   * Gets or sets the distance from the series at which the tracker fires.
   */
  firesDistance?: number

  /**
   * Gets or sets a value indicating whether to check distance when showing tracker between data points.
   */
  checkDistanceBetweenPoints?: boolean
}

/**
 * Provides a plot manipulator for tracker functionality.
 */
export class TouchTrackerManipulator extends TouchManipulator {
  /**
   * The current series.
   */
  private currentSeries?: Series

  /**
   * Initializes a new instance of the TouchTrackerManipulator class.
   */
  constructor(plotView: IPlotView, options?: TouchTrackerManipulatorOptions) {
    super(plotView)
    this.snap = true
    this.pointsOnly = false
    this.lockToInitialSeries = true
    this.firesDistance = 20.0
    this.checkDistanceBetweenPoints = false

    // Note: the tracker manipulator should not handle pan or zoom
    this.setHandledForPanOrZoom = false

    if (options) {
      Object.assign(this, removeUndef(options))
    }
  }

  /**
   * Gets or sets a value indicating whether to show tracker on points only (not interpolating).
   */
  public pointsOnly: boolean

  /**
   * Gets or sets a value indicating whether to snap to the nearest point.
   */
  public snap: boolean

  /**
   * Gets or sets a value indicating whether to lock the tracker to the initial series.
   */
  public lockToInitialSeries: boolean

  /**
   * Gets or sets the distance from the series at which the tracker fires.
   */
  public firesDistance: number

  /**
   * Gets or sets a value indicating whether to check distance when showing tracker between data points.
   */
  public checkDistanceBetweenPoints: boolean

  /**
   * Occurs when a manipulation is complete.
   * @param e The OxyTouchEventArgs instance containing the event data.
   */
  public completed(e: OxyTouchEventArgs): void {
    super.completed(e)

    this.currentSeries = undefined
    this.plotView.hideTracker()
    if (this.plotView.actualModel) {
      this.plotView.actualModel.raiseTrackerChanged(undefined)
    }
  }

  /**
   * Occurs when a touch delta event is handled.
   * @param e The OxyTouchEventArgs instance containing the event data.
   */
  public delta(e: OxyTouchEventArgs): void {
    super.delta(e)

    // This is touch, we want to hide the tracker because the user is probably panning / zooming now
    this.plotView.hideTracker()
  }

  /**
   * Occurs when an input device begins a manipulation on the plot.
   * @param e The OxyTouchEventArgs instance containing the event data.
   */
  public started(e: OxyTouchEventArgs): void {
    super.started(e)
    this.currentSeries = this.plotView.actualModel?.getSeriesFromPoint(e.position, this.firesDistance)

    this.updateTracker(e.position)
  }

  /**
   * Updates the tracker to the specified position.
   * @param position The position.
   */
  private updateTracker(position: ScreenPoint): void {
    if (!this.currentSeries || !this.lockToInitialSeries) {
      // get the nearest
      this.currentSeries = this.plotView.actualModel?.getSeriesFromPoint(position, this.firesDistance)
    }

    if (!this.currentSeries) {
      if (!this.lockToInitialSeries) {
        this.plotView.hideTracker()
      }

      return
    }

    const actualModel = this.plotView.actualModel
    if (!actualModel) {
      return
    }

    if (!actualModel.plotArea.contains(position.x, position.y)) {
      return
    }

    const result = TrackerHelper.getNearestHit(
      this.currentSeries,
      position,
      this.snap,
      this.pointsOnly,
      this.firesDistance,
      this.checkDistanceBetweenPoints,
    )
    if (result) {
      result.plotModel = this.plotView.actualModel
      this.plotView.showTracker(result)
      this.plotView.actualModel.raiseTrackerChanged(result)
    }
  }
}
