import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Calendar, Save } from 'lucide-react';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Patient } from '../../types';

interface AppointmentFormData {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  notes?: string;
}

interface AppointmentBookingModalProps {
  onClose: () => void;
  onSuccess: () => void;
  patients: Patient[];
}

const schema = yup.object({
  patient_id: yup.string().required('Patient is required'),
  doctor_id: yup.string().required('Doctor is required'),
  appointment_date: yup.string().required('Date is required'),
  appointment_time: yup.string().required('Time is required'),
  reason: yup.string(),
  notes: yup.string(),
});

// Mock doctors data
const doctors = [
  { id: 'doc1', name: 'Dr. Emily Smith', specialty: 'General Medicine' },
  { id: 'doc2', name: 'Dr. Michael Johnson', specialty: 'Cardiology' },
  { id: 'doc3', name: 'Dr. Sarah Wilson', specialty: 'Pediatrics' },
];

export function AppointmentBookingModal({ onClose, onSuccess, patients }: AppointmentBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addAppointment } = useAppointments();
  const { user } = useAuthContext();

  const { register, handleSubmit, formState: { errors } } = useForm<AppointmentFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    setError(null);

    const appointmentData = {
      ...data,
      status: 'scheduled' as const,
      created_by: user?.id || '',
    };

    const result = await addAppointment(appointmentData);
    
    if (result.error) {
      setError('Failed to schedule appointment. Please try again.');
    } else {
      onSuccess();
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schedule Appointment</h2>
              <p className="text-sm text-gray-600">Book a new patient appointment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Patient
            </label>
            <select
              {...register('patient_id')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} ({patient.patient_id})
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Doctor
            </label>
            <select
              {...register('doctor_id')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
            {errors.doctor_id && (
              <p className="mt-1 text-sm text-red-600">{errors.doctor_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                {...register('appointment_date')}
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.appointment_date && (
                <p className="mt-1 text-sm text-red-600">{errors.appointment_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time
              </label>
              <input
                {...register('appointment_time')}
                type="time"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.appointment_time && (
                <p className="mt-1 text-sm text-red-600">{errors.appointment_time.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Visit
            </label>
            <input
              {...register('reason')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Regular checkup, follow-up, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes or special instructions..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}