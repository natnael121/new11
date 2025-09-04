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
import { Prescription } from '../types';

export function usePrescriptions(doctorId?: string) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, [doctorId]);

  const fetchPrescriptions = async () => {
    try {
      let q = query(collection(db, 'prescriptions'), orderBy('created_at', 'desc'));
      
      if (doctorId) {
        q = query(
          collection(db, 'prescriptions'), 
          where('doctor_id', '==', doctorId),
          orderBy('created_at', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const prescriptionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Prescription[];
      
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const docRef = await addDoc(collection(db, 'prescriptions'), {
        ...prescriptionData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      
      await fetchPrescriptions();
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  };

  const updatePrescription = async (id: string, updates: Partial<Prescription>) => {
    try {
      await updateDoc(doc(db, 'prescriptions', id), {
        ...updates,
        updated_at: serverTimestamp(),
      });
      
      await fetchPrescriptions();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    prescriptions,
    loading,
    addPrescription,
    updatePrescription,
    refetch: fetchPrescriptions,
  };
}