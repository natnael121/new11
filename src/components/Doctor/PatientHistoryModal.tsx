import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, FileText, Save, TestTube, Pill, History, Send, Heart, Activity } from 'lucide-react';
import { usePatientVisits } from '../../hooks/usePatientVisits';
import { useLabTests } from '../../hooks/useLabTests';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { useTriageAssessments } from '../../hooks/useTriageAssessments';
import { useAuthContext } from '../../context/AuthContext';
import { SendLabTestModal } from './SendLabTestModal';
import { SendPrescriptionModal } from './SendPrescriptionModal';
import { Patient } from '../../types';
import { format } from 'date-fns';

interface PatientHistoryFormData {
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
});

interface PatientHistoryModalProps {
  patient: Patient;
  appointmentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PatientHistoryModal({ patient, appointmentId, onClose, onSuccess }: PatientHistoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'new_visit' | 'lab_tests' | 'prescriptions'>('history');
  const [showLabModal, setShowLabModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const { visits, addPatientVisit } = usePatientVisits(patient.id);
  const { addLabTest } = useLabTests();
  const { addPrescription } = usePrescriptions();
  const { assessments } = useTriageAssessments(undefined, patient.id);
  const { user } = useAuthContext();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PatientHistoryFormData>({
    resolver: yupResolver(schema),
  });

  // Get the latest triage assessment for this patient
  const latestTriageAssessment = assessments.length > 0 ? assessments[0] : null;

  // Pre-fill vital signs from triage if available
  React.useEffect(() => {
    if (latestTriageAssessment?.vital_signs) {
      const vs = latestTriageAssessment.vital_signs;
      if (vs.temperature) setValue('temperature', vs.temperature);
      if (vs.blood_pressure_systolic) setValue('blood_pressure_systolic', vs.blood_pressure_systolic);
      if (vs.blood_pressure_diastolic) setValue('blood_pressure_diastolic', vs.blood_pressure_diastolic);
      if (vs.heart_rate) setValue('heart_rate', vs.heart_rate);
      if (vs.respiratory_rate) setValue('respiratory_rate', vs.respiratory_rate);
      if (vs.oxygen_saturation) setValue('oxygen_saturation', vs.oxygen_saturation);
    }
  }, [latestTriageAssessment, setValue]);
  const onSubmit = async (data: PatientHistoryFormData) => {
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
        lab_tests_requested: [],
        prescriptions_given: [],
      };

      const visitResult = await addPatientVisit(visitData);
      
      if (visitResult.error) {
        throw new Error('Failed to save visit record');
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
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Patient Medical Record</h2>
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

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              MEDICAL HISTORY
            </button>
            <button
              onClick={() => setActiveTab('new_visit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'new_visit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              NEW VISIT
            </button>
            <button
              onClick={() => setActiveTab('lab_tests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lab_tests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              LAB TESTS
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prescriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              PRESCRIPTIONS
            </button>
          </nav>
        </div>

        {activeTab === 'history' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {patient.first_name} {patient.last_name}</div>
                  <div><strong>Patient ID:</strong> {patient.patient_id}</div>
                  <div><strong>Date of Birth:</strong> {format(new Date(patient.date_of_birth), 'MMM dd, yyyy')}</div>
                  <div><strong>Gender:</strong> {patient.gender}</div>
                  <div><strong>Phone:</strong> {patient.phone}</div>
                  <div><strong>Address:</strong> {patient.address}</div>
                  {patient.medical_history && (
                    <div><strong>Medical History:</strong> {patient.medical_history}</div>
                  )}
                  {patient.allergies && (
                    <div><strong>Allergies:</strong> {patient.allergies}</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Card Status</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      patient.card_status === 'active' ? 'bg-green-100 text-green-800' :
                      patient.card_status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.card_status.toUpperCase()}
                    </span>
                  </div>
                  <div><strong>Expires:</strong> {format(new Date(patient.card_expiry_date), 'MMM dd, yyyy')}</div>
                  {patient.assigned_doctor_id && (
                    <div><strong>Assigned Doctor:</strong> Dr. {patient.assigned_doctor?.first_name} {patient.assigned_doctor?.last_name}</div>
                  )}
                  {patient.last_daily_activation && (
                    <div><strong>Last Activation:</strong> {format(new Date(patient.last_daily_activation), 'MMM dd, yyyy')}</div>
                  )}
                </div>
              </div>
            </div>

            {latestTriageAssessment && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span>Latest Triage Assessment</span>
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Priority:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        latestTriageAssessment.priority_level === 'emergency' ? 'bg-red-100 text-red-800' :
                        latestTriageAssessment.priority_level === 'urgent' ? 'bg-orange-100 text-orange-800' :
                        latestTriageAssessment.priority_level === 'semi_urgent' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {latestTriageAssessment.priority_level.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div><strong>Chief Complaint:</strong> {latestTriageAssessment.chief_complaint}</div>
                    <div className="md:col-span-2"><strong>Assessment Notes:</strong> {latestTriageAssessment.assessment_notes}</div>
                    <div className="md:col-span-2"><strong>Recommended Action:</strong> {latestTriageAssessment.recommended_action}</div>
                    <div><strong>Assessed by:</strong> {latestTriageAssessment.triage_officer?.first_name} {latestTriageAssessment.triage_officer?.last_name}</div>
                    <div><strong>Date:</strong> {format(new Date(latestTriageAssessment.created_at), 'MMM dd, yyyy hh:mm a')}</div>
                  </div>
                  
                  {latestTriageAssessment.vital_signs && Object.values(latestTriageAssessment.vital_signs).some(v => v !== undefined && v !== null) && (
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">Triage Vital Signs</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {latestTriageAssessment.vital_signs.temperature && (
                          <div><strong>Temp:</strong> {latestTriageAssessment.vital_signs.temperature}°F</div>
                        )}
                        {latestTriageAssessment.vital_signs.heart_rate && (
                          <div><strong>HR:</strong> {latestTriageAssessment.vital_signs.heart_rate} bpm</div>
                        )}
                        {latestTriageAssessment.vital_signs.blood_pressure_systolic && latestTriageAssessment.vital_signs.blood_pressure_diastolic && (
                          <div><strong>BP:</strong> {latestTriageAssessment.vital_signs.blood_pressure_systolic}/{latestTriageAssessment.vital_signs.blood_pressure_diastolic}</div>
                        )}
                        {latestTriageAssessment.vital_signs.oxygen_saturation && (
                          <div><strong>O2 Sat:</strong> {latestTriageAssessment.vital_signs.oxygen_saturation}%</div>
                        )}
                        {latestTriageAssessment.vital_signs.respiratory_rate && (
                          <div><strong>RR:</strong> {latestTriageAssessment.vital_signs.respiratory_rate}</div>
                        )}
                        {latestTriageAssessment.vital_signs.pain_scale !== undefined && (
                          <div><strong>Pain:</strong> {latestTriageAssessment.vital_signs.pain_scale}/10</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit History</h3>
              <div className="space-y-4">
                {visits.map((visit) => (
                  <div key={visit.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <History className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          {format(new Date(visit.visit_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Dr. {visit.doctor?.first_name} {visit.doctor?.last_name}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Chief Complaint:</strong> {visit.chief_complaint}
                      </div>
                      <div>
                        <strong>Diagnosis:</strong> {visit.diagnosis}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Treatment Plan:</strong> {visit.treatment_plan}
                      </div>
                      {visit.follow_up_instructions && (
                        <div className="md:col-span-2">
                          <strong>Follow-up:</strong> {visit.follow_up_instructions}
                        </div>
                      )}
                      {visit.vital_signs && Object.values(visit.vital_signs).some(v => v !== undefined && v !== null) && (
                        <div className="md:col-span-2 mt-2 pt-2 border-t border-gray-200">
                          <strong>Vital Signs:</strong>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-xs">
                            {visit.vital_signs.temperature && <div>Temp: {visit.vital_signs.temperature}°F</div>}
                            {visit.vital_signs.heart_rate && <div>HR: {visit.vital_signs.heart_rate} bpm</div>}
                            {visit.vital_signs.blood_pressure_systolic && visit.vital_signs.blood_pressure_diastolic && (
                              <div>BP: {visit.vital_signs.blood_pressure_systolic}/{visit.vital_signs.blood_pressure_diastolic}</div>
                            )}
                            {visit.vital_signs.oxygen_saturation && <div>O2: {visit.vital_signs.oxygen_saturation}%</div>}
                            {visit.vital_signs.weight && <div>Weight: {visit.vital_signs.weight} lbs</div>}
                            {visit.vital_signs.height && <div>Height: {visit.vital_signs.height} in</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {visits.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No visit history available
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'new_visit' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {latestTriageAssessment && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Triage Information Available</span>
                </div>
                <div className="text-sm text-blue-600">
                  Priority: {latestTriageAssessment.priority_level.replace('_', ' ').toUpperCase()} | 
                  Chief Complaint: {latestTriageAssessment.chief_complaint}
                  {latestTriageAssessment.vital_signs && Object.values(latestTriageAssessment.vital_signs).some(v => v !== undefined && v !== null) && (
                    <span> | Vital signs pre-filled from triage</span>
                  )}
                </div>
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
                    defaultValue={latestTriageAssessment?.chief_complaint || ''}
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
                  {latestTriageAssessment?.vital_signs && Object.values(latestTriageAssessment.vital_signs).some(v => v !== undefined && v !== null) && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Pre-filled from triage</span>
                  )}
                </div>
                
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
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                      <TestTube className="w-4 h-4 text-blue-600" />
                      <span>Quick Actions</span>
                    </h4>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowLabModal(true)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <TestTube className="w-4 h-4" />
                      <span>Send Lab Test</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPrescriptionModal(true)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Pill className="w-4 h-4" />
                      <span>Send Prescription</span>
                    </button>
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
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Visit & Send to Lab'}</span>
              </button>
            </div>
          </form>
        ) : activeTab === 'lab_tests' ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lab Test Management</h3>
              <button
                onClick={() => setShowLabModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <TestTube className="w-4 h-4" />
                <span>New Lab Test</span>
              </button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">
                Send individual lab test requests to the laboratory. Each test will be tracked separately.
              </p>
            </div>
          </div>
        ) : activeTab === 'prescriptions' ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Prescription Management</h3>
              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Pill className="w-4 h-4" />
                <span>New Prescription</span>
              </button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                Send individual prescriptions to the pharmacy. Each prescription will be processed separately.
              </p>
            </div>
          </div>
        ) : null}

        {showLabModal && (
          <SendLabTestModal
            patient={patient}
            appointmentId={appointmentId}
            onClose={() => setShowLabModal(false)}
            onSuccess={() => setShowLabModal(false)}
          />
        )}

        {showPrescriptionModal && (
          <SendPrescriptionModal
            patient={patient}
            appointmentId={appointmentId}
            onClose={() => setShowPrescriptionModal(false)}
            onSuccess={() => setShowPrescriptionModal(false)}
          />
        )}
      </div>
    </div>
  );
}