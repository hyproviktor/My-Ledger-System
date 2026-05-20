// src/components/HelpModal.tsx
import React from 'react';

export const HelpModal = ({ showHelp, setShowHelp, t }) => {
  if (!showHelp) return null; // မဖွင့်ထားရင် ဘာမှမပြပါနဲ့လို့ ပြောတာပါ

  return (
    <div className="modal-overlay" style={{zIndex: 2000}}>
      <div className="modal-box" style={{padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh', width: '95%', maxWidth: '500px'}}>
        
        {/* 🌟 Header Section 🌟 */}
        <div style={{padding: '16px 20px', background: 'var(--header-bg)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3 style={{margin: 0, color: '#ffffff', fontSize:'18px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{background: 'rgba(59, 130, 246, 0.2)', padding: '6px', borderRadius: '8px', fontSize: '16px'}}>💡</span> {t('help_title')}
          </h3>
          <button onClick={() => setShowHelp(false)} style={{background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s'}}>✖</button>
        </div>

        {/* 🌟 Scrollable Content Section 🌟 */}
        <div style={{padding: '20px', overflowY: 'auto', flex: 1, background: 'var(--bg-main)'}}>
          
          <div style={{background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '14px', borderRadius: '12px', marginBottom: '24px'}}>
             <div style={{fontSize: '12px', color: '#3b82f6', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase'}}>📌 Normal Input</div>
             <div style={{fontSize: '14px', color: 'var(--text-main)', letterSpacing: '0.5px'}}>
               <span style={{background: 'var(--input-bg)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontWeight: 'bold'}}>12 34 56 100</span> = 12, 34, 56 ကို 100 ဖိုးစီ။
             </div>
          </div>

          <div style={{fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px'}}>
            🚀 Shortcuts (အတိုကောက်များ)
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px'}}>
            {[
              {k: 'po', v: 'ပါဝါ'}, {k: 'nk', v: 'နက္ခတ်'}, {k: 'eq', v: 'အပူး'},
              {k: 'peq', v: 'စုံပူး'}, {k: 'neq', v: 'မပူး'}, {k: 'bro', v: 'ညီအစ်ကို'},
              {k: 'pp', v: 'စုံစုံ'}, {k: 'pn', v: 'စုံမ'}, {k: 'np', v: 'မစုံ'}, {k: 'nn', v: 'မမ'},
              {k: 'p.', v: 'စုံထိပ်'}, {k: 'n.', v: 'မထိပ်'}, {k: '.p', v: 'စုံပိတ်'}, {k: '.n', v: 'မပိတ်'},
              {k: 'r', v: 'အပြန်'}, {k: 'kw', v: 'ခွေ'}, {k: '1b', v: '၁ ဘရိတ်'}, {k: '1p', v: '၁ ပတ်လည်'}
            ].map(item => (
              <div key={item.k} style={{background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'}}>
                 <span style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '900', minWidth: '38px', textAlign: 'center'}}>{item.k}</span>
                 <span style={{fontSize: '13px', color: 'var(--text-main)', fontWeight: 'bold'}}>{item.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 🌟 Footer Button 🌟 */}
        <div style={{padding: '16px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)'}}>
          <button onClick={() => setShowHelp(false)} className="btn btn-primary" style={{width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px'}}>{t('got_it')}</button>
        </div>

      </div>
    </div>
  );
};