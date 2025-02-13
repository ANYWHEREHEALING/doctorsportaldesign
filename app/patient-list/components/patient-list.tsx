import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui"
import { Button } from "@/app/components/ui"
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import type { Patient } from "../types/patient"

interface PatientListProps {
  patients: ReadonlyArray<Patient>
  onPatientClick?: (patientId: string) => void
}

export function PatientList ({ patients, onPatientClick }: PatientListProps){


  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Patient List</h1>
      </div>

      <div className="flex-1 px-6">
        <Table>
          <TableHeader>
            <TableRow >
              <TableHead className="w-[300px] dark:text-white">Patient Details</TableHead>
              <TableHead className="dark:text-white">Last Scan date</TableHead>
              <TableHead className="dark:text-white">Symptom</TableHead>
              <TableHead className="dark:text-white">Status</TableHead>
              <TableHead className="text-right dark:text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow 
              key={patient.id}
              onClick={() => onPatientClick?.(patient.id)}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
                <TableCell>
                  <div className="flex items-center dark:text-white gap-3">
                    <Avatar className="dark:text-white">
                      <AvatarImage src={patient.avatar} />
                      <AvatarFallback>{patient.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="dark:text-white">
                      <div className="font-medium dark:text-white">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.condition}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="dark:text-gray-300">{patient.lastScanDate}</TableCell>
                <TableCell className="dark:text-gray-300">{patient.specialty}</TableCell>
                <TableCell className="dark:text-white">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {patient.status}
                  </span>
                </TableCell>
                <TableCell className="text-right dark:text-white">
                  <Button variant="ghost" size="icon" >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t dark:border-gray-800 dark:text-white flex items-center justify-between">
        <Button variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          {[1, 2, "...", 9, 10].map((page, i) => (
            <Button key={i} variant={page === 1 ? "default" : "ghost"} className="w-10 h-10">
              {page}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

