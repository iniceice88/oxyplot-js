<script setup lang="ts">
import { IPlotView, PlotModelUtilities } from 'oxyplot-js'
import { onMounted, ref, watch } from 'vue'
import { safeStringify } from '../utils/safeStringify.ts'
import { CanvasPlotView, SvgPlotView } from 'oxyplot-js-renderers'
import { PdfPlotView } from 'oxyplot-js-renderers-pdf'
import { ExampleInfo } from '../examples/types.ts'

type RendererType = 'svg' | 'canvas' | 'pdf'

const props = defineProps<{ exampleInfo?: ExampleInfo }>()

const emit = defineEmits(['optionsChanged'])

const isTransposed = ref(false)
const isTransposable = ref(false)
const isReversed = ref(false)
const isReversible = ref(false)
const currentRendererType = ref('canvas' as RendererType)
const rendererOptions = ref<RendererType[]>(['canvas', 'pdf', 'svg'])
const pdfOrientation = ref<'portrait' | 'landscape'>('landscape')

watch([isTransposed, isReversed, currentRendererType, pdfOrientation], () => {
  display()

  emit('optionsChanged', {
    isTransposed: isTransposed.value,
    isReversed: isReversed.value,
    renderType: currentRendererType,
  })
})

watch(
  () => props.exampleInfo,
  () => {
    display()
  },
)

onMounted(() => {
  display()
})

async function display() {
  if (!props.exampleInfo) return
  const ei = props.exampleInfo
  const model = await ei.example.model()
  if (!model) return

  isTransposable.value = PlotModelUtilities.isTransposable(model)
  isReversible.value = PlotModelUtilities.isReversible(model)

  if (isTransposed.value) {
    if (isTransposable.value) PlotModelUtilities.transpose(model)
    else isTransposed.value = false
  }

  if (isReversed.value) {
    if (isReversible.value) PlotModelUtilities.reverseAllAxes(model)
    else isReversed.value = false
  }

  const plotView = getPlotView()
  ;(plotView as any).model = model
  if (ei.example.controller) {
    plotView.controller = ei.example.controller()
  } else {
    plotView.controller = undefined
  }

  const modelObj = model.toJSON({
    excludeDefault: true,
  })
  console.log(safeStringify(modelObj))
}

function getCanvas() {
  return document.getElementById('canvasPlotView')! as HTMLCanvasElement
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
    const key = pdfOrientation.value
    if (plotViewCache[key]) return plotViewCache[key]

    const ele = document.getElementById('pdfPlotView')! as HTMLIFrameElement
    const plotView = new PdfPlotView(ele, {
      orientation: pdfOrientation.value,
    })
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
</script>

<template>
  <div class="w-[800px]">
    <div
      id="plotViewWrapper"
      style="resize: both; overflow: auto; width: 800px; height: 600px"
      class="border border-gray-200 rounded-lg shadow p-4"
    >
      <iframe v-show="currentRendererType === 'pdf'" id="pdfPlotView" class="w-full h-full" />
      <canvas id="canvasPlotView" class="w-full h-full" v-show="currentRendererType === 'canvas'" />
      <div id="svgPlotView" class="w-full h-full" v-show="currentRendererType === 'svg'"></div>
    </div>
    <div class="flex justify-between mt-2">
      <div class="flex items-center">
        Renderer:
        <Dropdown v-model="currentRendererType" :options="rendererOptions" class="ml-2 text-sm" />
        <SelectButton
          v-if="currentRendererType === 'pdf'"
          v-model="pdfOrientation"
          :options="['landscape', 'portrait']"
          class="ml-4"
        />
      </div>

      <div class="flex" v-if="currentRendererType === 'canvas' || currentRendererType === 'svg'">
        <div class="flex items-center" v-if="exampleInfo">
          <Checkbox v-model="isTransposed" :binary="true" :disabled="!isTransposable" inputId="chkTransposed" />
          <label class="ml-1 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" for="chkTransposed"
            >Transposed</label
          >
        </div>
        <div class="flex items-center ml-2" v-if="exampleInfo">
          <Checkbox v-model="isReversed" :binary="true" :disabled="!isReversible" inputId="chkReversed" />
          <label class="ml-1 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300" for="chkReversed"
            >Reversed</label
          >
        </div>
      </div>
    </div>
  </div>
</template>
