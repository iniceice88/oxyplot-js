import { ImageFormat } from '@/oxyplot'

/**
 * Provides information about an OxyImage.
 */
export interface OxyImageInfo {
  /**
   * The width in pixels.
   */
  width: number

  /**
   * The height in pixels.
   */
  height: number

  /**
   * The bits per pixel.
   */
  bitsPerPixel: number

  /**
   * The horizontal resolution of the image.
   * The resolution in dots per inch (dpi).
   */
  dpiX: number

  /**
   * The vertical resolution of the image.
   * The resolution in dots per inch (dpi).
   */
  dpiY: number

  format: ImageFormat
}
