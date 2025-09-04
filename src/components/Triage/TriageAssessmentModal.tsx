import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Heart, Save, AlertTriangle } from 'lucide-react';
import { useTriageAssessments } from '../../hooks/useTriageAssessments';
import { usePatients } from '../../hooks/usePatients';
import { useAuthContext } from '../../context/AuthContext';
import { TRIAGE_PRIORITY_LEVELS } from '../../utils/constants';

interface TriageFormData {
  patient_id: string;
  priority_level: 'emergency' | 'urgent' | 'semi_urgent' | 'standard' | 'non_urgent';
  chief_complaint: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  pain_scale?: number;
  symptoms: string;
  assessment_notes: string;
  recommended_action: string;
  estimated_wait_time?: number;
}

const schema = yup.object({
  patient_id: yup.string().required('Patient is required'),
  priority_level: yup.string().oneOf(['emergency', 'urgent', 'semi_urgent', 'standard', 'non_urgent']).required('Priority level is required'),
  chief_complaint: yup.string().required('Chief complaint is required'),
  temperature: yup.number().positive().nullable(),
  blood_pressure_systolic: yup.number().positive().nullable(),
  blood_pressure_diastolic: yup.number().positive().nullable(),
  heart_rate: yup.number().positive().nullable(),
  respiratory_rate: yup.number().positive().nullable(),
  oxygen_saturation: yup.number().min(0).max(100).nullable(),
  pain_scale: yup.number().min(0).max(10).nullable(),
  symptoms: yup.string().required('Symptoms are required'),
  assessment_notes: yup.string().required('Assessment notes are required'),
  recommended_action: yup.string().required('Recommended action is required'),
  estimated_wait_time: yup.number().positive().nullable(),
});

interface TriageAssessmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function TriageAssessmentModal({ onClose, onSuccess }: TriageAssessmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addTriageAssessment } = useTriageAssessments();
  const { patients } = usePatients();
  const { user } = useAuthContext();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<TriageFormData>({
    resolver: yupResolver(schema),
  });

  const selectedPriority = watch('priority_level');

  const onSubmit = async (data: TriageFormData) => {
    setIsSubmitting(true);
    setError(null);

    const assessmentData = {
      patient_id: data.patient_id,
      triage_officer_id: user?.id || '',
      priority_level: data.priority_level,
      chief_complaint: data.chief_complaint,
      vital_signs: {
        temperature: data.temperature,
        blood_pressure_systolic: data.blood_pressure_systolic,
        blood_pressure_diastolic: data.blood_pressure_diastolic,
        heart_rate: data.heart_rate,
        respiratory_rate: data.respiratory_rate,
        oxygen_saturation: data.oxygen_saturation,
        pain_scale: data.pain_scale,
      },
      symptoms: data.symptoms.split(',').map(s => s.trim()),
      assessment_notes: data.assessment_notes,
      recommended_action: data.recommended_action,
      estimated_wait_time: data.estimated_wait_time,
    };

    const result = await addTriageAssessment(assessmentData);
    
    if (result.error) {
      setError('Failed to create triage assessment. Please try again.');
    } else {
      onSuccess();
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Triage Assessment</h2>
              <p className="text-sm text-gray-600">Evaluate patient priority and care needs</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
              
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
                  Priority Level
                </label>
                <select
                  {...register('priority_level')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select priority level</option>
                  {TRIAGE_PRIORITY_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {errors.priority_level && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority_level.message}</p>
                )}
                {selectedPriority && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${TRIAGE_PRIORITY_LEVELS.find(l => l.value === selectedPriority)?.color}`}></div>
                    <span className="text-sm text-gray-600">
                      {TRIAGE_PRIORITY_LEVELS.find(l => l.value === selectedPriority)?.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chief Complaint
                </label>
                <input
                  {...register('chief_complaint')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Primary reason for visit"
                />
                {errors.chief_complaint && (
                  <p className="mt-1 text-sm text-red-600">{errors.chief_complaint.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Symptoms (comma-separated)
                </label>
                <textarea
                  {...register('symptoms')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="fever, headache, nausea"
                />
                {errors.symptoms && (
                  <p className="mt-1 text-sm text-red-600">{errors.symptoms.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Temperature (°F)
                  </label>
                  <input
                    {...register('temperature')}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="98.6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Heart Rate (bpm)
                  </label>
                  <input
                    {...register('heart_rate')}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="72"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    BP Systolic
                  </label>
                  <input
                    {...register('blood_pressure_systolic')}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    BP Diastolic
                  </label>
                  <input
                    {...register('blood_pressure_diastolic')}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Respiratory Rate
                  </label>
                  <input
                    {...register('respiratory_rate')}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="16"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    O2 Saturation (%)
                  </label>
                  <input
                    {...register('oxygen_saturation')}
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="98"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pain Scale (0-10)
                  </label>
                  <input
                    {...register('pain_scale')}
                    type="number"
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assessment Notes
              </label>
              <textarea
                {...register('assessment_notes')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed assessment findings and observations..."
              />
              {errors.assessment_notes && (
                <p className="mt-1 text-sm text-red-600">{errors.assessment_notes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recommended Action
              </label>
              <textarea
                {...register('recommended_action')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Immediate care needed, schedule with doctor, etc."
              />
              {errors.recommended_action && (
                <p className="mt-1 text-sm text-red-600">{errors.recommended_action.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estimated Wait Time (minutes)
            </label>
            <input
              {...register('estimated_wait_time')}
              type="number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="30"
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
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Assessment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}