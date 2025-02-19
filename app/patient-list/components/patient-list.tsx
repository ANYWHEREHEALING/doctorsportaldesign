"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui"
import { Button } from "@/app/components/ui"
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import type { Patient } from "../types/patient"
import { Skeleton } from "@/app/components/ui"

interface PatientListProps {
  patients: Patient[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onPatientClick: (patient: Patient) => void
  isLoading?: boolean
}

export default function PatientList({ 
  patients,
  currentPage = 1,
  totalPages,
  onPageChange,
  onPatientClick,
  isLoading = false
}: PatientListProps) {
  const handlePreviousPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Patient List</h1>
      </div>

      <div className="flex-1 px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px] dark:text-white">Patient Details</TableHead>
              <TableHead className="dark:text-white">Last Scan date</TableHead>
              <TableHead className="dark:text-white">Symptom</TableHead>
              <TableHead className="dark:text-white">Status</TableHead>
              <TableHead className="text-right dark:text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-3 w-[80px]" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              patients.map((patient) => (
                <TableRow 
                  key={patient.id}
                  onClick={() => onPatientClick(patient)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={patient.avatar} />
                        <AvatarFallback>{patient.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium dark:text-white">{patient.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {patient.condition}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{patient.lastScanDate}</TableCell>
                  <TableCell className="dark:text-gray-300">{patient.specialty}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      patient.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      patient.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {patient.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t dark:border-gray-800 flex items-center justify-between">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "ghost"}
              className="w-10 h-10"
              onClick={() => onPageChange(page)}
              disabled={isLoading}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleNextPage}
          disabled={currentPage === totalPages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}