import {
  AngleAxis,
  ArrayBuilder,
  AxisPosition,
  BarItem,
  BarSeries,
  CategoryAxis,
  ContourSeries,
  DataPoint,
  DataPoint_Zero,
  DateTimeAxis,
  DateTimeIntervalType,
  getDateService,
  HeatMapCoordinateDefinition,
  HeatMapSeries,
  type IRenderContext,
  Legend,
  LinearAxis,
  LinearColorAxis,
  LineSeries,
  LineStyle,
  MagnitudeAxis,
  MarkerType,
  newDataPoint,
  OxyColor,
  OxyColorExtensions,
  OxyColors,
  OxyPalette,
  OxyThickness,
  PlotModel,
  PlotType,
  ScreenVector,
  StairStepSeries,
  TickStyle,
  XYAxisSeries,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'
import { Random } from '../Random'
import { HeatMapSeriesExamples } from '../Series/HeatMapSeriesExamples'

/**
 * Example: "#445576: Invisible contour series"
 */
function invisibleContourSeries(): PlotModel {
  const model = new PlotModel()
  model.title = 'Invisible contour series'
  const cs = new ContourSeries()
  cs.isVisible = false
  cs.columnCoordinates = ArrayBuilder.createVectorWithStep(-1, 1, 0.05)
  cs.rowCoordinates = ArrayBuilder.createVectorWithStep(-1, 1, 0.05)
  cs.data = ArrayBuilder.evaluate((x, y) => x + y, cs.columnCoordinates, cs.rowCoordinates)
  model.series.push(cs)
  return model
}

/**
 * Example: "#461507: StairStepSeries NullReferenceException"
 */
function stairStepSeries_NullReferenceException(): PlotModel {
  const plotModel1 = new PlotModel()
  plotModel1.title = 'StairStepSeries NullReferenceException'
  plotModel1.series.push(new StairStepSeries())
  return plotModel1
}

/**
 * Example: "#501409: Heatmap interpolation color"
 */
function heatMapSeriesInterpolationColor(): PlotModel {
  const data: number[][] = [
    [10, 0, -10],
    [0, 0, 0],
  ]

  const model = new PlotModel({ title: 'HeatMapSeries' })
  model.axes.push(
    new LinearColorAxis({
      position: AxisPosition.Right,
      palette: new OxyPalette([OxyColors.Red, OxyColors.Green, OxyColors.Blue]),
    }),
  )

  const hms = new HeatMapSeries({
    coordinateDefinition: HeatMapCoordinateDefinition.Center,
    x0: 0,
    x1: 3,
    y0: 0,
    y1: 2,
    data: data,
    interpolate: false,
    labelFontSize: 0.2,
  })
  model.series.push(hms)
  return model
}

/**
 * Example: "#522598: Peaks 400x400"
 */
function peaks400(): PlotModel {
  return HeatMapSeriesExamples.createPeaks(undefined, true, 400)
}

/**
 * Updating HeatMapSeries 1 example.
 */
function updatingHeatMapSeries1(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks()
  model.title = 'Updating HeatMapSeries'
  model.subtitle = 'Click the heat map to change the Maximum of the color axis.'
  const lca = model.axes[0] as LinearColorAxis
  const hms = model.series[0] as HeatMapSeries
  hms.onMouseDown = (e) => {
    lca.maximum = isNaN(lca.maximum) ? 10 : NaN
    model.invalidatePlot(true)
  }
  return model
}

/**
 * Updating HeatMapSeries 2 example.
 */
function updatingHeatMapSeries2(): PlotModel {
  const model = HeatMapSeriesExamples.createPeaks()
  model.title = 'Updating HeatMapSeries'
  model.subtitle =
    'Click the heat map to change the Maximum of the color axis and invoke the Invalidate method on the HeatMapSeries.'
  const lca = model.axes[0] as LinearColorAxis
  const hms = model.series[0] as HeatMapSeries
  hms.onMouseDown = (e) => {
    lca.maximum = isNaN(lca.maximum) ? 10 : NaN
    hms.invalidate()
    model.invalidatePlot(true)
  }
  return model
}

/**
 * Example: "#539104: Reduced color saturation"
 */
function reducedColorSaturation(): PlotModel {
  const model = new PlotModel()
  model.title = 'Reduced color saturation'
  model.axes.push(new CategoryAxis({ position: AxisPosition.Bottom }))

  // modify the saturation of the default colors
  model.defaultColors = model.defaultColors.map((c) => OxyColorExtensions.changeSaturation(c, 0.5))

  const r = new Random()
  for (let i = 0; i < model.defaultColors.length; i++) {
    const columnSeries = new BarSeries()
    columnSeries.items.push(BarItem.fromValue(50 + r.next() * 50))
    columnSeries.items.push(BarItem.fromValue(40 + r.next() * 50))
    model.series.push(columnSeries)
  }

  return model
}

/**
 * Example: "#539104: Medium intensity colors"
 */
function mediumIntensityColors(): PlotModel {
  const model = new PlotModel()
  model.title = 'Medium intensity colors'
  model.axes.push(new CategoryAxis({ position: AxisPosition.Bottom }))

  // See http://www.perceptualedge.com/articles/visual_business_intelligence/rules_for_using_color.pdf
  model.defaultColors = [
    OxyColor.fromRgb(114, 114, 114),
    OxyColor.fromRgb(241, 89, 95),
    OxyColor.fromRgb(121, 195, 106),
    OxyColor.fromRgb(89, 154, 211),
    OxyColor.fromRgb(249, 166, 90),
    OxyColor.fromRgb(158, 102, 171),
    OxyColor.fromRgb(205, 112, 88),
    OxyColor.fromRgb(215, 127, 179),
  ]

  const r = new Random()
  for (let i = 0; i < model.defaultColors.length; i++) {
    const columnSeries = new BarSeries()
    columnSeries.items.push(BarItem.fromValue(50 + r.next() * 50))
    columnSeries.items.push(BarItem.fromValue(40 + r.next() * 50))
    model.series.push(columnSeries)
  }

  return model
}

/**
 * Example: "#539104: Brewer colors (4)"
 */
function brewerColors4(): PlotModel {
  const model = new PlotModel()
  model.title = 'Brewer colors (Accent scheme)'
  model.axes.push(new CategoryAxis({ position: AxisPosition.Bottom }))

  // See http://colorbrewer2.org/?type=qualitative&scheme=Accent&n=4
  model.defaultColors = [
    OxyColor.fromRgb(127, 201, 127),
    OxyColor.fromRgb(190, 174, 212),
    OxyColor.fromRgb(253, 192, 134),
    OxyColor.fromRgb(255, 255, 153),
  ]

  const r = new Random()
  for (let i = 0; i < model.defaultColors.length; i++) {
    const columnSeries = new BarSeries()
    columnSeries.items.push(BarItem.fromValue(50 + r.next() * 50))
    columnSeries.items.push(BarItem.fromValue(40 + r.next() * 50))
    model.series.push(columnSeries)
  }

  return model
}

/**
 * Example: "#539104: Brewer colors (6)"
 */
function brewerColors6(): PlotModel {
  const model = new PlotModel()
  model.title = 'Brewer colors (Paired scheme)'
  model.axes.push(new CategoryAxis({ position: AxisPosition.Bottom }))

  // See http://colorbrewer2.org/?type=qualitative&scheme=Paired&n=6
  model.defaultColors = [
    OxyColor.fromRgb(166, 206, 227),
    OxyColor.fromRgb(31, 120, 180),
    OxyColor.fromRgb(178, 223, 138),
    OxyColor.fromRgb(51, 160, 44),
    OxyColor.fromRgb(251, 154, 153),
    OxyColor.fromRgb(227, 26, 28),
  ]

  const r = new Random()
  for (let i = 0; i < model.defaultColors.length; i++) {
    const columnSeries = new BarSeries()
    columnSeries.items.push(BarItem.fromValue(50 + r.next() * 50))
    columnSeries.items.push(BarItem.fromValue(40 + r.next() * 50))
    model.series.push(columnSeries)
  }

  return model
}

/**
 * Example: "#542701: Same color of LineSeries and axis title & labels"
 */
function sameColorOfLineSeriesAndAxisTitleAndLabels(): PlotModel {
  const model = new PlotModel()
  model.title = 'Same color of LineSeries and axis title & labels'
  const color = OxyColors.IndianRed
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      title: 'Axis 1',
      titleColor: color,
      textColor: color,
    }),
  )
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.series.push(
    new LineSeries({
      title: 'LineSeries 1',
      color: color,
      itemsSource: [newDataPoint(0, 0), newDataPoint(10, 3), newDataPoint(20, 2)],
    }),
  )
  return model
}

/**
 * Example: "#549839: Polar plot with custom arrow series"
 */
function polarPlotWithArrows(): PlotModel {
  const model = new PlotModel()
  model.title = 'Custom arrow series'
  model.plotType = PlotType.Polar
  model.plotAreaBorderColor = OxyColors.Undefined
  model.axes.push(
    new AngleAxis({
      minimum: 0,
      maximum: 360,
      majorStep: 30,
      minorStep: 30,
      majorGridlineStyle: LineStyle.Dash,
    }),
  )
  model.axes.push(
    new MagnitudeAxis({
      minimum: 0,
      maximum: 5,
      majorStep: 1,
      minorStep: 1,
      angle: 90,
      majorGridlineStyle: LineStyle.Dash,
    }),
  )
  model.series.push(new ArrowSeries549839({ endPoint: newDataPoint(1, 40) }))
  model.series.push(new ArrowSeries549839({ endPoint: newDataPoint(2, 75) }))
  model.series.push(new ArrowSeries549839({ endPoint: newDataPoint(3, 110) }))
  model.series.push(new ArrowSeries549839({ endPoint: newDataPoint(4, 140) }))
  model.series.push(new ArrowSeries549839({ endPoint: newDataPoint(5, 180) }))
  return model
}

/**
 * Example: "MarkerType = Circle problem"
 */
function markerTypeCircleProblem(): PlotModel {
  const plotModel = new PlotModel({
    plotType: PlotType.Cartesian,
    plotAreaBorderThickness: new OxyThickness(0),
  })

  const l = new Legend()
  l.legendSymbolLength = 30
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dateService = getDateService()

  const xaxis = new DateTimeAxis({
    position: AxisPosition.Bottom,
    tickStyle: TickStyle.None,
    axislineStyle: LineStyle.Solid,
    axislineColor: OxyColor.fromRgb(153, 153, 153),
    stringFormatter: (dt: Date, format) => {
      return monthsShort[dt.getMonth()] + dateService.format(dt, 'd HH')
    },
    intervalType: DateTimeIntervalType.Hours,
  })

  const yaxis = new LinearAxis({
    position: AxisPosition.Left,
    minimum: 0.001,
    maximum: 3,
    majorGridlineStyle: LineStyle.Solid,
    tickStyle: TickStyle.None,
    intervalLength: 50,
  })

  plotModel.axes.push(xaxis)
  plotModel.axes.push(yaxis)

  const series1 = new LineSeries({
    color: OxyColor.fromRgb(44, 169, 173),
    strokeThickness: 1,
    markerType: MarkerType.Circle,
    markerStroke: OxyColors.Blue,
    markerFill: OxyColors.SkyBlue,
    markerSize: 2,
    dataFieldX: 'Date',
    dataFieldY: 'Value',
    trackerStringFormatter: (args) => {
      //trackerFormatString: 'Date: {2:d HH}\nValue: {4}'
      return `Date: ${dateService.format(args.xValue, 'DD HH')}\nValue: ${args.yValue}`
    },
  })

  series1.points.push(newDataPoint(0.1, 0.7))
  series1.points.push(newDataPoint(0.6, 0.9))
  series1.points.push(newDataPoint(1.0, 0.85))
  series1.points.push(newDataPoint(1.4, 0.95))
  series1.points.push(newDataPoint(1.8, 1.2))
  series1.points.push(newDataPoint(2.2, 1.7))
  series1.points.push(newDataPoint(2.6, 1.7))
  series1.points.push(newDataPoint(3.0, 0.7))

  plotModel.series.push(series1)

  return plotModel
}

class ArrowSeries549839 extends XYAxisSeries {
  private defaultColor: OxyColor = OxyColors.Undefined

  public startPoint: DataPoint = DataPoint_Zero
  public endPoint: DataPoint = DataPoint_Zero
  public color: OxyColor
  public strokeThickness: number

  constructor(opt?: any) {
    super(opt)
    this.color = OxyColors.Automatic
    this.strokeThickness = 2
    if (opt) {
      Object.assign(this, opt)
    }
  }

  setDefaultValues(): void {
    if (this.color.isAutomatic()) {
      this.defaultColor = this.plotModel.getDefaultColor()
    }
  }

  public get actualColor(): OxyColor {
    return this.color.getActualColor(this.defaultColor)
  }

  public async render(rc: IRenderContext): Promise<void> {
    // transform to screen coordinates
    const p0 = this.transform(this.startPoint)
    const p1 = this.transform(this.endPoint)

    const direction = p1.minus(p0)
    const normal = new ScreenVector(direction.y, -direction.x)

    // the end points of the arrow head, scaled by length of arrow
    const p2 = p1.minusVector(direction.times(0.2)).plus(normal.times(0.1))
    const p3 = p1.minusVector(direction.times(0.2)).minusVector(normal.times(0.1))

    // draw the line segments
    await rc.drawLineSegments([p0, p1, p1, p2, p1, p3], this.actualColor, this.strokeThickness, this.edgeRenderingMode)
  }
}

const category = 'Z0 Discussions'

export default {
  category,
  examples: [
    {
      title: '#445576: Invisible contour series',
      example: {
        model: invisibleContourSeries,
      },
    },
    {
      title: '#461507: StairStepSeries NullReferenceException',
      example: {
        model: stairStepSeries_NullReferenceException,
      },
    },
    {
      title: '#501409: Heatmap interpolation color',
      example: {
        model: heatMapSeriesInterpolationColor,
      },
    },
    {
      title: '#522598: Peaks 400x400',
      example: {
        model: peaks400,
      },
    },
    {
      title: '#474875: Updating HeatMapSeries 1',
      example: {
        model: updatingHeatMapSeries1,
      },
    },
    {
      title: '#474875: Updating HeatMapSeries 2',
      example: {
        model: updatingHeatMapSeries2,
      },
    },
    {
      title: '#539104: Reduced color saturation',
      example: {
        model: reducedColorSaturation,
      },
    },
    {
      title: '#539104: Medium intensity colors',
      example: {
        model: mediumIntensityColors,
      },
    },
    {
      title: '#539104: Brewer colors (4)',
      example: {
        model: brewerColors4,
      },
    },
    {
      title: '#539104: Brewer colors (6)',
      example: {
        model: brewerColors6,
      },
    },
    {
      title: '#542701: Same color of LineSeries and axis title & labels',
      example: {
        model: sameColorOfLineSeriesAndAxisTitleAndLabels,
      },
    },
    {
      title: '#549839: Polar plot with custom arrow series',
      example: {
        model: polarPlotWithArrows,
      },
    },
    {
      title: 'MarkerType = Circle problem',
      example: {
        model: markerTypeCircleProblem,
      },
    },
  ],
} as ExampleCategory
