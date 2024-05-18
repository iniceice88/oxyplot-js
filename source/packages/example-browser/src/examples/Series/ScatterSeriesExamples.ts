import {
  AxisPosition,
  DataPoint,
  Legend,
  LegendPosition,
  LineAnnotation,
  LinearColorAxis,
  MarkerType,
  newDataPoint,
  OxyColor,
  OxyColors,
  OxyPalette,
  OxyPalettes,
  PlotModel,
  round,
  type ScatterPoint,
  ScatterSeries,
  SelectionMode,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { Random } from '../Random'

/**
 * Creates a scatter plot with correlated points.
 */
function correlatedScatter(): PlotModel {
  return createCorrelatedScatter(1000)
}

/**
 * Creates a scatter plot with random points.
 */
function randomScatter1(): PlotModel {
  return randomScatter(32768, 0)
}

/**
 * Example: random points with bin size 2.
 */
function randomScatter2(): PlotModel {
  return randomScatter(32768, 2)
}

/**
 * Example: random points with bin size 4.
 */
function randomScatter4(): PlotModel {
  return randomScatter(32768, 4)
}

/**
 * Example: random points with bin size 6.
 */
function randomScatter6(): PlotModel {
  return randomScatter(32768, 6)
}

/**
 * Example: random points with bin size 8.
 */
function randomScatter8(): PlotModel {
  return randomScatter(32768, 8)
}

/**
 * Example: random points with bin size 10.
 */
function randomScatter10(): PlotModel {
  return randomScatter(32768, 10)
}

function twoScatterSeries(): PlotModel {
  // Removed `public` and `static` modifiers

  const model = new PlotModel({
    title: 'Two ScatterSeries (with and without values)',
    subtitle: 'With values (squares), without values (triangles)',
  })
  const colorAxis = new LinearColorAxis({
    position: AxisPosition.Right,
    key: 'ColorAxis',
    palette: OxyPalettes.jet(30),
    minimum: -1,
    maximum: 1,
  })
  model.axes.push(colorAxis) // Push to array as `plotModel.axes` is an array

  model.series.push(createRandomScatterSeries(50, MarkerType.Triangle, false, false, undefined)) // Push to array as `plotModel.series` is an array
  model.series.push(createRandomScatterSeries(50, MarkerType.Square, false, true, colorAxis))

  return model
}

function labelFormatString(): PlotModel {
  const model = new PlotModel({ title: 'ScatterSeries with LabelFormatString' })
  const s = createRandomScatterSeries(50, MarkerType.Square, false, false, undefined)
  // labelFormatString = '{1:0.###}'
  s.labelStringFormatter = (item, args) => {
    return round(args[1], 3).toString()
  }
  model.series.push(s)

  return model
}

function createRandomScatterSeries(
  n: number,
  markerType: MarkerType,
  setSize: boolean,
  setValue: boolean,
  colorAxis?: LinearColorAxis,
): ScatterSeries {
  const s1 = new ScatterSeries({
    markerType: markerType,
    markerSize: 6,
    colorAxisKey: colorAxis !== undefined ? colorAxis.key : undefined,
  })
  const random = new Random()
  for (let i = 0; i < n; i++) {
    let size: number | undefined = undefined
    if (setSize) {
      size = random.next() * 5 + 5
    }

    let value: number | undefined = undefined
    if (setValue) {
      value = random.next() * 2.2 - 1.1
    }
    const p: ScatterPoint = {
      x: random.next() * 2.2 - 1.1,
      y: random.next(),
      size,
      value,
    }

    s1.points.push(p)
  }

  return s1
}

/** Random points with random size */
function randomSize(): PlotModel {
  return createRandomSizeModel(1000, 8)
}

function createRandomSizeModel(n: number, binsize: number): PlotModel {
  const model = new PlotModel({
    title: `ScatterSeries with random MarkerSize (n=${n})`,
    subtitle: `BinSize = ${binsize}`,
  })

  const s1 = new ScatterSeries({ title: 'Series 1', markerStrokeThickness: 0, binSize: binsize })
  const r = new Random()
  for (let i = 0; i < n; i++) {
    s1.points.push({
      x: r.next(),
      y: r.next(),
      size: 4 + 10 * r.next(),
    })
  }

  model.series.push(s1)
  return model
}

/** Random points with least squares fit */
function randomWithFit(): PlotModel {
  const n = 20
  const model = new PlotModel({ title: `Random data (n=${n})` })
  const l = new Legend({
    legendPosition: LegendPosition.LeftTop,
  })

  model.legends.push(l)

  const s1 = new ScatterSeries({ title: 'Measurements' })
  const r = new Random()
  let x = 0
  let y = 0
  for (let i = 0; i < n; i++) {
    x += 2 + r.next() * 10
    y += 1 + r.next()
    const p = { x, y }
    s1.points.push(p)
  }

  model.series.push(s1)
  const [a, b] = leastSquaresFit(s1.points)
  model.annotations.push(new LineAnnotation({ slope: a, intercept: b, text: 'Least squares fit' }))
  return model
}

/**
 * Calculates the Least squares fit of a list of DataPoints.
 * @param points The points.
 * @returns [a, b] where a is the slope and b is the intercept.
 */
function leastSquaresFit(points: ScatterPoint[]): [number, number] {
  // http://en.wikipedia.org/wiki/Least_squares
  // http://mathworld.wolfram.com/LeastSquaresFitting.html
  // http://web.cecs.pdx.edu/~gerry/nmm/course/slides/ch09Slides4up.pdf

  let Sx = 0
  let Sy = 0
  let Sxy = 0
  let Sxx = 0
  let m = 0
  for (const p of points) {
    Sx += p.x
    Sy += p.y
    Sxy += p.x * p.y
    Sxx += p.x * p.x
    m++
  }

  const d = Sx * Sx - m * Sxx
  const a = (1 / d) * (Sx * Sy - m * Sxy)
  const b = (1 / d) * (Sx * Sxy - Sxx * Sy)
  return [a, b]
}

/** Marker types */
function markerTypes(): PlotModel {
  const model = new PlotModel({ title: 'Marker types' })
  const r = new Random()
  model.series.push(createRandomScatterSeriesWithMarker(r, 10, 'Circle', MarkerType.Circle))
  model.series.push(createRandomScatterSeriesWithMarker(r, 10, 'Cross', MarkerType.Cross))
  model.series.push(createRandomScatterSeriesWithMarker(r, 10, 'Diamond', MarkerType.Diamond))
  model.series.push(createRandomScatterSeriesWithMarker(r, 10, 'Plus', MarkerType.Plus))
  model.series.push(createRandomScatterSeriesWithMarker(r, 10, 'Square', MarkerType.Square))
  model.series.push(createRandomScatterSeriesWithMarker(r, 10, 'Star', MarkerType.Star))
  model.series.push(createRandomScatterSeriesWithMarker(r, 10, 'Triangle', MarkerType.Triangle))
  return model
}

/** ScatterSeries.Points */
function dataPoints(): PlotModel {
  const model = new PlotModel({
    title: 'ScatterSeries (n=1000)',
    subtitle: 'The scatter points are added to the Points collection.',
  })
  const series = new ScatterSeries()
  series.points.push(...createRandomScatterPoints(1000))
  model.series.push(series)
  return model
}

/** ScatterSeries.ItemsSource */
function fromItemsSource(): PlotModel {
  const model = new PlotModel({
    title: 'ScatterSeries (n=1000)',
    subtitle: 'The scatter points are defined in the ItemsSource property.',
  })
  model.series.push(
    new ScatterSeries({
      itemsSource: createRandomScatterPoints(1000),
    }),
  )
  return model
}

/** ScatterSeries.ItemsSource + Mapping */
function fromMapping(): PlotModel {
  const model = new PlotModel({
    title: 'ScatterSeries (n=1000)',
    subtitle: 'The scatter points are defined by a mapping from the ItemsSource.',
  })
  model.series.push(
    new ScatterSeries({
      itemsSource: createRandomDataPoints(1000),
      mapping: (item) => item,
    }),
  )
  return model
}

/** ScatterSeries.ItemsSource + reflection */
function fromItemsSourceReflection(): PlotModel {
  const model = new PlotModel({
    title: 'ScatterSeries (n=1000)',
    subtitle: 'The scatter points are defined by reflection from the ItemsSource.',
  })
  model.series.push(
    new ScatterSeries({
      itemsSource: createRandomDataPoints(1000),
      dataFieldX: 'x',
      dataFieldY: 'y',
    }),
  )
  return model
}

/** ScatterSeries with ColorAxis Rainbow(16) */
function colorMapRainbow16(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.rainbow(16),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/** ScatterSeries with ColorAxis Hue(30) Star */
function colorMapHue30(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.hue(30),
    MarkerType.Star,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/** ScatterSeries with ColorAxis Hot(64) */
function colorMapHot64(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.hot(64),
    MarkerType.Triangle,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/** ScatterSeries with ColorAxis Cool(32) */
function colorMapCool32(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.cool(32),
    MarkerType.Circle,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/** ScatterSeries with ColorAxis Gray(32) */
function colorMapGray32(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.gray(32),
    MarkerType.Diamond,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/** ScatterSeries with ColorAxis Jet(32) */
function colorMapJet32(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.jet(32),
    MarkerType.Plus,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/** ScatterSeries with ColorAxis Hot with extreme colors */
function colorMapHot64Extreme(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.hot(64),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Magenta,
    OxyColors.Green,
  )
}

/** ScatterSeries with ColorAxis Hot (top legend) */
function colorMapHot64ExtremeTopLegend(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.hot(64),
    MarkerType.Cross,
    AxisPosition.Top,
    OxyColors.Magenta,
    OxyColors.Green,
  )
}

/** ScatterSeries with ColorAxis Hot(16) N=31000 */
function colorMapHot16Big(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    31000,
    OxyPalettes.hot(16),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/** ScatterSeries with ColorAxis BlueWhiteRed (3) */
function colorMapBlueWhiteRed3(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.blueWhiteRed(3),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/** ScatterSeries with ColorAxis BlueWhiteRed (9) */
function colorMapBlueWhiteRed9(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.blueWhiteRed(9),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/** ScatterSeries with ColorAxis BlueWhiteRed (256) */
function colorMapBlueWhiteRed256(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.blueWhiteRed(256),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/**
 * Example: ScatterSeries with ColorAxis BlackWhiteRed (9)
 */
function colorMapBlackWhiteRed9(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.blackWhiteRed(9),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/**
 * Example: ScatterSeries with ColorAxis BlackWhiteRed (9) top legend
 */
function colorMapBlackWhiteRed9TopLegend(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.blackWhiteRed(9),
    MarkerType.Square,
    AxisPosition.Top,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/**
 * Example: ScatterSeries with ColorAxis Viridis
 */
function colorMapViridis(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.viridis(),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/**
 * Example: ScatterSeries with ColorAxis Plasma
 */
function colorMapPlasma(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.plasma(),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/**
 * Example: ScatterSeries with ColorAxis Magma
 */
function colorMapMagma(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.magma(),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/**
 * Example: ScatterSeries with ColorAxis Inferno
 */
function colorMapInferno(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.inferno(),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/**
 * Example: ScatterSeries with ColorAxis Cividis
 */
function colorMapCividis(): PlotModel {
  return createRandomScatterSeriesWithColorAxisPlotModel(
    2500,
    OxyPalettes.cividis(),
    MarkerType.Square,
    AxisPosition.Right,
    OxyColors.Undefined,
    OxyColors.Undefined,
  )
}

/** ScatterSeries with single-selected items */
function singleSelectItems(): PlotModel {
  const model = randomScatter(10, 8)
  model.subtitle = 'Click to select a point'

  model.selectionColor = OxyColors.Red

  const series = model.series[0] as ScatterSeries

  series.selectionMode = SelectionMode.Single

  series.selectItem(3)
  series.selectItem(5)

  series.mouseDown = (s, e) => {
    const index = e.hitTestResult.index!
    series.selectItem(index)
    model.invalidatePlot(false)
    e.handled = true
  }
  model.mouseDown = (s, e) => {
    series.clearSelection()
    model.invalidatePlot(false)
    e.handled = true
  }

  return model
}

/** ScatterSeries with multi-selected items */
function multiSelectItems(): PlotModel {
  const model = randomScatter(10, 8)
  model.subtitle = 'Click to toggle point selection'

  model.selectionColor = OxyColors.Red

  const series = model.series[0] as ScatterSeries

  series.selectionMode = SelectionMode.Multiple

  series.selectItem(3)
  series.selectItem(5)

  series.mouseDown = (s, e) => {
    const index = e.hitTestResult.index!

    // Toggle the selection state for this item
    if (series.isItemSelected(index)) {
      series.unselectItem(index)
    } else {
      series.selectItem(index)
    }

    model.invalidatePlot(false)
    e.handled = true
  }

  model.mouseDown = (s, e) => {
    series.clearSelection()
    model.invalidatePlot(false)
    e.handled = true
  }

  return model
}

function allSelected(): PlotModel {
  return createAllSelectedModel(false)
}

function allSelectedWithTracker(): PlotModel {
  return createAllSelectedModel(true)
}

function trackerFormatString(): PlotModel {
  const model = new PlotModel({ title: 'TrackerFormatString' })

  const s1 = new ScatterSeries({
    trackerStringFormatter: function (args) {
      return (args.item as MyPoint).sum.toString()
    },
    dataFieldX: 'x',
    dataFieldY: 'y',
  })

  const myPoints: MyPoint[] = [new MyPoint(10, 40), new MyPoint(40, 20), new MyPoint(60, 30)]

  s1.itemsSource = myPoints
  model.series.push(s1)

  return model
}

function createAllSelectedModel(showTracker: boolean): PlotModel {
  const model = randomScatter(10, 8)
  model.subtitle = 'Click to select all points'

  model.selectionColor = OxyColors.Red

  const series = model.series[0] as ScatterSeries

  series.selectionMode = SelectionMode.All

  series.mouseDown = (s, e) => {
    series.select()
    model.invalidatePlot(false)
    e.handled = !showTracker
  }

  model.mouseDown = (s, e) => {
    if (e.hitTestResult !== undefined && showTracker) {
      return
    }

    series.clearSelection()
    model.invalidatePlot(false)
    e.handled = true
  }

  return model
}

// ===============================

class MyPoint {
  constructor(public x: number, public y: number) {}

  get sum(): number {
    // calculated on request
    return this.x + this.y
  }
}

function randomScatter(n: number, binSize: number): PlotModel {
  const model = new PlotModel({
    title: `ScatterSeries (n=${n})`,
    subtitle: binSize > 0 ? `BinSize = ${binSize}` : "No 'binning'",
  })

  const s1 = new ScatterSeries({
    title: 'Series 1',
    markerType: MarkerType.Diamond,
    markerStrokeThickness: 0,
    binSize: binSize,
  })

  const r = new Random()
  for (let i = 0; i < n; i++) {
    s1.points.push({
      x: r.next(),
      y: r.next(),
    })
  }

  model.series.push(s1)
  return model
}

function createRandomScatterSeriesWithColorAxisPlotModel(
  n: number,
  palette: OxyPalette,
  markerType: MarkerType,
  colorAxisPosition: AxisPosition,
  highColor: OxyColor,
  lowColor: OxyColor,
): PlotModel {
  const model = new PlotModel({
    title: `ScatterSeries (n=${n})`,
    background: OxyColors.LightGray,
  })

  const colorAxis = new LinearColorAxis({
    position: colorAxisPosition,
    palette,
    minimum: -1,
    maximum: 1,
    highColor,
    lowColor,
  })

  model.axes.push(colorAxis)
  model.series.push(createRandomScatterSeries(n, markerType, false, true, colorAxis))
  return model
}

function createCorrelatedScatter(n: number): PlotModel {
  const model = new PlotModel({ title: `Correlated ScatterSeries (n=${n})` })

  const s1 = new ScatterSeries({
    title: 'Series 1',
    markerType: MarkerType.Diamond,
    markerStrokeThickness: 0,
  })

  const random = new Random()
  for (let i = 0; i < n; i++) {
    const x = getNormalDistributedValue(random)
    const y = 2 * x * x + getNormalDistributedValue(random)
    s1.points.push({ x, y })
  }

  model.series.push(s1)
  return model
}

function createRandomScatterSeriesWithMarker(
  r: Random,
  n: number,
  title: string,
  markerType: MarkerType,
): ScatterSeries {
  const s1 = new ScatterSeries({
    title: title,
    markerType: markerType,
    markerStroke: OxyColors.Black,
    markerStrokeThickness: 1.0,
  })
  for (let i = 0; i < n; i++) {
    const x = r.next() * 10
    const y = r.next() * 10
    const p = { x, y }
    s1.points.push(p)
  }

  return s1
}

function getNormalDistributedValue(rnd: Random): number {
  const d1 = rnd.next()
  const d2 = rnd.next()
  return Math.sqrt(-2.0 * Math.log(d1)) * Math.sin(2.0 * Math.PI * d2)
}

function createRandomDataPoints(n: number): DataPoint[] {
  return createRandomScatterPoints(n).map((sp) => newDataPoint(sp.x, sp.y))
}

function createRandomScatterPoints(n: number): ScatterPoint[] {
  const r = new Random()

  const points: ScatterPoint[] = []
  for (let i = 0; i < n; i++) {
    const x = r.next() * 10
    const y = r.next() * 10
    const p = { x, y }
    points.push(p)
  }

  return points
}

const category = 'ScatterSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Correlated points',
      example: {
        model: correlatedScatter,
      },
    },
    {
      title: 'Random points',
      example: {
        model: randomScatter1,
      },
    },
    {
      title: 'Random points (BinSize=2)',
      example: {
        model: randomScatter2,
      },
    },
    {
      title: 'Random points (BinSize=4)',
      example: {
        model: randomScatter4,
      },
    },
    {
      title: 'Random points (BinSize=6)',
      example: {
        model: randomScatter6,
      },
    },
    {
      title: 'Random points (BinSize=8)',
      example: {
        model: randomScatter8,
      },
    },
    {
      title: 'Random points (BinSize=10)',
      example: {
        model: randomScatter10,
      },
    },
    {
      title: 'Two ScatterSeries',
      example: {
        model: twoScatterSeries,
      },
    },
    {
      title: 'LabelFormatString',
      example: {
        model: labelFormatString,
      },
    },
    {
      title: 'Random points with random size',
      example: {
        model: randomSize,
      },
    },
    {
      title: 'Random points with least squares fit',
      example: {
        model: randomWithFit,
      },
    },
    {
      title: 'Marker types',
      example: {
        model: markerTypes,
      },
    },
    {
      title: 'ScatterSeries.Points',
      example: {
        model: dataPoints,
      },
    },
    {
      title: 'ScatterSeries.ItemsSource',
      example: {
        model: fromItemsSource,
      },
    },
    {
      title: 'ScatterSeries.ItemsSource + Mapping',
      example: {
        model: fromMapping,
      },
    },
    {
      title: 'ScatterSeries.ItemsSource + reflection',
      example: {
        model: fromItemsSourceReflection,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Rainbow(16)',
      example: {
        model: colorMapRainbow16,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Hue(30) Star',
      example: {
        model: colorMapHue30,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Hot(64)',
      example: {
        model: colorMapHot64,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Cool(32)',
      example: {
        model: colorMapCool32,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Gray(32)',
      example: {
        model: colorMapGray32,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Jet(32)',
      example: {
        model: colorMapJet32,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Hot with extreme colors',
      example: {
        model: colorMapHot64Extreme,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Hot (top legend)',
      example: {
        model: colorMapHot64ExtremeTopLegend,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Hot(16) N=31000',
      example: {
        model: colorMapHot16Big,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis BlueWhiteRed (3)',
      example: {
        model: colorMapBlueWhiteRed3,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis BlueWhiteRed (9)',
      example: {
        model: colorMapBlueWhiteRed9,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis BlueWhiteRed (256)',
      example: {
        model: colorMapBlueWhiteRed256,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis BlackWhiteRed (9)',
      example: {
        model: colorMapBlackWhiteRed9,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis BlackWhiteRed (9) top legend',
      example: {
        model: colorMapBlackWhiteRed9TopLegend,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Viridis',
      example: {
        model: colorMapViridis,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Plasma',
      example: {
        model: colorMapPlasma,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Magma',
      example: {
        model: colorMapMagma,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Inferno',
      example: {
        model: colorMapInferno,
      },
    },
    {
      title: 'ScatterSeries with ColorAxis Cividis',
      example: {
        model: colorMapCividis,
      },
    },
    {
      title: 'ScatterSeries with single-selected items',
      example: {
        model: singleSelectItems,
      },
    },
    {
      title: 'ScatterSeries with multi-selected items',
      example: {
        model: multiSelectItems,
      },
    },
    {
      title: 'ScatterSeries with SelectionMode.All (no tracker)',
      example: {
        model: allSelected,
      },
    },
    {
      title: 'ScatterSeries with SelectionMode.All (with tracker)',
      example: {
        model: allSelectedWithTracker,
      },
    },
    {
      title: 'TrackerFormatString',
      example: {
        model: trackerFormatString,
      },
    },
  ],
} as ExampleCategory
