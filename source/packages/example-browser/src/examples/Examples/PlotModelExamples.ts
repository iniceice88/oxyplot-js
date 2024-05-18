import {
  AxisPosition,
  DelegateAnnotation,
  LinearAxis,
  LineSeries,
  LineStyle,
  newOxyRect, newOxyThickness,
  OxyColorHelper,
  OxyColors,
  PlotModel,
  TitleHorizontalAlignment,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

function title(): PlotModel {
  const model = new PlotModel({ title: 'Title' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function titleAndSubtitle(): PlotModel {
  const model = new PlotModel({ title: 'Title', subtitle: 'Subtitle' })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function titleAndSubtitleWithSubSuperscript(): PlotModel {
  const model = new PlotModel({
    title: 'Title with^{super}_{sub}script',
    subtitle: 'Subtitle with^{super}_{sub}script',
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function titlePadding0(): PlotModel {
  const model = new PlotModel({
    title: 'TitlePadding = 0',
    subtitle: 'This controls the distance between the titles and the plot area. The default value is 6',
    titlePadding: 0,
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function titlePadding100(): PlotModel {
  const model = new PlotModel({ title: 'TitlePadding = 100', titlePadding: 100 })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function titlesCenteredWithinView(): PlotModel {
  const model = new PlotModel({
    title: 'Title',
    subtitle: 'Subtitle',
    titleHorizontalAlignment: TitleHorizontalAlignment.CenteredWithinView,
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function titleClippingOff(): PlotModel {
  const model = new PlotModel({
    title:
      "This is a very long title to illustrate that title clipping is necessary, because currently it's not clipped.",
    clipTitle: false,
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function titleClipping60(): PlotModel {
  const model = new PlotModel({
    title: 'This is a very long title, that shows that title clippling is working with crrently 60% of title area',
    titleClippingLength: 0.6,
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function backgroundUndefined(): PlotModel {
  const model = new PlotModel({ title: 'Background = Undefined', background: OxyColors.Undefined })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function backgroundWhite50(): PlotModel {
  const model = new PlotModel({
    title: 'Background = 50% White',
    background: OxyColorHelper.fromAColor(128, OxyColors.White),
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function backgroundTransparent(): PlotModel {
  const model = new PlotModel({ title: 'Background = Transparent', background: OxyColors.Transparent })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function backgroundLightGray(): PlotModel {
  const model = new PlotModel({ title: 'Background = LightSkyBlue', background: OxyColors.LightSkyBlue })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function backgroundWhite(): PlotModel {
  const model = new PlotModel({ title: 'Background = White', background: OxyColors.White })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function backgroundBlack(): PlotModel {
  const model = new PlotModel({
    title: 'Background = Black',
    background: OxyColors.Black,
    textColor: OxyColors.White,
    titleColor: OxyColors.White,
    plotAreaBorderColor: OxyColors.White,
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom, ticklineColor: OxyColors.White }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left, ticklineColor: OxyColors.White }))
  return model
}

function plotAreaBorderThickness2(): PlotModel {
  const model = new PlotModel({ title: 'PlotAreaBorderThickness = 2', plotAreaBorderThickness: newOxyThickness(2) })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function plotAreaBorderThickness1001(): PlotModel {
  const model = new PlotModel({
    title: 'PlotAreaBorderThickness = (1,0,0,1)',
    plotAreaBorderThickness: newOxyThickness(1, 0, 0, 1),
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function plotAreaBorderThickness4114(): PlotModel {
  const model = new PlotModel({
    title: 'PlotAreaBorderThickness = (4,1,1,4)',
    plotAreaBorderThickness: newOxyThickness(4, 1, 1, 4),
  })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function plotAreaBorderThickness0(): PlotModel {
  const model = new PlotModel({ title: 'PlotAreaBorderThickness = 0', plotAreaBorderThickness: newOxyThickness(0) })
  model.axes.push(new LinearAxis({ position: AxisPosition.Bottom }))
  model.axes.push(new LinearAxis({ position: AxisPosition.Left }))
  return model
}

function plotAreaBorderThickness0AxisLineThickness1(): PlotModel {
  const model = new PlotModel({
    title: 'PlotAreaBorderThickness = 0',
    subtitle: 'AxislineThickness = 1, AxislineColor = OxyColors.Blue, AxislineStyle = LineStyle.Solid',
    plotAreaBorderThickness: newOxyThickness(0),
  })
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Bottom,
      axislineThickness: 1,
      axislineColor: OxyColors.Blue,
      axislineStyle: LineStyle.Solid,
    }),
  )
  model.axes.push(
    new LinearAxis({
      position: AxisPosition.Left,
      axislineThickness: 1,
      axislineColor: OxyColors.Blue,
      axislineStyle: LineStyle.Solid,
    }),
  )
  return model
}

function invalidAxisKey(): PlotModel {
  const model = new PlotModel()
  model.axes.push(new LinearAxis())
  model.series.push(new LineSeries({ xAxisKey: 'invalidKey' }))
  return model
}

function exceptionClipping(): PlotModel {
  const model = new PlotModel()
  const annotation = new DelegateAnnotation((rc) => {
    rc.pushClip(newOxyRect(50, 50, 50, 50))
    throw new Error(
      'This Exception should be completely visible and not clipped by the previously pushed clipping rectangle.',
    )
  })

  model.annotations.push(annotation)
  return model
}

function unbalancedClippingPush(): PlotModel {
  const model = new PlotModel()
  const annotation = new DelegateAnnotation(async (rc) => {
    rc.pushClip(newOxyRect(50, 50, 50, 50))
  })

  model.annotations.push(annotation)
  return model
}

function unbalancedClippingPop(): PlotModel {
  const model = new PlotModel()
  const annotation = new DelegateAnnotation(async (rc) => {
    rc.popClip()
  })

  model.annotations.push(annotation)
  return model
}

const category = 'PlotModel examples'

export default {
  category,
  examples: [
    {
      title: 'Title',
      example: {
        model: title,
      },
    },
    {
      title: 'Title and Subtitle',
      example: {
        model: titleAndSubtitle,
      },
    },
    {
      title: 'Sub- and superscript in titles',
      example: {
        model: titleAndSubtitleWithSubSuperscript,
      },
    },
    {
      title: 'TitlePadding = 0',
      example: {
        model: titlePadding0,
      },
    },
    {
      title: 'TitlePadding = 100',
      example: {
        model: titlePadding100,
      },
    },
    {
      title: 'TitleHorizontalAlignment = CenteredWithinView',
      example: {
        model: titlesCenteredWithinView,
      },
    },
    {
      title: 'TitleClippingOff',
      example: {
        model: titleClippingOff,
      },
    },
    {
      title: 'TitleClipping60',
      example: {
        model: titleClipping60,
      },
    },
    {
      title: 'Background = Undefined (default)',
      example: {
        model: backgroundUndefined,
      },
    },
    {
      title: 'Background = 50% White',
      example: {
        model: backgroundWhite50,
      },
    },
    {
      title: 'Background = Transparent',
      example: {
        model: backgroundTransparent,
      },
    },
    {
      title: 'Background = LightSkyBlue',
      example: {
        model: backgroundLightGray,
      },
    },
    {
      title: 'Background = White',
      example: {
        model: backgroundWhite,
      },
    },
    {
      title: 'Background = Black',
      example: {
        model: backgroundBlack,
      },
    },
    {
      title: 'PlotAreaBorderThickness = 2',
      example: {
        model: plotAreaBorderThickness2,
      },
    },
    {
      title: 'PlotAreaBorderThickness = (1,0,0,1)',
      example: {
        model: plotAreaBorderThickness1001,
      },
    },
    {
      title: 'PlotAreaBorderThickness = (4,1,1,4)',
      example: {
        model: plotAreaBorderThickness4114,
      },
    },
    {
      title: 'PlotAreaBorderThickness = 0',
      example: {
        model: plotAreaBorderThickness0,
      },
    },
    {
      title: 'PlotAreaBorderThickness / AxisLine',
      example: {
        model: plotAreaBorderThickness0AxisLineThickness1,
      },
    },
    {
      title: 'Exception handling (invalid XAxisKey)',
      example: {
        model: invalidAxisKey,
      },
    },
    {
      title: 'Exception handling (with clipping)',
      example: {
        model: exceptionClipping,
      },
    },
    {
      title: 'Unbalanced clipping (push)',
      example: {
        model: unbalancedClippingPush,
      },
    },
    {
      title: 'Unbalanced clipping (pop)',
      example: {
        model: unbalancedClippingPop,
      },
    },
  ],
} as ExampleCategory
