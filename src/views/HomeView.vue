<script setup>
import { computed, ref } from 'vue'
import rawPeaks from '../data/korona-gor-polski.json'
import { usePeaksStore } from '@/stores/peaks'
import PeakMap from '../components/PeakMap.vue'
import PeakSidebar from '../components/PeakSidebar.vue'

const store = usePeaksStore()

const peaks = computed(() =>
  rawPeaks.map((peak) => ({
    ...peak,
    conquered: store.isConquered(peak.slug),
    conqueredAt: store.conqueredAtFor(peak.slug),
    planned: store.isPlanned(peak.slug),
  })),
)

const filter = ref('all')
const visiblePeaks = computed(() => {
  if (filter.value === 'conquered') return peaks.value.filter((p) => p.conquered)
  if (filter.value === 'planned') return peaks.value.filter((p) => p.planned)
  return peaks.value
})

const selectedName = ref(null)
const selected = computed(
  () => peaks.value.find((p) => p.name === selectedName.value) ?? null,
)

const handleSelect = (peak) => {
  selectedName.value = peak.name
}
const handleClose = () => {
  selectedName.value = null
}
</script>

<template>
  <main
    class="grid h-screen w-screen grid-rows-[2fr_1fr] gap-4 bg-slate-100 p-4 md:grid-cols-[3fr_1fr] md:grid-rows-1"
  >
    <PeakMap
      :peaks="visiblePeaks"
      :selected="selected"
      @select="handleSelect"
    />
    <PeakSidebar
      :peaks="visiblePeaks"
      :all-peaks="peaks"
      :selected="selected"
      :filter="filter"
      @update:filter="filter = $event"
      @select="handleSelect"
      @close="handleClose"
    />
  </main>
</template>
