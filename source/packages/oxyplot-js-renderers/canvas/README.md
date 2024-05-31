[OxyPlot](https://github.com/oxyplot/oxyplot) is a cross-platform plotting library for .NET


This repo has completely translated OxyPlot.Net into TypeScript, as well as almost all examples!
Now you can use OxyPlot in web browsers and Node.js environments.

## Get Started

[Live Demo](https://iniceice88.github.io/oxyplot-js/)

[ExampleBrowser](https://stackblitz.com/edit/oxyplot-js-play-asx72fo)

[Playground](https://codesandbox.io/p/devbox/oxyplot-js-lqg5ld?file=%2Fsrc%2FApp.vue%3A25%2C54)

### Install

```bash
npm install oxyplot-js
npm install oxyplot-js-renderers
# for pdf renderer:
# npm install oxyplot-js-renderers-pdf
```

### How to use

```html
<canvas
  id="canvasPlotView"
  style="width: 800px; height: 600px"
/>
````

```ts
import { CanvasPlotView } from 'oxyplot-js-renderers'
import { LineJoin, LineSeries, newDataPoint, OxyColors, PlotModel, RectangleAnnotation } from 'oxyplot-js'

const canvas = document.getElementById('canvasPlotView')! as HTMLCanvasElement
const plotView = new CanvasPlotView(canvas)

const model: PlotModel = new PlotModel({ title: 'LineSeries' })

const ls = new LineSeries({
  color: OxyColors.Black,
  strokeThickness: 6.0,
  lineJoin: LineJoin.Round,
})
ls.points.push(newDataPoint(0, 0))
ls.points.push(newDataPoint(100, 100))
model.series.push(ls)

model.annotations.push(
  new RectangleAnnotation({
    minimumX: 40,
    maximumX: 60,
    textRotation: 90,
    text: 'Orange',
    fill: '#FFAC1C',
    toolTip: 'Orange RectangleAnnotation',
  }),
)

plotView.model = model
```
