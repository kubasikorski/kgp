<script setup>
import { watch } from 'vue'
import ResponsiveModal from './ResponsiveModal.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'
import { useAuthForm } from '@/composables/useAuthForm'

const open = defineModel('open', { type: Boolean, default: false })
const emit = defineEmits(['switch'])

const auth = useAuthStore()
const { email, loading, errorMsg, infoMsg, reset, submit } = useAuthForm(auth.resetPasswordForEmail)

const onSubmit = async () => {
  const { error } = await submit()
  if (error) return
  // Don't reveal whether the address has an account.
  infoMsg.value = 'Jeśli konto istnieje, wysłaliśmy link do zresetowania hasła na podany adres.'
}

watch(open, (isOpen) => {
  if (!isOpen) reset()
})
</script>

<template>
  <ResponsiveModal v-model:open="open" title="Resetuj hasło">
    <form class="grid gap-4" @submit.prevent="onSubmit">
      <div class="grid gap-2">
        <Label for="forgot-email">E-mail</Label>
        <Input
          id="forgot-email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="ty@example.com"
          required
        />
      </div>

      <p v-if="errorMsg" class="text-destructive text-sm">{{ errorMsg }}</p>
      <p v-if="infoMsg" class="text-emerald-600 text-sm">{{ infoMsg }}</p>

      <Button type="submit" :disabled="loading" class="w-full">
        {{ loading ? 'Proszę czekać…' : 'Wyślij link resetujący' }}
      </Button>

      <p class="text-muted-foreground text-center text-sm">
        Pamiętasz hasło?
        <button
          type="button"
          class="text-primary font-medium underline-offset-4 hover:underline"
          @click="emit('switch')"
        >
          Zaloguj się
        </button>
      </p>
    </form>
  </ResponsiveModal>
</template>
