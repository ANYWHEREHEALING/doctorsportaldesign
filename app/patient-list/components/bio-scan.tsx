"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/app/components/ui"
import { Skeleton } from "@/app/components/ui"
import { cn } from "@/app/libs/utils"
import { ArrowLeft, Eye, AlertCircle } from "lucide-react"

interface BioScanData {
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

export default function BioScanPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [scanData, setScanData] = useState<BioScanData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBioScans = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await fetch(
          `https://api.anywherehealing.com/api/doctor/patient/get-bioscan-record/${params.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch bioscan records')
        }

        const data = await response.json()
        
        if (!data?.data || !Array.isArray(data.data)) {
          throw new Error('Invalid bioscan data structure')
        }

        setScanData(data.data)
      } catch (err: any) {
        console.error('Fetch error:', err)
        setError(err.message || 'Failed to load bioscan records')
        if (err.response?.status === 401) {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchBioScans()
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-xl font-medium text-red-600">{error}</div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Patient
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bio Scan Records</h1>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Patient
        </button>
      </div>

      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="space-y-6 pr-4">
          {scanData.map((scan) => (
            <div 
              key={scan.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">{scan.condition}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(scan.scan_date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    scan.severity === "Low" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                    scan.severity === "Moderate" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                    scan.severity === "High" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  )}
                >
                  {scan.severity}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MeasurementScale 
                  label="Muscle Pain" 
                  value={scan.biomarkers.muscle_pain} 
                />
                <MeasurementScale 
                  label="Energy Level" 
                  value={scan.biomarkers.energy_level} 
                />
                <MeasurementScale 
                  label="Inflammation" 
                  value={scan.biomarkers.inflammation} 
                />
              </div>

              {scan.notes && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Clinical Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {scan.notes}
                  </p>
                </div>
              )}
            </div>
          ))}

          {scanData.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No bio scan records available for this patient
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function MeasurementScale({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="font-medium">{value}/10</span>
      </div>
      <div className="relative pt-1">
        <div className="flex h-2 overflow-hidden text-xs bg-gray-200 rounded dark:bg-gray-700">
          <div
            style={{ width: `${(value / 10) * 100}%` }}
            className={cn(
              "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center",
              value <= 3 ? "bg-green-500" :
              value <= 6 ? "bg-yellow-500" :
              "bg-red-500"
            )}
          />
        </div>
      </div>
    </div>
  )
}