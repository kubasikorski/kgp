<script setup>
import { RouterView } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
import { usePwaUpdate } from '@/composables/usePwaUpdate'

usePwaUpdate()
</script>

<template>
  <div>
    <RouterView />
    <Toaster position="bottom-center" rich-colors />
  </div>
</template>
