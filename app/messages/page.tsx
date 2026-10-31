"use client"

import { useEffect, useRef, useState } from "react"
import { ChatAvailability, ChatConversation, ChatMessage, chatApi, ApiError } from "@/app/libs/api"
import { useDoctor } from "@/app/components/shell"
import { useI18n } from "@/app/libs/i18n"

type Pending = { text: string; id: string; failed: boolean }
export default function MessagesPage() {
  const { lang } = useI18n()
  const doctor = useDoctor()
  const queueKey = (id: number) => `ah.chat.pending.${doctor?.id}.${id}`
  const historyElement = useRef<HTMLDivElement>(null)
  const tr = (en: string, es: string) => lang === "es" ? es : en
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [pending, setPending] = useState<Pending | null>(null)
  const [error, setError] = useState("")
  const [blocked, setBlocked] = useState(false)
  const [hasOlder, setHasOlder] = useState(false)
  const [readId, setReadId] = useState(0)
  const [availability, setAvailability] = useState<ChatAvailability>({ away: false, awayUntil: null, note: "" })
  const [saving, setSaving] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [sending, setSending] = useState(false)
  const active = useRef<number | null>(null)
  const rows = useRef<ChatMessage[]>([])
  const merge = (a: ChatMessage[], b: ChatMessage[]) => Array.from(new Map([...a,...b].map(m => [m.id,m])).values()).sort((a,b) => a.id-b.id)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const poll = async () => {
      try {
        const r = await chatApi.list()
        if (cancelled) return
        setConversations(r.conversations)
        const query = Number(new URLSearchParams(window.location.search).get("conversation"))
        setSelected(old => old ?? (r.conversations.some(c => c.linkId === query) ? query : r.conversations.find(c => c.userId === Number(new URLSearchParams(window.location.search).get("patient")))?.linkId ?? r.conversations[0]?.linkId ?? null))
      } catch (e) { if (!cancelled) setError((e as Error).message) }
      if (!cancelled) timer = setTimeout(poll, 10000)
    }
    void poll()
    chatApi.availability().then(r => { if (!cancelled) setAvailability(r.availability) }).catch(() => {})
    return () => { cancelled = true; clearTimeout(timer) }
  }, [])

  useEffect(() => {
    active.current = selected
    rows.current = []
    setMessages([]); setPending(null)
    if (selected) { try { const saved = sessionStorage.getItem(queueKey(selected)); if (saved) { const value = JSON.parse(saved); if (typeof value.text === "string" && typeof value.id === "string") setPending({ ...value, failed: true }) } } catch { /* retain server history */ } }
    setDraft(""); setError(""); setBlocked(false); setReadId(0); setHasOlder(false)
    if (!selected) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const poll = async () => {
      try {
        if (document.visibilityState !== "visible") { timer = setTimeout(poll, 5000); return }
        const last = rows.current.at(-1)?.id
        const r = await chatApi.history(selected, last ? `?after=${last}` : "")
        if (cancelled) return
        rows.current = merge(rows.current, r.messages)
        setMessages(current => merge(current, rows.current)); setReadId(r.userReadId); setError("")
        setPending(current => {
          if (current && r.messages.some(m => m.clientMessageId === current.id && m.senderRole === "doctor")) {
            try { sessionStorage.removeItem(queueKey(selected)) } catch {}
            return null
          }
          return current
        })
        if (!last) setHasOlder(r.hasMore)
        timer = setTimeout(poll, last && r.hasMore ? 0 : 5000)
      } catch (e) {
        if (cancelled) return
        setError((e as Error).message)
        if (e instanceof ApiError && [403,404].includes(e.status)) { setBlocked(true); rows.current = []; setMessages([]); return }
        timer = setTimeout(poll, 5000)
      }
    }
    void poll()
    return () => { cancelled = true; clearTimeout(timer) }
  }, [selected])

  const send = async (retry?: Pending) => {
    if (!selected || sending || blocked) return
    const id = selected
    const value = retry || { text: draft.trim(), id: crypto.randomUUID(), failed: false }
    if (!value.text || value.text.length > 4000) return
    try { sessionStorage.setItem(queueKey(id), JSON.stringify(value)) } catch { /* still retryable in memory */ }
    setSending(true); setPending({ ...value, failed: false }); if (!retry) setDraft("")
    try {
      const r = await chatApi.send(id, value.text, value.id)
      if (active.current !== id) return
      // Do not advance the polling cursor here: intervening replies may exist.
      setMessages(current => merge(current, [r.message])); setPending(null); try { sessionStorage.removeItem(queueKey(id)) } catch {} ; setError("")
    } catch (e) { if (active.current === id) { setPending({ ...value, failed: true }); setError((e as Error).message) } }
    finally { setSending(false) }
  }
  const older = async () => {
    if (!selected || !messages.length || loadingOlder) return
    const id = selected; setLoadingOlder(true)
    try {
      const r = await chatApi.history(id, `?before=${messages[0].id}`)
      if (active.current !== id) return
      rows.current = merge(rows.current, r.messages); setMessages(rows.current); setHasOlder(r.hasMore)
    } catch (e) { if (active.current === id) setError((e as Error).message) }
    finally { setLoadingOlder(false) }
  }
  const saveAvailability = async () => {
    setSaving(true)
    try { const r = await chatApi.setAvailability(availability); setAvailability(r.availability); setError("") }
    catch (e) { setError((e as Error).message) }
    finally { setSaving(false) }
  }
  useEffect(() => {
    const element = historyElement.current
    if (!element || !selected || blocked) return
    let acknowledged = 0
    const visible = () => {
      if (!document.hasFocus() || document.visibilityState !== "visible") return
      const bounds = element.getBoundingClientRect()
      const ids = Array.from(element.querySelectorAll<HTMLElement>("[data-message-id]")).filter(node => {
        const rect = node.getBoundingClientRect()
        return rect.bottom > bounds.top && rect.top < bounds.bottom
      }).map(node => Number(node.dataset.messageId))
      const id = Math.max(0,...ids)
      if (id > acknowledged) { acknowledged = id; void chatApi.read(selected, id).catch(() => { acknowledged = 0 }) }
    }
    visible()
    element.addEventListener("scroll", visible)
    window.addEventListener("focus", visible)
    document.addEventListener("visibilitychange", visible)
    return () => { element.removeEventListener("scroll", visible); window.removeEventListener("focus", visible); document.removeEventListener("visibilitychange", visible) }
  }, [selected, messages, blocked])
  const selectedName = conversations.find(c => c.linkId === selected)?.name
  return <div className="space-y-5">
    <h1 className="text-2xl font-semibold">{tr("Messages", "Mensajes")}</h1>
    <section className="rounded-2xl border p-4 bg-white dark:bg-gray-800 space-y-3">
      <label className="flex gap-2"><input type="checkbox" checked={availability.away} onChange={e => setAvailability({ ...availability, away: e.target.checked })} />{tr("I'm away (patients can still message)", "Estoy ausente (los pacientes pueden escribir)")}</label>
      {availability.away && <label className="block text-sm">{tr("Return date (optional)", "Fecha de regreso (opcional)")}<input aria-label={tr("Return date", "Fecha de regreso")} type="datetime-local" className="block border rounded p-2 bg-transparent" value={availability.awayUntil ? new Date(new Date(availability.awayUntil).getTime() - new Date(availability.awayUntil).getTimezoneOffset()*60000).toISOString().slice(0,16) : ""} onChange={e => setAvailability({ ...availability, awayUntil: e.target.value ? new Date(e.target.value).toISOString() : null })} /></label>}
      <input aria-label={tr("Response expectation", "Tiempo de respuesta")} maxLength={300} value={availability.note} onChange={e => setAvailability({ ...availability, note: e.target.value })} placeholder={tr("Optional response expectation, e.g. within two business days", "Tiempo de respuesta opcional, p. ej. dos días hábiles")} className="border rounded p-2 w-full bg-transparent" />
      <button onClick={saveAvailability} disabled={saving} className="rounded bg-[#4F6B3A] text-white px-4 py-2 disabled:opacity-50">{tr("Save availability", "Guardar disponibilidad")}</button>
    </section>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    <div className="grid md:grid-cols-[250px_1fr] gap-4">
      <nav aria-label={tr("Conversations", "Conversaciones")} className="border rounded-2xl p-2 bg-white dark:bg-gray-800">
        {!conversations.length && <p className="p-3 text-sm">{tr("No active patient connections.", "No hay pacientes conectados.")}</p>}
        {conversations.map(c => <button key={c.linkId} disabled={Boolean(pending) || sending} onClick={() => setSelected(c.linkId)} aria-pressed={c.linkId === selected} className={`block w-full text-left rounded-xl p-3 ${c.linkId === selected ? "bg-[#8BA872]/20" : ""}`}><span className="font-semibold">{c.name}</span>{c.unread > 0 && <span className="ml-2 rounded-full bg-[#4F6B3A] text-white px-2 text-xs">{c.unread}</span>}<span className="block text-xs truncate opacity-60">{c.lastMessage?.text || tr("Start a conversation", "Iniciar conversación")}</span></button>)}
      </nav>
      <section className="border rounded-2xl p-4 bg-white dark:bg-gray-800 min-w-0">
        <h2 className="font-semibold mb-2">{selectedName || tr("Select a patient", "Selecciona un paciente")}</h2>
        <p className="text-xs opacity-60 mb-4">{tr("Messages aren't monitored continuously. Do not use for emergencies.", "Los mensajes no se supervisan continuamente. No usar para emergencias.")}</p>
        <div ref={historyElement} className="h-[420px] overflow-y-auto space-y-3" aria-label={tr("Message history", "Historial de mensajes")}>
          {hasOlder && <button disabled={loadingOlder} onClick={older} className="text-sm underline">{tr("Load earlier messages", "Cargar mensajes anteriores")}</button>}
          {messages.map(m => <article data-message-id={m.id} key={m.id} className={`max-w-[90%] rounded-xl p-3 ${m.senderRole === "doctor" ? "ml-auto bg-[#8BA872]/20" : "bg-gray-100 dark:bg-gray-700"}`}><p className="whitespace-pre-wrap break-words">{m.text}</p><p className="text-[11px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleString(lang)}{m.senderRole === "doctor" && ` · ${m.id <= readId ? tr("Read", "Leído") : tr("Sent", "Enviado")}`}</p></article>)}
          {pending && !messages.some(m => m.clientMessageId === pending.id) && <div className="ml-auto max-w-[90%] rounded-xl p-3 border"><p className="whitespace-pre-wrap break-words">{pending.text}</p>{pending.failed ? <button disabled={sending || blocked} className="text-red-600 underline" onClick={() => send(pending)}>{tr("Failed · Retry", "Error · Reintentar")}</button> : <p className="text-xs">{tr("Sending…", "Enviando…")}</p>}</div>}
        </div>
        <form onSubmit={e => { e.preventDefault(); void send() }} className="flex gap-2 mt-4">
          <textarea aria-label={tr("Message", "Mensaje")} disabled={!selected || blocked || Boolean(pending)} maxLength={4000} value={draft} onChange={e => setDraft(e.target.value)} className="w-full border rounded-xl p-3 bg-transparent" placeholder={tr("Write a message…", "Escribe un mensaje…")} />
          <button disabled={!selected || blocked || sending || Boolean(pending) || !draft.trim()} className="rounded-xl px-4 bg-[#4F6B3A] text-white disabled:opacity-40">{tr("Send", "Enviar")}</button>
        </form>
      </section>
    </div>
  </div>
}
