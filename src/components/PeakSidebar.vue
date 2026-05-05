<script setup>
import { computed, useTemplateRef } from 'vue'
import SideBarPeakDetails from './SideBarPeakDetails.vue'
import PeakList from './PeakList.vue'
import { usePeaksStore } from '@/stores/peaks'

const props = defineProps({
  peaks: { type: Array, required: true },
  allPeaks: { type: Array, required: true },
  selected: { type: Object, default: null },
  filter: { type: String, default: 'all' },
})
defineEmits(['select', 'close', 'update:filter'])

const store = usePeaksStore()
const fileInput = useTemplateRef('fileInput')

const conqueredCount = computed(() => props.allPeaks.filter((p) => p.conquered).length)
const totalCount = computed(() => props.allPeaks.length)

const onExport = () => {
  const data = store.exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `kgp-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const triggerImport = () => {
  fileInput.value?.click()
}

const onImportFile = async (event) => {
  const input = event.target
  const file = input.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    if (
      !window.confirm(
        'Import nadpisze dane na tym urządzeniu (zdobyte i zaplanowane szczyty). Kontynuować?',
      )
    ) {
      input.value = ''
      return
    }
    store.importData(data)
  } catch (err) {
    window.alert(`Nie udało się zaimportować pliku: ${err.message ?? err}`)
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <aside
    class="flex flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200"
  >
    <header class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">Korona Gór Polski</h1>
        <p class="mt-1 text-sm text-slate-500">
          Zdobyte: <span class="font-medium text-emerald-600">{{ conqueredCount }}</span> /
          {{ totalCount }}
        </p>
      </div>
      <div class="flex gap-1">
        <button
          type="button"
          class="rounded-md p-1.5 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900"
          title="Eksportuj dane"
          @click="onExport"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <button
          type="button"
          class="rounded-md p-1.5 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900"
          title="Importuj dane"
          @click="triggerImport"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json"
          class="hidden"
          @change="onImportFile"
        />
      </div>
    </header>

    <SideBarPeakDetails v-if="selected" :peak="selected" @close="$emit('close')" />
    <p v-else class="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
      Kliknij szczyt na mapie, aby zobaczyć szczegóły.
    </p>

    <PeakList
      class="hidden md:block"
      :peaks="peaks"
      :all-peaks="allPeaks"
      :selected="selected"
      :filter="filter"
      @update:filter="$emit('update:filter', $event)"
      @select="$emit('select', $event)"
    />
  </aside>
</template>
