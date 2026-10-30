"use client"

import { useState } from "react"
import Link from "next/link"
import { api } from "@/app/libs/api"
import { AuthCard, ErrorNote, Field, InfoNote, SubmitButton } from "@/app/components/auth-card"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await api.forgot(email.trim())
      setDone("If that email has an account, a reset link is on its way. It works for 1 hour.")
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a link to choose a new one.">
      <form onSubmit={submit} className="space-y-4">
        <ErrorNote message={error} />
        <InfoNote message={done} />
        {!done && <Field label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
        {!done && <SubmitButton busy={busy}>Send reset link</SubmitButton>}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Back to sign in</Link>
        </div>
      </form>
    </AuthCard>
  )
}
