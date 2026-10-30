"use client"

// Shared frame for the sign-in, invitation and password pages.

import Image from "next/image"
import { Moon, Sun } from "lucide-react"
import { useDarkMode } from "./shell"
import { LanguageSwitch, useI18n } from "@/app/libs/i18n"

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const [dark, setDark] = useDarkMode()
  const { t } = useI18n()
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F1] dark:bg-gray-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-[#D1D9CB] dark:border-gray-700 p-8 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <Image src="/Group.png" alt="Anywhere Healing" width={52} height={52} priority />
            <div className="text-xs text-gray-500 mt-2">{t("Practitioner portal")}</div>
          </div>
          <h1 className="text-2xl font-medium text-center dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <div className="flex justify-center items-center gap-3 mt-6">
          <LanguageSwitch />
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg text-gray-500 hover:bg-white/60 dark:hover:bg-gray-800"
            aria-label={dark ? t("Light mode") : t("Dark mode")}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{label}</span>
      <input
        {...props}
        className="w-full h-12 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#8BA872]"
      />
    </label>
  )
}

export function SubmitButton({ busy, children }: { busy?: boolean; children: React.ReactNode }) {
  const { t } = useI18n()
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full h-12 rounded-lg bg-[#8BA872] hover:bg-[#7A946A] text-white font-medium disabled:opacity-60"
    >
      {busy ? t("Please wait…") : children}
    </button>
  )
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null
  return <div role="alert" className="rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-3">{message}</div>
}

export function InfoNote({ message }: { message: string }) {
  if (!message) return null
  return <div role="status" className="rounded-lg bg-[#8BA872]/15 text-[#3F5A2C] dark:text-[#B9D3A2] text-sm px-4 py-3">{message}</div>
}
