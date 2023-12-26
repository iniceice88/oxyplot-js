import type { OxyImage } from '@/oxyplot'
import { PortableDocumentImage } from '@/oxyplot'

/**
 * Provides utility methods related to PortableDocumentImage.
 */
export class PortableDocumentImageUtilities {
  /**
   * Converts the specified OxyImage to a PortableDocumentImage.
   * @param image The source image.
   * @param interpolate interpolate if set to true.
   * @returns The converted image.
   */
  public static convert(image: OxyImage, interpolate: boolean): PortableDocumentImage | undefined {
    throw new Error('Not implemented')
  }
}
