<script setup>
import { ref, watch } from 'vue'
import ResponsiveModal from './ResponsiveModal.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/utils/supabase'

const open = defineModel('open', { type: Boolean, default: false })

const mode = ref('signin') // 'signin' | 'signup'
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const infoMsg = ref('')

const titles = {
  signin: 'Zaloguj się',
  signup: 'Utwórz konto',
}

const resetMessages = () => {
  errorMsg.value = ''
  infoMsg.value = ''
}

const toggleMode = () => {
  mode.value = mode.value === 'signin' ? 'signup' : 'signin'
  resetMessages()
}

const onSubmit = async () => {
  resetMessages()
  loading.value = true

  const credentials = { email: email.value, password: password.value }

  if (mode.value === 'signin') {
    const { error } = await supabase.auth.signInWithPassword(credentials)
    if (error) {
      errorMsg.value = error.message
    } else {
      open.value = false
    }
  } else {
    const { data, error } = await supabase.auth.signUp(credentials)
    if (error) {
      errorMsg.value = error.message
    } else if (data.session) {
      // Email confirmation disabled — session is available immediately.
      open.value = false
    } else {
      // Email confirmation enabled — no session until the user confirms.
      infoMsg.value = 'Sprawdź skrzynkę e-mail, aby potwierdzić konto.'
    }
  }

  loading.value = false
}

// Clear the form whenever the modal is closed.
watch(open, (isOpen) => {
  if (!isOpen) {
    email.value = ''
    password.value = ''
    loading.value = false
    mode.value = 'signin'
    resetMessages()
  }
})
</script>

<template>
  <ResponsiveModal v-model:open="open" :title="titles[mode]">
    <form class="grid gap-4" @submit.prevent="onSubmit">
      <div class="grid gap-2">
        <Label for="login-email">E-mail</Label>
        <Input
          id="login-email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="ty@example.com"
          required
        />
      </div>

      <div class="grid gap-2">
        <Label for="login-password">Hasło</Label>
        <Input
          id="login-password"
          v-model="password"
          type="password"
          :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"
          placeholder="••••••••"
          required
        />
      </div>

      <p v-if="errorMsg" class="text-destructive text-sm">{{ errorMsg }}</p>
      <p v-if="infoMsg" class="text-emerald-600 text-sm">{{ infoMsg }}</p>

      <Button type="submit" :disabled="loading" class="w-full">
        {{ loading ? 'Proszę czekać…' : mode === 'signin' ? 'Zaloguj się' : 'Zarejestruj się' }}
      </Button>

      <p class="text-muted-foreground text-center text-sm">
        {{ mode === 'signin' ? 'Nie masz konta?' : 'Masz już konto?' }}
        <button
          type="button"
          class="text-primary font-medium underline-offset-4 hover:underline"
          @click="toggleMode"
        >
          {{ mode === 'signin' ? 'Zarejestruj się' : 'Zaloguj się' }}
        </button>
      </p>
    </form>
  </ResponsiveModal>
</template>
