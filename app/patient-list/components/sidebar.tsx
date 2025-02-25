"use client"

import { Home, Bell, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button, Switch } from "@/app/components/ui"
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from "react"

interface DoctorData {
  id: number
  name: string
  email: string
  doctor_id: string
}

interface SidebarProps {
  darkMode: boolean
  onDarkModeChange: (value: boolean) => void
}

export function Sidebar({ darkMode, onDarkModeChange }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null)

  useEffect(() => {
    const storedDoctor = localStorage.getItem('doctor')
    if (storedDoctor) {
      try {
        const doctor = JSON.parse(storedDoctor)
        setDoctorData(doctor)
      } catch (err) {
        console.error('Error parsing doctor data:', err)
      }
    }
  }, [])

  const handleLogout = async () => {
    try {
      const formData = new FormData()
      await fetch('https://api.anywherehealing.com/api/doctor/logout', {
        method: "POST",
        headers: {
          "X-XSRF-TOKEN": process.env.NEXT_PUBLIC_XSRF_TOKEN || '',
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('doctor')
      router.push('/')
    }
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-col h-full">
        {/* Logo Section - Unchanged */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Group.png"
              alt="Anywhere Healing"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-semibold text-xl dark:text-white">Anywhere Healing</span>
          </Link>
        </div>

        {/* Navigation - Unchanged */}
        <nav className="flex-1 px-4 space-y-2">
          <Link
            href="/patient-list"
            className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg ${
              pathname === "/patient-list" 
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" 
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <Home className="h-5 w-5" />
            Patient List
          </Link>
          <Link
            href="/notifications"
            className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg ${
              pathname === "/notifications"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <Bell className="h-5 w-5" />
            Notifications
          </Link>
        </nav>

        {/* New Doctor Info Section */}
        {doctorData && (
          <div className="mx-4 mb-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-sm font-medium dark:text-white">{doctorData.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {doctorData.doctor_id}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doctorData.email}</p>
          </div>
        )}

        {/* Footer Section - Unchanged */}
        <div className="p-4 border-t dark:border-gray-800">
          <Button 
            className="w-full justify-start text-gray-600 dark:text-gray-300"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
          <div className="flex items-center justify-between mt-4 px-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Light mode</span>
            <Switch 
              checked={darkMode} 
              onCheckedChange={onDarkModeChange} 
              className="bg-gray-300 dark:bg-gray-600" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}