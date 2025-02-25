"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../components/sidebar"
import { Header } from "../components/header"
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui"
import { BodyDiagram } from "../components/body-diagram"
import BioScanPage from "../components/bio-scan"
import { InfoSection } from "../components/info-section"
import { PhysicalExamination } from "../components/physicalE"
import { Skeleton } from "@/app/components/ui"

interface PatientDetails {
  id: string
  name: string
  avatar: string
  condition: string
  lastScanDate: string
  specialty: string
  status: "Confirmed" | "Pending" | "Cancelled"
  email: string
  phone?: string
  address?: string
  medicalHistory?: Array<{ label: string; value: string }>
  patientInfo?: Array<{ label: string; value: string }>
}

interface BioScan {
  id: string
  scan_date: string
  condition: string
  severity: "Low" | "Moderate" | "High"
  biomarkers: {
    muscle_pain: number
    energy_level: number
    inflammation: number
  }
  notes?: string
}

interface PhysicalData {
  height?: string
  weight?: string
  bloodPressure?: string
}

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params; // Destructure `id` from `params`
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("informations")
  const [searchTerm, setSearchTerm] = useState('')
  const [patientData, setPatientData] = useState<PatientDetails | null>(null)
  const [bioScans, setBioScans] = useState<BioScan[]>([])
  const [physicalData, setPhysicalData] = useState<PhysicalData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, bioscanRes] = await Promise.all([
          fetch(`https://api.anywherehealing.com/api/doctor/patient/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': 'application/json'
            }
          }).then(res => {
            if (!res.ok) throw new Error('Patient fetch failed');
            return res.json();
          }),
          fetch(`https://api.anywherehealing.com/api/doctor/patient/get-bioscan-record/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': 'application/json'
            }
          }).then(res => {
            if (!res.ok) throw new Error('Bioscan fetch failed');
            return res.json();
          })
        ]);

        if (!patientRes.data || !bioscanRes.data) {
          console.error('API Responses:', { patientRes, bioscanRes });
          throw new Error(patientRes.message || bioscanRes.message || 'Missing patient data');
        }

        setPatientData({
          id: patientRes.data.id as string,
          name: patientRes.data.name as string,
          avatar: patientRes.data.avatar as string || '/default-avatar.png',
          condition: patientRes.data.condition as string,
          lastScanDate: patientRes.data.last_scan_date as string,
          specialty: patientRes.data.specialty as string,
          status: patientRes.data.status as "Confirmed" | "Pending" | "Cancelled",
          email: patientRes.data.email as string,
          medicalHistory: [
            { label: "Allergies", value: patientRes.data.allergies as string || "None" },
            { label: "Chronic Conditions", value: patientRes.data.chronic_conditions as string || "None" },
            { label: "Surgeries", value: patientRes.data.surgeries as string || "None" }
          ],
          patientInfo: [
            { label: "Email", value: patientRes.data.email as string },
            { label: "Phone", value: patientRes.data.phone as string },
            { label: "Address", value: patientRes.data.address as string }
          ]
        })
        setBioScans(bioscanRes.data.results)
      } catch (err) {
        console.error('Failed to load patient data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  useEffect(() => {
    const fetchPhysicalData = async () => {
      const res = await fetch(`https://api.anywherehealing.com/api/doctor/patient/physical/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      })
  
      if (!res.ok) {
        throw new Error('Physical data fetch failed');
      }
      
      const data = await res.json();
      if (!data?.data) {
        throw new Error('Invalid physical data structure');
      }
      setPhysicalData(data.data)
    }
    fetchPhysicalData()
  }, [id])

  const renderTabContent = () => {
    if (isLoading) return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )

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
        return <PhysicalExamination physicalData={physicalData || {}} />
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
              {isLoading ? <Skeleton className="h-8 w-[200px]" /> : patientData?.name}
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