// app/patient-list/[id]/page.tsx
import { Suspense } from 'react';
import { getPatientData, getBioScans, getPhysicalData } from './actions';
import PatientDetailsContent from './patient-details-content';
import { Skeleton } from "@/app/components/ui";

interface PageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function PatientDetailsPage({
  params,
}: PageProps) {
  try {
    // Fetch all data in parallel
    const [patientData, bioScans, physicalData] = await Promise.all([
      getPatientData(params.id),
      getBioScans(params.id),
      getPhysicalData(params.id)
    ]);

    return (
      <Suspense fallback={<Skeleton className="h-screen w-full" />}>
        <PatientDetailsContent
          patientData={patientData}
          bioScans={bioScans}
          physicalData={physicalData}
          id={params.id}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading patient details:', error);
    return <div>Error loading patient details</div>;
  }
}

export const dynamic = 'force-dynamic';
