import { ref } from 'vue'

/**
 * Shared email/password form state for the auth drawers.
 *
 * @param {(credentials: { email: string, password: string }) => Promise<{ error: string | null, [key: string]: unknown }>} submitAction
 *   Async action to run on submit (e.g. the auth store's signInWithPassword / signUp).
 *   Its resolved object is returned from `submit` so callers can react to success.
 */
export function useAuthForm(submitAction) {
  const email = ref('')
  const password = ref('')
  const loading = ref(false)
  const errorMsg = ref('')
  const infoMsg = ref('')

  const reset = () => {
    email.value = ''
    password.value = ''
    loading.value = false
    errorMsg.value = ''
    infoMsg.value = ''
  }

  const submit = async () => {
    errorMsg.value = ''
    infoMsg.value = ''
    loading.value = true

    const result = (await submitAction({ email: email.value, password: password.value })) ?? {}

    if (result.error) errorMsg.value = result.error
    loading.value = false

    return result
  }

  return { email, password, loading, errorMsg, infoMsg, reset, submit }
}
