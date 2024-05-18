import { describe, expect, it, vi } from 'vitest'
import examples from '../src/examples/AllExamples'
import { newOxyRect, Number_MAX_VALUE } from 'oxyplot-js'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import path from 'path'
import { RecordRenderContext } from '../src/utils/RecordRenderContext.ts'
import { Random } from '../src/examples/Random.ts'
import crypto from 'crypto'

describe('compare_to_latest', () => {
  dayjs.extend(duration)
  dayjs.extend(dayOfYear)
  ;(window as any).oxyPlotImg = path.resolve(__dirname, '../src/assets/OxyPlot.png')

  const randomSpy = vi.spyOn(Random.prototype, 'next').mockImplementation((min?: number, max?: number) => {
    if (min !== undefined) return min
    return 0.1
  })

  const date = new Date(2024, 1, 1)
  vi.useFakeTimers()
  vi.setSystemTime(date)

  const [width, height] = [1000, 800]
  let testedCases = 0
  const limit = Number_MAX_VALUE
  for (const cat of examples) {
    for (const exp of cat.examples) {
      const modelFullName = cat.category + ' -> ' + exp.title
      if (ignoreList.includes(modelFullName) || ignoreCategory.includes(cat.category)) {
        it.skip(modelFullName, () => {})
        console.log('ignore:', modelFullName)
        continue
      }

      testedCases++
      if (testedCases > limit) break

      it(modelFullName, async () => {
        console.log('testing', modelFullName)

        const model = await exp.example.model()
        model.update(true)
        const renderContext = new RecordRenderContext(width, height, true, {} as any, model.background)
        await model.render(renderContext, newOxyRect(0, 0, width, height))
        const log = renderContext.getCommands()
        const logMd5 = calcMd5(log)
        expect(logMd5).toMatchSnapshot()
        // await expect(log).toMatchFileSnapshot(
        //   `./__snapshots__/${sanitizeFilename(cat.category + ' -- ' + exp.title)}.test.ts.snap`,
        // )
      })
    }
  }
})

const ignoreList: string[] = [
  'PlotModel examples -> Exception handling (invalid XAxisKey)', // contains call stack
  'PlotModel examples -> Exception handling (with clipping)', // contains call stack
  'PlotModel examples -> Unbalanced clipping (push)', // contains call stack
  'PlotModel examples -> Unbalanced clipping (pop)', // contains call stack
]

const ignoreCategory: string[] = [
  'Performance', // slow
  'XKCD', // random
]

/**
 * Sanitize a filename by removing or replacing illegal characters.
 * @param {string} filename - The original filename.
 * @param {string} [replacement='_'] - The string to replace illegal characters with.
 * @returns {string} - The sanitized filename.
 */
function sanitizeFilename(filename: string, replacement = '_') {
  // Define the illegal characters for different operating systems
  // eslint-disable-next-line no-useless-escape
  const illegalRe = /[\/\?<>\\:\*\|":]/g
  // eslint-disable-next-line no-control-regex
  const controlRe = /[\x00-\x1f\x80-\x9f]/g
  const reservedRe = /^\.+$/
  const windowsReservedRe = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i
  // eslint-disable-next-line no-useless-escape
  const windowsTrailingRe = /[\. ]+$/

  // Replace illegal characters with the replacement string
  const sanitized = filename
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement)

  return sanitized
}

function calcMd5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex').substring(0, 8)
}
