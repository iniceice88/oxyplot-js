<script setup lang="ts">
import type { ExampleCategory, ExampleInfo } from './examples/types'
import examples from './examples/AllExamples'
import { computed, ref, toRaw, watch } from 'vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ChevronUpIcon } from '@heroicons/vue/20/solid'
import { type IPlotController, PlotModel, PlotModelUtilities } from 'oxyplot-js'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import { WebPlotView } from './web/WebPlotView'
import oxyPlotImg from './assets/OxyPlot.png'

import { getRenderContextImageCacheService } from './web/RenderContextImageCacheService.ts'

;(window as any).oxyPlotImg = oxyPlotImg

dayjs.extend(duration)
dayjs.extend(dayOfYear)

interface PageExample {
  model: PlotModel
  controller?: IPlotController
}

let canvas: HTMLCanvasElement | null = null
const selectedExample = ref<ExampleInfo | null>(null)
const filterKey = ref('')
const isTransposed = ref(false)
const isTransposable = ref(false)
const isReversed = ref(false)
const isReversible = ref(false)

let plotView: WebPlotView | null = null

const displayExamples = computed(() => {
  if (!filterKey.value) return examples

  const result: ExampleCategory[] = []
  const key = filterKey.value.toLowerCase()

  function filter(ec: ExampleCategory, ei: ExampleInfo) {
    return (ei.title || '').toLowerCase().includes(key) || (ec.tags || []).some((t) => t.toLowerCase().includes(key))
  }

  for (const ec of examples) {
    const filteredExamples = ec.examples.filter((ei) => filter(ec, ei))
    if (filteredExamples.length > 0) {
      result.push({ category: ec.category, examples: filteredExamples })
    }
  }
  return result
})

watch([isTransposed, isReversed], async (a, b) => {
  if (!selectedExample.value) return

  const example = await getExample(selectedExample.value)
  if (!example) return

  await display(example)
})

function getCanvas() {
  if (canvas) return canvas

  const c = document.getElementById('plotView')! as HTMLCanvasElement
  const width = c.clientWidth
  const height = c.clientHeight

  const ratio = window.devicePixelRatio || 1
  c.width = width * ratio
  c.height = height * ratio
  c.style.width = width + 'px'
  c.style.height = height + 'px'

  canvas = c
  return canvas
}

async function handleExampleClick(ec: ExampleCategory, ei: ExampleInfo) {
  if (toRaw(selectedExample.value) === ei) return

  const example = await getExample(ei)
  if (!example) return

  selectedExample.value = ei

  isTransposable.value = PlotModelUtilities.isTransposable(example.model)
  isReversible.value = PlotModelUtilities.isReversible(example.model)

  getRenderContextImageCacheService().clear()

  await display(example)
}

async function getExample(ei: ExampleInfo): Promise<PageExample | null> {
  let model: PlotModel | null = null
  try {
    model = await ei.example.model()
  } catch (e) {
    console.error(e)
    alert(e)
    return null
  }
  if (!model) return null

  if (isTransposed.value && PlotModelUtilities.isTransposable(model)) {
    PlotModelUtilities.transpose(model)
  }

  if (isReversed.value && PlotModelUtilities.isReversible(model)) {
    PlotModelUtilities.reverseAllAxes(model)
  }

  let controller: IPlotController | undefined = undefined
  if (ei.example.controller) {
    controller = ei.example.controller()
  }

  return {
    model,
    controller,
  }
}

async function display(pageExample: PageExample) {
  const model = pageExample.model
  if (!model) return

  if (!plotView) {
    const c = getCanvas()!
    plotView = new WebPlotView(c)
  }
  plotView.model = model
  plotView.controller = pageExample.controller
}
</script>

<template>
  <div class="flex py-4">
    <div class="w-[300px]">
      <input
        type="text"
        v-model="filterKey"
        placeholder="Filter"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />

      <div class="overflow-x-hidden overflow-y-auto mt-2" style="max-height: calc(100vh - 100px)">
        <Disclosure as="div" class="mt-2 mr-1" v-slot="{ open }" v-for="ec in displayExamples" :key="ec.category">
          <DisclosureButton
            class="flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
          >
            <span>{{ ec.category }} ({{ ec.examples.length }})</span>
            <ChevronUpIcon :class="open ? 'rotate-180 transform' : ''" class="h-5 w-5 text-purple-500" />
          </DisclosureButton>
          <DisclosurePanel class="px-4 pb-2 text-sm text-gray-500">
            <ul>
              <li v-for="ei in ec.examples" :key="ei.title" class="my-2 cursor-pointer">
                <div
                  @click="handleExampleClick(ec, ei)"
                  :class="{ 'text-sky-500 font-bold': toRaw(selectedExample) === ei }"
                >
                  {{ ei.title }}
                </div>
              </li>
            </ul>
          </DisclosurePanel>
        </Disclosure>
      </div>
    </div>
    <div class="flex-grow ml-4">
      <canvas id="plotView" class="border border-gray-200 rounded-lg shadow" style="width: 800px; height: 600px" />

      <div class="flex justify-end mt-2">
        <div class="flex items-center" v-if="selectedExample">
          <input
            v-model="isTransposed"
            type="checkbox"
            :disabled="!isTransposable"
            id="chkTransposed"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label class="ml-1 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" for="chkTransposed"
            >Transposed</label
          >
        </div>

        <div class="flex items-center ml-2" v-if="selectedExample">
          <input
            v-model="isReversed"
            :disabled="!isReversible"
            type="checkbox"
            id="chkReversed"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label class="ml-1 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" for="chkReversed"
            >Reversed</label
          >
        </div>
      </div>
    </div>
  </div>
</template>
