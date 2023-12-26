import type { OxyInputEventArgs, ScreenPoint } from '@/oxyplot'

/**
 * Provides data for the mouse events.
 */
export interface OxyMouseEventArgs extends OxyInputEventArgs {
  /**
   * Gets or sets the position of the mouse cursor.
   */
  position: ScreenPoint
}
