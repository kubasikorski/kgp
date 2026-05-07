<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  peaks: { type: Array, required: true },
  selected: { type: Object, default: null },
})
const emit = defineEmits(['select'])

const mapEl = useTemplateRef('mapEl')
const markersByName = new Map()
let map
let allBounds

const peakState = (peak) => {
  if (peak.conquered) return 'conquered'
  if (peak.planned) return 'planned'
  return 'pending'
}

const PIN_GRADIENTS = {
  pending: ['#F87171', '#7F1D1D'],
  conquered: ['#45D1BB', '#0E6E6F'],
  planned: ['#FBBF24', '#92400E'],
}

const peakSvg = (state) => {
  const [from, to] = PIN_GRADIENTS[state]
  const id = `fassPin-${state}`
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Peak">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"></stop>
      <stop offset="100%" stop-color="${to}"></stop>
    </linearGradient>
  </defs>
  <path d="M32 60 L17 33.5 A18 18 0 1 1 47 33.5 Z" fill="url(#${id})"></path>
  <path d="M20 30 L25 23 L28 26 L33 15 L39 23 L42 20 L44 30 Z" fill="#FFFFFF"></path>
</svg>`
}

const peakIcon = (peak) =>
  L.divIcon({
    className: 'peak-marker',
    html: `<span class="peak-pin">${peakSvg(peakState(peak))}</span>`,
    iconSize: [92, 52],
    iconAnchor: [26, 52],
    popupAnchor: [0, -48],
  })

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
  <section class="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
    <div ref="mapEl" class="h-full w-full"></div>
  </section>
</template>

<style>
.leaflet-tile-pane {
  filter: saturate(0.55) contrast(0.65) brightness(1.05);
}
.peak-pin {
  display: block;
  width: 52px;
  height: 52px;
}
.peak-pin svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
