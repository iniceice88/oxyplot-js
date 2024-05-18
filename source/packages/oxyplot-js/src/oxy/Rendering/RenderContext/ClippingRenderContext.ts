import { type OxyRect, OxyRectHelper, RenderContextBase } from '@/oxyplot'

/**
 * Provides an abstract base class for rendering contexts that implements a clipping stack.
 */
export abstract class ClippingRenderContext extends RenderContextBase {
  private clipStack: OxyRect[] = []

  /**
   * Pops the clip.
   */
  public popClip(): void {
    if (this.clipStack.length === 0) {
      throw new Error(`Unbalanced call to popClip.`)
    }

    const currentClippingRectangle = this.clipStack.pop()!
    if (this.clipStack.length > 0) {
      const newClippingRectangle = this.clipStack[this.clipStack.length - 1]
      if (!OxyRectHelper.equals(currentClippingRectangle, newClippingRectangle)) {
        this.resetClip()
        this.setClip(newClippingRectangle)
      }
    } else {
      this.resetClip()
    }
  }

  /**
   * Pushes the clip.
   * @param clippingRectangle The clipping rectangle.
   */
  public pushClip(clippingRectangle: OxyRect): void {
    if (this.clipStack.length > 0) {
      const currentClippingRectangle = this.clipStack[this.clipStack.length - 1]
      const newClippingRectangle = OxyRectHelper.intersect(clippingRectangle, currentClippingRectangle)
      if (!OxyRectHelper.equals(currentClippingRectangle, newClippingRectangle)) {
        this.resetClip()
        this.setClip(newClippingRectangle)
      }

      this.clipStack.push(newClippingRectangle)
    } else {
      this.setClip(clippingRectangle)
      this.clipStack.push(clippingRectangle)
    }
  }

  /**
   * Gets the clip count.
   */
  public get clipCount(): number {
    return this.clipStack.length
  }

  /**
   * Resets the clipping area.
   */
  protected abstract resetClip(): void

  /**
   * Sets the clipping area to the specified rectangle.
   * @param clippingRectangle The rectangle.
   */
  protected abstract setClip(clippingRectangle: OxyRect): void
}
