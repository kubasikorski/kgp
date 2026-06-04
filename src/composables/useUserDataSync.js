import { nextTick, ref, watch } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/stores/auth'
import { usePeaksStore } from '@/stores/peaks'

const TABLE = 'user_data'
const PUSH_DEBOUNCE_MS = 800

// Shared across the app: true while a save (upsert) to Supabase is in flight.
const saving = ref(false)

/** Read-only access to the sync status from any component. */
export function useSyncStatus() {
  return { saving }
}

/**
 * Keeps the peaks store (conquered / planned) in sync with the user's row in
 * Supabase `user_data` while logged in:
 *  - on login: pull the remote row and replace local data; if no row exists yet,
 *    seed it from the current local data.
 *  - on change: debounced upsert of conquered / planned back to Supabase.
 *
 * Call once from a component setup (e.g. App.vue).
 */
export function useUserDataSync() {
  const auth = useAuthStore()
  const peaks = usePeaksStore()

  // Prevents an outgoing push while we are applying an incoming pull.
  let suppress = false
  let pushTimer = null

  const push = async () => {
    if (!auth.isLoggedIn) return
    saving.value = true
    try {
      const { error } = await supabase.from(TABLE).upsert(
        {
          user_uid: auth.user.id,
          conquered: peaks.conqueredAt,
          planned: peaks.planned,
        },
        { onConflict: 'user_uid' },
      )
      if (error) console.error('[user-data-sync] push failed:', error.message)
    } finally {
      saving.value = false
    }
  }

  const schedulePush = () => {
    if (!auth.isLoggedIn || suppress) return
    clearTimeout(pushTimer)
    pushTimer = setTimeout(push, PUSH_DEBOUNCE_MS)
  }


  const pull = async () => {
    if (!auth.isLoggedIn) return
    const { data, error } = await supabase
      .from(TABLE)
      .select('conquered, planned')
      .eq('user_uid', auth.user.id)
      .maybeSingle()

    if (error) {
      console.error('[user-data-sync] pull failed:', error.message)
      return
    }

    if (data) {
      // Remote wins: replace local data (the peaks store persists to localStorage).
      suppress = true
      peaks.importData({ conquered: data.conquered, planned: data.planned })
      await nextTick()
      suppress = false
    } else {
      // First login for this user: seed the remote row from local data.
      await push()
    }
  }

  // Pull whenever the user becomes logged in (also covers the initial session restore).
  watch(() => auth.isLoggedIn, (loggedIn) => loggedIn && pull(), { immediate: true })

  // Push local changes upward (debounced) while logged in.
  watch(() => [peaks.conqueredAt, peaks.planned], schedulePush, { deep: true })
}
