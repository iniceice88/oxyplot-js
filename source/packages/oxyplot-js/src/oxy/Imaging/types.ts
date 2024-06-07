/**
 * Provides an abstract base class for image encoder options.
 */
export interface ImageEncoderOptions {
  /**
   * The horizontal resolution (in dots per inch).
   * The default value is 96 dpi.
   */
  readonly dpiX: number

  /**
   * The vertical resolution (in dots per inch).
   * The default value is 96 dpi.
   */
  readonly dpiY: number
}

/**
 * Defines the image format.
 */
export enum ImageFormat {
  /**
   * The image is a PNG image.
   */
  Png,
  /**
   * The image is a bitmap image.
   */
  Bmp,
  /**
   * The image is a JPEG image.
   */
  Jpeg,
  /**
   * The image format is unknown.
   */
  Unknown,
}


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
