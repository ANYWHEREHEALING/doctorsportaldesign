"use client"

// Opened from the invitation email: set name + password, then signed in.

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/app/libs/api"
import { AuthCard, ErrorNote, Field, SubmitButton } from "@/app/components/auth-card"

function AcceptInvite() {
  const router = useRouter()
  const token = useSearchParams().get("token") || ""
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [clinic, setClinic] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [invalid, setInvalid] = useState("")
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!token) { setInvalid("This page needs the link from your invitation email."); setLoaded(true); return }
    api.inviteInfo(token)
      .then((r) => { setEmail(r.email); setName(r.name || ""); setClinic(r.clinic || "") })
      .catch((e) => setInvalid((e as Error).message))
      .finally(() => setLoaded(true))
  }, [token])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) return setError("The passwords don't match.")
    setBusy(true)
    try {
      await api.acceptInvite(token, name.trim(), clinic.trim(), password)
      router.replace("/patients")
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  if (!loaded) return <AuthCard title="Create your account"><p className="text-center text-sm text-gray-500">Checking your invitation…</p></AuthCard>
  if (invalid) return <AuthCard title="Invitation not valid"><ErrorNote message={invalid} /></AuthCard>

  return (
    <AuthCard title="Create your account" subtitle={`You were invited as ${email}.`}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorNote message={error} />
        <Field label="Your name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Ana García" />
        <Field label="Clinic or practice (optional)" autoComplete="organization" value={clinic} onChange={(e) => setClinic(e.target.value)} />
        <Field label="Password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Field label="Confirm password" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <p className="text-xs text-gray-500">At least 10 characters, with letters and a number.</p>
        <SubmitButton busy={busy}>Create account</SubmitButton>
      </form>
    </AuthCard>
  )
}

export default function Page() {
  return <Suspense><AcceptInvite /></Suspense>
}
