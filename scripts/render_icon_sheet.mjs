// Render the EC-R02 icon sheet + rail tier fixtures as SVG from the SHIPPED
// registry in desktop/plugin.js (no hand-drawn duplicates). Fixture evidence
// only: neutral surfaces here are test chrome, not a product palette; live-host
// rendered acceptance remains a separate gate (SPECIFICATION.md §17.2).
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const source = await readFile(`${root}desktop/plugin.js`, 'utf8')
const start = source.indexOf('/* ICON_FAMILY_START */'), end = source.indexOf('/* ICON_FAMILY_END */')
if (start < 0 || end < 0) throw new Error('icon family markers missing')
const { COMPOSER_ICONS, COMPOSER_ICON_IDS } = new Function(`${source.slice(start, end)};return {COMPOSER_ICONS,COMPOSER_ICON_IDS}`)()

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function iconSvg(id, x, y, size, fg) {
  const entry = COMPOSER_ICONS[id]
  const scale = size / 24
  const paths = entry.paths.map(d => `<path d="${d}"/>`).join('')
  const attrs = entry.fill
    ? `fill="${fg}" stroke="none"`
    : `fill="none" stroke="${fg}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"`
  return `<g transform="translate(${x},${y}) scale(${scale})" ${attrs}>${paths}</g>`
}
const THEMES = [['light', '#ffffff', '#1c1e21', '#f2f3f5'], ['dark', '#14161a', '#e7e9ec', '#1d2025']]
const cellW = 64, cellH = 62, cols = 12
let sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cellW + 40}" height="${THEMES.length * (Math.ceil(36 / cols) * cellH + 150) + 190}" font-family="system-ui,sans-serif">`
sheet += `<rect width="100%" height="100%" fill="#fafafa"/>`
sheet += `<text x="20" y="28" font-size="15" font-weight="600" fill="#1c1e21">Enchanted Composer — icon family sheet (EC-R02 fixture)</text>`
sheet += `<text x="20" y="46" font-size="10" fill="#5c6166">Rendered from the shipped registry: viewBox 24, stroke 1.75 round, currentColor. Neutral fixture surfaces only — Hermes theme wins in the product. Not live-host acceptance.</text>`
let oy = 62
for (const [name, bg, fg, chip] of THEMES) {
  const rows = Math.ceil(36 / cols)
  sheet += `<rect x="16" y="${oy}" width="${cols * cellW + 8}" height="${rows * cellH + 96}" rx="8" fill="${bg}"/>`
  sheet += `<text x="24" y="${oy + 18}" font-size="11" font-weight="600" fill="${fg}">${name} surface — 16 px and 20 px glyphs</text>`
  COMPOSER_ICON_IDS.forEach((id, i) => {
    const cx = 24 + (i % cols) * cellW, cy = oy + 30 + Math.floor(i / cols) * cellH
    sheet += iconSvg(id, cx + 6, cy + 2, 16, fg)
    sheet += iconSvg(id, cx + 32, cy, 20, fg)
    sheet += `<text x="${cx}" y="${cy + 34}" font-size="8" fill="${fg}">${id}</text>`
    sheet += `<text x="${cx}" y="${cy + 44}" font-size="7" fill="${fg}" opacity="0.72">${esc(COMPOSER_ICONS[id].name)}</text>`
  })
  const ty = oy + 30 + rows * cellH + 8
  sheet += `<text x="24" y="${ty + 10}" font-size="10" fill="${fg}">Button targets: 28 / 36 / 44 px (Improve glyph, tooltip label)</text>`
  let tx = 24
  for (const t of [28, 36, 44]) {
    sheet += `<rect x="${tx}" y="${ty + 18}" width="${t}" height="${t}" rx="6" fill="${chip}"/>`
    sheet += iconSvg('I02', tx + (t - 16) / 2, ty + 18 + (t - 16) / 2, 16, fg)
    sheet += `<text x="${tx}" y="${ty + 18 + t + 12}" font-size="8" fill="${fg}">${t}px · Improve</text>`
    tx += t + 46
  }
  oy += rows * cellH + 112
}
sheet += '</svg>'
await mkdir(`${root}docs/plans/composer-redesign/evidence/EC-R02`, { recursive: true })
await writeFile(`${root}docs/plans/composer-redesign/evidence/EC-R02/icon-sheet.svg`, sheet)

// Rail tier fixtures (geometry only; labels name real actions).
const fgL = '#1c1e21', bgL = '#ffffff', chipL = '#f2f3f5'
function railRow(y, label, keys, width) {
  let out = `<text x="20" y="${y - 8}" font-size="10" fill="#5c6166">${esc(label)} — container ${width}px</text>`
  out += `<rect x="20" y="${y}" width="${width}" height="40" rx="8" fill="${bgL}" stroke="#d7dade"/>`
  let x = 28
  for (const k of keys) {
    if (k === 'improve') {
      out += `<rect x="${x}" y="${y + 6}" width="86" height="28" rx="6" fill="${chipL}"/>`
      out += iconSvg('I02', x + 8, y + 12, 16, fgL)
      out += `<text x="${x + 28}" y="${y + 24}" font-size="11" fill="${fgL}">Improve</text>`
      out += `<text x="${x + 72}" y="${y + 24}" font-size="9" fill="${fgL}">▾</text>`
      x += 94
    } else if (k === 'capsule') {
      out += `<rect x="${x}" y="${y + 6}" width="150" height="28" rx="6" fill="${chipL}"/>`
      out += `<text x="${x + 8}" y="${y + 24}" font-size="10" fill="${fgL}">Listening · 01:24</text>`
      out += iconSvg('I05', x + 92, y + 12, 16, fgL)
      out += `<text x="${x + 112}" y="${y + 24}" font-size="10" fill="${fgL}">End</text>`
      x += 158
    } else {
      const icons = { library: 'I03', compose: 'I01', voice: 'I04', more: 'I28' }
      out += `<rect x="${x}" y="${y + 6}" width="28" height="28" rx="6" fill="transparent"/>`
      out += iconSvg(icons[k], x + 6, y + 12, 16, fgL)
      x += 32
    }
  }
  return out
}
let rail = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="330" font-family="system-ui,sans-serif"><rect width="100%" height="100%" fill="#fafafa"/>`
rail += `<text x="20" y="24" font-size="13" font-weight="600" fill="#1c1e21">Rail overflow tiers (EC-R02 geometry fixture)</text>`
rail += `<text x="20" y="40" font-size="9" fill="#5c6166">Fixture only — active voice row is a labelled visual fixture, not a live call. Host send/model/attachment controls are untouched and not shown.</text>`
rail += railRow(66, 'Tier 0 · wide', ['library', 'compose', 'improve', 'voice', 'more'], 380)
rail += railRow(136, 'Tier 1 · narrow (Library in More)', ['compose', 'improve', 'voice', 'more'], 240)
rail += railRow(206, 'Tier 2 · tight (Improve + More)', ['improve', 'more'], 170)
rail += railRow(276, 'Tier 2 · active voice keeps Mute/End', ['improve', 'capsule', 'more'], 300)
rail += '</svg>'
await writeFile(`${root}docs/plans/composer-redesign/evidence/EC-R02/rail-tiers.svg`, rail)
console.log('evidence written: icon-sheet.svg, rail-tiers.svg')
