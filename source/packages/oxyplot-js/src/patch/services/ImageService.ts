import type { OxyImageInfo } from '@/oxyplot'
import { OxyColor, OxyImage } from '@/oxyplot'
import { create2DArray } from '@/patch'
import Image from 'image-js'
import type { TwoDimensionalArray } from '../TwoDimensionalArray'

export interface EncodeImageOptions {
  pixels: TwoDimensionalArray<OxyColor> | TwoDimensionalArray<number>

  /* bmp only */
  palette?: OxyColor[]

  imageInfo: OxyImageInfo
}

export interface ImageService {
  load(uri: string): Promise<OxyImage>

  /**
   * Gets information about the image in the specified byte array.
   * @param bytes The image data.
   * @returns An OxyImageInfo structure.
   */
  getImageInfo(bytes: Uint8Array): Promise<OxyImageInfo>

  /**
   * Decodes an image from the specified byte array.
   * @param bytes The image data.
   * @returns The 32-bit pixel data. The indexing is [x,y] where [0,0] is top-left.
   */
  decode(bytes: Uint8Array): Promise<OxyColor[][]>

  /**
   * Encodes the specified pixels.
   * @returns The image data.
   */
  encode(option: EncodeImageOptions): Promise<Uint8Array>
}

let _imageService: ImageService | null = null

export function getImageService(): ImageService {
  if (_imageService) return _imageService
  _imageService = new DefaultOxyImageService()
  return _imageService
}

export function setImageService(imgService: ImageService) {
  _imageService = imgService
}

class DefaultOxyImageService implements ImageService {
  async decode(bytes: Uint8Array): Promise<OxyColor[][]> {
    const img = await Image.load(bytes)
    const height = img.height
    const width = img.width
    const data = img.data
    const pixels: OxyColor[][] = create2DArray<OxyColor>(width, height)
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        let idx = h * width + w
        const red = data[idx++]
        const green = data[idx++]
        const blue = data[idx++]
        const alpha = data[idx++]
        pixels[h][w] = OxyColor.fromArgb(alpha, red, green, blue)
      }
    }
    return pixels
  }

  encode(option: EncodeImageOptions): Promise<Uint8Array> {
    const view = new DataView(new ArrayBuffer(option.imageInfo.width * option.imageInfo.height * 4))
    let offset = 0
    const pixels = option.pixels
    for (let y = 0; y < option.imageInfo.height; y++) {
      for (let x = 0; x < option.imageInfo.width; x++) {
        const color = pixels.get(x, y) as OxyColor
        view.setUint8(offset++, color.r)
        view.setUint8(offset++, color.g)
        view.setUint8(offset++, color.b)
        view.setUint8(offset++, color.a)
      }
    }

    const buffer = new Image(option.imageInfo.width, option.imageInfo.height, new Uint8Array(view.buffer)).toBuffer()
    return Promise.resolve(buffer)
  }

  async getImageInfo(bytes: Uint8Array): Promise<OxyImageInfo> {
    const image = await Image.load(bytes)
    return {
      width: image.width,
      height: image.height,
      bitsPerPixel: image.bitDepth,
      dpiX: 0,
      dpiY: 0,
      format: OxyImage.getImageFormat(bytes)
    }
  }

  async load(uri: string) {
    const image = await Image.load(uri)
    const buffer = image.toBuffer()

    const oxyImage = new OxyImage(buffer)
    oxyImage.format = OxyImage.getImageFormat(buffer)
    oxyImage.width = image.width
    oxyImage.height = image.height
    return oxyImage
  }
}
