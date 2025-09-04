import React, { useState } from 'react';
import { Search, X, Phone } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';
import { PatientCard } from './PatientCard';

interface PatientSearchModalProps {
  onClose: () => void;
  onSelectPatient: (patientId: string) => void;
}

export function PatientSearchModal({ onClose, onSelectPatient }: PatientSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'phone' | 'id'>('name');
  const { patients } = usePatients();

  const filteredPatients = patients.filter(patient => {
    const term = searchTerm.toLowerCase();
    switch (searchType) {
      case 'phone':
        return patient.phone.includes(searchTerm);
      case 'id':
        return patient.patient_id.toLowerCase().includes(term);
      case 'name':
      default:
        return `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(term);
    }
  });

  const isPhoneSearch = searchType === 'phone';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Search Patients</h2>
              <p className="text-sm text-gray-600">Find and select a patient</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search by ${searchType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'name' | 'phone' | 'id')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="phone">Phone</option>
              <option value="id">Patient ID</option>
            </select>
          </div>

          {isPhoneSearch && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">Full patient information will be shown when searching by phone number</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                showFullInfo={isPhoneSearch}
                onClick={() => onSelectPatient(patient.id)}
              />
            ))}
          </div>

          {filteredPatients.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-gray-500">No patients found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}