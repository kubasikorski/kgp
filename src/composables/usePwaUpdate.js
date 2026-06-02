import { watch } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { toast } from 'vue-sonner'

/**
 * Watches the service worker for a freshly built version of the app and shows a
 * persistent Sonner toast inviting the user to reload into the new version.
 */
export function usePwaUpdate() {
  const { needRefresh, updateServiceWorker } = useRegisterSW()

  watch(needRefresh, (available) => {
    if (!available) return

    toast('A new version is available', {
      description: 'Reload to get the latest update.',
      duration: Infinity,
      action: {
        label: 'Reload',
        onClick: () => updateServiceWorker(true),
      },
    })
  })

  return { needRefresh, updateServiceWorker }
}
