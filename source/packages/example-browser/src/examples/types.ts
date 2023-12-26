import type { IPlotController } from 'oxyplot-js'
import { PlotModel } from 'oxyplot-js'

export interface Example {
  model: () => PlotModel | Promise<PlotModel>
  controller?: () => IPlotController
}

export interface ExampleCategory {
  category: string
  tags?: string[]
  examples: ExampleInfo[]
}

export interface ExampleInfo {
  title: string
  example: Example
}
