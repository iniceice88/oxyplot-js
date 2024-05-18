import Annotations from './Annotations'
import Axes from './Axes'
import CustomSeries from './CustomSeries'
import Discussions from './Discussions'
import Exps from './Examples'
import Misc from './Misc'
import Series from './Series'
import ShowCases from './ShowCases'

import type { ExampleCategory } from './types'
import { sortArray } from 'oxyplot-js'

const allExampleCats = [
  ...Annotations,
  ...Axes,
  ...Discussions,
  ...CustomSeries,
  ...Exps,
  ...Misc,
  ...Series,
  ...ShowCases,
]

let finalExamples: ExampleCategory[] = []
for (const ec of allExampleCats) {
  const existsCate = finalExamples.find((x) => x.category === ec.category)
  if (existsCate) {
    // merge same category
    existsCate.examples.push(...ec.examples)
  } else {
    finalExamples.push(ec)
  }
}

finalExamples = sortArray(finalExamples, [['category', 'ASC']])
for (const ec of finalExamples) {
  for (const exp of ec.examples) {
    exp.category = ec.category
  }
}

export default finalExamples
