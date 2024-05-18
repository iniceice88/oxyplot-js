<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { safeStringify } from '../utils/safeStringify.ts'
import type { ExampleInfo } from '../examples/types.ts'
import { PlotModel } from 'oxyplot-js'
import JsonToPlotDialog from './JsonToPlotDialog.vue'

const json = ref('')
const jsonPrettify = ref(true)
const hideDefaultValue = ref(true)
const copyButtonText = ref('Copy')
const showJsonToPlotDialog = ref(false)
const editingJson = ref('')

const props = defineProps<{ exampleInfo?: ExampleInfo; isActive: boolean }>()

onMounted(() => {
  if (!props.exampleInfo) return
  toJson()
})

watch([() => props.exampleInfo, () => props.isActive], () => {
  toJson()
})

watch([jsonPrettify, hideDefaultValue], () => {
  toJson()
})

async function toJson() {
  if (!props.isActive) {
    json.value = ''
    return
  }

  if (!props.exampleInfo) return
  const model = await props.exampleInfo.example.model()

  if (!hasLargeData(props.exampleInfo, model)) {
    json.value = 'too many data points to display'
    return
  }

  const modelObj = model.toJSON({
    excludeDefault: hideDefaultValue.value,
  }) as any

  json.value = safeStringify(modelObj, jsonPrettify.value ? 2 : undefined)
}

function handleCopy() {
  if (!json.value) return
  navigator.clipboard.writeText(json.value)
  copyButtonText.value = 'Copied!'
  setTimeout(() => {
    copyButtonText.value = 'Copy'
  }, 2000)
}

function handleJsonToPlot() {
  editingJson.value = json.value
  showJsonToPlotDialog.value = true
}

function hasLargeData(ei: ExampleInfo, model: PlotModel) {
  const cats = ['Performance']
  if (ei.category && cats.includes(ei.category)) {
    return false
  }
  if (ei.title.includes('Large Data Set')) {
    return false
  }
  return true
}
</script>

<template>
  <div class="flex flex-col">
    <div
      class="border border-gray-200 rounded-lg shadow p-1"
      style="resize: both; overflow: hidden; width: 800px; height: 600px"
    >
      <textarea class="w-full h-full p-2" style="resize: none">{{ json }}</textarea>
    </div>

    <div class="flex justify-between mt-4 items-center">
      <div class="flex items-center">
        <div class="flex items-center">
          <Checkbox v-model="hideDefaultValue" :binary="true" inputId="chk_def_val" />
          <label for="chk_def_val" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >Hide Default Value</label
          >
        </div>
        <div class="flex items-center ml-2">
          <Checkbox v-model="jsonPrettify" :binary="true" inputId="chk_prettify" />
          <label for="chk_prettify" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Prettify</label>
        </div>
      </div>

      <div class="text-sm">
        <Button @click="handleJsonToPlot">Json to Plot</Button>

        <Button @click="handleCopy" severity="secondary" class="ml-4">
          {{ copyButtonText }}
        </Button>
      </div>
    </div>
  </div>

  <JsonToPlotDialog v-if="showJsonToPlotDialog" :json="editingJson" @close="showJsonToPlotDialog = false" />
</template>
