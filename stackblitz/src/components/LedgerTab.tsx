// src/components/LedgerTab.tsx
import React from 'react';

export const LedgerTab = ({
  t, ledgers, agents, winNumber, setWinNumber, appSettings, 
  setActiveTab, ledgerFilter, setLedgerFilter,
  setNewAgentName, setNewAgentComm, setNewAgentLimit, setNewAgentType, 
  setEditingAgentId, setShowAgentForm, moveAgent, handleEditClick, setAgentDetailModal
}) => {
  let grandTotalIn = 0;
  let grandTotalOut = 0;
  let grandCommToPay = 0; 
  let grandCommToReceive = 0; 
  let totalWinPayoutToAgents = 0;
  let totalWinReceiveFromMasters = 0;

  Object.entries(ledgers).forEach(([agId, stats]) => {
      grandTotalIn += (stats.in || 0);
      grandTotalOut += (stats.out || 0);
      grandCommToPay += (stats.commIn || 0);
      grandCommToReceive += (stats.commOut || 0);

      if (winNumber && winNumber.length === 2 && stats.data && stats.data[winNumber] > 0) {
          let isMaster = agents[agId]?.type === 'master';
          let payout = stats.data[winNumber] * (appSettings.payout2D || 80);
          if (isMaster) totalWinReceiveFromMasters += payout;
          else totalWinPayoutToAgents += payout;
      }
  });

  const baseNetBalance = (grandTotalIn - grandCommToPay) - (grandTotalOut - grandCommToReceive);
  const grandNetBalance = (winNumber && winNumber.length === 2) 
      ? (baseNetBalance - totalWinPayoutToAgents + totalWinReceiveFromMasters)
      : baseNetBalance;

  return (
    <div>
      <div className="flex-row" style={{marginBottom: '16px'}}>
        <h3 style={{margin: 0, color: 'var(--text-main)', fontSize: '20px'}}>📓 {t('ledger_summary')}</h3>
        <button onClick={() => setActiveTab('dashboard')} className="btn-dark" style={{padding: '8px 14px', borderRadius: '12px', fontSize: '13px', background: 'var(--bg-card)', border: '1px solid var(--border)'}}>⬅ {t('back')}</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
         <div style={{ flex: 1, background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', marginBottom: '6px', textAlign: 'center' }}>{t('net_cash_in_hand')}</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: grandNetBalance >= 0 ? '#10b981' : '#ef4444', lineHeight: 1 }}>
               {grandNetBalance >= 0 ? '+' : ''}{grandNetBalance.toLocaleString()}
            </div>
         </div>

         <div style={{ flex: 1.2, background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span style={{ color: 'var(--text-muted)' }}>{t('total_in_net').replace(':','')}</span>
               <span className="font-bold text-green">+{ (grandTotalIn - grandCommToPay).toLocaleString() }</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span style={{ color: 'var(--text-muted)' }}>{t('total_out_net').replace(':','')}</span>
               <span className="font-bold text-red">-{ (grandTotalOut - grandCommToReceive).toLocaleString() }</span>
            </div>
            {winNumber && winNumber.length === 2 && (
               <>
                 <div style={{ borderTop: '1px dashed var(--border)', margin: '2px 0' }}></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>ထိုးသားလျော်ငွေ</span>
                    <span className="font-bold text-red">-{ totalWinPayoutToAgents.toLocaleString() }</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>ဒိုင်မှရငွေ</span>
                    <span className="font-bold text-green">+{ totalWinReceiveFromMasters.toLocaleString() }</span>
                 </div>
               </>
            )}
         </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'stretch' }}>
         <div className="toggle-group" style={{ flex: 1, margin: 0, padding: '2px', border: '1px solid var(--border)' }}>
            <div className={"toggle-btn " + (ledgerFilter === 'all' ? 'active' : '')} style={ledgerFilter==='all'?{background:'#3b82f6', color:'white', padding:'6px', fontSize:'12px'}:{padding:'6px', fontSize:'12px'}} onClick={() => setLedgerFilter('all')}>{t('all')}</div>
            <div className={"toggle-btn " + (ledgerFilter === 'agent' ? 'active' : '')} style={ledgerFilter==='agent'?{background:'#10b981', color:'white', padding:'6px', fontSize:'12px'}:{padding:'6px', fontSize:'12px'}} onClick={() => setLedgerFilter('agent')}>👤 ထိုးသား</div>
            <div className={"toggle-btn " + (ledgerFilter === 'master' ? 'active' : '')} style={ledgerFilter==='master'?{background:'#ef4444', color:'white', padding:'6px', fontSize:'12px'}:{padding:'6px', fontSize:'12px'}} onClick={() => setLedgerFilter('master')}>👑 ဒိုင်</div>
         </div>

         <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid #f59e0b', borderRadius: '10px', padding: '0 8px' }}>
            <span style={{ fontSize: '14px', marginRight: '4px' }}>🏆</span>
            <input type="text" placeholder="--" value={winNumber} onChange={e=>setWinNumber(e.target.value)} maxLength={2} style={{ width: '28px', padding: '0', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', background: 'transparent', border: 'none', color: '#f59e0b', outline: 'none' }} />
         </div>

         <button 
            className="btn-primary" 
            style={{ padding: '0 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)' }}
            onClick={() => {
               setNewAgentName(''); setNewAgentComm(''); setNewAgentLimit('');
               setNewAgentType(ledgerFilter === 'master' ? 'master' : 'agent'); setEditingAgentId(null); setShowAgentForm(true);
            }}
         >
            ➕ အသစ်
         </button>
      </div>
      
      {Object.values(agents).filter(a => ledgerFilter === 'all' ? true : a.type === ledgerFilter).length === 0 ? <div className="text-sm" style={{textAlign: 'center', marginTop: '40px'}}>{t('no_ledger')}</div> : 
        Object.values(agents)
          .filter(a => ledgerFilter === 'all' ? true : a.type === ledgerFilter)
          .sort((a,b) => (a.order || 0) - (b.order || 0))
          .map((ag) => {
          const agId = ag.id;
          const stats = ledgers[agId] || { in: 0, out: 0, commIn: 0, commOut: 0, data: {} };
          const isMaster = ag.type === 'master';
          
          const netSales = stats.in - stats.out;
          const netComm = stats.commIn - stats.commOut;
          
          const agentBalance = isMaster ? (stats.out - stats.commOut) : (netSales - netComm);
          const hasWin = winNumber && winNumber.length === 2;
          const winAmount = hasWin ? ((stats.data[winNumber] || 0) * (appSettings.payout2D || 80)) : 0;
          const netToAdmin = isMaster ? (winAmount - agentBalance) : (agentBalance - winAmount);

          return (
            <div key={agId} className="ledger-card" onClick={() => setAgentDetailModal(agId)}>
              <div className="flex-row" style={{padding: '12px 16px', background: isMaster ? 'var(--input-bg)' : 'var(--bg-card)', borderBottom: '1px solid var(--border)'}}>
                <div style={{fontWeight: 'bold', fontSize: '16px', color: isMaster ? '#ef4444' : '#3b82f6'}}>
                  {ag.name} {isMaster ? '👑' : '👤'} {ag.comm > 0 ? <span className="text-orange" style={{fontSize:'12px', marginLeft:'6px'}}>({ag.comm}%)</span> : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div style={{ display: 'flex', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                       <button onClick={(e) => { e.stopPropagation(); moveAgent(agId, 'up'); }} style={{ padding: '8px 16px', background: 'transparent', border: 'none', borderRight: '1px solid rgba(59, 130, 246, 0.3)', color: '#3b82f6', fontSize: '14px', cursor: 'pointer' }}>▲</button>
                       <button onClick={(e) => { e.stopPropagation(); moveAgent(agId, 'down'); }} style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '14px', cursor: 'pointer' }}>▼</button>
                   </div>
                   
                   <button onClick={(e) => { e.stopPropagation(); handleEditClick(ag); }} style={{ padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', color: '#f59e0b', fontSize: '14px', cursor: 'pointer' }}>✏️</button>
                   
                   <span style={{color: 'var(--text-muted)', marginLeft: '4px', fontSize: '16px'}}>❯</span>
                </div>
              </div>
              <div style={{padding: '14px 16px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: hasWin ? '10px' : '12px'}}>
                  <div>
                     <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>{isMaster ? t('total_out') : t('total_in')}</div>
                     <div className={"font-bold " + (isMaster ? 'text-red' : 'text-green')} style={{fontSize: '16px'}}>{isMaster ? stats.out.toLocaleString() : stats.in.toLocaleString()}</div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                     <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>{isMaster ? t('comm_get') : t('comm_pay')}</div>
                     <div className="font-bold text-orange" style={{fontSize: '16px'}}>{isMaster ? '+' : '-'} {Math.abs(netComm).toLocaleString()}</div>
                  </div>
                </div>

                {hasWin ? (
                  <div style={{borderTop: '1px dashed var(--border)', marginTop: '12px', background: 'var(--input-bg)', padding: '12px', borderRadius: '10px'}}>
                    
                    {winAmount > 0 && (
                        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '14px'}}>
                           <span style={{fontSize: '12px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 12px', borderRadius: '8px', color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}>
                              🏆 {winNumber} <span style={{color: 'var(--text-main)'}}>[{(stats.data[winNumber] || 0).toLocaleString()}]</span> ➔ Win: {winAmount.toLocaleString()}
                           </span>
                        </div>
                    )}

                    <div className="flex-row mb-1" style={{fontSize: '13px'}}>
                        <span style={{color: 'var(--text-muted)'}}>{isMaster ? t('pay_to_master') : t('net_bal')}</span>
                        <span className="font-bold" style={{ color: 'var(--text-main)', fontSize: '15px' }}>
                            {agentBalance.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex-row mb-2" style={{fontSize: '13px'}}>
                        <span className="text-orange font-bold">{isMaster ? t('win_from_master') : t('agent_win')}</span>
                        <span className="font-bold text-orange" style={{fontSize: '15px'}}>{winAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex-row mt-2" style={{borderTop: '1px solid var(--border)', paddingTop: '10px'}}>
                        <span className="font-bold" style={{fontSize: '14px', color: 'var(--text-main)'}}>{netToAdmin >= 0 ? t('admin_receive') : t('admin_pay')}</span>
                        <span className={"font-bold " + (netToAdmin >= 0 ? 'text-green' : 'text-red')} style={{fontSize: '18px'}}>{Math.abs(netToAdmin).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{borderTop: '1px dashed var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                     <div style={{fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)'}}>{isMaster ? t('net_bal_pay') : t('net_bal')}</div>
                     <div className={"font-bold " + (agentBalance >= 0 ? 'text-green' : 'text-red')} style={{fontSize: '18px'}}>
                       {Math.abs(agentBalance).toLocaleString()} {!isMaster && agentBalance < 0 ? <span style={{fontSize: '12px', marginLeft: '6px'}}>{t('loss')}</span> : ''}
                     </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      }
    </div>
  );
};