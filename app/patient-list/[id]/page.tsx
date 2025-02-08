"use client"

import { useState } from "react"
import { BodyDiagram } from "@/app/patient-list/components/body-diagram"
import { InfoSection } from "@/app/patient-list/components/info-section"
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui"
import { Sidebar } from "@/app/patient-list/components/sidebar"
import { Header } from "@/app/patient-list/components/header"
import { PhysicalExamination } from "@/app/patient-list/components/physicalE"

const PATIENT_INFO = [
  { label: "Full Name", value: "ARMA YOGA PRASETYA" },
  { label: "Phone Number", value: "+62 81234451231" },
  { label: "Address", value: "6391 Elgin St. Celina, Delaware 10299" },
  { label: "Date Of Birth", value: "25/04/2019" },
]

const MEDICAL_HISTORY = [
  { label: "Allergies", value: "Second Reaction Severity" },
  { label: "Current Medications", value: "Metacam 1.5mg/mL" },
  { label: "Surgical History", value: "Appendectomy" },
  { label: "Surgical Date", value: "25/04/2019" },
]

const BODY_POINTS = [
  { x: 200, y: 150 }, // Chest
  { x: 200, y: 300 }, // Abdomen
  { x: 200, y: 450 }, // Knee
]

export default function PatientDetailsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("informations")

  const renderTabContent = () => {
    switch (activeTab) {
      case "informations":
        return (
          <div className="space-y-6">
            <InfoSection title="Patient Information" items={PATIENT_INFO} />
            <InfoSection title="Medical History" items={MEDICAL_HISTORY} />
          </div>
        )
      case "physical":
        return <PhysicalExamination />
      default:
        return null
    }
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar darkMode={darkMode} onDarkModeChange={setDarkMode} />
        <div className="flex-1 ml-64">
          <Header doctor={{ name: "Dr. Arma", avatar: "/avatars/doctor.png" }} />
          <main className="p-6">
            <h1 className="text-2xl font-semibold mb-6 dark:text-white">Kristin Watson</h1>

            <Tabs 
              value={activeTab}
              onValueChange={setActiveTab}
              defaultValue="informations" 
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="summary" className="flex gap-2">
                  Summary Patient
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    4 Alerts
                  </span>
                </TabsTrigger>
                <TabsTrigger value="informations">Informations</TabsTrigger>
                <TabsTrigger value="physical">Physical Examination</TabsTrigger>
                <TabsTrigger value="bioscan">BioScan Results</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <BodyDiagram points={BODY_POINTS} />
              </div>
              <div>{renderTabContent()}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

