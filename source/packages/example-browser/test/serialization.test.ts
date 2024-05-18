import { describe, expect, it } from 'vitest'
import examples from '../src/examples/AllExamples'
import { DelegateAnnotation, Number_MAX_VALUE, PlotModel, PlotModelSerializer } from 'oxyplot-js'
import { safeStringify } from '../src/utils/safeStringify.ts'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import path from 'path'

describe('serialization', async () => {
  dayjs.extend(duration)
  dayjs.extend(dayOfYear)
  ;(window as any).oxyPlotImg = path.resolve(__dirname, '../src/assets/OxyPlot.png')

  let testedCases = 0
  const limit = Number_MAX_VALUE

  for (const cat of examples) {
    for (const exp of cat.examples) {
      const modelFullName = cat.category + ' -> ' + exp.title
      if (ignoreCategory.includes(cat.category) || ignoreList.includes(modelFullName)) {
        it.skip(modelFullName, () => {})
        console.log('ignore:', modelFullName)
        continue
      }

      const model = await exp.example.model()

      if (ignorePlotModel(model)) continue

      testedCases++
      if (testedCases > limit) break

      it(modelFullName, async () => {
        console.log('testing', modelFullName)
        const jsonObj = model.toJSON({ excludeDefault: true })
        const jsonStr = safeStringify(jsonObj)

        const newModel = PlotModelSerializer.deserialize(jsonStr)

        compareModel(model, newModel, modelFullName)
      })
    }
  }
})

function compareModel(json1: any, m2: PlotModel, msg: string) {
  const json2 = m2.toJSON({ excludeDefault: true })
  const jsonObj1 = JSON.parse(safeStringify(json1))
  const jsonObj2 = JSON.parse(safeStringify(json2))

  expect(jsonObj1, msg).toEqual(jsonObj2)
}

const ignoreList = [
  'BoxPlotSeries -> BoxPlot (DateTime axis)', //using dateService inner formatter
  'Misc -> Train schedule', // custom series
  "Misc -> Conway's Game of Life", // custom series
  'Z0 Discussions -> #549839: Polar plot with custom arrow series', // custom series
]
const ignoreCategory = [
  'Custom series',
  'FunctionAnnotation',
  'Performance', // slow
]

function ignorePlotModel(model: PlotModel) {
  if (model.annotations.filter((a) => a instanceof DelegateAnnotation).length > 0) return true
  //if (model.series.filter((s) => ignoreSeries.includes((s as any).__oxy_element_name__)).length > 0) return true
  return false
}
