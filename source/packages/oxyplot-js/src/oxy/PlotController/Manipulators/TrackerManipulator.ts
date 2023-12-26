import {
  HitTestArguments,
  type IPlotView,
  MouseManipulator,
  type OxyMouseEventArgs,
  ScreenPoint,
  Series,
  TrackerHelper,
  TrackerHitResult,
} from '@/oxyplot'
import { removeUndef } from '@/patch'

export interface TrackerManipulatorOptions {
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
export class TrackerManipulator extends MouseManipulator {
  /**
   * The current series.
   */
  private currentSeries?: Series

  /**
   * Initializes a new instance of the TrackerManipulator class.
   */
  constructor(plotView: IPlotView, options?: TrackerManipulatorOptions) {
    super(plotView)
    this.snap = true
    this.pointsOnly = false
    this.lockToInitialSeries = true
    this.firesDistance = 20.0
    this.checkDistanceBetweenPoints = false
    this.isTrackAnnotations = true

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
   * Gets or sets a value indicating whether to track annotations.
   */
  public isTrackAnnotations: boolean = true

  /**
   * Occurs when a manipulation is complete.
   * @param e The OxyMouseEventArgs instance containing the event data.
   */
  public completed(e: OxyMouseEventArgs): void {
    super.completed(e)
    e.handled = true

    this.currentSeries = undefined
    this.plotView.hideTracker()
    if (this.plotView.actualModel) {
      this.plotView.actualModel.raiseTrackerChanged(undefined)
    }
  }

  /**
   * Occurs when the input device changes position during a manipulation.
   * @param e The OxyMouseEventArgs instance containing the event data.
   */
  public delta(e: OxyMouseEventArgs): void {
    super.delta(e)
    e.handled = true
    if (!this.currentSeries || !this.lockToInitialSeries) {
      // get the nearest
      this.currentSeries = this.plotView.actualModel?.getSeriesFromPoint(e.position, this.firesDistance)
    }

    if (!this.currentSeries) {
      if (!this.lockToInitialSeries) {
        this.plotView.hideTracker()
      }

      if (this.isTrackAnnotations) {
        this.trackAnnotations(e.position)
      }
      return
    }

    const actualModel = this.plotView.actualModel
    if (!actualModel) {
      return
    }
    if (!actualModel.plotArea.contains(e.position.x, e.position.y)) {
      return
    }
    const result = TrackerHelper.getNearestHit(
      this.currentSeries,
      e.position,
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

  /**
   * Occurs when an input device begins a manipulation on the plot.
   * @param e The OxyMouseEventArgs instance containing the event data.
   */
  public started(e: OxyMouseEventArgs): void {
    super.started(e)
    this.currentSeries = this.plotView.actualModel?.getSeriesFromPoint(e.position, this.firesDistance)
    this.delta(e)
  }

  /**
   * Track Annotations
   */
  private trackAnnotations(sp: ScreenPoint): void {
    const model = this.plotView.actualModel!
    for (const annotation of model.annotations.filter((a) => a.toolTip).reverse()) {
      if (!annotation.toolTip) {
        continue
      }

      const args = new HitTestArguments(sp, this.firesDistance)
      const res = annotation.hitTest(args)

      if (!res) {
        continue
      }

      const dp = annotation.inverseTransform(sp)
      const result = new TrackerHitResult({
        position: sp,
        dataPoint: dp,
        text: annotation.toolTip,
        plotModel: this.plotView.actualModel,
      })

      this.plotView.showTracker(result)
      model.raiseTrackerChanged(result)
      break
    }
  }
}
