export class BinaryWriter {
  private _view: DataView
  private _length: number

  constructor(size?: number) {
    if (!size || size <= 0) {
      size = 1024 // Default size
    }
    this._view = new DataView(new ArrayBuffer(size))
    this._length = 0
  }

  public writeUInt8(value: number): void {
    this.checkAlloc(1)
    this._view.setUint8(this._length, value)
    this._length += 1
  }

  public writeInt8(value: number): void {
    this.checkAlloc(1)
    this._view.setInt8(this._length, value)
    this._length += 1
  }

  public writeUInt16(value: number): void {
    this.checkAlloc(2)
    this._view.setUint16(this._length, value, true)
    this._length += 2
  }

  public writeInt16(value: number): void {
    this.checkAlloc(2)
    this._view.setInt16(this._length, value, true)
    this._length += 2
  }

  public writeUInt32(value: number): void {
    this.checkAlloc(4)
    this._view.setUint32(this._length, value, true)
    this._length += 4
  }

  public writeInt32(value: number): void {
    this.checkAlloc(4)
    this._view.setInt32(this._length, value, true)
    this._length += 4
  }

  public writeFloat(value: number): void {
    this.checkAlloc(4)
    this._view.setFloat32(this._length, value, true)
    this._length += 4
  }

  public writeDouble(value: number): void {
    this.checkAlloc(8)
    this._view.setFloat64(this._length, value, true)
    this._length += 8
  }

  public writeBytes(data: number[]): void {
    this.checkAlloc(data.length)
    for (let i = 0; i < data.length; i++) {
      this._view.setUint8(this._length + i, data[i])
    }
    this._length += data.length
  }

  public writeStringUtf8(value: string): void {
    const encoder = new TextEncoder()
    const encodedData = encoder.encode(value)
    this.checkAlloc(encodedData.length)
    for (let i = 0; i < encodedData.length; i++) {
      this._view.setUint8(this._length + i, encodedData[i])
    }
    this._length += encodedData.length
  }

  public get length(): number {
    return this._length
  }

  public reset(): void {
    this._length = 0
  }

  public toBuffer(): ArrayBuffer {
    return this._view.buffer.slice(0, this._length)
  }

  private checkAlloc(size: number): void {
    const needed = this._length + size
    if (this._view.byteLength >= needed) return
    const newBuffer = new ArrayBuffer(Math.max(needed, this._view.byteLength * 2))
    const newView = new DataView(newBuffer)
    new Uint8Array(newBuffer).set(new Uint8Array(this._view.buffer, 0, this._length))
    this._view = newView
  }
}
