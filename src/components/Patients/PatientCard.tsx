import React from 'react';
import { Calendar, Phone, MapPin, User, CreditCard, AlertTriangle, Clock, UserCheck } from 'lucide-react';
import { Patient } from '../../types';
import { format, isAfter, differenceInDays, startOfDay } from 'date-fns';

interface PatientCardProps {
  patient: Patient;
  showFullInfo?: boolean;
  onClick?: () => void;
}

export function PatientCard({ patient, showFullInfo = false, onClick }: PatientCardProps) {
  const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
  const isCardExpired = isAfter(new Date(), new Date(patient.card_expiry_date));
  const daysUntilExpiry = differenceInDays(new Date(patient.card_expiry_date), new Date());
  
  const needsDailyActivation = () => {
    if (!patient.daily_activation_required) return false;
    const today = startOfDay(new Date());
    const lastActivation = patient.last_daily_activation 
      ? startOfDay(new Date(patient.last_daily_activation))
      : null;
    return !lastActivation || lastActivation < today;
  };
  
  const getCardStatusColor = () => {
    if (patient.card_status === 'expired' || isCardExpired) return 'bg-red-100 text-red-800';
    if (patient.card_status === 'suspended') return 'bg-gray-100 text-gray-800';
    if (needsDailyActivation()) return 'bg-yellow-100 text-yellow-800';
    if (daysUntilExpiry <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
  
  const getCardStatusText = () => {
    if (patient.card_status === 'expired' || isCardExpired) return 'EXPIRED';
    if (patient.card_status === 'suspended') return 'SUSPENDED';
    if (needsDailyActivation()) return 'NEEDS ACTIVATION';
    if (daysUntilExpiry <= 5) return `EXPIRES IN ${daysUntilExpiry}D`;
    return 'ACTIVE';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900">
              {showFullInfo ? `${patient.first_name} ${patient.last_name}` : `${patient.first_name} ${patient.last_name.charAt(0)}.`}
            </h3>
            <p className="text-xs text-gray-600">ID: {patient.patient_id}</p>
          </div>
        </div>
        <div className="text-right space-y-1 flex-shrink-0">
          <div className="text-xs text-gray-500">Age: {age}</div>
          <div className="flex items-center justify-end space-x-1">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className={`px-1 py-0.5 rounded-full text-xs font-medium ${getCardStatusColor()}`}>
              {getCardStatusText()}
            </span>
          </div>
          {patient.assigned_doctor_id && (
            <div className="flex items-center justify-end space-x-1">
              <UserCheck className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {patient.assigned_doctor?.first_name 
                  ? `Dr. ${patient.assigned_doctor.first_name} ${patient.assigned_doctor.last_name}`
                  : 'Doctor assigned'
                }
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs flex-1">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(patient.date_of_birth), 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{showFullInfo ? patient.phone : `***-***-${patient.phone.slice(-4)}`}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600 col-span-2">
          <MapPin className="w-4 h-4" />
          <span className="truncate text-xs">{showFullInfo ? patient.address : 'Address on file'}</span>
        </div>
      </div>
      
      {(isCardExpired || patient.card_status === 'expired' || needsDailyActivation()) && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center space-x-2">
          {needsDailyActivation() ? (
            <>
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-yellow-700">Daily activation required</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-700">Card expired - Payment required</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}