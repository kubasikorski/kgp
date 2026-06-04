import { useRegisterSW } from 'virtual:pwa-register/vue'

/**
 * Registers the service worker. With `registerType: 'autoUpdate'` the plugin
 * silently installs new versions and reloads the app in the background, so no
 * user prompt is needed.
 */
export function usePwaUpdate() {
  useRegisterSW({ immediate: true })
}
