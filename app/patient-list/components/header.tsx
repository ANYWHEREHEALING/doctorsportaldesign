import { Search } from "lucide-react"
import { Input } from "@/app/components/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui"

interface HeaderProps {
  doctor: {
    name: string
    avatar: string
  }
  value: string
  onSearch: (term: string) => void
}
export function Header({ doctor, value, onSearch }: HeaderProps) {
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
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium dark:text-white">Dr. Arma</span>
        <Avatar className="dark:text-white">
          <AvatarImage src={doctor.avatar} />
          <AvatarFallback>DA</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

