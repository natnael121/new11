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

export interface LabTestType {
  id: string;
  name: string;
  category: 'blood' | 'urine' | 'imaging' | 'other';
  description?: string;
  normal_range?: string;
  preparation_instructions?: string;
  estimated_duration?: number;
  cost?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useLabTestTypes() {
  const [labTestTypes, setLabTestTypes] = useState<LabTestType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabTestTypes();
  }, []);

  const fetchLabTestTypes = async () => {
    try {
      const q = query(collection(db, 'lab_test_types'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const labTestTypesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as LabTestType[];
      
      setLabTestTypes(labTestTypesData);
    } catch (error) {
      console.error('Error fetching lab test types:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLabTestType = async (labTestTypeData: Omit<LabTestType, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const docRef = await addDoc(collection(db, 'lab_test_types'), {
        ...labTestTypeData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      
      await fetchLabTestTypes();
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  };

  const updateLabTestType = async (id: string, updates: Partial<LabTestType>) => {
    try {
      await updateDoc(doc(db, 'lab_test_types', id), {
        ...updates,
        updated_at: serverTimestamp(),
      });
      
      await fetchLabTestTypes();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteLabTestType = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'lab_test_types', id));
      await fetchLabTestTypes();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    labTestTypes,
    loading,
    addLabTestType,
    updateLabTestType,
    deleteLabTestType,
    refetch: fetchLabTestTypes,
  };
}