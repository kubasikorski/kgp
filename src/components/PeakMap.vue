<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { peakIcon } from '@/utils/peakMarker'

const props = defineProps({
  peaks: { type: Array, required: true },
  selected: { type: Object, default: null },
})
const emit = defineEmits(['select'])

const mapEl = useTemplateRef('mapEl')
const markersByName = new Map()
let map
let allBounds

const syncMarkers = (fitBounds) => {
  if (!map) return
  const nextNames = new Set(props.peaks.map((p) => p.name))
  for (const [name, marker] of markersByName) {
    if (!nextNames.has(name)) {
      marker.remove()
      markersByName.delete(name)
    }
  }
  for (const peak of props.peaks) {
    const existing = markersByName.get(peak.name)
    if (existing) {
      existing.setIcon(peakIcon(peak))
    } else {
      const marker = L.marker(peak.coords, { icon: peakIcon(peak) })
        .addTo(map)
        .bindPopup(`<strong>${peak.name}</strong> (${peak.elevation} m)<br>${peak.range}`)
        .on('click', () => emit('select', peak))
      markersByName.set(peak.name, marker)
    }
  }
  if (markersByName.size) {
    allBounds = L.featureGroup([...markersByName.values()]).getBounds()
    if (fitBounds) map.fitBounds(allBounds, { padding: [40, 40] })
  } else {
    allBounds = null
  }
}

onMounted(() => {
  map = L.map(mapEl.value)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)
  syncMarkers(true)
})

watch(
  () => props.selected,
  (peak, prev) => {
    if (!map) return
    if (peak) {
      map.flyTo(peak.coords, 11, { duration: 0.6 })
      markersByName.get(peak.name)?.openPopup()
    } else {
      if (prev) markersByName.get(prev.name)?.closePopup()
      if (allBounds) map.flyToBounds(allBounds, { padding: [40, 40], duration: 0.6 })
    }
  },
)

watch(
  () => props.peaks.map((p) => `${p.name}:${p.conquered ? 1 : 0}${p.planned ? 1 : 0}`).join(),
  (next, prev) => {
    if (!map) return
    const prevNames = (prev ?? '')
      .split(',')
      .map((s) => s.split(':')[0])
      .join()
    const nextNames = next
      .split(',')
      .map((s) => s.split(':')[0])
      .join()
    syncMarkers(prevNames !== nextNames)
  },
)

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<template>
  <section class="peak-map relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
    <div ref="mapEl" class="h-full w-full"></div>
  </section>
</template>

<style>
.peak-map .leaflet-tile-pane {
  filter: saturate(0.55) contrast(0.65) brightness(1.05);
}
</style>
