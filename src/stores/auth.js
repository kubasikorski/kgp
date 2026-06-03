import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '@/utils/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const initialized = ref(false)

  const user = computed(() => session.value?.user ?? null)
  const isLoggedIn = computed(() => !!session.value)

  // Load the current session and keep it in sync with Supabase auth events.
  async function init() {
    if (initialized.value) return
    initialized.value = true

    const { data } = await supabase.auth.getSession()
    session.value = data.session

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
    })
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    // onAuthStateChange clears the session too, but do it eagerly for responsiveness.
    session.value = null
    return error
  }

  return { session, user, isLoggedIn, init, signOut }
})
