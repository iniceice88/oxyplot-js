import { type OxyColor, OxyColorEx, type PortableDocument } from '@/oxyplot'

/**
 * Provides OxyPlot extension methods for PortableDocument.
 */
export class PortableDocumentExtensions {
  /**
   * Sets the stroke color.
   * @param doc The document.
   * @param oc The color.
   */
  public static setColor(doc: PortableDocument, oc: OxyColor): void {
    const c = OxyColorEx.fromOxyColor(oc)
    doc.setColor(c.r / 255.0, c.g / 255.0, c.b / 255.0)
    doc.setStrokeAlpha(c.a / 255.0)
  }

  /**
   * Sets the fill color.
   * @param doc The document.
   * @param oc The color.
   */
  public static setFillColor(doc: PortableDocument, oc: OxyColor): void {
    const c = OxyColorEx.fromOxyColor(oc)
    doc.setFillColor(c.r / 255.0, c.g / 255.0, c.b / 255.0)
    doc.setFillAlpha(c.a / 255.0)
  }
}
