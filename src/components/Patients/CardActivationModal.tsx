import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreditCard, X, Save, DollarSign, UserCheck } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { Patient } from '../../types';
import { addDays, format } from 'date-fns';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface CardActivationFormData {
  payment_amount: number;
  payment_method: 'cash' | 'card' | 'insurance';
  validity_days: number;
  assigned_doctor_id: string;
  daily_activation_required: boolean;
  notes?: string;
}

const schema = yup.object({
  payment_amount: yup.number().min(0, 'Amount must be positive').required('Payment amount is required'),
  payment_method: yup.string().oneOf(['cash', 'card', 'insurance']).required('Payment method is required'),
  validity_days: yup.number().min(1, 'Must be at least 1 day').required('Validity period is required'),
  assigned_doctor_id: yup.string().required('Doctor assignment is required'),
  daily_activation_required: yup.boolean().required(),
  notes: yup.string(),
});

interface CardActivationModalProps {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
}

export function CardActivationModal({ patient, onClose, onSuccess }: CardActivationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const { updatePatient } = usePatients();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CardActivationFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      validity_days: 30,
      payment_amount: 50,
      daily_activation_required: true,
      assigned_doctor_id: patient.assigned_doctor_id || '',
    }
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const querySnapshot = await getDocs(q);
      const doctorsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const validityDays = watch('validity_days');
  const newExpiryDate = addDays(new Date(), validityDays);

  const onSubmit = async (data: CardActivationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updateData = {
        card_status: 'active' as const,
        card_expiry_date: newExpiryDate.toISOString(),
        card_activated_date: new Date().toISOString(),
        assigned_doctor_id: data.assigned_doctor_id,
        daily_activation_required: data.daily_activation_required,
        last_daily_activation: new Date().toISOString(),
        last_payment_date: new Date().toISOString(),
        payment_due_date: newExpiryDate.toISOString(),
      };

      const result = await updatePatient(patient.id, updateData);
      
      if (result.error) {
        setError('Failed to activate card. Please try again.');
      } else {
        onSuccess();
      }
    } catch (error) {
      setError('Failed to activate card. Please try again.');
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
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Activate Patient Card</h2>
              <p className="text-sm text-gray-600">{patient.first_name} {patient.last_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Current Card Status</span>
            </div>
            <div className="text-sm text-blue-600">
              Status: <span className="font-medium">{patient.card_status.toUpperCase()}</span><br />
              Expires: <span className="font-medium">{format(new Date(patient.card_expiry_date), 'MMM dd, yyyy')}</span>
              {patient.assigned_doctor_id && (
                <>
                  <br />Assigned Doctor: <span className="font-medium">Dr. {patient.assigned_doctor?.first_name} {patient.assigned_doctor?.last_name}</span>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign Doctor
            </label>
            <select
              {...register('assigned_doctor_id')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
            {errors.assigned_doctor_id && (
              <p className="mt-1 text-sm text-red-600">{errors.assigned_doctor_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  {...register('payment_amount')}
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50.00"
                />
              </div>
              {errors.payment_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                {...register('payment_method')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="insurance">Insurance</option>
              </select>
              {errors.payment_method && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Card Validity Period (Days)
            </label>
            <input
              {...register('validity_days')}
              type="number"
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="30"
            />
            {errors.validity_days && (
              <p className="mt-1 text-sm text-red-600">{errors.validity_days.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Card will expire on: {format(newExpiryDate, 'MMM dd, yyyy')}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              {...register('daily_activation_required')}
              type="checkbox"
              id="daily_activation"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="daily_activation" className="text-sm font-medium text-gray-700">
              Require daily activation (card deactivates at midnight)
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Payment notes or special instructions..."
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
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Activating...' : 'Activate Card'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}