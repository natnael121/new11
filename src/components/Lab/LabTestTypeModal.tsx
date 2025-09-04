import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, TestTube, Save } from 'lucide-react';
import { useLabTestTypes } from '../../hooks/useLabTestTypes';

interface LabTestTypeFormData {
  name: string;
  category: 'blood' | 'urine' | 'imaging' | 'other';
  description?: string;
  normal_range?: string;
  preparation_instructions?: string;
  estimated_duration?: number;
  cost?: number;
  active: boolean;
}

const schema = yup.object({
  name: yup.string().required('Test name is required'),
  category: yup.string().oneOf(['blood', 'urine', 'imaging', 'other']).required('Category is required'),
  description: yup.string(),
  normal_range: yup.string(),
  preparation_instructions: yup.string(),
  estimated_duration: yup.number().positive().nullable(),
  cost: yup.number().positive().nullable(),
  active: yup.boolean().required(),
});

interface LabTestTypeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function LabTestTypeModal({ onClose, onSuccess }: LabTestTypeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addLabTestType } = useLabTestTypes();

  const { register, handleSubmit, formState: { errors } } = useForm<LabTestTypeFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      active: true,
    }
  });

  const onSubmit = async (data: LabTestTypeFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addLabTestType(data);
      
      if (result.error) {
        setError('Failed to add test type. Please try again.');
      } else {
        onSuccess();
      }
    } catch (error) {
      setError('Failed to add test type. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TestTube className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Lab Test Type</h2>
              <p className="text-sm text-gray-600">Configure a new test type for doctors to select</p>
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
            <input
              {...register('name')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Complete Blood Count (CBC)"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select category</option>
              <option value="blood">Blood Test</option>
              <option value="urine">Urine Test</option>
              <option value="imaging">Imaging</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of what this test measures..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Normal Range
            </label>
            <input
              {...register('normal_range')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 4.5-11.0 x10³/μL"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Patient Preparation Instructions
            </label>
            <textarea
              {...register('preparation_instructions')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Fasting required, no medications, etc..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                {...register('estimated_duration')}
                type="number"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cost ($)
              </label>
              <input
                {...register('cost')}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="25.00"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              {...register('active')}
              type="checkbox"
              id="active"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active (available for doctors to select)
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Add Test Type'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}