"use client"

import { useState } from "react"
import { Sidebar } from "../patient-list/components/sidebar"
import { Header } from "../patient-list/components/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui"
import { Bell, MoreVertical } from "lucide-react"

const notifications = [
  {
    id: "1",
    message: "New scan results available for Kristin Watson",
    date: "Dec 18, 2024",
    status: "Unread",
  },
  {
    id: "2",
    message: "Appointment reminder for Jacob Jones",
    date: "Dec 17, 2024",
    status: "Read",
  },
  // Add more notifications...
] as const

export default function NotificationsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
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
            doctor={{ name: "Dr. Arma", avatar: "/doctor-avatar.jpg" }} 
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
                  {filteredNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="flex items-center gap-3 dark:text-white">
                        <Bell className="h-5 w-5 text-blue-500" />
                        {notification.message}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">{notification.date}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          notification.status === "Unread" 
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}