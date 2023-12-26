import type { IXyAxisPlotElement } from '@/oxyplot'

/**
 * The TransposablePlotElement interface.
 */
export type ITransposablePlotElement = IXyAxisPlotElement

export function isTransposablePlotElement(obj: any): obj is ITransposablePlotElement {
  return obj instanceof Object && '__isTransposable' in obj
}

export function setTransposablePlotElement(obj: any) {
  obj.__isTransposable = true
}
