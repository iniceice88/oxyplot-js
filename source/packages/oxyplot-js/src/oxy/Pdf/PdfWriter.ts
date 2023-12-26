import { BinaryWriter, getEnumName } from '@/patch'

export class ObjectTypeCls {
  private readonly _value: ObjectType

  private constructor(v: ObjectType) {
    this._value = v
  }

  public get value(): ObjectType {
    return this._value
  }

  static from(value: ObjectType): ObjectTypeCls {
    return new ObjectTypeCls(value)
  }
}

/**
 * Specifies the object type.
 * @internal
 */
export enum ObjectType {
  /**
   * The Catalog type.
   */
  Catalog,

  /**
   * The Pages type.
   */
  Pages,

  /**
   * The Page type.
   */
  Page,

  /**
   * The Font type.
   */
  Font,

  /**
   * The XObject type.
   */
  XObject,

  /**
   * The ExtGState type.
   */
  ExtGState,

  /**
   * The FontDescriptor type.
   */
  FontDescriptor,
}

/**
 * Specifies a document object.
 * @internal
 */
export interface IPortableDocumentObject {
  /**
   * Gets the object number.
   */
  readonly objectNumber: number
}

/**
 * Provides a low-level PDF writer.
 */
export class PdfWriter {
  /**
   * The output writer.
   */
  private w: BinaryWriter

  /**
   * Initializes a new instance of the PdfWriter class.
   * @param s The stream.
   */
  constructor() {
    this.w = new BinaryWriter()
  }

  /**
   * Gets the position with the stream.
   */
  public get position(): number {
    return this.w.length
  }

  /**
   * Writes a string.
   * @param str
   */
  public writeString(str: string): void {
    if (!str) return
    this.w.writeStringUtf8(str)
  }

  /**
   * Writes a formatted line.
   * @param str The string.
   */
  public writeLine(str?: string): void {
    this.writeString((str || '') + '\n')
  }

  /**
   * Writes a dictionary.
   * @param dictionary The dictionary.
   */
  public writeDictionary(dictionary: Map<string, any>): void {
    this.writeLine('<<')
    for (const [key, value] of dictionary) {
      this.writeString(key)
      this.writeString(' ')
      this.writeCore(value)
      this.writeLine()
    }

    this.writeString('>>')
  }

  /**
   * Writes a byte array.
   * @param bytes The byte array.
   */
  public writeBytes(bytes: number[]): void {
    this.w.writeBytes(bytes)
  }

  public getStream() {
    return this.w.toBuffer()
  }

  /**
   * Writes an object.
   * @param o The object to write.
   */
  private writeCore(o: any): void {
    if (o?.objectNumber) {
      this.writeString(`${o.objectNumber} 0 R`)
      return
    }

    if (o instanceof ObjectTypeCls) {
      this.writeString('/' + getEnumName(ObjectType, o.value))
      return
    }

    if (typeof o === 'number') {
      this.writeString(o.toString())
      return
    }

    if (typeof o === 'boolean') {
      this.writeString(o ? 'true' : 'false')
      return
    }

    if (o instanceof Date) {
      const dts = `(D:${this.formatDate(o)})`
      this.writeString(dts)
      return
    }

    if (typeof o === 'string') {
      this.writeString(o)
      return
    }

    if (Array.isArray(o)) {
      this.writeList(o)
      return
    }
    if (o instanceof Map || typeof o === 'object') {
      this.writeDictionary(o)
    }
  }

  /**
   * Writes a list.
   * @param list The list.
   */
  private writeList(list: any[]): void {
    this.writeString('[')
    let first = true

    for (const o of list) {
      if (!first) {
        this.writeString(' ')
      } else {
        first = false
      }

      this.writeCore(o)
    }

    this.writeString(']')
  }

  private formatDate(dt: Date): string {
    function fixLeadingZero(n: number): string {
      return n < 10 ? `0${n}` : `${n}`
    }

    const z = Math.round(-dt.getTimezoneOffset() / 60)

    const y = dt.getFullYear()
    const m = fixLeadingZero(dt.getMonth() + 1)
    const d = fixLeadingZero(dt.getDate())
    const h = fixLeadingZero(dt.getHours())
    const mm = fixLeadingZero(dt.getMinutes())
    const s = fixLeadingZero(dt.getSeconds())
    const zz = z < 0 ? `-${fixLeadingZero(-z)}` : `+${fixLeadingZero(z)}`
    return `${y}${m}${d}${h}${mm}${s}${zz}'00`
  }
}
