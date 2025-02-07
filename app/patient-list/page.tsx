"use client"

import { useState } from "react"
import { Sidebar } from "../patient-list/components/sidebar"
import { Header } from "../patient-list/components/header"
import { PatientList } from "../patient-list/components/patient-list"



const MOCK_PATIENTS = [
  {
    id: "1",
    name: "Kristin Watson",
    avatar: "/avatars/01.png",
    condition: "Infectious disease",
    lastScanDate: "Dec 18, 2024",
    specialty: "Geriatrician",
    status: "Confirmed",
  },
  {
    id: "2",
    name: "Jacob Jones",
    avatar: "/avatars/02.png",
    condition: "Infectious disease",
    lastScanDate: "Dec 18, 2024",
    specialty: "Internist",
    status: "Confirmed",
  },
  // Add more mock patients here...
] as const

const DOCTOR = {
  name: "Dr. Arma",
  avatar: "/avatars/doctor.png",
}



export default function DashboardPage() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar darkMode={darkMode} onDarkModeChange={setDarkMode} />
        <div className="flex-1 ml-64">
          <Header doctor={DOCTOR} />
          <main className="h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
            <PatientList patients={MOCK_PATIENTS} />
          </main>
        </div>
      </div>
    </div>
  )
}

