import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import rawPeaks from '../data/korona-gor-polski.json'

const STORAGE_KEY = 'kgp:conquered'
const PLANNED_KEY = 'kgp:planned'

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

const loadPlanned = () => {
  try {
    const raw = localStorage.getItem(PLANNED_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* fall through */
  }
  return []
}

export const usePeaksStore = defineStore('peaks', () => {
  const conqueredAt = ref(loadInitial())
  const planned = ref(loadPlanned())

  watch(
    conqueredAt,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  watch(
    planned,
    (value) => {
      localStorage.setItem(PLANNED_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  const isConquered = (name) => Boolean(conqueredAt.value[name])
  const conqueredAtFor = (name) => conqueredAt.value[name] ?? null
  const isPlanned = (name) => planned.value.includes(name)

  const toggle = (name, date) => {
    const next = { ...conqueredAt.value }
    if (next[name]) {
      delete next[name]
    } else {
      const parsed = date ? new Date(date) : new Date()
      next[name] = (Number.isNaN(parsed.getTime()) ? new Date() : parsed).toISOString()
      if (planned.value.includes(name)) {
        planned.value = planned.value.filter((n) => n !== name)
      }
    }
    conqueredAt.value = next
  }

  const togglePlanned = (name) => {
    planned.value = planned.value.includes(name)
      ? planned.value.filter((n) => n !== name)
      : [...planned.value, name]
  }

  return {
    conqueredAt,
    planned,
    isConquered,
    conqueredAtFor,
    isPlanned,
    toggle,
    togglePlanned,
  }
})
