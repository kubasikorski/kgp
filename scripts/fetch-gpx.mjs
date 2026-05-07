import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const JSON_PATH = join(ROOT, 'src/data/korona-gor-polski.json')

const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'))

const tasks = []
for (const peak of data) {
  if (!Array.isArray(peak.gpx)) continue
  for (const entry of peak.gpx) {
    if (!entry.mapaUrl || !entry.url) continue
    tasks.push({ peak: peak.slug, mapaUrl: entry.mapaUrl, url: entry.url })
  }
}

console.log(`Found ${tasks.length} gpx entries`)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let fetched = 0
let skipped = 0
let failed = 0

for (const task of tasks) {
  const localPath = join(ROOT, task.url.replace(/^\//, ''))
  if (existsSync(localPath)) {
    skipped++
    continue
  }
  const remote = `${task.mapaUrl}.gpx`
  try {
    const res = await fetch(remote, {
      headers: { 'User-Agent': 'kgp-gpx-fetcher/1.0' },
      redirect: 'follow',
    })
    if (!res.ok) {
      console.warn(`✗ ${task.peak} ${task.mapaUrl} → ${res.status}`)
      failed++
      continue
    }
    const body = await res.text()
    if (!body.trim().startsWith('<?xml') && !body.includes('<gpx')) {
      console.warn(`✗ ${task.peak} ${task.mapaUrl} → not gpx`)
      failed++
      continue
    }
    mkdirSync(dirname(localPath), { recursive: true })
    writeFileSync(localPath, body)
    fetched++
    console.log(`✓ ${task.peak} → ${task.url}`)
    await sleep(400)
  } catch (err) {
    console.warn(`✗ ${task.peak} ${task.mapaUrl} → ${err.message}`)
    failed++
  }
}

console.log(`\nDone: ${fetched} fetched, ${skipped} skipped, ${failed} failed`)
