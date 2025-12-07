import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBndFrzTH4E5wOgqS6B_mmuNBvdYn-O4GM",
  authDomain: "clever-lemon.firebaseapp.com",
  databaseURL: "https://clever-lemon-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "clever-lemon",
  storageBucket: "clever-lemon.firebasestorage.app",
  messagingSenderId: "1043360097075",
  appId: "1:1043360097075:web:ca7c4a71f616a8dc57d446",
  measurementId: "G-M8NYPKLCV7"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const database = getDatabase(app);
export const auth = getAuth(app);
