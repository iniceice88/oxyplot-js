import {
  AngleAxis,
  AngleAxisFullPlotArea,
  FunctionSeries,
  LineStyle,
  MagnitudeAxis,
  MagnitudeAxisFullPlotArea,
  newOxyThickness,
  OxyMouseButton,
  PlotModel,
  PlotType,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/** Spiral */
function archimedeanSpiral(): PlotModel {
  const model = new PlotModel({
    title: 'Polar plot',
    subtitle: 'Archimedean spiral with equation r(θ) = θ for 0 < θ < 6π',
    plotType: PlotType.Polar,
    plotAreaBorderThickness: newOxyThickness(0),
  })
  model.axes.push(
    new AngleAxis({
      majorStep: Math.PI / 4,
      minorStep: Math.PI / 16,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      formatAsFractions: true,
      fractionUnit: Math.PI,
      fractionUnitSymbol: 'π',
      minimum: 0,
      maximum: 2 * Math.PI,
    }),
  )
  model.axes.push(
    new MagnitudeAxis({
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )

  model.series.push(
    new FunctionSeries({
      fx: (t) => t,
      fy: (t) => t,
      t0: 0,
      t1: Math.PI * 6,
      dt: 0.01,
    }),
  )
  return model
}

/** Spiral2 */
function archimedeanSpiral2(): PlotModel {
  const model = archimedeanSpiral()
  model.title += '(reversed angle axis)'
  const angleAxis = model.axes[0] as AngleAxis
  angleAxis.startAngle = 360
  angleAxis.endAngle = 0
  return model
}

/** Spiral with magnitude axis min and max */
function archimedeanSpiral3(): PlotModel {
  const model = archimedeanSpiral()
  model.title += ' (axis Minimum = 10 and Maximum = 20)'
  const magnitudeAxis = model.axes[1] as MagnitudeAxis
  magnitudeAxis.minimum = 10
  magnitudeAxis.maximum = 20
  return model
}

/** Angle axis with offset angle */
function offsetAngles(): PlotModel {
  const model = new PlotModel({
    title: 'Offset angle axis',
    plotType: PlotType.Polar,
    plotAreaBorderThickness: newOxyThickness(0),
  })

  const angleAxis = new AngleAxis({
    minimum: 0,
    maximum: Math.PI * 2,
    majorStep: Math.PI / 4,
    minorStep: Math.PI / 16,
    stringFormatter: (x) => x.toFixed(2), //'0.00',
    startAngle: 30,
    endAngle: 390,
  })
  model.axes.push(angleAxis)
  model.axes.push(new MagnitudeAxis())
  model.series.push(
    new FunctionSeries({
      fx: (t) => t,
      fy: (t) => t,
      t0: 0,
      t1: Math.PI * 6,
      dt: 0.01,
    }),
  )

  // Subscribe to the mouse down event on the line series.
  model.mouseDown = (s, e) => {
    let increment = 0

    // Increment and decrement must be in degrees (corresponds to the StartAngle and EndAngle properties).
    if (e.changedButton === OxyMouseButton.Left) {
      increment = 15
    }

    if (e.changedButton === OxyMouseButton.Right) {
      increment = -15
    }

    if (Math.abs(increment) > Number.EPSILON) {
      angleAxis.startAngle += increment
      angleAxis.endAngle += increment
      model.invalidatePlot(false)
      e.handled = true
    }
  }

  return model
}

/** Semi-circle */
function semiCircle(): PlotModel {
  const model = new PlotModel({
    title: 'Semi-circle polar plot',
    plotType: PlotType.Polar,
    plotAreaBorderThickness: newOxyThickness(0),
  })
  model.axes.push(
    new AngleAxis({
      minimum: 0,
      maximum: 180,
      majorStep: 45,
      minorStep: 9,
      startAngle: 0,
      endAngle: 180,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )
  model.axes.push(
    new MagnitudeAxis({
      minimum: 0,
      maximum: 1,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )
  model.series.push(circleFunctionSeries())
  return model
}

/** Semi-circle offset angle axis range */
function semiCircleOffsetAngleAxisRange(): PlotModel {
  const model = new PlotModel({
    title: 'Semi-circle polar plot',
    subtitle: 'Angle axis range offset to -180 - 180',
    plotType: PlotType.Polar,
    plotAreaBorderThickness: newOxyThickness(0),
  })
  model.axes.push(
    new AngleAxis({
      minimum: -180,
      maximum: 180,
      majorStep: 45,
      minorStep: 9,
      startAngle: 0,
      endAngle: 360,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )
  model.axes.push(
    new MagnitudeAxis({
      minimum: 0,
      maximum: 1,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )
  model.series.push(circleFunctionSeries())
  return model
}

/**
 * Shows how to orient 0 degrees at the bottom and add E/W to indicate directions.
 */
function eastWestDirections(): PlotModel {
  const model = new PlotModel({
    title: 'East/west directions',
    plotType: PlotType.Polar,
    plotAreaBorderThickness: newOxyThickness(0),
  })

  model.axes.push(
    new AngleAxis({
      minimum: 0,
      maximum: 360,
      majorStep: 30,
      minorStep: 30,
      startAngle: -90,
      endAngle: 270,
      labelFormatter: function (angle) {
        if (angle > 0 && angle < 180) {
          return `${angle}E`
        } else if (angle > 180) {
          return `${360 - angle}W`
        } else {
          return angle.toString()
        }
      },
      majorGridlineStyle: LineStyle.Dot,
      minorGridlineStyle: LineStyle.None,
    }),
  )

  model.axes.push(
    new MagnitudeAxis({
      minimum: 0,
      maximum: 1,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )

  model.series.push(circleFunctionSeries())

  return model
}

/**
 * Shows a semi-circle polar plot filling the plot area.
 */
function semiCircleFullPlotArea(): PlotModel {
  const model = new PlotModel({
    title: 'Semi-circle polar plot filling the plot area',
    subtitle: 'The center can be moved using the right mouse button',
    plotType: PlotType.Polar,
    plotAreaBorderThickness: newOxyThickness(1),
  })

  model.axes.push(
    new AngleAxisFullPlotArea({
      minimum: 0,
      maximum: 180,
      majorStep: 45,
      minorStep: 9,
      startAngle: 0,
      endAngle: 180,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )

  model.axes.push(
    new MagnitudeAxisFullPlotArea({
      minimum: 0,
      maximum: 1,
      midShiftH: 0,
      midShiftV: 0.9,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )

  model.series.push(circleFunctionSeries())

  return model
}

/** Spiral full plot area */
function archimedeanSpiralFullPlotArea(): PlotModel {
  const model = createFullPlotAreaPlotModel()
  model.series.push(
    new FunctionSeries({
      fx: (t) => t,
      fy: (t) => t,
      t0: 0,
      t1: Math.PI * 6,
      dt: 0.01,
    }),
  )
  return model
}

/** Spiral full plot area with negative minimum */
function spiralWithNegativeMinium(): PlotModel {
  const model = createFullPlotAreaPlotModel()
  model.title += ' with a negative minimum'
  model.series.push(
    new FunctionSeries({
      fx: (t) => t,
      fy: (t) => t,
      t0: -Math.PI * 6,
      t1: Math.PI * 6,
      dt: 0.01,
    }),
  )
  return model
}

/** Spiral full plot area with positive minimum */
function spiralWithPositiveMinium(): PlotModel {
  const model = createFullPlotAreaPlotModel()
  model.title += ' with a positive minimum'
  model.series.push(
    new FunctionSeries({
      fx: (t) => t,
      fy: (t) => t,
      t0: Math.PI * 6,
      t1: Math.PI * 12,
      dt: 0.01,
    }),
  )
  return model
}

function createFullPlotAreaPlotModel(): PlotModel {
  const model = new PlotModel({
    title: 'Polar plot filling the plot area',
    subtitle: 'The center can be move using the right mouse button',
    plotType: PlotType.Polar,
    plotAreaBorderThickness: newOxyThickness(1),
  })

  model.axes.push(
    new AngleAxisFullPlotArea({
      majorStep: Math.PI / 4,
      minorStep: Math.PI / 16,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
      formatAsFractions: true,
      fractionUnit: Math.PI,
      fractionUnitSymbol: 'π',
      minimum: 0,
      maximum: 2 * Math.PI,
    }),
  )

  model.axes.push(
    new MagnitudeAxisFullPlotArea({
      midShiftH: -0.1,
      midShiftV: -0.25,
      majorGridlineStyle: LineStyle.Solid,
      minorGridlineStyle: LineStyle.Solid,
    }),
  )

  return model
}

const circleFunctionSeries = () =>
  new FunctionSeries({
    fx: (x) => Math.sin((x / 180) * Math.PI),
    fy: (t) => t,
    t0: 0,
    t1: 180,
    dt: 0.01,
  })

const category = 'Polar Plots'

export default {
  category,
  tags: ['Axes'],
  examples: [
    {
      title: 'Spiral',
      example: {
        model: archimedeanSpiral,
      },
    },
    {
      title: 'Spiral2',
      example: {
        model: archimedeanSpiral2,
      },
    },
    {
      title: 'Spiral with magnitude axis min and max',
      example: {
        model: archimedeanSpiral3,
      },
    },
    {
      title: 'Angle axis with offset angle',
      example: {
        model: offsetAngles,
      },
    },
    {
      title: 'Semi-circle',
      example: {
        model: semiCircle,
      },
    },
    {
      title: 'Semi-circle offset angle axis range',
      example: {
        model: semiCircleOffsetAngleAxisRange,
      },
    },
    {
      title: 'East/west directions',
      example: {
        model: eastWestDirections,
      },
    },
    {
      title: 'Semi-circle full plot area',
      example: {
        model: semiCircleFullPlotArea,
      },
    },
    {
      title: 'Spiral full plot area',
      example: {
        model: archimedeanSpiralFullPlotArea,
      },
    },
    {
      title: 'Spiral full plot area with negative minimum',
      example: {
        model: spiralWithNegativeMinium,
      },
    },
    {
      title: 'Spiral full plot area with positive minimum',
      example: {
        model: spiralWithPositiveMinium,
      },
    },
  ],
} as ExampleCategory
