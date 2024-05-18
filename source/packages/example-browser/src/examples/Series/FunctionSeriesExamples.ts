import {
  AngleAxis,
  AxisPosition,
  FunctionSeries,
  Legend,
  LegendPlacement,
  LineAnnotation,
  LineAnnotationType,
  LinearAxis,
  LineStyle,
  MagnitudeAxis,
  MarkerType, newOxyThickness,
  OxyColors,
  PlotModel,
  PlotType,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function squareWave(): PlotModel {
  return _createSquareWave(25)
}

/**
 * Create a plot for the Clover function.
 * @returns A PlotModel representing the Clover function.
 */
function clover(): PlotModel {
  return _createParametricPlot(
    (t) => 2 * Math.cos(2 * t) * Math.cos(t),
    (t) => 2 * Math.cos(2 * t) * Math.sin(t),
    0,
    Math.PI * 2,
    1000,
    'Parametric function',
    'Using the CartesianAxes property',
    '2cos(2t)cos(t) , 2cos(2t)sin(t)',
  )
}

/**
 * Parametric function 2
 */
function parametricFunction2(): PlotModel {
  return _createParametricPlot(
    (t) => 3 * Math.sin(5 * t),
    (t) => 3 * Math.cos(3 * t),
    0,
    Math.PI * 2,
    1000,
    'Parametric function',
    undefined,
    '3sin(5t) , 3cos(3t)',
  )
}

/**
 * Parametric function 3
 */
function parametricFunction3(): PlotModel {
  return _createParametricPlot(
    (t) => 2 * Math.cos(t) + Math.cos(8 * t),
    (t) => 2 * Math.sin(t) + Math.sin(8 * t),
    0,
    Math.PI * 2,
    1000,
    'Parametric function',
    undefined,
    '2cos(t)+cos(8t) , 2sin(t)+sin(8t)',
  )
}

/**
 * Lemniscate of Bernoulli
 */
function lemniscateOfBernoulli(): PlotModel {
  // http://en.wikipedia.org/wiki/Lemniscate_of_Bernoulli
  const a = 1
  return _createParametricPlot(
    (t) => (a * Math.sqrt(2) * Math.cos(t)) / (Math.sin(t) * Math.sin(t) + 1),
    (t) => (a * Math.sqrt(2) * Math.cos(t) * Math.sin(t)) / (Math.sin(t) * Math.sin(t) + 1),
    0,
    Math.PI * 2,
    1000,
    'Lemniscate of Bernoulli',
  )
}

/**
 * Lemniscate of Gerono
 */
function lemniscateOfGerono(): PlotModel {
  // http://en.wikipedia.org/wiki/Lemniscate_of_Gerono
  return _createParametricPlot(
    (t) => Math.cos(t),
    (t) => Math.sin(2 * t) / 2,
    0,
    Math.PI * 2,
    1000,
    'Lemniscate of Gerono',
  )
}

/**
 * Lissajous figure
 */
function lissajousFigure(): PlotModel {
  const a = 3
  const b = 2
  const delta = Math.PI / 2
  // http://en.wikipedia.org/wiki/Lissajous_figure
  return _createParametricPlot(
    (t) => Math.sin(a * t + delta),
    (t) => Math.sin(b * t),
    0,
    Math.PI * 2,
    1000,
    'Lissajous figure',
    undefined,
    'a=3, b=2, δ = π/2',
  )
}

/** Rose curve */
function roseCurve(): PlotModel {
  // http://en.wikipedia.org/wiki/Rose_curve

  const m = new PlotModel({
    title: 'Rose curve',
    plotType: PlotType.Polar,
    plotAreaBorderThickness: newOxyThickness(0),
  })

  m.axes.push(
    new AngleAxis({
      minimum: 0,
      maximum: Math.PI * 2,
      majorStep: Math.PI / 4,
      minorStep: Math.PI / 16,
      majorGridlineStyle: LineStyle.Solid,
      formatAsFractions: true,
      fractionUnit: Math.PI,
      fractionUnitSymbol: 'π',
    }),
  )
  m.axes.push(new MagnitudeAxis({ majorGridlineStyle: LineStyle.Solid }))

  const d = 4
  const n = 3
  const k = n / d
  m.series.push(
    new FunctionSeries({
      fx: (t) => Math.sin(k * t),
      fy: (t) => t,
      t0: 0,
      t1: Math.PI * 2 * d,
      n: 1000,
      title: `d=${d}, n=${n}`,
    }),
  )

  return m
}

/** Limaçon of Pascal */
function limaconOfPascal(): PlotModel {
  // http://en.wikipedia.org/wiki/Lima%C3%A7on

  const m = new PlotModel({ title: 'Limaçon of Pascal', plotType: PlotType.Cartesian })
  for (let a = 4; a <= 4; a++)
    for (let b = 0; b <= 10; b++) {
      m.series.push(
        new FunctionSeries({
          fx: (t) => a / 2 + b * Math.cos(t) + (a / 2) * Math.cos(2 * t),
          fy: (t) => b * Math.sin(t) + (a / 2) * Math.sin(2 * t),
          t0: 0,
          t1: Math.PI * 2,
          n: 1000,
          title: `a=${a}, b=${b}`,
        }),
      )
    }
  return m
}

/**
 * Create a plot for the Folium of Descartes.
 * @returns A PlotModel representing the Folium of Descartes.
 */
function descartesFolium(): PlotModel {
  const m = new PlotModel({ title: 'Folium of Descartes', plotType: PlotType.Cartesian })
  m.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -3, maximum: 3 }))
  m.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -3, maximum: 3 }))
  const a = 1
  m.series.push(
    new FunctionSeries({
      fx: (t) => (3 * a * t) / (Math.pow(t, 3) + 1),
      fy: (t) => (3 * a * Math.pow(t, 2)) / (Math.pow(t, 3) + 1),
      t0: -30,
      t1: 30,
      n: 1001,
      title: `a=${a}`,
    }),
  )
  return m
}

/** Trisectrix of Maclaurin */
function trisectrixOfMaclaurin(): PlotModel {
  // http://en.wikipedia.org/wiki/Trisectrix_of_Maclaurin
  // http://mathworld.wolfram.com/MaclaurinTrisectrix.html

  const m = new PlotModel({ title: 'Trisectrix of Maclaurin', plotType: PlotType.Cartesian })
  const a = 1
  m.series.push(
    new FunctionSeries({
      fx: (t) => (a * (t * t - 3)) / (t * t + 1),
      fy: (t) => (a * t * (t * t - 3)) / (t * t + 1),
      t0: -5,
      t1: 5,
      n: 1000,
    }),
  )
  return m
}

/** Fermat's spiral */
function fermatsSpiral(): PlotModel {
  // http://en.wikipedia.org/wiki/Fermat's_spiral
  // http://www.wolframalpha.com/input/?i=Fermat%27s+spiral
  const m = new PlotModel({ title: "Fermat's spiral", plotType: PlotType.Cartesian })
  const a = 1
  m.series.push(
    new FunctionSeries({
      fx: (t) => a * Math.sqrt(t) * Math.cos(t),
      fy: (t) => a * Math.sqrt(t) * Math.sin(t),
      t0: 0,
      t1: 20,
      n: 1000,
    }),
  )
  m.series.push(
    new FunctionSeries({
      fx: (t) => -a * Math.sqrt(t) * Math.cos(t),
      fy: (t) => -a * Math.sqrt(t) * Math.sin(t),
      t0: 0,
      t1: 20,
      n: 1000,
    }),
  )
  return m
}

/** Fish curve */
function fishCurve(): PlotModel {
  // http://www.wolframalpha.com/input/?i=fish+curve
  const m = new PlotModel({ title: 'Fish curve', plotType: PlotType.Cartesian })
  for (let a = 0.1; a < 1; a += 0.1) {
    m.series.push(
      new FunctionSeries({
        fx: (t) => a * (Math.cos(t) - (Math.sin(t) * Math.sin(t)) / Math.sqrt(2)),
        fy: (t) => a * Math.cos(t) * Math.sin(t),
        t0: 0,
        t1: 2 * Math.PI,
        n: 1000,
      }),
    )
  }

  return m
}

/** Heaviside step function */
function heavisideStepFunction(): PlotModel {
  // http://en.wikipedia.org/wiki/Heaviside_step_function

  const m = new PlotModel({ title: 'Heaviside step function', plotType: PlotType.Cartesian })
  m.series.push(
    new FunctionSeries({
      f: (x) => {
        // make a gap in the curve at x=0
        if (Math.abs(x) < 1e-8) return NaN
        return x < 0 ? 0 : 1
      },
      x0: -2,
      x1: 2,
      dx: 0.001,
    }),
  )
  m.annotations.push(
    new LineAnnotation({
      type: LineAnnotationType.Vertical,
      color: m.defaultColors[0],
      x: 0,
      minimumY: 0,
      maximumY: 1,
    }),
  )
  return m
}

/** FunctionSeries */
function functionSeries(): PlotModel {
  const pm = new PlotModel({
    title: 'Trigonometric functions',
    subtitle: 'Example using the FunctionSeries',
    plotType: PlotType.Cartesian,
    plotAreaBackground: OxyColors.White,
  })
  pm.series.push(
    new FunctionSeries({
      f: Math.sin,
      x0: -10,
      x1: 10,
      dx: 0.1,
      title: 'sin(x)',
    }),
  )
  pm.series.push(
    new FunctionSeries({
      f: Math.cos,
      x0: -10,
      x1: 10,
      dx: 0.1,
      title: 'cos(x)',
    }),
  )
  pm.series.push(
    new FunctionSeries({
      fx: (t) => 5 * Math.cos(t),
      fy: (t) => 5 * Math.sin(t),
      t0: 0,
      t1: 2 * Math.PI,
      n: 1000,
      title: 'cos(t),sin(t)',
    }),
  )
  return pm
}

/**
 * Create a plot for the Squirqle function.
 * @returns A PlotModel representing the Squirqle function.
 */
function squirqle(): PlotModel {
  const plot = new PlotModel({ title: 'Squirqle', plotType: PlotType.Cartesian })
  plot.series.push(_createSuperellipseSeries(4, 1, 1))
  return plot
}

/**
 * Create a plot for the Superellipse function with n=20.
 * @returns A PlotModel representing the Superellipse function.
 */
function superellipse20(): PlotModel {
  const plot = new PlotModel({ title: 'Superellipse', plotType: PlotType.Cartesian })
  const s = _createSuperellipseSeries(20, 1, 1)
  s.markerType = MarkerType.Circle
  plot.series.push(s)
  return plot
}

/**
 * Create a plot for the Lamé curves.
 * @returns A PlotModel representing the Lamé curves.
 */
function lameCurves(): PlotModel {
  const plot = new PlotModel({ title: 'Lamé curves', plotType: PlotType.Cartesian })
  const l = new Legend({ legendPlacement: LegendPlacement.Outside })
  plot.legends.push(l)
  for (let n = 0.25; n < 2; n += 0.25) {
    plot.series.push(_createSuperellipseSeries(n, 1, 1))
  }
  for (let n = 2; n <= 8 + 1e-6; n += 1) {
    plot.series.push(_createSuperellipseSeries(n, 1, 1))
  }
  return plot
}

// ==============
function _createSquareWave(n = 25): PlotModel {
  const plot = new PlotModel({ title: 'Square wave (Gibbs phenomenon)' })

  const f = (x: number): number => {
    let y = 0
    for (let i = 0; i < n; i++) {
      const j = i * 2 + 1
      y += Math.sin(j * x) / j
    }
    return y
  }

  const fs = new FunctionSeries({
    f,
    x0: -10,
    x1: 10,
    dx: 0.0001,
    title: `sin(x)+sin(3x)/3+sin(5x)/5+...+sin(${2 * n - 1})/${2 * n - 1}`,
  })

  plot.series.push(fs)
  plot.subtitle = `n = ${fs.points.length}`

  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: -4,
      maximum: 4,
    }),
  )
  plot.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
    }),
  )

  return plot
}

/**
 * Create a superellipse series.
 * @param n - The exponent in the equation of the superellipse.
 * @param a - The semi-diameter of the superellipse along the x-axis.
 * @param b - The semi-diameter of the superellipse along the y-axis.
 * @returns A FunctionSeries representing the superellipse.
 */
function _createSuperellipseSeries(n: number, a: number, b: number): FunctionSeries {
  // http://en.wikipedia.org/wiki/Superellipse
  return new FunctionSeries({
    fx: (t) => a * Math.sign(Math.cos(t)) * Math.pow(Math.abs(Math.cos(t)), 2 / n),
    fy: (t) => b * Math.sign(Math.sin(t)) * Math.pow(Math.abs(Math.sin(t)), 2 / n),
    t0: 0,
    t1: Math.PI * 2,
    n: 101,
    title: `n=${n}, a=${a}, b=${b}`,
  })
}

/**
 * Create a parametric plot.
 * @param fx - The function defining the x-coordinate of the plot.
 * @param fy - The function defining the y-coordinate of the plot.
 * @param t0 - The start value of the parameter.
 * @param t1 - The end value of the parameter.
 * @param n - The number of points in the plot.
 * @param title - The title of the plot.
 * @param subtitle - The subtitle of the plot.
 * @param seriesTitle - The title of the series.
 * @returns A PlotModel representing the parametric plot.
 */
function _createParametricPlot(
  fx: (t: number) => number,
  fy: (t: number) => number,
  t0: number,
  t1: number,
  n: number,
  title: string,
  subtitle?: string,
  seriesTitle?: string,
): PlotModel {
  const plot = new PlotModel({ title: title, subtitle: subtitle, plotType: PlotType.Cartesian })
  plot.series.push(
    new FunctionSeries({
      fx,
      fy,
      t0,
      t1,
      n,
      title: seriesTitle,
    }),
  )
  return plot
}

const category = 'FunctionSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Square wave',
      example: {
        model: squareWave,
      },
    },
    {
      title: 'Parametric function 1',
      example: {
        model: clover,
      },
    },
    {
      title: 'Parametric function 2',
      example: {
        model: parametricFunction2,
      },
    },
    {
      title: 'Parametric function 3',
      example: {
        model: parametricFunction3,
      },
    },
    {
      title: 'Lemniscate of Bernoulli',
      example: {
        model: lemniscateOfBernoulli,
      },
    },
    {
      title: 'Lemniscate of Gerono',
      example: {
        model: lemniscateOfGerono,
      },
    },
    {
      title: 'Lissajous figure',
      example: {
        model: lissajousFigure,
      },
    },
    {
      title: 'Rose curve',
      example: {
        model: roseCurve,
      },
    },
    {
      title: 'Limaçon of Pascal',
      example: {
        model: limaconOfPascal,
      },
    },
    {
      title: 'Folium of Descartes',
      example: {
        model: descartesFolium,
      },
    },
    {
      title: 'Trisectrix of Maclaurin',
      example: {
        model: trisectrixOfMaclaurin,
      },
    },
    {
      title: "Fermat's spiral",
      example: {
        model: fermatsSpiral,
      },
    },
    {
      title: 'Fish curve',
      example: {
        model: fishCurve,
      },
    },
    {
      title: 'Heaviside step function',
      example: {
        model: heavisideStepFunction,
      },
    },
    {
      title: 'FunctionSeries',
      example: {
        model: functionSeries,
      },
    },
    {
      title: 'Squirqle',
      example: {
        model: squirqle,
      },
    },
    {
      title: 'Superellipse n=20',
      example: {
        model: superellipse20,
      },
    },
    {
      title: 'Lamé curves',
      example: {
        model: lameCurves,
      },
    },
  ],
} as ExampleCategory
