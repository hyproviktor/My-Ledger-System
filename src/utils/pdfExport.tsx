// src/utils/pdfExport.tsx
export const exportToPDF = (ledgers, agents, winNumber, appSettings) => {
    const customTitle = "အရောင်းစာရင်းချုပ်";
    const today = new Date().toLocaleDateString('en-GB');
    let printWindow = window.open('', '', 'width=900,height=900');
    
    let hasWin = winNumber && winNumber.length === 2;
    let payoutMult = appSettings.payout2D || 80;

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

        if (hasWin && stats.data && stats.data[winNumber] > 0) {
            let isMaster = agents[agId]?.type === 'master';
            let payout = stats.data[winNumber] * payoutMult;
            if (isMaster) totalWinReceiveFromMasters += payout;
            else totalWinPayoutToAgents += payout;
        }
    });

    const baseNetBalance = (grandTotalIn - grandCommToPay) - (grandTotalOut - grandCommToReceive);
    const grandNetBalance = hasWin ? (baseNetBalance - totalWinPayoutToAgents + totalWinReceiveFromMasters) : baseNetBalance;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>${customTitle} - ${today}</title>
          <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 20px; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
              .title { font-size: 24px; font-weight: bold; color: #0f766e; }
              .meta { text-align: right; font-size: 14px; color: #64748b; line-height: 1.6; }
              .text-green { color: #10b981; }
              .text-red { color: #ef4444; }
              .text-orange { color: #f59e0b; }
              .section-title { font-size: 18px; font-weight: bold; border-left: 4px solid #0f766e; padding-left: 10px; margin-bottom: 15px; page-break-after: avoid; }
              table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              table.data-table th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 14px; border-bottom: 2px solid #cbd5e1; }
              table.data-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
              @media print {
                  @page { size: A4; margin: 15mm; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="title">${customTitle}</div>
              <div class="meta">
                  ရက်စွဲ: ${today}<br/>
                  ${hasWin ? `<span class="text-orange" style="font-size:16px;"><b>🎯 Target Item: ${winNumber} (Bonus)</b></span><br/>` : ''}
                  စုစုပေါင်း လက်ကျန်ငွေ (Net): <span class="${grandNetBalance >= 0 ? 'text-green' : 'text-red'}" style="font-size:18px; font-weight:bold;">${grandNetBalance > 0 ? '+' : ''}${grandNetBalance.toLocaleString()}</span>
              </div>
          </div>
          <div class="section-title">စာရင်းရှင်တစ်ဦးချင်းစီ၏ အသေးစိတ်</div>
          <table class="data-table">
              <tr>
                <th>အမည်</th>
                <th>အရောင်းစုစုပေါင်း</th>
                <th>ခံစားခွင့် %</th>
                ${hasWin ? '<th>အပိုဆုကြေး</th>' : ''}
                <th>ရှင်းရန်ကျန်ငွေ (Net)</th>
              </tr>
    `;

    Object.values(agents).sort((a,b) => (a.order || 0) - (b.order || 0)).forEach(ag => {
       let leg = ledgers[ag.id] || { in: 0, out: 0, commIn: 0, commOut: 0, data: {} };
       let isMaster = ag.type === 'master';
       let netSales = (leg.in || 0) - (leg.out || 0);
       let netComm = (leg.commIn || 0) - (leg.commOut || 0);
       let agentBalance = isMaster ? ((leg.out || 0) - (leg.commOut || 0)) : (netSales - netComm);
       let displayAmt = isMaster ? (leg.out || 0) : (leg.in || 0);
       let winAmt = hasWin ? (((leg.data && leg.data[winNumber]) || 0) * payoutMult) : 0;
       let netToAdmin = hasWin 
            ? (isMaster ? (winAmt - agentBalance) : (agentBalance - winAmt))
            : (isMaster ? -agentBalance : agentBalance);
       let netColor = netToAdmin >= 0 ? 'text-green' : 'text-red';
       let netSign = netToAdmin > 0 ? '+' : '';

       html += `<tr>
           <td><b>${ag.name}</b></td>
           <td>${displayAmt.toLocaleString()}</td>
           <td>${ag.comm}%</td>
           ${hasWin ? `<td class="text-orange"><b>${winAmt > 0 ? winAmt.toLocaleString() : '-'}</b></td>` : ''}
           <td class="${netColor}"><b>${netSign}${netToAdmin.toLocaleString()}</b></td>
       </tr>`;
    });

    html += `</table></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
};