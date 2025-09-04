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
import { LabTest } from '../types';

export function useLabTests(technicianId?: string) {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabTests();
  }, [technicianId]);

  const fetchLabTests = async () => {
    try {
      let q = query(collection(db, 'lab_tests'), orderBy('requested_at', 'desc'));
      
      if (technicianId) {
        q = query(
          collection(db, 'lab_tests'), 
          where('technician_id', '==', technicianId),
          orderBy('requested_at', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const labTestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requested_at: doc.data().requested_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        completed_at: doc.data().completed_at?.toDate?.()?.toISOString(),
      })) as LabTest[];
      
      setLabTests(labTestsData);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLabTest = async (labTestData: Omit<LabTest, 'id' | 'requested_at' | 'completed_at'>) => {
    try {
      const docRef = await addDoc(collection(db, 'lab_tests'), {
        ...labTestData,
        requested_at: serverTimestamp(),
      });
      
      await fetchLabTests();
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  };

  const updateLabTest = async (id: string, updates: Partial<LabTest>) => {
    try {
      const updateData: any = { ...updates };
      
      if (updates.status === 'completed' && !updates.completed_at) {
        updateData.completed_at = serverTimestamp();
      }
      
      await updateDoc(doc(db, 'lab_tests', id), updateData);
      
      await fetchLabTests();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    labTests,
    loading,
    addLabTest,
    updateLabTest,
    refetch: fetchLabTests,
  };
}