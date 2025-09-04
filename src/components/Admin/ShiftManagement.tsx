import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Clock as UserClock, Plus, X, Save, Clock, Users } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ShiftFormData {
  user_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  role: string;
  notes?: string;
}

interface Shift {
  id: string;
  user_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  role: string;
  notes?: string;
  user?: any;
  created_at: string;
}

const schema = yup.object({
  user_id: yup.string().required('Staff member is required'),
  shift_date: yup.string().required('Date is required'),
  start_time: yup.string().required('Start time is required'),
  end_time: yup.string().required('End time is required'),
  role: yup.string().required('Role is required'),
  notes: yup.string(),
});

export function ShiftManagement() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShiftFormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    fetchShifts();
    fetchUsers();
  }, []);

  const fetchShifts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'shifts'));
      const shiftsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Shift[];

      // Fetch user information for each shift
      for (const shift of shiftsData) {
        try {
          const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', shift.user_id)));
          if (!userDoc.empty) {
            shift.user = userDoc.docs[0].data();
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }

      setShifts(shiftsData);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const onSubmit = async (data: ShiftFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'shifts'), {
        ...data,
        created_at: serverTimestamp(),
      });

      await fetchShifts();
      setShowAddModal(false);
      reset();
    } catch (error: any) {
      setError('Failed to create shift. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayShifts = shifts.filter(shift => 
    shift.shift_date === new Date().toISOString().split('T')[0]
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserClock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Shift Management</h2>
              <p className="text-sm text-gray-600">Schedule and manage staff shifts</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Shift</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Shifts</h3>
            <div className="space-y-3">
              {todayShifts.map((shift) => (
                <div key={shift.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      {shift.user?.first_name} {shift.user?.last_name}
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {shift.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{shift.start_time} - {shift.end_time}</span>
                    </div>
                  </div>
                  {shift.notes && (
                    <p className="text-sm text-gray-500 mt-2">{shift.notes}</p>
                  )}
                </div>
              ))}
              
              {todayShifts.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No shifts scheduled for today
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Shifts</h3>
            <div className="space-y-3">
              {shifts
                .filter(shift => shift.shift_date > new Date().toISOString().split('T')[0])
                .slice(0, 5)
                .map((shift) => (
                  <div key={shift.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {shift.user?.first_name} {shift.user?.last_name}
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {new Date(shift.shift_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{shift.start_time} - {shift.end_time}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserClock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Schedule Shift</h2>
                  <p className="text-sm text-gray-600">Add a new staff shift</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                  reset();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Staff Member
                </label>
                <select
                  {...register('user_id')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select staff member</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
                {errors.user_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.user_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  {...register('shift_date')}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.shift_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.shift_date.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    {...register('start_time')}
                    type="time"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.start_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    {...register('end_time')}
                    type="time"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.end_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select role</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="doctor">Doctor</option>
                  <option value="lab_technician">Lab Technician</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="triage_officer">Triage Officer</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Special instructions or notes..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                    reset();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Schedule Shift'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}