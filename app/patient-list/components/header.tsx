import { Search } from "lucide-react"
import { Input } from "@/app/components/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui"
import { useState } from "react"
import { useEffect } from "react"

interface HeaderProps {
  doctor: {
    name: string
    avatar: string
  }
  value: string
  onSearch: (term: string) => void
}


interface DoctorData {
  id: number
  name: string
  email: string
  doctor_id: string
}


export function Header({ doctor, value, onSearch }: HeaderProps) {


    const [doctorData, setDoctorData] = useState<DoctorData | null>(null)

      useEffect(() => {
        const storedDoctor = localStorage.getItem('doctor')
        if (storedDoctor) {
          try {
            const doctor = JSON.parse(storedDoctor)
            setDoctorData(doctor)
          } catch (err) {
            console.error('Error parsing doctor data:', err)
          }
        }
      }, [])

  return (
    <div className="h-16 border-b dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-900">
      <div className="relative w-96">
      <Search className="absolute dark:text-white left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search" 
          className="pl-10 dark:text-white bg-gray-50 dark:bg-gray-800 border-0" 
          value={value}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      {doctorData && 
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium dark:text-white"> Dr {doctorData.name}</span>
      </div>}
    </div>
  )
}

