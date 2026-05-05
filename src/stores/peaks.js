import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import rawPeaks from '../data/korona-gor-polski.json'

const STORAGE_KEY = 'kgp:conquered'
const PLANNED_KEY = 'kgp:planned'

const slugByName = new Map(rawPeaks.map((p) => [p.name, p.slug]))
const validSlugs = new Set(rawPeaks.map((p) => p.slug))

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
    if (peak.conquered) initial[peak.slug] = parseSeedDate(peak.conqueredAt)
  }
  return initial
}

// Migrate legacy entries keyed by name → slug. Unknown keys are dropped.
const normalizeConquered = (raw) => {
  const out = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [key, iso] of Object.entries(raw)) {
    if (typeof iso !== 'string') continue
    const slug = validSlugs.has(key) ? key : slugByName.get(key)
    if (slug) out[slug] = iso
  }
  return out
}

const normalizePlanned = (raw) => {
  if (!Array.isArray(raw)) return []
  const out = new Set()
  for (const key of raw) {
    if (typeof key !== 'string') continue
    const slug = validSlugs.has(key) ? key : slugByName.get(key)
    if (slug) out.add(slug)
  }
  return [...out]
}

const loadConquered = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizeConquered(JSON.parse(raw))
  } catch {
    /* fall back to seed */
  }
  return seedFromJson()
}

const loadPlanned = () => {
  try {
    const raw = localStorage.getItem(PLANNED_KEY)
    if (raw) return normalizePlanned(JSON.parse(raw))
  } catch {
    /* fall through */
  }
  return []
}

export const usePeaksStore = defineStore('peaks', () => {
  const conqueredAt = ref(loadConquered())
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

  const isConquered = (slug) => Boolean(conqueredAt.value[slug])
  const conqueredAtFor = (slug) => conqueredAt.value[slug] ?? null
  const isPlanned = (slug) => planned.value.includes(slug)

  const toggle = (slug, date) => {
    const next = { ...conqueredAt.value }
    if (next[slug]) {
      delete next[slug]
    } else {
      const parsed = date ? new Date(date) : new Date()
      next[slug] = (Number.isNaN(parsed.getTime()) ? new Date() : parsed).toISOString()
      if (planned.value.includes(slug)) {
        planned.value = planned.value.filter((s) => s !== slug)
      }
    }
    conqueredAt.value = next
  }

  const togglePlanned = (slug) => {
    planned.value = planned.value.includes(slug)
      ? planned.value.filter((s) => s !== slug)
      : [...planned.value, slug]
  }

  const exportData = () => ({
    version: 1,
    exportedAt: new Date().toISOString(),
    conquered: conqueredAt.value,
    planned: planned.value,
  })

  const importData = (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Niepoprawny plik')
    }
    conqueredAt.value = normalizeConquered(data.conquered)
    planned.value = normalizePlanned(data.planned)
  }

  return {
    conqueredAt,
    planned,
    isConquered,
    conqueredAtFor,
    isPlanned,
    toggle,
    togglePlanned,
    exportData,
    importData,
  }
})
