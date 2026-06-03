import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Reactive media query. Returns a ref that is `true` while the query matches.
 * @param {string} query e.g. '(min-width: 768px)'
 */
export function useMediaQuery(query) {
  const matches = ref(false)
  let mql = null

  const update = (event) => {
    matches.value = event.matches
  }

  onMounted(() => {
    mql = window.matchMedia(query)
    matches.value = mql.matches
    mql.addEventListener('change', update)
  })

  onBeforeUnmount(() => {
    mql?.removeEventListener('change', update)
  })

  return matches
}
