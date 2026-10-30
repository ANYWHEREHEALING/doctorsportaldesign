"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/app/libs/api"
import { AuthCard, ErrorNote, Field, SubmitButton } from "@/app/components/auth-card"

function Reset() {
  const router = useRouter()
  const token = useSearchParams().get("token") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) return setError("The passwords don't match.")
    setBusy(true)
    try {
      await api.reset(token, password)
      router.replace("/patients")
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  if (!token) return <AuthCard title="Reset link missing"><ErrorNote message="Open the link from your reset email." /></AuthCard>

  return (
    <AuthCard title="Choose a new password" subtitle="You'll be signed out on your other devices.">
      <form onSubmit={submit} className="space-y-4">
        <ErrorNote message={error} />
        <Field label="New password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Field label="Confirm password" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <p className="text-xs text-gray-500">At least 10 characters, with letters and a number.</p>
        <SubmitButton busy={busy}>Save password</SubmitButton>
      </form>
    </AuthCard>
  )
}

export default function Page() {
  return <Suspense><Reset /></Suspense>
}
