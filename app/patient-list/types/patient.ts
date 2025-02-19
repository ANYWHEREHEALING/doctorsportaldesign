export interface Patient {
  id: string
  name: string
  avatar: string
  condition: string
  lastScanDate: string
  specialty: string
  status: "Confirmed" | "Pending" | "Cancelled"
  // Add any additional fields from your API
  email?: string
  phone?: string
  address?: string
}
  
  export interface Doctor {
    name: string
    avatar: string
  }
  
  