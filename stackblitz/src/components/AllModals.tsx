// src/components/AllModals.tsx
import React from 'react';
import { formatEx } from '../utils/helpers';

export const AllModals = ({
  t, agents, appSettings, ledgers, historyLog, winNumber,
  showAgentForm, setShowAgentForm, editingAgentId, setEditingAgentId,
  newAgentType, setNewAgentType, newAgentName, setNewAgentName,
  newAgentComm, setNewAgentComm, newAgentLimit, setNewAgentLimit,
  handleAddOrEditAgent, handleDeleteAgent,
  quickOutModal, setQuickOutModal, submitQuickOut,
  bulkOutModal, setBulkOutModal, handleResetExcess, submitBulkOut,
  editHistoryModal, setEditHistoryModal, handleEditHistoryPrice,
  confirmModal, setConfirmModal, executeConfirm,
  agentDetailModal, setAgentDetailModal, agentDetailTab, setAgentDetailTab,
  handleDeleteHistoryItem, moveAgent, handleEditClick
}) => {
  return (
    <>
      {/* --- AGENT FORM MODAL --- */}
      {showAgentForm && (
        <div className="modal-overlay" style={{zIndex: 5000}}>
          <div className="modal-box" style={{padding: '24px'}}>
            <div className="flex-row" style={{borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px'}}>
              <h3 style={{margin: 0, color: 'var(--text-main)', fontSize: '20px'}}>{editingAgentId ? t('edit_agent') : t('add_agent')}</h3>
              <button onClick={() => {setShowAgentForm(false); setEditingAgentId(null);}} style={{background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', color: 'var(--text-main)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s'}}>✖</button>
            </div>

            <div style={{background: 'var(--input-bg)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '20px'}}>
              <div className="toggle-group" style={{marginBottom: '16px'}}>
                <div className={"toggle-btn in " + (newAgentType === 'agent' ? 'active' : '')} onClick={() => setNewAgentType('agent')}>{t('agent_tab')} 👤</div>
                <div className={"toggle-btn out " + (newAgentType === 'master' ? 'active' : '')} style={newAgentType === 'master' ? {background: '#ef4444', color: 'white'} : {}} onClick={() => setNewAgentType('master')}>{t('master_tab')} 👑</div>
              </div>

              <label className="text-sm font-bold" style={{color: 'var(--text-main)', display: 'block', marginBottom: '8px'}}>👤 {t('name')}</label>
              <input placeholder="အမည် ရိုက်ထည့်ပါ..." value={newAgentName} onChange={e=>setNewAgentName(e.target.value)} style={{marginBottom: '16px'}}/>
              
              <div className="flex-gap">
                <div style={{flex: 1}}>
                  <label className="text-sm font-bold" style={{color: 'var(--text-main)', display: 'block', marginBottom: '8px'}}>💰 {t('comm_percent')}</label>
                  <input type="number" placeholder="0%" value={newAgentComm} onChange={e=>setNewAgentComm(e.target.value)} />
                </div>
                <div style={{flex: 1}}>
                  <label className="text-sm font-bold" style={{color: 'var(--text-main)', display: 'block', marginBottom: '8px'}}>🛑 {t('limit')}</label>
                  <input type="number" placeholder="0" value={newAgentLimit} onChange={e=>setNewAgentLimit(e.target.value)} />
                </div>
              </div>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <button onClick={handleAddOrEditAgent} className={"btn " + (newAgentType === 'master' ? 'btn-red' : 'btn-primary')} style={{padding: '16px', fontSize: '16px'}}>
                {editingAgentId ? "💾 " + t('update_btn') : "✅ " + t('add_new_btn')}
              </button>
              
              {editingAgentId && editingAgentId !== 'default_self' && editingAgentId !== 'default_master' && (
                <button onClick={() => handleDeleteAgent(editingAgentId)} className="btn" style={{background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '14px', fontSize: '15px'}}>
                  🗑️ {t('delete')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- QUICK OUT MODAL --- */}
      {quickOutModal && (
        <div className="modal-overlay" style={{zIndex: 4000}}>
          <div className="modal-box" style={{padding: '24px'}}>
            <div className="flex-row" style={{borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px'}}>
              <h3 style={{margin: 0, color: 'var(--text-main)', fontSize:'20px'}}>{t('quick_out_title')}</h3>
              <button onClick={() => setQuickOutModal(null)} style={{background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer'}}>✖</button>
            </div>

            <div style={{textAlign: 'center', marginBottom: '24px'}}>
               <div style={{fontSize: '40px', fontWeight: 'bold', color: '#ef4444'}}>{quickOutModal.num}</div>
               <div className="text-sm text-muted" style={{marginTop: '6px'}}>{t('over_limit_amount')} <span style={{color: '#f59e0b', fontWeight: 'bold'}}>{quickOutModal.ex.toLocaleString()}</span></div>
            </div>

            <label className="text-sm font-bold">{t('send_to_master')}</label>
            <select value={quickOutModal.masterId} onChange={e => setQuickOutModal({...quickOutModal, masterId: e.target.value})} style={{marginTop: '8px', marginBottom: '16px'}}>
               {Object.values(agents).filter(a => a.type === 'master').length === 0 && <option value="">{t('no_master_yet')}</option>}
               {Object.values(agents).filter(a => a.type === 'master').map(m => (
                  <option key={m.id} value={m.id}>👑 {m.name} {m.comm > 0 ? "(" + m.comm + "%)" : ""}</option>
               ))}
            </select>

            <label className="text-sm font-bold">{t('out_amount')}</label>
            <input 
              type="number" 
              value={quickOutModal.price} 
              onChange={e => setQuickOutModal({...quickOutModal, price: e.target.value})} 
              style={{marginTop: '8px', marginBottom: '28px', fontSize: '22px', fontWeight: 'bold', color: '#ef4444', textAlign: 'center'}} 
            />

            <button className="btn btn-red" onClick={submitQuickOut} style={{padding: '16px', fontSize: '16px'}}>
              {t('submit_out')}
            </button>
          </div>
        </div>
      )}

      {/* --- BULK OUT MODAL --- */}
      {bulkOutModal && (() => {
         const selectedItems = bulkOutModal.items.filter(i => i.selected);
         const totalItems = selectedItems.length;
         const totalAmount = selectedItems.reduce((sum, item) => sum + (parseInt(item.outAmount) || 0), 0);
         const isAllSelected = bulkOutModal.items.length > 0 && bulkOutModal.items.every(i => i.selected);
         
         const applyQuickAmount = (val) => {
             if(val === '' || isNaN(val)) return;
             const newItems = bulkOutModal.items.map(i => i.selected ? {...i, outAmount: val} : i);
             setBulkOutModal({...bulkOutModal, items: newItems});
         };

         return (
          <div className="modal-overlay" style={{zIndex: 4000}}>
            <div className="modal-box" style={{padding: 0, display: 'flex', flexDirection: 'column', maxHeight: '85vh', overflow: 'hidden', background: 'var(--bg-main)', width: '95%', maxWidth: '450px'}}>
              
              <div style={{padding: '12px 16px 8px 16px', background: 'var(--header-bg)', flexShrink: 0, borderRadius: '24px 24px 0 0', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                  <div className="flex-row" style={{marginBottom: '10px'}}>
                     <h3 style={{margin: 0, color: '#ffffff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                       <span style={{background: 'rgba(239,68,68,0.15)', padding: '4px', borderRadius: '6px', fontSize:'14px'}}>📤</span> လစ်မစ်ကျော်များ
                     </h3>
                     <button onClick={() => setBulkOutModal(null)} style={{background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', padding: 0}}>✖</button>
                  </div>

                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '8px 12px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.05)'}}>
                     <div style={{display: 'flex', alignItems: 'baseline', gap: '6px'}}>
                        <span style={{fontSize: '11px', color: '#94a3b8'}}>ကွက်:</span>
                        <span style={{fontSize: '16px', fontWeight: '900', color: '#3b82f6'}}>{totalItems}</span>
                     </div>
                     <div style={{display: 'flex', alignItems: 'baseline', gap: '6px'}}>
                        <span style={{fontSize: '11px', color: '#fca5a5'}}>စုစုပေါင်း:</span>
                        <span style={{fontSize: '18px', fontWeight: '900', color: '#ef4444'}}>{totalAmount.toLocaleString()}</span>
                     </div>
                  </div>

                  <div style={{display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', alignItems: 'center'}}>
                     <button onClick={handleResetExcess} style={{padding: '6px 10px', fontSize: '11px', borderRadius: '14px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'}}>
                       🔄 မူလ
                     </button>
                     
                     {(() => {
                         let amounts = [100, 200, 500, 1000, 3000, 5000]; 
                         if (appSettings.quickPrices) {
                             if (Array.isArray(appSettings.quickPrices)) {
                                 amounts = appSettings.quickPrices;
                             } else if (typeof appSettings.quickPrices === 'string') {
                                 amounts = appSettings.quickPrices.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                             }
                         }
                         return amounts.map(amt => (
                             <button key={amt} onClick={() => applyQuickAmount(amt)} style={{padding: '6px 10px', fontSize: '11px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'}}>
                               {amt >= 1000 ? (amt/1000)+'K' : amt}
                             </button>
                         ));
                     })()}

                     <div style={{display: 'flex', alignItems: 'center', background: 'var(--input-bg)', borderRadius: '14px', border: '1px solid var(--border)', padding: '2px 8px', flexShrink: 0}}>
                        <span style={{fontSize: '11px'}}>✏️</span>
                        <input 
                           type="number" 
                           placeholder="အခြား"
                           style={{width: '50px', padding: '4px', fontSize: '12px', background: 'transparent', border: 'none', color: 'var(--text-main)', textAlign: 'right', fontWeight: 'bold', outline: 'none'}} 
                           onChange={(e) => applyQuickAmount(e.target.value)}
                        />
                     </div>
                  </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)'}}>
                  <span style={{fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)'}}>စာရင်းအသေးစိတ်</span>
                  <button onClick={() => {
                    const newItems = bulkOutModal.items.map(i => ({...i, selected: !isAllSelected}));
                    setBulkOutModal({...bulkOutModal, items: newItems});
                 }} style={{background: 'transparent', border: 'none', color: isAllSelected ? '#ef4444' : '#3b82f6', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'}}>
                    {isAllSelected ? '✖ အားလုံးဖြုတ်မည်' : '☑ အားလုံးရွေးမည်'}
                 </button>
              </div>

              <div style={{flex: 1, overflowY: 'auto', padding: '8px 16px', background: 'var(--bg-main)'}}>
                  {bulkOutModal.items.map((item, index) => (
                     <div key={item.num} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', background: item.selected ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '10px', border: "1px solid " + (item.selected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)'), transition: '0.2s', opacity: item.selected ? 1 : 0.6}} onClick={() => {
                        const newItems = [...bulkOutModal.items];
                        newItems[index].selected = !newItems[index].selected;
                        setBulkOutModal({...bulkOutModal, items: newItems});
                     }}>
                         <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                             <div style={{width: '18px', height: '18px', borderRadius: '6px', border: "2px solid " + (item.selected ? '#3b82f6' : 'var(--text-muted)'), background: item.selected ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s'}}>
                                 {item.selected && <span style={{color: 'white', fontSize: '12px', fontWeight: 'bold'}}>✓</span>}
                             </div>
                             
                             <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                 <span style={{fontWeight: '900', fontSize: '18px', color: item.selected ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: '1'}}>
                                   {item.num} {(appSettings.hotNumbers || '').includes(item.num) && <span style={{fontSize:'12px', marginLeft: '4px'}}>🔥</span>}
                                 </span>
                                 <span style={{fontSize: '11px', color: '#ef4444', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '6px'}}>
                                    ကျော်: {formatEx(item.ex)}
                                 </span>
                             </div>
                         </div>

                         <div onClick={(e) => e.stopPropagation()}>
                             <input 
                                type="number" 
                                disabled={!item.selected}
                                value={item.outAmount} 
                                onChange={e => {
                                    const newItems = [...bulkOutModal.items];
                                    newItems[index].outAmount = e.target.value;
                                    setBulkOutModal({...bulkOutModal, items: newItems});
                                }} 
                                style={{width: '75px', padding: '6px 8px', fontSize: '14px', textAlign: 'right', background: item.selected ? 'var(--bg-card)' : 'transparent', border: "1px solid " + (item.selected ? 'var(--border)' : 'transparent'), borderRadius: '6px', color: item.selected ? '#10b981' : 'var(--text-muted)', fontWeight: 'bold', outline: 'none', transition: '0.2s'}} 
                             />
                         </div>
                     </div>
                  ))}
              </div>

              <div style={{padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--header-bg)', flexShrink: 0, borderRadius: '0 0 24px 24px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px'}}>
                     <span style={{fontSize: '16px'}}>👑</span>
                     <select value={bulkOutModal.masterId} onChange={e => setBulkOutModal({...bulkOutModal, masterId: e.target.value})} style={{flex: 1, padding: '8px 12px', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px', background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', outline: 'none', cursor: 'pointer'}}>
                         {Object.values(agents).filter(a => a.type === 'master').length === 0 && <option value="">Master မရှိပါ</option>}
                         {Object.values(agents).filter(a => a.type === 'master').map(m => (
                            <option key={m.id} value={m.id}>{m.name} {m.comm > 0 ? `(${m.comm}%)` : ""}</option>
                         ))}
                     </select>
                  </div>
                  <button className="btn btn-primary" onClick={submitBulkOut} style={{padding: '12px', fontSize: '14px', borderRadius: '10px', boxShadow: totalItems > 0 ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none'}} disabled={totalItems === 0}>
                     📤 တင်မည် ({totalItems} ကွက်)
                  </button>
              </div>
            </div>
          </div>
         );
      })()}

      {/* --- EDIT HISTORY PRICE MODAL --- */}
      {editHistoryModal && (
        <div className="modal-overlay" style={{zIndex: 5000}}>
          <div className="modal-box" style={{padding: '24px'}}>
            <div className="flex-row" style={{borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px'}}>
              <h3 style={{margin: 0, color: 'var(--text-main)', fontSize:'20px'}}>ပြင်ဆင်မည်</h3>
              <button onClick={() => setEditHistoryModal(null)} style={{background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer'}}>✖</button>
            </div>
            <p style={{color: 'var(--text-main)', marginBottom: '16px', lineHeight: '1.6', fontSize: '14px'}}>
               ယခင်မှတ်တမ်း: <span style={{fontWeight: 'bold', color: editHistoryModal.type === 'in' ? '#10b981' : '#ef4444'}}> {editHistoryModal.type === 'in' ? 'IN' : 'OUT'} {editHistoryModal.input} ({editHistoryModal.price})</span>
            </p>
            
            <label className="text-sm font-bold">ဂဏန်း (Numbers)</label>
            <textarea 
             rows={3}
             value={editHistoryModal.newInput} 
             onChange={e => setEditHistoryModal({...editHistoryModal, newInput: e.target.value})} 
             style={{marginTop: '8px', marginBottom: '16px', fontSize: '16px', fontWeight: 'bold', width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', lineHeight: '1.5'}} 
            />

            <label className="text-sm font-bold">စျေးနှုန်း (Price)</label>
            <input 
               type="number" 
               value={editHistoryModal.newPrice} 
               onChange={e => setEditHistoryModal({...editHistoryModal, newPrice: e.target.value})} 
               style={{marginTop: '8px', marginBottom: '24px', fontSize: '20px', fontWeight: 'bold', textAlign: 'center', borderColor: '#3b82f6'}} 
            />

            <div className="flex-gap">
              <button onClick={() => setEditHistoryModal(null)} className="btn btn-dark" style={{flex: 1}}>{t('cancel')}</button>
              <button onClick={handleEditHistoryPrice} className="btn btn-primary" style={{flex: 1}}>{t('ok')}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM CONFIRM MODAL --- */}
      {confirmModal.show && (
        <div className="modal-overlay" style={{zIndex: 5000}}>
          <div className="modal-box" style={{padding: '24px'}}>
            <h3 style={{marginTop: 0, marginBottom: '16px'}}>{confirmModal.title || (confirmModal.isAlert ? t('alert') : t('confirm'))}</h3>
            <p style={{color: 'var(--text-main)', marginBottom: '24px', lineHeight: '1.6', fontSize: '15px'}}>{confirmModal.message}</p>
            <div className="flex-gap">
              {!confirmModal.isAlert && (
                <button onClick={() => setConfirmModal({show:false, title:'', message:'', onConfirm:null, isAlert:false})} className="btn btn-dark" style={{flex: 1}}>{t('cancel')}</button>
              )}
              <button onClick={executeConfirm} className="btn btn-primary" style={{flex: 1}}>{t('ok')}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- AGENT DETAIL MODAL --- */}
      {agentDetailModal && agents[agentDetailModal] && (() => {
        const isMaster = agents[agentDetailModal].type === 'master';
        const stats = ledgers[agentDetailModal] || { in: 0, out: 0, commIn: 0, commOut: 0, data: {} };
        const netSales = stats.in - stats.out;
        const netComm = stats.commIn - stats.commOut;
        const agentBalance = isMaster ? (stats.out - stats.commOut) : (netSales - netComm);
        const hasWin = winNumber && winNumber.length === 2;
        const winAmount = hasWin ? ((stats.data[winNumber] || 0) * (appSettings.payout2D || 80)) : 0;

        return (
        <div className="modal-overlay" style={{alignItems: 'center', zIndex: 4500}}>
          <div className="modal-box" style={{width: '95%', maxWidth: '500px', borderRadius: '24px', maxHeight: '85vh', padding: '0', display: 'flex', flexDirection: 'column'}}>
            
            <div style={{background: 'var(--header-bg)', padding: '12px 16px', borderRadius: '24px 24px 0 0', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                 <h2 style={{margin: 0, color: '#ffffff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                   {isMaster ? '👑' : '👤'} {agents[agentDetailModal].name}
                   <span style={{fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'normal'}}>Comm: {agents[agentDetailModal].comm}%</span>
                 </h2>
                 <button onClick={() => setAgentDetailModal(null)} style={{background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '20px', cursor: 'pointer', padding: 0}}>✖</button>
               </div>

               <div style={{display: 'flex', gap: '8px'}}>
                  <div style={{flex: 1, background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)'}}>
                     <span style={{color: '#cbd5e1', fontSize: '11px'}}>{isMaster ? 'OUT' : 'IN'}</span>
                     <span style={{fontWeight: 'bold', fontSize: '14px', color: '#10b981'}}>{(isMaster ? stats.out : stats.in).toLocaleString()}</span>
                  </div>
                  <div style={{flex: 1, background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)'}}>
                     <span style={{color: '#cbd5e1', fontSize: '11px'}}>Net</span>
                     <span style={{fontWeight: 'bold', fontSize: '14px', color: '#ffffff'}}>{agentBalance.toLocaleString()}</span>
                  </div>
               </div>
            </div>

            <div style={{padding: '12px 16px', flex: 1, overflowY: 'auto'}}>
               <div style={{display: 'flex', gap: '8px', marginBottom: '12px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)'}}>
                  <button onClick={() => setAgentDetailTab('history')} style={{flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: agentDetailTab === 'history' ? '#3b82f6' : 'transparent', color: agentDetailTab === 'history' ? '#fff' : 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>📜 မှတ်တမ်းများ</button>
                  <button onClick={() => setAgentDetailTab('stats')} style={{flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: agentDetailTab === 'stats' ? '#3b82f6' : 'transparent', color: agentDetailTab === 'stats' ? '#fff' : 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}>📊 ဂဏန်းအလိုက်</button>
               </div>

               {hasWin && (
                  <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '12px'}}>
                     <span style={{fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '4px 8px', borderRadius: '6px', color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px'}}>
                        🏆 {winNumber} <span style={{color: 'var(--text-main)'}}>[{(stats.data[winNumber] || 0).toLocaleString()}]</span> ➔ Win: {winAmount.toLocaleString()}
                     </span>
                  </div>
               )}

               {agentDetailTab === 'history' && (
                  <div style={{flex: 1, overflowY: 'auto', paddingRight: '4px', paddingBottom: '20px'}}>
                     {historyLog.filter(h => h.agentId === agentDetailModal).length > 0 ? (
                        historyLog.filter(h => h.agentId === agentDetailModal).map((h, i) => (
                           <div key={h.id || i} style={{borderBottom: '1px dashed rgba(255,255,255,0.1)', padding: '12px 0', cursor: 'pointer'}} onClick={() => setEditHistoryModal({ ...h, newPrice: h.price, newInput: h.input })}>
                             
                              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                                 <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <span style={{fontSize: '10px', background: h.type === 'in' ? '#10b981' : '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>{h.type === 'in' ? 'IN' : 'OUT'}</span>
                                    <span style={{fontSize: '11px', color: '#cbd5e1'}}>🕒 {h.time}</span>
                                 </div>
                                 <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <span style={{fontSize: '11px', color: '#3b82f6'}}>✏️</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteHistoryItem(h); }} style={{background:'rgba(239, 68, 68, 0.1)', color:'#ef4444', border:'none', borderRadius:'6px', width:'24px', height:'24px', fontSize:'11px', display:'flex', alignItems:'center', justifyContent:'center'}}>🗑️</button>
                                 </div>
                              </div>

                              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                 <div style={{flex: 1, paddingRight: '16px'}}>
                                    <div style={{fontSize: '15px', fontWeight: '600', color: h.type === 'in' ? '#10b981' : '#ef4444', wordBreak: 'break-word', lineHeight: '1.5'}}>
                                       {h.input}
                                    </div>
                                 </div>
                                 <div style={{textAlign: 'right', minWidth: '85px'}}>
                                    <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginBottom: '4px'}}>{h.count} × {h.price}</div>
                                    <div style={{fontSize: '15px', fontWeight: 'bold', color: '#ffffff'}}>{(h.count * h.price).toLocaleString()}</div>
                                 </div>
                              </div>
                           </div>
                        ))
                     ) : (
                       <div style={{fontSize: '12px', color: '#cbd5e1', textAlign: 'center', marginTop: '20px'}}>{t('no_history')}</div>
                     )}
                  </div>
               )}

               {agentDetailTab === 'stats' && (
                  <div style={{flex: 1, overflowY: 'auto', paddingRight: '4px', paddingBottom: '20px'}}>
                     <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '8px'}}>
                       {stats.data && Object.entries(stats.data).filter(([k,v]) => v > 0).sort((a,b) => b[1]-a[1]).length > 0 ? (
                          Object.entries(stats.data).filter(([k,v]) => v > 0).sort((a,b) => b[1]-a[1]).map(([num, val]) => {
                            const isWinNum = num === winNumber; 

                            return (
                               <div 
                                 key={num} 
                                 style={{
                                   textAlign: 'center', 
                                   padding: '6px', 
                                   background: isWinNum ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0,0,0,0.2)', 
                                   borderRadius: '8px', 
                                   border: isWinNum ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.05)',
                                   boxShadow: isWinNum ? '0 0 8px rgba(245, 158, 11, 0.4)' : 'none',
                                   position: 'relative'
                                 }}
                               >
                                  <div style={{
                                     fontWeight: 'bold', 
                                     fontSize: isWinNum ? '17px' : '15px', 
                                     color: isWinNum ? '#f59e0b' : '#ffffff'
                                  }}>{num}</div>
                                  <div style={{fontSize: '11px', color: val > (appSettings.globalLimit || 10000) ? '#ef4444' : '#10b981', fontWeight: 'bold', marginTop: '4px'}}>{val >= 1000 ? (val/1000).toFixed(1).replace('.0','') + 'K' : val}</div>
                               </div>
                            );
                          })
                       ) : <div style={{fontSize: '12px', color: '#cbd5e1', gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px'}}>ဂဏန်းများ မရှိသေးပါ။</div>}
                     </div>
                  </div>
               )}
            </div>
          </div>
        </div>
        );
      })()}
    </>
  );
};