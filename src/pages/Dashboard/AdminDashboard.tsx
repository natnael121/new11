import React, { useEffect, useState } from 'react';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { CardPolicySettings } from '../../components/Admin/CardPolicySettings';
import { ShiftManagement } from '../../components/Admin/ShiftManagement';
import { Users, Calendar, DollarSign, TestTube, TrendingUp, Clock, CheckCircle, AlertTriangle, CreditCard, Clock as UserClock } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'card_policy' | 'shift_management'>('overview');
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingLabResults: 0,
    monthlyRevenue: 0,
    expiredCards: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total patients
      const patientsSnapshot = await getDocs(collection(db, 'patients'));
      const totalPatients = patientsSnapshot.size;

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('appointment_date', '==', today)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const todayAppointments = appointmentsSnapshot.size;

      // Fetch pending lab results
      const labTestsQuery = query(
        collection(db, 'lab_tests'),
        where('status', 'in', ['requested', 'in_progress'])
      );
      const labTestsSnapshot = await getDocs(labTestsQuery);
      const pendingLabResults = labTestsSnapshot.size;

      // Fetch expired cards
      const expiredCardsQuery = query(
        collection(db, 'patients'),
        where('card_expiry_date', '<', today)
      );
      const expiredCardsSnapshot = await getDocs(expiredCardsQuery);
      const expiredCards = expiredCardsSnapshot.size;

      setStats({
        totalPatients,
        todayAppointments,
        pendingLabResults,
        expiredCards,
        monthlyRevenue: 45230, // Mock data for now
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { 
      title: 'Total Patients', 
      value: loading ? '...' : stats.totalPatients.toString(), 
      icon: Users, 
      color: 'blue' as const, 
      trend: { value: 12, isPositive: true } 
    },
    { 
      title: 'Today\'s Appointments', 
      value: loading ? '...' : stats.todayAppointments.toString(), 
      icon: Calendar, 
      color: 'green' as const, 
      trend: { value: 5, isPositive: true } 
    },
    { 
      title: 'Monthly Revenue', 
      value: loading ? '...' : `$${stats.monthlyRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'purple' as const, 
      trend: { value: 8, isPositive: true } 
    },
    { 
      title: 'Pending Lab Results', 
      value: loading ? '...' : stats.pendingLabResults.toString(), 
      icon: TestTube, 
      color: 'yellow' as const, 
      trend: { value: 2, isPositive: false } 
    },
    { 
      title: 'Expired Cards', 
      value: loading ? '...' : stats.expiredCards.toString(), 
      icon: CreditCard, 
      color: 'red' as const 
    },
  ];

  const recentActivity = [
    { action: 'New patient registered', patient: 'Sarah Johnson', time: '10 minutes ago', icon: Users },
    { action: 'Lab result completed', patient: 'Michael Brown', time: '25 minutes ago', icon: CheckCircle },
    { action: 'Appointment scheduled', patient: 'Emma Davis', time: '1 hour ago', icon: Calendar },
    { action: 'Prescription dispensed', patient: 'Robert Wilson', time: '2 hours ago', icon: CheckCircle },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor clinic operations and performance</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab('card_policy')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'card_policy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              CARD POLICY
            </button>
            <button
              onClick={() => setActiveTab('shift_management')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shift_management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              SHIFT MANAGEMENT
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <activity.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.patient}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Alerts</h2>
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Low Stock Alert</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">5 medications running low</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Pending Reviews</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">{stats.pendingLabResults} lab results need review</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">System Healthy</span>
              </div>
              <p className="text-sm text-green-700 mt-1">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {activeTab === 'card_policy' && (
        <CardPolicySettings />
      )}

      {activeTab === 'shift_management' && (
        <ShiftManagement />
      )}
    </div>
  );
}