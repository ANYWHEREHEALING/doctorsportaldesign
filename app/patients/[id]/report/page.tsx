"use client"

// Printable weekly / monthly report. "Download PDF" uses the browser's
// print dialog (Save as PDF), so the PDF looks exactly like this page.

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import { api, MonthlyReport, Summary, WeeklyReport } from "@/app/libs/api"
import { addDays, addMonths, minutesText, monthName, num, shortDay, signed } from "@/app/libs/format"
import { LineChart, StackedBars } from "@/app/components/charts"
import { useDoctor } from "@/app/components/shell"
import { cn } from "@/app/libs/utils"

type Report = (WeeklyReport | MonthlyReport) & { kind: "weekly" | "monthly" }

function ReportView({ userId }: { userId: string }) {
  const sp = useSearchParams()
  const type = sp.get("type") === "monthly" ? "monthly" : "weekly"
  const [period, setPeriod] = useState(sp.get("period") || "")
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState("")
  const doctor = useDoctor()

  useEffect(() => {
    let cancelled = false
    setReport(null)
    setError("")
    const load = type === "monthly"
      ? api.monthlyReport(userId, period || undefined).then((r) => ({ ...r, kind: "monthly" as const }))
      : api.weeklyReport(userId, period || undefined).then((r) => ({ ...r, kind: "weekly" as const }))
    load.then((r) => { if (!cancelled) setReport(r) }).catch((e) => { if (!cancelled) setError((e as Error).message) })
    return () => { cancelled = true }
  }, [userId, type, period])

  if (error) return <div role="alert" className="rounded-xl bg-red-50 text-red-700 px-5 py-4">{error}</div>
  if (!report) return <div className="h-96 rounded-2xl bg-white dark:bg-gray-800 animate-pulse" />

  const isMonth = report.kind === "monthly"
  const title = isMonth ? `Monthly report · ${monthName((report as MonthlyReport).month)}` : `Weekly report · ${shortDay((report as WeeklyReport).weekStart)} – ${shortDay(addDays((report as WeeklyReport).weekEnd, -1))}`
  const current = isMonth ? (report as MonthlyReport).month : (report as WeeklyReport).weekStart
  const prev = isMonth ? addMonths(current, -1) : addDays(current, -7)
  const next = isMonth ? addMonths(current, 1) : addDays(current, 7)
  const nextDisabled = isMonth ? !(report as MonthlyReport).complete : addDays(current, 7) > new Date().toISOString().slice(0, 10)
  const p = report.patient
  const labels = report.days.map((d) => d.date)
  const s = report.summary

  return (
    <div className="space-y-5 report">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href={`/patients/${userId}`} className="text-sm text-gray-500 hover:text-gray-800">← {p.name}</Link>
        <div className="flex items-center gap-2">
          <button onClick={() => setPeriod(prev)} className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-[#D1D9CB] bg-white dark:bg-gray-800" aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setPeriod(next)} disabled={nextDisabled} className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-[#D1D9CB] bg-white dark:bg-gray-800 disabled:opacity-40" aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#8BA872] hover:bg-[#7A946A] text-white text-sm font-medium">
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      <article className="bg-white text-gray-900 rounded-2xl border border-[#E3E9DE] p-8 print:border-0 print:p-0 space-y-7">
        <header className="flex items-start justify-between gap-6 border-b border-[#E3E9DE] pb-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#5F7D48] font-semibold">Anywhere Healing</div>
            <h1 className="text-2xl font-semibold mt-1">{title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {p.name}{p.age !== null ? ` · ${p.age} years` : ""}{p.gender ? ` · ${p.gender}` : ""}
            </p>
            {isMonth && !(report as MonthlyReport).complete && <p className="text-xs text-amber-700 mt-1">Month in progress: data so far.</p>}
          </div>
          <div className="text-right text-xs text-gray-500 shrink-0">
            <Image src="/Group.png" alt="" width={40} height={40} className="ml-auto mb-2" />
            Prepared for {doctor?.name || "your practitioner"}<br />
            {new Date().toLocaleDateString()}
          </div>
        </header>

        <section>
          <h2 className="font-semibold mb-3">Summary</h2>
          <SummaryTable summary={s} isMonth={isMonth} />
          <p className="text-xs text-gray-500 mt-2">Ring worn {s.daysWorn} of {report.days.length} days. Averages of the days with readings.</p>
        </section>

        <div className="grid md:grid-cols-2 print:grid-cols-2 gap-6">
          {s.sleepMinutes && (
            <Chart title="Sleep stages">
              <StackedBars labels={labels} height={190} format={(v) => minutesText(v)} stacks={[
                { name: "Deep", color: "#35597A", values: report.days.map((d) => d.sleep?.deepMinutes) },
                { name: "Light", color: "#86ABCB", values: report.days.map((d) => d.sleep?.lightMinutes) },
                { name: "REM", color: "#9A86CF", values: report.days.map((d) => d.sleep?.remMinutes) },
                { name: "Awake", color: "#E2BC72", values: report.days.map((d) => d.sleep?.awakeMinutes) },
              ]} />
            </Chart>
          )}
          {s.hrv && (
            <Chart title="HRV (ms)">
              <LineChart labels={labels} height={190} unit="ms" series={[
                { name: "Daily average", color: "#3E8F80", values: report.days.map((d) => d.hrv?.avg) },
                { name: "Morning", color: "#9BC9BE", values: report.days.map((d) => d.hrv?.morning) },
              ]} />
            </Chart>
          )}
          {s.stress && (
            <Chart title="Stress (0–100)">
              <LineChart labels={labels} height={190} series={[{ name: "Daily average", color: "#D58A43", values: report.days.map((d) => d.stress?.avg) }]} />
            </Chart>
          )}
          {(s.heartRate || s.restingHeartRate) && (
            <Chart title="Heart rate (bpm)">
              <LineChart labels={labels} height={190} unit="bpm" series={[
                ...(s.heartRate ? [{ name: "Daily average", color: "#D06D58", values: report.days.map((d) => d.heartRate?.avg) }] : []),
                ...(s.restingHeartRate ? [{ name: "Resting (sleep)", color: "#8BA872", values: report.days.map((d) => d.sleep?.restingHeartRate) }] : []),
              ]} />
            </Chart>
          )}
        </div>

        {report.sessionsByKind && (
          <section>
            <h2 className="font-semibold mb-3">Wellness sessions</h2>
            {report.sessionsByKind.length === 0 ? <p className="text-sm text-gray-500">No completed sessions in this period.</p> : (
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-[#E3E9DE]">
                    <th className="py-2 font-medium">Session</th><th className="py-2 font-medium">Completed</th><th className="py-2 font-medium">Stress change (median, before → after)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.sessionsByKind.map((k) => (
                    <tr key={k.kind} className="border-b last:border-0 border-[#EEF2EA]">
                      <td className="py-2">{k.title}</td>
                      <td className="py-2">{k.sessions}</td>
                      <td className="py-2">{k.medianStressDrop === null ? "No check-ins" : k.medianStressDrop > 0 ? `${Math.round(k.medianStressDrop)} points lower after` : k.medianStressDrop < 0 ? `${Math.round(-k.medianStressDrop)} points higher after` : "No change"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {report.response?.comparison && report.response.comparison.metrics.length > 0 && (
          <section>
            <h2 className="font-semibold mb-1">Session days vs off days</h2>
            <p className="text-xs text-gray-500 mb-3">
              Last {report.response.comparison.windowDays} days up to the end of this period · {report.response.comparison.sessionDays} session days, {report.response.comparison.offDays} off days.
            </p>
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-[#E3E9DE]">
                  <th className="py-2 font-medium">Measure</th><th className="py-2 font-medium">Session days</th><th className="py-2 font-medium">Off days</th><th className="py-2 font-medium">Difference</th><th className="py-2 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {report.response.comparison.metrics.map((m) => (
                  <tr key={m.key} className="border-b last:border-0 border-[#EEF2EA]">
                    <td className="py-2">{m.label}</td>
                    <td className="py-2">{num(m.sessionValue, m.unit)}</td>
                    <td className="py-2">{num(m.offValue, m.unit)}</td>
                    <td className={cn("py-2", m.direction === "better" ? "text-[#5F7D48] font-medium" : m.direction === "worse" ? "text-amber-700" : "text-gray-500")}>
                      {m.diff === null ? "—" : `${signed(m.diff, m.unit)}${m.direction === "same" ? " (within normal)" : ""}`}
                    </td>
                    <td className="py-2 text-xs text-gray-500">{({ building: "Building", early: "Early pattern", consistent: "Consistent" } as Record<string, string>)[m.confidence]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <footer className="text-[11px] text-gray-400 border-t border-[#E3E9DE] pt-4">
          Data from the patient&apos;s Charisma Ring, shared with their consent. Times use the patient&apos;s time zone.
          Wellness trends only: not a diagnosis. Session comparisons show associations, not proof of cause.
        </footer>
      </article>
    </div>
  )
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      {children}
    </section>
  )
}

function SummaryTable({ summary: s, isMonth }: { summary: Summary; isMonth: boolean }) {
  type Row = { label: string; m?: { value: number | null; previous: number | null; change: number | null }; fmt: (v: number | null) => string; unit: string; lower?: boolean }
  const all: Row[] = [
    { label: "Sleep per night", m: s.sleepMinutes, fmt: (v) => minutesText(v), unit: "min" },
    { label: "Deep sleep", m: s.deepMinutes, fmt: (v) => minutesText(v), unit: "min" },
    { label: "Resting heart rate", m: s.restingHeartRate, fmt: (v) => num(v, "bpm"), unit: "bpm", lower: true },
    { label: "Average heart rate", m: s.heartRate, fmt: (v) => num(v, "bpm"), unit: "bpm", lower: true },
    { label: "HRV", m: s.hrv, fmt: (v) => num(v, "ms"), unit: "ms" },
    { label: "Morning HRV", m: s.morningHrv, fmt: (v) => num(v, "ms"), unit: "ms" },
    { label: "Stress", m: s.stress, fmt: (v) => num(v), unit: "", lower: true },
  ]
  const rows = all.filter((r) => r.m)
  return (
    <table className="w-full text-sm tabular-nums">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-[#E3E9DE]">
          <th className="py-2 font-medium">Measure</th>
          <th className="py-2 font-medium">This {isMonth ? "month" : "week"}</th>
          <th className="py-2 font-medium">Previous {isMonth ? "month" : "week"}</th>
          <th className="py-2 font-medium">Change</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const ch = r.m!.change
          const good = ch !== null && Math.round(ch) !== 0 && (r.lower ? ch < 0 : ch > 0)
          return (
            <tr key={r.label} className="border-b last:border-0 border-[#EEF2EA]">
              <td className="py-2">{r.label}</td>
              <td className="py-2 font-medium">{r.fmt(r.m!.value)}</td>
              <td className="py-2 text-gray-500">{r.fmt(r.m!.previous)}</td>
              <td className={cn("py-2", ch === null || Math.round(ch) === 0 ? "text-gray-400" : good ? "text-[#5F7D48]" : "text-amber-700")}>
                {ch === null ? "—" : r.unit === "min" ? `${ch > 0 ? "+" : ch < 0 ? "−" : "±"}${minutesText(Math.abs(ch))}` : signed(ch, r.unit)}
              </td>
            </tr>
          )
        })}
        {s.sessions && (
          <tr>
            <td className="py-2">Sessions completed</td>
            <td className="py-2 font-medium">{s.sessions.value}</td>
            <td className="py-2 text-gray-500">{s.sessions.previous}</td>
            <td className="py-2 text-gray-400">{signed(s.sessions.value - s.sessions.previous)}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

export default function ReportPage({ params }: { params: { id: string } }) {
  return <Suspense><ReportView userId={params.id} /></Suspense>
}
