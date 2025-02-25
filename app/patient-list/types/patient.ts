export interface PatientDetails {
  id: string
  name: string
  avatar: string
  condition: string
  lastScanDate: string
  specialty: string
  status: "Confirmed" | "Pending" | "Cancelled"
  email: string
  phone?: string
  address?: string
}
  
  export interface Doctor {
    name: string
    avatar: string
  }
  
  export interface BioScan {
    id: string;
    scan_date: string;
    condition: string;
    severity: string;
    biomarkers: Record<string, number>;
  }