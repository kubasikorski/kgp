<script setup>
import ElevationChart from '@/components/Details/ElevationChart.vue'

defineProps({
  gpxFiles: { type: Array, default: () => [] },
  selectedGpx: { type: Object, default: null },
})
const emit = defineEmits(['select-gpx'])
</script>

<template>
  <template v-if="gpxFiles.length">
    <ul class="flex flex-col gap-2">
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
    <ElevationChart class="mt-4" v-if="selectedGpx" :gpx="selectedGpx" />
  </template>
  <p v-else class="text-sm text-slate-500">Brak dostępnych śladów tras.</p>
</template>
