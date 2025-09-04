import React from 'react';
import { Clock, User, Stethoscope } from 'lucide-react';
import { Appointment } from '../../types';
import { format } from 'date-fns';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
};

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {format(new Date(`${appointment.appointment_date}T${appointment.appointment_time}`), 'MMM dd, yyyy')}
            </p>
            <p className="text-sm text-gray-600">
              {format(new Date(`${appointment.appointment_date}T${appointment.appointment_time}`), 'hh:mm a')}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
          {appointment.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {appointment.patient?.first_name} {appointment.patient?.last_name}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Stethoscope className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name}
          </span>
        </div>
        {appointment.reason && (
          <p className="text-sm text-gray-500 mt-2">{appointment.reason}</p>
        )}
      </div>
    </div>
  );
}