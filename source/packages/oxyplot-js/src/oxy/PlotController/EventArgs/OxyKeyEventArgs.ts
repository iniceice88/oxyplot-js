import type { OxyInputEventArgs } from '@/oxyplot'
import type { OxyKey } from '@/oxyplot'

/**
 * Provides data for key events.
 */
export interface OxyKeyEventArgs extends OxyInputEventArgs {
  /**
   * Gets or sets the key.
   */
  key: OxyKey
}
