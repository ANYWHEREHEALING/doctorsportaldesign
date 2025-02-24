"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "../patient-list/components/sidebar"
import { Header } from "../patient-list/components/header"
import PatientList from "../patient-list/components/patient-list"
import { useRouter } from 'next/navigation'
import type { Patient } from "../patient-list/types/patient"

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [doctor, setDoctor] = useState<{ name: string; avatar: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [allPatients, setAllPatients] = useState<Patient[]>([])

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const headers = new Headers({
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        })

        const res = await fetch(
          `https://api.anywherehealing.com/api/doctor/patient/all`, 
          {
            method: 'GET',
            headers: headers
          }
        
        )

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || 'Failed to fetch patients')
        }

        const data = await res.json()
        if (!Array.isArray(data?.data)) {
          throw new Error('Invalid response structure - expected patients array')
        }
        
        setAllPatients(data.data)
        setPatients(data.data)
      } catch (err: any) {
        console.error('Fetch error:', err)
        setError(err.message || 'Failed to load patient list')
        if (err.response?.status === 401) {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [router])
      

    useEffect(() => {
      const filtered = allPatients?.filter(patient => 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
      setPatients(filtered)
    }, [searchTerm, allPatients])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePatientClick = (patient: Patient) => {
    router.push(`/patient-list/${patient.id}`)
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar darkMode={darkMode} onDarkModeChange={setDarkMode} />
        <div className="flex-1 ml-64">
          <Header 
            doctor={doctor || { name: 'DOC', avatar: '' }} 
            value={searchTerm}
            onSearch={setSearchTerm}
          />
          <main className="h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
            <PatientList 
                patients={patients}
                onPatientClick={handlePatientClick}
                isLoading={isLoading}
            />
          </main>
        </div>
      </div>
    </div>
  )
}