<script setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'

const props = defineProps({
  gpx: { type: Object, default: null },
})

const gpxUrls = import.meta.glob('@/data/gpx/**/*.gpx', {
  eager: true,
  query: '?url',
  import: 'default',
})

const canvasEl = useTemplateRef('canvasEl')
const wrapperEl = useTemplateRef('wrapperEl')
const stats = ref(null)

let points = []
let resizeObserver = null
let fetchToken = 0

const haversine = (a, b) => {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

const parseGpx = (xmlText) => {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml')
  const trkpts = Array.from(doc.getElementsByTagName('trkpt'))
  const source = trkpts.length ? trkpts : Array.from(doc.getElementsByTagName('rtept'))
  return source
    .map((p) => {
      const lat = parseFloat(p.getAttribute('lat'))
      const lon = parseFloat(p.getAttribute('lon'))
      const eleNode = p.getElementsByTagName('ele')[0]
      const ele = eleNode ? parseFloat(eleNode.textContent) : NaN
      return { lat, lon, ele }
    })
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon) && Number.isFinite(p.ele))
}

const buildSeries = (parsed) => {
  let cumulative = 0
  let gain = 0
  let loss = 0
  let minEle = Infinity
  let maxEle = -Infinity
  const series = []
  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i]
    if (i > 0) {
      cumulative += haversine(
        [parsed[i - 1].lat, parsed[i - 1].lon],
        [p.lat, p.lon],
      )
      const diff = p.ele - parsed[i - 1].ele
      if (diff > 0) gain += diff
      else loss -= diff
    }
    minEle = Math.min(minEle, p.ele)
    maxEle = Math.max(maxEle, p.ele)
    series.push({ dist: cumulative, ele: p.ele })
  }
  return { series, totalDist: cumulative, gain, loss, minEle, maxEle }
}

const draw = () => {
  const canvas = canvasEl.value
  const wrapper = wrapperEl.value
  if (!canvas || !wrapper || !points.length) return

  const dpr = window.devicePixelRatio || 1
  const cssWidth = wrapper.clientWidth
  const cssHeight = 180
  canvas.width = Math.max(1, Math.floor(cssWidth * dpr))
  canvas.height = Math.max(1, Math.floor(cssHeight * dpr))
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`

  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssWidth, cssHeight)

  const padLeft = 38
  const padRight = 8
  const padTop = 10
  const padBottom = 22
  const plotW = cssWidth - padLeft - padRight
  const plotH = cssHeight - padTop - padBottom

  const totalDist = points[points.length - 1].dist || 1
  let minEle = Infinity
  let maxEle = -Infinity
  for (const p of points) {
    if (p.ele < minEle) minEle = p.ele
    if (p.ele > maxEle) maxEle = p.ele
  }
  if (minEle === maxEle) {
    minEle -= 1
    maxEle += 1
  }
  const eleRange = maxEle - minEle
  const yPad = eleRange * 0.1
  const yMin = minEle - yPad
  const yMax = maxEle + yPad

  const xAt = (d) => padLeft + (d / totalDist) * plotW
  const yAt = (e) => padTop + plotH - ((e - yMin) / (yMax - yMin)) * plotH

  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.font = '10px ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'right'
  const yTicks = 4
  for (let i = 0; i <= yTicks; i++) {
    const t = i / yTicks
    const y = padTop + plotH * t
    const ele = yMax - t * (yMax - yMin)
    ctx.beginPath()
    ctx.moveTo(padLeft, y)
    ctx.lineTo(padLeft + plotW, y)
    ctx.stroke()
    ctx.fillText(`${Math.round(ele)}`, padLeft - 4, y)
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const xTicks = 4
  for (let i = 0; i <= xTicks; i++) {
    const t = i / xTicks
    const x = padLeft + plotW * t
    const distKm = (totalDist * t) / 1000
    ctx.fillText(`${distKm.toFixed(1)}`, x, padTop + plotH + 6)
  }

  ctx.beginPath()
  ctx.moveTo(xAt(points[0].dist), yAt(points[0].ele))
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(xAt(points[i].dist), yAt(points[i].ele))
  }
  ctx.lineTo(xAt(points[points.length - 1].dist), padTop + plotH)
  ctx.lineTo(xAt(points[0].dist), padTop + plotH)
  ctx.closePath()
  const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + plotH)
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)')
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)')
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(xAt(points[0].dist), yAt(points[0].ele))
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(xAt(points[i].dist), yAt(points[i].ele))
  }
  ctx.strokeStyle = '#059669'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

const load = async (gpx) => {
  const token = ++fetchToken
  points = []
  stats.value = null
  if (!gpx?.url) {
    draw()
    return
  }
  const resolved = gpxUrls[gpx.url] ?? gpx.url
  const res = await fetch(resolved)
  if (!res.ok || token !== fetchToken) return
  const parsed = parseGpx(await res.text())
  if (token !== fetchToken) return
  if (parsed.length < 2) {
    draw()
    return
  }
  const built = buildSeries(parsed)
  points = built.series
  stats.value = {
    distKm: built.totalDist / 1000,
    gain: Math.round(built.gain),
    loss: Math.round(built.loss),
    minEle: Math.round(built.minEle),
    maxEle: Math.round(built.maxEle),
  }
  draw()
}

onMounted(() => {
  resizeObserver = new ResizeObserver(() => draw())
  if (wrapperEl.value) resizeObserver.observe(wrapperEl.value)
  load(props.gpx)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  fetchToken++
})

watch(() => props.gpx?.url, () => load(props.gpx))
</script>

<template>
  <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold text-slate-900">Profil wysokości</h4>
      <dl v-if="stats" class="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
        <div class="flex gap-1">
          <dt>↑</dt>
          <dd class="text-emerald-700">{{ stats.gain }} m</dd>
        </div>
        <div class="flex gap-1">
          <dt>↓</dt>
          <dd class="text-rose-700">{{ stats.loss }} m</dd>
        </div>
        <div class="flex gap-1">
          <dt>max</dt>
          <dd class="text-slate-700">{{ stats.maxEle }} m</dd>
        </div>
      </dl>
    </div>
    <div ref="wrapperEl" class="mt-3 w-full">
      <canvas ref="canvasEl"></canvas>
    </div>
  </div>
</template>