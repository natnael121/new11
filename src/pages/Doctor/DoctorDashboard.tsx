import React, { useEffect, useState } from 'react';
import { Calendar, Users, Pill, TestTube, Clock, FileText, Stethoscope, Send } from 'lucide-react';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { useAppointments } from '../../hooks/useAppointments';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { useLabTests } from '../../hooks/useLabTests';
import { usePatients } from '../../hooks/usePatients';
import { useAuthContext } from '../../context/AuthContext';
import { PatientHistoryModal } from '../../components/Doctor/PatientHistoryModal';
import { PatientSearchModal } from '../../components/Patients/PatientSearchModal';
import { SendLabTestModal } from '../../components/Doctor/SendLabTestModal';
import { SendPrescriptionModal } from '../../components/Doctor/SendPrescriptionModal';
import { format } from 'date-fns';

export function DoctorDashboard() {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const { user } = useAuthContext();
  const { appointments } = useAppointments(user?.id);
  const { prescriptions } = usePrescriptions(user?.id);
  const { labTests } = useLabTests();
  const { patients } = usePatients(user?.id, user?.role);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter(apt => apt.appointment_date === today);
  const pendingAppointments = appointments.filter(apt => apt.status === 'scheduled');
  const pendingLabResults = labTests.filter(test => test.status === 'requested' || test.status === 'in_progress');

  const stats = [
    { title: 'Today\'s Patients', value: todayAppointments.length.toString(), icon: Users, color: 'blue' as const },
    { title: 'Pending Appointments', value: pendingAppointments.length.toString(), icon: Calendar, color: 'green' as const },
    { title: 'Prescriptions Written', value: prescriptions.length.toString(), icon: Pill, color: 'purple' as const },
    { title: 'Lab Results Pending', value: pendingLabResults.length.toString(), icon: TestTube, color: 'yellow' as const },
  ];

  const upcomingAppointments = todayAppointments
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
    .slice(0, 5)
    .map(apt => ({
      time: format(new Date(`2000-01-01T${apt.appointment_time}`), 'hh:mm a'),
      patient: `${apt.patient?.first_name} ${apt.patient?.last_name}`,
      reason: apt.reason || 'General consultation',
      duration: '30 min'
    }));

  const pendingTasks = [
    { task: 'Review lab results for pending tests', priority: 'high' as const },
    { task: 'Update treatment plans for follow-up patients', priority: 'medium' as const },
    { task: 'Sign pending prescriptions', priority: 'low' as const },
  ];

  const handleSelectPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setShowPatientSearch(false);
      setShowHistoryModal(true);
    }
  };

  const handleQuickLabTest = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setShowLabModal(true);
  };

  const handleQuickPrescription = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setShowPrescriptionModal(true);
  };

  const handleLabTestSuccess = () => {
    setShowLabModal(false);
    setSelectedPatient(null);
  };

  const handlePrescriptionSuccess = () => {
    setShowPrescriptionModal(false);
    setSelectedPatient(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your patients and medical practice</p>
        </div>
        <button 
          onClick={() => setShowPatientSearch(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Stethoscope className="w-5 h-5" />
          <span>See Patient</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Assigned Patients</h2>
            <Users className="w-5 h-5 text-gray-600" />
          </div>
          <div className="space-y-3">
            {patients.slice(0, 5).map((patient) => (
              <div 
                key={patient.id} 
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleSelectPatient(patient.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{patient.first_name} {patient.last_name}</div>
                  <div className="text-sm text-gray-600">ID: {patient.patient_id}</div>
                  <div className="text-sm text-gray-500">Age: {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}</div>
                  {patient.phone && (
                    <div className="text-sm text-gray-500 truncate">Phone: {patient.phone}</div>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2 ml-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    patient.card_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {patient.card_status.toUpperCase()}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLabTest(patient);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Send Lab Test"
                    >
                      <TestTube className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickPrescription(patient);
                      }}
                      className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                      title="Send Prescription"
                    >
                      <Pill className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {patients.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No assigned patients with active cards
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{appointment.time}</div>
                    <div className="text-sm text-gray-600">{appointment.patient}</div>
                    <div className="text-sm text-gray-500">{appointment.reason}</div>
                  </div>
                  <div className="text-sm text-gray-500">{appointment.duration}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No appointments scheduled for today
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Tasks</h2>
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div className="space-y-3">
            {pendingTasks.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{item.task}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.priority === 'high' ? 'bg-red-100 text-red-700' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPatientSearch && (
        <PatientSearchModal
          onClose={() => setShowPatientSearch(false)}
          onSelectPatient={handleSelectPatient}
        />
      )}

      {showHistoryModal && selectedPatient && (
        <PatientHistoryModal
          patient={selectedPatient}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedPatient(null);
          }}
          onSuccess={() => {
            setShowHistoryModal(false);
            setSelectedPatient(null);
          }}
        />
      )}

      {showLabModal && selectedPatient && (
        <SendLabTestModal
          patient={selectedPatient}
          onClose={() => {
            setShowLabModal(false);
            setSelectedPatient(null);
          }}
          onSuccess={handleLabTestSuccess}
        />
      )}

      {showPrescriptionModal && selectedPatient && (
        <SendPrescriptionModal
          patient={selectedPatient}
          onClose={() => {
            setShowPrescriptionModal(false);
            setSelectedPatient(null);
          }}
          onSuccess={handlePrescriptionSuccess}
        />
      )}
    </div>
  );
}