// app/patient-list/[id]/actions.ts
import { cookies } from 'next/headers';

export async function getPatientData(id: string) {
  try {
    const token = (await cookies()).get('token')?.value;
    const res = await fetch(`https://api.anywherehealing.com/api/doctor/patient/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      // Add cache control
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Patient fetch failed');
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch patient:', error);
    throw error;
  }
}

export async function getBioScans(id: string) {
  try {
    const token = (await cookies()).get('token')?.value;
    const res = await fetch(`https://api.anywherehealing.com/api/doctor/patient/get-bioscan-record/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Bioscan fetch failed');
    const data = await res.json();
    return data.data.results;
  } catch (error) {
    console.error('Failed to fetch bioscans:', error);
    throw error;
  }
}

export async function getPhysicalData(id: string) {
  try {
    const token = (await cookies()).get('token')?.value;
    const res = await fetch(`https://api.anywherehealing.com/api/doctor/patient/physical/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Physical data fetch failed');
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch physical data:', error);
    throw error;
  }
}
