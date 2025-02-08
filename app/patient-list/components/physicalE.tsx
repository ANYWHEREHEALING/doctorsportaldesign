import { Pencil } from "lucide-react"

interface HeightMeasurementProps {
  value: string
}

function HeightMeasurement({ value }: HeightMeasurementProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
          <svg
            className="w-6 h-6 text-gray-600 dark:text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Height</h3>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
        <Pencil className="w-5 h-5" />
      </button>
    </div>
  )
}

interface SleepScoreProps {
  score: number
  duration: string
  heartRate: string
}

function SleepScore({ score, duration, heartRate }: SleepScoreProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-[#2B5329] rounded">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-3.5-8v2H11v2h2v-2h1.5v-2h-4V9h4V7H13V5h-2v2H8.5v2h4v3h-4z" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Sleep Score:</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{score}%</span>
          <span className="text-sm text-green-600 dark:text-green-400">Optimal</span>
        </div>
      </div>

      {/* Sleep Timeline */}
      <div className="h-8 rounded-lg overflow-hidden mb-2">
        <div className="flex h-full">
          <div className="w-1/6 bg-[#F59E0B]" />
          <div className="w-5/6 bg-[#0EA5E9] bg-opacity-80" />
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm3.707-11.707a1 1 0 00-1.414 0L11 11.586V7a1 1 0 10-2 0v5a1 1 0 00.293.707l4 4a1 1 0 001.414-1.414L11.414 12l3.293-3.293a1 1 0 000-1.414z" />
          </svg>
          {duration}
        </div>
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {heartRate}
        </div>
      </div>
    </div>
  )
}

export function PhysicalExamination() {
  return (
    <div className="space-y-6">
      <HeightMeasurement value="169 CM" />
      <HeightMeasurement value="169 CM" />
      <SleepScore score={78} duration="8h 55mins" heartRate="48bpm" />
    </div>
  )
}

