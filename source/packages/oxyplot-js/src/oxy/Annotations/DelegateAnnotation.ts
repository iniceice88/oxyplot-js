import {
  Annotation,
  ExtendedDefaultAnnotationOptions,
  type IRenderContext,
  type OxyRect,
  OxyRect_Everything,
} from '@/oxyplot'

const ExtendedDefaultDelegateAnnotationOptions = ExtendedDefaultAnnotationOptions

/**
 * Represents an annotation that renders by a delegate.
 */
export class DelegateAnnotation extends Annotation {
  /**
   * The rendering delegate.
   */
  private readonly rendering: (rc: IRenderContext) => Promise<void>

  /**
   * Initializes a new instance of the DelegateAnnotation class.
   * @param rendering The rendering delegate.
   */
  constructor(rendering: (rc: IRenderContext) => Promise<void>) {
    super()
    this.rendering = rendering
  }

  getElementName() {
    return 'DelegateAnnotation'
  }

  /**
   * Renders the annotation on the specified context.
   * @param rc The render context.
   */
  public async render(rc: IRenderContext): Promise<void> {
    await this.rendering(rc)
  }

  /**
   * Gets the clipping rect.
   * @returns The clipping rect.
   */
  public getClippingRect(): OxyRect {
    return OxyRect_Everything
  }

  protected getElementDefaultValues(): any {
    return ExtendedDefaultDelegateAnnotationOptions
  }
}
