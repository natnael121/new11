import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Package, Save } from 'lucide-react';
import { useMedications } from '../../hooks/useMedications';
import { Medication } from '../../types';

interface MedicationFormData {
  name: string;
  generic_name?: string;
  brand_name?: string;
  strength: string;
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'cream' | 'other';
  stock_quantity: number;
  expiry_date: string;
  price: number;
}

const schema = yup.object({
  name: yup.string().required('Medication name is required'),
  generic_name: yup.string(),
  brand_name: yup.string(),
  strength: yup.string().required('Strength is required'),
  form: yup.string().oneOf(['tablet', 'capsule', 'liquid', 'injection', 'cream', 'other']).required('Form is required'),
  stock_quantity: yup.number().min(0, 'Stock cannot be negative').required('Stock quantity is required'),
  expiry_date: yup.string().required('Expiry date is required'),
  price: yup.number().min(0, 'Price cannot be negative').required('Price is required'),
});

interface MedicationModalProps {
  medication?: Medication;
  onClose: () => void;
  onSuccess: () => void;
}

export function MedicationModal({ medication, onClose, onSuccess }: MedicationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addMedication, updateMedication } = useMedications();

  const { register, handleSubmit, formState: { errors } } = useForm<MedicationFormData>({
    resolver: yupResolver(schema),
    defaultValues: medication ? {
      name: medication.name,
      generic_name: medication.generic_name,
      brand_name: medication.brand_name,
      strength: medication.strength,
      form: medication.form,
      stock_quantity: medication.stock_quantity,
      expiry_date: medication.expiry_date,
      price: medication.price,
    } : undefined,
  });

  const onSubmit = async (data: MedicationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (medication) {
        result = await updateMedication(medication.id, data);
      } else {
        result = await addMedication(data);
      }

      if (result.error) {
        setError('Failed to save medication. Please try again.');
      } else {
        onSuccess();
      }
    } catch (error) {
      setError('Failed to save medication. Please try again.');
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
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {medication ? 'Edit Medication' : 'Add Medication'}
              </h2>
              <p className="text-sm text-gray-600">Manage pharmacy inventory</p>
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
              {...register('name')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Amoxicillin"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Generic Name
              </label>
              <input
                {...register('generic_name')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Amoxicillin"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand Name
              </label>
              <input
                {...register('brand_name')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Amoxil"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Strength
              </label>
              <input
                {...register('strength')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="500mg"
              />
              {errors.strength && (
                <p className="mt-1 text-sm text-red-600">{errors.strength.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Form
              </label>
              <select
                {...register('form')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select form</option>
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="liquid">Liquid</option>
                <option value="injection">Injection</option>
                <option value="cream">Cream</option>
                <option value="other">Other</option>
              </select>
              {errors.form && (
                <p className="mt-1 text-sm text-red-600">{errors.form.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                {...register('stock_quantity')}
                type="number"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="100"
              />
              {errors.stock_quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.stock_quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                {...register('price')}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12.50"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              {...register('expiry_date')}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.expiry_date && (
              <p className="mt-1 text-sm text-red-600">{errors.expiry_date.message}</p>
            )}
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
              <span>{isSubmitting ? 'Saving...' : medication ? 'Update Medication' : 'Add Medication'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}