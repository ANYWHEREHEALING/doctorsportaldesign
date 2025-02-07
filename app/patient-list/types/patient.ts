export interface Patient {
    id: string
    name: string
    avatar: string
    condition: string
    lastScanDate: string
    specialty: string
    status: "Confirmed" | "Pending" | "Cancelled"
  }
  
  export interface Doctor {
    name: string
    avatar: string
  }
  
  