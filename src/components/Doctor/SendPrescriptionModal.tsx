import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Pill, Send } from 'lucide-react';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { useAuthContext } from '../../context/AuthContext';
import { Patient } from '../../types';

interface PrescriptionFormData {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity: number;
  refills: number;
  generic_substitution: boolean;
}

const schema = yup.object({
  medication_name: yup.string().required('Medication name is required'),
  dosage: yup.string().required('Dosage is required'),
  frequency: yup.string().required('Frequency is required'),
  duration: yup.string().required('Duration is required'),
  instructions: yup.string(),
  quantity: yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
  refills: yup.number().min(0, 'Refills cannot be negative').required('Number of refills is required'),
  generic_substitution: yup.boolean().required(),
});

interface SendPrescriptionModalProps {
  patient: Patient;
  appointmentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SendPrescriptionModal({ patient, appointmentId, onClose, onSuccess }: SendPrescriptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addPrescription } = usePrescriptions();
  const { user } = useAuthContext();

  const { register, handleSubmit, formState: { errors } } = useForm<PrescriptionFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      quantity: 30,
      refills: 0,
      generic_substitution: true,
    }
  });

  const onSubmit = async (data: PrescriptionFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const prescriptionData = {
        patient_id: patient.id,
        doctor_id: user?.id || '',
        appointment_id: appointmentId,
        medication_name: data.medication_name,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration,
        instructions: data.instructions,
        quantity: data.quantity,
        refills: data.refills,
        generic_substitution: data.generic_substitution,
        status: 'pending' as const,
      };

      const result = await addPrescription(prescriptionData);
      
      if (result.error) {
        setError('Failed to send prescription. Please try again.');
      } else {
        onSuccess();
      }
    } catch (error) {
      setError('Failed to send prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Pill className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send Prescription</h2>
              <p className="text-sm text-gray-600">{patient.first_name} {patient.last_name} ({patient.patient_id})</p>
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
              Medication Name
            </label>
            <input
              {...register('medication_name')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Amoxicillin"
            />
            {errors.medication_name && (
              <p className="mt-1 text-sm text-red-600">{errors.medication_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dosage
              </label>
              <input
                {...register('dosage')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="500mg"
              />
              {errors.dosage && (
                <p className="mt-1 text-sm text-red-600">{errors.dosage.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Frequency
              </label>
              <input
                {...register('frequency')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="3 times daily"
              />
              {errors.frequency && (
                <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration
              </label>
              <input
                {...register('duration')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="7 days"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity
              </label>
              <input
                {...register('quantity')}
                type="number"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="30"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Refills
            </label>
            <input
              {...register('refills')}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            {errors.refills && (
              <p className="mt-1 text-sm text-red-600">{errors.refills.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              {...register('instructions')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Take with food, complete full course, avoid alcohol..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              {...register('generic_substitution')}
              type="checkbox"
              id="generic_substitution"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="generic_substitution" className="text-sm font-medium text-gray-700">
              Allow generic substitution
            </label>
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
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending...' : 'Send to Pharmacy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}