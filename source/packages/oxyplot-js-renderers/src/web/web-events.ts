import {
  CursorType,
  newScreenPoint,
  OxyModifierKeys,
  OxyMouseButton,
  type OxyMouseDownEventArgs,
  type OxyMouseEventArgs,
  type OxyMouseWheelEventArgs,
} from 'oxyplot-js'
import { WebPlotViewBase } from './WebPlotViewBase'

export function toOxyMouseEventArgs(e: MouseEvent): OxyMouseEventArgs {
  return {
    position: newScreenPoint(e.offsetX, e.offsetY),
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

export function convertCursorType(cursorType: CursorType) {
  switch (cursorType) {
    case CursorType.Default:
      return 'default'
    case CursorType.Pan:
      return 'grab'
    case CursorType.ZoomRectangle:
      return 'nwse-resize'
    case CursorType.ZoomHorizontal:
      return 'ew-resize'
    case CursorType.ZoomVertical:
      return 'ns-resize'
    default:
      return 'default'
  }
}

export function addPlotViewEvents(view: HTMLElement, plotView: WebPlotViewBase) {
  view.addEventListener('contextmenu', function (event) {
    event.preventDefault()
  })

  view.addEventListener('resize', async () => {
    plotView.invalidatePlot(false)
  })
  view.onmousedown = (e) => {
    plotView.actualController.handleMouseDown(plotView, toOxyMouseDownEventArgs(e))
  }
  view.onmousemove = (e) => {
    plotView.actualController.handleMouseMove(plotView, toOxyMouseEventArgs(e))
  }
  view.onmouseup = (e) => {
    plotView.actualController.handleMouseUp(plotView, toOxyMouseEventArgs(e))
  }
  view.onmouseenter = (e) => {
    plotView.actualController.handleMouseEnter(plotView, toOxyMouseEventArgs(e))
  }
  view.onmouseleave = (e) => {
    plotView.actualController.handleMouseLeave(plotView, toOxyMouseEventArgs(e))
  }
  view.onwheel = (e) => {
    plotView.actualController.handleMouseWheel(plotView, toOxyMouseWheelEventArgs(e))
  }
}
