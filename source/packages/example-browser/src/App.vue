<script setup lang="ts">
import type { ExampleCategory, ExampleInfo } from './examples/types'
import examples from './examples/AllExamples'
import { computed, onMounted, ref, toRaw } from 'vue'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import oxyPlotImg from './assets/OxyPlot.png'

import { useAutoSaveState } from './utils/useAutoSaveState.ts'
import PlotViewer from './components/PlotViewer.vue'
import { getRenderContextImageCacheService } from 'oxyplot-js-renderers'

import type { ListboxChangeEvent } from 'primevue/listbox'

import JsonViewer from './components/JsonViewer.vue'

;(window as any).oxyPlotImg = oxyPlotImg

dayjs.extend(duration)
dayjs.extend(dayOfYear)

const selectedExample = ref<ExampleInfo | null>(null)
const selectedExampleName = ref('')
const selectedCategoryIdx = ref(-1)
const activeTab = ref(0)
const filterKey = ref('')

const { save, load } = useAutoSaveState()

const displayExamples = computed(() => {
  if (!filterKey.value) return examples

  const result: ExampleCategory[] = []
  const key = filterKey.value.toLowerCase()

  function filter(ec: ExampleCategory, ei: ExampleInfo) {
    return (
      (ec.category || '').toLowerCase().includes(key) ||
      (ei.title || '').toLowerCase().includes(key) ||
      (ec.tags || []).some((t) => t.toLowerCase().includes(key))
    )
  }

  for (const ec of examples) {
    const filteredExamples = ec.examples.filter((ei) => filter(ec, ei))
    if (filteredExamples.length > 0) {
      result.push({ category: ec.category, examples: filteredExamples })
    }
  }
  return result
})

onMounted(async () => {
  const savedState = load()

  if (savedState) {
    filterKey.value = savedState.filter || ''
    const { category, title } = savedState
    if (category && title) {
      selectExample(category, title)
    }
  }
})

function selectExample(cateName: string, exampleTitle: string) {
  const ec = examples.find((x) => x.category === cateName)
  if (!ec) return

  const ei = ec.examples.find((x) => x.title === exampleTitle)
  if (!ei) return

  handleExampleClick(ec, ei)

  const optionKey = generateOptionKey(ei)
  if (optionKey !== selectedExampleName.value) {
    selectedExampleName.value = optionKey
  }
  selectedCategoryIdx.value = displayExamples.value.indexOf(ec)
}

async function handleExampleClick(ec: ExampleCategory, ei: ExampleInfo) {
  if (toRaw(selectedExample.value) === ei) return

  selectedExample.value = ei

  getRenderContextImageCacheService().clear()

  save({ category: ec.category, title: ei.title, filter: filterKey.value })
}

function handleChatSelected(e: ListboxChangeEvent) {
  const optionKey = e.value
  const [category, title] = optionKey.split('\t')
  selectExample(category, title)
}

function generateOptionKey(ei: ExampleInfo) {
  return ei.category + '\t' + ei.title
}
</script>

<template>
  <div class="flex py-4">
    <div class="w-[350px]">
      <input
        type="text"
        v-model="filterKey"
        placeholder="Filter"
        class="shadow mt-2 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />

      <div class="overflow-x-hidden overflow-y-auto mt-4" style="max-height: calc(100vh - 120px)">
        <Accordion :multiple="false" :active-index="selectedCategoryIdx">
          <AccordionTab
            v-for="ec in displayExamples"
            :key="ec.category"
            :header="ec.category"
            :pt="{
              headerTitle: {
                class: selectedExample?.category === ec.category ? 'p-accordion-header-active' : '',
              },
            }"
          >
            <Listbox
              v-model="selectedExampleName"
              :options="ec.examples"
              optionLabel="title"
              @change="handleChatSelected"
              :option-value="generateOptionKey"
              class="w-full text-sm border-0"
            />
          </AccordionTab>
        </Accordion>
      </div>
    </div>

    <div class="flex-grow ml-4 custom-tab">
      <TabView v-model:activeIndex="activeTab">
        <TabPanel header="View">
          <PlotViewer :example-info="selectedExample!" />
        </TabPanel>
        <TabPanel header="Json">
          <JsonViewer :example-info="selectedExample!" :is-active="activeTab === 1" />
        </TabPanel>
      </TabView>
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
:deep(.custom-tab) .p-tabview .p-tabview-panels {
  @apply pt-2 pl-1;
}

:deep(.p-accordion-header-active) {
  color: #047857;
}
</style>
