"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Patient } from '../types/patient'
import { cn } from '@/app/libs/utils'
import { Input } from "@/app/components/ui"
import { Search } from "lucide-react"

export default function DashboardPage() {
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

  const handlePatientClick = (patient: Patient) => {
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {patients.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No patients found {searchTerm ? 'matching your search' : 'in the system'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Patient Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handlePatientClick(patient)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={patient.avatar} 
                            alt={patient.name}
                            className="h-10 w-10 rounded-full object-cover mr-4"
                          />
                          <span className="font-medium text-gray-900">{patient.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{patient.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-sm",
                          patient.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          patient.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-600 hover:text-blue-900 font-medium"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePatientClick(patient)
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              patientsCount={patients.length}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              className="px-6 py-4 border-t border-gray-200 bg-gray-50"
            />
          </>
        )}
      </div>
    </div>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  patientsCount: number
  totalItems: number
  onPageChange: (page: number) => void
  className?: string
}

const Pagination = ({
  currentPage,
  totalPages,
  patientsCount,
  totalItems,
  onPageChange,
  className
}: PaginationProps) => {
  const firstItem = Math.max((currentPage - 1) * 10 + 1, 1)
  const lastItem = Math.min(firstItem + patientsCount - 1, totalItems)

  return (
    <div className={`flex items-center justify-between ${className || ''}`}>
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{firstItem}</span> to{' '}
          <span className="font-medium">{lastItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> patients
        </p>
      </div>
      
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
              currentPage === page 
                ? "z-10 bg-blue-50 border-blue-500 text-blue-600" 
                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
            )}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  )
}