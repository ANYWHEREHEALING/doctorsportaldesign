"use client"

// Small dependency-free SVG charts. They scale to their container's width
// (viewBox) and print cleanly. Hovering a point shows its value.

import { shortDay } from "@/app/libs/format"
import { useI18n } from "@/app/libs/i18n"

type Value = number | null | undefined

export interface Series {
  name: string
  color: string
  values: Value[]
}

const W = 640
const PAD = { top: 12, right: 12, bottom: 26, left: 40 }

function niceRange(values: number[], minFloor?: number): [number, number] {
  if (!values.length) return [0, 1]
  let lo = Math.min(...values)
  let hi = Math.max(...values)
  if (minFloor !== undefined) lo = Math.min(lo, minFloor)
  if (lo === hi) { lo -= 1; hi += 1 }
  const pad = (hi - lo) * 0.12
  lo = Math.max(minFloor ?? -Infinity, lo - pad)
  hi = hi + pad
  return [Math.floor(lo), Math.ceil(hi)]
}

function xLabels(labels: string[]) {
  const step = Math.max(1, Math.ceil(labels.length / 7))
  return labels.map((l, i) => (i % step === 0 || i === labels.length - 1 ? shortDay(l) : ""))
}

function Legend({ series }: { series: Series[] }) {
  const { t } = useI18n()
  if (series.length < 2) return null
  return (
    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
      {series.map((s) => (
        <span key={s.name} className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: s.color }} />
          {t(s.name)}
        </span>
      ))}
    </div>
  )
}

export interface Marker { date: string; label: string }

/** Dashed vertical lines for the practitioner's notes (hover shows the note). */
function Markers({ markers, labels, x, top, bottom }: {
  markers?: Marker[]; labels: string[]; x: (i: number) => number; top: number; bottom: number
}) {
  if (!markers || !markers.length) return null
  const byIndex = new Map<number, string[]>()
  for (const m of markers) {
    const i = labels.indexOf(m.date)
    if (i < 0) continue
    byIndex.set(i, [...(byIndex.get(i) || []), m.label])
  }
  return (
    <g>
      {[...byIndex.entries()].map(([i, notes]) => (
        <g key={i}>
          <line x1={x(i)} x2={x(i)} y1={top} y2={bottom} stroke="#8BA872" strokeDasharray="2 3" strokeWidth={1.2} />
          <circle cx={x(i)} cy={top + 3} r={4} fill="#8BA872">
            <title>{`${shortDay(labels[i])} · ${notes.join(" / ")}`}</title>
          </circle>
        </g>
      ))}
    </g>
  )
}

function Empty({ height }: { height: number }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>
      {t("No readings in this period")}
    </div>
  )
}

/** One or more lines over days. Missing days leave a gap. */
export function LineChart({
  labels, series, unit = "", height = 200, format = (v: number) => `${Math.round(v)}`, markers,
}: {
  labels: string[]; series: Series[]; unit?: string; height?: number; format?: (v: number) => string; markers?: Marker[]
}) {
  const { t } = useI18n()
  const all = series.flatMap((s) => s.values.filter((v): v is number => typeof v === "number" && isFinite(v)))
  if (!all.length) return <Empty height={height} />
  const [lo, hi] = niceRange(all)
  const H = height
  const iw = W - PAD.left - PAD.right
  const ih = H - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (labels.length <= 1 ? iw / 2 : (i / (labels.length - 1)) * iw)
  const y = (v: number) => PAD.top + ih - ((v - lo) / (hi - lo)) * ih
  const ticks = [lo, (lo + hi) / 2, hi]
  const xl = xLabels(labels)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
        {ticks.map((tk, i) => (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(tk)} y2={y(tk)} className="stroke-gray-200 dark:stroke-gray-700" strokeDasharray="3 4" />
            <text x={PAD.left - 6} y={y(tk) + 4} textAnchor="end" className="fill-gray-400 text-[11px]">{format(tk)}</text>
          </g>
        ))}
        {xl.map((l, i) => l && (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-gray-400 text-[11px]">{l}</text>
        ))}
        <Markers markers={markers} labels={labels} x={x} top={PAD.top} bottom={H - PAD.bottom} />
        {series.map((s) => {
          // Split into segments at missing values.
          const segs: Array<Array<[number, number]>> = []
          let cur: Array<[number, number]> = []
          s.values.forEach((v, i) => {
            if (typeof v === "number" && isFinite(v)) cur.push([x(i), y(v)])
            else if (cur.length) { segs.push(cur); cur = [] }
          })
          if (cur.length) segs.push(cur)
          return (
            <g key={s.name}>
              {segs.map((seg, k) => (
                <polyline key={k} points={seg.map((p) => p.join(",")).join(" ")} fill="none" stroke={s.color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
              ))}
              {s.values.map((v, i) => typeof v === "number" && isFinite(v) ? (
                <circle key={i} cx={x(i)} cy={y(v)} r={3} fill={s.color}>
                  <title>{`${shortDay(labels[i])} · ${t(s.name)}: ${format(v)}${unit ? " " + unit : ""}`}</title>
                </circle>
              ) : null)}
            </g>
          )
        })}
      </svg>
      <Legend series={series} />
    </div>
  )
}

/** Stacked bars per day (sleep stages). */
export function StackedBars({
  labels, stacks, height = 220, format = (v: number) => `${Math.round(v)}`, markers,
}: {
  labels: string[]; stacks: Series[]; height?: number; format?: (v: number) => string; markers?: Marker[]
}) {
  const { t } = useI18n()
  const totals = labels.map((_, i) => stacks.reduce((a, s) => a + (Number(s.values[i]) || 0), 0))
  if (!totals.some((v) => v > 0)) return <Empty height={height} />
  const hi = Math.max(...totals) * 1.1
  const H = height
  const iw = W - PAD.left - PAD.right
  const ih = H - PAD.top - PAD.bottom
  const slot = iw / labels.length
  const bw = Math.max(3, Math.min(28, slot * 0.62))
  const y = (v: number) => PAD.top + ih - (v / hi) * ih
  const ticks = [0, hi / 2, hi]
  const xl = xLabels(labels)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
        {ticks.map((tk, i) => (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(tk)} y2={y(tk)} className="stroke-gray-200 dark:stroke-gray-700" strokeDasharray="3 4" />
            <text x={PAD.left - 6} y={y(tk) + 4} textAnchor="end" className="fill-gray-400 text-[11px]">{format(tk)}</text>
          </g>
        ))}
        <Markers markers={markers} labels={labels} x={(i) => PAD.left + slot * i + slot / 2} top={PAD.top} bottom={H - PAD.bottom} />
        {labels.map((l, i) => {
          let acc = 0
          const cx = PAD.left + slot * i + slot / 2
          return (
            <g key={l}>
              {stacks.map((s) => {
                const v = Number(s.values[i]) || 0
                if (!v) return null
                const top = y(acc + v)
                const h = y(acc) - top
                acc += v
                return (
                  <rect key={s.name} x={cx - bw / 2} y={top} width={bw} height={Math.max(0, h)} fill={s.color} rx={1.5}>
                    <title>{`${shortDay(l)} · ${t(s.name)}: ${format(v)}`}</title>
                  </rect>
                )
              })}
              {xl[i] && <text x={cx} y={H - 6} textAnchor="middle" className="fill-gray-400 text-[11px]">{xl[i]}</text>}
            </g>
          )
        })}
      </svg>
      <Legend series={stacks} />
    </div>
  )
}

/** Before → after pairs (session check-ins). */
export function BeforeAfter({ rows, unit, lowerIsBetter = false }: {
  rows: Array<{ label: string; before: Value; after: Value }>; unit: string; lowerIsBetter?: boolean
}) {
  const { t } = useI18n()
  const vals = rows.flatMap((r) => [r.before, r.after]).filter((v): v is number => typeof v === "number")
  if (!vals.length) return <p className="text-sm text-gray-400">{t("No check-ins yet.")}</p>
  const max = Math.max(...vals) * 1.1
  return (
    <div className="space-y-2">
      {rows.map((r, i) => {
        const b = typeof r.before === "number" ? r.before : null
        const a = typeof r.after === "number" ? r.after : null
        const better = b !== null && a !== null && (lowerIsBetter ? a < b : a > b)
        return (
          <div key={i} className="grid grid-cols-[110px_1fr_70px] items-center gap-3 text-xs">
            <span className="text-gray-500 truncate">{r.label}</span>
            <div className="relative h-4 bg-gray-100 dark:bg-gray-700 rounded">
              {b !== null && <div className="absolute inset-y-0 left-0 rounded bg-gray-300 dark:bg-gray-500" style={{ width: `${(b / max) * 100}%` }} />}
              {a !== null && <div className="absolute top-1 bottom-1 left-0 rounded" style={{ width: `${(a / max) * 100}%`, background: better ? "#5F7D48" : "#C98B5A" }} />}
            </div>
            <span className="text-right tabular-nums text-gray-700 dark:text-gray-200">
              {b ?? "—"} → {a ?? "—"} {unit}
            </span>
          </div>
        )
      })}
    </div>
  )
}
