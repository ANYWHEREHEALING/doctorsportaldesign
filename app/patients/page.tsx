"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search, UserPlus, X } from "lucide-react"
import { api, PatientRow } from "@/app/libs/api"
import { ago, minutesText, num, signed } from "@/app/libs/format"
import { Card } from "@/app/components/shell"
import { cn } from "@/app/libs/utils"

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Waiting for approval", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200" },
  declined: { label: "Declined", className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  revoked: { label: "Stopped sharing", className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
}

export default function PatientsPage() {
  const [rows, setRows] = useState<PatientRow[] | null>(null)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [inviting, setInviting] = useState(false)

  const load = useCallback(() => {
    setError("")
    api.patients().then((r) => setRows(r.patients)).catch((e) => setError((e as Error).message))
  }, [])
  useEffect(load, [load])

  const q = query.trim().toLowerCase()
  const filtered = useMemo(
    () => (rows || []).filter((p) => !q || (p.name || "").toLowerCase().includes(q) || p.email.toLowerCase().includes(q)),
    [rows, q]
  )
  const active = filtered.filter((p) => p.status === "active")
  const others = filtered.filter((p) => p.status !== "active")

  const remove = async (p: PatientRow) => {
    const what = p.status === "active" ? `Stop following ${p.name || p.email}?` : `Remove the invitation for ${p.email}?`
    if (!window.confirm(what)) return
    try {
      await api.removeLink(p.linkId)
      load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">People who share their Charisma Ring data with you.</p>
        </div>
        <button
          onClick={() => setInviting(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#8BA872] hover:bg-[#7A946A] text-white text-sm font-medium"
        >
          <UserPlus className="h-4 w-4" /> Invite patient
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="w-full h-10 pl-9 pr-3 rounded-lg bg-white dark:bg-gray-800 border border-[#E3E9DE] dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-[#8BA872]"
        />
      </div>

      {error && <div role="alert" className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error} <button onClick={load} className="underline ml-2">Try again</button></div>}

      <Card title="Sharing with you" subtitle={rows ? `${active.length} patient${active.length === 1 ? "" : "s"}` : undefined}>
        {!rows ? (
          <TableSkeleton />
        ) : active.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">
            {q ? "No patients match your search." : "No one is sharing with you yet. Invite a patient to get started."}
          </p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-[#E3E9DE] dark:border-gray-700">
                  <th className="px-5 py-2 font-medium">Patient</th>
                  <th className="px-3 py-2 font-medium">Last night</th>
                  <th className="px-3 py-2 font-medium">HRV (7 days)</th>
                  <th className="px-3 py-2 font-medium">Stress (7 days)</th>
                  <th className="px-3 py-2 font-medium">Ring synced</th>
                  <th className="px-5 py-2" />
                </tr>
              </thead>
              <tbody>
                {active.map((p) => (
                  <tr key={p.linkId} className="border-b last:border-0 border-[#EEF2EA] dark:border-gray-700 hover:bg-[#F7FAF5] dark:hover:bg-gray-700/40">
                    <td className="px-5 py-3">
                      <Link href={`/patients/${p.userId}`} className="font-medium hover:underline">{p.name || p.email}</Link>
                      <div className="text-xs text-gray-500">{p.age !== null && p.age !== undefined ? `${p.age} years · ` : ""}{p.email}</div>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{p.lastNight ? minutesText(p.lastNight.asleepMinutes) : <Muted />}</td>
                    <td className="px-3 py-3 tabular-nums">{p.hrv7d != null ? num(p.hrv7d, "ms") : <Muted />}</td>
                    <td className="px-3 py-3 tabular-nums">
                      {p.stress7d != null ? (
                        <>
                          {num(p.stress7d)}
                          {p.stressChange ? (
                            <span className={cn("ml-2 text-xs", p.stressChange > 0 ? "text-amber-600" : "text-[#5F7D48]")}>
                              {signed(p.stressChange)} vs last week
                            </span>
                          ) : null}
                        </>
                      ) : <Muted />}
                    </td>
                    <td className={cn("px-3 py-3", stale(p.lastSyncAt) && "text-amber-600")}>{ago(p.lastSyncAt)}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <Link href={`/patients/${p.userId}`} className="text-[#4F6B3A] dark:text-[#B9D3A2] font-medium hover:underline">Open</Link>
                      <button onClick={() => remove(p)} className="ml-4 text-gray-400 hover:text-red-600" aria-label={`Stop following ${p.name || p.email}`}>
                        <X className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {rows && others.length > 0 && (
        <Card title="Invitations">
          <ul className="divide-y divide-[#EEF2EA] dark:divide-gray-700">
            {others.map((p) => (
              <li key={p.linkId} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-medium">{p.email}</div>
                  <div className="text-xs text-gray-500">Invited {ago(p.invitedAt)}{p.note ? ` · “${p.note}”` : ""}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn("px-2.5 py-1 rounded-full text-xs", STATUS[p.status]?.className)}>{STATUS[p.status]?.label || p.status}</span>
                  <button onClick={() => remove(p)} className="text-xs text-gray-500 hover:text-red-600">
                    {p.status === "pending" ? "Cancel" : "Remove"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {inviting && <InviteDialog onClose={() => setInviting(false)} onSent={load} />}
    </div>
  )
}

const stale = (iso?: string | null) => !iso || Date.now() - new Date(iso).getTime() > 2 * 86400000
const Muted = () => <span className="text-gray-300 dark:text-gray-600">—</span>

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => <div key={i} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />)}
    </div>
  )
}

function InviteDialog({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [email, setEmail] = useState("")
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState("")

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const r = await api.invitePatient(email.trim(), note.trim())
      setDone(r.hasAccount
        ? `Invitation sent. ${email.trim()} will see it in the app and choose what to share.`
        : `Invitation sent. ${email.trim()} will see it after signing up in the app with this email.`)
      onSent()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="invite-title" className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h2 id="invite-title" className="text-lg font-semibold">Invite a patient</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          They&apos;ll get a request in the Anywhere Healing app. Nothing is shared until they accept and choose what to share.
        </p>
        {done ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg bg-[#8BA872]/15 text-[#3F5A2C] dark:text-[#B9D3A2] text-sm px-4 py-3">{done}</div>
            <div className="flex gap-3">
              <button onClick={() => { setDone(""); setEmail(""); setNote("") }} className="flex-1 h-10 rounded-lg border border-[#D1D9CB] dark:border-gray-600 text-sm">Invite another</button>
              <button onClick={onClose} className="flex-1 h-10 rounded-lg bg-[#8BA872] text-white text-sm font-medium">Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            {error && <div role="alert" className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}
            <label className="block">
              <span className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">Their email (the one they use in the app)</span>
              <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-[#8BA872]" />
            </label>
            <label className="block">
              <span className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">Message (optional)</span>
              <textarea maxLength={300} rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="I'd like to follow your sleep for the next month."
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-[#8BA872] text-sm" />
            </label>
            <button type="submit" disabled={busy} className="w-full h-11 rounded-lg bg-[#8BA872] hover:bg-[#7A946A] text-white font-medium disabled:opacity-60">
              {busy ? "Sending…" : "Send invitation"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
