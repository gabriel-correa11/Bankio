import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCA6kqctYoqi9tQ_Qmy7a4lQbzOrTBLr60',
  authDomain: 'grimorio-416b6.firebaseapp.com',
  projectId: 'grimorio-416b6',
  storageBucket: 'grimorio-416b6.firebasestorage.app',
  messagingSenderId: '556724769927',
  appId: '1:556724769927:web:7f4cb60f4fcdedb11cd422',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
