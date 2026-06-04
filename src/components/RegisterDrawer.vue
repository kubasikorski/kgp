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
const { email, password, loading, errorMsg, infoMsg, reset, submit } = useAuthForm(auth.signUp)

const onSubmit = async () => {
  const { error, needsConfirmation } = await submit()
  if (error) return
  if (needsConfirmation) {
    infoMsg.value = 'Sprawdź skrzynkę e-mail, aby potwierdzić konto.'
  } else {
    open.value = false
  }
}

watch(open, (isOpen) => {
  if (!isOpen) reset()
})
</script>

<template>
  <ResponsiveModal v-model:open="open" title="Utwórz konto">
    <form class="grid gap-4" @submit.prevent="onSubmit">
      <div class="grid gap-2">
        <Label for="register-email">E-mail</Label>
        <Input
          id="register-email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="ty@example.com"
          required
        />
      </div>

      <div class="grid gap-2">
        <Label for="register-password">Hasło</Label>
        <Input
          id="register-password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          placeholder="••••••••"
          required
        />
      </div>

      <p v-if="errorMsg" class="text-destructive text-sm">{{ errorMsg }}</p>
      <p v-if="infoMsg" class="text-emerald-600 text-sm">{{ infoMsg }}</p>

      <Button type="submit" :disabled="loading" class="w-full">
        {{ loading ? 'Proszę czekać…' : 'Zarejestruj się' }}
      </Button>

      <p class="text-muted-foreground text-center text-sm">
        Masz już konto?
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
