import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreditCard, Save, Settings } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PatientCardPolicy } from '../../types';

interface CardPolicyFormData {
  card_validity_days: number;
  grace_period_days: number;
  auto_suspend: boolean;
  payment_reminder_days: number;
}

const schema = yup.object({
  card_validity_days: yup.number().min(1, 'Must be at least 1 day').required('Card validity period is required'),
  grace_period_days: yup.number().min(0, 'Cannot be negative').required('Grace period is required'),
  auto_suspend: yup.boolean().required(),
  payment_reminder_days: yup.number().min(0, 'Cannot be negative').required('Reminder period is required'),
});

export function CardPolicySettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CardPolicyFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      card_validity_days: 30,
      grace_period_days: 7,
      auto_suspend: true,
      payment_reminder_days: 5,
    }
  });

  useEffect(() => {
    fetchCurrentPolicy();
  }, []);

  const fetchCurrentPolicy = async () => {
    try {
      const policyDoc = await getDoc(doc(db, 'card_policies', 'default'));
      if (policyDoc.exists()) {
        const policy = policyDoc.data() as PatientCardPolicy;
        reset({
          card_validity_days: policy.card_validity_days,
          grace_period_days: policy.grace_period_days,
          auto_suspend: policy.auto_suspend,
          payment_reminder_days: policy.payment_reminder_days,
        });
      }
    } catch (error) {
      console.error('Error fetching card policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CardPolicyFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await setDoc(doc(db, 'card_policies', 'default'), {
        ...data,
        clinic_id: 'default',
        updated_at: serverTimestamp(),
        created_at: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError('Failed to update card policy. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Patient Card Policy</h2>
          <p className="text-sm text-gray-600">Configure patient card validity and payment policies</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm">Card policy updated successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Card Validity Period (Days)
            </label>
            <input
              {...register('card_validity_days')}
              type="number"
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="30"
            />
            {errors.card_validity_days && (
              <p className="mt-1 text-sm text-red-600">{errors.card_validity_days.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">How long patient cards remain active after payment</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Grace Period (Days)
            </label>
            <input
              {...register('grace_period_days')}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="7"
            />
            {errors.grace_period_days && (
              <p className="mt-1 text-sm text-red-600">{errors.grace_period_days.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Additional days before card is suspended</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Reminder (Days Before Expiry)
            </label>
            <input
              {...register('payment_reminder_days')}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="5"
            />
            {errors.payment_reminder_days && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_reminder_days.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">When to notify patients about upcoming expiry</p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              {...register('auto_suspend')}
              type="checkbox"
              id="auto_suspend"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto_suspend" className="text-sm font-medium text-gray-700">
              Automatically suspend expired cards
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Policy'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}