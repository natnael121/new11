import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBSrJCK7Qs9KyIOvX9tbFLOnBF-FR8sKhg",
  authDomain: "personalized-pregnancy.firebaseapp.com",
  projectId: "personalized-pregnancy",
  storageBucket: "personalized-pregnancy.firebasestorage.app",
  messagingSenderId: "1072372965788",
  appId: "1:1072372965788:web:994287a22a2dab7aefe859"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;