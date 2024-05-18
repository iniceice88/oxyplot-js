import {
  AngleAxis,
  AngleAxisFullPlotArea,
  AreaSeries,
  ArrowAnnotation,
  BarSeries,
  BoxPlotSeries,
  CandleStickSeries,
  CategoryAxis,
  CategoryColorAxis,
  ContourSeries,
  DateTimeAxis,
  EllipseAnnotation,
  ErrorBarSeries,
  ExtrapolationLineSeries,
  FunctionAnnotation,
  FunctionSeries,
  HeatMapSeries,
  HighLowSeries,
  HistogramSeries,
  ImageAnnotation,
  IntervalBarSeries,
  Legend,
  LineAnnotation,
  LinearAxis,
  LinearBarSeries,
  LinearColorAxis,
  LineSeries,
  LogarithmicAxis,
  LogarithmicColorAxis,
  MagnitudeAxis,
  MagnitudeAxisFullPlotArea,
  PieSeries,
  PointAnnotation,
  PolygonAnnotation,
  PolygonSeries,
  PolylineAnnotation,
  RangeColorAxis,
  RectangleAnnotation,
  RectangleBarSeries,
  RectangleSeries,
  ScatterSeries,
  StairStepSeries,
  StemSeries,
  TextAnnotation,
  ThreeColorLineSeries,
  TimeSpanAxis,
  TornadoBarSeries,
  TwoColorAreaSeries,
  TwoColorLineSeries,
  VectorSeries,
  VolumeSeries,
} from '@/oxyplot'

type CustomElementInstanceProvider = (name: string, opt?: any) => any
let _customElementInstanceProvider: CustomElementInstanceProvider | null = null

export function setCustomElementInstanceProvider(provider: CustomElementInstanceProvider) {
  _customElementInstanceProvider = provider
}

export function newOxyElement(name: string, opt?: any) {
  if (_customElementInstanceProvider) {
    const instance = _customElementInstanceProvider(name, opt)
    if (instance) return instance
  }

  switch (name) {
    case 'AngleAxis':
      return new AngleAxis(opt)
    case 'AngleAxisFullPlotArea':
      return new AngleAxisFullPlotArea(opt)
    case 'AreaSeries':
      return new AreaSeries(opt)
    case 'ArrowAnnotation':
      return new ArrowAnnotation(opt)
    case 'BarSeries':
      return new BarSeries(opt)
    case 'BoxPlotSeries':
      return new BoxPlotSeries(opt)
    case 'CandleStickSeries':
      return new CandleStickSeries(opt)
    case 'CategoryAxis':
      return new CategoryAxis(opt)
    case 'CategoryColorAxis':
      return new CategoryColorAxis(opt)
    case 'ContourSeries':
      return new ContourSeries(opt)
    case 'DateTimeAxis':
      return new DateTimeAxis(opt)
    case 'EllipseAnnotation':
      return new EllipseAnnotation(opt)
    case 'ErrorBarSeries':
      return new ErrorBarSeries(opt)
    case 'ExtrapolationLineSeries':
      return new ExtrapolationLineSeries(opt)
    case 'FunctionAnnotation':
      return new FunctionAnnotation(opt)
    case 'FunctionSeries':
      return new FunctionSeries(opt)
    case 'HeatMapSeries':
      return new HeatMapSeries(opt)
    case 'HighLowSeries':
      return new HighLowSeries(opt)
    case 'HistogramSeries':
      return new HistogramSeries(opt)
    case 'ImageAnnotation':
      return new ImageAnnotation(opt)
    case 'IntervalBarSeries':
      return new IntervalBarSeries(opt)
    case 'Legend':
      return new Legend(opt)
    case 'LineAnnotation':
      return new LineAnnotation(opt)
    case 'LineSeries':
      return new LineSeries(opt)
    case 'LinearAxis':
      return new LinearAxis(opt)
    case 'LinearBarSeries':
      return new LinearBarSeries(opt)
    case 'LinearColorAxis':
      return new LinearColorAxis(opt)
    case 'LogarithmicAxis':
      return new LogarithmicAxis(opt)
    case 'LogarithmicColorAxis':
      return new LogarithmicColorAxis(opt)
    case 'MagnitudeAxis':
      return new MagnitudeAxis(opt)
    case 'MagnitudeAxisFullPlotArea':
      return new MagnitudeAxisFullPlotArea(opt)
    case 'PieSeries':
      return new PieSeries(opt)
    case 'PointAnnotation':
      return new PointAnnotation(opt)
    case 'PolygonAnnotation':
      return new PolygonAnnotation(opt)
    case 'PolygonSeries':
      return new PolygonSeries(opt)
    case 'PolylineAnnotation':
      return new PolylineAnnotation(opt)
    case 'RangeColorAxis':
      return new RangeColorAxis(opt)
    case 'RectangleAnnotation':
      return new RectangleAnnotation(opt)
    case 'RectangleBarSeries':
      return new RectangleBarSeries(opt)
    case 'RectangleSeries':
      return new RectangleSeries(opt)
    case 'ScatterSeries':
      return new ScatterSeries(opt)
    case 'StairStepSeries':
      return new StairStepSeries(opt)
    case 'StemSeries':
      return new StemSeries(opt)
    case 'TextAnnotation':
      return new TextAnnotation(opt)
    case 'ThreeColorLineSeries':
      return new ThreeColorLineSeries(opt)
    case 'TimeSpanAxis':
      return new TimeSpanAxis(opt)
    case 'TornadoBarSeries':
      return new TornadoBarSeries(opt)
    case 'TwoColorAreaSeries':
      return new TwoColorAreaSeries(opt)
    case 'TwoColorLineSeries':
      return new TwoColorLineSeries(opt)
    case 'VectorSeries':
      return new VectorSeries(opt)
    case 'VolumeSeries':
      return new VolumeSeries(opt)
    default:
      return undefined
  }
}
