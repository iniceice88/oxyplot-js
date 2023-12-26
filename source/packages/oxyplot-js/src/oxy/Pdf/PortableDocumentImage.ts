import { ColorSpace } from '@/oxyplot'

/**
 * Represents an image that can be included in a PortableDocument.
 */
export class PortableDocumentImage {
  /**
   * Initializes a new instance of the PortableDocumentImage class.
   * @param _width The width.
   * @param _height The height.
   * @param _bitsPerComponent The number of bits per component.
   * @param _bits The bits.
   * @param _maskBits The bits of the mask.
   * @param _interpolate Interpolate if set to true.
   * @param _colorSpace The color space.
   */
  constructor(
    private _width: number,
    private _height: number,
    private _bitsPerComponent: number,
    private _bits: number[],
    private _maskBits: number[] | undefined = undefined,
    private _interpolate: boolean = true,
    private _colorSpace: ColorSpace = ColorSpace.DeviceRGB,
  ) {}

  /**
   * Gets the width.
   */
  public get width(): number {
    return this._width
  }

  /**
   * Gets the height.
   */
  public get height(): number {
    return this._height
  }

  /**
   * Gets the bits per component.
   */
  public get bitsPerComponent(): number {
    return this._bitsPerComponent
  }

  /**
   * Gets the color space.
   */
  public get colorSpace(): ColorSpace {
    return this._colorSpace
  }

  /**
   * Gets the bits.
   */
  public get bits(): number[] {
    return this._bits
  }

  /**
   * Gets the mask bits.
   */
  public get maskBits(): number[] | undefined {
    return this._maskBits
  }

  /**
   * Gets a value indicating whether the image is interpolated.
   */
  public get interpolate(): boolean {
    return this._interpolate
  }
}
