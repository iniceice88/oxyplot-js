import type { PortableDocument } from '@/oxyplot'
import { OxyColor } from '@/oxyplot'

/**
 * Provides OxyPlot extension methods for PortableDocument.
 */
export class PortableDocumentExtensions {
  /**
   * Sets the stroke color.
   * @param doc The document.
   * @param c The color.
   */
  public static setColor(doc: PortableDocument, c: OxyColor): void {
    doc.setColor(c.r / 255.0, c.g / 255.0, c.b / 255.0)
    doc.setStrokeAlpha(c.a / 255.0)
  }

  /**
   * Sets the fill color.
   * @param doc The document.
   * @param c The color.
   */
  public static setFillColor(doc: PortableDocument, c: OxyColor): void {
    doc.setFillColor(c.r / 255.0, c.g / 255.0, c.b / 255.0)
    doc.setFillAlpha(c.a / 255.0)
  }
}
