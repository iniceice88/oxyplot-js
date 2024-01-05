import {
  AxisPosition,
  CanonicalSpline,
  DataPoint,
  DataPoint_Undefined,
  Decimator,
  InterpolationAlgorithms,
  Legend,
  LegendPlacement,
  LinearAxis,
  LineLegendPosition,
  LineSeries,
  LineStyle,
  MarkerType,
  newDataPoint,
  newScreenPoint,
  OxyColor,
  OxyColors,
  PlotModel,
  PlotModelUtilities,
  ScreenPoint,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { Random } from '../Random'

/**
 * LineSeries with default style example
 */
function defaultStyle(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'LineSeries with default style' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  const lineSeries1 = createExampleLineSeries()
  lineSeries1.title = 'LineSeries 1'
  model.series.push(lineSeries1)

  return model
}

/**
 * LineSeries with custom style example
 */
function customStyle(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'LineSeries with custom style' })
  const l = new Legend({
    legendSymbolLength: 24,
  })

  model.legends.push(l)

  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  const lineSeries1 = createExampleLineSeries()
  lineSeries1.title = 'LineSeries 1'
  lineSeries1.toolTip = 'This is a tooltip for a LineSeries 1'
  lineSeries1.color = OxyColors.SkyBlue
  lineSeries1.strokeThickness = 3
  lineSeries1.lineStyle = LineStyle.Dash
  lineSeries1.markerType = MarkerType.Circle
  lineSeries1.markerSize = 5
  lineSeries1.markerStroke = OxyColors.White
  lineSeries1.markerFill = OxyColors.SkyBlue
  lineSeries1.markerStrokeThickness = 1.5
  model.series.push(lineSeries1)

  return model
}

/**
 * Two LineSeries example
 */
function twoLineSeries(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Two LineSeries' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  const lineSeries1 = createExampleLineSeries()
  lineSeries1.title = 'LineSeries 1'
  model.series.push(lineSeries1)

  const lineSeries2 = createExampleLineSeries(41)
  lineSeries2.title = 'LineSeries 2'
  model.series.push(lineSeries2)
  return model
}

/**
 * LineSeries with IsVisible = false example
 */
function isVisibleFalse(): PlotModel {
  const model: PlotModel = new PlotModel({
    title: 'LineSeries with IsVisible = false',
    subtitle: 'Click to change the IsVisible property for LineSeries 2',
  })

  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: 0, maximum: 50 }))

  const s1 = createExampleLineSeries(38)
  s1.title = 'LineSeries 1'
  model.series.push(s1)

  const s2 = createExampleLineSeries(39)
  s2.title = 'LineSeries 2'
  s2.isVisible = false
  model.series.push(s2)

  // handle mouse clicks to change visibility
  model.mouseDown = (s, e) => {
    s2.isVisible = !s2.isVisible
    model.invalidatePlot(true)
  }

  return model
}

/**
 * LineSeries with custom TrackerFormatString example
 */
function trackerFormatString(): PlotModel {
  const model: PlotModel = new PlotModel({
    title: 'LineSeries with custom TrackerFormatString',
    subtitle: 'TrackerFormatString = "X={2:0.0} Y={4:0.0}"',
  })

  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  const lineSeries1 = createExampleLineSeries()
  //lineSeries1.trackerFormatString = 'X={2:0.0} Y={4:0.0}'
  lineSeries1.trackerStringFormatter = (args) => {
    return 'X=' + args.xValue!.toFixed(1) + ' Y=' + args.yValue!.toFixed(1)
  }
  model.series.push(lineSeries1)
  return model
}

/**
 * LineSeries with custom markers example
 */
function customMarkers(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'LineSeries with custom markers' })
  const l: Legend = new Legend({
    legendSymbolLength: 30,
  })

  model.legends.push(l)
  const N = 6
  const customMarkerOutline: ScreenPoint[] = []
  for (let i = 0; i < N; i++) {
    const th = Math.PI * ((4.0 * i) / (N - 1) - 0.5)
    const R = 1
    customMarkerOutline[i] = newScreenPoint(Math.cos(th) * R, Math.sin(th) * R)
  }

  const s1 = createExampleLineSeries(39)
  s1.title = 'LineSeries 1'
  s1.markerType = MarkerType.Custom
  s1.markerSize = 8
  s1.markerOutline = customMarkerOutline

  model.series.push(s1)

  return model
}

/**
 * LineSeries with different MarkerType example
 */
function markerTypes(): PlotModel {
  const pm: PlotModel = createModel('LineSeries with different MarkerType', MarkerType.Custom)

  const l: Legend = new Legend({
    legendBackground: OxyColor.fromAColor(220, OxyColors.White),
    legendBorder: OxyColors.Black,
    legendBorderThickness: 1.0,
  })

  pm.legends.push(l)

  let i = 0
  for (const s of pm.series) {
    const ls = s as LineSeries
    ls.color = OxyColors.Red
    ls.markerStroke = OxyColors.Black
    ls.markerFill = OxyColors.Green
    ls.markerType = i++
    ls.title = MarkerType[ls.markerType]
  }

  return pm
}

/**
 * LineSeries with labels
 * @returns A PlotModel.
 */
function labels(): PlotModel {
  const model = new PlotModel({
    title: 'LineSeries with labels',
    subtitle: "Use the 'labelFormatString' property",
  })
  const l = new Legend({ legendSymbolLength: 24 })

  model.legends.push(l)
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, maximumPadding: 0.1 })) // increase the top padding to make sure the labels are visible
  const s1 = createExampleLineSeries()
  //s1.labelFormatString = '{1}'
  s1.labelStringFormatter = (series, point) => {
    return point[1].toString()
  }
  s1.markerType = MarkerType.Circle
  model.series.push(s1)
  return model
}

/**
 * LineSeries with LineStyle
 * @returns A PlotModel.
 */
function lineStyles(): PlotModel {
  const pm = createModel('LineSeries with LineStyle', LineStyle.None)
  const l = new Legend({ legendPlacement: LegendPlacement.Outside, legendSymbolLength: 50 })

  pm.legends.push(l)

  let i = 0
  for (const s of pm.series) {
    const lineSeries = s as LineSeries
    lineSeries.color = OxyColors.Red
    lineSeries.lineStyle = i++
    lineSeries.title = LineStyle[lineSeries.lineStyle]
  }

  return pm
}

/**
 * LineSeries with interpolation
 * @returns A PlotModel.
 */
function smooth(): PlotModel {
  const model = new PlotModel({
    title: 'LineSeries with interpolation',
    subtitle: 'InterpolationAlgorithm = CanonicalSpline',
  })
  const l = new Legend({ legendSymbolLength: 24 })

  model.legends.push(l)
  const s1 = createExampleLineSeries()
  s1.markerType = MarkerType.Circle

  s1.interpolationAlgorithm = InterpolationAlgorithms.CanonicalSpline
  model.series.push(s1)
  return model
}

/**
 * LineSeries with LineLegendPosition
 * @returns A PlotModel.
 */
function customLineLegendPosition(): PlotModel {
  const model = new PlotModel({ title: 'LineSeries with LineLegendPosition' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimumPadding: 0.05, maximumPadding: 0.05 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimumPadding: 0.05, maximumPadding: 0.05 }))
  const s1 = createExampleLineSeries()
  s1.title = 'Start'
  s1.markerType = MarkerType.Circle
  s1.lineLegendPosition = LineLegendPosition.Start
  model.series.push(s1)

  const s2 = createExampleLineSeries(41)
  s2.title = 'End'
  s2.markerType = MarkerType.Circle
  s2.lineLegendPosition = LineLegendPosition.End
  model.series.push(s2)

  return model
}

/**
 * LineSeries with LineLegendPosition (reversed X Axis)
 * @returns A PlotModel.
 */
function customLineLegendPositionReversed(): PlotModel {
  return PlotModelUtilities.reverseXAxis(customLineLegendPosition())
}

/**
 * LineSeries with broken lines example
 */
function brokenLine(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'LineSeries with broken lines' })

  const s1 = createExampleLineSeries()
  s1.points[3] = DataPoint_Undefined
  s1.points[7] = DataPoint_Undefined
  s1.brokenLineColor = OxyColors.Gray
  s1.brokenLineThickness = 0.5
  s1.brokenLineStyle = LineStyle.Solid
  model.series.push(s1)

  const s2 = createExampleLineSeries(49)
  s2.points[3] = DataPoint_Undefined
  s2.points[7] = DataPoint_Undefined
  s2.brokenLineColor = OxyColors.Automatic
  s2.brokenLineThickness = 1
  s2.brokenLineStyle = LineStyle.Dot
  model.series.push(s2)

  return model
}

/**
 * LineSeries without Decimator example
 */
function withoutDecimator(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'LineSeries without Decimator' })
  const s1 = createSeriesSuitableForDecimation()
  model.series.push(s1)
  return model
}

/**
 * LineSeries with X Decimator example
 */
function withXDecimator(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'LineSeries with X Decimator' })
  const s1 = createSeriesSuitableForDecimation()
  s1.decimator = Decimator.decimate
  model.series.push(s1)
  return model
}

/**
 * Canonical spline interpolation example
 */
function canonicalSplineInterpolation(): PlotModel {
  const result = createRandomPoints()

  const plotModel: PlotModel = new PlotModel({
    title: 'Canonical spline interpolation',
    series: [
      new LineSeries({
        itemsSource: result,
        title: 'Default (0.5)',
        interpolationAlgorithm: InterpolationAlgorithms.CanonicalSpline,
        markerType: MarkerType.Circle,
        markerFill: OxyColors.Black,
      }),
      new LineSeries({
        itemsSource: result,
        title: '0.1',
        interpolationAlgorithm: new CanonicalSpline(0.1),
      }),
      new LineSeries({
        itemsSource: result,
        title: '1.0',
        interpolationAlgorithm: new CanonicalSpline(1),
      }),
    ],
  })

  return plotModel
}

/**
 * Catmull-Rom interpolation example
 */
function catmullRomInterpolation(): PlotModel {
  const result = createRandomPoints()

  const plotModel: PlotModel = new PlotModel({
    title: 'Catmull-Rom interpolation',
    series: [
      new LineSeries({
        itemsSource: result,
        title: 'Standard',
        interpolationAlgorithm: InterpolationAlgorithms.CatmullRomSpline,
        markerType: MarkerType.Circle,
        markerFill: OxyColors.Black,
      }),
      new LineSeries({
        itemsSource: result,
        title: 'Chordal',
        interpolationAlgorithm: InterpolationAlgorithms.ChordalCatmullRomSpline,
      }),
      new LineSeries({
        itemsSource: result,
        title: 'Uniform',
        interpolationAlgorithm: InterpolationAlgorithms.UniformCatmullRomSpline,
      }),
    ],
  })

  return plotModel
}

/**
 * Marker color options
 * @returns A PlotModel.
 */
function markerColorOptions(): PlotModel {
  const result = createRandomPoints()

  const model = new PlotModel({ title: 'Marker color options' })

  // Don't specify line or marker color. Defaults will be used.
  const s1 = createExampleLineSeries(1)
  s1.markerType = MarkerType.Circle
  model.series.push(s1)

  // Specify line color but not marker color. Marker color should be the same as line color.
  const s2 = createExampleLineSeries(4)
  s2.markerType = MarkerType.Square
  s2.color = OxyColors.LightBlue
  model.series.push(s2)

  // Specify marker color but not line color. Default color should be used for line.
  const s3 = createExampleLineSeries(13)
  s3.markerType = MarkerType.Square
  s3.markerFill = OxyColors.Black
  model.series.push(s3)

  // Specify line and marker color. Specified colors should be used.
  const s4 = createExampleLineSeries(5)
  s4.markerType = MarkerType.Square
  s4.markerFill = OxyColors.OrangeRed
  s4.color = OxyColors.Orange
  model.series.push(s4)

  return model
}

// =======================private
/**
 * Create random points
 * @param numberOfPoints The number of points to create. Defaults to 50.
 * @returns A list of DataPoints.
 */
function createRandomPoints(numberOfPoints: number = 50): DataPoint[] {
  const r = new Random()
  const result: DataPoint[] = []
  for (let i = 0; i < numberOfPoints; i++) {
    if (i < 5) {
      result.push(newDataPoint(i, 0.0))
    } else if (i < 10) {
      result.push(newDataPoint(i, 1.0))
    } else if (i < 12) {
      result.push(newDataPoint(i, 0.0))
    } else {
      result.push(newDataPoint(i, r.next()))
    }
  }
  return result
}

/**
 * Creates an example line series.
 * @returns A line series containing random points.
 */
function createExampleLineSeries(seed: number = 13): LineSeries {
  const lineSeries1: LineSeries = new LineSeries()
  const r = new Random(seed)
  let y = r.next(10, 30)
  for (let x = 0; x <= 100; x += 10) {
    lineSeries1.points.push(newDataPoint(x, y))
    y += r.next(-5, 5)
  }

  return lineSeries1
}

/**
 * Creates a PlotModel with a title and a number of LineSeries.
 * @param title The title of the PlotModel.
 * @param n The number of LineSeries to create.
 * @returns A PlotModel.
 */
function createModel(title: string, n: number = 20): PlotModel {
  const model: PlotModel = new PlotModel({ title: title })
  for (let i = 1; i <= n; i++) {
    const s = new LineSeries({ title: 'Series ' + i })
    model.series.push(s)
    for (let x = 0; x < 2 * Math.PI; x += 0.1) {
      s.points.push(newDataPoint(x, Math.sin(x * i) / (i + 1) + i))
    }
  }

  return model
}

/**
 * Creates a LineSeries suitable for decimation.
 * @returns A LineSeries.
 */
function createSeriesSuitableForDecimation(): LineSeries {
  const s1: LineSeries = new LineSeries()

  const n = 20000
  for (let i = 0; i < n; i++) {
    s1.points.push(newDataPoint(i / n, Math.sin(i)))
  }

  return s1
}

const category = 'LineSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Default style',
      example: {
        model: defaultStyle,
      },
    },
    {
      title: 'Custom style',
      example: {
        model: customStyle,
      },
    },
    {
      title: 'Two LineSeries',
      example: {
        model: twoLineSeries,
      },
    },
    {
      title: 'Visibility',
      example: {
        model: isVisibleFalse,
      },
    },
    {
      title: 'Custom TrackerFormatString',
      example: {
        model: trackerFormatString,
      },
    },
    {
      title: 'Custom markers',
      example: {
        model: customMarkers,
      },
    },
    {
      title: 'Marker types',
      example: {
        model: markerTypes,
      },
    },
    {
      title: 'Labels',
      example: {
        model: labels,
      },
    },
    {
      title: 'LineStyle',
      example: {
        model: lineStyles,
      },
    },
    {
      title: 'Interpolation',
      example: {
        model: smooth,
      },
    },
    {
      title: 'LineLegendPosition',
      example: {
        model: customLineLegendPosition,
      },
    },
    {
      title: 'LineLegendPosition (reversed X Axis)',
      example: {
        model: customLineLegendPositionReversed,
      },
    },
    {
      title: 'Broken lines',
      example: {
        model: brokenLine,
      },
    },
    {
      title: 'Without Decimator',
      example: {
        model: withoutDecimator,
      },
    },
    {
      title: 'With X Decimator',
      example: {
        model: withXDecimator,
      },
    },
    {
      title: 'Canonical spline interpolation',
      example: {
        model: canonicalSplineInterpolation,
      },
    },
    {
      title: 'Catmull-Rom interpolation',
      example: {
        model: catmullRomInterpolation,
      },
    },
    {
      title: 'Marker color options',
      example: {
        model: markerColorOptions,
      },
    },
  ],
} as ExampleCategory
