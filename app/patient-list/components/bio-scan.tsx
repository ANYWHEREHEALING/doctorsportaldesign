"use client"

import { ScrollArea } from "@/app/components/ui"
import { Skeleton } from "@/app/components/ui"
import { Eye, ArrowRight } from "lucide-react"
import { cn } from "@/app/libs/utils"

interface BioScan {
  id: string
  title: string
  date: string
  description: string
  status: "Low" | "Moderate" | "High"
  musclePain: number
  energyLevels: number
  biomarkers?: {
    adhd: number
    adrenalFatigue: number
    inflammation: number
  }
}

interface BioScanProps {
  scans: BioScan[]
  isLoading?: boolean
}

function BioScanCard({ scan }: { scan: BioScan }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{scan.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm flex items-center gap-1">
            <Eye className="w-4 h-4" />
            View
          </button>
          <span
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              scan.status === "Low" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
              scan.status === "Moderate" && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
              scan.status === "High" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            )}
          >
            {scan.status}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
        <span>{scan.date}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Muscle Pain: {scan.musclePain}/10</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Energy: {scan.energyLevels}/10</span>
          </div>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm">{scan.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          View Full Report
          <ArrowRight className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">Scan ID: #{scan.id}</span>
      </div>
    </div>
  )
}

function MeasurementScale({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">{value}/10</span>
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

export function BioScan({ scans, isLoading }: BioScanProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="space-y-6 pr-4">
        {scans.map((scan) => (
          <BioScanCard key={scan.id} scan={scan} />
        ))}

        {scans.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Biomarker Analysis</h3>
            
            {scans[0].biomarkers && (
              <>
                <MeasurementScale label="ADHD" value={scans[0].biomarkers.adhd} />
                <MeasurementScale label="Adrenal Fatigue" value={scans[0].biomarkers.adrenalFatigue} />
                <MeasurementScale label="Inflammation" value={scans[0].biomarkers.inflammation} />
              </>
            )}

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Note: Biomarker scores are relative measurements based on population norms. 
                Consult with a healthcare professional for detailed interpretation.
              </p>
            </div>
          </div>
        )}

        {scans.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No bio scan records available
          </div>
        )}
      </div>
    </ScrollArea>
  )
}