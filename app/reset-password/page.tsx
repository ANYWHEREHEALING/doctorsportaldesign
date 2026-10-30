"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/app/libs/api"
import { AuthCard, ErrorNote, Field, SubmitButton } from "@/app/components/auth-card"
import { useI18n } from "@/app/libs/i18n"

function Reset() {
  const router = useRouter()
  const token = useSearchParams().get("token") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const { t } = useI18n()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) return setError(t("The passwords don't match."))
    setBusy(true)
    try {
      await api.reset(token, password)
      router.replace("/patients")
    } catch (err) {
      setError(t((err as Error).message))
      setBusy(false)
    }
  }

  if (!token) return <AuthCard title={t("Reset link missing")}><ErrorNote message={t("Open the link from your reset email.")} /></AuthCard>

  return (
    <AuthCard title={t("Choose a new password")} subtitle={t("You'll be signed out on your other devices.")}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorNote message={error} />
        <Field label={t("New password")} type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Field label={t("Confirm password")} type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <p className="text-xs text-gray-500">{t("At least 10 characters, with letters and a number.")}</p>
        <SubmitButton busy={busy}>{t("Save password")}</SubmitButton>
      </form>
    </AuthCard>
  )
}

export default function Page() {
  return <Suspense><Reset /></Suspense>
}
