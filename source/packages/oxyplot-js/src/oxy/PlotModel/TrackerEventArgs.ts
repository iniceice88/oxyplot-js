import { TrackerHitResult } from '@/oxyplot'

/**
 * Provides data for the tracker event.
 * */
export interface TrackerEventArgs {
  /**
   * Gets or sets the hit result.
   */
  readonly hitResult?: TrackerHitResult
}
