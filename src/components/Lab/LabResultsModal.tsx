import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, FileCheck, Save } from 'lucide-react';
import { useLabTests } from '../../hooks/useLabTests';
import { LabTest } from '../../types';

interface LabResultsFormData {
  results: string;
  notes?: string;
}

const schema = yup.object({
  results: yup.string().required('Test results are required'),
  notes: yup.string(),
});

interface LabResultsModalProps {
  test: LabTest;
  onClose: () => void;
  onSuccess: () => void;
}

export function LabResultsModal({ test, onClose, onSuccess }: LabResultsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateLabTest } = useLabTests();

  const { register, handleSubmit, formState: { errors } } = useForm<LabResultsFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LabResultsFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateLabTest(test.id, {
        status: 'completed',
        results: data.results,
        notes: data.notes,
        completed_at: new Date().toISOString(),
      });

      if (result.error) {
        setError('Failed to save test results. Please try again.');
      } else {
        onSuccess();
      }
    } catch (error) {
      setError('Failed to save test results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enter Test Results</h2>
              <p className="text-sm text-gray-600">{test.test_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-blue-700">
              <strong>Patient ID:</strong> {test.patient_id}<br />
              <strong>Test Type:</strong> {test.test_type.replace('_', ' ').toUpperCase()}<br />
              <strong>Requested by:</strong> Dr. {test.doctor_id}<br />
              {test.notes && (
                <>
                  <strong>Request Notes:</strong> {test.notes}
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Test Results
              </label>
              <textarea
                {...register('results')}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter detailed test results, values, and findings..."
              />
              {errors.results && (
                <p className="mt-1 text-sm text-red-600">{errors.results.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional observations or technical notes..."
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
                <span>{isSubmitting ? 'Saving...' : 'Save Results'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}