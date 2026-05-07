<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { peakIcon } from '@/utils/peakMarker'

const props = defineProps({
  peak: { type: Object, required: true },
  poi: { type: Array, default: () => [] },
  focused: { type: Object, default: null },
  gpx: { type: Object, default: null },
})

const gpxUrls = import.meta.glob('@/data/gpx/**/*.gpx', {
  eager: true,
  query: '?url',
  import: 'default',
})

const mapEl = useTemplateRef('mapEl')
let map
let peakMarker
let poiLayer
let poiMarkerMap = new Map()
let gpxLayer

const poiKey = (p) => `${p.type}:${p.coords[0]},${p.coords[1]}`

const POI_LABELS = {
  parking: { short: 'P', long: 'Parking' },
  stamp: { short: 'S', long: 'Pieczątka' },
}

const poiIcon = (type) => {
  const label = POI_LABELS[type]?.short ?? '?'
  return L.divIcon({
    className: 'poi-marker',
    html: `<span class="poi-pin poi-pin--${type}">${label}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  })
}

const poiLabel = (type) => POI_LABELS[type]?.long ?? type

const render = () => {
  if (!map) return
  if (peakMarker) peakMarker.remove()
  if (poiLayer) poiLayer.remove()

  peakMarker = L.marker(props.peak.coords, { icon: peakIcon(props.peak) })
    .addTo(map)
    .bindPopup(
      `<strong>${props.peak.name}</strong> (${props.peak.elevation} m)<br>${props.peak.range}`,
    )
    .openPopup()

  poiMarkerMap = new Map()
  const poiMarkers = props.poi.map((p) => {
    const popupTitle = p.name || poiLabel(p.type)
    const popupHtml = `<strong>${popupTitle}</strong>`
    const m = L.marker(p.coords, { icon: poiIcon(p.type) }).bindPopup(popupHtml)
    poiMarkerMap.set(poiKey(p), m)
    return m
  })
  poiLayer = L.featureGroup(poiMarkers).addTo(map)

  if (poiMarkers.length) {
    map.fitBounds(L.featureGroup([peakMarker, ...poiMarkers]).getBounds(), { padding: [40, 40] })
  } else {
    map.setView(props.peak.coords, 13)
  }
}

onMounted(() => {
  map = L.map(mapEl.value)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)
  render()
})

watch(() => props.peak?.slug, render)
watch(
  () => [props.peak?.conquered, props.peak?.planned],
  () => {
    if (peakMarker && props.peak) peakMarker.setIcon(peakIcon(props.peak))
  },
)
watch(
  () => props.focused,
  (poi) => {
    if (!map || !poi) return
    const marker = poiMarkerMap.get(poiKey(poi))
    map.flyTo(poi.coords, 15, { duration: 0.8 })
    if (marker) marker.openPopup()
  },
)

const parseGpx = (xmlText) => {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml')
  const points = Array.from(doc.getElementsByTagName('trkpt'))
  if (!points.length) {
    return Array.from(doc.getElementsByTagName('rtept')).map((p) => [
      parseFloat(p.getAttribute('lat')),
      parseFloat(p.getAttribute('lon')),
    ])
  }
  return points.map((p) => [parseFloat(p.getAttribute('lat')), parseFloat(p.getAttribute('lon'))])
}

const clearGpx = () => {
  if (gpxLayer) {
    gpxLayer.remove()
    gpxLayer = null
  }
}

watch(
  () => props.gpx,
  async (gpx) => {
    clearGpx()
    if (!map || !gpx?.url) return
    const resolved = gpxUrls[gpx.url] ?? gpx.url
    const res = await fetch(resolved)
    if (!res.ok) return
    const coords = parseGpx(await res.text())
    if (!coords.length) return
    gpxLayer = L.polyline(coords, { color: '#dc2626', weight: 4, opacity: 0.85 }).addTo(map)
    map.fitBounds(gpxLayer.getBounds(), { padding: [40, 40] })
  },
)

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<template>
  <section
    class="peak-details-map relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200"
  >
    <div ref="mapEl" class="h-full w-full"></div>
  </section>
</template>

<style>
.peak-details-map .leaflet-tile-pane {
  filter: saturate(0.55) contrast(0.85) brightness(1.05);
}
.peak-details-map .peak-pin {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}
.poi-pin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  font-family: ui-sans-serif, system-ui, sans-serif;
  line-height: 1;
}
.poi-pin--parking {
  background: #2563eb;
}
.poi-pin--stamp {
  background: #d97706;
}
</style>
