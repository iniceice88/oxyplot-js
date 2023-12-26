import type { OxyInputEventArgs } from '@/oxyplot'
import type { ScreenPoint } from '@/oxyplot'
import type { ScreenVector } from '@/oxyplot'

/**
 * Provides data for touch events.
 */
export interface OxyTouchEventArgs extends OxyInputEventArgs {
  /**
   * Gets or sets the position of the touch.
   */
  position: ScreenPoint

  /**
   * Gets or sets the relative change in scale.
   */
  deltaScale: ScreenVector

  /**
   * Gets or sets the change in x and y direction.
   */
  deltaTranslation: ScreenVector
}
