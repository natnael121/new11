import React, { useState } from 'react';
import { Pill, Package, AlertTriangle, CheckCircle, Check, Plus, Edit, Trash2 } from 'lucide-react';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { useMedications } from '../../hooks/useMedications';
import { MedicationModal } from '../../components/Pharmacy/MedicationModal';
import { format } from 'date-fns';

export function PharmacyDashboard() {
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'inventory'>('prescriptions');
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const { prescriptions, loading, updatePrescription } = usePrescriptions();
  const { medications, loading: medicationsLoading, deleteMedication } = useMedications();

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
  const dispensedToday = prescriptions.filter(p => 
    p.status === 'dispensed' && 
    new Date(p.updated_at).toDateString() === new Date().toDateString()
  );
  const lowStockMedications = medications.filter(m => m.stock_quantity < 20);

  const stats = [
    { title: 'Pending Prescriptions', value: pendingPrescriptions.length.toString(), icon: Pill, color: 'blue' as const },
    { title: 'Dispensed Today', value: dispensedToday.length.toString(), icon: CheckCircle, color: 'green' as const },
    { title: 'Low Stock Items', value: lowStockMedications.length.toString(), icon: AlertTriangle, color: 'red' as const },
    { title: 'Total Medications', value: medications.length.toString(), icon: Package, color: 'purple' as const },
  ];

  const handleDispenseMedication = async (prescriptionId: string) => {
    await updatePrescription(prescriptionId, { status: 'dispensed' });
  };

  const handleEditMedication = (medication: any) => {
    setSelectedMedication(medication);
    setShowMedicationModal(true);
  };

  const handleDeleteMedication = async (medicationId: string) => {
    if (confirm('Are you sure you want to delete this medication?')) {
      await deleteMedication(medicationId);
    }
  };

  if (loading || medicationsLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pharmacy</h1>
        <p className="text-gray-600 mt-2">Manage prescriptions and medication inventory</p>
      </div>
        {activeTab === 'inventory' && (
          <button 
            onClick={() => {
              setSelectedMedication(null);
              setShowMedicationModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Medication</span>
          </button>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
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
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              INVENTORY
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'prescriptions' ? (
            <div className="space-y-4">
              {pendingPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{prescription.medication_name}</h3>
                      <p className="text-sm text-gray-600">Patient ID: {prescription.patient_id}</p>
                      <p className="text-sm text-gray-500">Dosage: {prescription.dosage}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                      PENDING
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>Frequency: {prescription.frequency}</div>
                    <div>Duration: {prescription.duration}</div>
                    <div className="col-span-2">Instructions: {prescription.instructions}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Prescribed {format(new Date(prescription.created_at), 'MMM dd, yyyy')}
                    </span>
                    <button 
                      onClick={() => handleDispenseMedication(prescription.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Dispense Medication</span>
                    </button>
                  </div>
                </div>
              ))}
              
              {pendingPrescriptions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending prescriptions.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.strength} - {item.form.charAt(0).toUpperCase() + item.form.slice(1)}</p>
                      {item.generic_name && (
                        <p className="text-xs text-gray-500">Generic: {item.generic_name}</p>
                      )}
                      {item.brand_name && (
                        <p className="text-xs text-gray-500">Brand: {item.brand_name}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.stock_quantity < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.stock_quantity} in stock
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>Expiry: {format(new Date(item.expiry_date), 'MMM dd, yyyy')}</div>
                    <div>Price: ${item.price}</div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => handleEditMedication(item)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Edit Medication"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteMedication(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Delete Medication"
                    >
                      <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              ))}
              
              {medications.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No medications in inventory. Add your first medication!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showMedicationModal && (
        <MedicationModal
          medication={selectedMedication}
          onClose={() => {
            setShowMedicationModal(false);
            setSelectedMedication(null);
          }}
          onSuccess={() => {
            setShowMedicationModal(false);
            setSelectedMedication(null);
          }}
        />
      )}
    </div>
  );
}