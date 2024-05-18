import { type OxyRect } from '@/oxyplot'

/**
 * Specifies functionality for an element of a plot.
 */
export abstract class IPlotElement {
  /**
   * Returns a hash code for this element.
   * This method creates the hash code by reflecting the value of all public properties.
   */
  abstract getElementHashCode(): number

  /**
   * Gets the clipping rectangle.
   */
  abstract getClippingRect(): OxyRect
}
