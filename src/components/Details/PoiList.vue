<script setup>
defineProps({
  poi: { type: Array, default: () => [] },
})
const emit = defineEmits(['focus-poi'])
</script>

<template>
  <ul v-if="poi.length" class="flex flex-col gap-3">
    <li
      v-for="(item, index) in poi"
      :key="index"
      class="cursor-pointer rounded-lg bg-white p-3 ring-1 ring-slate-200 transition hover:ring-emerald-400 hover:bg-emerald-50"
      @click="emit('focus-poi', item)"
    >
      <div class="flex items-start gap-2">
        <div class="flex-1 text-sm text-slate-700">
          <p v-if="item.name" class="text-sm">{{ item.name }}</p>
          <p v-if="item.description" class="pt-2">{{ item.description }}</p>
        </div>
      </div>
    </li>
  </ul>
  <p v-else class="text-sm text-slate-500">Brak dostępnych punktów orientacyjnych.</p>
</template>
