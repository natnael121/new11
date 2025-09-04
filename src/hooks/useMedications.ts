import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Medication } from '../types';

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const q = query(collection(db, 'medications'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const medicationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Medication[];
      
      setMedications(medicationsData);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = async (medicationData: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const docRef = await addDoc(collection(db, 'medications'), {
        ...medicationData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      
      await fetchMedications();
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  };

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    try {
      await updateDoc(doc(db, 'medications', id), {
        ...updates,
        updated_at: serverTimestamp(),
      });
      
      await fetchMedications();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'medications', id));
      await fetchMedications();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    medications,
    loading,
    addMedication,
    updateMedication,
    deleteMedication,
    refetch: fetchMedications,
  };
}