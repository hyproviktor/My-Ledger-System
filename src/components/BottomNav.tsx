// src/components/BottomNav.tsx
import React from 'react';

export const BottomNav = ({ activeTab, setActiveTab, setLedgerFilter, t, userRole }) => {
  return (
    <div className="bottomNav">
      <div className={"navItem " + (activeTab === 'dashboard' ? 'active' : '')} onClick={() => setActiveTab('dashboard')}>
        <span className="navIcon">🏠</span><span>{t('nav_home')}</span>
      </div>
      <div className={"navItem " + (activeTab === 'home' ? 'active' : '')} onClick={() => setActiveTab('home')}>
        <span className="navIcon">➕</span><span>{t('nav_entry')}</span>
      </div>

      {/* 🌟 ADMIN ONLY TABS 🌟 */}
      {userRole === 'admin' && (
         <>
          <div className={"navItem " + (activeTab === 'grid' ? 'active' : '')} onClick={() => setActiveTab('grid')}>
            <span className="navIcon">🔢</span><span>{t('nav_grid')}</span>
          </div>
          <div className={"navItem " + (activeTab === 'limits' ? 'active' : '')} onClick={() => setActiveTab('limits')}>
            <span className="navIcon">📊</span><span>{t('nav_monitor')}</span>
          </div>
          <div className={"navItem " + (activeTab === 'ledger' ? 'active' : '')} onClick={() => { setLedgerFilter('all'); setActiveTab('ledger'); }}>
            <span className="navIcon">📓</span><span>{t('nav_ledger')}</span>
          </div>
         </>
      )}

      <div className={"navItem " + (activeTab === 'history' ? 'active' : '')} onClick={() => setActiveTab('history')}>
        <span className="navIcon">📜</span><span>{t('nav_history')}</span>
      </div>
    </div>
  );
};