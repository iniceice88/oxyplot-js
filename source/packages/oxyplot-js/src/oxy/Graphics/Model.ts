import {
  type HitTestArguments,
  type HitTestResult,
  type IMouseSupport,
  type ITouchSupport,
  type KeyDownEventType,
  type MouseDownEventType,
  type MouseEnterEventType,
  type MouseLeaveEventType,
  type MouseMoveEventType,
  type MouseUpEventType,
  newHitTestArguments,
  type OxyColor,
  OxyColors,
  type OxyKeyEventArgs,
  type OxyMouseDownEventArgs,
  type OxyMouseEventArgs,
  type OxyTouchEventArgs,
  PlotElement,
  type TouchCompletedEventType,
  type TouchDeltaEventType,
  type TouchStartedEventType,
} from '@/oxyplot'
import { assignObject } from '@/patch'

export interface CreateModelOptions {
  selectionColor?: OxyColor
}

const DefaultCreateModelOptions: CreateModelOptions = {
  selectionColor: OxyColors.Yellow,
}

export const ExtendedModelOptions = DefaultCreateModelOptions

/**
 * An abstract base class for graphics models.
 */
export abstract class Model {
  /**
   * The default selection color.
   */
  public static readonly DefaultSelectionColor = OxyColors.Yellow

  /**
   * Initializes a new instance of the `Model` class.
   */
  protected constructor(opt?: CreateModelOptions) {
    this.selectionColor = OxyColors.Yellow
    assignObject(this, DefaultCreateModelOptions, opt)
  }

  /**
   * Gets or sets the color of the selection.
   */
  public selectionColor: OxyColor = DefaultCreateModelOptions.selectionColor!

  /**
   * Returns the elements that are hit at the specified position.
   * @param args The hit test arguments.
   * @returns
   * A sequence of hit results.
   */
  public hitTest(args: HitTestArguments): HitTestResult[] {
    const hitTestElements = this.getHitTestElements()
    const results: HitTestResult[] = []
    for (const element of hitTestElements) {
      const result = element.hitTest(args)
      if (result) {
        results.push(result)
      }
    }
    return results
  }

  /**
   * Gets all elements of the model, top-level elements first.
   * @returns An enumerator of the elements.
   */
  protected abstract getHitTestElements(): PlotElement[]

  // ==================events==================
  // Mouse hit tolerance.
  private static readonly mouseHitTolerance: number = 10

  // Element receiving mouse move events.
  private currentMouseEventElement?: IMouseSupport

  // Element receiving touch delta events.
  private currentTouchEventElement?: ITouchSupport

  /**
   * Raised when a key is pressed down. (Obsolete)
   * @deprecated Will be removed in v4.0 (#111)
   */
  public keyDown?: KeyDownEventType

  /**
   * Raised when a mouse button is pressed down. (Obsolete)
   * @deprecated Will be removed in v4.0 (#111)
   */
  public mouseDown?: MouseDownEventType

  /**
   * Raised when the mouse is moved. (Obsolete)
   * @deprecated Will be removed in v4.0 (#111)
   */
  public mouseMove?: MouseMoveEventType

  /**
   * Raised when the mouse button is released. (Obsolete)
   * @deprecated Will be removed in v4.0 (#111)
   */
  public mouseUp?: MouseUpEventType

  /**
   * Raised when the mouse cursor enters the plot area. (Obsolete)
   * @deprecated Will be removed in v4.0 (#111)
   */
  public mouseEnter?: MouseEnterEventType

  /**
   * Raised when the mouse cursor leaves the plot area. (Obsolete)
   * @deprecated Will be removed in v4.0 (#111)
   */
  public mouseLeave?: MouseLeaveEventType

  /**
   * Raised when a touch gesture starts. (Obsolete)
   * @deprecated Will be removed in v4.0 (#111)
   */
  public touchStarted?: TouchStartedEventType

  /**
   * Raised when a touch gesture changes. (Obsolete)
   * @deprecated Will be removed in v4.0 (#111)
   */
  public touchDelta?: TouchDeltaEventType

  /**
   * Raised when a touch gesture completes. (Obsolete)
   * @deprecated Will be removed in v4.0 (#111)
   */
  public touchCompleted?: TouchCompletedEventType

  /**
   * Handles mouse down events.
   * @deprecated Will be removed in v4.0 (#111)
   */
  public handleMouseDown(sender: object, e: OxyMouseDownEventArgs): void {
    const args = newHitTestArguments(e.position, Model.mouseHitTolerance)
    for (const result of this.hitTest(args)) {
      e.hitTestResult = result
      const element = result.element as unknown as IMouseSupport
      element.onMouseDown(e)
      if (e.handled) {
        this.currentMouseEventElement = element
        return
      }
    }

    if (!e.handled) {
      this.onMouseDown(sender, e)
    }
  }

  /**
   * Handles mouse move events.
   * @deprecated Will be removed in v4.0 (#111)
   */
  public handleMouseMove(sender: object, e: OxyMouseEventArgs): void {
    if (this.currentMouseEventElement) {
      this.currentMouseEventElement.onMouseMove(e)
    }

    if (!e.handled) {
      this.onMouseMove(sender, e)
    }
  }

  /**
   * Handles mouse up events.
   * @deprecated Will be removed in v4.0 (#111)
   * @param sender
   * @param e
   */
  public handleMouseUp(sender: object, e: OxyMouseEventArgs): void {
    if (this.currentMouseEventElement) {
      this.currentMouseEventElement.onMouseUp(e)
      this.currentMouseEventElement = undefined
    }

    if (!e.handled) {
      this.onMouseUp(sender, e)
    }
  }

  /**
   * Handles mouse enter events.
   * @deprecated Will be removed in v4.0 (#111)
   */
  public handleMouseEnter(sender: object, e: OxyMouseEventArgs): void {
    if (!e.handled) {
      this.onMouseEnter(sender, e)
    }
  }

  /**
   * Handles mouse leave events.
   * @deprecated Will be removed in v4.0 (#111)
   */
  public handleMouseLeave(sender: object, e: OxyMouseEventArgs): void {
    if (!e.handled) {
      this.onMouseLeave(sender, e)
    }
  }

  /**
   * Handles the touch started event.
   * @param sender The sender.
   * @param e A `OxyTouchEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */
  public handleTouchStarted(sender: object, e: OxyTouchEventArgs): void {
    const args = newHitTestArguments(e.position, Model.mouseHitTolerance)
    for (const result of this.hitTest(args)) {
      const element = result.element as unknown as ITouchSupport
      element.onTouchStarted(e)
      if (e.handled) {
        this.currentTouchEventElement = element
        return
      }
    }

    if (!e.handled) {
      this.onTouchStarted(sender, e)
    }
  }

  /**
   * Handles the touch delta event.
   * @param sender The sender.
   * @param e A `OxyTouchEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */
  public handleTouchDelta(sender: object, e: OxyTouchEventArgs): void {
    if (this.currentTouchEventElement) {
      this.currentTouchEventElement.onTouchDelta(e)
    }

    if (!e.handled) {
      this.onTouchDelta(sender, e)
    }
  }

  /**
   * Handles the touch completed event.
   * @param sender The sender.
   * @param e A `OxyTouchEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */
  public handleTouchCompleted(sender: object, e: OxyTouchEventArgs): void {
    if (this.currentTouchEventElement) {
      this.currentTouchEventElement.onTouchCompleted(e)
      this.currentTouchEventElement = undefined
    }

    if (!e.handled) {
      this.onTouchCompleted(sender, e)
    }
  }

  /**
   * Handles key down events.
   * @param sender The sender.
   * @param e The `OxyKeyEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */
  public handleKeyDown(sender: object, e: OxyKeyEventArgs): void {
    for (const element of this.getHitTestElements()) {
      element.onKeyDown(e)

      if (e.handled) {
        break
      }
    }

    if (!e.handled) {
      this.onKeyDown(sender, e)
    }
  }

  /**
   * Raises the `KeyDown` event.
   * @param sender The sender.
   * @param e The `OxyMouseEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */
  protected onKeyDown(sender: object, e: OxyKeyEventArgs): void {
    const handler = this.keyDown
    if (handler) {
      handler(sender, e)
    }
  }

  /**
   * Raises the `MouseDown` event.
   * @param sender The sender.
   * @param e The `OxyMouseEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */
  protected onMouseDown(sender: object, e: OxyMouseDownEventArgs): void {
    const handler = this.mouseDown
    if (handler) {
      handler(sender, e)
    }
  }

  /**
   * Raises the `MouseMove` event.
   * @param sender The sender.
   * @param e The `OxyMouseEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */
  protected onMouseMove(sender: object, e: OxyMouseEventArgs): void {
    const handler = this.mouseMove
    if (handler) {
      handler(sender, e)
    }
  }

  /**
   * Raises the `MouseUp` event.
   * @param sender The sender.
   * @param e The `
   * @deprecated Will be removed in v4.0 (#111)
   */
  protected onMouseUp(sender: object, e: OxyMouseEventArgs): void {
    const handler = this.mouseUp
    if (handler) {
      handler(sender, e)
    }
  }

  /**
   * Raises the `MouseEnter` event.
   * @param sender The sender.
   * @param e The `OxyMouseEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */
  protected onMouseEnter(sender: object, e: OxyMouseEventArgs): void {
    const handler = this.mouseEnter
    if (handler) {
      handler(sender, e)
    }
  }

  /**
   * Raises the `MouseLeave` event.
   * @param sender The sender.
   * @param e The `OxyMouseEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */

  protected onMouseLeave(sender: object, e: OxyMouseEventArgs): void {
    const handler = this.mouseLeave
    if (handler) {
      handler(sender, e)
    }
  }

  /**
   * Raises the `MouseDown` event.
   * @param sender The sender.
   * @param e The `OxyMouseEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */
  protected onTouchStarted(sender: object, e: OxyTouchEventArgs): void {
    const handler = this.touchStarted
    if (handler) {
      handler(sender, e)
    }
  }

  /**
   * Raises the `MouseMove` event.
   * @param sender The sender.
   * @param e The `OxyMouseEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */

  protected onTouchDelta(sender: object, e: OxyTouchEventArgs): void {
    const handler = this.touchDelta
    if (handler) {
      handler(sender, e)
    }
  }

  /**
   * Raises the `MouseUp` event.
   * @param sender The sender.
   * @param e The `OxyMouseEventArgs` instance containing the event data.
   * @deprecated Will be removed in v4.0 (#111)
   */
  protected onTouchCompleted(sender: object, e: OxyTouchEventArgs): void {
    const handler = this.touchCompleted
    if (handler) {
      handler(sender, e)
    }
  }
}
