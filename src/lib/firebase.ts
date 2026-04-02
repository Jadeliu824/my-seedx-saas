import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'seedx-46c17',
  appId: '1:674583053287:web:deec230f37e609b758f342',
  storageBucket: 'seedx-46c17.firebasestorage.app',
  apiKey: 'AIzaSyDKZo48SocP1qASWwh-wanFonm0GqY12rM',
  authDomain: 'seedx-46c17.firebaseapp.com',
  messagingSenderId: '674583053287',
  measurementId: 'G-RM2RTK9QL5',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
