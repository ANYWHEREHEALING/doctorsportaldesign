"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "./components/sidebar"
import { Header } from "./components/header"
import { PatientDetails } from "./types/patient"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { cn } from '@/app/libs/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui"
import { User } from "lucide-react";

interface ErrorWithResponse extends Error {
  response?: {
    status: number
  }
}


export default function DashboardPage() {
  const [patients, setPatients] = useState<PatientDetails[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [allPatients, setAllPatients] = useState<PatientDetails[]>([])
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
          `https://api.anywherehealing.com/api/doctor/patient/all?page=${currentPage}`,
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
        
        if (!data?.data || typeof data.data !== 'object' || !Array.isArray(data.data.data)) {
          throw new Error('Invalid response structure - expected paginated patients array')
        }

        setAllPatients(data.data.data)
        setPatients(data.data.data)
        setTotalPages(Math.max(Number(data.data.last_page) || 1, 1))
        setTotalItems(Math.max(Number(data.data.total) || 0, 0))
      } catch (err: unknown) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load patient list');
        
        if (err instanceof Error && 'response' in err && (err as ErrorWithResponse).response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [router, currentPage])

  useEffect(() => {
    const filtered = allPatients.filter(patient => 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setPatients(filtered)
  }, [searchTerm, allPatients])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handlePatientClick = (patient: PatientDetails) => {
    router.push(`/patient-list/${patient.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-50 rounded-lg mt-8">
        <div className="text-red-600 font-medium mb-4">
          Error loading patients: {error}
        </div>
        <button
          onClick={() => handlePageChange(currentPage)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar darkMode={darkMode} onDarkModeChange={setDarkMode} />
        <div className="flex-1 ml-64">
          <Header 
            doctor={{ name: 'DOC', avatar: '' }} 
            value={searchTerm}
            onSearch={setSearchTerm}
          />
          <main className="h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 p-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow 
                      key={patient.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/patient-list/${patient.id}`)}
                    >
                      <TableCell className="flex items-center gap-3">
                        <User className="h-10 w-10 text-gray-400" />
                        {patient.name}
                      </TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-sm",
                          patient.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          patient.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {patient.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/patient-list/${patient.id}`);
                          }}
                        >
                          View Details
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} patients
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}