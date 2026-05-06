<script setup>
defineProps({
  stamps: { type: Array, default: () => [] },
})
</script>

<template>
  <ul v-if="stamps.length" class="flex flex-col gap-3">
    <li
      v-for="(stamp, index) in stamps"
      :key="index"
      class="rounded-lg bg-white p-3 ring-1 ring-slate-200"
    >
      <p class="text-sm text-slate-700">{{ stamp.description }}</p>
    </li>
  </ul>
  <p v-else class="text-sm text-slate-500">
    Brak informacji o miejscach znajdowania się pieczątek.
  </p>
</template>
