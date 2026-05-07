<script setup>
defineProps({
  stamps: { type: Array, default: () => [] },
})

const COLOR_CLASSES = {
  red: 'bg-red-50 ring-red-200',
}

const stampClass = (stamp) =>
  COLOR_CLASSES[stamp.color] ?? 'bg-white ring-slate-200'

const stampTextClass = (stamp) =>
  stamp.color === 'red' ? 'text-red-800' : 'text-slate-700'
</script>

<template>
  <ul v-if="stamps.length" class="flex flex-col gap-3">
    <li
      v-for="(stamp, index) in stamps"
      :key="index"
      :class="['rounded-lg p-3 ring-1', stampClass(stamp)]"
    >
      <div class="flex items-start gap-2">
        <svg
          v-if="stamp.type === 'summit'"
          viewBox="0 0 24 24"
          aria-hidden="true"
          :class="['mt-0.5 h-4 w-4 shrink-0', stampTextClass(stamp)]"
          fill="currentColor"
        >
          <path d="M14 6l4 7 2-3 4 10H0l7-13 4 7z" />
        </svg>
        <p :class="['text-sm', stampTextClass(stamp)]">{{ stamp.description }}</p>
      </div>
    </li>
  </ul>
  <p v-else class="text-sm text-slate-500">
    Brak informacji o miejscach znajdowania się pieczątek.
  </p>
</template>
