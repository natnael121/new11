import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, TestTube, Send } from 'lucide-react';
import { useLabTests } from '../../hooks/useLabTests';
import { useLabTestTypes } from '../../hooks/useLabTestTypes';
import { LAB_TEST_OPTIONS } from '../../utils/labTestOptions';
import { useAuthContext } from '../../context/AuthContext';
import { Patient } from '../../types';

interface LabTestFormData {
  test_name: string;
  test_type: 'blood' | 'urine' | 'imaging' | 'other';
  priority: 'routine' | 'urgent' | 'stat';
  notes?: string;
  clinical_indication: string;
}

const schema = yup.object({
  test_name: yup.string().required('Test name is required'),
  test_type: yup.string().oneOf(['blood', 'urine', 'imaging', 'other']).required('Test type is required'),
  priority: yup.string().oneOf(['routine', 'urgent', 'stat']).required('Priority is required'),
  notes: yup.string(),
  clinical_indication: yup.string().required('Clinical indication is required'),
});

interface SendLabTestModalProps {
  patient: Patient;
  appointmentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SendLabTestModal({ patient, appointmentId, onClose, onSuccess }: SendLabTestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addLabTest } = useLabTests();
  const { user } = useAuthContext();
  const { labTestTypes } = useLabTestTypes();

  const { register, handleSubmit, formState: { errors } } = useForm<LabTestFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LabTestFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const labTestData = {
        patient_id: patient.id,
        doctor_id: user?.id || '',
        appointment_id: appointmentId,
        test_name: data.test_name,
        test_type: data.test_type,
        status: 'requested' as const,
        notes: `${data.priority.toUpperCase()} - ${data.clinical_indication}${data.notes ? ` | ${data.notes}` : ''}`,
        requested_at: new Date().toISOString(),
      };

      const result = await addLabTest(labTestData);
      
      if (result.error) {
        setError('Failed to send lab test request. Please try again.');
      } else {
        onSuccess();
      }
    } catch (error) {
      setError('Failed to send lab test request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TestTube className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send Lab Test Request</h2>
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
              Test Name
            </label>
            <select
              {...register('test_name')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a test</option>
              {LAB_TEST_OPTIONS.map((test, index) => (
                <option key={index} value={test.name}>
                  {test.name}
                </option>
              ))}
              {labTestTypes
                .filter(testType => testType.active)
                .map((testType) => (
                  <option key={testType.id} value={testType.name}>
                    {testType.name} (Custom)
                  </option>
                ))}
            </select>
            {errors.test_name && (
              <p className="mt-1 text-sm text-red-600">{errors.test_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Test Type
            </label>
            <select
              {...register('test_type')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select test type</option>
              <option value="blood">Blood Test</option>
              <option value="urine">Urine Test</option>
              <option value="imaging">Imaging</option>
              <option value="other">Other</option>
            </select>
            {errors.test_type && (
              <p className="mt-1 text-sm text-red-600">{errors.test_type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select priority</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT (Immediate)</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Clinical Indication
            </label>
            <textarea
              {...register('clinical_indication')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Reason for test, clinical symptoms, suspected diagnosis..."
            />
            {errors.clinical_indication && (
              <p className="mt-1 text-sm text-red-600">{errors.clinical_indication.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Special instructions, patient preparation requirements..."
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
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending...' : 'Send to Lab'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}