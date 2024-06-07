import type { OxyColor } from '@/oxyplot'
import { type ImageEncoderOptions, ImageFormat } from './types'
import { type EncodeImageOptions, getImageService, hashCode, type TwoDimensionalArray } from '@/patch'

/**
 * Represents an image.
 */
export interface OxyImage {
  /**
   * Gets or sets the URI of the image.
   * Not implemented.
   */
  uri?: string
  /**
   * the image format.
   */
  format: ImageFormat
  /**
   * the width of the image.
   */
  width: number
  /**
   * the height of the image.
   */
  height: number
  /**
   *  the number of bits per pixel.
   */
  bitsPerPixel: number
  /**
   * the horizontal resolution of the image.
   */
  dpiX: number
  /**
   * the vertical resolution of the image.
   */
  dpiY: number
  /**
   * The image data.
   */
  data: number[]
}

/**
 * Represents an image.
 */
export class OxyImageEx implements OxyImage {
  private _image: OxyImage

  constructor(image: OxyImage) {
    this._image = image
  }

  static from(image: OxyImage) {
    return new OxyImageEx(image)
  }

  /**
   * Gets or sets the URI of the image.
   * Not implemented.
   */
  get uri() {
    return this._image.uri
  }

  /**
   * the image format.
   */
  get format(): ImageFormat {
    return this._image.format
  }

  /**
   * the width of the image.
   */
  get width(): number {
    return this._image.width
  }

  /**
   * the height of the image.
   */
  get height(): number {
    return this._image.height
  }

  /**
   *  the number of bits per pixel.
   */
  get bitsPerPixel(): number {
    return this._image.bitsPerPixel
  }

  /**
   * the horizontal resolution of the image.
   */
  get dpiX(): number {
    return this._image.dpiX
  }

  /**
   * the vertical resolution of the image.
   */
  get dpiY(): number {
    return this._image.dpiY
  }

  /**
   * The image data.
   */
  get data() {
    return this._image.data
  }

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
    const imgInfo = await imgService.getImageInfo(buffer)
    const image = {
      ...imgInfo,
      data: Array.from(buffer),
    } as OxyImage
    image.width = width
    image.height = height

    return image
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
      this._hashCode = hashCode([...this._image.data])
    }
    return this._hashCode!
  }
}
