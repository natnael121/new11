import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Appointment } from '../types';

export function useAppointments(doctorId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

  const fetchAppointments = async () => {
    try {
      let q = query(collection(db, 'appointments'), orderBy('appointment_date', 'desc'));
      
      if (doctorId) {
        q = query(
          collection(db, 'appointments'), 
          where('doctor_id', '==', doctorId),
          orderBy('appointment_date', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const appointmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Appointment[];
      
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointmentData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      
      await fetchAppointments();
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      await updateDoc(doc(db, 'appointments', id), {
        ...updates,
        updated_at: serverTimestamp(),
      });
      
      await fetchAppointments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    refetch: fetchAppointments,
  };
}