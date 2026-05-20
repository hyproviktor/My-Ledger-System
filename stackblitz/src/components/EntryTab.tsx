// src/components/EntryTab.tsx
import React from 'react';

export const EntryTab = ({
  t, appSettings, setAppSettings, agents, selectedAgentId, setSelectedAgentId,
  entryMode, setEntryMode, txType, handleTxTypeChange,
  numbersText, setNumbersText, priceText, setPriceText, priceInputRef,
  inputText, setInputText, handlePasteFromClipboard,
  preview, handleUnifiedAdd
}) => {
  return (
    <div className="fade-in" style={{ paddingBottom: '80px', position: 'relative' }}> 

      {/* 1. Super Compact Top Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '0 4px', flexWrap: 'wrap' }}>
         <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>{t('entry_2d')}</h3>
         
         <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '4px 8px' }}>
            <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', marginRight: '4px' }}>L:</span>
            <input 
               type="number" 
               value={appSettings.globalLimit || ''} 
               onChange={(e) => setAppSettings({...appSettings, globalLimit: parseInt(e.target.value) || 0})}
               placeholder="0"
               style={{ width: '50px', background: 'transparent', border: 'none', color: '#f59e0b', fontSize: '13px', fontWeight: 'bold', outline: 'none', padding: 0 }}
            />
            <span style={{ fontSize: '10px' }}>✏️</span>
         </div>

         <div style={{ flex: 1, minWidth: '120px', position: 'relative' }}>
             {/* 🌟 PREMIUM AGENT FILTER LOGIC 🌟 */}
             <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)} style={{ width: '100%', padding: '10px 12px 10px 12px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)', fontWeight: 'bold', fontSize: '14px', outline: 'none', appearance: 'none' }}>
               {Object.values(agents).filter(a => {
                   // ၁။ IN / OUT ပေါ်မူတည်ပြီး ဒိုင်/ထိုးသား ခွဲခြားမည်
                   const isTypeMatch = txType === 'in' ? a.type !== 'master' : a.type === 'master';
                   
                   // Admin ကိုယ်တိုင်အတွက်ဆိုလျှင် အမြဲပြမည်
                   if (a.id === 'default_self' || a.id === 'default_master') return isTypeMatch;
                   
                   // ၂။ အကောင့် အပိတ်ခံထားရခြင်း (Ban) ရှိ/မရှိ စစ်ဆေးမည်
                   const isNotBanned = !a.isBanned;

                   // ၃။ သက်တမ်းကုန်ဆုံးရက် (Expire Date) ကျော်/မကျော် စစ်ဆေးမည်
                   let isNotExpired = true;
                   if (a.expireDate) {
                       const today = new Date();
                       today.setHours(0, 0, 0, 0); // ယနေ့အစ
                       isNotExpired = new Date(a.expireDate) >= today;
                   }

                   // အခြေအနေအားလုံး ကိုက်ညီမှသာ နာမည်ကို ပြမည်
                   return isTypeMatch && isNotBanned && isNotExpired;
               }).map(ag => (
                 <option key={ag.id} value={ag.id}>👤 {ag.name} {ag.comm > 0 ? "(" + ag.comm + "%)" : ""}</option>
               ))}
             </select>
             <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: 'var(--text-muted)', pointerEvents: 'none' }}>▼</span>
         </div>
      </div>

      {/* 2. Tabs & IN/OUT Toggle Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', padding: '0 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
         
         <div style={{ display: 'flex', gap: '24px' }}>
             <div onClick={() => setEntryMode('manual')} style={{ paddingBottom: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: entryMode === 'manual' ? '#3b82f6' : 'var(--text-muted)', borderBottom: entryMode === 'manual' ? '3px solid #3b82f6' : '3px solid transparent', transition: '0.2s' }}>
                ✏️ {t('manual_entry')}
             </div>
             <div onClick={() => setEntryMode('bulk')} style={{ paddingBottom: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: entryMode === 'bulk' ? '#3b82f6' : 'var(--text-muted)', borderBottom: entryMode === 'bulk' ? '3px solid #3b82f6' : '3px solid transparent', transition: '0.2s' }}>
                📋 {t('bulk_entry')}
             </div>
         </div>

         <div style={{ display: 'flex', background: 'var(--input-bg)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border)', marginBottom: '6px' }}>
            <button onClick={() => handleTxTypeChange('in')} style={{ padding: '6px 12px', fontSize: '13px', fontWeight: '900', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: '0.2s', background: txType === 'in' ? '#10b981' : 'transparent', color: txType === 'in' ? '#fff' : 'var(--text-muted)', boxShadow: txType === 'in' ? '0 2px 4px rgba(16,185,129,0.3)' : 'none' }}>{t('in_receive')}</button>
            <button onClick={() => handleTxTypeChange('out')} style={{ padding: '6px 12px', fontSize: '13px', fontWeight: '900', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: '0.2s', background: txType === 'out' ? '#ef4444' : 'transparent', color: txType === 'out' ? '#fff' : 'var(--text-muted)', boxShadow: txType === 'out' ? '0 2px 4px rgba(239,68,68,0.3)' : 'none' }}>{t('out_send')}</button>
         </div>
      </div>

      {/* 3. Input Areas */}
      <div style={{ marginBottom: '12px' }}>
        {entryMode === 'manual' ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1.5, background: 'var(--input-bg)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <span style={{ color: '#3b82f6', fontSize: '16px', fontWeight: 'bold' }}>#</span>
              <input 
                id="numbers-input" type="text" placeholder={t('num_ph')} value={numbersText} onChange={(e) => setNumbersText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (priceInputRef.current) priceInputRef.current.focus(); } }}
                style={{ width: '100%', padding: '12px 10px', fontSize: '16px', fontWeight: 'normal', background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', letterSpacing: '1px' }}
              />
            </div>
            <div style={{ flex: 1, background: 'var(--input-bg)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <span style={{ color: '#f59e0b', fontSize: '16px', fontWeight: 'bold' }}>💰</span>
              <input 
                type="number" placeholder={t('price_ph')} value={priceText} onChange={(e) => setPriceText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUnifiedAdd(); } }} ref={priceInputRef}
                style={{ width: '100%', padding: '12px 10px', fontSize: '16px', fontWeight: 'bold', background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <button onClick={handlePasteFromClipboard} style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px', background: '#3b82f6', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 6px rgba(59,130,246,0.3)' }}>📋 Paste</button>
            <textarea 
              placeholder={t('paste_ph')} value={inputText} onChange={(e) => setInputText(e.target.value)} rows={4}
              style={{ width: '100%', padding: '40px 12px 12px 12px', fontSize: '15px', fontWeight: 'normal', lineHeight: '1.6', borderRadius: '10px', background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', outline: 'none', resize: 'vertical', minHeight: '100px' }}
            />
          </div>
        )}
      </div>

      {/* Quick Price Chips */}
      {entryMode === 'manual' && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '12px', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {(appSettings.quickPrices || '100, 200, 500, 1000, 3000').split(',').map(s => s.trim()).filter(Boolean).map((p, idx) => (
             <button
               key={idx} onClick={() => setPriceText(p)}
               style={{
                 padding: '6px 14px', fontSize: '13px', fontWeight: 'bold', borderRadius: '20px',
                 border: "1px solid " + (priceText === p ? '#3b82f6' : 'var(--border)'),
                 background: priceText === p ? '#3b82f6' : 'var(--input-bg)',
                 color: priceText === p ? 'white' : 'var(--text-main)',
                 cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease'
               }}
             >
               {p >= 1000 ? (p/1000)+'K' : p}
             </button>
          ))}
        </div>
      )}

      {/* 4. Normal Preview Box */}
      <div style={{ background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--border)', padding: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>👀 Preview List</div>
          
          <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.8', wordBreak: 'break-word', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              {preview.nums.length ? preview.nums.join(", ") : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 'normal' }}>ဂဏန်းများမရှိသေးပါ...</span>}
          </div>
      </div>

      {/* 5. STICKY ACTION BAR */}
      <div style={{ position: 'sticky', bottom: '10px', zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: txType === 'in' ? '2px solid #10b981' : '2px solid #ef4444', borderRadius: '16px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('count')}</span>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)' }}>{preview.count}</span>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('total')}</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: txType === 'in' ? '#10b981' : '#ef4444', lineHeight: '1' }}>{preview.total.toLocaleString()}</span>
              </div>
          </div>
          
          <button 
             onClick={handleUnifiedAdd} 
             disabled={preview.count === 0}
             style={{
                 background: preview.count === 0 ? 'var(--input-bg)' : (txType === 'in' ? '#10b981' : '#ef4444'),
                 color: preview.count === 0 ? 'var(--text-muted)' : '#ffffff',
                 padding: '10px 16px', fontSize: '14px', fontWeight: '900', borderRadius: '10px',
                 border: preview.count === 0 ? '1px solid var(--border)' : 'none', 
                 cursor: preview.count === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', 
                 boxShadow: preview.count > 0 ? (txType === 'in' ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(239,68,68,0.3)') : 'none',
                 display: 'flex', alignItems: 'center', gap: '6px'
             }}
          >
             {txType === 'in' ? '📥' : '📤'} {t('add_record')}
          </button>
      </div>
    </div>
  );
};