export interface PatientDetails {
  id: string | number
  name: string
  email: string
  status: string  
  information: {
    patient_information: {
      fullname: string
      phone_number: string
      address: string
      date_of_birth: string
    }
    medical_history: null | any
  }
  physical_examination: {
    height: string
    weight: string
    sleep_score: any[]
  }
}

export interface BioScanData {
  id: number
  user_id: number
  fecha: string
  nombre: string
  instrumento: string
  status: string
  codigos: Array<{
    nombreCodigo: string
    valor: number
    nombreCategoria: string
    rutaCategoria: string
  }>
  created_at: string
  updated_at: string
}

export interface PhysicalData {
  height: string
  weight: string
  sleep_score: any[]
}