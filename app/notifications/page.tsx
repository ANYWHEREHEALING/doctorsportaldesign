"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "../patient-list/components/sidebar"
import { Header } from "../patient-list/components/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui"
import { Bell, MoreVertical } from "lucide-react"

export default function NotificationsPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  interface Notification {
    id: string;
    message: string;
    date: string;
    status: 'read' | 'unread';
  }
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login')
          return
        }

        const response = await fetch('https://api.anywherehealing.com/api/doctor/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success) {
          setNotifications(data.data.data)
        } else {
          setError(data.message || 'Failed to load notifications')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Network error'
        if (message.includes('CORS')) {
          setError('Security restrictions prevent loading notifications. Please try again later.')
        } else {
          setError(message)
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchNotifications()
  }, [router])

  const filteredNotifications = notifications.filter(notification => {
    const searchLower = searchTerm.toLowerCase()
    return (
      notification.message.toLowerCase().includes(searchLower) ||
      notification.date.toLowerCase().includes(searchLower) ||
      notification.status.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar darkMode={darkMode} onDarkModeChange={setDarkMode} />
        <div className="flex-1 ml-64">
          <Header 
            doctor={{ 
              name: "Dr. Arma", 
              avatar: ""
            }} 
            value={searchTerm}
            onSearch={setSearchTerm}
          />
          <main className="h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 p-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="dark:text-white">Notification</TableHead>
                    <TableHead className="dark:text-white">Date</TableHead>
                    <TableHead className="dark:text-white">Status</TableHead>
                    <TableHead className="text-right dark:text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center dark:text-white">
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-red-500 dark:text-red-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <span>{error}</span>
                          <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            Try Again
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredNotifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center dark:text-white">
                        No notifications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell className="flex items-center gap-3 dark:text-white">
                          <Bell className="h-5 w-5 text-blue-500" />
                          {notification.message}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">{notification.date}</TableCell>
                        <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            notification.status === "unread" 
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}>
                            {notification.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}