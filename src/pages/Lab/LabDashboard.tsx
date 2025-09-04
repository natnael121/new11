import React, { useState } from 'react';
import { TestTube, Clock, CheckCircle, AlertCircle, Play, FileCheck, Plus, Settings } from 'lucide-react';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { useLabTests } from '../../hooks/useLabTests';
import { useLabTestTypes } from '../../hooks/useLabTestTypes';
import { useAuthContext } from '../../context/AuthContext';
import { LabTestTypeModal } from '../../components/Lab/LabTestTypeModal';
import { LabResultsModal } from '../../components/Lab/LabResultsModal';
import { format } from 'date-fns';

export function LabDashboard() {
  const [activeTab, setActiveTab] = useState<'requested' | 'in_progress' | 'completed' | 'test_types'>('requested');
  const [showTestTypeModal, setShowTestTypeModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const { user } = useAuthContext();
  const { labTests, loading, updateLabTest } = useLabTests(user?.role === 'lab_technician' ? user.id : undefined);
  const { labTestTypes } = useLabTestTypes();

  const pendingTests = labTests.filter(test => test.status === 'requested');
  const inProgressTests = labTests.filter(test => test.status === 'in_progress');
  const completedTests = labTests.filter(test => test.status === 'completed');
  const urgentTests = labTests.filter(test => test.status === 'requested' && test.notes?.includes('urgent'));

  const stats = [
    { title: 'Pending Tests', value: pendingTests.length.toString(), icon: Clock, color: 'yellow' as const },
    { title: 'In Progress', value: inProgressTests.length.toString(), icon: TestTube, color: 'blue' as const },
    { title: 'Completed Today', value: completedTests.length.toString(), icon: CheckCircle, color: 'green' as const },
    { title: 'Urgent Tests', value: urgentTests.length.toString(), icon: AlertCircle, color: 'red' as const },
  ];

  const handleStartTest = async (testId: string) => {
    await updateLabTest(testId, { 
      status: 'in_progress',
      technician_id: user?.id 
    });
  };

  const handleCompleteTest = async (testId: string, results: string) => {
    await updateLabTest(testId, { 
      status: 'completed',
      results,
      completed_at: new Date().toISOString()
    });
  };

  const getFilteredTests = () => {
    switch (activeTab) {
      case 'requested':
        return pendingTests;
      case 'in_progress':
        return inProgressTests;
      case 'completed':
        return completedTests;
      case 'test_types':
        return [];
      default:
        return [];
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Lab Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage laboratory tests and results</p>
        </div>
        {activeTab === 'test_types' && (
          <button 
            onClick={() => setShowTestTypeModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Test Type</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'requested', label: 'PENDING' },
              { key: 'in_progress', label: 'IN PROGRESS' },
              { key: 'completed', label: 'COMPLETED' },
              { key: 'test_types', label: 'TEST TYPES' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'test_types' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {labTestTypes.map((testType) => (
                  <div key={testType.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{testType.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        testType.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {testType.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>Category: {testType.category.replace('_', ' ').toUpperCase()}</div>
                      {testType.description && (
                        <div>Description: {testType.description}</div>
                      )}
                      {testType.normal_range && (
                        <div>Normal Range: {testType.normal_range}</div>
                      )}
                      {testType.estimated_duration && (
                        <div>Duration: {testType.estimated_duration} minutes</div>
                      )}
                      {testType.cost && (
                        <div>Cost: ${testType.cost}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {labTestTypes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No test types configured. Add your first test type!</p>
                </div>
              )}
            </div>
          ) : (
          <div className="space-y-4">
            {getFilteredTests().map((test) => (
              <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{test.test_name}</h3>
                    <p className="text-sm text-gray-600">Patient ID: {test.patient_id}</p>
                    <p className="text-sm text-gray-500">Type: {test.test_type.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      test.notes?.includes('urgent') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {test.notes?.includes('urgent') ? 'URGENT' : 'ROUTINE'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      test.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                      test.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {test.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>Requested by Dr. {test.doctor_id}</span>
                  <span>{format(new Date(test.requested_at), 'MMM dd, yyyy hh:mm a')}</span>
                </div>

                {test.notes && (
                  <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                    <strong>Notes:</strong> {test.notes}
                  </div>
                )}

                {test.results && (
                  <div className="mb-3 p-2 bg-green-50 rounded text-sm text-green-700">
                    <strong>Results:</strong> {test.results}
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  {test.status === 'requested' && (
                    <button 
                      onClick={() => handleStartTest(test.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Test</span>
                    </button>
                  )}
                  
                  {test.status === 'in_progress' && (
                    <button 
                      onClick={() => {
                        setSelectedTest(test);
                        setShowResultsModal(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Complete Test</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {getFilteredTests().length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No {activeTab.replace('_', ' ')} tests found.</p>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {showTestTypeModal && (
        <LabTestTypeModal
          onClose={() => setShowTestTypeModal(false)}
          onSuccess={() => setShowTestTypeModal(false)}
        />
      )}

      {showResultsModal && selectedTest && (
        <LabResultsModal
          test={selectedTest}
          onClose={() => {
            setShowResultsModal(false);
            setSelectedTest(null);
          }}
          onSuccess={() => {
            setShowResultsModal(false);
            setSelectedTest(null);
          }}
        />
      )}
    </div>
  );
}