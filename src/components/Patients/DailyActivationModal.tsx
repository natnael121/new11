import React, { useState } from 'react';
import { CreditCard, X, Save, Clock } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { Patient } from '../../types';
import { format } from 'date-fns';

interface DailyActivationModalProps {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
}

export function DailyActivationModal({ patient, onClose, onSuccess }: DailyActivationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updatePatient } = usePatients();

  const handleActivate = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updateData = {
        card_status: 'active' as const,
        last_daily_activation: new Date().toISOString(),
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
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Daily Card Activation</h2>
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

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Card Requires Daily Activation</span>
            </div>
            <div className="text-sm text-yellow-600">
              This patient's card requires daily activation. The card was last activated on{' '}
              {patient.last_daily_activation 
                ? format(new Date(patient.last_daily_activation), 'MMM dd, yyyy')
                : 'Never'
              }.
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600">
              <strong>Patient:</strong> {patient.first_name} {patient.last_name}<br />
              <strong>Patient ID:</strong> {patient.patient_id}<br />
              <strong>Card Expires:</strong> {format(new Date(patient.card_expiry_date), 'MMM dd, yyyy')}<br />
              <strong>Assigned Doctor:</strong> Dr. {patient.assigned_doctor?.first_name} {patient.assigned_doctor?.last_name}
            </div>
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
              onClick={handleActivate}
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Activating...' : 'Activate for Today'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}