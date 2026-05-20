// src/components/SettingsTab.tsx
import React from 'react';

export const SettingsTab = ({
  t, appSettings, setAppSettings, setActiveTab, 
  handleResetSession, handleClearAll, toggleSetting, onSaveSettings
}) => {
  return (
    <div className="page-transition" style={{paddingBottom: '80px'}}>
      <div className="flex-row" style={{marginBottom: '20px'}}>
         <h3 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><span style={{fontSize: '24px'}}>⚙️</span> {t('quick_settings')}</h3>
         <button onClick={() => setActiveTab('dashboard')} className="btn-dark" style={{padding: '8px 16px', fontSize: '13px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)', fontWeight: 'bold'}}>⬅ {t('back')}</button>
      </div>
      
      {/* 🔄 Data Reset */}
      <div className="card" style={{border: '1px solid rgba(59, 130, 246, 0.3)', background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.05), var(--bg-card))', borderRadius: '20px', padding: '20px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
            <div style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '8px', borderRadius: '10px', fontSize: '18px'}}>🔄</div>
            <div style={{fontWeight: 'bold', color: '#3b82f6', fontSize: '16px'}}>{t('data_reset')}</div>
        </div>
        <p className="text-sm" style={{marginTop: 0, marginBottom: '20px', lineHeight: '1.6', color: 'var(--text-muted)'}}>{t('reset_desc')}</p>
        <button className="btn btn-primary" onClick={handleResetSession} style={{borderRadius: '12px', fontSize: '15px'}}>{t('reset_btn')}</button>
      </div>

      {/* 🎯 2D Settings */}
      <div className="card" style={{borderRadius: '20px', padding: '20px', border: '1px solid var(--border)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <div style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px', borderRadius: '10px', fontSize: '18px'}}>🎯</div>
            <div style={{fontWeight: 'bold', color: 'var(--text-main)', fontSize: '16px'}}>{t('set_2d')}</div>
        </div>
        
        <div style={{display: 'flex', gap: '16px', flexDirection: 'column'}}>
            <div style={{background: 'var(--input-bg)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--border)'}}>
                <label className="text-sm font-bold" style={{display: 'block', marginBottom: '8px', color: 'var(--text-muted)'}}>{t('payout_rate')} (ဆ)</label>
                <input type="number" value={appSettings.payout2D} onChange={(e) => setAppSettings({...appSettings, payout2D: parseInt(e.target.value)||80})} onBlur={() => onSaveSettings()} style={{background: 'transparent', border: 'none', padding: 0, fontSize: '20px', fontWeight: 'bold', color: '#10b981', outline: 'none', width: '100%'}}/>
            </div>
            
            <div style={{background: 'var(--input-bg)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--border)'}}>
                <label className="text-sm font-bold" style={{display: 'block', marginBottom: '8px', color: 'var(--text-muted)'}}>{t('global_limit')} (Limit)</label>
                <input type="number" value={appSettings.globalLimit} onChange={(e) => setAppSettings({...appSettings, globalLimit: parseInt(e.target.value)||10000})} onBlur={() => onSaveSettings()} style={{background: 'transparent', border: 'none', padding: 0, fontSize: '20px', fontWeight: 'bold', color: '#f59e0b', outline: 'none', width: '100%'}}/>
            </div>
        </div>
      </div>

      {/* 🛠️ General Settings */}
      <div className="card" style={{borderRadius: '20px', padding: '20px', border: '1px solid var(--border)'}}>
         <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <div style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '8px', borderRadius: '10px', fontSize: '18px'}}>🛠️</div>
            <div style={{fontWeight: 'bold', color: 'var(--text-main)', fontSize: '16px'}}>{t('gen_set')}</div>
         </div>

         <div className="flex-row" style={{background: 'var(--input-bg)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)'}}>
           <div>
             <div className="font-bold" style={{fontSize: '14px'}}>{t('split_r')}</div>
             <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>12r 1000 ဟုသွင်းပါက 12(500), 21(500) ဟု တစ်ဝက်စီခွဲယူမည်။</div>
           </div>
           <label className="switch">
             <input type="checkbox" checked={appSettings.splitR} onChange={() => toggleSetting('splitR')} />
             <span className="slider"></span>
           </label>
         </div>
      </div>

      {/* ⚡ Shortcuts & Prices */}
      <div className="card" style={{borderRadius: '20px', padding: '20px', border: '1px solid var(--border)'}}>
         <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <div style={{background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '8px', borderRadius: '10px', fontSize: '18px'}}>⚡</div>
            <div style={{fontWeight: 'bold', color: 'var(--text-main)', fontSize: '16px'}}>အမြန်ရွေးချယ်မှုများ</div>
         </div>

         <div style={{marginBottom: '20px'}}>
            <label className="text-sm font-bold" style={{color: 'var(--text-muted)', display: 'block', marginBottom: '8px'}}>{t('quick_prices_label')}</label>
            <input 
              type="text" 
              value={appSettings.quickPrices || ''}
              onChange={(e) => setAppSettings({...appSettings, quickPrices: e.target.value})}
              onBlur={() => onSaveSettings()}
              style={{fontFamily: 'monospace', fontWeight: 'bold', borderRadius: '12px', background: 'var(--input-bg)'}}
            />
            <div className="text-sm text-muted mt-2">{t('quick_prices_desc')}</div>
         </div>

         <div style={{borderTop: '1px dashed var(--border)', paddingTop: '20px'}}>
            <label className="text-sm font-bold" style={{color: 'var(--text-muted)', display: 'block', marginBottom: '8px'}}>{t('custom_shortcuts')}</label>
            <textarea 
              value={appSettings.customRules || ''} 
              onChange={(e) => setAppSettings({...appSettings, customRules: e.target.value})}
              onBlur={() => onSaveSettings()}
              rows={8}
              style={{fontSize: '14px', lineHeight: '1.6', fontFamily: 'monospace', borderRadius: '12px', background: 'var(--input-bg)'}}
            />
            <div className="text-sm text-muted mt-2">{t('shortcuts_desc')}</div>
         </div>
      </div>

      {/* 🚨 Danger Zone */}
      <div className="card" style={{border: '1px solid rgba(239, 68, 68, 0.3)', background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.05), var(--bg-card))', borderRadius: '20px', padding: '20px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
            <div style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px', borderRadius: '10px', fontSize: '18px'}}>🚨</div>
            <div style={{fontWeight: 'bold', color: '#ef4444', fontSize: '16px'}}>{t('danger_zone')}</div>
        </div>
        <p className="text-sm" style={{marginTop: 0, marginBottom: '20px', lineHeight: '1.6', color: 'var(--text-muted)'}}>{t('danger_desc')}</p>
        <button className="btn btn-red" onClick={handleClearAll} style={{borderRadius: '12px', fontSize: '15px'}}>{t('del_all')}</button>
      </div>
    </div>
  );
};