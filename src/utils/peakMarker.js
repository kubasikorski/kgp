import L from 'leaflet'

const PIN_GRADIENTS = {
  pending: ['#F87171', '#7F1D1D'],
  conquered: ['#45D1BB', '#0E6E6F'],
  planned: ['#FBBF24', '#92400E'],
}

export const peakState = (peak) => {
  if (peak.conquered) return 'conquered'
  if (peak.planned) return 'planned'
  return 'pending'
}

const peakSvg = (state) => {
  const [from, to] = PIN_GRADIENTS[state]
  const id = `fassPin-${state}`
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Peak">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"></stop>
      <stop offset="100%" stop-color="${to}"></stop>
    </linearGradient>
  </defs>
  <path d="M32 60 L17 33.5 A18 18 0 1 1 47 33.5 Z" fill="url(#${id})"></path>
  <path d="M20 30 L25 23 L28 26 L33 15 L39 23 L42 20 L44 30 Z" fill="#FFFFFF"></path>
</svg>`
}

export const peakIcon = (peak) =>
  L.divIcon({
    className: 'peak-marker',
    html: `<span class="peak-pin">${peakSvg(peakState(peak))}</span>`,
    iconSize: [92, 52],
    iconAnchor: [26, 52],
    popupAnchor: [0, -48],
  })
