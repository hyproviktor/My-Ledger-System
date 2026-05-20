// src/components/LimitsTab.tsx
import React from 'react';
import { formatEx } from '../utils/helpers';

export const LimitsTab = ({
  t, appSettings, data, agents, hotNumbers, limitFilter, setLimitFilter, setBulkOutModal, setQuickOutModal, getFilteredLimits
}) => {
  return (
    <div className="fade-in" style={{paddingBottom: '80px', overflowY: 'auto', height: '100%'}}>
       <div style={{background: 'var(--header-bg)', padding: '16px', borderRadius: '0 0 24px 24px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <div>
               <h2 style={{margin: 0, color: '#ffffff', fontSize: '18px'}}>စောင့်ကြည့် / လစ်မစ်</h2>
               <div style={{color: '#cbd5e1', fontSize: '12px', marginTop: '4px'}}>ဂဏန်းများ၏ အခြေအနေကို စောင့်ကြည့်ရန်</div>
             </div>
             <button onClick={() => setBulkOutModal({ items: getFilteredLimits().filter(item => item.val > appSettings.globalLimit).map(i => ({ num: i.num, val: i.val, ex: i.val - appSettings.globalLimit, outAmount: i.val - appSettings.globalLimit, selected: true })), masterId: '' })} style={{background: '#ef4444', border: 'none', padding: '8px 14px', borderRadius: '10px', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px'}}>
                📤 လစ်မစ်ကျော် ဒိုင်တင်မည်
             </button>
          </div>
       </div>

       <div style={{padding: '0 12px'}}>
          <div style={{display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px'}}>
            <button className={"filter-chip " + (limitFilter === 'seq' ? 'active' : '')} onClick={() => setLimitFilter('seq')}>00-99</button>
            <button className={"filter-chip " + (limitFilter === 'desc' ? 'active' : '')} onClick={() => setLimitFilter('desc')}>{t('hi_lo')}</button>
            <button className={"filter-chip " + (limitFilter === 'asc' ? 'active' : '')} onClick={() => setLimitFilter('asc')}>{t('lo_hi')}</button>
            <button className={"filter-chip " + (limitFilter === 'over' ? 'active' : '')} onClick={() => setLimitFilter('over')} style={{color: limitFilter==='over' ? 'white' : '#ef4444'}}>{t('over_lim_tab')}</button>
            <button className={"filter-chip " + (limitFilter === 'warn' ? 'active' : '')} onClick={() => setLimitFilter('warn')} style={{color: limitFilter==='warn' ? 'white' : '#f59e0b'}}>{t('above_80')}</button>
          </div>

          <div style={{ paddingBottom: '20px' }}>
            {getFilteredLimits().map(item => {
                 let maxDisplay = Math.max(appSettings.globalLimit * 1.2, item.val);
                 let safePercent = Math.min(100, (Math.min(item.val, appSettings.globalLimit) / maxDisplay) * 100);
                 let overPercent = Math.max(0, ((item.val - appSettings.globalLimit) / maxDisplay) * 100);
                 let isOver = item.val > appSettings.globalLimit;
                 let limitLinePos = (appSettings.globalLimit / maxDisplay) * 100;
                 let isHot = hotNumbers.includes(item.num);
                 
                 return (
                   <div key={item.num} onClick={() => {
                      const defaultMaster = Object.values(agents).find(a => a.type === 'master')?.id || '';
                      let excess = isOver ? (item.val - appSettings.globalLimit) : 0;
                      setQuickOutModal({ num: item.num, ex: excess, price: excess > 0 ? excess : '', masterId: defaultMaster });
                   }} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: isOver ? 'rgba(239, 68, 68, 0.015)' : 'var(--input-bg)',
                      border: isOver ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border)',
                      padding: '8px 12px', borderRadius: '10px', marginBottom: '6px', cursor: 'pointer', transition: '0.2s'
                   }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', width: '55px'}}>
                         <span style={{fontWeight: '900', fontSize: '18px', color: isHot ? '#f59e0b' : 'var(--text-main)'}}>{item.num}</span>
                         {isHot && <span style={{fontSize:'10px'}}>🔥</span>}
                      </div>
                      
                      <div style={{flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                         <div style={{height: '4px', background: 'var(--box-bg)', borderRadius: '2px', overflow: 'hidden', position: 'relative', display: 'flex'}}>
                            <div style={{width: safePercent + "%", background: '#3b82f6', height: '100%'}}></div>
                            <div style={{width: overPercent + "%", background: '#ef4444', height: '100%'}}></div>
                            <div style={{position: 'absolute', left: limitLinePos + "%", top: 0, bottom: 0, width: '2px', background: 'var(--text-main)', opacity: 0.3}}></div>
                         </div>
                         <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold'}}>
                             <span>{Math.round((item.val / appSettings.globalLimit) * 100)}%</span>
                             <span>{appSettings.globalLimit >= 1000 ? (appSettings.globalLimit/1000).toFixed(0) + 'K' : appSettings.globalLimit} Lim</span>
                         </div>
                      </div>
                      
                      <div style={{textAlign: 'right', minWidth: '70px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center'}}>
                           <div style={{fontSize: '15px', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: '1'}}>
                               {item.val >= 1000 ? ((item.val/1000).toFixed(1).replace('.0','') + 'K') : item.val} 
                           </div>
                          {isOver && (
                               <div style={{fontSize: '12px', color: '#ff4d4f', fontWeight: '900', marginTop: '4px', letterSpacing: '0.5px'}}>
                                 +{formatEx(item.val - appSettings.globalLimit)}
                               </div>
                           )}
                      </div>
                   </div>
                 );
              })
            }
          </div>
       </div>
    </div>
  );
};