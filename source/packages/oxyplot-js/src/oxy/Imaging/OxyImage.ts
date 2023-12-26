import type { ImageEncoderOptions } from '@/oxyplot'
import { ImageFormat, OxyColor } from '@/oxyplot'
import { type EncodeImageOptions, getImageService, hashCode, type TwoDimensionalArray } from '@/patch'

/**
 * Represents an image.
 */
export class OxyImage {
  /**
   * The image data.
   */
  private readonly _data: Uint8Array

  /**
   * Initializes a new instance of the OxyImage class from the specified stream.
   * @param s the image data.
   */
  constructor(s: Uint8Array) {
    this._data = s
  }

  /**
   * Gets or sets the URI of the image.
   * Not implemented.
   */
  uri?: string

  /**
   * the image format.
   */
  format: ImageFormat = ImageFormat.Unknown
  /**
   * the width of the image.
   */
  width: number = 0
  /**
   * the height of the image.
   */
  height: number = 0
  /**
   *  the number of bits per pixel.
   */
  bitsPerPixel: number = 0
  /**
   * the horizontal resolution of the image.
   */
  dpiX: number = 96
  /**
   * the vertical resolution of the image.
   */
  dpiY: number = 96

  /**
   * Creates an image from 8-bit indexed pixels.
   * @param pixels The pixels indexed as [x,y]. [0,0] is top-left.
   * @param palette The palette.
   * @param format The image format.
   * @param encoderOptions The encoder options.
   * @returns An OxyImage
   */
  public static async create(
    pixels: TwoDimensionalArray<OxyColor> | TwoDimensionalArray<number>,
    format: ImageFormat,
    encoderOptions?: ImageEncoderOptions,
    palette?: OxyColor[],
  ): Promise<OxyImage> {
    const imgService = getImageService()
    const height = pixels.height
    const width = pixels.width
    const opt = {
      pixels: pixels,
      palette: palette,
      imageInfo: {
        width,
        height,
        bitsPerPixel: 0,
        dpiX: encoderOptions?.dpiX,
        dpiY: encoderOptions?.dpiY,
        format: format,
      },
    } as EncodeImageOptions
    const buffer = await imgService.encode(opt)
    const image = new OxyImage(buffer)
    image.width = width
    image.height = height
    return image
  }

  /**
   * Gets the image data.
   * @returns The image data as a byte array.
   */
  public get data(): Uint8Array {
    return this._data
  }

  /**
   * Gets the image format.
   * @param bytes The image bytes.
   * @returns The ImageFormat
   */
  public static getImageFormat(bytes: Uint8Array): ImageFormat {
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
      return ImageFormat.Jpeg
    }

    if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) {
      return ImageFormat.Bmp
    }

    if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return ImageFormat.Png
    }

    return ImageFormat.Unknown
  }

  private _hashCode?: number

  public getHashCode() {
    if (this._hashCode === undefined) {
      this._hashCode = hashCode([...this._data])
    }
    return this._hashCode!
  }
}
