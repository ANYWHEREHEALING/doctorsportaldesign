"use client"
import { Suspense } from 'react'
import PatientDetailsContentWrapper from './patient-details-content'
import PatientDetailsSkeleton from '../components/loading'
import ErrorComponent from '../components/error'
import { ErrorBoundary } from 'react-error-boundary'

export default function PatientDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <Suspense fallback={<PatientDetailsSkeleton />}>
      <ErrorBoundary fallback={<ErrorComponent />}>
        <PatientDetailsContentWrapper id={params.id} />
      </ErrorBoundary>
    </Suspense>
  )
}