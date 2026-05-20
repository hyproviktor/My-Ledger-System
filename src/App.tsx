// src/App.tsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { TwoDSystem } from './components/TwoDSystem';
import { AuthScreen } from './components/AuthScreen';
import './styles.css';

export default function App() {
  const [currentSystem, setCurrentSystem] = useState('2D');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🌟 အကောင့်ဝင်ထားခြင်း ရှိ/မရှိ စစ်ဆေးသည့် အပိုင်း 🌟
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
     return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)', color: '#3b82f6', fontSize: '20px', fontWeight: 'bold'}}>Loading...</div>;
  }

  // 🌟 အကောင့်မဝင်ရသေးပါက Login Screen ကိုသာ ပြပါမည် 🌟
  if (!user) {
     return <AuthScreen />;
  }

  // 🌟 အကောင့်ဝင်ထားပါက 2D စနစ်ကို ပြပါမည် 🌟
  if (currentSystem === '2D') {
    return <TwoDSystem />;
  }

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0b1120', color: 'white'}}>
       <h2>3D System Coming Soon...</h2>
    </div>
  );
}