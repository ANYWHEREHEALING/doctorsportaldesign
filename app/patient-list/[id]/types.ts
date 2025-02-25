// types.ts - Type definitions
export interface PatientDetails {
    id: string;
    name: string;
    avatar: string;
    condition: string;
    lastScanDate: string;
    specialty: string;
    status: "Confirmed" | "Pending" | "Cancelled";
    email: string;
    phone?: string;
    address?: string;
    medicalHistory?: Array<{ label: string; value: string }>;
    patientInfo?: Array<{ label: string; value: string }>;
  }
  
  export interface BioScan {
    id: string;
    scan_date: string;
    condition: string;
    severity: "Low" | "Moderate" | "High";
    biomarkers: {
      muscle_pain: number;
      energy_level: number;
      inflammation: number;
    };
    notes?: string;
  }
  
  export interface PhysicalData {
    height?: string;
    weight?: string;
    bloodPressure?: string;
  }
  