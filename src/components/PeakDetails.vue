<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePeaksStore } from '../stores/peaks'

const props = defineProps({
  peak: { type: Object, required: true },
})
defineEmits(['close'])

const store = usePeaksStore()
const route = useRoute()
const onDetailsRoute = computed(() => route.name === 'peak-details')

const formattedDate = computed(() => {
  if (!props.peak.conqueredAt) return null
  const d = new Date(props.peak.conqueredAt)
  return Number.isNaN(d.getTime()) ? props.peak.conqueredAt : d.toLocaleDateString('pl-PL')
})

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
  <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
    <div class="flex items-start justify-between gap-3">
      <RouterLink
        :to="{ name: 'peak-details', params: { peak_slug: peak.slug } }"
      >
        <h2 class="text-lg font-semibold text-slate-900">{{ peak.name }}</h2>
      </RouterLink>
      <div class="flex shrink-0 items-center gap-2">
        <span
          class="rounded-full px-2 py-0.5 text-xs font-medium"
          :class="peak.conquered ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
        >
          {{ peak.conquered ? 'Zdobyty' : 'Niezdobyty' }}
          <template v-if="formattedDate"> · {{ formattedDate }}</template>
        </span>
        <button
          type="button"
          aria-label="Zamknij"
          class="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
          @click="$emit('close')"
        >
          <svg
            viewBox="0 0 20 20"
            class="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>
    </div>
    <dl class="mt-3 space-y-1 text-sm">
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
    <RouterLink
      v-if="!onDetailsRoute"
      :to="{ name: 'peak-details', params: { peak_slug: peak.slug } }"
      class="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium transition bg-emerald-600 text-white hover:bg-emerald-700"
    >
      Pokaż szczegóły
    </RouterLink>
    <template v-else>
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
        {{
          peak.conquered ? 'Cofnij zdobycie' : picking ? 'Potwierdź datę' : 'Oznacz jako zdobyty'
        }}
      </button>
    </template>
  </div>
</template>
