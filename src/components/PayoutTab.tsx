// src/components/PayoutTab.tsx
import React from 'react';

export const PayoutTab = ({
  t, theme, appSettings, winNumber, setWinNumber, ledgers, agents, setActiveTab
}) => {
  let totalMasterWin = 0; let totalAgentWin = 0; const payoutList = [];

  if (winNumber && winNumber.length === 2) {
      Object.entries(ledgers).filter(([k,v]) => v.data && v.data[winNumber] > 0).forEach(([agId, stats]) => {
          let betAmt = stats.data[winNumber]; let payout = betAmt * (appSettings.payout2D || 80);
          let agent = agents[agId] || {}; let isMaster = agent.type === 'master';
          if (isMaster) totalMasterWin += payout; else totalAgentWin += payout;
          payoutList.push({ id: agId, name: agent.name, isMaster, betAmt, payout });
      });
  }

  let netAdminGain = totalMasterWin - totalAgentWin;
  let displayNet = netAdminGain > 0 ? "+" + netAdminGain.toLocaleString() : netAdminGain < 0 ? netAdminGain.toLocaleString() : "0";
  let netColorClass = netAdminGain > 0 ? 'text-green' : netAdminGain < 0 ? 'text-red' : 'text-primary';
  let netLabel = netAdminGain > 0 ? t('admin_net_profit') : netAdminGain < 0 ? t('admin_net_loss') : t('admin_break_even');

  return (
    <div>
      <div className="flex-row" style={{marginBottom: '18px'}}>
        <h3 style={{margin: 0, color: '#f59e0b', fontSize: '20px'}}>🏆 {t('match_win')}</h3>
        <button onClick={() => setActiveTab('dashboard')} className="btn-dark" style={{padding: '8px 14px', borderRadius: '12px', fontSize: '13px', background: 'var(--bg-card)', border: '1px solid var(--border)'}}>⬅ {t('back')}</button>
      </div>

      <div className="card" style={{border: '1px solid #f59e0b', background: theme==='dark'?'rgba(245, 158, 11, 0.05)':'#fffbeb', marginBottom: '24px'}}>
         <div className="flex-row">
           <span style={{fontWeight: 'bold', color: '#f59e0b', fontSize: '16px'}}>{t('payout_mult')}</span>
           <span className="text-sm font-bold" style={{color: '#f59e0b', background: 'var(--input-bg)', padding: '6px 12px', borderRadius: '8px'}}>{appSettings.payout2D || 80} ဆ</span>
         </div>
         <div className="flex-gap" style={{marginTop: '16px'}}>
           <input type="text" placeholder={t('win_ph')} value={winNumber} onChange={e=>setWinNumber(e.target.value)} maxLength={2} style={{flex: 1, textAlign: 'center', fontSize: '24px', fontWeight: 'bold', borderColor: '#f59e0b'}} />
         </div>
         {winNumber && winNumber.length === 2 && (
            <div style={{marginTop: '16px', padding: '16px', background: 'var(--input-bg)', borderRadius: '12px'}}>
               <div style={{textAlign: 'center', marginBottom: '16px'}}>
                  <div className="text-sm font-bold" style={{marginBottom: '6px'}}>{netLabel}</div>
                  <div className={netColorClass} style={{fontSize: '28px', fontWeight: 'bold'}}>{displayNet}</div>
                  <div className="text-sm text-muted mt-2">
                    {t('users_matched')} {payoutList.length} {t('users_count')}
                  </div>
               </div>
               <div style={{borderTop: '1px solid var(--border)', paddingTop: '16px'}}>
                  {payoutList.map((item) => {
                      let displayPayout = item.isMaster ? "+" + item.payout.toLocaleString() : "-" + item.payout.toLocaleString();
                      let payoutColorClass = item.isMaster ? "text-green" : "text-red";

                      return (
                        <div key={item.id} className="flex-row" style={{marginBottom: '10px', fontSize: '15px', color: 'var(--text-main)'}}>
                          <span className="font-bold">{item.name} {item.isMaster ? '👑' : ''}</span>
                          <span>{item.betAmt} x {appSettings.payout2D || 80} = <strong className={payoutColorClass} style={{fontSize: '16px', marginLeft: '6px'}}>{displayPayout}</strong></span>
                        </div>
                      );
                  })}
                  {payoutList.length === 0 && <div className="text-sm text-center" style={{padding: '12px 0'}}>{t('no_winner')}</div>}
               </div>
            </div>
         )}
      </div>
    </div>
  );
};