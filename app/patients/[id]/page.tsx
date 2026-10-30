"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Lock } from "lucide-react"
import { api, ComparisonMetric, DayRow, Metric, PatientDetail, Scope } from "@/app/libs/api"
import { addDays, ago, clock, minutesText, num, SCOPE_TITLES, shortDay, signed } from "@/app/libs/format"
import { Card } from "@/app/components/shell"
import { BeforeAfter, LineChart, StackedBars } from "@/app/components/charts"
import { cn } from "@/app/libs/utils"

const C = {
  deep: "#35597A", light: "#86ABCB", rem: "#9A86CF", awake: "#E2BC72",
  hr: "#D06D58", resting: "#8BA872", hrv: "#3E8F80", hrvMorning: "#9BC9BE", stress: "#D58A43", stressMax: "#EDC496",
}

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "sleep", label: "Sleep", scope: "sleep" },
  { key: "heart", label: "Heart rate", scope: "heartRate" },
  { key: "hrv", label: "HRV", scope: "hrv" },
  { key: "stress", label: "Stress", scope: "stress" },
  { key: "sessions", label: "Sessions", scope: "sessions" },
  { key: "reports", label: "Reports" },
] as const

type TabKey = (typeof TABS)[number]["key"]

export default function PatientPage({ params }: { params: { id: string } }) {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<PatientDetail | null>(null)
  const [error, setError] = useState("")
  const [tab, setTab] = useState<TabKey>("overview")

  useEffect(() => {
    let cancelled = false
    setError("")
    api.patient(params.id, days)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError((e as Error).message) })
    return () => { cancelled = true }
  }, [params.id, days])

  if (error) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div role="alert" className="rounded-xl bg-red-50 text-red-700 px-5 py-4">{error}</div>
      </div>
    )
  }
  if (!data) return <div className="space-y-4"><BackLink /><div className="h-40 rounded-2xl bg-white dark:bg-gray-800 animate-pulse" /></div>

  const p = data.patient
  const has = (s: Scope) => p.scopes.includes(s)

  return (
    <div className="space-y-6">
      <BackLink />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{p.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {[p.age !== null ? `${p.age} years` : null, p.gender, p.email].filter(Boolean).join(" · ")}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Ring last synced <b className={cn(stale(p.lastSyncAt) && "text-amber-600")}>{ago(p.lastSyncAt)}</b>
            {p.sharedSince && <> · Sharing since {new Date(p.sharedSince).toLocaleDateString()}</>}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {p.scopes.map((s) => (
              <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-[#8BA872]/15 text-[#4F6B3A] dark:text-[#B9D3A2]">{SCOPE_TITLES[s]}</span>
            ))}
          </div>
        </div>
        <div className="flex rounded-lg border border-[#D1D9CB] dark:border-gray-600 overflow-hidden text-sm" role="group" aria-label="Period">
          {[7, 14, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={cn("px-3 h-9", d === days ? "bg-[#8BA872] text-white" : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700")}>
              {d} days
            </button>
          ))}
        </div>
      </header>

      <nav className="flex gap-6 border-b border-[#D1D9CB] dark:border-gray-700 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("pb-3 -mb-px border-b-2 text-sm whitespace-nowrap",
              tab === t.key ? "border-[#8BA872] text-[#4F6B3A] dark:text-[#B9D3A2] font-medium" : "border-transparent text-gray-500 hover:text-gray-700")}>
            {t.label}
            {"scope" in t && !has(t.scope as Scope) && <Lock className="inline h-3 w-3 ml-1 opacity-60" />}
          </button>
        ))}
      </nav>

      {tab === "overview" && <Overview data={data} />}
      {tab === "sleep" && (has("sleep") ? <SleepTab data={data} /> : <NotShared what="sleep" />)}
      {tab === "heart" && (has("heartRate") ? <HeartTab data={data} /> : <NotShared what="heart rate" />)}
      {tab === "hrv" && (has("hrv") ? <HrvTab data={data} /> : <NotShared what="HRV" />)}
      {tab === "stress" && (has("stress") ? <StressTab data={data} /> : <NotShared what="stress" />)}
      {tab === "sessions" && (has("sessions") ? <SessionsTab data={data} /> : <NotShared what="wellness sessions" />)}
      {tab === "reports" && <ReportsTab userId={p.id} today={data.range.to} />}
    </div>
  )
}

const stale = (iso?: string | null) => !iso || Date.now() - new Date(iso).getTime() > 2 * 86400000

function BackLink() {
  return (
    <Link href="/patients" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
      <ArrowLeft className="h-4 w-4" /> Patients
    </Link>
  )
}

function NotShared({ what }: { what: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3 text-sm text-gray-500 py-6 justify-center">
        <Lock className="h-4 w-4" /> This patient hasn&apos;t chosen to share {what} with you.
      </div>
    </Card>
  )
}

// ---------------- Overview ----------------

function StatCard({ title, metric, format, lowerIsBetter = false, hint }: {
  title: string; metric?: Metric; format: (v: number | null) => string; lowerIsBetter?: boolean; hint?: string
}) {
  if (!metric) return null
  const ch = metric.change
  const good = ch !== null && ch !== 0 && (lowerIsBetter ? ch < 0 : ch > 0)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#E3E9DE] dark:border-gray-700 p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{format(metric.value)}</div>
      <div className="text-xs mt-1 text-gray-500">
        {ch !== null && Math.round(ch) !== 0 ? (
          <span className={good ? "text-[#5F7D48]" : "text-amber-600"}>{signedFormat(ch, format)} vs previous period</span>
        ) : metric.previous !== null ? "Same as previous period" : `${metric.days} day${metric.days === 1 ? "" : "s"} of data`}
      </div>
      {hint && <div className="text-[11px] text-gray-400 mt-1">{hint}</div>}
    </div>
  )
}

function signedFormat(v: number, format: (v: number | null) => string) {
  const body = format(Math.abs(v))
  return `${v > 0 ? "+" : "−"}${body}`
}

const fmtMin = (v: number | null) => minutesText(v)
const fmt = (unit: string) => (v: number | null) => num(v, unit)

function Overview({ data }: { data: PatientDetail }) {
  const s = data.summary
  const labels = data.days.map((d) => d.date)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Sleep per night" metric={s.sleepMinutes} format={fmtMin} />
        <StatCard title="Deep sleep" metric={s.deepMinutes} format={fmtMin} />
        <StatCard title="Resting heart rate" metric={s.restingHeartRate} format={fmt("bpm")} lowerIsBetter />
        <StatCard title="Average heart rate" metric={s.heartRate} format={fmt("bpm")} lowerIsBetter />
        <StatCard title="HRV" metric={s.hrv} format={fmt("ms")} />
        <StatCard title="Morning HRV" metric={s.morningHrv} format={fmt("ms")} hint="05:00–11:00, the patient's time" />
        <StatCard title="Stress" metric={s.stress} format={fmt("")} lowerIsBetter />
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#E3E9DE] dark:border-gray-700 p-4">
          <div className="text-xs text-gray-500">Ring worn</div>
          <div className="text-2xl font-semibold mt-1">{s.daysWorn} / {data.range.days} days</div>
          {s.sessions && <div className="text-xs text-gray-500 mt-1">{s.sessions.value} session{s.sessions.value === 1 ? "" : "s"} (previous: {s.sessions.previous})</div>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {s.sleepMinutes && (
          <Card title="Sleep" subtitle={`${shortDay(data.range.from)} – ${shortDay(data.range.to)}`}>
            <SleepChart days={data.days} />
          </Card>
        )}
        {s.hrv && (
          <Card title="HRV" subtitle="Daily average and morning value">
            <LineChart labels={labels} unit="ms" series={[
              { name: "Daily average", color: C.hrv, values: data.days.map((d) => d.hrv?.avg) },
              { name: "Morning", color: C.hrvMorning, values: data.days.map((d) => d.hrv?.morning) },
            ]} />
          </Card>
        )}
        {s.stress && (
          <Card title="Stress" subtitle="Daily average (0–100)">
            <LineChart labels={labels} series={[{ name: "Stress", color: C.stress, values: data.days.map((d) => d.stress?.avg) }]} />
          </Card>
        )}
        {(s.heartRate || s.restingHeartRate) && (
          <Card title="Heart rate" subtitle="Daily average and resting (during sleep)">
            <HeartChart days={data.days} />
          </Card>
        )}
      </div>

      {data.response?.comparison && <ResponseCard data={data} />}
    </div>
  )
}

// ---------------- Sleep ----------------

function SleepChart({ days }: { days: DayRow[] }) {
  return (
    <StackedBars
      labels={days.map((d) => d.date)}
      format={(v) => minutesText(v)}
      stacks={[
        { name: "Deep", color: C.deep, values: days.map((d) => d.sleep?.deepMinutes) },
        { name: "Light", color: C.light, values: days.map((d) => d.sleep?.lightMinutes) },
        { name: "REM", color: C.rem, values: days.map((d) => d.sleep?.remMinutes) },
        { name: "Awake", color: C.awake, values: days.map((d) => d.sleep?.awakeMinutes) },
      ]}
    />
  )
}

function SleepTab({ data }: { data: PatientDetail }) {
  const off = data.patient.utcOffsetMinutes
  const nights = [...data.days].reverse().filter((d) => d.sleep)
  return (
    <div className="space-y-6">
      <Card title="Sleep stages" subtitle="Each bar is the night that ended that morning">
        <SleepChart days={data.days} />
      </Card>
      <Card title="Nights" subtitle="Times are in the patient's time zone">
        {nights.length === 0 ? <p className="text-sm text-gray-500">No sleep recorded in this period.</p> : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-[#E3E9DE] dark:border-gray-700">
                  {["Night ending", "Bedtime", "Wake", "Asleep", "Deep", "REM", "Awake", "Resting HR"].map((h) => <th key={h} className="px-4 py-2 font-medium first:pl-5">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {nights.map((d) => (
                  <tr key={d.date} className="border-b last:border-0 border-[#EEF2EA] dark:border-gray-700">
                    <td className="pl-5 px-4 py-2.5">{shortDay(d.date)}</td>
                    <td className="px-4 py-2.5">{clock(d.sleep!.startTime, off)}</td>
                    <td className="px-4 py-2.5">{clock(d.sleep!.endTime, off)}</td>
                    <td className="px-4 py-2.5 font-medium">{minutesText(d.sleep!.asleepMinutes)}</td>
                    <td className="px-4 py-2.5">{minutesText(d.sleep!.deepMinutes)}</td>
                    <td className="px-4 py-2.5">{minutesText(d.sleep!.remMinutes)}</td>
                    <td className="px-4 py-2.5">{minutesText(d.sleep!.awakeMinutes)}</td>
                    <td className="px-4 py-2.5">{num(d.sleep!.restingHeartRate, "bpm")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ---------------- Heart / HRV / Stress ----------------

function HeartChart({ days }: { days: DayRow[] }) {
  return (
    <LineChart labels={days.map((d) => d.date)} unit="bpm" series={[
      { name: "Daily average", color: C.hr, values: days.map((d) => d.heartRate?.avg) },
      ...(days.some((d) => d.sleep !== undefined) ? [{ name: "Resting (sleep)", color: C.resting, values: days.map((d) => d.sleep?.restingHeartRate) }] : []),
    ]} />
  )
}

function DailyTable({ days, cols }: { days: DayRow[]; cols: Array<{ title: string; get: (d: DayRow) => string }> }) {
  const rows = [...days].reverse().filter((d) => cols.some((c) => c.get(d) !== "—"))
  if (!rows.length) return <p className="text-sm text-gray-500">No readings in this period.</p>
  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-[#E3E9DE] dark:border-gray-700">
            <th className="pl-5 px-4 py-2 font-medium">Day</th>
            {cols.map((c) => <th key={c.title} className="px-4 py-2 font-medium">{c.title}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.date} className="border-b last:border-0 border-[#EEF2EA] dark:border-gray-700">
              <td className="pl-5 px-4 py-2.5">{shortDay(d.date)}</td>
              {cols.map((c) => <td key={c.title} className="px-4 py-2.5">{c.get(d)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HeartTab({ data }: { data: PatientDetail }) {
  return (
    <div className="space-y-6">
      <Card title="Heart rate"><HeartChart days={data.days} /></Card>
      <Card title="Daily values">
        <DailyTable days={data.days} cols={[
          { title: "Average", get: (d) => num(d.heartRate?.avg, "bpm") },
          { title: "Lowest", get: (d) => num(d.heartRate?.min, "bpm") },
          { title: "Highest", get: (d) => num(d.heartRate?.max, "bpm") },
          { title: "Resting (sleep)", get: (d) => num(d.sleep?.restingHeartRate, "bpm") },
          { title: "Readings", get: (d) => (d.heartRate ? String(d.heartRate.readings) : "—") },
        ]} />
      </Card>
    </div>
  )
}

function HrvTab({ data }: { data: PatientDetail }) {
  return (
    <div className="space-y-6">
      <Card title="HRV" subtitle="Morning HRV (05:00–11:00) is the most comparable day to day">
        <LineChart labels={data.days.map((d) => d.date)} unit="ms" series={[
          { name: "Daily average", color: C.hrv, values: data.days.map((d) => d.hrv?.avg) },
          { name: "Morning", color: C.hrvMorning, values: data.days.map((d) => d.hrv?.morning) },
        ]} />
      </Card>
      <Card title="Daily values">
        <DailyTable days={data.days} cols={[
          { title: "Average", get: (d) => num(d.hrv?.avg, "ms") },
          { title: "Morning", get: (d) => num(d.hrv?.morning, "ms") },
          { title: "Readings", get: (d) => (d.hrv ? String(d.hrv.readings) : "—") },
        ]} />
      </Card>
    </div>
  )
}

function StressTab({ data }: { data: PatientDetail }) {
  return (
    <div className="space-y-6">
      <Card title="Stress" subtitle="0–100 as measured by the ring">
        <LineChart labels={data.days.map((d) => d.date)} series={[
          { name: "Daily average", color: C.stress, values: data.days.map((d) => d.stress?.avg) },
          { name: "Highest", color: C.stressMax, values: data.days.map((d) => d.stress?.max) },
        ]} />
      </Card>
      <Card title="Daily values">
        <DailyTable days={data.days} cols={[
          { title: "Average", get: (d) => num(d.stress?.avg) },
          { title: "Highest", get: (d) => num(d.stress?.max) },
          { title: "Readings", get: (d) => (d.stress ? String(d.stress.readings) : "—") },
        ]} />
      </Card>
    </div>
  )
}

// ---------------- Sessions + response ----------------

function SessionsTab({ data }: { data: PatientDetail }) {
  const sessions = data.sessions || []
  const withChecks = sessions.filter((s) => s.before && s.after).slice(0, 10)
  return (
    <div className="space-y-6">
      {data.response?.comparison && <ResponseCard data={data} />}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Stress before → after" subtitle="60-second check-ins, last 10 sessions">
          <BeforeAfter unit="" lowerIsBetter rows={withChecks.map((s) => ({ label: `${shortDay(s.date)} ${s.title}`, before: s.before?.stress, after: s.after?.stress }))} />
        </Card>
        <Card title="HRV before → after" subtitle="Higher after is usually a calmer state">
          <BeforeAfter unit="ms" rows={withChecks.map((s) => ({ label: `${shortDay(s.date)} ${s.title}`, before: s.before?.hrv, after: s.after?.hrv }))} />
        </Card>
      </div>
      <Card title="Completed sessions" subtitle={`${sessions.length} in this period`}>
        {sessions.length === 0 ? <p className="text-sm text-gray-500">No completed sessions in this period.</p> : (
          <ul className="divide-y divide-[#EEF2EA] dark:divide-gray-700 text-sm">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span><b className="font-medium">{s.title}</b> <span className="text-gray-500">· {shortDay(s.date)} {clock(s.startedAt, data.patient.utcOffsetMinutes)} · {s.minutes ?? "—"} min</span></span>
                <span className="text-xs text-gray-500 tabular-nums">
                  {s.before && s.after ? `Stress ${s.before.stress ?? "—"}→${s.after.stress ?? "—"} · HRV ${s.before.hrv ?? "—"}→${s.after.hrv ?? "—"} ms` : "No check-in"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

const CONF: Record<string, string> = { building: "Building", early: "Early pattern", consistent: "Consistent pattern" }

function ResponseCard({ data }: { data: PatientDetail }) {
  const r = data.response!
  const metrics = r.comparison?.metrics || []
  return (
    <Card
      title="Session days vs off days"
      subtitle={r.comparison ? `Last ${r.comparison.windowDays} days · ${r.comparison.sessionDays} session days, ${r.comparison.offDays} off days · medians` : undefined}
    >
      {r.baseline && r.baseline.status !== "ready" && (
        <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
          Still learning this person&apos;s normal: {r.baseline.offDaysUsed} of {r.baseline.offDaysNeeded} days without a session.
        </p>
      )}
      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-[#E3E9DE] dark:border-gray-700">
              {["Measure", "After session days", "Off days", "Difference", "Confidence"].map((h) => <th key={h} className="px-4 py-2 font-medium first:pl-5">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m: ComparisonMetric) => (
              <tr key={m.key} className="border-b last:border-0 border-[#EEF2EA] dark:border-gray-700">
                <td className="pl-5 px-4 py-2.5">{m.label}</td>
                <td className="px-4 py-2.5">{num(m.sessionValue, m.unit)}</td>
                <td className="px-4 py-2.5">{num(m.offValue, m.unit)}</td>
                <td className={cn("px-4 py-2.5", m.direction === "better" ? "text-[#5F7D48] font-medium" : m.direction === "worse" ? "text-amber-600" : "text-gray-500")}>
                  {m.diff === null ? "—" : `${signed(m.diff, m.unit)}${m.direction === "same" ? " (within normal)" : ""}`}
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{CONF[m.confidence] || m.confidence} · {Math.min(m.sessionDays, m.offDays)} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400 mt-3">
        A difference counts only when it&apos;s bigger than this person&apos;s own day-to-day variation. These are associations, not proof that a session caused a change.
      </p>
    </Card>
  )
}

// ---------------- Reports ----------------

function ReportsTab({ userId, today }: { userId: number; today: string }) {
  const thisMonth = today.slice(0, 7)
  const weeks = useMemo(() => {
    // Mondays of the last 8 weeks.
    const d = new Date(today + "T00:00:00Z")
    const monday = addDays(today, -((d.getUTCDay() + 6) % 7))
    return Array.from({ length: 8 }, (_, i) => addDays(monday, -7 * i))
  }, [today])
  const months = useMemo(() => {
    const [y, m] = thisMonth.split("-").map(Number)
    return Array.from({ length: 6 }, (_, i) => new Date(Date.UTC(y, m - 1 - i, 1)).toISOString().slice(0, 7))
  }, [thisMonth])
  const [week, setWeek] = useState(weeks[0])
  const [month, setMonth] = useState(months[0])

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card title="Weekly report" subtitle="Monday to Sunday, compared with the week before">
        <select value={week} onChange={(e) => setWeek(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
          {weeks.map((w, i) => <option key={w} value={w}>{i === 0 ? "This week" : `${shortDay(w)} – ${shortDay(addDays(w, 6))}`}</option>)}
        </select>
        <Link href={`/patients/${userId}/report?type=weekly&period=${week}`} target="_blank"
          className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#8BA872] hover:bg-[#7A946A] text-white text-sm font-medium">
          <FileText className="h-4 w-4" /> Open report
        </Link>
      </Card>
      <Card title="Monthly report" subtitle="Calendar month, compared with the month before">
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
          {months.map((m, i) => (
            <option key={m} value={m}>
              {new Date(m + "-01T00:00:00Z").toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" })}{i === 0 ? " (so far)" : ""}
            </option>
          ))}
        </select>
        <Link href={`/patients/${userId}/report?type=monthly&period=${month}`} target="_blank"
          className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#8BA872] hover:bg-[#7A946A] text-white text-sm font-medium">
          <FileText className="h-4 w-4" /> Open report
        </Link>
      </Card>
      <p className="md:col-span-2 text-xs text-gray-500">Reports open in a new tab. Use “Download PDF” there to save or send them.</p>
    </div>
  )
}
