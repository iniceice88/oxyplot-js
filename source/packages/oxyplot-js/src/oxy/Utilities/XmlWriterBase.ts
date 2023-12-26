import { create } from 'xmlbuilder2'
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces'
import type { IDisposable } from '@/patch'

const version = '1.0'
const encoding = 'utf-8'

const log = (msg: string) => {
  //console.log(msg)
}

/**
 * Provides an abstract base class for exporters that write xml.
 */
export abstract class XmlWriterBase implements IDisposable {
  private _no = 0
  /**
   * The xml writer.
   */
  private w: XMLBuilder
  private readonly _stream?: WritableStream
  private _xml: string = ''

  /**
   * Initializes a new instance of the XmlWriterBase class.
   * @param stream The stream.
   */
  protected constructor(stream?: WritableStream) {
    this._stream = stream
    this.w = create({
      version: version,
      encoding: encoding,
    })
  }

  /**
   * Closes this instance.
   */
  public close(): void {}

  /**
   * Flushes this instance.
   */
  public flush(): void {}

  public getXml(): string {
    return this._xml
  }

  /**
   * Writes an attribute string.
   * @param name The name.
   * @param value The value.
   */
  protected writeAttributeString(name: string, value: string): void {
    this._no++
    log(`${this._no},writeAttributeString,${name},${value}`)
    this.w.att(name, value)
  }

  /**
   * Writes an attribute string with a prefix.
   * @param prefix The prefix.
   * @param name The name.
   * @param ns The constant.
   * @param value The value.
   */
  protected writeAttributeString2(prefix: string, name: string, ns: string, value: string): void {
    this._no++
    log(`${this._no},writeAttributeString,${prefix},${name},${ns},${value}`)
    name = prefix ? `${prefix}:${name}` : name
    this.w.att(ns, name, value)
  }

  /**
   * Writes the doc type.
   * @param name The name of the DOCTYPE. This must be non-empty.
   * @param pubid If non-null it also writes PUBLIC "pubid" "sysid" where pubid and sysid are replaced with the value of the given arguments.
   * @param sysid If pubid is null and sysid is non-null it writes SYSTEM "sysid" where sysid is replaced with the value of this argument.
   * @param subset If non-null it writes [subset] where subset is replaced with the value of this argument.
   */
  protected writeDocType(name: string, pubid?: string, sysid?: string, subset?: string): void {
    this._no++
    log(`${this._no},writeDocType,${name},${pubid},${sysid}`)
    this.w.dtd({
      name,
      pubID: pubid,
      sysID: sysid,
    })
    // TODO subset
  }

  /**
   * Writes an element string.
   * @param name The name.
   * @param text The text.
   */
  protected writeElementString(name: string, text: string): void {
    this._no++
    log(`${this._no},writeElementString,${name},${text}`)
    this.writeStartElement(name)
    this.writeString(text)
  }

  /**
   * Writes the end document.
   */
  protected writeEndDocument(): void {
    this._no++
    log(`${this._no},writeEndDocument`)
    this._xml = this.w.end({
      prettyPrint: true,
    })
    this._no = 0
  }

  /**
   * Writes an element end tag.
   */
  protected writeEndElement(): void {
    this._no++
    log(`${this._no},writeEndElement`)
    this.w = this.w.up()
  }

  /**
   * Writes raw text.
   * @param text The text.
   */
  protected writeRaw(text: string): void {
    this._no++
    log(`${this._no},writeRaw,${text}`)
    this.w.dat(text)
  }

  /**
   * Writes the start document.
   * @param standalone The standalone.
   */
  protected writeStartDocument(standalone: boolean): void {
    this._no++
    log(`${this._no},writeStartDocument,${standalone}`)
    this.w.dec({
      version: version,
      encoding: encoding,
      standalone: standalone,
    })
  }

  /**
   * Writes an element start tag.
   * @param name The name.
   * @param ns The ns.
   */
  protected writeStartElement(name: string, ns?: string): void {
    this._no++
    log(`${this._no},writeStartElement,${name},${ns || ''}`)
    if (!ns) {
      this.w = this.w.ele(name)
    } else {
      this.w = this.w.ele(ns, name)
    }
  }

  /**
   * Writes a string.
   * @param text The text.
   */
  protected writeString(text: string): void {
    this._no++
    log(`${this._no},writeString,${text}`)
    this.w.txt(text)
  }

  /// <summary>
  /// The disposed flag.
  /// </summary>
  private _disposed = false

  dispose() {
    if (this._disposed) return
    this._disposed = true

    this.close()
  }
}
