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

const peakStateClass = (peak) => {
  if (peak.conquered) return 'peak-pin--conquered'
  if (peak.planned) return 'peak-pin--planned'
  return 'peak-pin--pending'
}

const peakIcon = (peak) =>
  L.divIcon({
    className: 'peak-marker',
    html: `<span class="peak-pin ${peakStateClass(peak)}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
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
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
    const prevNames = (prev ?? '').split(',').map((s) => s.split(':')[0]).join()
    const nextNames = next.split(',').map((s) => s.split(':')[0]).join()
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
    <a
      href="https://kgp.info.pl/"
      target="_blank"
      rel="noopener"
      class="absolute top-3 left-3 z-[1000] rounded-lg  p-2 shadow-md ring-1 ring-slate-200 backdrop-blur transition hover:bg-white"
    >
      <img
        src="https://kgp.info.pl/wp-content/themes/korona/dist/images/logo_d3781823.png"
        alt="Korona Gór Polski"
        class="2xl:h-32 h-16 w-auto"
      />
    </a>
  </section>
</template>

<style>
.peak-pin {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}
.peak-pin--pending {
  background: #ef4444;
}
.peak-pin--conquered {
  background: #16a34a;
}
.peak-pin--planned {
  background: #eab308;
}
</style>
