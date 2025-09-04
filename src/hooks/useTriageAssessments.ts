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
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TriageAssessment } from '../types';

export function useTriageAssessments(triageOfficerId?: string, patientId?: string) {
  const [assessments, setAssessments] = useState<TriageAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, [triageOfficerId, patientId]);

  const fetchAssessments = async () => {
    try {
      let q = query(collection(db, 'triage_assessments'), orderBy('created_at', 'desc'));
      
      if (triageOfficerId) {
        q = query(
          collection(db, 'triage_assessments'), 
          where('triage_officer_id', '==', triageOfficerId),
          orderBy('created_at', 'desc')
        );
      } else if (patientId) {
        q = query(
          collection(db, 'triage_assessments'), 
          where('patient_id', '==', patientId),
          orderBy('created_at', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const assessmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as TriageAssessment[];
      
      // Fetch patient and triage officer information
      for (const assessment of assessmentsData) {
        try {
          // Fetch patient info
          const patientDoc = await getDoc(doc(db, 'patients', assessment.patient_id));
          if (patientDoc.exists()) {
            assessment.patient = {
              id: patientDoc.id,
              ...patientDoc.data(),
              created_at: patientDoc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
              updated_at: patientDoc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
            } as any;
          }
          
          // Fetch triage officer info
          const triageOfficerDoc = await getDoc(doc(db, 'users', assessment.triage_officer_id));
          if (triageOfficerDoc.exists()) {
            assessment.triage_officer = {
              id: triageOfficerDoc.id,
              ...triageOfficerDoc.data(),
              created_at: triageOfficerDoc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
              updated_at: triageOfficerDoc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
            } as any;
          }
        } catch (error) {
          console.error('Error fetching related data:', error);
        }
      }
      
      setAssessments(assessmentsData);
    } catch (error) {
      console.error('Error fetching triage assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTriageAssessment = async (assessmentData: Omit<TriageAssessment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const docRef = await addDoc(collection(db, 'triage_assessments'), {
        ...assessmentData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      
      await fetchAssessments();
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  };

  const updateTriageAssessment = async (id: string, updates: Partial<TriageAssessment>) => {
    try {
      await updateDoc(doc(db, 'triage_assessments', id), {
        ...updates,
        updated_at: serverTimestamp(),
      });
      
      await fetchAssessments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    assessments,
    loading,
    addTriageAssessment,
    updateTriageAssessment,
    refetch: fetchAssessments,
  };
}