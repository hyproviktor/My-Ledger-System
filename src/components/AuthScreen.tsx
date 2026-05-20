// src/components/AuthScreen.tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-main)', padding: '20px'}}>
      <div className="card" style={{width: '100%', maxWidth: '400px', padding: '30px', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'}}>
        
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
           <div style={{fontSize: '48px', marginBottom: '10px'}}>👑</div>
           <h2 style={{margin: 0, color: 'var(--text-main)', fontSize: '24px'}}>{isLogin ? 'အကောင့်ဝင်ရန်' : 'အကောင့်အသစ် ဖွင့်ရန်'}</h2>
           <p style={{color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px'}}>Pro 2D System မှ ကြိုဆိုပါသည်</p>
        </div>

        {error && (
            <div style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center'}}>
                {error}
            </div>
        )}

        <form onSubmit={handleAuth} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
           <div>
              <label style={{display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px'}}>Email</label>
              <input 
                type="email" 
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="သင့်အီးမေးလ် ရိုက်ထည့်ပါ..." 
                style={{width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '15px'}}
              />
           </div>
           
           <div>
              <label style={{display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px'}}>Password</label>
              <input 
                type="password" 
                required
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="စကားဝှက် ရိုက်ထည့်ပါ..." 
                style={{width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '15px'}}
              />
           </div>

           <button type="submit" disabled={loading} className="btn btn-primary" style={{padding: '16px', fontSize: '16px', marginTop: '10px', borderRadius: '14px'}}>
              {loading ? 'စောင့်ဆိုင်းပါ...' : (isLogin ? 'အကောင့်ဝင်မည်' : 'အကောင့်ဖွင့်မည်')}
           </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)'}}>
            {isLogin ? 'အကောင့် မရှိသေးဘူးလား? ' : 'အကောင့် ရှိပြီးသားလား? '}
            <span 
               onClick={() => setIsLogin(!isLogin)} 
               style={{color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer'}}
            >
                {isLogin ? 'အသစ်ဖွင့်မည်' : 'အကောင့်ဝင်မည်'}
            </span>
        </div>

      </div>
    </div>
  );
};