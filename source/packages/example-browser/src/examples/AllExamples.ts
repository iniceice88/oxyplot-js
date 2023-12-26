import ShowCases from './ShowCases'
import Annotations from './Annotations'
import CustomSeries from './CustomSeries'
import Axes from './Axes'
import Exps from './Examples'
import Misc from './Misc'
import Series from './Series'

import type { ExampleCategory } from './types'
import { sortArray } from 'oxyplot-js'
import Discussions from './Discussions'

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

export default finalExamples
