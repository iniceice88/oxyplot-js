import {
  AxisPosition,
  DataPoint,
  EdgeRenderingMode,
  LinearAxis,
  LineJoin,
  LineSeries,
  LineStyle,
  MarkerType,
  OxyColors,
  OxyRect,
  PlotModel,
  type ScatterPoint,
  ScatterSeries,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/** LineSeries, 1M points */
function lineSeries1M(): PlotModel {
  const model = new PlotModel({ title: 'LineSeries, 1M points' })
  const s1 = new LineSeries()
  addDataPoints(s1.points, 1000000)
  model.series.push(s1)
  return model
}

/** LineSeries, 1M points, EdgeRenderingMode==PreferSpeed */
function lineSeries1MSpeed(): PlotModel {
  const model = new PlotModel({ title: 'LineSeries, 1M points' })
  const s1 = new LineSeries({ edgeRenderingMode: EdgeRenderingMode.PreferSpeed })
  addDataPoints(s1.points, 1000000)
  model.series.push(s1)
  return model
}

/** LineSeries, 100k points */
function lineSeries(): PlotModel {
  const model = new PlotModel({ title: 'LineSeries, 100k points' })
  const s1 = new LineSeries()
  addDataPoints(s1.points, 100000)
  model.series.push(s1)
  return model
}

/** LineSeries, 100k points (dashed line) */
function lineSeriesDashedLines(): PlotModel {
  const model = new PlotModel({ title: 'LineSeries, 100k points', subtitle: 'LineStyle = Dash' })
  const s1 = new LineSeries({ lineStyle: LineStyle.Dash })
  addDataPoints(s1.points, 100000)
  model.series.push(s1)
  return model
}

/** LineSeries, 100k points, markers */
function lineSeries1WithMarkers(): PlotModel {
  const model = new PlotModel({ title: 'LineSeries, 100k points', subtitle: 'MarkerType = Square' })
  const s1 = new LineSeries({ markerType: MarkerType.Square })
  addDataPoints(s1.points, 100000)
  model.series.push(s1)
  return model
}

/** LineSeries, 100k points, markers, lower resolution */
function lineSeries1WithMarkersLowRes(): PlotModel {
  const model = new PlotModel({
    title: 'LineSeries, 100k points, markers, lower resolution',
    subtitle: 'MarkerType = Square, MarkerResolution = 3',
  })
  const s1 = new LineSeries({ markerType: MarkerType.Square, markerResolution: 3 })
  addDataPoints(s1.points, 100000)
  model.series.push(s1)
  return model
}

/** LineSeries, 100k points, round line joins */
function lineSeriesRoundLineJoins(): PlotModel {
  const model = new PlotModel({ title: 'LineSeries, 100k points', subtitle: 'LineJoin = Round' })
  const s1 = new LineSeries({ lineJoin: LineJoin.Round })
  addDataPoints(s1.points, 100000)
  model.series.push(s1)
  return model
}

/**
 * Create a LineSeries with 100k points using an ItemsSource set to a List<DataPoint>.
 * @returns A PlotModel representing the LineSeries.
 */
function lineSeriesItemsSourceList(): PlotModel {
  const model = new PlotModel({
    title: 'LineSeries, 100k points by ItemsSource set to a List<DataPoint>',
  })
  const s1 = new LineSeries()
  const points: DataPoint[] = []
  addDataPoints(points, 100000)
  s1.itemsSource = points
  model.series.push(s1)

  return model
}

/**
 * Create a LineSeries with 100k points using an ItemsSource and Mapping.
 * @returns A PlotModel representing the LineSeries.
 */
function lineSeriesItemsSourceMapping(): PlotModel {
  const model = new PlotModel({
    title: 'LineSeries, 100k points by ItemsSource and Mapping',
    subtitle: 'Using the Mapping function',
  })
  const s1 = new LineSeries()
  const points: DataPoint[] = []
  addDataPoints(points, 100000)
  const rects = points.map((pt) => new OxyRect(pt.x, pt.y, 0, 0))
  s1.itemsSource = rects
  s1.mapping = (r) => new DataPoint((r as OxyRect).left, (r as OxyRect).top)
  model.series.push(s1)

  return model
}

/**
 * Create a LineSeries with 100k points using an ItemsSource and reflection.
 * @returns A PlotModel representing the LineSeries.
 */
function lineSeriesItemsSourceReflection(): PlotModel {
  const model = new PlotModel({
    title: 'LineSeries, 100k points, ItemsSource with reflection',
    subtitle: 'DataFieldX and DataFieldY',
  })
  const s1 = new LineSeries()
  const points: DataPoint[] = []
  addDataPoints(points, 100000)
  const rects = points.map((pt) => new OxyRect(pt.x, pt.y, 0, 0))
  s1.itemsSource = rects
  s1.dataFieldX = 'left'
  s1.dataFieldY = 'top'
  model.series.push(s1)

  return model
}

/**
 * Create a LineSeries with 100k points and a thick stroke.
 * @returns A PlotModel representing the LineSeries.
 */
function lineSeriesThick(): PlotModel {
  const model = new PlotModel({
    title: 'LineSeries, 100k points (thick)',
    subtitle: 'StrokeThickness = 10',
  })
  const s1 = new LineSeries({ strokeThickness: 10 })
  addDataPoints(s1.points, 100000)
  model.series.push(s1)

  return model
}

/** LineSeries, 3k points, miter line joins */
function lineSeries2MiterLineJoins(): PlotModel {
  const model = new PlotModel({
    title: 'LineSeries, 3k points, miter line joins',
    subtitle: 'LineJoin = Miter',
  })
  const s1 = new LineSeries({ lineJoin: LineJoin.Miter, strokeThickness: 8.0 })
  for (let i = 0; i < 3000; i++) {
    s1.points.push(new DataPoint(i, i % 2))
  }

  model.series.push(s1)
  return model
}

/** LineSeries, 3k points, round line joins */
function lineSeries2RoundLineJoins(): PlotModel {
  const model = new PlotModel({
    title: 'LineSeries, 3k points, round line joins',
    subtitle: 'LineJoin = Round',
  })
  const s1 = new LineSeries({ lineJoin: LineJoin.Round, strokeThickness: 8.0 })
  for (let i = 0; i < 3000; i++) {
    s1.points.push(new DataPoint(i, i % 2))
  }

  model.series.push(s1)
  return model
}

/** LineSeries, 3k points, bevel line joins */
function lineSeries2BevelLineJoins(): PlotModel {
  const model = new PlotModel({
    title: 'LineSeries, 3k points, bevel line joins',
    subtitle: 'LineJoin = Bevel',
  })
  const s1 = new LineSeries({ lineJoin: LineJoin.Bevel, strokeThickness: 8.0 })
  for (let i = 0; i < 3000; i++) {
    s1.points.push(new DataPoint(i, i % 2))
  }

  model.series.push(s1)
  return model
}

/** ScatterSeries (squares) */
function scatterSeriesSquares(): PlotModel {
  const model = new PlotModel({ title: 'ScatterSeries (squares)' })
  const s1 = new ScatterSeries()
  addScatterPoints(s1.points, 2000)
  model.series.push(s1)
  return model
}

/** ScatterSeries (squares with outline) */
function scatterSeriesSquaresOutline(): PlotModel {
  const model = new PlotModel({
    title: 'ScatterSeries (squares with outline)',
    subtitle: 'MarkerStroke = Black',
  })
  const s1 = new ScatterSeries({ markerStroke: OxyColors.Black })
  addScatterPoints(s1.points, 2000)
  model.series.push(s1)
  return model
}

/** ScatterSeries (squares without fill color) */
function scatterSeriesSquaresOutlineOnly(): PlotModel {
  const model = new PlotModel({
    title: 'ScatterSeries (squares without fill color)',
    subtitle: 'MarkerFill = Transparent, MarkerStroke = Black',
  })
  const s1 = new ScatterSeries({ markerFill: OxyColors.Transparent, markerStroke: OxyColors.Black })
  addScatterPoints(s1.points, 2000)
  model.series.push(s1)
  return model
}

/**
 * Create a ScatterSeries using an ItemsSource and reflection.
 * @returns A PlotModel representing the ScatterSeries.
 */
function scatterSeriesItemsSourceReflection(): PlotModel {
  const model = new PlotModel({
    title: 'ScatterSeries (by ItemsSource)',
    subtitle: "DataFieldX = 'X', DataFieldY = 'Y'",
  })
  model.series.push(new ScatterSeries({ itemsSource: getPoints(2000), dataFieldX: 'X', dataFieldY: 'Y' }))

  return model
}

/**
 * Create a ScatterSeries with circles as markers.
 * @returns A PlotModel representing the ScatterSeries.
 */
function scatterSeriesCircles(): PlotModel {
  const model = new PlotModel({ title: 'ScatterSeries (circles)', subtitle: 'MarkerType = Circle' })
  const s1 = new ScatterSeries({ markerType: MarkerType.Circle })
  addScatterPoints(s1.points, 2000)
  model.series.push(s1)

  return model
}

/**
 * Create a ScatterSeries with circles as markers and an outline.
 * @returns A PlotModel representing the ScatterSeries.
 */
function scatterSeriesCirclesOutline(): PlotModel {
  const model = new PlotModel({
    title: 'ScatterSeries (circles with outline)',
    subtitle: 'MarkerType = Circle, MarkerStroke = Black',
  })
  const s1 = new ScatterSeries({ markerType: MarkerType.Circle, markerStroke: OxyColors.Black })
  addScatterPoints(s1.points, 2000)
  model.series.push(s1)

  return model
}

/**
 * Create a ScatterSeries with crosses as markers.
 * @returns A PlotModel representing the ScatterSeries.
 */
function scatterSeriesCrosses(): PlotModel {
  const model = new PlotModel({ title: 'ScatterSeries (cross)', subtitle: 'MarkerType = Cross' })
  const s1 = new ScatterSeries({
    markerType: MarkerType.Cross,
    markerFill: OxyColors.Undefined,
    markerStroke: OxyColors.Black,
  })
  addScatterPoints(s1.points, 2000)
  model.series.push(s1)

  return model
}

/**
 * Create a PlotModel with a LinearAxis and no gridlines.
 * @returns A PlotModel representing the LinearAxis.
 */
function linearAxisNoGridlines(): PlotModel {
  const model = new PlotModel({ title: 'LinearAxis (no gridlines)' })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 0,
      maximum: 100,
      majorStep: 1,
      minorStep: 1,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: 0,
      maximum: 100,
      majorStep: 1,
      minorStep: 1,
    }),
  )

  return model
}

/**
 * Create a PlotModel with a LinearAxis and solid gridlines.
 * @returns A PlotModel representing the LinearAxis.
 */
function linearAxisSolidGridlines(): PlotModel {
  const model = new PlotModel({ title: 'LinearAxis (solid gridlines)' })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 0,
      maximum: 100,
      majorStep: 1,
      minorStep: 1,
      majorGridlineStyle: LineStyle.Solid,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: 0,
      maximum: 100,
      majorStep: 1,
      minorStep: 1,
      majorGridlineStyle: LineStyle.Solid,
    }),
  )

  return model
}

/**
 * Create a PlotModel with a LinearAxis and dashed gridlines.
 * @returns A PlotModel representing the LinearAxis.
 */
function linearAxisDashedGridlines(): PlotModel {
  const model = new PlotModel({ title: 'LinearAxis (dashed gridlines)' })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 0,
      maximum: 100,
      majorStep: 1,
      minorStep: 1,
      majorGridlineStyle: LineStyle.Dash,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: 0,
      maximum: 100,
      majorStep: 1,
      minorStep: 1,
      majorGridlineStyle: LineStyle.Dash,
    }),
  )

  return model
}

/**
 * Create a PlotModel with a LinearAxis and dotted gridlines.
 * @returns A PlotModel representing the LinearAxis.
 */
function linearAxisDottedGridlines(): PlotModel {
  const model = new PlotModel({ title: 'LinearAxis (dotted gridlines)' })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: 0,
      maximum: 100,
      majorStep: 1,
      minorStep: 1,
      majorGridlineStyle: LineStyle.Dot,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: 0,
      maximum: 100,
      majorStep: 1,
      minorStep: 1,
      majorGridlineStyle: LineStyle.Dot,
    }),
  )

  return model
}

/** int overflow (10k) */
function intOverflow10k(): PlotModel {
  return intOverflow(10000)
}

/** int overflow (50k) */
function intOverflow50k(): PlotModel {
  return intOverflow(50000)
}

/** int overflow (100k) */
function intOverflow100k(): PlotModel {
  return intOverflow(100000)
}

// ===================
function intOverflow(n: number): PlotModel {
  const model = new PlotModel({ title: 'int overflow', subtitle: `n = ${n}` })
  const ls = new LineSeries()
  let k = 0
  for (let i = 0; i < n; i++) {
    ls.points.push(new DataPoint(i, (k += i * i)))
  }

  model.series.push(ls)
  return model
}

function getPoints(n: number): DataPoint[] {
  const points: DataPoint[] = []
  addDataPoints(points, n)
  return points
}

function addDataPoints(points: DataPoint[], n: number): void {
  for (let i = 0; i < n; i++) {
    const x = (Math.PI * 10 * i) / (n - 1)
    points.push(new DataPoint(x * Math.cos(x), x * Math.sin(x)))
  }
}

function addScatterPoints(points: ScatterPoint[], n: number): void {
  for (let i = 0; i < n; i++) {
    const x = (Math.PI * 10 * i) / (n - 1)
    points.push({
      x: x * Math.cos(x),
      y: x * Math.sin(x),
    })
  }
}

const category = 'Performance'

export default {
  category,
  examples: [
    {
      title: 'LineSeries, 1M points',
      example: {
        model: lineSeries1M,
      },
    },
    {
      title: 'LineSeries, 1M points, EdgeRenderingMode==PreferSpeed',
      example: {
        model: lineSeries1MSpeed,
      },
    },
    {
      title: 'LineSeries, 100k points',
      example: {
        model: lineSeries,
      },
    },
    {
      title: 'LineSeries, 100k points (dashed line)',
      example: {
        model: lineSeriesDashedLines,
      },
    },
    {
      title: 'LineSeries, 100k points, markers',
      example: {
        model: lineSeries1WithMarkers,
      },
    },
    {
      title: 'LineSeries, 100k points, markers, lower resolution',
      example: {
        model: lineSeries1WithMarkersLowRes,
      },
    },
    {
      title: 'LineSeries, 100k points, round line joins',
      example: {
        model: lineSeriesRoundLineJoins,
      },
    },
    {
      title: 'LineSeries, 100k points by ItemsSource set to a List<DataPoint>',
      example: {
        model: lineSeriesItemsSourceList,
      },
    },
    {
      title: 'LineSeries, 100k points by ItemsSource and Mapping',
      example: {
        model: lineSeriesItemsSourceMapping,
      },
    },
    {
      title: 'LineSeries, 100k points by ItemsSource and reflection',
      example: {
        model: lineSeriesItemsSourceReflection,
      },
    },
    {
      title: 'LineSeries, 100k points (thick)',
      example: {
        model: lineSeriesThick,
      },
    },
    {
      title: 'LineSeries, 3k points, miter line joins',
      example: {
        model: lineSeries2MiterLineJoins,
      },
    },
    {
      title: 'LineSeries, 3k points, round line joins',
      example: {
        model: lineSeries2RoundLineJoins,
      },
    },
    {
      title: 'LineSeries, 3k points, bevel line joins',
      example: {
        model: lineSeries2BevelLineJoins,
      },
    },
    {
      title: 'ScatterSeries (squares)',
      example: {
        model: scatterSeriesSquares,
      },
    },
    {
      title: 'ScatterSeries (squares with outline)',
      example: {
        model: scatterSeriesSquaresOutline,
      },
    },
    {
      title: 'ScatterSeries (squares without fill color)',
      example: {
        model: scatterSeriesSquaresOutlineOnly,
      },
    },
    {
      title: 'ScatterSeries by ItemsSource and reflection',
      example: {
        model: scatterSeriesItemsSourceReflection,
      },
    },
    {
      title: 'ScatterSeries (circles)',
      example: {
        model: scatterSeriesCircles,
      },
    },
    {
      title: 'ScatterSeries (circles with outline)',
      example: {
        model: scatterSeriesCirclesOutline,
      },
    },
    {
      title: 'ScatterSeries (cross)',
      example: {
        model: scatterSeriesCrosses,
      },
    },
    {
      title: 'LinearAxis (no gridlines)',
      example: {
        model: linearAxisNoGridlines,
      },
    },
    {
      title: 'LinearAxis (solid gridlines)',
      example: {
        model: linearAxisSolidGridlines,
      },
    },
    {
      title: 'LinearAxis (dashed gridlines)',
      example: {
        model: linearAxisDashedGridlines,
      },
    },
    {
      title: 'LinearAxis (dotted gridlines)',
      example: {
        model: linearAxisDottedGridlines,
      },
    },
    {
      title: 'int overflow (10k)',
      example: {
        model: intOverflow10k,
      },
    },
    {
      title: 'int overflow (50k)',
      example: {
        model: intOverflow50k,
      },
    },
    {
      title: 'int overflow (100k)',
      example: {
        model: intOverflow100k,
      },
    },
  ],
} as ExampleCategory
