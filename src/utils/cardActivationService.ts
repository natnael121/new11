import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { startOfDay } from 'date-fns';

export class CardActivationService {
  static async deactivateExpiredCards() {
    try {
      const today = startOfDay(new Date());
      
      // Get all patients with daily activation requirement
      const q = query(
        collection(db, 'patients'),
        where('daily_activation_required', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      for (const patientDoc of querySnapshot.docs) {
        const patient = patientDoc.data();
        const lastActivation = patient.last_daily_activation 
          ? startOfDay(new Date(patient.last_daily_activation))
          : null;
        
        // If not activated today, deactivate the card
        if (!lastActivation || lastActivation < today) {
          await updateDoc(doc(db, 'patients', patientDoc.id), {
            card_status: 'inactive',
            updated_at: new Date(),
          });
        }
      }
      
      console.log('Daily card deactivation completed');
    } catch (error) {
      console.error('Error during daily card deactivation:', error);
    }
  }

  static startMidnightDeactivation() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.deactivateExpiredCards();
      // Set up daily interval
      setInterval(() => {
        this.deactivateExpiredCards();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, msUntilMidnight);
  }
}