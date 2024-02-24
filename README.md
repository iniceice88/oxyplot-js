[OxyPlot](https://github.com/oxyplot/oxyplot) is a cross-platform plotting library for .NET


This repo has completely translated OxyPlot.Net into TypeScript, as well as almost all examples!
Now you can use OxyPlot in web browsers and Node.js environments.

## Get Started

[Live Demo](https://iniceice88.github.io/oxyplot-js/)

[Playground](https://stackblitz.com/edit/oxyplot-js-play-asx72fo)

### Install

```bash
npm install oxyplot-js
npm install oxyplot-js-renderers
```

### How to use

```html
<canvas
  id="canvasPlotView"
  style="width: 800px; height: 600px"
/>
````

```ts
import { PlotModel } from 'oxyplot-js'
import { CanvasPlotView } from 'oxyplot-js-renderers'

const canvas = document.getElementById('canvasPlotView')! as HTMLCanvasElement
const plotView = new CanvasPlotView(canvas)

const model: PlotModel = new PlotModel({ title: 'LineSeries' })
// add some series
// model.series.push(lineSeries)

plotView.model = model
```