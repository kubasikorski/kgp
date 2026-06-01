<script setup>
import { watch } from 'vue'
import L from 'leaflet'
import { peakIcon } from '@/utils/peakMarker'
import BaseMap from '@/components/BaseMap.vue'

const props = defineProps({
  peaks: { type: Array, required: true },
  selected: { type: Object, default: null },
})
const emit = defineEmits(['select'])

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

const onReady = (m) => {
  map = m
  syncMarkers(true)
}

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
</script>

<template>
  <BaseMap wrapper-class="peak-map" @ready="onReady" />
</template>

<style>
.peak-map .leaflet-tile-pane {
  filter: saturate(0.55) contrast(0.65) brightness(1.05);
}
</style>
