import {
  ClippingRenderContext,
  EdgeRenderingMode,
  HorizontalAlignment,
  ITextMeasurer,
  LineJoin,
  OxyColor,
  OxyImage,
  OxyImageEx,
  OxyRect,
  OxySize,
  OxySize_Empty,
  ScreenPoint,
  VerticalAlignment,
} from 'oxyplot-js'

export class RecordRenderContext extends ClippingRenderContext {
  private readonly _lines: string[] = []

  constructor(
    width: number,
    height: number,
    isDocument: boolean,
    textMeasurer: ITextMeasurer,
    background: OxyColor,
    useVerticalTextAlignmentWorkaround: boolean = false,
  ) {
    super()
    this.writeLine('create', width, height, isDocument, textMeasurer, background, useVerticalTextAlignmentWorkaround)
  }

  public async drawEllipse(
    rect: OxyRect,
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    this.writeLine('drawEllipse', rect, fill, stroke, thickness, edgeRenderingMode)
  }

  public async drawLine(
    points: ScreenPoint[],
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray: number[],
    lineJoin: LineJoin,
  ): Promise<void> {
    this.writeLine('drawLine', points, stroke, thickness, edgeRenderingMode, dashArray, lineJoin)
  }

  public async drawPolygon(
    points: ScreenPoint[],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray: number[],
    lineJoin: LineJoin,
  ): Promise<void> {
    this.writeLine('drawPolygon', points, fill, stroke, thickness, edgeRenderingMode, dashArray, lineJoin)
  }

  public async drawRectangle(
    rect: OxyRect,
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    this.writeLine('drawRectangle', rect, fill, stroke, thickness, edgeRenderingMode)
  }

  public async drawText(
    p: ScreenPoint,
    text: string,
    c: OxyColor,
    fontFamily: string,
    fontSize: number,
    fontWeight: number,
    rotate: number,
    halign: HorizontalAlignment,
    valign: VerticalAlignment,
    maxSize?: OxySize,
  ): Promise<void> {
    this.writeLine('drawText', p, text, c, fontFamily, fontSize, fontWeight, rotate, halign, valign, maxSize)
  }

  public measureText(_text: string, _fontFamily: string | undefined, _fontSize: number, _fontWeight: number): OxySize {
    return OxySize_Empty
  }

  public async drawImage(
    source: OxyImage,
    srcX: number,
    srcY: number,
    srcWidth: number,
    srcHeight: number,
    destX: number,
    destY: number,
    destWidth: number,
    destHeight: number,
    opacity: number,
    interpolate: boolean,
  ): Promise<void> {
    this.writeLine(
      'drawImage',
      OxyImageEx.from(source).getHashCode(),
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      destX,
      destY,
      destWidth,
      destHeight,
      opacity,
      interpolate,
    )
  }

  private writeLine(...args: any[]) {
    const argsList: string[] = []
    for (const arg of args) {
      if (typeof arg === 'function') {
        argsList.push('function')
      } else if (typeof arg === 'object') {
        argsList.push(JSON.stringify(arg))
      } else {
        argsList.push(String(arg))
      }
    }
    this._lines.push(argsList.join('\t'))
  }

  public getCommands() {
    return this._lines.join('\n')
  }

  protected resetClip(): void {
    this.writeLine('resetClip')
  }

  protected setClip(clippingRectangle: OxyRect): void {
    this.writeLine('setClip', clippingRectangle)
  }
}
