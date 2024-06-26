﻿import type { HitTestResult, OxyMouseButton, OxyMouseEventArgs } from '@/oxyplot'

/**
 * Provides data for the mouse down events.
 */
export interface OxyMouseDownEventArgs extends OxyMouseEventArgs {
  /**
   * Gets or sets the mouse button that has changed.
   */
  changedButton: OxyMouseButton

  /**
   * Gets or sets the number of times the button was clicked.
   */
  clickCount: number

  /**
   * Gets or sets the hit test result.
   * @deprecated
   */
  hitTestResult: HitTestResult
}
