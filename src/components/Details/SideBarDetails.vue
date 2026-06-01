<script setup>
import { computed, ref, watch } from 'vue'
import { usePeaksStore } from '@/stores/peaks'
import PoiList from '@/components/Details/PoiList.vue'
import StampList from '@/components/Details/StampList.vue'
import RouteList from '@/components/Details/RouteList.vue'

const props = defineProps({
  peak: { type: Object, required: true },
  selectedGpx: { type: Object, default: null },
})
const emit = defineEmits(['close', 'focus-poi', 'select-gpx', 'hover-point'])

const store = usePeaksStore()

const isPlanned = computed(() => store.isPlanned(props.peak.slug))

const formattedDate = computed(() => {
  if (!props.peak.conqueredAt) return null
  const d = new Date(props.peak.conqueredAt)
  return Number.isNaN(d.getTime()) ? props.peak.conqueredAt : d.toLocaleDateString('pl-PL')
})

const poilist = computed(() => props.peak.poi ?? [])

const stamps = computed(() => props.peak.stamps ?? [])

const gpxFiles = computed(() => props.peak?.gpx ?? [])

const tabs = computed(() => [
  { id: 'routes', label: 'Trasy', count: gpxFiles.value.length },
  { id: 'poi', label: 'POI', count: poilist.value.length },
  { id: 'stamps', label: 'Pieczątki', count: stamps.value.length },
])

const activeTab = ref('routes')

watch(
  () => props.peak.slug,
  () => {
    activeTab.value = 'routes'
  },
)

const today = () => new Date().toISOString().slice(0, 10)
const picking = ref(false)
const pickedDate = ref(today())

watch(
  () => props.peak.slug,
  () => {
    picking.value = false
    pickedDate.value = today()
  },
)

const onPrimary = () => {
  if (props.peak.conquered) {
    store.toggle(props.peak.slug)
    return
  }
  if (!picking.value) {
    picking.value = true
    pickedDate.value = today()
    return
  }
  store.toggle(props.peak.slug, pickedDate.value)
  picking.value = false
}

const cancelPicking = () => {
  picking.value = false
}

const togglePlanned = () => {
  store.togglePlanned(props.peak.slug)
}
</script>

<template>
  <div v-if="peak.description">
    <p class="text-slate-800">{{ peak.description }}</p>
  </div>
  <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
    <dl class="space-y-1 text-sm">
      <div class="flex justify-between pb-4">
        <dt class="text-slate-500">Status</dt>
        <dd
          class="text-slate-800 p-2 rounded-xl"
          :class="peak.conquered ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
        >
          {{ peak.conquered ? 'Zdobyty' : 'Niezdobyty' }}
        </dd>
      </div>
      <div class="flex justify-between" v-if="peak.conquered && formattedDate">
        <dt class="text-slate-500">Data zdobycia</dt>
        <dd class="text-slate-800">{{ formattedDate }}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-slate-500">Pasmo</dt>
        <dd class="text-slate-800">{{ peak.range }}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-slate-500">Wysokość</dt>
        <dd class="text-slate-800">{{ peak.elevation }} m</dd>
      </div>
    </dl>
  </div>

  <div>
    <div
      v-if="picking && !peak.conquered"
      class="mb-3 rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200"
    >
      <label class="block text-xs font-medium text-slate-600 mb-4 pb-2">Data zdobycia</label>
      <input
        v-model="pickedDate"
        type="date"
        :max="today()"
        class="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
      <button
        type="button"
        class="mt-2 text-xs font-medium text-slate-500 hover:text-slate-700"
        @click="cancelPicking"
      >
        Anuluj
      </button>
    </div>
    <div class="flex gap-2">
      <button
        type="button"
        class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition"
        :class="
          peak.conquered
            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        "
        :disabled="picking && !pickedDate"
        @click="onPrimary"
      >
        {{
          peak.conquered ? 'Cofnij zdobycie' : picking ? 'Potwierdź datę' : 'Oznacz jako zdobyty'
        }}
      </button>
      <button
        v-if="!peak.conquered"
        type="button"
        class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ring-1"
        :class="
          isPlanned
            ? 'bg-amber-100 text-amber-800 ring-amber-300 hover:bg-amber-200'
            : 'bg-white text-amber-700 ring-amber-200 hover:bg-amber-50'
        "
        @click="togglePlanned"
      >
        {{ isPlanned ? 'Zaplanowane' : 'Zaplanuj' }}
      </button>
    </div>
  </div>

  <div class="mt-4">
    <div class="flex gap-1 border-b border-slate-200">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="px-3 py-2 text-sm font-medium transition border-b-2 -mb-px"
        :class="
          activeTab === tab.id
            ? 'border-emerald-600 text-emerald-700'
            : 'border-transparent text-slate-500 hover:text-slate-700'
        "
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span
          v-if="tab.count"
          class="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600"
          >{{ tab.count }}</span
        >
      </button>
    </div>

    <div class="pt-4">
      <div v-show="activeTab === 'routes'">
        <RouteList
          :gpx-files="gpxFiles"
          :selected-gpx="selectedGpx"
          @select-gpx="emit('select-gpx', $event)"
          @hover-point="emit('hover-point', $event)"
        />
      </div>
      <div v-show="activeTab === 'poi'">
        <PoiList :poi="poilist" @focus-poi="emit('focus-poi', $event)" />
      </div>
      <div v-show="activeTab === 'stamps'">
        <StampList :stamps="stamps" />
      </div>
    </div>
  </div>
</template>
