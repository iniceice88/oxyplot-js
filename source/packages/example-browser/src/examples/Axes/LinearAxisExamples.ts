import { AxisPosition, type AxisStringFormatterType, LinearAxis, LineStyle, PlotModel, TickStyle } from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function stringFormat(): PlotModel {
  // eslint-disable-next-line no-loss-of-precision
  return createExample(1.234567890123456789e5, 1.234567890123456789e6, undefined)
}

function stringFormatF2(): PlotModel {
  // eslint-disable-next-line no-loss-of-precision
  return createExample(1.234567890123456789e5, 1.234567890123456789e6, (x, args) => {
    return x.toFixed(2)
  })
}

/** TickStyle: None */
function tickStyleNone(): PlotModel {
  return createTickStyleModel(TickStyle.None)
}

/** TickStyle: Crossing */
function tickStyleCrossing(): PlotModel {
  return createTickStyleModel(TickStyle.Crossing)
}

/** TickStyle: Inside */
function tickStyleInside(): PlotModel {
  return createTickStyleModel(TickStyle.Inside)
}

/** TickStyle: Outside */
function tickStyleOutside(): PlotModel {
  return createTickStyleModel(TickStyle.Outside)
}

/** Gridlines: None */
function gridlinesNone(): PlotModel {
  return createGridlinesModel('None', LineStyle.None, LineStyle.None)
}

/** Gridlines: Horizontal */
function gridlinesHorizontal(): PlotModel {
  return createGridlinesModel('Horizontal', LineStyle.Solid, LineStyle.None)
}

/** Gridlines: Vertical */
function gridlinesVertical(): PlotModel {
  return createGridlinesModel('Vertical', LineStyle.None, LineStyle.Solid)
}

/** Gridlines: Both */
function gridlinesBoth(): PlotModel {
  return createGridlinesModel('Both', LineStyle.Solid, LineStyle.Solid)
}

// ===========================
/** Creates an example model */
function createExample(min: number, max: number, stringFormatter?: AxisStringFormatterType): PlotModel {
  const m = new PlotModel()
  m.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: min,
      maximum: max,
      stringFormatter,
    }),
  )
  m.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: min, maximum: max, stringFormatter }))
  return m
}

/** Creates a TickStyle model */
function createTickStyleModel(tickStyle: TickStyle): PlotModel {
  const model = new PlotModel({ title: `TickStyle: ${tickStyle}` })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      tickStyle: tickStyle,
      majorGridlineStyle: LineStyle.None,
      minorGridlineStyle: LineStyle.None,
      maximumPadding: 0,
      minimumPadding: 0,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      tickStyle: tickStyle,
      majorGridlineStyle: LineStyle.None,
      minorGridlineStyle: LineStyle.None,
      maximumPadding: 0,
      minimumPadding: 0,
    }),
  )
  return model
}

/** Creates a Gridlines model */
function createGridlinesModel(title: string, horizontal: LineStyle, vertical: LineStyle): PlotModel {
  const model = new PlotModel({ title: `Gridlines: ${title}` })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      majorGridlineStyle: vertical,
      minorGridlineStyle: vertical === LineStyle.Solid ? LineStyle.Dot : LineStyle.None,
      maximumPadding: 0,
      minimumPadding: 0,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      majorGridlineStyle: horizontal,
      minorGridlineStyle: horizontal === LineStyle.Solid ? LineStyle.Dot : LineStyle.None,
      maximumPadding: 0,
      minimumPadding: 0,
    }),
  )
  return model
}

const category = 'LinearAxis'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: "Default StringFormat ('g6')",
      example: {
        model: stringFormat,
      },
    },
    {
      title: "StringFormat = 'f2'",
      example: {
        model: stringFormatF2,
      },
    },
    {
      title: 'TickStyle: None',
      example: {
        model: tickStyleNone,
      },
    },
    {
      title: 'TickStyle: Crossing',
      example: {
        model: tickStyleCrossing,
      },
    },
    {
      title: 'TickStyle: Inside',
      example: {
        model: tickStyleInside,
      },
    },
    {
      title: 'TickStyle: Outside',
      example: {
        model: tickStyleOutside,
      },
    },
    {
      title: 'Gridlines: None',
      example: {
        model: gridlinesNone,
      },
    },
    {
      title: 'Gridlines: Horizontal',
      example: {
        model: gridlinesHorizontal,
      },
    },
    {
      title: 'Gridlines: Vertical',
      example: {
        model: gridlinesVertical,
      },
    },
    {
      title: 'Gridlines: Both',
      example: {
        model: gridlinesBoth,
      },
    },
  ],
} as ExampleCategory
