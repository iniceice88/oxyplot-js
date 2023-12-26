// =======================
import { AxisPosition, DateTimeAxis, LinearAxis, OxyColors, PlotModel, VolumeSeries, VolumeStyle } from 'oxyplot-js'
import type { ExampleCategory } from '../../types'
import { OhlcvItemGenerator } from './OhlcvItemGenerator'

/**
 * Creates an example showing just volume (combined) with a fixed axis.
 * @returns A PlotModel.
 */
function justVolumeCombinedFixed(): PlotModel {
  return _createVolumeSeries('Just Volume (combined)', VolumeStyle.Combined, false)
}

/**
 * Creates an example showing just volume (combined) with a natural axis.
 * @returns A PlotModel.
 */
function justVolumeCombinedNatural(): PlotModel {
  return _createVolumeSeries('Just Volume (combined)', VolumeStyle.Combined, true)
}

/**
 * Creates an example showing just volume (stacked) with a fixed axis.
 * @returns A PlotModel.
 */
function justVolumeStackedFixed(): PlotModel {
  return _createVolumeSeries('Just Volume (stacked)', VolumeStyle.Stacked, false)
}

/**
 * Creates an example showing just volume (stacked) with a natural axis.
 * @returns A PlotModel.
 */
function justVolumeStackedNatural(): PlotModel {
  return _createVolumeSeries('Just Volume (stacked)', VolumeStyle.Stacked, true)
}

/**
 * Creates an example showing just volume (+/-) with a fixed axis.
 * @returns A PlotModel.
 */
function justVolumePositiveNegativeFixed(): PlotModel {
  return _createVolumeSeries('Just Volume (+/-)', VolumeStyle.PositiveNegative, false)
}

/**
 * Creates an example showing just volume (+/-) with a natural axis.
 * @returns A PlotModel.
 */
function justVolumePositiveNegativeNatural(): PlotModel {
  return _createVolumeSeries('Just Volume (+/-)', VolumeStyle.PositiveNegative, true)
}

/**
 * Creates the volume series.
 * @param title Title.
 * @param style Style.
 * @param n N.
 * @param natural If set to true natural.
 * @returns The volume series.
 */
function _createVolumeSeries(title: string, style: VolumeStyle, natural = false, n = 10000): PlotModel {
  n = 201
  const pm = new PlotModel({ title: title })

  const series = new VolumeSeries({
    positiveColor: OxyColors.DarkGreen,
    negativeColor: OxyColors.Red,
    positiveHollow: false,
    negativeHollow: false,
    volumeStyle: style,
    title: 'VolumeSeries',
  })

  // create bars
  for (const bar of OhlcvItemGenerator.mrProcess(n)) {
    series.append(bar)
  }

  // create visible window
  const iStart = n - 200
  const iEnd = n - 120
  const xMin = series.items[iStart].x
  const xMax = series.items[iEnd].x

  // setup axes
  const timeAxis = new DateTimeAxis({
    position: AxisPosition.Bottom,
    minimum: xMin,
    maximum: xMax,
  })

  const volAxis = new LinearAxis({
    position: AxisPosition.Left,
    startPosition: 0.0,
    endPosition: 1.0,
    minimum: natural ? NaN : 0,
    maximum: natural ? NaN : 10000,
  })

  switch (style) {
    case VolumeStyle.Combined:
    case VolumeStyle.Stacked:
      pm.axes.push(timeAxis)
      pm.axes.push(volAxis)
      break

    case VolumeStyle.PositiveNegative:
      volAxis.minimum = natural ? NaN : -10000
      pm.axes.push(timeAxis)
      pm.axes.push(volAxis)
      break
  }

  pm.series.push(series)
  return pm
}

const category = 'VolumeSeries'

export default {
  category,
  tags: ['Series'],
  examples: [
    {
      title: 'Just Volume (combined), fixed axis',
      example: {
        model: justVolumeCombinedFixed,
      },
    },
    {
      title: 'Just Volume (combined), natural axis',
      example: {
        model: justVolumeCombinedNatural,
      },
    },
    {
      title: 'Just Volume (stacked), fixed axis',
      example: {
        model: justVolumeStackedFixed,
      },
    },
    {
      title: 'Just Volume (stacked), natural axis',
      example: {
        model: justVolumeStackedNatural,
      },
    },
    {
      title: 'Just Volume (+/-), fixed axis',
      example: {
        model: justVolumePositiveNegativeFixed,
      },
    },
    {
      title: 'Just Volume (+/-), natural axis',
      example: {
        model: justVolumePositiveNegativeNatural,
      },
    },
  ],
} as ExampleCategory
