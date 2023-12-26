import { AxisPosition, LinearColorAxis, OxyPalettes, PlotModel } from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { HeatMapSeriesExamples } from '../Series/HeatMapSeriesExamples'

/** DefaultPalette */
function defaultPalette(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(undefined, false)
  model.axes.length = 0
  model.axes.push(new LinearColorAxis({ position: AxisPosition.Right }))
  return model
}

/** Jet200 */
function jet200(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(200), false)
}

/** Jet20 */
function jet20(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(20), false)
}

/** Hue400 */
function hue400(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.hue(400), false)
}

/** HueDistinct200 */
function hueDistinct200(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.hueDistinct(200), false)
}

/** HueDistinctReverse200 */
function hueDistinctReverse200(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.hueDistinct(200).reverse(), false)
}

/** Hot200 */
function hot200(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.hot(200), false)
}

/** Hot64 */
function hot64(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.hot64, false)
}

/** Hot30 */
function hot30(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.hot(30), false)
}

/** BlueWhiteRed200 */
function blueWhiteRed200(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.blueWhiteRed(200), false)
}

/** BlueWhiteRed40 */
function blueWhiteRed40(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.blueWhiteRed(40), false)
}

/** BlackWhiteRed500 */
function blackWhiteRed500(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.blackWhiteRed(500), false)
}

/** BlackWhiteRed3 */
function blackWhiteRed3(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.blackWhiteRed(3), false)
}

/** Cool200 */
function cool200(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.cool(200), false)
}

/** Rainbow200 */
function rainbow200(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.rainbow(200), false)
}

/** Viridis */
function viridis(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.viridis(), false)
}

/** Plasma */
function plasma(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.plasma(), false)
}

/** Magma */
function magma(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.magma(), false)
}

/** Inferno */
function inferno(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.inferno(), false)
}

/** Cividis */
function cividis(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.cividis(), false)
}

/** Viridis10 */
function viridis10(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.viridis(10), false)
}

/** Rainbow7 */
function rainbow7(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.rainbow(7), false)
}

/** Vertical_6 */
function vertical_6(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(6), false)
}

/** Vertical_Reverse_6 */
function vertical_Reverse_6(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(6), false)
  const colorAxis = model.axes[0] as LinearColorAxis
  colorAxis.startPosition = 1
  colorAxis.endPosition = 0
  return model
}

/** Horizontal_6 */
function horizontal_6(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(6), false)
  const colorAxis = model.axes[0] as LinearColorAxis
  colorAxis.position = AxisPosition.Top
  return model
}

/** Horizontal_Reverse_6 */
function horizontal_Reverse_6(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(6), false)
  const colorAxis = model.axes[0] as LinearColorAxis
  colorAxis.position = AxisPosition.Top
  colorAxis.startPosition = 1
  colorAxis.endPosition = 0
  return model
}

/** RenderAsImage_Horizontal */
function renderAsImage_Horizontal(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(1000), false)
  const colorAxis = model.axes[0] as LinearColorAxis
  colorAxis.renderAsImage = true
  colorAxis.position = AxisPosition.Top
  return model
}

/** RenderAsImage_Horizontal_Reversed */
function renderAsImage_Horizontal_Reversed(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(1000), false)
  const colorAxis = model.axes[0] as LinearColorAxis
  colorAxis.renderAsImage = true
  colorAxis.position = AxisPosition.Top
  colorAxis.startPosition = 1
  colorAxis.endPosition = 0
  return model
}

/** RenderAsImage_Vertical */
function renderAsImage_Vertical(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(1000), false)
  const colorAxis = model.axes[0] as LinearColorAxis
  colorAxis.renderAsImage = true
  return model
}

/** RenderAsImage_Vertical_Reversed */
function renderAsImage_Vertical_Reversed(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(1000), false)
  const colorAxis = model.axes[0] as LinearColorAxis
  colorAxis.renderAsImage = true
  colorAxis.startPosition = 1
  colorAxis.endPosition = 0
  return model
}

/** Vertical_Short */
function vertical_Short(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(600), false)
  const colorAxis = model.axes[0] as LinearColorAxis
  colorAxis.startPosition = 0.02
  colorAxis.endPosition = 0.5
  return model
}

/** Position_None */
function position_None(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks(OxyPalettes.jet(600), false)
  const colorAxis = model.axes[0] as LinearColorAxis
  colorAxis.position = AxisPosition.None
  return model
}

const category = 'LinearColorAxis'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'Default palette',
      example: {
        model: defaultPalette,
      },
    },
    {
      title: 'Jet (200 colors) palette',
      example: {
        model: jet200,
      },
    },
    {
      title: 'Jet (20 colors) palette',
      example: {
        model: jet20,
      },
    },
    {
      title: 'Hue (400 colors) palette',
      example: {
        model: hue400,
      },
    },
    {
      title: 'Hue distinct (200 colors) palette',
      example: {
        model: hueDistinct200,
      },
    },
    {
      title: 'Hue distinct reversed (200 colors) palette',
      example: {
        model: hueDistinctReverse200,
      },
    },
    {
      title: 'Hot (200 colors) palette',
      example: {
        model: hot200,
      },
    },
    {
      title: 'Hot (64 colors) palette',
      example: {
        model: hot64,
      },
    },
    {
      title: 'Hot (30 colors) palette',
      example: {
        model: hot30,
      },
    },
    {
      title: 'Blue-white-red (200 colors) palette',
      example: {
        model: blueWhiteRed200,
      },
    },
    {
      title: 'Blue-white-red (40 colors) palette',
      example: {
        model: blueWhiteRed40,
      },
    },
    {
      title: 'Black-white-red (500 colors) palette',
      example: {
        model: blackWhiteRed500,
      },
    },
    {
      title: 'Black-white-red (3 colors) palette',
      example: {
        model: blackWhiteRed3,
      },
    },
    {
      title: 'Cool (200 colors) palette',
      example: {
        model: cool200,
      },
    },
    {
      title: 'Rainbow (200 colors) palette',
      example: {
        model: rainbow200,
      },
    },
    {
      title: 'Viridis palette',
      example: {
        model: viridis,
      },
    },
    {
      title: 'Plasma palette',
      example: {
        model: plasma,
      },
    },
    {
      title: 'Magma palette',
      example: {
        model: magma,
      },
    },
    {
      title: 'Inferno palette',
      example: {
        model: inferno,
      },
    },
    {
      title: 'Cividis palette',
      example: {
        model: cividis,
      },
    },
    {
      title: 'Viridis (10 colors) palette',
      example: {
        model: viridis10,
      },
    },
    {
      title: 'Rainbow (7 colors) palette',
      example: {
        model: rainbow7,
      },
    },
    {
      title: 'Vertical (6 colors)',
      example: {
        model: vertical_6,
      },
    },
    {
      title: 'Vertical reverse (6 colors)',
      example: {
        model: vertical_Reverse_6,
      },
    },
    {
      title: 'Horizontal (6 colors)',
      example: {
        model: horizontal_6,
      },
    },
    {
      title: 'Horizontal reverse (6 colors)',
      example: {
        model: horizontal_Reverse_6,
      },
    },
    {
      title: 'RenderAsImage (horizontal)',
      example: {
        model: renderAsImage_Horizontal,
      },
    },
    {
      title: 'RenderAsImage (horizontal reversed)',
      example: {
        model: renderAsImage_Horizontal_Reversed,
      },
    },
    {
      title: 'RenderAsImage (vertical)',
      example: {
        model: renderAsImage_Vertical,
      },
    },
    {
      title: 'RenderAsImage (vertical reversed)',
      example: {
        model: renderAsImage_Vertical_Reversed,
      },
    },
    {
      title: 'Short vertical',
      example: {
        model: vertical_Short,
      },
    },
    {
      title: 'Position None',
      example: {
        model: position_None,
      },
    },
  ],
} as ExampleCategory
