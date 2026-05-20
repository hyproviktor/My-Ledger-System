// src/components/AdminTab.tsx
import React, { useState } from 'react';

export const AdminTab = ({ 
  t, agents, setAgents, setActiveTab, showConfirm, 
  saveToStorage, data, totalNet, ledgers, history, historyLog, appSettings 
}) => {

  const updateAgentExpiry = (id, dateStr) => {
    const newAgents = { ...agents, [id]: { ...agents[id], expireDate: dateStr } };
    setAgents(newAgents);
    saveToStorage(data, totalNet, ledgers, history, historyLog, newAgents, appSettings);
    showConfirm(t('success'), "သက်တမ်း ပြင်ဆင်သတ်မှတ်ပြီးပါပြီ။", null, true);
  };

  const toggleAgentStatus = (id) => {
    const isBanned = agents[id].isBanned || false;
    const newAgents = { ...agents, [id]: { ...agents[id], isBanned: !isBanned } };
    setAgents(newAgents);
    saveToStorage(data, totalNet, ledgers, history, historyLog, newAgents, appSettings);
  };

  const updateAgentEmail = (id, emailStr) => {
    const newAgents = { ...agents, [id]: { ...agents[id], email: emailStr.trim() } };
    setAgents(newAgents);
    saveToStorage(data, totalNet, ledgers, history, historyLog, newAgents, appSettings);
  };

  return (
    <div className="page-transition" style={{paddingBottom: '80px'}}>
      
      {/* 🌟 Header 🌟 */}
      <div className="flex-row" style={{marginBottom: '20px'}}>
         <h3 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444'}}>
            <span style={{fontSize: '24px'}}>👨‍💻</span> အေးဂျင့် စီမံခန့်ခွဲမှု
         </h3>
         <button onClick={() => setActiveTab('dashboard')} className="btn-dark" style={{padding: '8px 16px', fontSize: '13px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)', fontWeight: 'bold'}}>⬅ {t('back')}</button>
      </div>

      <div className="card" style={{padding: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '20px'}}>
         <p style={{fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6'}}>
            ဤနေရာသည် Admin သီးသန့်ဖြစ်ပါသည်။ သင့်လက်အောက်ရှိ အေးဂျင့်များ၏ သက်တမ်းကုန်ဆုံးရက် (Expire Date) နှင့် အကောင့်အခြေအနေကို ထိန်းချုပ်နိုင်ပါသည်။
         </p>
      </div>

      {/* 🌟 Agent List 🌟 */}
      {Object.values(agents).filter(a => a.id !== 'default_self' && a.id !== 'default_master').map(ag => {
         const isBanned = ag.isBanned || false;
         return (
            <div key={ag.id} className="card" style={{padding: '16px', border: isBanned ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border)', opacity: isBanned ? 0.7 : 1}}>
               
               <div className="flex-row" style={{marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '12px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                     <div style={{fontSize: '20px'}}>{ag.type === 'master' ? '👑' : '👤'}</div>
                     <div>
                        <div style={{fontWeight: '900', fontSize: '16px', color: isBanned ? '#ef4444' : 'var(--text-main)'}}>{ag.name}</div>
                        <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>Comm: {ag.comm}% | Limit: {ag.limit || 'No Limit'}</div>
                     </div>
                  </div>
                  
                  <label className="switch">
                     <input type="checkbox" checked={!isBanned} onChange={() => toggleAgentStatus(ag.id)} />
                     <span className="slider" style={{background: isBanned ? '#ef4444' : 'var(--border)'}}></span>
                  </label>
               </div>

               <div>
{/* 🌟 Agent Email (For Login) 🌟 */}
               <div style={{marginBottom: '16px'}}>
                  <label style={{fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px', display: 'block'}}>📧 အကောင့်ဝင်ရန် Email (Login Email)</label>
                  <input 
                     type="email" 
                     placeholder="ဥပမာ - agent1@gmail.com"
                     value={ag.email || ''} 
                     onChange={(e) => updateAgentEmail(ag.id, e.target.value)}
                     style={{width: '100%', padding: '10px', fontSize: '14px', background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '8px'}}
                  />
                  <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>
                     မှတ်ချက်။ ဤ Email ဖြင့် အကောင့်ဖွင့်မှသာ ဤစာရင်းရှင်၏ Data များကို မြင်ရမည်ဖြစ်သည်။
                  </div>
               </div>

                  <label style={{fontSize: '12px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px', display: 'block'}}>⏳ သက်တမ်းကုန်ဆုံးမည့်ရက် (Expire Date)</label>
                  <div style={{display: 'flex', gap: '8px'}}>
                     <input 
                        type="date" 
                        value={ag.expireDate || ''} 
                        onChange={(e) => updateAgentExpiry(ag.id, e.target.value)}
                        style={{flex: 1, padding: '10px', fontSize: '14px', background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '8px'}}
                     />
                     <button onClick={() => updateAgentExpiry(ag.id, '')} style={{background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px', padding: '0 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'}}>
                        Clear
                     </button>
                  </div>
               </div>

            </div>
         )
      })}

      {Object.values(agents).filter(a => a.id !== 'default_self' && a.id !== 'default_master').length === 0 && (
         <div style={{textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px', fontSize: '14px'}}>
            အေးဂျင့် မရှိသေးပါ။ (Ledger တွင် အရင်သွားထည့်ပါ)
         </div>
      )}

    </div>
  );
};