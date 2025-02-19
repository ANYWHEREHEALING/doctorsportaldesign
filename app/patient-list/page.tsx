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

  useEffect(() => {
    const storedDoctor = localStorage.getItem('doctor')
    if (storedDoctor) setDoctor(JSON.parse(storedDoctor))

      const fetchPatients = async () => {
        setIsLoading(true)
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            router.push('/login')
            return
          }
      
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/patients?page=${currentPage}&search=${searchTerm}`,
            {
              headers: {
                Authorization: `Bearer ${token}` 
              }
            }
          )
        const data = await res.json()
        setPatients(data.patients)
        setTotalPages(data.totalPages)
      } catch (err) {
        console.error('Error fetching patients:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPatients()
  }, [currentPage, searchTerm])

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
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onPatientClick={handlePatientClick}
              isLoading={isLoading}
            />
          </main>
        </div>
      </div>
    </div>
  )
}