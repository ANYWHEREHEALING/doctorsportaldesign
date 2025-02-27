import { PatientDetails } from '../types/patient'
interface PatientInfoProps {
    patientData: {
      information: {
        patient_information: {
          fullname: string;
          phone_number: string;
          address: string;
          date_of_birth: string;
        };
      };
    };
  }
  
  export default function PatientInfo({ patientData }: PatientInfoProps) {
  const { patient_information } = patientData.information

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium mb-4">Patient Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="mt-1">{patient_information.fullname}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Phone Number</label>
            <p className="mt-1">{patient_information.phone_number}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Address</label>
            <p className="mt-1">{patient_information.address}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Date of Birth</label>
            <p className="mt-1">{patient_information.date_of_birth}</p>
          </div>
        </div>
      </div>
    </div>
  )
}