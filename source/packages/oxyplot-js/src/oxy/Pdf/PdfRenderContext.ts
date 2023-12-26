import {
  ClippingRenderContext,
  EdgeRenderingMode,
  HorizontalAlignment,
  LineJoin,
  OxyColor,
  OxyImage,
  OxyRect,
  OxySize,
  PortableDocument,
  PortableDocumentExtensions,
  PortableDocumentImage,
  PortableDocumentImageUtilities,
  ScreenPoint,
  VerticalAlignment,
} from '@/oxyplot'

/** Implements an IRenderContext producing PDF documents by PortableDocument. */
export class PdfRenderContext extends ClippingRenderContext {
  /** The current document. */
  private readonly doc: PortableDocument

  /** The image cache. */
  private readonly images = new Map<OxyImage, PortableDocumentImage>()

  /** Initializes a new instance of the PdfRenderContext class. */
  constructor(width: number, height: number, background: OxyColor) {
    super()
    this.doc = new PortableDocument()
    this.doc.addPageWithDimensions(width, height)
    this.rendersToScreen = false

    if (background.isVisible()) {
      PortableDocumentExtensions.setFillColor(this.doc, background)
      this.doc.fillRectangle(0, 0, width, height)
    }
  }

  /** Saves the output to the specified stream. */
  public save(): ArrayBuffer {
    return this.doc.save()
  }

  /** Draws an ellipse. */
  public async drawEllipse(
    rect: OxyRect,
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    const isStroked = stroke.isVisible() && thickness > 0
    const isFilled = fill.isVisible()
    if (!isStroked && !isFilled) {
      return
    }

    const y = this.doc.pageHeight - rect.bottom
    if (isStroked) {
      this.setLineWidth(thickness)
      PortableDocumentExtensions.setColor(this.doc, stroke)
      if (isFilled) {
        PortableDocumentExtensions.setFillColor(this.doc, fill)
        this.doc.drawEllipse(rect.left, y, rect.width, rect.height, true)
      } else {
        this.doc.drawEllipse(rect.left, y, rect.width, rect.height)
      }
    } else {
      PortableDocumentExtensions.setFillColor(this.doc, fill)
      this.doc.fillEllipse(rect.left, y, rect.width, rect.height)
    }
  }

  /** Draws a polyline. */
  public async drawLine(
    points: ScreenPoint[],
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray: number[] | undefined,
    lineJoin: LineJoin,
  ): Promise<void> {
    PortableDocumentExtensions.setColor(this.doc, stroke)
    this.setLineWidth(thickness)
    if (dashArray) {
      this.setLineDashPattern(dashArray, 0)
    }

    this.doc.setLineJoin(PdfRenderContext.convert(lineJoin))
    const h = this.doc.pageHeight
    this.doc.moveTo(points[0].x, h - points[0].y)
    for (let i = 1; i < points.length; i++) {
      this.doc.lineTo(points[i].x, h - points[i].y)
    }

    this.doc.stroke(false)
    if (dashArray) {
      this.doc.resetLineDashPattern()
    }
  }

  /** Draws a polygon. The polygon can have stroke and/or fill. */
  public async drawPolygon(
    points: ScreenPoint[],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray: number[] | undefined,
    lineJoin: LineJoin,
  ): Promise<void> {
    const isStroked = stroke.isVisible() && thickness > 0
    const isFilled = fill.isVisible()
    if (!isStroked && !isFilled) {
      return
    }

    const h = this.doc.pageHeight
    this.doc.moveTo(points[0].x, h - points[0].y)
    for (let i = 1; i < points.length; i++) {
      this.doc.lineTo(points[i].x, h - points[i].y)
    }

    if (isStroked) {
      PortableDocumentExtensions.setColor(this.doc, stroke)
      this.setLineWidth(thickness)
      if (dashArray) {
        this.setLineDashPattern(dashArray, 0)
      }

      this.doc.setLineJoin(PdfRenderContext.convert(lineJoin))
      if (isFilled) {
        PortableDocumentExtensions.setFillColor(this.doc, fill)
        this.doc.fillAndStroke()
      } else {
        this.doc.stroke()
      }

      if (dashArray) {
        this.doc.resetLineDashPattern()
      }
    } else {
      PortableDocumentExtensions.setFillColor(this.doc, fill)
      this.doc.fill()
    }
  }

  /** Draws a rectangle. */
  public async drawRectangle(
    rect: OxyRect,
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
  ): Promise<void> {
    const isStroked = stroke.isVisible() && thickness > 0
    const isFilled = fill.isVisible()
    if (!isStroked && !isFilled) {
      return
    }

    const y = this.doc.pageHeight - rect.bottom
    if (isStroked) {
      this.setLineWidth(thickness)
      PortableDocumentExtensions.setColor(this.doc, stroke)
      if (isFilled) {
        PortableDocumentExtensions.setFillColor(this.doc, fill)
        this.doc.drawRectangle(rect.left, y, rect.width, rect.height, true)
      } else {
        this.doc.drawRectangle(rect.left, y, rect.width, rect.height)
      }
    } else {
      PortableDocumentExtensions.setFillColor(this.doc, fill)
      this.doc.fillRectangle(rect.left, y, rect.width, rect.height)
    }
  }

  /** Draws the text. */
  public async drawText(
    p: ScreenPoint,
    text: string,
    fill: OxyColor,
    fontFamily: string,
    fontSize: number,
    fontWeight: number,
    rotate: number,
    halign: HorizontalAlignment,
    valign: VerticalAlignment,
    maxSize?: OxySize,
  ): Promise<void> {
    this.doc.saveState()
    this.doc.setFont(fontFamily, (fontSize / 96) * 72, fontWeight > 500)
    PortableDocumentExtensions.setFillColor(this.doc, fill)

    let { width, height } = this.doc.measureText(text)
    if (maxSize) {
      if (width > maxSize.width) {
        width = Math.max(maxSize.width, 0)
      }

      if (height > maxSize.height) {
        height = Math.max(maxSize.height, 0)
      }
    }

    let dx = 0
    if (halign === HorizontalAlignment.Center) {
      dx = -width / 2
    }

    if (halign === HorizontalAlignment.Right) {
      dx = -width
    }

    let dy = 0

    if (valign === VerticalAlignment.Middle) {
      dy = -height / 2
    }

    if (valign === VerticalAlignment.Top) {
      dy = -height
    }

    const y = this.doc.pageHeight - p.y

    this.doc.translate(p.x, y)
    if (Math.abs(rotate) > 1e-6) {
      this.doc.rotate(-rotate)
    }

    this.doc.translate(dx, dy)

    // this.doc.drawRectangle(0, 0, width, height);
    this.doc.setClippingRectangle(0, 0, width, height)
    this.doc.drawText(0, 0, text)
    this.doc.restoreState()
  }

  /** Measures the text. */
  public measureText(text: string, fontFamily: string | undefined, fontSize: number, fontWeight: number): OxySize {
    this.doc.setFont(fontFamily!, (fontSize / 96) * 72, fontWeight > 500)
    const { width, height } = this.doc.measureText(text)
    return new OxySize(width, height)
  }

  /** Draws the specified portion of the specified OxyImage at the specified location and with the specified size. */
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
    let image: PortableDocumentImage | undefined = this.images.get(source)
    if (!image) {
      image = PortableDocumentImageUtilities.convert(source, interpolate)
      if (!image) {
        // TODO: remove this when image decoding is working
        return
      }

      this.images.set(source, image)
    }

    this.doc.saveState()
    const x = destX - (srcX / srcWidth) * destWidth
    const width = (image.width / srcWidth) * destWidth
    const y = destY - (srcY / srcHeight) * destHeight
    const height = (image.height / srcHeight) * destHeight
    this.doc.setClippingRectangle(destX, this.doc.pageHeight - (destY - destHeight), destWidth, destHeight)
    this.doc.translate(x, this.doc.pageHeight - (y + height))
    this.doc.scale(width, height)
    this.doc.drawImage(image)
    this.doc.restoreState()
  }

  /** Sets the clip. */
  protected setClip(clippingRectangle: OxyRect): void {
    this.doc.saveState()
    this.doc.setClippingRectangle(
      clippingRectangle.left,
      clippingRectangle.bottom,
      clippingRectangle.width,
      clippingRectangle.height,
    )
  }

  /** Resets the clip. */
  protected resetClip(): void {
    this.doc.restoreState()
  }

  /** Converts the specified OxyPlot.LineJoin to a OxyPlot.LineJoin. */
  private static convert(lineJoin: LineJoin): LineJoin {
    switch (lineJoin) {
      case LineJoin.Bevel:
        return LineJoin.Bevel
      case LineJoin.Miter:
        return LineJoin.Miter
      default:
        return LineJoin.Round
    }
  }

  /** Sets the width of the line. */
  private setLineWidth(thickness: number): void {
    // Convert from 1/96 inch to points
    this.doc.setLineWidth((thickness / 96) * 72)
  }

  /** Sets the line dash pattern. */
  private setLineDashPattern(dashArray: number[], dashPhase: number): void {
    this.doc.setLineDashPattern(
      dashArray.map((d) => (d / 96) * 72),
      (dashPhase / 96) * 72,
    )
  }
}
