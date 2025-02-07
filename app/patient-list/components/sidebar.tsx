import { Home, Bell, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button , Switch } from "@/app/components/ui"

interface SidebarProps {
  darkMode: boolean
  onDarkModeChange: (value: boolean) => void
}

export function Sidebar({ darkMode, onDarkModeChange }: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Group.png"
              alt="Anywhere Healing"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-semibold text-xl dark:text-white">Anywhere Healing</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <Link
            href="/patients"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <Home className="h-5 w-5" />
            Patient List
          </Link>
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Bell className="h-5 w-5" />
            Notifications
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-800">
          <Button className="w-full justify-start text-gray-600 dark:text-gray-300">
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
          <div className="flex items-center justify-between mt-4 px-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Light mode</span>
            <Switch checked={darkMode} onCheckedChange={onDarkModeChange} className="bg-gray-300 dark:bg-gray-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

