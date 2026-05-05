<script setup>
import { computed } from 'vue'

const props = defineProps({
  peaks: { type: Array, required: true },
  allPeaks: { type: Array, required: true },
  selected: { type: Object, default: null },
  filter: { type: String, default: 'all' },
})
const emit = defineEmits(['select', 'update:filter'])

const setFilter = (value) => emit('update:filter', value)

const counts = computed(() => ({
  all: props.allPeaks.length,
  conquered: props.allPeaks.filter((p) => p.conquered).length,
  planned: props.allPeaks.filter((p) => p.planned).length,
}))

const dotClass = (peak) => {
  if (peak.conquered) return 'bg-emerald-500'
  if (peak.planned) return 'bg-amber-400'
  return 'bg-rose-500'
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs font-medium">
      <button
        type="button"
        class="flex-1 rounded-md px-2 py-1 transition"
        :class="filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        @click="setFilter('all')"
      >
        Wszystkie ({{ counts.all }})
      </button>
      <button
        type="button"
        class="flex-1 rounded-md px-2 py-1 transition"
        :class="filter === 'conquered' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        @click="setFilter('conquered')"
      >
        Zdobyte ({{ counts.conquered }})
      </button>
      <button
        type="button"
        class="flex-1 rounded-md px-2 py-1 transition"
        :class="filter === 'planned' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        @click="setFilter('planned')"
      >
        Zaplanowane ({{ counts.planned }})
      </button>
    </div>
    <ul
      class="flex flex-col divide-y divide-slate-100 overflow-y-auto rounded-xl ring-1 ring-slate-200"
    >
      <li
        v-for="peak in peaks"
        :key="peak.name"
        class="flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition hover:bg-slate-50"
        :class="selected?.name === peak.name ? 'bg-slate-50' : ''"
        @click="$emit('select', peak)"
      >
        <span class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full" :class="dotClass(peak)"></span>
          <span class="text-slate-800">{{ peak.name }}</span>
        </span>
        <span class="text-xs text-slate-500">{{ peak.elevation }} m</span>
      </li>
      <li v-if="!peaks.length" class="px-3 py-4 text-center text-xs text-slate-500">
        Brak szczytów
      </li>
    </ul>
  </div>
</template>
