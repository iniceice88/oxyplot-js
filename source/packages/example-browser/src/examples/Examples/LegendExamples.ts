import {
  DataPoint,
  Legend,
  LegendOrientation,
  LegendPlacement,
  LegendPosition,
  LineSeries,
  OxyColor,
  OxyColors,
  OxyThickness,
  PlotModel,
} from 'oxyplot-js'
import type { ExampleCategory } from '../types'

const legendRightTopInside = (): PlotModel => {
  const model = createModel()

  const l = new Legend({
    legendPlacement: LegendPlacement.Inside,
    legendPosition: LegendPosition.RightTop,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)

  return model
}

const legendRightTopOutside = (): PlotModel => {
  const model = createModel()

  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.RightTop,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)

  return model
}

const legendBottomLeftHorizontal = (): PlotModel => {
  const model = createModel(4)

  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.BottomLeft,
    legendOrientation: LegendOrientation.Horizontal,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)

  return model
}

const legendTopLeftVertical = (): PlotModel => {
  const model = createModel(4)

  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.TopLeft,
    legendOrientation: LegendOrientation.Vertical,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)

  return model
}

const legendDefault = (): PlotModel => {
  const model = createModel()
  const l = new Legend()

  model.legends.push(l)

  return model
}

const legendItemSpacing = (): PlotModel => {
  const model = createModel()

  const l = new Legend({
    legendItemSpacing: 100,
    legendPosition: LegendPosition.BottomLeft,
    legendOrientation: LegendOrientation.Horizontal,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)

  return model
}

const legendLineSpacingVertical = (): PlotModel => {
  const model = createModel()

  const l = new Legend({
    legendLineSpacing: 30,
    legendPosition: LegendPosition.TopLeft,
    legendOrientation: LegendOrientation.Vertical,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)

  return model
}

const legendLineSpacingHorizontal = (): PlotModel => {
  const model = createModel()

  const l = new Legend({
    legendLineSpacing: 30,
    legendPosition: LegendPosition.TopLeft,
    legendOrientation: LegendOrientation.Horizontal,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)

  return model
}

const legendColumnSpacing = (): PlotModel => {
  const model = createModel(60)

  const l = new Legend({
    legendColumnSpacing: 100,
    legendPosition: LegendPosition.TopRight,
    legendOrientation: LegendOrientation.Vertical,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)

  return model
}

const legendHidden = (): PlotModel => {
  const model = createModel()

  const l = new Legend({
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)
  model.isLegendVisible = false

  return model
}

const legendGrayscale = (): PlotModel => {
  const model = createModel()
  model.defaultColors = [OxyColors.Black, OxyColors.Gray]

  const l = new Legend({
    legendSymbolLength: 32,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)

  return model
}

const clippedLegends = (): PlotModel => {
  const model = createModel(1)
  model.series[0].title =
    '1234567890 abcdefghijklmnopqrstuvwxyzæøå ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ 1234567890 abcdefghijklmnopqrstuvwxyzæøå ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ'

  const l = new Legend({
    legendPlacement: LegendPlacement.Inside,
    legendPosition: LegendPosition.RightTop,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)

  return model
}

const clippedLegendsOutside = (): PlotModel => {
  const model = clippedLegends()
  model.legends[0].legendPlacement = LegendPlacement.Outside
  model.legends[0].legendPosition = LegendPosition.RightTop
  model.legends[0].legendMaxWidth = 200

  return model
}

const clippedLegendsRight = (): PlotModel => {
  const model = clippedLegends()
  model.legends[0].legendPlacement = LegendPlacement.Outside
  model.legends[0].legendPosition = LegendPosition.TopRight

  return model
}

function createModel(n: number = 20): PlotModel {
  const model = new PlotModel()
  model.title = 'LineSeries'

  for (let i = 1; i <= n; i++) {
    const s = new LineSeries()
    s.title = 'Series ' + i
    model.series.push(s)

    for (let x = 0; x < 2 * Math.PI; x += 0.1) {
      s.points.push(new DataPoint(x, Math.sin(x * i) / i + i))
    }
  }

  return model
}

const legendBottomCenterOutsideWithMaxHeight = (): PlotModel => {
  const model = createModel()
  const l = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.BottomCenter,
    legendOrientation: LegendOrientation.Vertical,
    legendMaxHeight: 75.0,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)
  return model
}

const legendDefaultFontSize = (): PlotModel => {
  const model = createModel()
  const l = new Legend({
    legendFontSize: NaN,
    legendTitle: 'Title in DefaultFontSize',
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)
  model.defaultFontSize = 20
  return model
}

const singleLegendWithSeriesGroupsHorizontal = (): PlotModel => {
  const model = createModel(21)
  for (let i = 0; i < 7; i++) model.series[i].seriesGroupName = 'group 1'
  for (let i = 7; i < 14; i++) model.series[i].seriesGroupName = 'group 2'
  for (let i = 14; i < 21; i++) model.series[i].seriesGroupName = 'group 3'

  const l = new Legend({
    legendFontSize: NaN,
    legendTitle: 'Legend with groups of Series',
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
    groupNameFont: 'Segoe UI Black',
    legendPosition: LegendPosition.TopLeft,
    legendOrientation: LegendOrientation.Horizontal,
  })

  model.legends.push(l)
  return model
}

const singleLegendWithSeriesGroups = (): PlotModel => {
  const model = createModel(21)
  for (let i = 0; i < 7; i++) model.series[i].seriesGroupName = 'group 1'
  for (let i = 7; i < 14; i++) model.series[i].seriesGroupName = 'group 2'
  for (let i = 14; i < 21; i++) model.series[i].seriesGroupName = 'group 3'

  const l = new Legend({
    legendFontSize: NaN,
    legendTitle: 'Legend with groups of Series',
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l)
  return model
}

const singleLegendWithSeriesGroupsMaxHeight = (): PlotModel => {
  const model = createModel(21)
  for (let i = 0; i < 7; i++) model.series[i].seriesGroupName = 'group 1'
  for (let i = 7; i < 14; i++) model.series[i].seriesGroupName = 'group 2'
  for (let i = 14; i < 21; i++) model.series[i].seriesGroupName = 'group 3'

  const l = new Legend({
    legendFontSize: NaN,
    legendTitle: 'Legend with groups of Series',
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
    legendMaxHeight: 275.0,
  })

  model.legends.push(l)
  return model
}

const multipleLegendsWithSeriesGroups = (): PlotModel => {
  const model = createModel(21)
  for (let i = 0; i < 7; i++) {
    model.series[i].seriesGroupName = 'group 1'
    model.series[i].legendKey = 'Legend 1'
  }
  for (let i = 7; i < 14; i++) {
    model.series[i].seriesGroupName = 'group 2'
    model.series[i].legendKey = 'Legend 1'
  }
  for (let i = 14; i < 21; i++) {
    model.series[i].seriesGroupName = 'group 3'
    model.series[i].legendKey = 'Legend 2'
  }

  const l1 = new Legend({
    key: 'Legend 1',
    legendFontSize: NaN,
    legendTitle: 'Legend 1 Series',
    legendPlacement: LegendPlacement.Inside,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  const l2 = new Legend({
    key: 'Legend 2',
    legendFontSize: NaN,
    legendTitle: 'Legend 2 Series',
    legendPlacement: LegendPlacement.Outside,
    legendBackground: OxyColor.fromAColor(200, OxyColors.White),
    legendBorder: OxyColors.Black,
  })

  model.legends.push(l1)
  model.legends.push(l2)
  return model
}

const legendFullWidth = (): PlotModel => {
  const model = createModel(21)

  const l1 = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.TopCenter,
    legendOrientation: LegendOrientation.Horizontal,
    allowUseFullExtent: true,
  })

  const l2 = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.BottomCenter,
    legendOrientation: LegendOrientation.Horizontal,
    allowUseFullExtent: true,
  })

  model.plotMargins = new OxyThickness(50)

  model.legends.push(l1)
  model.legends.push(l2)

  model.invalidatePlot(true)

  return model
}

const legendFullHeight = (): PlotModel => {
  const model = createModel(21)

  const l1 = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.LeftTop,
    legendOrientation: LegendOrientation.Vertical,
    allowUseFullExtent: true,
  })

  const l2 = new Legend({
    legendPlacement: LegendPlacement.Outside,
    legendPosition: LegendPosition.RightTop,
    legendOrientation: LegendOrientation.Vertical,
    allowUseFullExtent: true,
  })

  model.legends.push(l1)
  model.legends.push(l2)

  return model
}

const legendShowingInvisibleSeries = (): PlotModel => {
  return createModelWithInvisibleSeries(true)
}

const legendNotShowingInvisibleSeries = (): PlotModel => {
  return createModelWithInvisibleSeries(false)
}

const createModelWithInvisibleSeries = (showInvisibleSeries: boolean): PlotModel => {
  const model = createModel()
  const l = new Legend({
    showInvisibleSeries: showInvisibleSeries,
  })

  model.legends.push(l)

  for (let i = 0; i < model.series.length; i += 2) {
    model.series[i].isVisible = false
  }

  model.invalidatePlot(false)
  return model
}

const category = 'Legends'

export default {
  category,
  tags: ['Legends'],
  examples: [
    {
      title: 'Legend at right top inside',
      example: {
        model: legendRightTopInside,
      },
    },
    {
      title: 'Legend at right top outside',
      example: {
        model: legendRightTopOutside,
      },
    },
    {
      title: 'Legend at BottomLeft outside horizontal',
      example: {
        model: legendBottomLeftHorizontal,
      },
    },
    {
      title: 'Legend at TopLeft outside vertical',
      example: {
        model: legendTopLeftVertical,
      },
    },
    {
      title: 'Legend at default position',
      example: {
        model: legendDefault,
      },
    },
    {
      title: 'LegendItemSpacing (only for horizontal orientation)',
      example: {
        model: legendItemSpacing,
      },
    },
    {
      title: 'LegendLineSpacing (vertical legend orientation)',
      example: {
        model: legendLineSpacingVertical,
      },
    },
    {
      title: 'LegendLineSpacing (horizontal legend orientation)',
      example: {
        model: legendLineSpacingHorizontal,
      },
    },
    {
      title: 'LegendColumnSpacing (only for vertical orientation)',
      example: {
        model: legendColumnSpacing,
      },
    },
    {
      title: 'Hidden Legend',
      example: {
        model: legendHidden,
      },
    },
    {
      title: 'Grayscale colors',
      example: {
        model: legendGrayscale,
      },
    },
    {
      title: 'Clipped legends',
      example: {
        model: clippedLegends,
      },
    },
    {
      title: 'Clipped legends RightTop outside with MaxWidth',
      example: {
        model: clippedLegendsOutside,
      },
    },
    {
      title: 'Clipped legends TopRight outside',
      example: {
        model: clippedLegendsRight,
      },
    },
    {
      title: 'LegendMaxHeight (vertical legend orientation)',
      example: {
        model: legendBottomCenterOutsideWithMaxHeight,
      },
    },
    {
      title: 'Legend with DefaultFontSize',
      example: {
        model: legendDefaultFontSize,
      },
    },
    {
      title: 'Legend with grouped Series Horizontal',
      example: {
        model: singleLegendWithSeriesGroupsHorizontal,
      },
    },
    {
      title: 'Legend with grouped Series',
      example: {
        model: singleLegendWithSeriesGroups,
      },
    },
    {
      title: 'Legend with grouped Series and MaxHeight',
      example: {
        model: singleLegendWithSeriesGroupsMaxHeight,
      },
    },
    {
      title: 'Multiple Legends with grouped Series',
      example: {
        model: multipleLegendsWithSeriesGroups,
      },
    },
    {
      title: 'Full width legend',
      example: {
        model: legendFullWidth,
      },
    },
    {
      title: 'Full height legend',
      example: {
        model: legendFullHeight,
      },
    },
    {
      title: 'Legend showing invisible series',
      example: {
        model: legendShowingInvisibleSeries,
      },
    },
    {
      title: 'Legend not showing invisible series',
      example: {
        model: legendNotShowingInvisibleSeries,
      },
    },
  ],
} as ExampleCategory
