"use client"

// Signed-in layout: sidebar + content. Checks the session once; if it has
// ended, the api helper sends the doctor back to the sign-in page.

import { createContext, useContext, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Moon, Sun, Users } from "lucide-react"
import { api, Doctor } from "@/app/libs/api"
import { cn } from "@/app/libs/utils"

const DoctorContext = createContext<Doctor | null>(null)
export const useDoctor = () => useContext(DoctorContext)

export function useDarkMode(): [boolean, (v: boolean) => void] {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    try { setDark(localStorage.getItem("portal.dark") === "1") } catch { /* private mode */ }
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  const set = (v: boolean) => {
    setDark(v)
    try { localStorage.setItem("portal.dark", v ? "1" : "0") } catch { /* ignore */ }
  }
  return [dark, set]
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [dark, setDark] = useDarkMode()
  const [signingOut, setSigningOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    api.me().then((r) => setDoctor(r.doctor)).catch(() => { /* 401 → redirected by api */ })
  }, [])

  const signOut = async () => {
    setSigningOut(true)
    try { await api.logout() } catch { /* cookie is cleared either way */ }
    router.replace("/")
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F1] dark:bg-gray-900">
        <div className="h-10 w-10 rounded-full border-4 border-[#D1D9CB] border-t-[#8BA872] animate-spin" aria-label="Loading" />
      </div>
    )
  }

  const nav = [{ href: "/patients", label: "Patients", icon: Users }]

  return (
    <DoctorContext.Provider value={doctor}>
      <div className="min-h-screen bg-[#F4F7F1] dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <aside className="no-print fixed inset-y-0 left-0 w-60 hidden md:flex flex-col bg-white dark:bg-gray-800 border-r border-[#D1D9CB] dark:border-gray-700">
          <div className="flex items-center gap-3 px-6 h-16 border-b border-[#E3E9DE] dark:border-gray-700">
            <Image src="/Group.png" alt="" width={30} height={30} />
            <div className="leading-tight">
              <div className="font-semibold text-sm">Anywhere Healing</div>
              <div className="text-[11px] text-gray-500">Practitioner portal</div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                  pathname.startsWith(href)
                    ? "bg-[#8BA872]/15 text-[#4F6B3A] dark:text-[#B9D3A2] font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-[#E3E9DE] dark:border-gray-700 space-y-3">
            <div className="text-sm">
              <div className="font-medium truncate">{doctor.name || doctor.email}</div>
              {doctor.clinic && <div className="text-xs text-gray-500 truncate">{doctor.clinic}</div>}
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setDark(!dark)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={dark ? "Light mode" : "Dark mode"}
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={signOut}
                disabled={signingOut}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Small screens: top bar instead of the sidebar */}
        <header className="no-print md:hidden flex items-center justify-between px-4 h-14 bg-white dark:bg-gray-800 border-b border-[#D1D9CB] dark:border-gray-700">
          <Link href="/patients" className="flex items-center gap-2 font-semibold text-sm">
            <Image src="/Group.png" alt="" width={24} height={24} /> Patients
          </Link>
          <button onClick={signOut} className="text-sm text-gray-600 dark:text-gray-300">Sign out</button>
        </header>

        <main className="md:ml-60 px-4 md:px-8 py-6 max-w-[1200px]">{children}</main>
      </div>
    </DoctorContext.Provider>
  )
}

export function Card({ title, subtitle, action, children, className }: {
  title?: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string
}) {
  return (
    <section className={cn("bg-white dark:bg-gray-800 rounded-2xl border border-[#E3E9DE] dark:border-gray-700 p-5", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
