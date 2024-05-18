<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { PlotModelSerializer } from 'oxyplot-js'
import { CanvasPlotView } from 'oxyplot-js-renderers'
import { safeStringify } from '../utils/safeStringify.ts'

const props = defineProps({ json: String })
const visible = ref(true)
const emit = defineEmits(['close'])
const editingJson = ref('')
const errorMsg = ref('')
const canvas = ref(null)

let _plotView: CanvasPlotView | undefined = undefined

watch(
  () => props.json,
  (newVal) => {
    editingJson.value = newVal || ''
  },
  { immediate: true },
)

onMounted(() => {
  console.log('onMounted')
  nextTick(() => {
    setTimeout(() => {
      if (editingJson.value) display(editingJson.value)
    }, 300)
  })
})

function display(json: string) {
  if (!validPlotModel(json)) return

  const plotModel = PlotModelSerializer.deserialize(json)
  if (!plotModel) {
    errorMsg.value = 'deserialize failed'
    return
  }
  console.log('plotModel', plotModel)
  const plotView = getPlotView() as any
  if (!plotView) {
    errorMsg.value = 'can not get plotView'
    return
  }
  plotView.model = plotModel

  const modelObj = plotModel.toJSON({
    excludeDefault: false,
  })
  console.log(safeStringify(modelObj))
}

function getPlotView() {
  if (_plotView !== undefined) {
    return _plotView
  }
  const c = getCanvas()
  if (!c) return undefined

  _plotView = new CanvasPlotView(c)
  _plotView.tooltip.style.zIndex = `${new Date().getTime()}`
  return _plotView
}

function getCanvas() {
  return canvas.value! as HTMLCanvasElement
}

function validPlotModel(json: string) {
  let plotModel: any
  try {
    plotModel = JSON.parse(json)
  } catch (e) {
    errorMsg.value = 'json parse failed'
    return false
  }
  const notDeserializableElementNames = ['DelegateAnnotation']
  errorMsg.value = ''
  if (plotModel.annotations && Array.isArray(plotModel.annotations)) {
    for (const annotation of plotModel.annotations) {
      const elementName = getElementName(annotation)
      if (!elementName) continue
      if (notDeserializableElementNames.includes(elementName)) {
        errorMsg.value = `[ ${elementName} ] is not deserializable`
        return false
      }
    }
  }

  return true
}

function getElementName(ele: any) {
  return ele['__oxy_element_name__']
}

function handleClose() {
  visible.value = false
  emit('close')
}

function handleRun() {
  const json = editingJson.value
  if (!json) return
  display(json)
}
</script>

<template>
  <Dialog v-model:visible="visible" @hide="handleClose" modal header="Json to Plot" :style="{ width: '80%' }">
    <div class="flex" style="height: 600px">
      <div class="flex h-full w-full gap-x-4">
        <div class="basis-4/12">
          <textarea v-model="editingJson" class="h-full w-full border p-1"> </textarea>
        </div>

        <div class="basis-8/12">
          <div class="w-full h-full">
            <canvas ref="canvas" id="canvasPlotView" class="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-between w-full text-sm jsontoplot-dlg">
        <Button @click="handleRun" icon="pi pi-play" label="Run"></Button>
        <Message v-if="errorMsg" :severity="'warn'" :closable="false">{{ errorMsg }}</Message>
        <Button @click="handleClose" severity="secondary">Close</Button>
      </div>
    </template>
  </Dialog>
</template>
<style scoped>
.jsontoplot-dlg >>> .p-message {
  margin: 0 !important;
}
</style>
