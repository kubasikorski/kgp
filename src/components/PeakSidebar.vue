<script setup>
import { computed } from 'vue'
import SideBarPeakDetails from './SideBarPeakDetails.vue'
import PeakList from './PeakList.vue'

const props = defineProps({
  peaks: { type: Array, required: true },
  selected: { type: Object, default: null },
})
defineEmits(['select', 'close'])

const conqueredCount = computed(() => props.peaks.filter((p) => p.conquered).length)
</script>

<template>
  <aside
    class="flex flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200"
  >
    <header>
      <h1 class="text-xl font-semibold text-slate-900">Korona Gór Polski</h1>
      <p class="mt-1 text-sm text-slate-500">
        Zdobyte: <span class="font-medium text-emerald-600">{{ conqueredCount }}</span> /
        {{ peaks.length }}
      </p>
    </header>

    <SideBarPeakDetails v-if="selected" :peak="selected" @close="$emit('close')" />
    <p v-else class="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
      Kliknij szczyt na mapie, aby zobaczyć szczegóły.
    </p>

    <PeakList
      class="hidden md:block"
      :peaks="peaks"
      :selected="selected"
      @select="$emit('select', $event)"
    />
  </aside>
</template>
