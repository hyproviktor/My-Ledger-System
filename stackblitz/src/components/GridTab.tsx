// src/components/GridTab.tsx
import React from 'react';
import { GridBox } from './GridBox';
import { formatEx } from '../utils/helpers';

export const GridTab = ({
  t, appSettings, setAppSettings, data, agents, hotNumbers,
  handleOpenBulkOut, getAllRisks, handleQuickOutClick, setQuickOutModal, onSaveSettings
}) => {
  return (
    <div>
      {/* 🌟 Premium Dashboard Control Panel 🌟 */}
      <div className="card" style={{
          marginBottom: '20px', 
          background: 'linear-gradient(145deg, var(--bg-card), rgba(15, 23, 42, 0.6))', 
          border: '1px solid rgba(59, 130, 246, 0.15)', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(239, 68, 68, 0.1)', filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none' }}></div>

        <div className="flex-row" style={{marginBottom: '18px', position: 'relative', zIndex: 1}}>
           <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
               <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '10px', color: '#3b82f6'}}>🔢</div>
               <div style={{fontWeight: '900', color: 'var(--text-main)', fontSize: '18px', letterSpacing: '0.5px'}}>{t('num_grid')}</div>
           </div>
           
           <button onClick={handleOpenBulkOut} className="btn-dark" style={{padding: '8px 16px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', fontWeight: 'bold', boxShadow: getAllRisks().length > 0 ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none', transition: '0.3s'}}>
              📤 {t('bulk_out_title')}
           </button>
        </div>
        
        <div style={{marginBottom: '20px', position: 'relative', zIndex: 1}}>
          <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>💡</div>
          <input 
            placeholder={t('hot_ph')}
            value={appSettings.hotNumbers} 
            onChange={(e) => setAppSettings({...appSettings, hotNumbers: e.target.value})} 
            onBlur={() => onSaveSettings()}
            style={{
                width: '100%', padding: '14px 40px 14px 42px', 
                border: '1px solid rgba(245, 158, 11, 0.3)', 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '12px',
                color: '#f59e0b', fontWeight: 'bold', fontSize: '15px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 0 8px rgba(245, 158, 11, 0.05)',
                outline: 'none', transition: '0.3s'
            }}
          />
          {appSettings.hotNumbers && (
              <button onClick={() => { 
                  const newSet = {...appSettings, hotNumbers: ''};
                  setAppSettings(newSet); 
                  onSaveSettings(newSet); 
              }} style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✖</button>
          )}
        </div>

        <div style={{position: 'relative', zIndex: 1}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px'}}>
              <span style={{fontSize: '14px'}}>🚨</span>
              <span style={{fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px'}}>Top Risk Monitor</span>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {getAllRisks().length > 0 ? getAllRisks().slice(0, 15).map((r, index) => {
              let isHot = hotNumbers.includes(r.num);
              let isTop1 = index === 0; 
              
              return (
                <div key={r.num} onClick={() => {
                    const defaultMaster = Object.values(agents).find(a => a.type === 'master')?.id || '';
                    setQuickOutModal({ num: r.num, ex: r.ex, price: r.ex, masterId: defaultMaster });
                }} style={{
                    display: 'flex', alignItems: 'center', 
                    background: isTop1 ? 'rgba(239, 68, 68, 0.15)' : 'var(--input-bg)', 
                    padding: '6px 12px', borderRadius: '10px', 
                    border: isTop1 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border)', 
                    boxShadow: isTop1 ? '0 0 12px rgba(239, 68, 68, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                    cursor: 'pointer', transition: '0.2s', position: 'relative', overflow: 'hidden'
                }}>
                  {isHot && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b'}}></div>}
                  
                  <span style={{fontWeight: '900', color: isTop1 ? '#ef4444' : 'var(--text-main)', marginRight: '8px', fontSize: '15px'}}>{r.num}</span>
                  <span style={{
                      background: isTop1 ? '#ef4444' : 'rgba(239, 68, 68, 0.1)', 
                      color: isTop1 ? '#fff' : '#ef4444', 
                      padding: '2px 6px', borderRadius: '6px', 
                      fontSize: '11px', fontWeight: 'bold'
                  }}>
                      +{formatEx(r.ex)}
                  </span>
                </div>
              );
            }) : (
              <div style={{background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', width: '100%', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold'}}>
                🎉 လစ်မစ်ကျော်ထားသော ဂဏန်းမရှိသေးပါ
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="gridWrap">
        {[0, 25, 50, 75].map(startIdx => (
            <div key={startIdx} className="grid-block-wrapper">
               <div className="grid-block-title">
                  {startIdx.toString().padStart(2, '0')} - {(startIdx + 24).toString().padStart(2, '0')}
               </div>
               <div className="grid-block">
                  {Array.from({length: 25}, (_, i) => {
                     let n = (startIdx + i).toString().padStart(2, "0"); 
                     let val = data[n];
                     let isHot = hotNumbers.includes(n);
                     return <GridBox key={n} n={n} val={val} globalLimit={appSettings.globalLimit} isHot={isHot} onQuickOut={handleQuickOutClick} />;
                  })}
               </div>
            </div>
        ))}
      </div>
    </div>
  );
};