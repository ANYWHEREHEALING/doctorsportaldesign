import { Eye } from "lucide-react"

interface BioScanCardProps {
  title: string
  date: string
  description: string
  status: "Low" | "Moderate" | "High"
  musclePain: number
  energyLevels: number
}

function BioScanCard({ title, date, description, status, musclePain, energyLevels }: BioScanCardProps) {
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm flex items-center gap-1">
            <Eye className="w-4 h-4" />
            View
          </button>
          <span
            className={`
            px-2 py-1 text-xs font-medium rounded-full
            ${status === "Low" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}
            ${status === "Moderate" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" : ""}
            ${status === "High" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" : ""}
          `}
          >
            {status}
          </span>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm font-medium bg-gray-900 text-white dark:bg-gray-700 rounded-full">
            {date}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full">{musclePain}</span>
          <span className="px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full">{energyLevels}</span>
        </div>
      </div>
    </div>
  )
}

interface MeasurementScaleProps {
  label: string
  value: number
  max?: number
}

function MeasurementScale({ label, value, max = 10 }: MeasurementScaleProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h4>
      <div className="relative">
        <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
            style={{ width: "100%" }}
          />
        </div>
        <div
          className="absolute top-1/2 -mt-2 w-4 h-4 rounded-full bg-white border-2 border-gray-300 dark:border-gray-600"
          style={{ left: `${(value / max) * 100}%`, transform: "translateX(-50%)" }}
        />
        <div className="flex justify-between mt-1">
          {Array.from({ length: max + 1 }).map((_, i) => (
            <span key={i} className="text-xs text-gray-500 dark:text-gray-400">
              {i}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function BioScan() {
  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
      <BioScanCard
        title="Latest Bio Scan"
        date="21-12-2024"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum cursus augue purus, eget sagittis urna viverra eu. Vivamus vestibulum ultricies imperdiet. Integer fermentum suscipit pulvinar."
        status="Low"
        musclePain={7}
        energyLevels={8}
      />

      <BioScanCard
        title="Last Week Bio Scan"
        date="15-12-2024"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum cursus augue purus, eget sagittis urna viverra eu. Vivamus vestibulum ultricies imperdiet. Integer fermentum suscipit pulvinar."
        status="Moderate"
        musclePain={7}
        energyLevels={8}
      />

      <BioScanCard
        title="Last Month Bio Scan"
        date="21-11-2024"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum cursus augue purus, eget sagittis urna viverra eu. Vivamus vestibulum ultricies imperdiet. Integer fermentum suscipit pulvinar."
        status="Low"
        musclePain={7}
        energyLevels={8}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <MeasurementScale label="ADHD" value={1} />
        <MeasurementScale label="Adrenal Fatigue" value={3} />
        <MeasurementScale label="Muscle Pains" value={7} />
        <MeasurementScale label="Energy Levels" value={8} />
      </div>
    </div>
  )
}

