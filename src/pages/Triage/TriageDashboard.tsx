import React, { useState } from 'react';
import { AlertTriangle, Clock, Users, Plus, Activity, Heart } from 'lucide-react';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { useTriageAssessments } from '../../hooks/useTriageAssessments';
import { useAuthContext } from '../../context/AuthContext';
import { TriageAssessmentModal } from '../../components/Triage/TriageAssessmentModal';
import { TriageQueueCard } from '../../components/Triage/TriageQueueCard';

export function TriageDashboard() {
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { assessments, loading } = useTriageAssessments(user?.id);

  const emergencyCount = assessments.filter(a => a.priority_level === 'emergency').length;
  const urgentCount = assessments.filter(a => a.priority_level === 'urgent').length;
  const totalWaiting = assessments.filter(a => !a.appointment_id).length;
  const avgWaitTime = assessments.reduce((acc, a) => acc + (a.estimated_wait_time || 0), 0) / assessments.length || 0;

  const stats = [
    { title: 'Emergency Cases', value: emergencyCount.toString(), icon: AlertTriangle, color: 'red' as const },
    { title: 'Urgent Cases', value: urgentCount.toString(), icon: Activity, color: 'yellow' as const },
    { title: 'Patients Waiting', value: totalWaiting.toString(), icon: Users, color: 'blue' as const },
    { title: 'Avg Wait Time', value: `${Math.round(avgWaitTime)}m`, icon: Clock, color: 'purple' as const },
  ];

  const sortedAssessments = assessments.sort((a, b) => {
    const priorityOrder = { emergency: 0, urgent: 1, semi_urgent: 2, standard: 3, non_urgent: 4 };
    return priorityOrder[a.priority_level] - priorityOrder[b.priority_level];
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Triage Dashboard</h1>
          <p className="text-gray-600 mt-2">Assess and prioritize patient care</p>
        </div>
        <button 
          onClick={() => setShowAssessmentModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Assessment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Patient Queue</h2>
            <span className="text-sm text-gray-500">Sorted by priority</span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {sortedAssessments.map((assessment) => (
              <TriageQueueCard
                key={assessment.id}
                assessment={assessment}
                onClick={() => setSelectedPatientId(assessment.patient_id)}
              />
            ))}
            
            {assessments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No patients in triage queue.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAssessmentModal && (
        <TriageAssessmentModal
          onClose={() => setShowAssessmentModal(false)}
          onSuccess={() => setShowAssessmentModal(false)}
        />
      )}
    </div>
  );
}