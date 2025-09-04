import React from 'react';
import { AlertTriangle, Clock, Heart, Thermometer, Activity } from 'lucide-react';
import { TriageAssessment } from '../../types';
import { format } from 'date-fns';
import { TRIAGE_PRIORITY_LEVELS } from '../../utils/constants';

interface TriageQueueCardProps {
  assessment: TriageAssessment;
  onClick?: () => void;
}

export function TriageQueueCard({ assessment, onClick }: TriageQueueCardProps) {
  const priorityConfig = TRIAGE_PRIORITY_LEVELS.find(p => p.value === assessment.priority_level);
  
  const getPriorityIcon = () => {
    switch (assessment.priority_level) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'urgent':
        return <Activity className="w-5 h-5 text-orange-600" />;
      default:
        return <Heart className="w-5 h-5 text-blue-600" />;
    }
  };

  const getWaitTimeColor = () => {
    if (!assessment.estimated_wait_time) return 'text-gray-600';
    if (assessment.estimated_wait_time > 60) return 'text-red-600';
    if (assessment.estimated_wait_time > 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div 
      className="bg-white border-l-4 border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
      style={{ borderLeftColor: priorityConfig?.color.replace('bg-', '').replace('-500', '') === 'red' ? '#ef4444' : 
                                priorityConfig?.color.replace('bg-', '').replace('-500', '') === 'orange' ? '#f97316' :
                                priorityConfig?.color.replace('bg-', '').replace('-500', '') === 'yellow' ? '#eab308' :
                                priorityConfig?.color.replace('bg-', '').replace('-500', '') === 'green' ? '#22c55e' : '#3b82f6' }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getPriorityIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {assessment.patient?.first_name} {assessment.patient?.last_name}
            </h3>
            <p className="text-sm text-gray-600">ID: {assessment.patient?.patient_id}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            assessment.priority_level === 'emergency' ? 'bg-red-100 text-red-700' :
            assessment.priority_level === 'urgent' ? 'bg-orange-100 text-orange-700' :
            assessment.priority_level === 'semi_urgent' ? 'bg-yellow-100 text-yellow-700' :
            assessment.priority_level === 'standard' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {priorityConfig?.label.split(' ')[0]}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-900 mb-1">Chief Complaint:</p>
        <p className="text-sm text-gray-600">{assessment.chief_complaint}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        {assessment.vital_signs.temperature && (
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{assessment.vital_signs.temperature}°F</span>
          </div>
        )}
        {assessment.vital_signs.heart_rate && (
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{assessment.vital_signs.heart_rate} bpm</span>
          </div>
        )}
        {assessment.vital_signs.blood_pressure_systolic && assessment.vital_signs.blood_pressure_diastolic && (
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {assessment.vital_signs.blood_pressure_systolic}/{assessment.vital_signs.blood_pressure_diastolic}
            </span>
          </div>
        )}
        {assessment.estimated_wait_time && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-medium ${getWaitTimeColor()}`}>
              {assessment.estimated_wait_time}m wait
            </span>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Assessed {format(new Date(assessment.created_at), 'MMM dd, yyyy hh:mm a')}
      </div>
    </div>
  );
}