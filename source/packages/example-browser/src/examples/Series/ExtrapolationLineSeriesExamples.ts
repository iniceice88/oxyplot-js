import {
  AxisPosition,
  ExtrapolationLineSeries,
  Legend,
  LegendPosition,
  LinearAxis,
  LineStyle,
  LogarithmicAxis,
  maxValueOfArray,
  minValueOfArray,
  newDataPoint,
  newDataRange,
  OxyColors,
  PlotModel,
  PlotModelUtilities,
  type ScatterPoint,
  ScatterSeries,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/**
 * Creates an example showing a line fit which is extrapolated
 * beyond the range given by the data points.
 * @returns A PlotModel.
 */
function extrapolatedLineSeries(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Line Fit' })

  const scatterSeries = new ScatterSeries({
    title: 'Data',
  })

  scatterSeries.points.push({ x: 3, y: 1.4 })
  scatterSeries.points.push({ x: 4, y: 1.3 })
  scatterSeries.points.push({ x: 5, y: 1.6 })
  scatterSeries.points.push({ x: 6, y: 2.3 })
  scatterSeries.points.push({ x: 7, y: 2.2 })
  scatterSeries.points.push({ x: 8, y: 2.5 })
  scatterSeries.points.push({ x: 9, y: 2.9 })
  scatterSeries.points.push({ x: 10, y: 3.1 })
  scatterSeries.points.push({ x: 11, y: 3.1 })
  scatterSeries.points.push({ x: 12, y: 3.8 })

  model.series.push(scatterSeries)

  const { slope, intercept } = calculateLinearRegressionParameters(scatterSeries.points)

  const lineSeries = new ExtrapolationLineSeries({
    title: 'Fit',
    color: OxyColors.Black,
    lineStyle: LineStyle.Solid,
    extrapolationColor: OxyColors.DarkGray,
    extrapolationLineStyle: LineStyle.Dash,
    strokeThickness: 3,
    ignoreExtraplotationForScaling: true,
  })

  lineSeries.intervals.push(
    newDataRange(Number.NEGATIVE_INFINITY, minValueOfArray(scatterSeries.points.map((p) => p.x))),
  )
  lineSeries.intervals.push(
    newDataRange(maxValueOfArray(scatterSeries.points.map((p) => p.x)), Number.POSITIVE_INFINITY),
  )

  const fitPoints = Array.from({ length: 200 }, (_, i) => i - 100).map((x) => newDataPoint(x, slope * x + intercept))

  lineSeries.points.push(...fitPoints)
  model.series.push(lineSeries)

  const legend = new Legend({
    legendPosition: LegendPosition.BottomRight,
  })

  model.legends.push(legend)

  return model
}

/**
 * Creates an example showing a third-order polynomial with extra- and interpolation style.
 * @returns A PlotModel.
 */
function interpolationStyleLineSeries(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Interpolation' })

  const lineSeries = new ExtrapolationLineSeries({
    title: 'Third Order Polynomial',
    color: OxyColors.Black,
    lineStyle: LineStyle.Dash,
    extrapolationColor: OxyColors.Gray,
    extrapolationLineStyle: LineStyle.Dot,
    strokeThickness: 3,
  })

  lineSeries.intervals.push(newDataRange(Number.NEGATIVE_INFINITY, -15))
  lineSeries.intervals.push(newDataRange(10, 30))
  lineSeries.intervals.push(newDataRange(55, Number.POSITIVE_INFINITY))

  const coefficients = [0.1, -6.0, -12, 0]

  const polynomialValue = (x: number, coeff: number[]): number => {
    // Horner's schema
    return coeff.reduce((acc, coefficient) => acc * x + coefficient, 0)
  }

  const points = Array.from({ length: 100 }, (_, i) => i - 30).map((x) =>
    newDataPoint(x, polynomialValue(x, coefficients)),
  )

  lineSeries.points.push(...points)

  model.series.push(lineSeries)

  const legend = new Legend({
    legendPosition: LegendPosition.TopCenter,
  })

  model.legends.push(legend)

  return model
}

/**
 * Creates an example showing a third-order polynomial with extra- and
 * interpolation style and an inverted y-axis.
 * @returns A PlotModel.
 */
function twoColorLineSeriesReversed(): PlotModel {
  return PlotModelUtilities.reverseYAxis(interpolationStyleLineSeries())
}

/**
 * Creates an example where the provided extrapolation
 * intervals overlap with each other.
 * @returns A PlotModel.
 */
function intersectingIntervals(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Intersecting Intervals' })

  const i1 = newDataRange(-20, 20)
  const i2 = newDataRange(0, 30)
  const i3 = newDataRange(10, 40)

  const lineSeries = new ExtrapolationLineSeries({
    title: `Overlapping intervals ${i1}, ${i2}, ${i3}`,
    color: OxyColors.Black,
    lineStyle: LineStyle.Solid,
    extrapolationColor: OxyColors.Gray,
    extrapolationLineStyle: LineStyle.Dot,
    strokeThickness: 3,
  })

  lineSeries.intervals.push(i1, i2, i3)

  const coefficients = [0.1, -6.0, -12, 0]

  const polynomialValue = (x: number, coeff: number[]): number => {
    // Horner's schema
    return coeff.reduce((acc, coefficient) => acc * x + coefficient, 0)
  }

  const points = Array.from({ length: 100 }, (_, i) => i - 30).map((x) =>
    newDataPoint(x, polynomialValue(x, coefficients)),
  )

  lineSeries.points.push(...points)
  model.series.push(lineSeries)

  const legend = new Legend({
    legendPosition: LegendPosition.TopCenter,
  })

  model.legends.push(legend)

  return model
}

/**
 * Creates an example showing a line using custom dash arrays for the
 * normal and extrapolated parts of the curve.
 * @returns A PlotModel.
 */
function customDashes(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'Custom Dashes' })

  const lineSeries = new ExtrapolationLineSeries({
    title: 'y = 5',
    color: OxyColors.Black,
    lineStyle: LineStyle.Dash,
    dashes: [5, 1],
    extrapolationColor: OxyColors.Gray,
    extrapolationLineStyle: LineStyle.Dot,
    extrapolationDashes: [1, 5],
    strokeThickness: 3,
  })

  lineSeries.intervals.push(newDataRange(Number.NEGATIVE_INFINITY, 0))

  const points = Array.from({ length: 200 }, (_, i) => i - 100).map((x) => newDataPoint(x, 5))

  lineSeries.points.push(...points)

  model.series.push(lineSeries)

  const legend = new Legend({
    legendPosition: LegendPosition.TopCenter,
  })

  model.legends.push(legend)

  return model
}

/**
 * Creates an example to test the performance with 100000 points and 100 intervals.
 * @returns A PlotModel.
 */
function manyIntervals(): PlotModel {
  const model: PlotModel = new PlotModel({ title: 'ManyIntervals' })

  const lineSeries = new ExtrapolationLineSeries({
    title: 'y = x',
    color: OxyColors.Red,
    lineStyle: LineStyle.Solid,
    extrapolationLineStyle: LineStyle.Solid,
    strokeThickness: 3,
    ignoreExtraplotationForScaling: true,
  })

  lineSeries.intervals.push(newDataRange(-1000, 10000))

  const intervals = Array.from({ length: 98 }, (_, i) => newDataRange(1000 * i, 1000 * i + 500))

  intervals.forEach((interval) => lineSeries.intervals.push(interval))

  lineSeries.intervals.push(newDataRange(200000, Number.POSITIVE_INFINITY))

  const points = Array.from({ length: 100000 }, (_, i) => newDataPoint(i, i))

  lineSeries.points.push(...points)

  model.series.push(lineSeries)

  const legend = new Legend({
    legendPosition: LegendPosition.TopCenter,
  })

  model.legends.push(legend)

  return model
}

/**
 * Creates an example where Moore's law is fitted and
 * extrapolated to the future.
 * @returns A PlotModel.
 */
function mooresLaw(): PlotModel {
  const model: PlotModel = new PlotModel({ title: "Moore's Law" })

  const scatterSeries = new ScatterSeries({
    title: 'Data',
  })

  scatterSeries.points.push(...getPointForMooresLaw())

  model.series.push(scatterSeries)

  model.axes.push(new LinearAxis({ title: 'Year', position: AxisPosition.Bottom }))
  model.axes.push(new LogarithmicAxis({ title: 'Transistors (in thousands)', position: AxisPosition.Left }))

  const { slope, intercept } = calculateLinearRegressionParameters(
    scatterSeries.points.map((p) => ({
      x: p.x,
      y: Math.log10(p.y),
    })),
  )

  const lineSeries = new ExtrapolationLineSeries({
    title: 'Fit and Extrapolation',
    color: OxyColors.Black,
    lineStyle: LineStyle.Solid,
    extrapolationColor: OxyColors.Blue,
    extrapolationLineStyle: LineStyle.Dot,
    strokeThickness: 3,
  })

  lineSeries.intervals.push(newDataRange(2015, Number.POSITIVE_INFINITY))

  const fitPoints = Array.from({ length: 55 }, (_, i) => i + 1970).map((x) =>
    newDataPoint(x, Math.pow(10, slope * x + intercept)),
  )

  lineSeries.points.push(...fitPoints)

  model.series.push(lineSeries)

  const legend = new Legend({
    legendPosition: LegendPosition.TopCenter,
  })

  model.legends.push(legend)

  return model
}

/**
 * Sets the slope and intercept of a linear regression line through the provided points.
 */
function calculateLinearRegressionParameters(points: ScatterPoint[]): {
  slope: number
  intercept: number
} {
  if (points === undefined) {
    throw new Error('points is undefined')
  }

  if (points.length < 2) {
    throw new Error('at least two points required')
  }

  const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length

  const cov = covariance(points, meanX, meanY)
  const var2_x = variance2(points.map((p) => p.x))

  const slope = cov / var2_x
  const intercept = meanY - slope * meanX

  return { slope, intercept }
}

/**
 * Returns the covariance between the points x and y values.
 */
function covariance(points: ScatterPoint[], meanX: number, meanY: number): number {
  let res = points.reduce((sum, p) => sum + p.x * p.y, 0)

  res -= points.length * meanX * meanY
  res /= points.length - 1

  return res
}

/**
 * Returns the squared variance of a quantity.
 */
function variance2(values: number[]): number {
  const mean = values.reduce((sum, x) => sum + x, 0) / values.length

  let res = values.reduce((sum, x) => sum + x * x, 0)

  res -= values.length * mean * mean
  res /= values.length - 1

  return res
}

function getPointForMooresLaw(): ScatterPoint[] {
  return [
    { x: 1971.875, y: 2.30824152676 },
    { x: 1972.30769231, y: 3.55452235561 },
    { x: 1974.32692308, y: 6.09756235221 },
    { x: 1979.56730769, y: 29.1637757405 },
    { x: 1982.30769231, y: 135.772714211 },
    { x: 1985.91346154, y: 273.841963426 },
    { x: 1986.25, y: 109.411381058 },
    { x: 1988.65384615, y: 121.881418484 },
    { x: 1989.47115385, y: 1207.90074743 },
    { x: 1990.57692308, y: 1207.90074743 },
    { x: 1992.40384615, y: 1207.90074743 },
    { x: 1992.69230769, y: 3105.90022362 },
    { x: 1992.69230769, y: 1113.97385999 },
    { x: 1993.02884615, y: 1715.43789634 },
    { x: 1993.41346154, y: 3105.90022362 },
    { x: 1993.41346154, y: 922.239565104 },
    { x: 1994.71153846, y: 1910.95297497 },
    { x: 1994.71153846, y: 2788.12666541 },
    { x: 1995.43269231, y: 9646.61619911 },
    { x: 1995.72115385, y: 3105.90022362 },
    { x: 1996.15384615, y: 5473.70326288 },
    { x: 1996.34615385, y: 6792.52507006 },
    { x: 1996.34615385, y: 3651.74127255 },
    { x: 1996.44230769, y: 4293.51021008 },
    { x: 1996.82692308, y: 9646.61619911 },
    { x: 1997.35576923, y: 5473.70326288 },
    { x: 1997.45192308, y: 3554.52235561 },
    { x: 1997.54807692, y: 8896.4911282 },
    { x: 1997.64423077, y: 7566.6953714 },
    { x: 1998.89423077, y: 15261.3780258 },
    { x: 1999.13461538, y: 9389.79801048 },
    { x: 1999.18269231, y: 6978.3058486 },
    { x: 1999.47115385, y: 9389.79801048 },
    { x: 1999.47115385, y: 21673.9216957 },
    { x: 2000.19230769, y: 22266.7201035 },
    { x: 2000.67307692, y: 28387.3596476 },
    { x: 2000.67307692, y: 37180.2666391 },
    { x: 2001.10576923, y: 29163.7757405 },
    { x: 2001.20192308, y: 42550.6550247 },
    { x: 2001.68269231, y: 25482.9674798 },
    { x: 2001.82692308, y: 37180.2666391 },
    { x: 2002.40384615, y: 55730.6040127 },
    { x: 2002.78846154, y: 38197.1754928 },
    { x: 2002.88461538, y: 220673.406908 },
    { x: 2003.41346154, y: 151247.254531 },
    { x: 2003.50961538, y: 54246.9093701 },
    { x: 2003.65384615, y: 106498.563535 },
    { x: 2004.80769231, y: 125214.968907 },
    { x: 2004.80769231, y: 106498.563535 },
    { x: 2004.80769231, y: 273841.963426 },
    { x: 2005.72115385, y: 232909.659246 },
    { x: 2005.81730769, y: 112403.866377 },
    { x: 2005.96153846, y: 305052.789027 },
    { x: 2006.05769231, y: 115478.198469 },
    { x: 2006.875, y: 378551.524926 },
    { x: 2006.875, y: 155383.983127 },
    { x: 2006.92307692, y: 245824.406892 },
    { x: 2006.97115385, y: 296931.48482 },
    { x: 2006.97115385, y: 582941.534714 },
    { x: 2007.06730769, y: 151247.254531 },
    { x: 2007.64423077, y: 582941.534714 },
    { x: 2007.74038462, y: 232909.659246 },
    { x: 2007.78846154, y: 805842.187761 },
    { x: 2007.83653846, y: 115478.198469 },
    { x: 2007.98076923, y: 509367.521678 },
    { x: 2008.22115385, y: 445079.406236 },
    { x: 2008.46153846, y: 410469.838044 },
    { x: 2009.18269231, y: 457252.669897 },
    { x: 2009.27884615, y: 784388.558145 },
    { x: 2009.66346154, y: 2308241.52676 },
    { x: 2009.71153846, y: 1910952.97497 },
    { x: 2010.19230769, y: 410469.838044 },
    { x: 2010.38461538, y: 1309747.2643 },
    { x: 2011.16, y: 1170000 },
    { x: 2011.32, y: 2600000 },
    { x: 2011.9, y: 1200000 },
    { x: 2012.4, y: 2400000 },
    { x: 2012.41, y: 2300000 },
    { x: 2012.7, y: 2100000 },
    { x: 2012.9, y: 1200000 },
    { x: 2013.4, y: 5000000 },
    { x: 2013.8, y: 4300000 },
    { x: 2014.16, y: 4300000 },
    { x: 2014.5, y: 4200000 },
    { x: 2014.8, y: 2600000 },
    { x: 2014.81, y: 3800000 },
    { x: 2014.82, y: 5700000 },
  ]
}

const category = 'ExtrapolationLineSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Line Fit (Ignore Extrapolation For Scaling)',
      example: {
        model: extrapolatedLineSeries,
      },
    },
    {
      title: 'Interpolation',
      example: {
        model: interpolationStyleLineSeries,
      },
    },
    {
      title: 'Interpolation (Y Axis reversed)',
      example: {
        model: twoColorLineSeriesReversed,
      },
    },
    {
      title: 'Intersecting Intervals',
      example: {
        model: intersectingIntervals,
      },
    },
    {
      title: 'Custom Dashes',
      example: {
        model: customDashes,
      },
    },
    {
      title: 'Many Intervals',
      example: {
        model: manyIntervals,
      },
    },
    {
      title: "Moore's Law",
      example: {
        model: mooresLaw,
      },
    },
  ],
} as ExampleCategory
