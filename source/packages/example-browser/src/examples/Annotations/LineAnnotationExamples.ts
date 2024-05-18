import {
  AnnotationTextOrientation,
  AxisPosition,
  HorizontalAlignment,
  LineAnnotation,
  LineAnnotationType,
  LinearAxis,
  LogarithmicAxis,
  newOxyThickness, OxyColorHelper,
  OxyColors,
  PlotModel,
  VerticalAlignment,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

/**
 * LineAnnotation on linear axes
 */
function lineAnnotationOnLinearAxes(): PlotModel {
  const model = new PlotModel()
  model.title = 'LineAnnotation on linear axes'
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -20, maximum: 80 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -10, maximum: 10 }))
  const opacityWhite = OxyColorHelper.changeOpacity(OxyColors.White, 0.75).hex
  model.annotations.push(
    new LineAnnotation({
      slope: 0.1,
      intercept: 1,
      text: 'First',
      borderBackground: opacityWhite,
      borderPadding: newOxyThickness(5),
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      slope: 0.3,
      intercept: 2,
      maximumX: 40,
      color: OxyColors.Red,
      text: 'Second',
      borderBackground: opacityWhite,
      borderPadding: newOxyThickness(5),
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      type: LineAnnotationType.Vertical,
      x: 4,
      maximumY: 10,
      color: OxyColors.Green,
      text: 'Vertical',
      borderBackground: opacityWhite,
      borderPadding: newOxyThickness(5),
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      type: LineAnnotationType.Horizontal,
      y: 2,
      maximumX: 4,
      color: OxyColors.Gold,
      text: 'Horizontal',
      borderBackground: opacityWhite,
      borderPadding: newOxyThickness(5),
    }),
  )
  return model
}

/**
 * LineAnnotation on logarithmic axes
 */
function lineAnnotationOnLogarithmicAxes(): PlotModel {
  const model = new PlotModel()
  model.title = 'LineAnnotation on logarithmic axes'
  model.axes.push(new LogarithmicAxis({ position: AxisPosition.Bottom, minimum: 1, maximum: 80 }))
  model.axes.push(new LogarithmicAxis({ position: AxisPosition.Left, minimum: 1, maximum: 10 }))
  model.annotations.push(new LineAnnotation({ slope: 0.1, intercept: 1, text: 'First', textMargin: 40 }))
  model.annotations.push(
    new LineAnnotation({
      slope: 0.3,
      intercept: 2,
      maximumX: 40,
      color: OxyColors.Red,
      text: 'Second',
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      type: LineAnnotationType.Vertical,
      x: 4,
      maximumY: 10,
      color: OxyColors.Green,
      text: 'Vertical',
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      type: LineAnnotationType.Horizontal,
      y: 2,
      maximumX: 4,
      color: OxyColors.Gold,
      text: 'Horizontal',
    }),
  )
  return model
}

/**
 * LineAnnotation with text orientation specified
 */
function lineAnnotationOnLinearAxesWithTextOrientation(): PlotModel {
  const model = new PlotModel()
  model.title = 'LineAnnotations'
  model.subtitle = 'with TextOrientation specified'
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, minimum: -20, maximum: 80 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, minimum: -10, maximum: 10 }))
  model.annotations.push(
    new LineAnnotation({
      slope: 0.1,
      intercept: 1,
      text: 'Horizontal',
      textOrientation: AnnotationTextOrientation.Horizontal,
      textVerticalAlignment: VerticalAlignment.Bottom,
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      slope: 0.3,
      intercept: 2,
      maximumX: 40,
      color: OxyColors.Red,
      text: 'Vertical',
      textOrientation: AnnotationTextOrientation.Vertical,
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      type: LineAnnotationType.Vertical,
      x: 4,
      maximumY: 10,
      color: OxyColors.Green,
      text: 'Horizontal (x=4)',
      textPadding: 8,
      textOrientation: AnnotationTextOrientation.Horizontal,
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      type: LineAnnotationType.Vertical,
      x: 45,
      maximumY: 10,
      color: OxyColors.Green,
      text: 'Horizontal (x=45)',
      textHorizontalAlignment: HorizontalAlignment.Left,
      textPadding: 8,
      textOrientation: AnnotationTextOrientation.Horizontal,
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      type: LineAnnotationType.Horizontal,
      y: 2,
      maximumX: 4,
      color: OxyColors.Gold,
      text: 'Horizontal',
      textLinePosition: 0.5,
      textOrientation: AnnotationTextOrientation.Horizontal,
    }),
  )
  return model
}

/**
 * LineAnnotation - ClipByAxis property
 */
function linearAxesMultipleAxes(): PlotModel {
  const model = new PlotModel()
  model.title = 'ClipByAxis property'
  model.subtitle =
    'This property specifies if the annotation should be clipped by the current axes or by the full plot area.'
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: -20,
      maximum: 80,
      startPosition: 0,
      endPosition: 0.45,
      textColor: OxyColors.Red,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: -10,
      maximum: 10,
      startPosition: 0,
      endPosition: 0.45,
      textColor: OxyColors.Green,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: -20,
      maximum: 80,
      startPosition: 0.55,
      endPosition: 1,
      textColor: OxyColors.Blue,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: -10,
      maximum: 10,
      startPosition: 0.55,
      endPosition: 1,
      textColor: OxyColors.Orange,
    }),
  )

  model.annotations.push(
    new LineAnnotation({
      clipByYAxis: true,
      type: LineAnnotationType.Vertical,
      x: 0,
      color: OxyColors.Green,
      text: 'Vertical, ClipByAxis = true',
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      clipByYAxis: false,
      type: LineAnnotationType.Vertical,
      x: 20,
      color: OxyColors.Green,
      text: 'Vertical, ClipByAxis = false',
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      clipByXAxis: true,
      type: LineAnnotationType.Horizontal,
      y: 2,
      color: OxyColors.Gold,
      text: 'Horizontal, ClipByAxis = true',
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      clipByXAxis: false,
      type: LineAnnotationType.Horizontal,
      y: 8,
      color: OxyColors.Gold,
      text: 'Horizontal, ClipByAxis = false',
    }),
  )
  return model
}

/**
 * LineAnnotation on reversed axes
 */
function reversedAxes(): PlotModel {
  const model = new PlotModel()
  model.title = 'LineAnnotation on reversed axes'
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      minimum: -20,
      maximum: 80,
      startPosition: 1,
      endPosition: 0,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      minimum: -10,
      maximum: 10,
      startPosition: 1,
      endPosition: 0,
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      slope: 0.1,
      intercept: 1,
      text: 'First',
      textHorizontalAlignment: HorizontalAlignment.Left,
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      slope: 0.3,
      intercept: 2,
      maximumX: 40,
      color: OxyColors.Red,
      text: 'Second',
      textHorizontalAlignment: HorizontalAlignment.Left,
      textVerticalAlignment: VerticalAlignment.Bottom,
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      type: LineAnnotationType.Vertical,
      x: 4,
      maximumY: 10,
      color: OxyColors.Green,
      text: 'Vertical',
      textHorizontalAlignment: HorizontalAlignment.Right,
    }),
  )
  model.annotations.push(
    new LineAnnotation({
      type: LineAnnotationType.Horizontal,
      y: 2,
      maximumX: 4,
      color: OxyColors.Gold,
      text: 'Horizontal',
      textHorizontalAlignment: HorizontalAlignment.Left,
    }),
  )
  return model
}

const category = 'LineAnnotation'

export default {
  category: category,
  tags: ['Annotations'],
  examples: [
    {
      title: 'LineAnnotation on linear axes',
      example: {
        model: lineAnnotationOnLinearAxes,
      },
    },
    {
      title: 'LineAnnotation on logarithmic axes',
      example: {
        model: lineAnnotationOnLogarithmicAxes,
      },
    },
    {
      title: 'LineAnnotation with text orientation specified',
      example: {
        model: lineAnnotationOnLinearAxesWithTextOrientation,
      },
    },
    {
      title: 'LineAnnotation - ClipByAxis property',
      example: {
        model: linearAxesMultipleAxes,
      },
    },
    {
      title: 'LineAnnotation on reversed axes',
      example: {
        model: reversedAxes,
      },
    },
  ],
} as ExampleCategory
