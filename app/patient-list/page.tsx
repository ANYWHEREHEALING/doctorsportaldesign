"use client"

import { useState } from "react"
import { Sidebar } from "../patient-list/components/sidebar"
import { Header } from "../patient-list/components/header"
import { PatientList } from "../patient-list/components/patient-list"



const patients = [
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





export default function DashboardPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase()
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      patient.condition.toLowerCase().includes(searchLower) ||
      patient.specialty.toLowerCase().includes(searchLower) ||
      patient.status.toLowerCase().includes(searchLower)
    )
  })
  

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar darkMode={darkMode} onDarkModeChange={setDarkMode} />
        <div className="flex-1 ml-64">
          <Header 
            doctor={{ name: "Dr. Arma", avatar: "/doctor-avatar.jpg" }} 
            value={searchTerm}
            onSearch={setSearchTerm}
          />
          <main className="h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
          <PatientList patients={filteredPatients} />
          </main>
        </div>
      </div>
    </div>
  )
}

