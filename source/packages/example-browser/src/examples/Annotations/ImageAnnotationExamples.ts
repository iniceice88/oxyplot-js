import {
  AnnotationLayer,
  AxisPosition,
  FunctionSeries,
  getImageService,
  HorizontalAlignment,
  ImageAnnotation,
  ImageFormat,
  LinearAxis,
  newOxyThickness,
  newPlotLength,
  OxyColor,
  OxyColorHelper,
  OxyColors,
  OxyImageEx,
  PlotLengthUnit,
  PlotModel,
  TwoDimensionalArray,
  VerticalAlignment,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

async function imageAnnotation(): Promise<PlotModel> {
  const imgPath = (window as any).oxyPlotImg
  if (!imgPath) throw new Error('window.oxyPlotImg not set')

  const model = new PlotModel({
    title: 'ImageAnnotation',
    plotMargins: newOxyThickness(60, 4, 4, 60),
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  const imageService = getImageService()

  const image = await imageService.load(imgPath)
  model.annotations.push(
    new ImageAnnotation({
      imageSource: image,
      opacity: 0.2,
      interpolate: false,
      x: newPlotLength(0.5, PlotLengthUnit.RelativeToPlotArea),
      y: newPlotLength(0.5, PlotLengthUnit.RelativeToPlotArea),
      width: newPlotLength(1, PlotLengthUnit.RelativeToPlotArea),
      horizontalAlignment: HorizontalAlignment.Center,
      verticalAlignment: VerticalAlignment.Middle,
    }),
  )

  model.annotations.push(
    new ImageAnnotation({
      imageSource: image,
      x: newPlotLength(1, PlotLengthUnit.RelativeToPlotArea),
      y: newPlotLength(0, PlotLengthUnit.RelativeToPlotArea),
      width: newPlotLength(120, PlotLengthUnit.ScreenUnits),
      horizontalAlignment: HorizontalAlignment.Right,
      verticalAlignment: VerticalAlignment.Top,
    }),
  )

  model.annotations.push(
    new ImageAnnotation({
      imageSource: image,
      x: newPlotLength(0, PlotLengthUnit.RelativeToPlotArea),
      y: newPlotLength(0, PlotLengthUnit.RelativeToPlotArea),
      offsetY: newPlotLength(-5, PlotLengthUnit.ScreenUnits),
      height: newPlotLength(20, PlotLengthUnit.ScreenUnits),
      horizontalAlignment: HorizontalAlignment.Left,
      verticalAlignment: VerticalAlignment.Bottom,
    }),
  )

  model.annotations.push(
    new ImageAnnotation({
      imageSource: image,
      x: newPlotLength(50, PlotLengthUnit.Data),
      y: newPlotLength(50, PlotLengthUnit.Data),
      width: newPlotLength(200, PlotLengthUnit.ScreenUnits),
      horizontalAlignment: HorizontalAlignment.Left,
      verticalAlignment: VerticalAlignment.Top,
    }),
  )

  model.annotations.push(
    new ImageAnnotation({
      imageSource: image,
      x: newPlotLength(50, PlotLengthUnit.Data),
      y: newPlotLength(20, PlotLengthUnit.Data),
      width: newPlotLength(50, PlotLengthUnit.Data),
      horizontalAlignment: HorizontalAlignment.Center,
      verticalAlignment: VerticalAlignment.Top,
    }),
  )

  model.annotations.push(
    new ImageAnnotation({
      imageSource: image,
      x: newPlotLength(0.5, PlotLengthUnit.RelativeToViewport),
      y: newPlotLength(1, PlotLengthUnit.RelativeToViewport),
      offsetY: newPlotLength(-35, PlotLengthUnit.ScreenUnits),
      height: newPlotLength(30, PlotLengthUnit.ScreenUnits),
      horizontalAlignment: HorizontalAlignment.Center,
      verticalAlignment: VerticalAlignment.Top,
    }),
  )

  for (let y = 0; y < 10; y++) {
    model.annotations.push(
      new ImageAnnotation({
        imageSource: image,
        opacity: (y + 1) / 10.0,
        x: newPlotLength(10, PlotLengthUnit.Data),
        y: newPlotLength(y * 2, PlotLengthUnit.Data),
        width: newPlotLength(100, PlotLengthUnit.ScreenUnits),
        horizontalAlignment: HorizontalAlignment.Center,
        verticalAlignment: VerticalAlignment.Bottom,
      }),
    )
  }

  return model
}

/**
 * Using ImageAnnotations to draw a gradient backgrounds
 * But do you really want this? This is called 'chartjunk'!
 */
async function imageAnnotationAsBackgroundGradient(): Promise<PlotModel> {
  const model = new PlotModel({
    title: 'Using ImageAnnotations to draw a gradient backgrounds',
    subtitle: "But do you really want this? This is called 'chartjunk'!",
    plotMargins: newOxyThickness(60, 4, 4, 60),
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  // create a gradient image of height n
  const n = 256
  //const imageData1: OxyColor[][] = create2DArray<number>(n, 1)
  const imageData1 = new TwoDimensionalArray<OxyColor>(1, n)
  for (let i = 0; i < n; i++) {
    //imageData1[i][0] = OxyColor.interpolate(OxyColors.Blue, OxyColors.Red, i / (n - 1.0))
    imageData1.set(0, i, OxyColorHelper.interpolate(OxyColors.Blue, OxyColors.Red, i / (n - 1.0)).hex)
  }
  const image1 = await OxyImageEx.create(imageData1, ImageFormat.Png) // png is required for silverlight

  // or create a gradient image of height 2 (requires bitmap interpolation to be supported)
  // top color, bottom color
  const imageData2 = TwoDimensionalArray.fromArray([[OxyColors.Yellow], [OxyColors.Gray]])
  const image2 = await OxyImageEx.create(imageData2, ImageFormat.Png) // png is required for silverlight

  // gradient filling the viewport
  model.annotations.push(
    new ImageAnnotation({
      imageSource: image2,
      interpolate: true,
      layer: AnnotationLayer.BelowAxes,
      x: newPlotLength(0, PlotLengthUnit.RelativeToViewport),
      y: newPlotLength(0, PlotLengthUnit.RelativeToViewport),
      width: newPlotLength(1, PlotLengthUnit.RelativeToViewport),
      height: newPlotLength(1, PlotLengthUnit.RelativeToViewport),
      horizontalAlignment: HorizontalAlignment.Left,
      verticalAlignment: VerticalAlignment.Top,
    }),
  )

  // gradient filling the plot area
  model.annotations.push(
    new ImageAnnotation({
      imageSource: image1,
      interpolate: true,
      layer: AnnotationLayer.BelowAxes,
      x: newPlotLength(0, PlotLengthUnit.RelativeToPlotArea),
      y: newPlotLength(0, PlotLengthUnit.RelativeToPlotArea),
      width: newPlotLength(1, PlotLengthUnit.RelativeToPlotArea),
      height: newPlotLength(1, PlotLengthUnit.RelativeToPlotArea),
      horizontalAlignment: HorizontalAlignment.Left,
      verticalAlignment: VerticalAlignment.Top,
    }),
  )

  // verify that a series is rendered above the gradients
  model.series.push(
    new FunctionSeries({
      f: Math.sin,
      x0: 0,
      x1: 7,
      dx: 0.01,
    }),
  )

  return model
}

const fourColorPixels = TwoDimensionalArray.fromArray([
  [OxyColors.Blue, OxyColors.Yellow],
  [OxyColors.Green, OxyColors.Red],
])

async function imageAnnotation_NormalAxes(): Promise<PlotModel> {
  const model = new PlotModel({ title: 'ImageAnnotation - normal axes' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  // create an image
  const pixels = fourColorPixels
  const image = await OxyImageEx.create(pixels, ImageFormat.Png)

  model.annotations.push(
    new ImageAnnotation({
      imageSource: image,
      interpolate: false,
      x: newPlotLength(0, PlotLengthUnit.Data),
      y: newPlotLength(0, PlotLengthUnit.Data),
      width: newPlotLength(80, PlotLengthUnit.Data),
      height: newPlotLength(50, PlotLengthUnit.Data),
      horizontalAlignment: HorizontalAlignment.Left,
      verticalAlignment: VerticalAlignment.Bottom,
    }),
  )

  return model
}

/**
 * ImageAnnotation - reverse horizontal axis
 */
async function imageAnnotation_ReverseHorizontalAxis(): Promise<PlotModel> {
  const model = new PlotModel({ title: 'ImageAnnotation - reverse horizontal axis' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, startPosition: 1, endPosition: 0 }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))

  // create an image
  const pixels = fourColorPixels
  const image = await OxyImageEx.create(pixels, ImageFormat.Png)

  model.annotations.push(
    new ImageAnnotation({
      imageSource: image,
      interpolate: false,
      x: newPlotLength(100, PlotLengthUnit.Data),
      y: newPlotLength(0, PlotLengthUnit.Data),
      width: newPlotLength(80, PlotLengthUnit.Data),
      height: newPlotLength(50, PlotLengthUnit.Data),
      horizontalAlignment: HorizontalAlignment.Left,
      verticalAlignment: VerticalAlignment.Bottom,
    }),
  )

  return model
}

/**
 * ImageAnnotation - reverse vertical axis
 */
async function imageAnnotation_ReverseVerticalAxis(): Promise<PlotModel> {
  const model = new PlotModel({ title: 'ImageAnnotation - reverse vertical axis' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, startPosition: 1, endPosition: 0 }))

  // create an image
  const pixels = fourColorPixels
  const image = await OxyImageEx.create(pixels, ImageFormat.Png)

  model.annotations.push(
    new ImageAnnotation({
      imageSource: image,
      interpolate: false,
      x: newPlotLength(0, PlotLengthUnit.Data),
      y: newPlotLength(100, PlotLengthUnit.Data),
      width: newPlotLength(80, PlotLengthUnit.Data),
      height: newPlotLength(50, PlotLengthUnit.Data),
      horizontalAlignment: HorizontalAlignment.Left,
      verticalAlignment: VerticalAlignment.Bottom,
    }),
  )

  return model
}

const category = 'ImageAnnotation'

export default {
  category,
  tags: ['Annotations'],
  examples: [
    {
      title: 'ImageAnnotation',
      example: {
        model: imageAnnotation,
      },
    },
    {
      title: 'ImageAnnotation - gradient backgrounds',
      example: {
        model: imageAnnotationAsBackgroundGradient,
      },
    },
    {
      title: 'ImageAnnotation - normal axes',
      example: {
        model: imageAnnotation_NormalAxes,
      },
    },
    {
      title: 'ImageAnnotation - reverse horizontal axis',
      example: {
        model: imageAnnotation_ReverseHorizontalAxis,
      },
    },
    {
      title: 'ImageAnnotation - reverse vertical axis',
      example: {
        model: imageAnnotation_ReverseVerticalAxis,
      },
    },
  ],
} as ExampleCategory
