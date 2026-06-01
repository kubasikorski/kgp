<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import rawPeaks from '../data/korona-gor-polski.json'
import { usePeaksStore } from '@/stores/peaks'
import PeakDetailsMap from '../components/Details/PeakDetailsMap.vue'
import SideBarDetails from '@/components/Details/SideBarDetails.vue'

const route = useRoute()
const store = usePeaksStore()

const peak = computed(() => {
  const found = rawPeaks.find((p) => p.slug === route.params.peak_slug)
  if (!found) return null
  return {
    ...found,
    conquered: store.isConquered(found.slug),
    conqueredAt: store.conqueredAtFor(found.slug),
    planned: store.isPlanned(found.slug),
  }
})

const focusedPoi = ref(null)
const selectedGpx = ref(null)
const tracePoint = ref(null)
watch(() => route.params.peak_slug, () => {
  focusedPoi.value = null
  selectedGpx.value = null
  tracePoint.value = null
})
watch(selectedGpx, () => {
  tracePoint.value = null
})

const onFocusPoi = (poi) => {
  focusedPoi.value = { ...poi, _t: Date.now() }
}

const onSelectGpx = (gpx) => {
  selectedGpx.value = gpx
}

</script>

<template>
  <main
    class="grid h-screen w-screen grid-rows-[auto_40vh_1fr] gap-4 bg-slate-100 p-4 md:grid-cols-[3fr_1fr] md:grid-rows-1"
  >
    <header
      v-if="peak"
      class="flex items-center justify-between gap-3 md:hidden"
    >
      <h1 class="text-xl font-semibold text-slate-900">{{ peak.name }}</h1>
      <RouterLink
        :to="{ name: 'home' }"
        class="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <svg
          viewBox="0 0 20 20"
          class="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 5l-6 5 6 5" />
        </svg>
        Powrót
      </RouterLink>
    </header>
    <PeakDetailsMap
      v-if="peak"
      :peak="peak"
      :poi="peak.poi ?? []"
      :focused="focusedPoi"
      :gpx="selectedGpx"
      :trace="tracePoint"
    />
    <section v-else class="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"></section>
    <aside
      class="flex flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200"
    >
      <header class="hidden items-center justify-between gap-3 md:flex">
        <h1 class="text-xl font-semibold text-slate-900">{{ peak.name }}</h1>
        <RouterLink
          :to="{ name: 'home' }"
          class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <svg
            viewBox="0 0 20 20"
            class="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 5l-6 5 6 5" />
          </svg>
          Powrót
        </RouterLink>
      </header>
      <SideBarDetails
        :peak="peak"
        :selected-gpx="selectedGpx"
        @focus-poi="onFocusPoi"
        @select-gpx="onSelectGpx"
        @hover-point="tracePoint = $event"
      />
    </aside>
  </main>
</template>
