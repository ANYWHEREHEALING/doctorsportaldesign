"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BodyDiagram } from '../components/body-diagram'
import PatientInfo from '../components/patient-info'
import BioScanPage from '../components/bio-scan'
import { PhysicalExamination } from '../components/physicalE'
import ErrorComponent from '../components/error'
import PatientDetailsSkeleton from '../components/loading'

interface PatientInformation {
  fullname: string
  phone_number: string
  address: string
  date_of_birth: string
}

interface PatientDetails {
  information: {
    patient_information: PatientInformation
    medical_history: null | any
  }
  physical_examination: {
    height: string
    weight: string
    sleep_score: any[]
  }
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export default function PatientDetailsContentWrapper({ id }: { id: string }) {
  const router = useRouter()
  const [patientData, setPatientData] = useState<PatientDetails | null>(null)
  const [bioScans, setBioScans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        setIsLoading(true)
        
        const patientResponse = await fetch(
          `https://api.anywherehealing.com/api/doctor/patient/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        )

        if (!patientResponse.ok) throw new Error('Failed to fetch patient details')
        const patientResult: ApiResponse<PatientDetails> = await patientResponse.json()
        if (!patientResult.success) throw new Error(patientResult.message || 'Failed to fetch patient details')

        setPatientData(patientResult.data)

        const bioScansResponse = await fetch(
          `https://api.anywherehealing.com/api/doctor/patient/get-bioscan-record/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        )

        if (!bioScansResponse.ok) throw new Error('Failed to fetch bio scans')
        const bioScansResult = await bioScansResponse.json()
        if (bioScansResult.success && bioScansResult.data.data) setBioScans(bioScansResult.data.data)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  if (error) return <ErrorComponent message={error} />
  if (isLoading || !patientData) return <PatientDetailsSkeleton />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-6">
          <h1 className="text-2xl font-semibold mb-4">{patientData.information.patient_information.fullname}</h1>
          
          <div className="flex space-x-8 border-b mb-6">
            <TabButton active={true}>Summary Patient</TabButton>
            <TabButton>Informations</TabButton>
            <TabButton>Physical Examination</TabButton>
            <TabButton>BioScan Results</TabButton>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <BodyDiagram points={[
                { x: 200, y: 150 },
                { x: 200, y: 300 },
                { x: 200, y: 450 }
              ]} />
            </div>

            <div className="col-span-8 space-y-6">
              <PatientInfo patientData={patientData} />
              <PhysicalExamination 
                height={patientData.physical_examination.height}
                weight={patientData.physical_examination.weight}
                sleepScore={patientData.physical_examination.sleep_score}
              />
              <BioScanPage scans={bioScans} id={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`pb-4 border-b-2 ${
        active 
          ? 'border-blue-500 text-blue-600 font-medium' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}