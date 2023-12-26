import type { OxyKeyEventArgs, OxyMouseDownEventArgs, OxyMouseEventArgs, OxyTouchEventArgs } from '@/oxyplot'

export type KeyDownEventType = (sender: any, ev: OxyKeyEventArgs) => void

export type MouseDownEventType = (sender: any, ev: OxyMouseDownEventArgs) => void

export type MouseEventType = (sender: any, ev: OxyMouseEventArgs) => void
export type MouseMoveEventType = MouseEventType
export type MouseUpEventType = MouseEventType
export type MouseEnterEventType = MouseEventType
export type MouseLeaveEventType = MouseEventType

export type TouchEventType = (sender: any, ev: OxyTouchEventArgs) => void
export type TouchStartedEventType = TouchEventType
export type TouchDeltaEventType = TouchEventType
export type TouchCompletedEventType = TouchEventType

export interface IMouseSupport {
  /**
   * Raises the `MouseDown` event.
   */
  onMouseDown: (e: OxyMouseDownEventArgs) => void

  /**
   * Raises the `MouseMove` event.
   */
  onMouseMove: (e: OxyMouseEventArgs) => void

  /**
   * Raises the `KeyDown` event.
   */
  onKeyDown: (e: OxyKeyEventArgs) => void

  /**
   * Raises the `MouseUp` event.
   */
  onMouseUp: (e: OxyMouseEventArgs) => void
}

export interface ITouchSupport {
  /**
   * Raises the `TouchStarted` event.
   */
  onTouchStarted: (e: OxyTouchEventArgs) => void

  /**
   * Raises the `TouchDelta` event.
   */
  onTouchDelta: (e: OxyTouchEventArgs) => void

  /**
   * Raises the `TouchCompleted` event.
   */
  onTouchCompleted: (e: OxyTouchEventArgs) => void
}
