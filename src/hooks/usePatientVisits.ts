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
import { PatientVisit } from '../types';

export function usePatientVisits(patientId?: string, doctorId?: string) {
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, [patientId, doctorId]);

  const fetchVisits = async () => {
    try {
      let q = query(collection(db, 'patient_visits'), orderBy('visit_date', 'desc'));
      
      if (patientId) {
        q = query(
          collection(db, 'patient_visits'), 
          where('patient_id', '==', patientId),
          orderBy('visit_date', 'desc')
        );
      } else if (doctorId) {
        q = query(
          collection(db, 'patient_visits'), 
          where('doctor_id', '==', doctorId),
          orderBy('visit_date', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const visitsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        visit_date: doc.data().visit_date || new Date().toISOString(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as PatientVisit[];
      
      setVisits(visitsData);
    } catch (error) {
      console.error('Error fetching patient visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPatientVisit = async (visitData: Omit<PatientVisit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const docRef = await addDoc(collection(db, 'patient_visits'), {
        ...visitData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      
      await fetchVisits();
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  };

  const updatePatientVisit = async (id: string, updates: Partial<PatientVisit>) => {
    try {
      await updateDoc(doc(db, 'patient_visits', id), {
        ...updates,
        updated_at: serverTimestamp(),
      });
      
      await fetchVisits();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    visits,
    loading,
    addPatientVisit,
    updatePatientVisit,
    refetch: fetchVisits,
  };
}