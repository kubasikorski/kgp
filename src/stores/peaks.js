import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import rawPeaks from '../data/korona-gor-polski.json'

const STORAGE_KEY = 'kgp:conquered'

const parseSeedDate = (value) => {
  if (!value) return new Date().toISOString()
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value)
  if (match) {
    const [, d, m, y] = match
    return new Date(`${y}-${m}-${d}T00:00:00`).toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

const seedFromJson = () => {
  const initial = {}
  for (const peak of rawPeaks) {
    if (peak.conquered) initial[peak.name] = parseSeedDate(peak.conqueredAt)
  }
  return initial
}

const loadInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* fall back to seed */
  }
  return seedFromJson()
}

export const usePeaksStore = defineStore('peaks', () => {
  const conqueredAt = ref(loadInitial())

  watch(
    conqueredAt,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  const isConquered = (name) => Boolean(conqueredAt.value[name])
  const conqueredAtFor = (name) => conqueredAt.value[name] ?? null

  const toggle = (name, date) => {
    const next = { ...conqueredAt.value }
    if (next[name]) {
      delete next[name]
    } else {
      const parsed = date ? new Date(date) : new Date()
      next[name] = (Number.isNaN(parsed.getTime()) ? new Date() : parsed).toISOString()
    }
    conqueredAt.value = next
  }

  return { conqueredAt, isConquered, conqueredAtFor, toggle }
})
