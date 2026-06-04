<script setup>
import { RouterView } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
import { usePwaUpdate } from '@/composables/usePwaUpdate'
import { useUserDataSync } from '@/composables/useUserDataSync'

usePwaUpdate()
useUserDataSync()
</script>

<template>
  <div>
    <RouterView />
    <Toaster position="bottom-center" rich-colors />
  </div>
</template>
