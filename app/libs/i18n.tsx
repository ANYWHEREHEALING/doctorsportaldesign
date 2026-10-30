"use client"

// Portal language (English / Spanish).
//
// Texts are written in English in the code: t("Sign in"). Spanish comes
// from the dictionary in i18n-es.ts; anything missing falls back to English.
// The choice is remembered in this browser and, once signed in, saved on the
// doctor's account so emails to them and their patients use it too.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { ES } from "./i18n-es"
import { setFormatLanguage } from "./format"

export type Lang = "en" | "es"

const STORAGE_KEY = "portal.lang"

interface Ctx {
  lang: Lang
  /** Change language; `remember` stores it in this browser. */
  setLang: (lang: Lang, remember?: boolean) => void
}

const LanguageContext = createContext<Ctx>({ lang: "en", setLang: () => {} })

export function storedLanguage(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === "es" || v === "en" ? v : null
  } catch {
    return null
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  const apply = useCallback((l: Lang) => {
    setFormatLanguage(l)
    document.documentElement.lang = l
    setLangState(l)
  }, [])

  useEffect(() => {
    const initial = storedLanguage()
      ?? (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("es") ? "es" : "en")
    apply(initial)
  }, [apply])

  const setLang = useCallback((l: Lang, remember = true) => {
    apply(l)
    if (remember) {
      try { localStorage.setItem(STORAGE_KEY, l) } catch { /* private mode */ }
    }
  }, [apply])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const { lang, setLang } = useContext(LanguageContext)
  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    let s = lang === "es" ? ES[key] ?? key : key
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v))
    return s
  }, [lang])
  return { lang, setLang, t }
}

/** EN | ES switch. `onChange` lets signed-in pages save it on the account. */
export function LanguageSwitch({ onChange, className = "" }: { onChange?: (l: Lang) => void; className?: string }) {
  const { lang, setLang } = useI18n()
  return (
    <div className={`inline-flex rounded-lg border border-[#D1D9CB] dark:border-gray-600 overflow-hidden text-xs ${className}`} role="group" aria-label="Language / Idioma">
      {(["en", "es"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => { setLang(l); onChange?.(l) }}
          aria-pressed={lang === l}
          className={lang === l ? "px-2.5 h-7 bg-[#8BA872] text-white font-medium" : "px-2.5 h-7 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"}
        >
          {l === "en" ? "EN" : "ES"}
        </button>
      ))}
    </div>
  )
}
