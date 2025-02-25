"use client"

import { useState } from "react"
import { Sidebar } from "../components/sidebar"
import { Header } from "../components/header"
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui"
import { BodyDiagram } from "../components/body-diagram"
import BioScanPage from "../components/bio-scan"
import { InfoSection } from "../components/info-section"
import { PhysicalExamination } from "../components/physicalE"
import type { PatientDetails, BioScan, PhysicalData } from './types'

interface PatientDetailsContentProps {
  patientData: PatientDetails;
  bioScans: BioScan[];
  physicalData: PhysicalData;
  id: string;
}

export default function PatientDetailsContent({
  patientData,
  bioScans,
  physicalData,
  id
}: PatientDetailsContentProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("informations")
  const [searchTerm, setSearchTerm] = useState('')

  const renderTabContent = () => {
    switch (activeTab) {
      case "informations":
        return (
          <div className="space-y-6">
            <InfoSection
              title="Patient Information"
              items={patientData?.patientInfo || []}
            />
            <InfoSection
              title="Medical History"
              items={patientData?.medicalHistory || []}
            />
          </div>
        )
      case "physical":
        return <PhysicalExamination physicalData={physicalData} />
      case "bioscan":
        return <BioScanPage id={id} scans={bioScans} />
      default:
        return null
    }
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar darkMode={darkMode} onDarkModeChange={setDarkMode} />
        <div className="flex-1 ml-64">
          <Header
            doctor={{ name: "Dr. Arma", avatar: "/avatars/doctor.png" }}
            value={searchTerm}
            onSearch={setSearchTerm}
          />
          <main className="p-6">
            <h1 className="text-2xl font-semibold mb-6 dark:text-white">
              {patientData?.name}
            </h1>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
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
                <BodyDiagram points={[]} />
              </div>
              <div>{renderTabContent()}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
