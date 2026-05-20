// src/components/GridBox.tsx
import React, { memo } from 'react';
import { formatEx, formatPrice } from '../utils/helpers';

export const GridBox = memo(({ n, val, globalLimit, isHot, onQuickOut }) => {
    let ex = val > globalLimit ? val - globalLimit : 0;
    let percent = val > 0 ? Math.min(100, (val / globalLimit) * 100) : 0; 
    let isOver = val > globalLimit;
    let isNegative = val < 0; 
    let isWarn = percent >= 80 && !isOver; 

    let boxBg = 'transparent';
    let boxBorder = '1px dashed rgba(255,255,255,0.05)';
    let numColor = 'var(--text-muted)';
    let numOpacity = 0.15; 
    let priceColor = 'transparent'; 
    let glowEffect = 'none'; 

    if (isNegative) {
        boxBg = 'rgba(192, 132, 252, 0.04)'; 
        boxBorder = '1px solid rgba(192, 132, 252, 0.15)'; 
        numColor = 'var(--text-main)';
        numOpacity = 1;
        priceColor = '#c084fc'; 
    } else if (val > 0) {
        numOpacity = 1; 
        numColor = 'var(--text-main)'; 
        
        if (isOver) {
            boxBg = 'rgba(239, 68, 68, 0.2)'; 
            boxBorder = '1px solid rgba(239, 68, 68, 0.5)';
            priceColor = '#ef4444'; 
        } else if (isWarn) { 
            boxBg = 'rgba(234, 88, 12, 0.1)'; 
            boxBorder = '2px solid rgba(234, 88, 12, 0.7)'; 
            glowEffect = '0 0 10px rgba(234, 88, 12, 0.35)'; 
            priceColor = '#ea580c'; 
        } else if (percent >= 50) {
            boxBg = 'rgba(245, 158, 11, 0.05)'; 
            boxBorder = '1px solid rgba(245, 158, 11, 0.2)';
            priceColor = '#f59e0b'; 
        } else {
            boxBg = 'rgba(59, 130, 246, 0.03)'; 
            boxBorder = '1px solid rgba(59, 130, 246, 0.15)';
            priceColor = '#10b981'; 
        }
    }

    let barColor = isOver ? '#ef4444' : isWarn ? '#ea580c' : percent >= 50 ? '#f59e0b' : '#3b82f6';
    let boxClass = "box " + (isHot ? 'hot-glow ' : '');

    const displayVal = isNegative 
        ? '-' + (Math.abs(val) >= 1000 ? (Math.abs(val)/1000) + 'K' : Math.abs(val))
        : formatPrice(val);

    return (
      <div className={boxClass}
           onClick={() => { if(ex > 0) onQuickOut(n, ex); }}
           style={{ background: boxBg, border: boxBorder, boxShadow: glowEffect, transition: '0.3s ease', cursor: ex > 0 ? 'pointer' : 'default' }}>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', zIndex: 2}}>
           <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <span className="num" style={{fontSize: '15px', fontWeight: '900', lineHeight: 1, color: numColor, opacity: numOpacity}}>{n}</span>
              {isHot && <span style={{fontSize: '11px', filter: 'drop-shadow(0 0 2px rgba(245,158,11,0.8))', lineHeight: 1}}>💡</span>}
           </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, zIndex: 2, width: '100%'}}>
           {ex > 0 && <span style={{fontSize: '11px', color: '#ffffff', fontWeight: '900', lineHeight: 1, background: '#ef4444', padding: '2px 4px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'}}>+{formatEx(ex)}</span>}
           {isWarn && <span style={{fontSize: '14px', filter: 'drop-shadow(0 0 2px rgba(234, 88, 12, 0.8))', lineHeight: 1}}>⚠️</span>}
        </div>

        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'flex-end', width: '100%', zIndex: 2, paddingBottom: '2px'}}>
           {val !== 0 && <span className="price" style={{fontSize: '12px', fontWeight: '900', color: priceColor, lineHeight: 1}}>{displayVal}</span>}
        </div>
        
        {val > 0 && <div className="progress-bar" style={{width: percent + '%', background: barColor}}></div>}
     
      </div>
    );
});