import React, { useState } from 'react';
import { Calendar, Clock, Plus, User, Stethoscope } from 'lucide-react';
import { useAppointments } from '../../hooks/useAppointments';
import { usePatients } from '../../hooks/usePatients';
import { format, startOfWeek, addDays } from 'date-fns';
import { AppointmentBookingModal } from '../../components/Appointments/AppointmentBookingModal';

export function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { appointments, loading } = useAppointments();
  const { patients } = usePatients();

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">Schedule and manage patient appointments</p>
        </div>
        <button 
          onClick={() => setShowBookingModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Appointment</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    viewMode === 'day' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    viewMode === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {viewMode === 'day' ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
              </h3>
              <div className="space-y-4">
                {getAppointmentsForDate(selectedDate)
                  .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                  .map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {format(new Date(`2000-01-01T${appointment.appointment_time}`), 'hh:mm a')}
                            </p>
                            <p className="text-sm text-gray-600">
                              Patient ID: {appointment.patient_id}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                          {appointment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="ml-13 space-y-1">
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
                  ))}
                
                {getAppointmentsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No appointments scheduled for this day.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Week of {format(selectedDate, 'MMMM dd, yyyy')}
              </h3>
              <div className="grid grid-cols-7 gap-4">
                {getWeekDays().map((day, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="text-center mb-2">
                      <div className="text-sm font-medium text-gray-600">
                        {format(day, 'EEE')}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {format(day, 'dd')}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {getAppointmentsForDate(day)
                        .slice(0, 3)
                        .map((appointment) => (
                          <div key={appointment.id} className="bg-blue-50 rounded p-2">
                            <div className="text-xs font-medium text-blue-700">
                              {format(new Date(`2000-01-01T${appointment.appointment_time}`), 'hh:mm a')}
                            </div>
                            <div className="text-xs text-blue-600">
                              {appointment.patient?.first_name} {appointment.patient?.last_name}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showBookingModal && (
        <AppointmentBookingModal
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => setShowBookingModal(false)}
          patients={patients}
        />
      )}
    </div>
  );
}