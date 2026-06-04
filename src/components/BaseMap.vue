<script setup>
import { onMounted, onBeforeUnmount, ref, useTemplateRef } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

defineProps({
  wrapperClass: { type: String, default: '' },
})
const emit = defineEmits(['ready'])

const mapEl = useTemplateRef('mapEl')
let map
let userMarker
let accuracyCircle
let userLatLng = null
const locating = ref(false)

const userIcon = L.divIcon({
  className: 'user-marker',
  html: '<span class="user-dot"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

onMounted(() => {
  map = L.map(mapEl.value)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  map
    .on('locationfound', (e) => {
      const radius = e.accuracy / 2
      userLatLng = e.latlng
      if (userMarker) {
        userMarker.setLatLng(e.latlng)
        accuracyCircle.setLatLng(e.latlng).setRadius(radius)
      } else {
        userMarker = L.marker(e.latlng, { icon: userIcon, zIndexOffset: 1000 })
          .addTo(map)
        accuracyCircle = L.circle(e.latlng, {
          radius,
          color: '#2563EB',
          weight: 1,
          fillColor: '#3B82F6',
          fillOpacity: 0.12,
        }).addTo(map)
      }
      if (locating.value) {
        map.flyTo(e.latlng, 15, { duration: 0.8 })
        locating.value = false
      }
    })
    .on('locationerror', (err) => {
      locating.value = false
      console.warn('Geolocation unavailable:', err.message)
    })
    .locate({ watch: true, enableHighAccuracy: true })

  emit('ready', map)
})

const focusUser = () => {
  if (!map) return
  if (userLatLng) {
    map.flyTo(userLatLng, 15, { duration: 0.8 })
    userMarker?.openPopup()
  } else {
    locating.value = true
  }
}

onBeforeUnmount(() => {
  map?.stopLocate()
  map?.remove()
})
</script>

<template>
  <section
    class="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200"
    :class="wrapperClass"
  >
    <div ref="mapEl" class="h-full w-full"></div>
    <button
      type="button"
      title="Pokaż moją lokalizację"
      aria-label="Pokaż moją lokalizację"
      class="absolute right-3 top-3 z-1000 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-600 shadow-md ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900"
      :class="{ 'text-blue-600 hover:text-blue-700': locating }"
      @click="focusUser"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-5 w-5"
        :class="{ 'animate-pulse': locating }"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
    </button>
  </section>
</template>

<style>
.user-marker .user-dot {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #2563eb;
  border: 3px solid #fff;
  box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5);
  animation: user-pulse 2s ease-out infinite;
}
@keyframes user-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5);
  }
  70% {
    box-shadow: 0 0 0 14px rgba(37, 99, 235, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
  }
}
</style>
