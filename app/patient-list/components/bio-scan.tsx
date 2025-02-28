"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BioScanData } from '../types/patient'
import MeasurementScale from './measurement-scale'

export interface BioScanWithMetrics extends BioScanData {
  severity: string
  biomarkers: {
    muscle_pain: number
    energy_level: number
    inflammation: number
  }
}
interface ApiResponse {
  success: boolean
  data: {
    current_page: number
    data: BioScanData[]
    first_page_url: string
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
  }
}

export default function BioScanPage({ scans, id }: { scans: BioScanWithMetrics[]; id: string }) {
  const router = useRouter()
  const [scanData, setScanData] = useState<BioScanWithMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showAllScans, setShowAllScans] = useState(false)

  const getSeverityFromCodigos = (codigos: Array<{ valor: number }>): string => {
    const avgValue = codigos.reduce((sum, code) => sum + Math.abs(code.valor), 0) / codigos.length
    if (avgValue <= 30) return "Low"
    if (avgValue <= 60) return "Moderate"
    return "High"
  }

  const getBiomarkersFromCodigos = (codigos: Array<{ nombreCodigo: string; valor: number }>) => {
    // Extract specific biomarkers from codigos array
    return {
      muscle_pain: Math.abs(codigos.find(c => c.nombreCodigo === 'Muscle/nerve tension')?.valor || 0),
      energy_level: Math.abs(codigos.find(c => c.nombreCodigo === 'Fatigue')?.valor || 0),
      inflammation: Math.abs(codigos.find(c => c.nombreCodigo === 'Inflammation')?.valor || 0)
    }
  }

  const fetchBioScans = async (page: number = 1) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(
        `https://api.anywherehealing.com/api/doctor/patient/get-bioscan-record/${id}?page=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error('Failed to fetch bio scans')
      
      const data: ApiResponse = await response.json()
      
      if (data.success && data.data.data) {
        const transformedScans = data.data.data.map(scan => ({
          id: scan.id,
          user_id: scan.user_id,
          fecha: scan.fecha,
          nombre: scan.nombre,
          instrumento: scan.instrumento,
          status: scan.status,
          codigos: scan.codigos,
          severity: getSeverityFromCodigos(scan.codigos),
          biomarkers: getBiomarkersFromCodigos(scan.codigos),
          created_at: scan.created_at,
          updated_at: scan.updated_at
        }))

        setScanData(prev => page === 1 ? transformedScans : [...prev, ...transformedScans])
        setHasMore(data.data.next_page_url !== null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBioScans()
  }, [id])

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchBioScans(nextPage)
  }

  if (isLoading && currentPage === 1) {
    return <div className="text-center py-4">Loading bio scans...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>
  }

  const displayedScans = showAllScans ? scanData : scanData.slice(0, 1)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Bio Scan Results</h1>
      
      {displayedScans.map((scan) => (
        <div key={scan.id} className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{scan.nombre}</h2>
              <p className="text-gray-600 text-sm">
                {new Date(scan.fecha).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                scan.severity === 'High' ? 'bg-red-100 text-red-800' :
                scan.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {scan.severity} Severity
              </span>
            </div>
            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {scan.instrumento}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MeasurementScale
              title="Muscle Pain"
              value={scan.biomarkers.muscle_pain}
              minLabel="No Pain"
              maxLabel="Severe Pain"
              valueColor={scan.biomarkers.muscle_pain > 70 ? 'text-red-600' : 'text-green-600'}
            />
            <MeasurementScale
              title="Energy Level"
              value={scan.biomarkers.energy_level}
              minLabel="Low Energy"
              maxLabel="High Energy"
              valueColor={scan.biomarkers.energy_level > 70 ? 'text-red-600' : 'text-green-600'}
            />
            <MeasurementScale
              title="Inflammation"
              value={scan.biomarkers.inflammation}
              minLabel="No Inflammation"
              maxLabel="High Inflammation"
              valueColor={scan.biomarkers.inflammation > 70 ? 'text-red-600' : 'text-green-600'}
            />
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">Detailed Biomarkers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {scan.codigos.map((codigo, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{codigo.nombreCodigo}</p>
                  <p className={`text-lg ${
                    Math.abs(codigo.valor) > 70 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {Math.abs(codigo.valor).toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {scanData.length > 1 && !showAllScans && (
        <button
          onClick={() => setShowAllScans(true)}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
        >
          View Previous Scans
        </button>
      )}

      {showAllScans && hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading More...' : 'Load More Results'}
        </button>
      )}
    </div>
  )
}