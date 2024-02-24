<script setup lang="ts">
import type { ExampleCategory, ExampleInfo } from './examples/types'
import examples from './examples/AllExamples'
import { computed, onMounted, ref, toRaw, watch } from 'vue'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Switch,
} from '@headlessui/vue'
import { ChevronUpDownIcon, ChevronUpIcon } from '@heroicons/vue/20/solid'
import { type IPlotController, IPlotView, PlotModel, PlotModelUtilities } from 'oxyplot-js'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import oxyPlotImg from './assets/OxyPlot.png'

import { CanvasPlotView, getRenderContextImageCacheService, PdfPlotView, SvgPlotView } from 'oxyplot-js-renderers'

type RendererType = 'svg' | 'canvas' | 'pdf'
;(window as any).oxyPlotImg = oxyPlotImg

dayjs.extend(duration)
dayjs.extend(dayOfYear)

interface PageExample {
  model: PlotModel
  controller?: IPlotController
}

const selectedExample = ref<ExampleInfo | null>(null)
const filterKey = ref('')
const isTransposed = ref(false)
const isTransposable = ref(false)
const isReversed = ref(false)
const isReversible = ref(false)
const currentRendererType = ref('canvas' as RendererType)
const rendererOptions = ref<RendererType[]>(['canvas', 'pdf', 'svg'])
const isPdfOrientationP = ref<boolean>(false)

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

watch([isTransposed, isReversed, currentRendererType], async () => {
  if (!selectedExample.value) return

  const example = await getExample(selectedExample.value)
  if (!example) return

  await display(example)
})

watch(isPdfOrientationP, () => {})

onMounted(() => {
  let initMode = window.location.hash
  if (initMode.length > 1) {
    // select example on load
    initMode = decodeURIComponent(initMode.substring(1))
    if (!initMode.includes('\t')) return
    const [cateName, exampleTitle] = initMode.split('\t')
    selectExample(cateName, exampleTitle)
  }
})

function selectExample(cateName: string, exampleTitle: string) {
  const ec = examples.find((x) => x.category === cateName)
  if (!ec) return

  const ei = ec.examples.find((x) => x.title === exampleTitle)
  if (!ei) return
  handleExampleClick(ec, ei)
}

let canvas: HTMLCanvasElement | null = null

function getCanvas() {
  if (canvas) return canvas

  const c = document.getElementById('canvasPlotView')! as HTMLCanvasElement
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

let plotViewCache = {} as Record<string, IPlotView>

function getPlotView() {
  if (currentRendererType.value === 'canvas') {
    const key = 'canvas'
    if (plotViewCache[key]) return plotViewCache[key]

    const canvas = getCanvas()
    const plotView = new CanvasPlotView(canvas) as any
    plotViewCache[key] = plotView
    return plotView
  }

  if (currentRendererType.value === 'pdf') {
    const key = isPdfOrientationP.value ? 'pdf-portrait' : 'pdf-landscape'
    if (plotViewCache[key]) return plotViewCache[key]

    const plotView = new PdfPlotView(document.getElementById('pdfPlotView')! as HTMLIFrameElement)
    plotView.orientation = isPdfOrientationP.value ? 'portrait' : 'landscape'
    plotViewCache[key] = plotView as any
    return plotView
  }

  if (currentRendererType.value === 'svg') {
    const key = 'svg'
    let plotView = plotViewCache[key]
    const div = document.getElementById('svgPlotView')! as HTMLDivElement
    div.innerHTML = ''
    if (plotView) {
      return plotView
    }

    plotView = new SvgPlotView(div) as any
    plotViewCache[key] = plotView
    return plotView
  }

  throw new Error(`Unknown renderer type: ${currentRendererType.value}`)
}

async function handleExampleClick(ec: ExampleCategory, ei: ExampleInfo) {
  if (toRaw(selectedExample.value) === ei) return

  const example = await getExample(ei)
  if (!example) return

  selectedExample.value = ei

  isTransposable.value = PlotModelUtilities.isTransposable(example.model)
  isReversible.value = PlotModelUtilities.isReversible(example.model)

  getRenderContextImageCacheService().clear()

  if (!(await display(example))) return

  window.location.hash = encodeURIComponent(`${ec.category}\t${ei.title}`)
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
  if (!model) return false

  const plotView = getPlotView()
  ;(plotView as any).model = model
  ;(plotView as any).controller = pageExample.controller
  return true
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
      <iframe
        v-show="currentRendererType === 'pdf'"
        id="pdfPlotView"
        class="border border-gray-200 rounded-lg shadow"
        :class="[isPdfOrientationP ? 'pdfplotview-portrait' : 'pdfplotview-landscape']"
      />
      <canvas
        id="canvasPlotView"
        v-show="currentRendererType === 'canvas'"
        class="border border-gray-200 rounded-lg shadow"
        style="width: 800px; height: 600px"
      />
      <div
        id="svgPlotView"
        v-show="currentRendererType === 'svg'"
        class="border border-gray-200 rounded-lg shadow select-none"
        style="width: 800px; height: 600px"
      ></div>

      <div class="flex justify-between mt-2">
        <div class="flex items-center">
          Renderer:
          <Listbox v-model="currentRendererType" class="ml-2" style="min-width: 120px">
            <div class="relative mt-1">
              <ListboxButton
                class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
              >
                <span class="block truncate">{{ currentRendererType }}</span>
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>

              <transition
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <ListboxOptions
                  class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                >
                  <ListboxOption
                    v-slot="{ active, selected }"
                    v-for="r in rendererOptions"
                    :key="r"
                    :value="r"
                    as="template"
                  >
                    <li
                      :class="[
                        active ? 'bg-purple-100 text-purple-900' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-10 pr-4',
                      ]"
                    >
                      <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{ r }}</span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>

          <template v-if="currentRendererType === 'pdf'">
            <span class="ml-4 mr-2">landscape</span>
            <Switch
              v-model="isPdfOrientationP"
              :class="isPdfOrientationP ? 'bg-purple-600' : 'bg-gray-200'"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
            >
              <span
                :class="isPdfOrientationP ? 'translate-x-6' : 'translate-x-1'"
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
              />
            </Switch>
            <span class="ml-2">portrait</span>
          </template>
        </div>

        <div class="flex" v-if="currentRendererType === 'canvas' || currentRendererType === 'svg'">
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
  </div>

  <a
    class="fixed bottom-2 right-2"
    style="font-size: 2rem; color: rgb(31, 35, 40)"
    href="https://github.com/iniceice88/oxyplot-js"
    target="_blank"
    aria-label="View GitHub Repo"
  >
    <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" width="1.2em" height="1.2em">
      <path
        fill="currentColor"
        d="M12 2C6.475 2 2 6.475 2 12a9.994 9.994 0 0 0 6.838 9.488c.5.087.687-.213.687-.476c0-.237-.013-1.024-.013-1.862c-2.512.463-3.162-.612-3.362-1.175c-.113-.288-.6-1.175-1.025-1.413c-.35-.187-.85-.65-.013-.662c.788-.013 1.35.725 1.538 1.025c.9 1.512 2.338 1.087 2.912.825c.088-.65.35-1.087.638-1.337c-2.225-.25-4.55-1.113-4.55-4.938c0-1.088.387-1.987 1.025-2.688c-.1-.25-.45-1.275.1-2.65c0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337c1.912-1.3 2.75-1.024 2.75-1.024c.55 1.375.2 2.4.1 2.65c.637.7 1.025 1.587 1.025 2.687c0 3.838-2.337 4.688-4.562 4.938c.362.312.675.912.675 1.85c0 1.337-.013 2.412-.013 2.75c0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10z"
      ></path>
    </svg>
  </a>
</template>

<style scoped>
.pdfplotview-portrait {
  width: 800px;
  height: 80vh;
}

.pdfplotview-landscape {
  width: 800px;
  height: 600px;
}
</style>
