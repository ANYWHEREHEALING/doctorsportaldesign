"use client"

// Care tools on the patient page: recommendations the patient sees in the
// app (a session plan or a short note) and the practitioner's private notes.

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, CalendarCheck, Eye, MessageSquare, StickyNote, Trash2 } from "lucide-react"
import { api, Flag, Note, Recommendation } from "@/app/libs/api"
import { KIND_TITLES, minutesText, shortDay } from "@/app/libs/format"
import { useI18n } from "@/app/libs/i18n"
import { Card } from "./shell"
import { cn } from "@/app/libs/utils"

// ---------------- Flags ----------------

const FLAG_STYLE: Record<Flag["level"], string> = {
  high: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
}

export function FlagChip({ flag }: { flag: Flag }) {
  const { t } = useI18n()
  const p = flag.params || {}
  const text = (() => {
    switch (flag.code) {
      case "noSync": return t("Ring not synced for {n} days", { n: p.days ?? "?" })
      case "noData": return t("No ring data yet")
      case "shortSleep": return t("Sleep {time} below their normal for 3 nights", { time: minutesText(p.minutes ?? null) })
      case "stressUp": return t("Stress up {pct}% this week", { pct: p.pct ?? "?" })
      case "hrvDown": return t("Morning HRV down {pct}% this week", { pct: p.pct ?? "?" })
      case "noSessions": return t("No sessions in 2 weeks")
      case "planBehind": return t("Behind on plan: {done} of {target} sessions this week", { done: p.done ?? 0, target: p.target ?? 0 })
      default: return flag.text
    }
  })()
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", FLAG_STYLE[flag.level])}>
      {flag.level !== "low" && <AlertTriangle className="h-3 w-3" />}
      {text}
    </span>
  )
}

// ---------------- Care tab ----------------

const KINDS = ["deepSleep", "calm", "recovery", "focus", "any"]

export function CareTab({ userId, canSeeSessions, onNotesChanged }: {
  userId: number; canSeeSessions: boolean; onNotesChanged: (notes: Note[]) => void
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <Recommendations userId={userId} canSeeSessions={canSeeSessions} />
      <Notes userId={userId} onChanged={onNotesChanged} />
    </div>
  )
}

function Recommendations({ userId, canSeeSessions }: { userId: number; canSeeSessions: boolean }) {
  const [items, setItems] = useState<Recommendation[] | null>(null)
  const [mode, setMode] = useState<"plan" | "note">("plan")
  const [kind, setKind] = useState("deepSleep")
  // How often: "w3" = 3× a week, "d2" = 2× a day (a day is at most 3).
  const [often, setOften] = useState("w3")
  const [weeks, setWeeks] = useState(4)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState("")
  const { t } = useI18n()

  const load = useCallback(() => {
    api.recommendations(userId).then((r) => setItems(r.recommendations)).catch((e) => setError((e as Error).message))
  }, [userId])
  useEffect(load, [load])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    setSent("")
    try {
      if (mode === "plan") {
        // Written in the portal language, so the patient reads it the same way.
        const daily = often.startsWith("d")
        const n = Number(often.slice(1))
        const fallback = t(
          daily
            ? (weeks === 1 ? "{kind}, {n}× a day for {w} week." : "{kind}, {n}× a day for {w} weeks.")
            : (weeks === 1 ? "{kind}, {n}× a week for {w} week." : "{kind}, {n}× a week for {w} weeks."),
          { kind: t(KIND_TITLES[kind]), n, w: weeks })
        await api.recommendPlan(userId, kind, daily ? { day: n } : { week: n }, weeks, message.trim() || fallback)
      } else {
        await api.recommendNote(userId, message.trim())
      }
      setMessage("")
      setSent(t("Sent. The patient gets a notification and sees it in the app."))
      load()
    } catch (err) {
      setError(t((err as Error).message))
    } finally {
      setBusy(false)
    }
  }

  const withdraw = async (r: Recommendation) => {
    if (!window.confirm(t("Withdraw this recommendation? It disappears from the patient's app."))) return
    try {
      await api.withdrawRecommendation(userId, r.id)
      load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const visible = (items || []).filter((r) => r.status !== "cancelled")
  const activePlan = visible.find((r) => r.type === "plan" && r.status === "active")

  return (
    <Card title={t("Recommendations")} subtitle={t("The patient sees these in the app")}>
      <form onSubmit={send} className="space-y-3">
        <div className="flex rounded-lg border border-[#D1D9CB] dark:border-gray-600 overflow-hidden text-sm w-fit">
          {(["plan", "note"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={cn("px-3 h-9 inline-flex items-center gap-1.5", mode === m ? "bg-[#8BA872] text-white" : "bg-white dark:bg-gray-800")}>
              {m === "plan" ? <CalendarCheck className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
              {m === "plan" ? t("Session plan") : t("Advice")}
            </button>
          ))}
        </div>

        {mode === "plan" && (
          <div className="grid grid-cols-3 gap-3 text-sm">
            <label className="col-span-3 sm:col-span-1">
              <span className="block text-xs text-gray-500 mb-1">{t("Session")}</span>
              <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full h-10 px-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                {KINDS.map((k) => <option key={k} value={k}>{t(KIND_TITLES[k])}</option>)}
              </select>
            </label>
            <label>
              <span className="block text-xs text-gray-500 mb-1">{t("How often")}</span>
              <select value={often} onChange={(e) => setOften(e.target.value)} className="w-full h-10 px-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                <optgroup label={t("Per week")}>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={"w" + n} value={"w" + n}>{t("{n}× a week", { n })}</option>)}
                </optgroup>
                <optgroup label={t("Per day")}>
                  {[1, 2, 3].map((n) => <option key={"d" + n} value={"d" + n}>{t("{n}× a day", { n })}</option>)}
                </optgroup>
              </select>
            </label>
            <label>
              <span className="block text-xs text-gray-500 mb-1">{t("For")}</span>
              <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className="w-full h-10 px-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                {[1, 2, 3, 4, 6, 8, 12].map((n) => <option key={n} value={n}>{t(n === 1 ? "{n} week" : "{n} weeks", { n })}</option>)}
              </select>
            </label>
          </div>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          rows={3}
          required={mode === "note"}
          placeholder={mode === "plan" ? t("Optional note, e.g. In the evening, about an hour before bed.") : t("e.g. Try going to bed by 22:30 this week and keep the phone out of the bedroom.")}
          className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm outline-none focus:ring-2 focus:ring-[#8BA872]"
        />
        {mode === "plan" && activePlan && (
          <p className="text-xs text-amber-700 dark:text-amber-300">{t("This replaces the current plan ({kind}, {often}).", { kind: t(KIND_TITLES[activePlan.kind || ""] || activePlan.kindTitle || ""), often: oftenText(activePlan, t) })}</p>
        )}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {sent && <p role="status" className="text-sm text-[#4F6B3A] dark:text-[#B9D3A2]">{sent}</p>}
        <button type="submit" disabled={busy} className="h-10 px-4 rounded-lg bg-[#8BA872] hover:bg-[#7A946A] text-white text-sm font-medium disabled:opacity-60">
          {busy ? t("Sending…") : mode === "plan" ? t("Send plan") : t("Send advice")}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {!items ? (
          <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
        ) : visible.length === 0 ? (
          <p className="text-sm text-gray-500">{t("Nothing sent yet.")}</p>
        ) : visible.map((r) => (
          <div key={r.id} className="rounded-xl border border-[#E3E9DE] dark:border-gray-700 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  {r.type === "plan" ? <CalendarCheck className="h-4 w-4 text-[#5F7D48]" /> : <MessageSquare className="h-4 w-4 text-[#5F7D48]" />}
                  {r.type === "plan"
                    ? `${t(KIND_TITLES[r.kind || ""] || r.kindTitle || "")} · ${oftenText(r, t)} · ${t((r.weeks ?? 0) === 1 ? "{n} week" : "{n} weeks", { n: r.weeks ?? 0 })}`
                    : t("Advice")}
                  {r.status === "ended" && <span className="text-[11px] px-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">{t("Finished")}</span>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">{r.message}</p>
                <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  {t("Sent {date}", { date: shortDay(r.createdAt.slice(0, 10)) })}
                  {r.seenAt ? <><Eye className="h-3 w-3 ml-1" /> {t("seen")}</> : ` · ${t("not opened yet")}`}
                </p>
              </div>
              {r.status === "active" && (
                <button onClick={() => withdraw(r)} className="text-xs text-gray-400 hover:text-red-600 shrink-0">{t("Withdraw")}</button>
              )}
            </div>
            {r.type === "plan" && (r.progress ? <PlanBars progress={r.progress} /> : !canSeeSessions && (
              <p className="text-xs text-gray-400 mt-2">{t("Progress is hidden: this patient doesn't share sessions.")}</p>
            ))}
          </div>
        ))}
      </div>
    </Card>
  )
}

/** "3× a week" or "2× a day". */
function oftenText(r: Recommendation, t: (key: string, vars?: Record<string, string | number>) => string) {
  return r.sessionsPerDay
    ? t("{n}× a day", { n: r.sessionsPerDay })
    : t("{n}× a week", { n: r.sessionsPerWeek ?? 0 })
}

function PlanBars({ progress }: { progress: NonNullable<Recommendation["progress"]> }) {
  const { t } = useI18n()
  return (
    <div className="mt-3">
      <div className="flex gap-1.5">
        {progress.weeks.map((w) => (
          <div key={w.week} className="flex-1">
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div className={cn("h-full rounded-full", w.met ? "bg-[#5F7D48]" : "bg-[#8BA872]")}
                style={{ width: `${Math.min(100, (w.done / Math.max(1, w.target)) * 100)}%` }} />
            </div>
            <div className={cn("text-[10px] mt-1 text-center", w.week === progress.currentWeek ? "text-gray-700 dark:text-gray-200 font-medium" : "text-gray-400")}>
              {t("W{n}", { n: w.week })} · {w.done}/{w.target}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {progress.today && !progress.ended && `${t("Today: {done} of {target}", { done: progress.today.done, target: progress.today.target })} · `}
        {t("{done} of {target} sessions done", { done: progress.totalDone, target: progress.totalTarget })}
        {progress.ended ? "" : ` · ${t("ends {date}", { date: shortDay(progress.endDate) })}`}
      </p>
    </div>
  )
}

function Notes({ userId, onChanged }: { userId: number; onChanged: (notes: Note[]) => void }) {
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [text, setText] = useState("")
  const [date, setDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const { t } = useI18n()

  const load = useCallback(() => {
    api.notes(userId).then((r) => { setNotes(r.notes); onChanged(r.notes) }).catch((e) => setError((e as Error).message))
  }, [userId, onChanged])
  useEffect(load, [load])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await api.addNote(userId, text.trim(), date)
      setText("")
      load()
    } catch (err) {
      setError(t((err as Error).message))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (n: Note) => {
    if (!window.confirm(t("Delete this note?"))) return
    try { await api.deleteNote(userId, n.id); load() } catch (err) { setError((err as Error).message) }
  }

  return (
    <Card title={t("Private notes")} subtitle={t("Only you see these. They appear as markers on the charts.")}>
      <form onSubmit={add} className="space-y-3">
        <textarea value={text} onChange={(e) => setText(e.target.value)} required maxLength={2000} rows={3}
          placeholder={t("e.g. Started magnesium. Reports better mornings.")}
          className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm outline-none focus:ring-2 focus:ring-[#8BA872]" />
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="h-10 px-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm" aria-label={t("Date the note is about")} />
          <button type="submit" disabled={busy} className="h-10 px-4 rounded-lg bg-[#8BA872] hover:bg-[#7A946A] text-white text-sm font-medium disabled:opacity-60">
            {busy ? t("Saving…") : t("Add note")}
          </button>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </form>

      <ol className="mt-6 space-y-4 border-l-2 border-[#E3E9DE] dark:border-gray-700 pl-4">
        {!notes ? (
          <li className="h-12 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
        ) : notes.length === 0 ? (
          <li className="text-sm text-gray-500">{t("No notes yet.")}</li>
        ) : notes.map((n) => (
          <li key={n.id} className="relative">
            <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#8BA872]" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-gray-500 flex items-center gap-1"><StickyNote className="h-3 w-3" /> {shortDay(n.date)}</div>
                <p className="text-sm mt-0.5 whitespace-pre-line">{n.text}</p>
              </div>
              <button onClick={() => remove(n)} className="text-gray-300 hover:text-red-600 shrink-0" aria-label={t("Delete note")}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
