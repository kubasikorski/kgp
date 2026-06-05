<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  peaks: { type: Array, required: true },
  allPeaks: { type: Array, required: true },
  selected: { type: Object, default: null },
  filter: { type: String, default: 'all' },
})
const emit = defineEmits(['select', 'update:filter'])

const setFilter = (value) => emit('update:filter', value)

const SORT_KEY_STORAGE = 'kgp:sortKey'
const SORT_DIR_STORAGE = 'kgp:sortDir'

const validKeys = ['name', 'elevation', 'conqueredAt']
const validDirs = ['asc', 'desc']

const loadStored = (storageKey, allowed, fallback) => {
  const value = localStorage.getItem(storageKey)
  return allowed.includes(value) ? value : fallback
}

const sortKey = ref(loadStored(SORT_KEY_STORAGE, validKeys, 'name')) // 'name' | 'elevation' | 'conqueredAt'
const sortDir = ref(loadStored(SORT_DIR_STORAGE, validDirs, 'asc')) // 'asc' | 'desc'

watch(sortKey, (value) => localStorage.setItem(SORT_KEY_STORAGE, value))
watch(sortDir, (value) => localStorage.setItem(SORT_DIR_STORAGE, value))

const setSort = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const caret = (key) => (sortKey.value === key ? (sortDir.value === 'asc' ? '↑' : '↓') : '')

// The date column only exists under the conquered filter — fall back when leaving it.
watch(
  () => props.filter,
  (f) => {
    if (f !== 'conquered' && sortKey.value === 'conqueredAt') {
      sortKey.value = 'name'
      sortDir.value = 'asc'
    }
  },
)

const sortedPeaks = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...props.peaks].sort((a, b) => {
    let cmp
    if (sortKey.value === 'elevation') {
      cmp = (a.elevation ?? 0) - (b.elevation ?? 0)
    } else if (sortKey.value === 'conqueredAt') {
      // Sort by ISO date string; peaks without a date sort last.
      const av = a.conqueredAt ?? ''
      const bv = b.conqueredAt ?? ''
      cmp = av < bv ? -1 : av > bv ? 1 : 0
    } else {
      cmp = a.name.localeCompare(b.name, 'pl')
    }
    return cmp * dir
  })
})

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

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pl-PL')
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-1 rounded-lg bg-slate-100 p-2 text-xs font-medium">
      <button
        type="button"
        class="flex-1 rounded-md px-2 py-2 transition"
        :class="filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        @click="setFilter('all')"
      >
        Wszystkie ({{ counts.all }})
      </button>
      <button
        type="button"
        class="flex-1 rounded-md px-2 py-2 transition"
        :class="filter === 'conquered' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        @click="setFilter('conquered')"
      >
        Zdobyte ({{ counts.conquered }})
      </button>
      <button
        type="button"
        class="flex-1 rounded-md px-2 py-2 transition"
        :class="filter === 'planned' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        @click="setFilter('planned')"
      >
        Zaplanowane ({{ counts.planned }})
      </button>
    </div>
    <ul
      class="flex flex-col divide-y divide-slate-100 overflow-y-auto rounded-xl ring-1 ring-slate-200 mt-2"
    >
      <li
        class="flex items-center justify-between bg-slate-50 px-3 py-2 text-xs font-medium text-slate-400"
      >
        <button
          type="button"
          class="flex items-center gap-1 transition hover:text-slate-600"
          @click="setSort('name')"
        >
          Nazwa <span class="text-slate-500">{{ caret('name') }}</span>
        </button>
        <span class="flex items-center gap-3">
          <button
            type="button"
            class="flex items-center gap-1 transition hover:text-slate-600"
            @click="setSort('elevation')"
          >
            Wysokość <span class="text-slate-500">{{ caret('elevation') }}</span>
          </button>
          <button
            v-if="filter === 'conquered'"
            type="button"
            class="flex items-center gap-1 transition hover:text-slate-600"
            @click="setSort('conqueredAt')"
          >
            Data <span class="text-slate-500">{{ caret('conqueredAt') }}</span>
          </button>
        </span>
      </li>
      <li
        v-for="peak in sortedPeaks"
        :key="peak.name"
        class="flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition hover:bg-slate-50"
        :class="selected?.name === peak.name ? 'bg-slate-50' : ''"
        @click="$emit('select', peak)"
      >
        <span class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full" :class="dotClass(peak)"></span>
          <span class="text-slate-800">{{ peak.name }}</span>
        </span>
        <span class="flex items-center gap-3 text-xs text-slate-500">
          <span>{{ peak.elevation }} m</span>
          <span v-if="filter === 'conquered'" class="text-emerald-600">
            {{ formatDate(peak.conqueredAt) }}
          </span>
        </span>
      </li>
      <li v-if="!peaks.length" class="px-3 py-4 text-center text-xs text-slate-500">
        Brak szczytów
      </li>
    </ul>
  </div>
</template>
