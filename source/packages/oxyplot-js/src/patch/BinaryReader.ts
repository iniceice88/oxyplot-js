export class BinaryReader {
  private offset = 0
  private readonly dataView: DataView


  constructor(private buffer: ArrayBufferLike) {
    this.dataView = new DataView(buffer)
  }

  readByte(): number {
    return this.dataView.getInt8(this.offset++)
  }

  readBytes(count: number): number[] {
    const result: number[] = []
    for (let i = 0; i < count; i++) {
      result.push(this.dataView.getInt8(this.offset++))
    }
    return result
  }

  readString(length: number) {
    const bytes = this.readBytes(length)
    this.offset += length
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes))
  }

  readInt16(littleEndian = true): number {
    const result = this.dataView.getInt16(this.offset, littleEndian)
    this.offset += 2
    return result
  }

  readUint16(littleEndian = true): number {
    const result = this.dataView.getUint16(this.offset, littleEndian)
    this.offset += 2
    return result
  }

  readInt32(littleEndian = true): number {
    const result = this.dataView.getInt32(this.offset, littleEndian)
    this.offset += 4
    return result
  }

  readBigEndianUInt32(): number {
    return this.readUint32(false)
  }

  readUint32(littleEndian = true): number {
    const result = this.dataView.getUint32(this.offset, littleEndian)
    this.offset += 4
    return result
  }

  forward(count: number) {
    this.offset += count
  }
}
