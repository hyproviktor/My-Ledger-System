// src/components/HistoryTab.tsx
import React from 'react';

export const HistoryTab = ({
  t, agents, historyLog, historyFilter, setHistoryFilter, 
  setHistoryLog, saveToStorage, data, totalNet, ledgers, history, appSettings,
  showConfirm, handleDeleteHistoryItem, setEditHistoryModal
}) => {
  return (
    <div>
      <div className="flex-row" style={{marginBottom: '16px'}}>
        <h3 style={{margin: 0}}>{t('history_title')}</h3>
        <button onClick={() => showConfirm(t('warning'), t('del_all_conf'), () => { setHistoryLog([]); saveToStorage(data, totalNet, ledgers, history, [], agents, appSettings); })} className="btn-dark" style={{padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold'}}>🧹 {t('clear_all')}</button>
      </div>

      <div style={{marginBottom: '16px'}}>
        <select value={historyFilter} onChange={e => setHistoryFilter(e.target.value)} style={{fontSize: '15px', fontWeight: 'bold'}}>
           <option value="all">{t('all_agents')}</option>
           {Object.values(agents).map(a => <option key={a.id} value={a.id}>{a.name} {a.type==='master'?'👑':''}</option>)}
        </select>
      </div>
      
      {historyLog.filter(h => historyFilter === 'all' || h.agentId === historyFilter).length === 0 ? (
        <div className="text-sm" style={{textAlign: 'center', marginTop: '50px'}}>{t('no_history')}</div>
      ) : (
        historyLog.filter(h => historyFilter === 'all' || h.agentId === historyFilter).map((h, i) => (
          <div key={h.id || i} className={"history-item " + h.type} style={{ padding: '14px 16px', marginBottom: '12px' }} onClick={() => setEditHistoryModal({ ...h, newPrice: h.price, newInput: h.input })}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🕒 {h.time}</span>
                <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-main)' }}>
                   {agents[h.agentId]?.name || 'Unknown'} {agents[h.agentId]?.type === 'master' ? '👑' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <span style={{ fontSize: '12px', color: '#3b82f6' }}>✏️ ပြင်မည်</span>
                 {h.parsed && h.parsed.length > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteHistoryItem(h); }} className="icon-btn-small" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', width: '26px', height: '26px', fontSize: '12px' }}>🗑️</button>
                 )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1, paddingRight: '16px', gap: '10px' }}>
                 <span style={{ fontSize: '10px', background: h.type === 'in' ? '#10b981' : '#ef4444', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', marginTop: '3px' }}>
                   {h.type === 'in' ? 'IN' : 'OUT'}
                 </span>
                 <span style={{ fontSize: '15px', fontWeight: '600', color: h.type === 'in' ? '#10b981' : '#ef4444', wordBreak: 'break-word', lineHeight: '1.5' }}>
                   {h.input}
                 </span>
              </div>
              <div style={{ textAlign: 'right', minWidth: '90px' }}>
                 <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>{h.count} × <span style={{ color: '#f59e0b' }}>{h.price}</span></div>
                 <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                   {(h.count * h.price).toLocaleString()}
                 </div>
              </div>
            </div>

          </div>
        ))
      )}
    </div>
  );
};