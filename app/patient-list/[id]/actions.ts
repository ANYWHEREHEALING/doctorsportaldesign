import { PatientDetails, BioScanData, PhysicalData } from '../types/patient'

const API_BASE_URL = 'https://api.anywherehealing.com/api/doctor'

async function fetchWithAuth(endpoint: string) {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No authentication token found')

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }

  return response.json()
}

export async function getPatientData(id: string): Promise<PatientDetails> {
  const response = await fetchWithAuth(`/patient/${id}`)
  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch patient data')
  }
  return response.data
}

export async function getBioScans(id: string): Promise<BioScanData[]> {
  const response = await fetchWithAuth(`/patient/get-bioscan-record/${id}`)
  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch bio scans')
  }
  return response.data.data
}

export async function getPhysicalData(id: string): Promise<PhysicalData> {
  const response = await fetchWithAuth(`/patient/physical-examination/${id}`)
  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch physical examination data')
  }
  return response.data
}