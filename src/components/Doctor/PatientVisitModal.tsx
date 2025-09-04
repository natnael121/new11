import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, FileText, Save, TestTube, Pill } from 'lucide-react';
import { usePatientVisits } from '../../hooks/usePatientVisits';
import { useLabTests } from '../../hooks/useLabTests';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { useAuthContext } from '../../context/AuthContext';
import { Patient } from '../../types';

interface PatientVisitFormData {
  chief_complaint: string;
  history_of_present_illness: string;
  physical_examination: string;
  diagnosis: string;
  treatment_plan: string;
  follow_up_instructions?: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  weight?: number;
  height?: number;
  oxygen_saturation?: number;
  lab_tests?: string;
  prescription_medication?: string;
  prescription_dosage?: string;
  prescription_frequency?: string;
  prescription_duration?: string;
  prescription_instructions?: string;
}

const schema = yup.object({
  chief_complaint: yup.string().required('Chief complaint is required'),
  history_of_present_illness: yup.string().required('History of present illness is required'),
  physical_examination: yup.string().required('Physical examination findings are required'),
  diagnosis: yup.string().required('Diagnosis is required'),
  treatment_plan: yup.string().required('Treatment plan is required'),
  follow_up_instructions: yup.string(),
  temperature: yup.number().positive().nullable(),
  blood_pressure_systolic: yup.number().positive().nullable(),
  blood_pressure_diastolic: yup.number().positive().nullable(),
  heart_rate: yup.number().positive().nullable(),
  respiratory_rate: yup.number().positive().nullable(),
  weight: yup.number().positive().nullable(),
  height: yup.number().positive().nullable(),
  oxygen_saturation: yup.number().min(0).max(100).nullable(),
  lab_tests: yup.string(),
  prescription_medication: yup.string(),
  prescription_dosage: yup.string(),
  prescription_frequency: yup.string(),
  prescription_duration: yup.string(),
  prescription_instructions: yup.string(),
});

interface PatientVisitModalProps {
  patient: Patient;
  appointmentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PatientVisitModal({ patient, appointmentId, onClose, onSuccess }: PatientVisitModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addPatientVisit } = usePatientVisits();
  const { addLabTest } = useLabTests();
  const { addPrescription } = usePrescriptions();
  const { user } = useAuthContext();

  const { register, handleSubmit, formState: { errors } } = useForm<PatientVisitFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: PatientVisitFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create patient visit record
      const visitData = {
        patient_id: patient.id,
        doctor_id: user?.id || '',
        appointment_id: appointmentId,
        visit_date: new Date().toISOString(),
        chief_complaint: data.chief_complaint,
        history_of_present_illness: data.history_of_present_illness,
        physical_examination: data.physical_examination,
        diagnosis: data.diagnosis,
        treatment_plan: data.treatment_plan,
        follow_up_instructions: data.follow_up_instructions,
        vital_signs: {
          temperature: data.temperature,
          blood_pressure_systolic: data.blood_pressure_systolic,
          blood_pressure_diastolic: data.blood_pressure_diastolic,
          heart_rate: data.heart_rate,
          respiratory_rate: data.respiratory_rate,
          weight: data.weight,
          height: data.height,
          oxygen_saturation: data.oxygen_saturation,
        },
        lab_tests_requested: data.lab_tests ? data.lab_tests.split(',').map(t => t.trim()) : [],
        prescriptions_given: data.prescription_medication ? [data.prescription_medication] : [],
      };

      const visitResult = await addPatientVisit(visitData);
      
      if (visitResult.error) {
        throw new Error('Failed to save visit record');
      }

      // Create lab test requests if specified
      if (data.lab_tests) {
        const labTests = data.lab_tests.split(',').map(t => t.trim());
        for (const testName of labTests) {
          await addLabTest({
            patient_id: patient.id,
            doctor_id: user?.id || '',
            appointment_id: appointmentId,
            test_name: testName,
            test_type: 'other',
            status: 'requested',
            notes: `Requested during visit on ${format(new Date(), 'MMM dd, yyyy')}`,
            requested_at: new Date().toISOString(),
          });
        }
      }

      // Create prescription if specified
      if (data.prescription_medication) {
        await addPrescription({
          patient_id: patient.id,
          doctor_id: user?.id || '',
          appointment_id: appointmentId,
          medication_name: data.prescription_medication,
          dosage: data.prescription_dosage || '',
          frequency: data.prescription_frequency || '',
          duration: data.prescription_duration || '',
          instructions: data.prescription_instructions,
          status: 'pending',
        });
      }

      onSuccess();
    } catch (error) {
      setError('Failed to save patient visit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Patient Visit Record</h2>
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Clinical Assessment</h3>
              
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
                  History of Present Illness
                </label>
                <textarea
                  {...register('history_of_present_illness')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed history of current symptoms and timeline..."
                />
                {errors.history_of_present_illness && (
                  <p className="mt-1 text-sm text-red-600">{errors.history_of_present_illness.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Physical Examination
                </label>
                <textarea
                  {...register('physical_examination')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Physical examination findings..."
                />
                {errors.physical_examination && (
                  <p className="mt-1 text-sm text-red-600">{errors.physical_examination.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diagnosis
                </label>
                <textarea
                  {...register('diagnosis')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Primary and secondary diagnoses..."
                />
                {errors.diagnosis && (
                  <p className="mt-1 text-sm text-red-600">{errors.diagnosis.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Treatment Plan
                </label>
                <textarea
                  {...register('treatment_plan')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Treatment recommendations and plan..."
                />
                {errors.treatment_plan && (
                  <p className="mt-1 text-sm text-red-600">{errors.treatment_plan.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Follow-up Instructions
                </label>
                <textarea
                  {...register('follow_up_instructions')}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Follow-up care instructions..."
                />
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
                    Weight (lbs)
                  </label>
                  <input
                    {...register('weight')}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Height (inches)
                  </label>
                  <input
                    {...register('height')}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="68"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <TestTube className="w-4 h-4 text-blue-600" />
                  <span>Lab Tests</span>
                </h4>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Requested Tests (comma-separated)
                  </label>
                  <textarea
                    {...register('lab_tests')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="CBC, Blood glucose, Lipid panel"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Pill className="w-4 h-4 text-green-600" />
                  <span>Prescription</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medication Name
                    </label>
                    <input
                      {...register('prescription_medication')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Amoxicillin"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dosage
                      </label>
                      <input
                        {...register('prescription_dosage')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="500mg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Frequency
                      </label>
                      <input
                        {...register('prescription_frequency')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="3 times daily"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      {...register('prescription_duration')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="7 days"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Instructions
                    </label>
                    <textarea
                      {...register('prescription_instructions')}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Take with food, complete full course..."
                    />
                  </div>
                </div>
              </div>
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
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Visit Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}