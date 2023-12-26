/**
 * Provides an abstract base class for image encoder options.
 */
export abstract class ImageEncoderOptions {
  /**
   * The horizontal resolution (in dots per inch).
   * The default value is 96 dpi.
   */
  public dpiX: number

  /**
   * The vertical resolution (in dots per inch).
   * The default value is 96 dpi.
   */
  public dpiY: number

  /**
   * Initializes a new instance of the ImageEncoderOptions class.
   */
  protected constructor() {
    this.dpiX = 96
    this.dpiY = 96
  }
}
