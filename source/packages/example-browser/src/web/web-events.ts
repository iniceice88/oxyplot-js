import {
  OxyModifierKeys,
  OxyMouseButton,
  type OxyMouseDownEventArgs,
  type OxyMouseEventArgs,
  type OxyMouseWheelEventArgs,
  ScreenPoint,
} from 'oxyplot-js'

export function toOxyMouseEventArgs(e: MouseEvent): OxyMouseEventArgs {
  return {
    position: new ScreenPoint(e.offsetX, e.offsetY),
    modifierKeys: convertModifiers(e),
    handled: false,
  } as OxyMouseEventArgs
}

export function toOxyMouseDownEventArgs(e: MouseEvent): OxyMouseDownEventArgs {
  const args = toOxyMouseEventArgs(e) as OxyMouseDownEventArgs
  args.clickCount = e.detail
  args.changedButton = convertMouseButtons(e)
  return args
}

export function toOxyMouseWheelEventArgs(e: WheelEvent): OxyMouseWheelEventArgs {
  const args = toOxyMouseEventArgs(e) as OxyMouseWheelEventArgs
  args.delta = e.deltaY != 0 ? -e.deltaY : e.deltaX
  return args
}

function convertModifiers(e: MouseEvent): OxyModifierKeys {
  let modifiers: OxyModifierKeys = OxyModifierKeys.None
  if (e.ctrlKey) {
    modifiers |= OxyModifierKeys.Control
  }
  if (e.shiftKey) {
    modifiers |= OxyModifierKeys.Shift
  }
  if (e.altKey) {
    modifiers |= OxyModifierKeys.Alt
  }
  if (e.metaKey) {
    modifiers |= OxyModifierKeys.Windows
  }
  return modifiers
}

function convertMouseButtons(e: MouseEvent): number {
  if (e.button === 0) return OxyMouseButton.Left
  if (e.button === 1) return OxyMouseButton.Middle
  if (e.button === 2) return OxyMouseButton.Right
  if (e.button === 3) return OxyMouseButton.XButton1
  if (e.button === 4) return OxyMouseButton.XButton2
  return OxyMouseButton.None
}
