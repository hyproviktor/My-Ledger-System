// src/components/Dashboard.tsx
import React from 'react';
import { auth } from '../firebase'; // 🌟 NEW: Firebase မှ auth ကို ဆွဲယူမည်

export const Dashboard = ({ t, toggleLang, toggleTheme, lang, theme, setShowHelp, setActiveTab, showConfirm, user, appSettings, userRole }) => {
  
  // 🌟 အီးမေးလ်မှ နာမည်ကို ဆွဲထုတ်ခြင်း (ဥပမာ- admin@gmail.com ဆိုလျှင် ADMIN ဟု ပြမည်)
  const userName = user?.email ? user.email.split('@')[0].toUpperCase() : 'GUEST USER';
  
  // 🌟 Expire Date သတ်မှတ်ခြင်း (Settings ထဲတွင် မရှိပါက Lifetime ဟု ပြမည်)
  const expireDateStr = appSettings?.expireDate ? new Date(appSettings.expireDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Lifetime (No Expiry)';

  // 🌟 လက်ရှိ အသုံးပြုနေသော Device အမျိုးအစားကို ဖမ်းယူခြင်း
  const getDeviceName = () => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return "📱 Android Phone";
    if (/iPad|iPhone|iPod/.test(ua)) return "📱 iOS Device (iPhone/iPad)";
    if (/Windows/.test(ua)) return "💻 Windows PC";
    if (/Mac OS/.test(ua)) return "💻 Mac Computer";
    return "🌐 Web Browser";
  };

  return (
    <div className="page-transition" style={{paddingTop: '10px', paddingBottom: '80px'}}>
      
      {/* 🌟 1. Premium Profile Card 🌟 */}
      <div className="card" style={{ padding: '20px', background: 'linear-gradient(145deg, var(--bg-card), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
         <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', background: 'rgba(59, 130, 246, 0.2)', filter: 'blur(30px)', borderRadius: '50%' }}></div>
         
         <div className="flex-row" style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex-gap" style={{alignItems: 'center'}}>
               <div style={{width: 54, height: 54, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', color: 'white', border: '2px solid rgba(255,255,255,0.2)'}}>👑</div>
               <div style={{marginLeft: '6px'}}>
                  {/* 🌟 Dynamic User Name 🌟 */}
                  <div className="font-bold" style={{fontSize: '18px', color: 'var(--text-main)', letterSpacing: '0.5px'}}>{userName}</div>
                  {/* 🌟 Dynamic Expire Date 🌟 */}
                  <div style={{fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '3px 8px', borderRadius: '6px', marginTop: '4px', display: 'inline-block', fontWeight: 'bold', border: '1px solid rgba(245, 158, 11, 0.3)'}}>⏳ {t('expire_date')} - {expireDateStr}</div>
               </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <div style={{display: 'flex', gap: '6px'}}>
                  <button onClick={toggleLang} className="icon-btn" style={{width: '32px', height: '32px', fontSize: '11px', fontWeight: '900', background: 'var(--input-bg)'}}>{lang === 'mm' ? 'EN' : 'MM'}</button>
                  <button onClick={toggleTheme} className="icon-btn" style={{width: '32px', height: '32px', fontSize: '14px', background: 'var(--input-bg)'}}>{theme === 'dark' ? '🌞' : '🌙'}</button>
               </div>
               <button onClick={() => setShowHelp(true)} style={{background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold'}}>❓ Help</button>
            </div>
         </div>
      </div>

      {/* 🌟 2. Modern App Grid 🌟 */}
      <div style={{marginBottom: '28px'}}>
         <div style={{fontSize: '13px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '12px', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '1px'}}>🚀 System Modules</div>
         
         <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px'}}>
            <div className="sys-btn active" onClick={() => setActiveTab('home')} style={{background: 'linear-gradient(145deg, rgba(59,130,246,0.1), rgba(0,0,0,0))', borderColor: '#3b82f6', borderRadius: '20px', padding: '16px 10px', boxShadow: '0 8px 20px rgba(59,130,246,0.15)'}}>
              <div style={{background: '#3b82f6', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', fontSize: '20px', color: 'white', boxShadow: '0 4px 12px rgba(59,130,246,0.4)'}}>2D</div>
              <div className="font-bold" style={{fontSize: '13px', color: '#3b82f6'}}>2D System</div>
            </div>
            
            <div className="sys-btn" onClick={() => showConfirm(t('alert'), '3D Update - Coming Soon', null, true)} style={{borderRadius: '20px', padding: '16px 10px', background: 'var(--bg-card)'}}>
              <div style={{background: 'rgba(139,92,246,0.1)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', fontSize: '20px', color: '#8b5cf6'}}>3D</div>
              <div className="font-bold" style={{fontSize: '13px', color: 'var(--text-muted)'}}>3D</div>
            </div>

            <div className="sys-btn" onClick={() => showConfirm(t('alert'), 'Dubi Update - Coming Soon', null, true)} style={{borderRadius: '20px', padding: '16px 10px', background: 'var(--bg-card)'}}>
              <div style={{background: 'rgba(6,182,212,0.1)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', fontSize: '20px', color: '#06b6d4'}}>DB</div>
              <div className="font-bold" style={{fontSize: '13px', color: 'var(--text-muted)'}}>Dubi</div>
            </div>
         </div>

         <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
            <div className="sys-btn" onClick={() => showConfirm(t('alert'), 'MM85 Update - Coming Soon', null, true)} style={{borderRadius: '20px', padding: '16px 10px', background: 'var(--bg-card)'}}>
              <div style={{background: 'rgba(249,115,22,0.1)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', fontSize: '20px', color: '#f97316'}}>85</div>
              <div className="font-bold" style={{fontSize: '13px', color: 'var(--text-muted)'}}>MM85</div>
            </div>

            <div className="sys-btn" onClick={() => showConfirm(t('alert'), 'Thai 3D Update - Coming Soon', null, true)} style={{borderRadius: '20px', padding: '16px 10px', background: 'var(--bg-card)'}}>
              <div style={{background: 'rgba(217,70,239,0.1)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', fontSize: '20px', color: '#d946ef'}}>T3D</div>
              <div className="font-bold" style={{fontSize: '13px', color: 'var(--text-muted)'}}>Thai 3D</div>
            </div>
         </div>
      </div>

      {/* 🌟 3. Premium Menu List 🌟 */}
      <div>
         <div style={{fontSize: '13px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '12px', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '1px'}}>🛠️ Tools & Settings</div>
         <div className="card" style={{padding: '8px', borderRadius: '20px', background: 'var(--bg-card)'}}>
             
             {/* 🌟 ADMIN ONLY TOOLS (Admin မှသာ မြင်ရမည့် အပိုင်း) 🌟 */}
             {userRole === 'admin' && (
                 <>
                   <div className="menu-item" onClick={() => setActiveTab('admin')} style={{border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, marginBottom: 0, background: 'rgba(239, 68, 68, 0.05)'}}>
                     <div className="flex-gap" style={{alignItems: 'center'}}><div style={{background: 'rgba(239,68,68,0.1)', padding: '6px 10px', borderRadius: '10px', color: '#ef4444', fontSize: '18px', display: 'flex'}}>👨‍💻</div> <span style={{fontWeight: '900', fontSize: '15px', color: '#ef4444'}}>{lang === 'en' ? 'Agent Management' : 'အေးဂျင့် စီမံခန့်ခွဲမှု'}</span></div> <span style={{color: '#ef4444'}}>❯</span>
                   </div>
                   <div className="menu-item" onClick={() => setActiveTab('payout')} style={{border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, marginBottom: 0, background: 'transparent'}}>
                     <div className="flex-gap" style={{alignItems: 'center'}}><div style={{background: 'rgba(245,158,11,0.1)', padding: '6px 10px', borderRadius: '10px', color: '#f59e0b', fontSize: '18px', display: 'flex'}}>🏆</div> <span style={{fontWeight: '900', fontSize: '15px'}}>{t('match_win')}</span></div> <span style={{color: 'var(--text-muted)'}}>❯</span>
                   </div>
                   <div className="menu-item" onClick={() => setActiveTab('ledger')} style={{border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, marginBottom: 0, background: 'transparent'}}>
                     <div className="flex-gap" style={{alignItems: 'center'}}><div style={{background: 'rgba(16,185,129,0.1)', padding: '6px 10px', borderRadius: '10px', color: '#10b981', fontSize: '18px', display: 'flex'}}>📓</div> <span style={{fontWeight: '900', fontSize: '15px'}}>{t('ledger_summary')}</span></div> <span style={{color: 'var(--text-muted)'}}>❯</span>
                   </div>
                   <div className="menu-item" onClick={() => setActiveTab('settings')} style={{border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, marginBottom: 0, background: 'transparent'}}>
                     <div className="flex-gap" style={{alignItems: 'center'}}><div style={{background: 'rgba(59,130,246,0.1)', padding: '6px 10px', borderRadius: '10px', color: '#3b82f6', fontSize: '18px', display: 'flex'}}>⚙️</div> <span style={{fontWeight: '900', fontSize: '15px'}}>{t('quick_settings')}</span></div> <span style={{color: 'var(--text-muted)'}}>❯</span>
                   </div>
                 </>
             )}

             {/* 🌟 EVERYONE CAN SEE (လူတိုင်း မြင်ရမည့် အပိုင်း) 🌟 */}
             <div className="menu-item" onClick={() => showConfirm('📱 ' + t('device_list'), lang === 'en' ? `Your current device:\n\n${getDeviceName()}\n\n(Connected via Cloud Sync)` : `သင်လက်ရှိအသုံးပြုနေသော Device မှာ:\n\n${getDeviceName()}\n\n(Cloud Sync ဖြင့် ချိတ်ဆက်ထားပါသည်)`, null, true)} style={{border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, marginBottom: 0, background: 'transparent'}}>
               <div className="flex-gap" style={{alignItems: 'center'}}><div style={{background: 'rgba(139,92,246,0.1)', padding: '6px 10px', borderRadius: '10px', color: '#8b5cf6', fontSize: '18px', display: 'flex'}}>📱</div> <span style={{fontWeight: '900', fontSize: '15px'}}>{t('device_list')}</span></div> <span style={{color: 'var(--text-muted)'}}>❯</span>
             </div>

             {/* 🌟 LOG OUT BUTTON 🌟 */}
             <div className="menu-item" onClick={() => showConfirm(lang === 'en' ? 'Confirmation' : 'အသိပေးချက်', lang === 'en' ? 'Are you sure you want to log out?' : 'အကောင့်မှ ထွက်မည်မှာ သေချာပါသလား?', () => auth.signOut())} style={{border: 'none', borderRadius: 0, marginBottom: 0, background: 'transparent'}}>
               <div className="flex-gap" style={{alignItems: 'center'}}><div style={{background: 'rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: '10px', color: '#ef4444', fontSize: '18px', display: 'flex'}}>🚪</div> <span style={{fontWeight: '900', fontSize: '15px', color: '#ef4444'}}>{lang === 'en' ? 'Log Out' : 'အကောင့်ထွက်မည်'}</span></div> <span style={{color: 'var(--text-muted)'}}>❯</span>
             </div>

         </div>
      </div>

      <div style={{textAlign: 'center', marginTop: '30px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px'}}>
         v10.0.0 (Premium UI/UX Edition)
      </div>
    </div>
  );
};