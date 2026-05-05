<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePeaksStore } from '@/stores/peaks'
import ElevationChart from '@/components/Details/ElevationChart.vue'

const props = defineProps({
  peak: { type: Object, required: true },
  selectedGpx: { type: Object, default: null },
})
const emit = defineEmits(['close', 'focus-poi', 'select-gpx'])

const store = usePeaksStore()

const formattedDate = computed(() => {
  if (!props.peak.conqueredAt) return null
  const d = new Date(props.peak.conqueredAt)
  return Number.isNaN(d.getTime()) ? props.peak.conqueredAt : d.toLocaleDateString('pl-PL')
})

const parkings = computed(() => (props.peak.poi ?? []).filter((p) => p.type === 'parking'))

const gpxFiles = computed(() => props.peak?.gpx ?? [])

const today = () => new Date().toISOString().slice(0, 10)
const picking = ref(false)
const pickedDate = ref(today())

watch(
  () => props.peak.name,
  () => {
    picking.value = false
    pickedDate.value = today()
  },
)

const onPrimary = () => {
  if (props.peak.conquered) {
    store.toggle(props.peak.name)
    return
  }
  if (!picking.value) {
    picking.value = true
    pickedDate.value = today()
    return
  }
  store.toggle(props.peak.name, pickedDate.value)
  picking.value = false
}

const cancelPicking = () => {
  picking.value = false
}
</script>

<template>
  <div v-if="peak.description">
    <p class="text-slate-800">{{ peak.description }}</p>
  </div>
  <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
    <dl class="mt-3 space-y-1 text-sm">
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

  <div class="mt-4">
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
    <button
      type="button"
      class="w-full rounded-lg px-3 py-2 text-sm font-medium transition"
      :class="
        peak.conquered
          ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100'
          : 'bg-emerald-600 text-white hover:bg-emerald-700'
      "
      :disabled="picking && !pickedDate"
      @click="onPrimary"
    >
      {{ peak.conquered ? 'Cofnij zdobycie' : picking ? 'Potwierdź datę' : 'Oznacz jako zdobyty' }}
    </button>
  </div>

  <template v-if="parkings.length">
    <h3 class="text-lg font-semibold text-slate-900">Parkingi</h3>
    <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <ul class="mt-3 flex flex-col gap-3">
        <li
          v-for="(parking, index) in parkings"
          :key="index"
          class="cursor-pointer rounded-lg bg-white p-3 ring-1 ring-slate-200 transition hover:ring-emerald-400 hover:bg-emerald-50"
          @click="emit('focus-poi', parking)"
        >
          <div class="flex items-start gap-2">
            <div class="flex-1 text-sm text-slate-700">
              <p v-if="parking.name" class="text-lg">{{ parking.name }}</p>
              <p v-if="parking.description" class="pt-2">{{ parking.description }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </template>
  <template v-if="gpxFiles.length">
    <h3 class="text-lg font-semibold text-slate-900">Dostępne trasy</h3>
    <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <ul class="mt-3 flex flex-col gap-2">
        <li
          v-for="file in gpxFiles"
          :key="file.url"
          class="cursor-pointer rounded-lg p-3 ring-1 text-sm transition"
          :class="
            selectedGpx?.url === file.url
              ? 'bg-emerald-50 ring-emerald-400 text-emerald-800'
              : 'bg-white ring-slate-200 text-slate-700 hover:ring-emerald-400 hover:bg-emerald-50'
          "
          @click="emit('select-gpx', selectedGpx?.url === file.url ? null : file)"
        >
          <div class="flex items-start gap-2">
            <div class="flex-1">
              <p>{{ file.name }}</p>
              <dl
                v-if="file.trailDist != null || file.trailTime"
                class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"
              >
                <div v-if="file.trailDist != null" class="flex gap-1">
                  <dt>Dystans:</dt>
                  <dd class="text-slate-700">{{ file.trailDist }} km</dd>
                </div>
                <div v-if="file.trailTime" class="flex gap-1">
                  <dt>Czas:</dt>
                  <dd class="text-slate-700">{{ file.trailTime }}</dd>
                </div>
              </dl>
            </div>
            <a
              v-if="file.mapaUrl"
              :href="file.mapaUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="shrink-0 rounded-md p-1 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700"
              title="Otwórz na mapie"
              @click.stop
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5"
              >
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
            </a>
          </div>
        </li>
      </ul>
    </div>
    <ElevationChart v-if="selectedGpx" :gpx="selectedGpx" />
  </template>
</template>
