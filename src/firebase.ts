// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB-x7d2r23A5pzLfM8LEOaJ9yRo14g6vac",
  authDomain: "my-2-app-4b43e.firebaseapp.com",
  projectId: "my-2-app-4b43e",
  storageBucket: "my-2-app-4b43e.firebasestorage.app",
  messagingSenderId: "677728205190",
  appId: "1:677728205190:web:24bc6286ed998f9d8a5407",
  measurementId: "G-VGT3V6Y6V9"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';