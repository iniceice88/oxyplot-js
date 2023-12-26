import {
  EdgeRenderingMode,
  HorizontalAlignment,
  type IRenderContext,
  LineJoin,
  OxyColor,
  OxyImage,
  OxyRect,
  OxySize,
  RenderContextBase,
  ScreenPoint,
  ScreenVector,
  VerticalAlignment,
} from '@/oxyplot'

/**
 * Provides a IRenderContext decorator that distorts the rendered output.
 */
export class XkcdRenderingDecorator extends RenderContextBase {
  /**
   * The decorated IRenderContext. This is the one that does the actual rendering.
   */
  private readonly rc: IRenderContext

  /**
   * Initializes a new instance of the XkcdRenderingDecorator class.
   * @param rc The decorated render context.
   */
  constructor(rc: IRenderContext) {
    super()
    this.rc = rc
    this.rendersToScreen = this.rc.rendersToScreen

    this.distortionFactor = 7
    this.interpolationDistance = 10
    this.thicknessScale = 2

    this.fontFamily = 'Humor Sans' // http://antiyawn.com/uploads/humorsans.html
  }

  /**
   * Gets or sets the distortion factor.
   */
  distortionFactor: number

  /**
   * Gets or sets the interpolation distance.
   */
  interpolationDistance: number

  /**
   * Gets or sets the font family.
   */
  fontFamily: string

  /**
   * Gets or sets the thickness scale.
   */
  thicknessScale: number

  /**
   * Gets the clip count.
   */
  get clipCount(): number {
    return this.rc.clipCount
  }

  /**
   * Draws the line.
   */
  async drawLine(
    points: ScreenPoint[],
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray: number[],
    lineJoin: LineJoin,
  ): Promise<void> {
    const xckdPoints = this.distort(points)
    await this.rc.drawLine(xckdPoints, stroke, thickness * this.thicknessScale, edgeRenderingMode, dashArray, lineJoin)
  }

  /**
   * Draws the polygon.
   */
  async drawPolygon(
    points: ScreenPoint[],
    fill: OxyColor,
    stroke: OxyColor,
    thickness: number,
    edgeRenderingMode: EdgeRenderingMode,
    dashArray: number[],
    lineJoin: LineJoin,
  ): Promise<void> {
    const p = [...points, points[0]]
    const xckdPoints = this.distort(p)
    await this.rc.drawPolygon(
      xckdPoints,
      fill,
      stroke,
      thickness * this.thicknessScale,
      edgeRenderingMode,
      dashArray,
      lineJoin,
    )
  }

  /**
   * Draws the text.
   */
  async drawText(
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
    await this.rc.drawText(
      p,
      text,
      fill,
      this.getFontFamily(fontFamily),
      fontSize,
      fontWeight,
      rotate,
      halign,
      valign,
      maxSize,
    )
  }

  /**
   * Measures the text.
   */
  measureText(text: string, fontFamily: string, fontSize: number, fontWeight: number): OxySize {
    return this.rc.measureText(text, this.getFontFamily(fontFamily), fontSize, fontWeight)
  }

  /**
   * Sets the tool tip for the following items.
   */
  setToolTip(text: string): void {
    this.rc.setToolTip(text)
  }

  /**
   * Cleans up resources not in use.
   */
  cleanUp(): void {
    this.rc.cleanUp()
  }

  /**
   * Draws the image.
   */
  async drawImage(
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
    await this.rc.drawImage(
      source,
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

  /**
   * Pushes the clip.
   */
  pushClip(clippingRectangle: OxyRect): void {
    this.rc.pushClip(clippingRectangle)
  }

  /**
   * Pops the clip.
   */
  popClip(): void {
    this.rc.popClip()
  }

  /**
   * Gets the transformed font family name.
   */
  private getFontFamily(fontFamily: string): string {
    return this.fontFamily
  }

  /**
   * Distorts the specified points.
   * @param points The input points.
   * @returns The distorted points.
   */
  private distort(points: ScreenPoint[]): ScreenPoint[] {
    const interpolated = this.interpolate(points, this.interpolationDistance)
    const result: ScreenPoint[] = new Array(interpolated.length)
    let randomNumbers = this.generateRandomNumbers(interpolated.length)
    randomNumbers = this.applyMovingAverage(randomNumbers, 5)
    const d = this.distortionFactor
    const d2 = d / 2
    for (let i = 0; i < interpolated.length; i++) {
      if (i === 0 || i === interpolated.length - 1) {
        result[i] = interpolated[i]
        continue
      }

      const tangent = interpolated[i + 1].minus(interpolated[i - 1])
      tangent.normalize()
      const normal = new ScreenVector(tangent.y, -tangent.x)

      const delta = normal.times(randomNumbers[i] * d - d2)
      result[i] = interpolated[i].plus(delta)
    }

    return result
  }

  /**
   * Generates an array of random numbers.
   * @param n The number of numbers to generate.
   * @returns The random numbers.
   */
  private generateRandomNumbers(n: number): number[] {
    const result: number[] = new Array(n)
    for (let i = 0; i < n; i++) {
      result[i] = Math.random()
    }
    return result
  }

  /**
   * Applies a moving average filter to the input values.
   * @param input The input values.
   * @param m The number of values to average.
   * @returns The filtered values.
   */
  private applyMovingAverage(input: number[], m: number): number[] {
    const n = input.length
    const result: number[] = new Array(n).fill(0)
    const m2 = Math.round(m / 2)
    for (let i = 0; i < n; i++) {
      const j0 = Math.max(0, i - m2)
      const j1 = Math.min(n - 1, i + m2)
      for (let j = j0; j <= j1; j++) {
        result[i] += input[j]
      }

      result[i] /= m
    }

    return result
  }

  /**
   * Interpolates the input points.
   * @param input The input points.
   * @param dist The interpolation distance.
   * @returns The interpolated points.
   */
  private interpolate(input: ScreenPoint[], dist: number): ScreenPoint[] {
    let p0: ScreenPoint = ScreenPoint.LeftTop
    let l = -1
    let nl = dist
    const result: ScreenPoint[] = []
    for (const p1 of input) {
      if (l < 0) {
        result.push(p1)
        p0 = p1
        l = 0
        continue
      }

      const dp = p1.minus(p0)
      const l1 = dp.length

      if (l1 > 0) {
        while (nl >= l && nl <= l + l1) {
          const f = (nl - l) / l1
          result.push(new ScreenPoint(p0.x * (1 - f) + p1.x * f, p0.y * (1 - f) + p1.y * f))
          nl += dist
        }
      }

      l += l1
      p0 = p1
    }

    result.push(p0)
    return result
  }
}
