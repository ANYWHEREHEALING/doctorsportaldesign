"use client"

// Sign in. Doctors get accounts by invitation only (no public sign-up).

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/app/libs/api"
import { AuthCard, ErrorNote, Field, SubmitButton } from "@/app/components/auth-card"
import { useI18n } from "@/app/libs/i18n"

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const { t } = useI18n()

  // Only go back to pages on this site.
  const next = params.get("next") || ""
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/patients"

  // Already signed in: go straight to the patients.
  useEffect(() => {
    api.me().then(() => router.replace(target)).catch(() => { /* not signed in */ })
  }, [router, target])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await api.login(email.trim(), password)
      router.replace(target)
    } catch (err) {
      setError(t((err as Error).message))
      setBusy(false)
    }
  }

  return (
    <AuthCard title={t("Sign in")} subtitle={t("Follow the clients who share their Charisma Ring data with you.")}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorNote message={error} />
        <Field label={t("Email")} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label={t("Password")} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <SubmitButton busy={busy}>{t("Sign in")}</SubmitButton>
        <div className="text-center">
          <Link href="/forgot-password" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">{t("Forgot password?")}</Link>
        </div>
        <p className="text-xs text-center text-gray-400">{t("Accounts are by invitation only.")}</p>
      </form>
    </AuthCard>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
