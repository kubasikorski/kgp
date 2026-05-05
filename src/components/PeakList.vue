<script setup>
defineProps({
  peaks: { type: Array, required: true },
  selected: { type: Object, default: null },
})
defineEmits(['select'])
</script>

<template>
  <ul
    class="flex flex-col divide-y divide-slate-100 overflow-y-auto rounded-xl ring-1 ring-slate-200"
  >
    <li
      v-for="peak in peaks"
      :key="peak.name"
      class="flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition hover:bg-slate-50"
      :class="selected?.name === peak.name ? 'bg-slate-50' : ''"
      @click="$emit('select', peak)"
    >
      <span class="flex items-center gap-2">
        <span
          class="h-2.5 w-2.5 rounded-full"
          :class="peak.conquered ? 'bg-emerald-500' : 'bg-rose-500'"
        ></span>
        <span class="text-slate-800">{{ peak.name }}</span>
      </span>
      <span class="text-xs text-slate-500">{{ peak.elevation }} m</span>
    </li>
  </ul>
</template>
