// src/components/TwoDSystem.tsx
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, appId } from '../firebase';
import { exportToPDF } from '../utils/pdfExport';
import { initialData, defaultRules, dict } from '../utils/constants';
import { getTime, generateId, formatEx, formatPrice, normalizeText, preprocessInput, exactStandalone } from '../utils/helpers';
import { AdminTab } from './AdminTab';

import { GridBox } from './GridBox';
import { BottomNav } from './BottomNav';
import { HelpModal } from './HelpModal';
import { Dashboard } from './Dashboard';
import { EntryTab } from './EntryTab';
import { GridTab } from './GridTab';
import { LedgerTab } from './LedgerTab';
import { LimitsTab } from './LimitsTab';
import { HistoryTab } from './HistoryTab';
import { PayoutTab } from './PayoutTab';
import { SettingsTab } from './SettingsTab';
import { AllModals } from './AllModals';

export const TwoDSystem = () => {
   // --- STATE ---
   const [user, setUser] = useState(null);
  const [session, setSession] = useState('morning');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('loading'); // admin, agent, or denied
   
   // UI States
   const [theme, setTheme] = useState(localStorage.getItem('twod_theme') || 'dark');
   const savedLang = localStorage.getItem('twod_lang');
   const [lang, setLang] = useState(dict[savedLang] ? savedLang : 'mm');
   const [showHelp, setShowHelp] = useState(false);
   const [showAgentForm, setShowAgentForm] = useState(false); 
 
   // Data States
   const [data, setData] = useState(initialData());
   const [totalNet, setTotalNet] = useState(0); 
   const [ledgers, setLedgers] = useState({}); 
   const [history, setHistory] = useState([]);
   const [historyLog, setHistoryLog] = useState([]);
   
   // Advanced States
   const [agents, setAgents] = useState({
     'default_self': { id: 'default_self', name: 'ကိုယ်ပိုင် (No Comm)', comm: 0, limit: 0, type: 'agent', order: 0 },
     'default_master': { id: 'default_master', name: 'ပင်မဒိုင်ကြီး', comm: 0, limit: 0, type: 'master', order: 1 }
   });
   
   const [appSettings, setAppSettings] = useState({
     globalLimit: 10000, payout2D: 80, payout3D: 500, payoutMM85: 85,
     hotNumbers: '', useComma: true, splitR: false, useEqualAsPrice: true,
     customRules: defaultRules, quickPrices: '100, 200, 500, 1000, 3000, 5000'
   });
   
   const [entryMode, setEntryMode] = useState('manual'); 
   const [selectedAgentId, setSelectedAgentId] = useState('default_self');
   const [txType, setTxType] = useState('in'); 
   const [numbersText, setNumbersText] = useState(''); 
   const [inputText, setInputText] = useState(''); 
   const [priceText, setPriceText] = useState(''); 
   
   const [limitFilter, setLimitFilter] = useState('seq'); 
   const [ledgerFilter, setLedgerFilter] = useState('all'); 
   const [historyFilter, setHistoryFilter] = useState('all'); 
 
   // Agent Management States
   const [newAgentName, setNewAgentName] = useState('');
   const [newAgentComm, setNewAgentComm] = useState('');
   const [newAgentLimit, setNewAgentLimit] = useState('');
   const [newAgentType, setNewAgentType] = useState('agent'); 
   const [editingAgentId, setEditingAgentId] = useState(null);
 
   const [winNumber, setWinNumber] = useState('');
   const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, isAlert: false });
   const [agentDetailModal, setAgentDetailModal] = useState(null); 
   const [agentDetailTab, setAgentDetailTab] = useState('history');
   const [quickOutModal, setQuickOutModal] = useState(null); 
   const [bulkOutModal, setBulkOutModal] = useState(null); 
   const [editHistoryModal, setEditHistoryModal] = useState(null); 
 
   const priceInputRef = useRef(null);
 
   const t = (key) => (dict[lang] && dict[lang][key]) ? dict[lang][key] : (dict['mm'][key] || key);
 
  // --- THEME & LANG SYNC ---
   useEffect(() => {
     // 🌟 Light Mode နောက်ခံအရောင်ကို ပိုအေးသော eef2f6 (Soft Cool Blue-Gray) သို့ ပြောင်းလဲထားပါသည်
     document.body.style.backgroundColor = theme === 'dark' ? '#0b1120' : '#eef2f6';
     localStorage.setItem('twod_theme', theme);
   }, [theme]);
 
   const toggleTheme = () => { setTheme(theme === 'dark' ? 'light' : 'dark'); };
   const toggleLang = () => {
     const newLang = lang === 'mm' ? 'en' : 'mm';
     setLang(newLang); localStorage.setItem('twod_lang', newLang);
   };
 
   // --- AUTHENTICATION ---
   useEffect(() => {
     const initAuth = async () => {
       try {
         if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
         } else {
           await signInAnonymously(auth);
         }
       } catch (err) { console.error("Auth error:", err); }
     };
     initAuth();
     const unsubscribe = onAuthStateChanged(auth, setUser);
     return () => unsubscribe();
   }, []);
 
   // --- LOCAL STORAGE SYNC ---
   const loadData = (currentSession) => {
     const userKey = user ? user.uid + "_" : "guest_";
const savedData = localStorage.getItem("twod_pro_v8_" + userKey + currentSession);
const globalAgents = localStorage.getItem("twod_pro_v8_" + userKey + "global_agents");
     let parsedGlobalAgents = null;
     if (globalAgents) {
         try { parsedGlobalAgents = JSON.parse(globalAgents); } catch(e) {}
     }
 
     if (savedData) {
       try {
         const parsed = JSON.parse(savedData);
         setData(parsed.data || initialData());
         setTotalNet(parsed.totalNet || 0);
         setLedgers(parsed.ledgers || {});
         setHistory(parsed.history || []);
         setHistoryLog(parsed.historyLog || []);
         
         // 🌟 Session Data ထက် Global Agent ကို ပိုဦးစားပေးမည်
         let loadedAgents = parsedGlobalAgents || parsed.agents || { 
           'default_self': { id: 'default_self', name: 'ကိုယ်ပိုင် (No Comm)', comm: 0, limit: 0, type: 'agent', order: 0 },
           'default_master': { id: 'default_master', name: 'ပင်မဒိုင်ကြီး', comm: 0, limit: 0, type: 'master', order: 1 }
         };
         let maxOrder = 0;
         Object.keys(loadedAgents).forEach(k => {
           if(!loadedAgents[k].type) loadedAgents[k].type = 'agent';
           if(loadedAgents[k].order === undefined) { loadedAgents[k].order = maxOrder++; }
           else if(loadedAgents[k].order > maxOrder) { maxOrder = loadedAgents[k].order; }
         });
         setAgents(loadedAgents);
         
         let loadedSettings = parsed.appSettings || {};
         if(!loadedSettings.customRules || loadedSettings.customRules.length < 15) {
             loadedSettings.customRules = defaultRules;
         }
 
         setAppSettings({ 
           globalLimit: loadedSettings.globalLimit || 10000, 
           payout2D: loadedSettings.payout2D || 80, 
           payout3D: loadedSettings.payout3D || 500, 
           payoutMM85: loadedSettings.payoutMM85 || 85, 
           hotNumbers: loadedSettings.hotNumbers || '', 
           useComma: loadedSettings.useComma !== undefined ? loadedSettings.useComma : true, 
           splitR: loadedSettings.splitR || false, 
           useEqualAsPrice: loadedSettings.useEqualAsPrice !== undefined ? loadedSettings.useEqualAsPrice : true,
           customRules: loadedSettings.customRules,
           quickPrices: loadedSettings.quickPrices || '100, 200, 500, 1000, 3000, 5000'
         });
       } catch(e) { console.error("Error parsing local storage data", e); }
     } else {
       setData(initialData());
       setTotalNet(0); setLedgers({}); setHistory([]); setHistoryLog([]);
       
       // 🌟 ဒေတာအသစ်စရင်တောင် Global Agent တွေ ရှိရင် အဲ့ဒါကိုပဲ ဆက်သုံးမည်
       setAgents(parsedGlobalAgents || {
         'default_self': { id: 'default_self', name: 'ကိုယ်ပိုင် (No Comm)', comm: 0, limit: 0, type: 'agent' },
         'default_master': { id: 'default_master', name: 'ပင်မဒိုင်ကြီး', comm: 0, limit: 0, type: 'master' }
       });
       setAppSettings(prev => ({...prev, customRules: defaultRules}));
     }
   };
 
  // 🌟 ဝင်လာသော User ၏ Role နှင့် လိုင်စင်ကို စစ်ဆေးခြင်း (SaaS Licensing System)
   useEffect(() => { 
     const checkUserRoleAndLicense = async () => {
         if (!user) return;

         try {
             // ၁။ Firestore ရှိ "subscribers" စာရင်းထဲတွင် ဤ User (ဝယ်သူ ဒိုင်ချုပ်) ပါမပါ လှမ်းစစ်မည်
             const subRef = collection(db, "subscribers");
             const q = query(subRef, where("email", "==", user.email.toLowerCase()));
             const querySnapshot = await getDocs(q);

             if (!querySnapshot.empty) {
                 const subData = querySnapshot.docs[0].data();
                 
                 // သက်တမ်းကုန်ဆုံးရက် စစ်ဆေးမည်
                 const isNotExpired = new Date(subData.expireDate) >= new Date(new Date().setHours(0,0,0,0));
                 
                 if (subData.isActive && isNotExpired) {
                     setUserRole('admin'); // ဒိုင်ချုပ် (ဝယ်သူ) အဖြစ် အသိအမှတ်ပြုသည်
                     loadData(session);
                     return;
                 } else {
                     setUserRole('denied'); // လိုင်စင်သက်တမ်းကုန်သွားပါက ဝင်ခွင့်ပိတ်မည်
                     return;
                 }
             }

             // ၂။ ဒိုင်ချုပ်မှ မဟုတ်လျှင်၊ ဒိုင်ချုပ်မှ ဖွင့်ပေးထားသော "အေးဂျင့်" ဟုတ်/မဟုတ် ဆက်စစ်မည်
             let hasAccess = false;
             const globalAgents = localStorage.getItem("twod_pro_v8_global_agents");
             if (globalAgents) {
                 try { 
                     const parsedAgents = JSON.parse(globalAgents); 
                     const matchedAgent = Object.values(parsedAgents).find(a => a.email && a.email.toLowerCase() === user.email.toLowerCase());
                     
                     if (matchedAgent && !matchedAgent.isBanned) {
                         let isNotExpired = true;
                         if (matchedAgent.expireDate) {
                             const today = new Date();
                             today.setHours(0, 0, 0, 0);
                             isNotExpired = new Date(matchedAgent.expireDate) >= today;
                         }
                         if (isNotExpired) {
                             hasAccess = true;
                         }
                     }
                 } catch(e) {}
             }

             if (hasAccess) {
                 setUserRole('agent'); // အေးဂျင့်အဖြစ် အသိအမှတ်ပြုသည်
                 loadData(session); 
             } else {
                 setUserRole('denied'); // မည်သူမှန်းမသိသော သူစိမ်းဖြစ်ပါသည်
             }

         } catch (error) {
             console.error("License Check Error:", error);
             setUserRole('denied');
         }
     };

     checkUserRoleAndLicense();
   }, [session, user]);
 
   const saveToStorage = (newData, newTotalNet, newLedgers, newHistory, newHistoryLog, newAgents, newSettings) => {
     // 1. Local Storage တွင် သိမ်းခြင်း (Offline အတွက်)
     setTimeout(() => {
         const payload = {
           data: newData, totalNet: newTotalNet, ledgers: newLedgers,
           history: newHistory, historyLog: newHistoryLog,
           agents: newAgents || agents, appSettings: newSettings || appSettings
         };
         const userKey = user ? user.uid + "_" : "guest_";
         localStorage.setItem("twod_pro_v8_" + userKey + session, JSON.stringify(payload));
         localStorage.setItem("twod_pro_v8_" + userKey + "global_agents", JSON.stringify(newAgents || agents));
     }, 0);

     // 2. Firebase Firestore တွင် Backup သိမ်းခြင်း (Real-time Sync)
     if (user) {
        const cloudPayload = {
           data: newData,
           totalNet: newTotalNet,
           ledgers: newLedgers,
           history: newHistory,       // 🌟 History များကိုပါ Cloud ပေါ်တင်မည်
           historyLog: newHistoryLog, // 🌟 History များကိုပါ Cloud ပေါ်တင်မည်
           agents: newAgents || agents,
           appSettings: newSettings || appSettings,
           lastUpdated: new Date().toISOString()
        };
        // 🌟 User ID ဖြင့် သီးသန့် လမ်းကြောင်း (Path) ခွဲပြီး သိမ်းမည် 🌟
        setDoc(doc(db, 'users', user.uid, 'sessions', session), cloudPayload, { merge: true })
          .catch(err => console.error("Firebase Sync Error: ", err));
     }
   };

// --- REAL-TIME CLOUD SYNC (Multi-Device) ---
   useEffect(() => {
     if (!user) return; // အကောင့်မဝင်ရသေးရင် အလုပ်မလုပ်ပါ

     // မိမိအကောင့်၊ မိမိ Session လမ်းကြောင်းကို အမြဲ နားစွင့်နေမည်
     const docRef = doc(db, 'users', user.uid, 'sessions', session);
     const unsubscribe = onSnapshot(docRef, (docSnap) => {
       if (docSnap.exists()) {
         const cloudData = docSnap.data();
         
         // 🌟 တခြားဖုန်းကနေ လှမ်းပြင်လိုက်ရင် App ထဲကို Auto Update လုပ်မည် 🌟
         if (cloudData.data) setData(cloudData.data);
         if (cloudData.totalNet !== undefined) setTotalNet(cloudData.totalNet);
         if (cloudData.ledgers) setLedgers(cloudData.ledgers);
         if (cloudData.agents) setAgents(cloudData.agents);
         if (cloudData.appSettings) setAppSettings(cloudData.appSettings);
         if (cloudData.history) setHistory(cloudData.history);
         if (cloudData.historyLog) setHistoryLog(cloudData.historyLog);
       }
     });

     return () => unsubscribe(); // ဖိုင်ပိတ်သွားရင် နားစွင့်တာကို ရပ်မည် (Performance မကျအောင်)
   }, [user, session]);
 
   // --- AGENT MANAGEMENT ---
   const handleAddOrEditAgent = () => {
     if (!newAgentName.trim()) { showConfirm(t('alert'), t('enter_agent_name'), null, true); return; }
     const id = editingAgentId || generateId();
     const newAgents = {
       ...agents,
       [id]: {
         id, name: newAgentName, comm: parseFloat(newAgentComm) || 0,
         limit: parseInt(newAgentLimit) || 0, type: newAgentType,
         order: editingAgentId ? agents[editingAgentId].order : Object.keys(agents).length
       }
     };
     setAgents(newAgents);
     setNewAgentName(''); setNewAgentComm(''); setNewAgentLimit(''); setEditingAgentId(null);
     setShowAgentForm(false);
     saveToStorage(data, totalNet, ledgers, history, historyLog, newAgents, appSettings);
     showConfirm(t('success'), '"' + newAgentName + '" ' + t('agent_added'), null, true);
   };
 
   const handleEditClick = (ag) => {
     setEditingAgentId(ag.id); setNewAgentName(ag.name); setNewAgentComm(ag.comm);
     setNewAgentLimit(ag.limit || ''); setNewAgentType(ag.type || 'agent'); setShowAgentForm(true);
   };
 
   const handleDeleteAgent = (id) => {
     if (id === 'default_self' || id === 'default_master') return;
     showConfirm(t('warning'), '"' + agents[id].name + '" ' + t('del_confirm'), () => {
       const newAgents = { ...agents }; delete newAgents[id];
       if(selectedAgentId === id) setSelectedAgentId('default_self');
       setAgents(newAgents);
       saveToStorage(data, totalNet, ledgers, history, historyLog, newAgents, appSettings);
       setShowAgentForm(false);
     });
   };
 
   const handleTxTypeChange = (type) => {
     setTxType(type);
     const validAgents = Object.values(agents).filter(a => type === 'in' ? a.type !== 'master' : a.type === 'master');
     if (validAgents.length > 0 && !validAgents.find(a => a.id === selectedAgentId)) {
         setSelectedAgentId(validAgents[0].id);
     }
   };
 
   // --- COMPREHENSIVE LOGIC PARSER ---
   const parseNumbers = (input) => {
     const ruleMap = {};
     if (appSettings.customRules) {
         appSettings.customRules.split('\n').forEach(line => {
            if(!line.includes('=') && !line.includes(',')) return;
            const parts = line.split(/[=,]/).map(s => s.trim().toLowerCase()).filter(Boolean);
            if(parts.length > 1) {
                let base = parts[0]; 
                parts.forEach(part => { if(part !== base) ruleMap[part] = base; });
            }
         });
     }
     
     let xStr = input;

     // 🌟 NEW: Multi-Digit Suffix/Prefix Expansion (ဥပမာ - "1နောက် 3 5" -> "1နောက်, 3နောက်, 5နောက်")
     xStr = xStr.replace(/(\d(?:[\s,]+\d)+)[\s,]*(ထိပ်|th|h|'|"|နောက်|ပိတ်|t)(?!\d)/gi, (m, d, s) => d.split(/[\s,]+/).filter(x=>x).map(x => x + s).join(','));
     xStr = xStr.replace(/(^|[^\d])(ထိပ်|th|h|'|"|နောက်|ပိတ်|t)[\s,]*(\d(?:[\s,]+\d)+)/gi, (m, pre, p, d) => pre + d.split(/[\s,]+/).filter(x=>x).map(x => x + p).join(','));
     xStr = xStr.replace(/(\d)(ထိပ်|th|h|'|"|နောက်|ပိတ်|t)[\s,]+(\d(?:[\s,]+\d)*)/gi, (m, f, s, r) => f + s + "," + r.split(/[\s,]+/).filter(x=>x).map(x => x + s).join(','));

     let result = [];
     xStr.split(",").forEach(raw => {
       let x = raw.trim().toLowerCase();
       if(!x) return;
 
       let standaloneResult = exactStandalone(x);
       if (standaloneResult) { result.push(...standaloneResult); return; }
 
       if(["big", "အကြီး", "ကြီး"].includes(x) || ruleMap[x] === 'big') { for(let i=50; i<=99; i++) result.push(i.toString()); return; }
       if(["small", "အသေး", "သေး"].includes(x) || ruleMap[x] === 'small') { for(let i=0; i<=49; i++) result.push(i.toString().padStart(2, "0")); return; }
       
       let mappedX = ruleMap[x] || x;
       let mappedResult = exactStandalone(mappedX);
       if (mappedResult) { result.push(...mappedResult); return; }

       // 🌟 NEW: နက္ခတ်၊ ပါဝါ၊ ပူး တွဲလျက် စာသားများကို ဖမ်းယူခြင်း
       let digits = mappedX.replace(/[^0-9]/g, "");
       let letters = mappedX.replace(/[0-9]/g, "");
       if (ruleMap[letters]) letters = ruleMap[letters];

       if (letters) {
           let combinedResult = [];
           if (letters.includes('နက္ခတ်') || letters.includes('နခတ်') || letters.includes('nk')) {
               combinedResult.push('07','70','18','81','24','42','35','53','69','96');
           }
           if (letters.includes('ပါဝါ') || letters.includes('pw') || letters.includes('power')) {
               combinedResult.push('05','50','16','61','27','72','38','83','49','94');
           }
           if (letters.includes('ပူး') || letters.includes('p') || letters.includes('pu') || letters.includes('poo') || letters.includes('double')) {
               combinedResult.push('00','11','22','33','44','55','66','77','88','99');
           }
           if (letters.includes('ညီအစ်ကို') || letters.includes('ညိအကို') || letters.includes('bro')) {
               combinedResult.push('01','10','12','21','23','32','34','43','45','54','56','65','67','76','78','87','89','98','90','09');
           }
           if (combinedResult.length > 0 && digits === "") {
               result.push(...new Set(combinedResult));
               return;
           }
       }
 
       if(/^[pn\.]{2}$/.test(mappedX)) {
           let r = exactStandalone(mappedX);
           if (r) { result.push(...r); return; }
       }
 
       if(/^\d{2}$/.test(x)){ result.push(x); return; }
 
       let headMatch = x.match(/^(\d)(ထိပ်|th|h|'|")$/) || x.match(/^(ထိပ်|th|h)(\d)$/);
       if(headMatch) { 
          let dMatch = x.match(/\d/)[0];
          for(let i=0;i<10;i++) result.push(dMatch+""+i); 
          return;
       }
 
       let tailMatch = x.match(/^(\d)(နောက်|ပိတ်|t)$/) || x.match(/^('|"|နောက်|ပိတ်|t)(\d)$/);
       if(tailMatch) { 
          let dMatch = x.match(/\d/)[0];
          for(let i=0;i<10;i++) result.push(i+""+dMatch); 
          return; 
       }
 
       if(x.includes("kw") || x.includes("ခွေ") || x.includes("kwe") || x.includes("ခပ") || ruleMap[x] === 'kw' || ruleMap[x] === 'kwp'){
         let plus = x.includes("kwp") || x.includes("ခွေပူး") || x.includes("ခပ") || ruleMap[x] === 'kwp';
         let digitsOnly = x.replace(/[^0-9]/g, ""); 
         let nums = [...new Set(digitsOnly.split(""))]; 
         if(nums.length > 0) {
             nums.forEach(a=>{ 
                 nums.forEach(b=>{ if(a!==b) result.push(a+b); }); 
                 if(plus) result.push(a+a); 
             });
         }
         return;
       }
       
       if(digits.length === 2 && ['r', '+', 'ပြန်', 'အပြန်'].includes(letters)) { 
           result.push(digits, digits[1]+digits[0]); 
           return; 
       }
 
       if(digits.length === 1 && ['p', 'ပါ', 'ပတ်လည်', 'r', '+', 'ပြန်', 'အပြန်'].includes(letters)) {
           for(let i=0;i<10;i++){ for(let j=0;j<10;j++){ let num = i+""+j;
           if(num.includes(digits)) result.push(num); } }
           return;
       }
 
       if(digits.length > 0 && ['b', 'br', 'break', 'breik', 'ဘရိတ်'].includes(letters)) {
           for(let char of digits) {
             let t = parseInt(char);
             for(let i=0;i<10;i++){ for(let j=0;j<10;j++){ if((i+j)%10===t) result.push(i+""+j); } }
           }
           return;
       }
     });
     return result; 
   };
 
   let safeHotStr = appSettings.hotNumbers ? preprocessInput(appSettings.hotNumbers.toLowerCase()) : '';
   safeHotStr = safeHotStr.replace(/[\s\-\=\*]+/g, ',');
   const hotNumbers = [...new Set(parseNumbers(safeHotStr))];
 
   // --- CORE ADDING LOGIC ---
   const applyTransaction = (currentData, currentTotalNet, currentLedgers, agentId, type, numsArray, price) => {
     let d = { ...currentData };
     let tNet = currentTotalNet;
     let l = { ...currentLedgers };
     if(!l[agentId]) l[agentId] = { in: 0, out: 0, commIn: 0, commOut: 0, data: {} };
     if(!l[agentId].data) l[agentId].data = {};
     const agent = agents[agentId] || agents['default_self'];
     const totalTxValue = numsArray.length * price;
     const commValue = (totalTxValue * (agent.comm || 0)) / 100;
     if (type === 'in') {
       l[agentId].in += totalTxValue;
       l[agentId].commIn += commValue;
       numsArray.forEach(n => { 
         d[n] += price; tNet += price; 
         l[agentId].data[n] = (l[agentId].data[n] || 0) + price;
       });
     } else {
       l[agentId].out += totalTxValue;
       l[agentId].commOut += commValue;
       numsArray.forEach(n => { 
         d[n] -= price; tNet -= price; 
         l[agentId].data[n] = (l[agentId].data[n] || 0) + price;
       });
     }
 
     return { newData: d, newTotalNet: tNet, newLedgers: l };
   };

   const getParsedEntries = () => {
     const sourceText = entryMode === 'manual' ? numbersText : inputText;
     if(!sourceText.trim()) return { count: 0, total: 0, nums: [], validEntries: [] };
 
     // 🌟 NEW: Multi-line Single Digit Merger (1နောက် \n 3 \n 5 ကို တစ်ကြောင်းတည်း ပေါင်းမည်)
     let rawLines = sourceText.split('\n').map(l => l.trim());
     let mergedLines = [];
     for (let line of rawLines) {
         if (/^\d$/.test(line) && mergedLines.length > 0) {
             mergedLines[mergedLines.length - 1] += ", " + line;
         } else {
             mergedLines.push(line);
         }
     }
     let lines = mergedLines.filter(l => l !== "");
     
     const globalPrice = parseInt(priceText) || 0;
     let totalCount = 0; let totalPrice = 0; let allNums = [];
     let validEntries = [];
     let pendingDangling = []; 
 
     lines.forEach(line => {
        let originalInput = line.trim();
        if (!originalInput) return;

        const burmeseNums = {'၀':'0','၁':'1','၂':'2','၃':'3','၄':'4','၅':'5','၆':'6','၇':'7','၈':'8','၉':'9'};
        let translatedInput = originalInput.replace(/[၀-၉]/g, m => burmeseNums[m]);
        
        while (/(\d)\s*ရ/.test(translatedInput)) translatedInput = translatedInput.replace(/(\d)\s*ရ/g, '$17');
        while (/ရ\s*(\d)/.test(translatedInput)) translatedInput = translatedInput.replace(/ရ\s*(\d)/g, '7$1');
        translatedInput = translatedInput.replace(/^ရ+$/, m => '7'.repeat(m.length));

        while (/(\d)\s*ဝ/.test(translatedInput)) translatedInput = translatedInput.replace(/(\d)\s*ဝ/g, '$10');
        while (/ဝ\s*(\d)/.test(translatedInput)) translatedInput = translatedInput.replace(/ဝ\s*(\d)/g, '0$1');
        translatedInput = translatedInput.replace(/^ဝ+$/, m => '0'.repeat(m.length));
        
        // 🌟 "အါ" (အားလုံး) ကို R အဖြစ် ပြောင်းလဲခြင်း
        translatedInput = translatedInput.replace(/အါ|အားလုံး|စုစုပေါင်း/g, ' r ');
        translatedInput = translatedInput.replace(/\./g, ',').trim(); 

        let str = normalizeText(translatedInput);
        if(!str) return;
        str = str.replace(/@/g, '=');
        str = preprocessInput(str);

        let multiplier = 1;
        if (/(k|k\s*)$/i.test(str)) multiplier = 1000;
        let cleanStr = str.replace(/(ks|mmk|မှတ်|ဖိုး|ကျပ်|လုံး|ကွက်|ပြား|ဆ)$/i, '').replace(/(\d)k$/i, '$1').trim();

        let price = 0;
        let hasGlobalR = false;
        let numsStr = cleanStr;

        // --- 🌟 (A) DUAL PRICE EXTRACTOR (12 54 2000 r 500) 🌟 ---
        const dualPriceRegex = /(?:[\s,]+)(\d+)(?:[\s,]*)([rRpP\+]|ပြန်|အပြန်)(?:[\s,]*)(\d+)$/i;
        const dualMatch = cleanStr.match(dualPriceRegex);

        if (dualMatch) {
            let sPrice = parseInt(dualMatch[1]) * multiplier;
            let rPrice = parseInt(dualMatch[3]) * multiplier;
            numsStr = cleanStr.substring(0, dualMatch.index);

            let processingStr = numsStr.replace(/[\s\-\=\*]+/g, ',');
            processingStr = processingStr.replace(/(\d)[rR](?=\d)/g, '$1,'); // Fix 62r65r67 -> 62, 65, 67
            let parsed = processingStr ? parseNumbers(processingStr) : [];

            if (parsed.length > 0) {
                totalCount += parsed.length;
                totalPrice += (parsed.length * sPrice);
                allNums.push(...parsed);
                validEntries.push({ originalInput, parsed: [...parsed], price: sPrice, processingStr });

                let reverses = parsed.filter(n => n.length===2 && n[0]!==n[1]).map(n => n[1]+n[0]);
                if (reverses.length > 0) {
                    totalCount += reverses.length;
                    totalPrice += (reverses.length * rPrice);
                    allNums.push(...reverses);
                    validEntries.push({ originalInput: originalInput + " (R)", parsed: reverses, price: rPrice, processingStr: reverses.join(',') });
                }
            }
            return; // ဤလိုင်းပြီးဆုံးပါပြီ
        }

        // --- 🌟 (B) SINGLE PRICE EXTRACTOR 🌟 ---
        const explicitPriceRegex = /(?:[\s,]*)([\=\*rRpP\+]|ပြန်|အပြန်)(?:[\s,]*)(\d+)$/i;
        const explicitMatch = cleanStr.match(explicitPriceRegex);

        if (explicitMatch) {
            price = parseInt(explicitMatch[2]) * multiplier;
            let indicator = explicitMatch[1];
            if (['r','p','+','ပြန်','အပြန်'].includes(indicator.toLowerCase())) {
                hasGlobalR = true;
            }
            numsStr = cleanStr.substring(0, explicitMatch.index);
        } else {
            const spacePriceRegex = /(?:[\s\-]+)(\d+)$/;
            const spaceMatch = cleanStr.match(spacePriceRegex);

            if (spaceMatch) {
                let potentialPrice = parseInt(spaceMatch[1]) * multiplier;
                if (potentialPrice > 99) {
                    price = potentialPrice;
                    numsStr = cleanStr.substring(0, spaceMatch.index);
                }
            } else {
                const attachedPriceRegex = /([^0-9\s]+)(\d{2,})$/i;
                const attachedMatch = cleanStr.match(attachedPriceRegex);
                if (attachedMatch) {
                    let potentialPrice = parseInt(attachedMatch[2]) * multiplier;
                    if (potentialPrice > 99) {
                        price = potentialPrice;
                        numsStr = cleanStr.substring(0, attachedMatch.index + attachedMatch[1].length);
                    }
                }
            }
        }

        if (price === 0 && entryMode === 'manual' && globalPrice > 0) {
            price = globalPrice;
            numsStr = cleanStr;
        }

        // 🌟 Dangling Price 🌟
        if (price === 0) {
            let possiblePrice = parseInt(numsStr.replace(/,/g, ''));
            if (!isNaN(possiblePrice) && possiblePrice > 99 && /^\d+$/.test(numsStr.replace(/,/g, ''))) {
                price = possiblePrice;
                numsStr = ""; 
            }
        }

        if (/(?:^|[\s,\-\=\*])(r|p|\+|ပြန်|အပြန်)$/i.test(numsStr)) {
            hasGlobalR = true;
            numsStr = numsStr.replace(/(?:^|[\s,\-\=\*])(r|p|\+|ပြန်|အပြန်)$/i, '');
        }

        let processingStr = numsStr.replace(/[\s\-\=\*]+/g, ',');
        processingStr = processingStr.replace(/(\d)[rR](?=\d)/g, '$1,'); // Fix 62r65r67
        let parsed = processingStr ? parseNumbers(processingStr) : [];

        if (hasGlobalR && parsed.length > 0) {
            let reversedAdditions = [];
            parsed.forEach(n => {
                if (n.length === 2 && n[0] !== n[1]) {
                    reversedAdditions.push(n[1] + n[0]);
                }
            });
            parsed = [...new Set([...parsed, ...reversedAdditions])]; 
        }

        // --- 🌟 စာရင်းသွင်းခြင်း (Commit) 🌟 ---
        if (price > 0) {
            if (pendingDangling.length > 0) {
                pendingDangling.forEach(pending => {
                    let finalPrice = price;
                    if (appSettings.splitR && pending.parsed.length === 2 && pending.hasR) {
                        finalPrice = price / 2;
                    }
                    totalCount += pending.parsed.length;
                    totalPrice += (pending.parsed.length * finalPrice);
                    validEntries.push({ 
                        originalInput: pending.originalInput, 
                        parsed: pending.parsed, 
                        price: finalPrice, 
                        processingStr: pending.processingStr 
                    });
                });
                pendingDangling = []; 
            }

            if (parsed.length > 0) {
                let finalPrice = price;
                if (appSettings.splitR && parsed.length === 2 && (hasGlobalR || processingStr.toLowerCase().includes('r') || processingStr.includes('+'))) {
                    finalPrice = price / 2;
                }
                totalCount += parsed.length;
                totalPrice += (parsed.length * finalPrice);
                allNums.push(...parsed); 
                validEntries.push({ originalInput, parsed, price: finalPrice, processingStr });
            }
        } else {
            if (parsed.length > 0) {
                pendingDangling.push({ 
                    originalInput: originalInput, 
                    parsed: parsed, 
                    processingStr: processingStr,
                    hasR: hasGlobalR || processingStr.toLowerCase().includes('r') || processingStr.includes('+')
                });
                allNums.push(...parsed); 
            }
        }
     });

     return { count: totalCount, total: totalPrice, nums: allNums, validEntries };
   };
 
   const getPreview = () => {
       const { count, total, nums } = getParsedEntries();
       return { count, total, nums };
   };
 
   // --- UNIFIED ADD HANDLER ---
   const handleUnifiedAdd = () => {
       const { validEntries } = getParsedEntries();
       
       if (validEntries.length === 0) {
         showConfirm(t('alert'), t('enter_valid'), null, true);
         return;
       }
 
       let willExceed = false;
       let dCheck = {...data}; 
       validEntries.forEach(entry => {
           if (txType === 'in') {
               entry.parsed.forEach(n => {
                   dCheck[n] = (dCheck[n] || 0) + entry.price;
                   if (dCheck[n] > appSettings.globalLimit) willExceed = true;
               });
           }
       });
 
       const executeAdd = () => {
           let d = {...data}; let tNet = totalNet; let l = {...ledgers};
           let currentLogEntries = [];
 
           validEntries.forEach(entry => {
               const result = applyTransaction(d, tNet, l, selectedAgentId, txType, entry.parsed, entry.price);
               d = result.newData; tNet = result.newTotalNet; l = result.newLedgers;
               let displayStr = appSettings.useComma ? entry.processingStr : entry.processingStr.replace(/,/g, ' ');
 
              currentLogEntries.push({
                 id: generateId(), 
                 time: getTime(), 
                 input: displayStr,
                 parsed: entry.parsed, 
                 price: entry.price, 
                 count: entry.parsed.length, 
                 type: txType, 
                 agentId: selectedAgentId
               });
           });
 
           const newHistory = [...history, JSON.stringify({data: d, totalNet: tNet, ledgers: l})].slice(-15);
           const newHistoryLog = [...currentLogEntries.reverse(), ...historyLog].slice(0, 100);
 
           setData(d); setTotalNet(tNet); setLedgers(l);
           setHistory(newHistory); setHistoryLog(newHistoryLog);
           
           if (entryMode === 'manual') { setNumbersText(''); setPriceText(''); setTimeout(() => document.getElementById('numbers-input')?.focus(), 10); } 
           else { setInputText(''); }
           
           saveToStorage(d, tNet, l, newHistory, newHistoryLog, agents, appSettings);
       };
 
       if (willExceed) {
           showConfirm(t('warning'), "သတိပြုရန် - သင်သွင်းလိုက်သော ဂဏန်းအချို့သည် သတ်မှတ် Limit (" + appSettings.globalLimit.toLocaleString() + ") ကို ကျော်လွန်သွားပါမည်။ ဆက်လက် စာရင်းသွင်းမည်မှာ သေချာပါသလား?", executeAdd);
       } else { executeAdd(); }
   };
 
   const handleDeleteHistoryItem = (logItem) => {
     showConfirm(t('warning'), t('delete_history_confirm'), () => {
         let d = {...data};
         let tNet = totalNet;
         let l = JSON.parse(JSON.stringify(ledgers));
         
         const agentId = logItem.agentId;
         const agent = agents[agentId] || agents['default_self'];
         const commPercent = agent.comm || 0;
         const totalTxValue = logItem.count * logItem.price;
         const commValue = (totalTxValue * commPercent) / 100;
 
         if (logItem.type === 'in') {
             if(l[agentId]) {
                 l[agentId].in -= totalTxValue;
                 l[agentId].commIn -= commValue;
             }
             logItem.parsed.forEach(n => {
                 d[n] -= logItem.price;
                 tNet -= logItem.price;
                 if(l[agentId] && l[agentId].data && l[agentId].data[n]) {
                     l[agentId].data[n] -= logItem.price;
                 }
             });
         } else {
             if(l[agentId]) {
                 l[agentId].out -= totalTxValue;
                 l[agentId].commOut -= commValue;
             }
             logItem.parsed.forEach(n => {
                 d[n] += logItem.price;
                 tNet += logItem.price;
                 if(l[agentId] && l[agentId].data && l[agentId].data[n]) {
                     l[agentId].data[n] -= logItem.price; 
                 }
             });
         }
 
         const newHistoryLog = historyLog.filter(h => h.id !== logItem.id);
         const newHistory = [...history, JSON.stringify({data: d, totalNet: tNet, ledgers: l})].slice(-15);
 
         setData(d); setTotalNet(tNet); setLedgers(l);
         setHistoryLog(newHistoryLog); setHistory(newHistory);
         saveToStorage(d, tNet, l, newHistory, newHistoryLog, agents, appSettings);
         showConfirm(t('success'), t('history_deleted'), null, true);
     });
   };
 
   const handleEditHistoryPrice = () => {
       if(!editHistoryModal || !editHistoryModal.newPrice || editHistoryModal.newPrice <= 0 || !editHistoryModal.newInput.trim()) {
           showConfirm(t('alert'), t('enter_valid'), null, true);
           return;
       }
       
       const oldLogItem = editHistoryModal;
       const oldPrice = oldLogItem.price;
       const newPrice = parseInt(editHistoryModal.newPrice);
       const oldInput = oldLogItem.input;
       const newInputStr = editHistoryModal.newInput.trim();
 
       let str = normalizeText(newInputStr);
       if(appSettings.useEqualAsPrice) str = str.replace(/@/g, '=');
       str = preprocessInput(str);
       let processingStr = str.replace(/[\s\-\=\*]+/g, ',');
       const newParsed = parseNumbers(processingStr);
 
       if (newParsed.length === 0) {
           showConfirm(t('alert'), "ဂဏန်းဖော်မတ် မှားယွင်းနေပါသည်။", null, true);
           return;
       }
 
       if(oldPrice === newPrice && oldInput === newInputStr) { 
           setEditHistoryModal(null); return; 
       }
 
       let d = {...data}; let tNet = totalNet; let l = JSON.parse(JSON.stringify(ledgers));
       const agentId = oldLogItem.agentId;
       const agent = agents[agentId] || agents['default_self'];
       const commPercent = agent.comm || 0;
 
       const oldTotalTx = oldLogItem.count * oldPrice;
       const oldComm = (oldTotalTx * commPercent) / 100;
 
       if (oldLogItem.type === 'in') {
           if(l[agentId]) { l[agentId].in -= oldTotalTx; l[agentId].commIn -= oldComm; }
           oldLogItem.parsed.forEach(n => {
               d[n] -= oldPrice; tNet -= oldPrice;
               if(l[agentId] && l[agentId].data && l[agentId].data[n]) { l[agentId].data[n] -= oldPrice; }
           });
       } else {
           if(l[agentId]) { l[agentId].out -= oldTotalTx; l[agentId].commOut -= oldComm; }
           oldLogItem.parsed.forEach(n => {
               d[n] += oldPrice; tNet += oldPrice;
               if(l[agentId] && l[agentId].data && l[agentId].data[n]) { l[agentId].data[n] -= oldPrice; }
           });
       }
 
       const newTotalTx = newParsed.length * newPrice;
       const newComm = (newTotalTx * commPercent) / 100;
 
       if (oldLogItem.type === 'in') {
           if(l[agentId]) { l[agentId].in += newTotalTx; l[agentId].commIn += newComm; }
           newParsed.forEach(n => {
               d[n] = (d[n] || 0) + newPrice; tNet += newPrice;
               if(l[agentId]) {
                   if(!l[agentId].data) l[agentId].data = {};
                   l[agentId].data[n] = (l[agentId].data[n] || 0) + newPrice;
               }
           });
       } else {
           if(l[agentId]) { l[agentId].out += newTotalTx; l[agentId].commOut += newComm; }
           newParsed.forEach(n => {
               d[n] = (d[n] || 0) - newPrice; tNet -= newPrice;
               if(l[agentId]) {
                   if(!l[agentId].data) l[agentId].data = {};
                   l[agentId].data[n] = (l[agentId].data[n] || 0) + newPrice;
               }
           });
       }
 
       const newHistoryLog = historyLog.map(h => h.id === oldLogItem.id ? {
           ...h, price: newPrice, input: newInputStr, parsed: newParsed, count: newParsed.length
       } : h);
       const newHistory = [...history, JSON.stringify({data: d, totalNet: tNet, ledgers: l})].slice(-15);
 
       setData(d); setTotalNet(tNet); setLedgers(l);
       setHistoryLog(newHistoryLog); setHistory(newHistory);
       saveToStorage(d, tNet, l, newHistory, newHistoryLog, agents, appSettings);
       
       setEditHistoryModal(null);
       showConfirm(t('success'), "ဂဏန်းနှင့် စျေးနှုန်း ပြင်ဆင်ပြီးပါပြီ။", null, true);
   };
 
   const handlePasteFromClipboard = async () => {
     try {
       const text = await navigator.clipboard.readText();
       if (entryMode === 'manual') {
         setNumbersText(prev => prev ? prev + ' ' + text : text);
       } else {
         setInputText(prev => prev ? prev + '\n' + text : text);
       }
     } catch (err) {
       showConfirm(t('alert'), t('clip_denied'), null, true);
     }
   };
 
   const moveAgent = (agentId, direction) => {
     let arr = Object.values(agents).sort((a,b) => (a.order || 0) - (b.order || 0));
     let idx = arr.findIndex(a => a.id === agentId);
     if(idx < 0) return;
     
     // ၂။ နေရာချင်း လဲလှယ်မည် (Loop စနစ် ထည့်သွင်းထားသည်)
     if (direction === 'up') {
        if (idx === 0) {
            // အပေါ်ဆုံးရောက်နေလျှင် အောက်ဆုံးသို့ ပြန်ပို့မည် (Loop)
            const item = arr.splice(idx, 1)[0];
            arr.push(item);
        } else {
            const temp = arr[idx];
            arr[idx] = arr[idx - 1];
            arr[idx - 1] = temp;
        }
     } else if (direction === 'down') {
        if (idx === arr.length - 1) {
            // အောက်ဆုံးရောက်နေလျှင် အပေါ်ဆုံးသို့ ပြန်ပို့မည် (Loop)
            const item = arr.splice(idx, 1)[0];
            arr.unshift(item);
        } else {
            const temp = arr[idx];
            arr[idx] = arr[idx + 1];
            arr[idx + 1] = temp;
        }
     }
 
     // ၃။ တန်းစီနံပါတ် (Order ID) များကို အသစ်ပြန်ပေးမည်
     const newAgents = {...agents};
     arr.forEach((a, newIndex) => { 
        newAgents[a.id] = {...a, order: newIndex}; 
     });
     
     setAgents(newAgents);
     saveToStorage(data, totalNet, ledgers, history, historyLog, newAgents, appSettings);
   };
 
   const showConfirm = (title, message, onConfirm, isAlert = false) => {
     setConfirmModal({ show: true, title, message, onConfirm, isAlert });
   };
 
   const executeConfirm = () => {
     if (confirmModal.onConfirm) confirmModal.onConfirm();
     setConfirmModal({ show: false, title: '', message: '', onConfirm: null, isAlert: false });
   };
 
   const handleClearAll = () => {
     showConfirm(t('warning'), t('del_all_conf'), () => {
       const newData = initialData();
       setData(newData); setTotalNet(0); setLedgers({}); setHistory([]); setHistoryLog([]);
       saveToStorage(newData, 0, {}, [], [], agents, appSettings);
     });
   };
   
   const handleResetSession = () => {
     showConfirm(t('warning'), t('reset_sess_conf'), () => {
       const newData = initialData();
       const newLedgers = {};
       Object.keys(agents).forEach(k => {
          newLedgers[k] = { in: 0, out: 0, commIn: 0, commOut: 0, data: {} };
       });
       setData(newData); setTotalNet(0); setLedgers(newLedgers); setHistory([]); setHistoryLog([]);
       saveToStorage(newData, 0, newLedgers, [], [], agents, appSettings);
       showConfirm(t('success'), t('session_cleared'), null, true);
     });
   };
 
   const handleUndo = () => {
     if(!history.length) return;
     let last = JSON.parse(history[history.length - 1]);
     const newHistory = history.slice(0, -1);
     setData(last.data); setTotalNet(last.totalNet); setLedgers(last.ledgers || {});
     setHistory(newHistory);
     const newHistoryLog = historyLog.slice(1);
     setHistoryLog(newHistoryLog);
     saveToStorage(last.data, last.totalNet, last.ledgers || {}, newHistory, newHistoryLog, agents, appSettings);
   };
 
   const handleQuickOutClick = useCallback((n, ex) => {
       const defaultMaster = Object.values(agents).find(a => a.type === 'master')?.id || '';
       setQuickOutModal({ num: n, ex: ex, price: ex, masterId: defaultMaster });
   }, [agents]);
 
   const submitQuickOut = () => {
     if(!quickOutModal || !quickOutModal.price || quickOutModal.price <= 0) { showConfirm(t('alert'), t('enter_valid'), null, true); return; }
     if(!quickOutModal.masterId) { showConfirm(t('alert'), t('no_master_yet'), null, true); return; }
 
     const parsed = [quickOutModal.num]; 
     let d = {...data}; let tNet = totalNet; let l = {...ledgers};
     const result = applyTransaction(d, tNet, l, quickOutModal.masterId, 'out', parsed, parseInt(quickOutModal.price));
 
     const logEntry = {
       id: generateId(),
       time: getTime(), input: quickOutModal.num, 
       parsed: parsed,
       price: parseInt(quickOutModal.price),
       count: 1, type: 'out', agentId: quickOutModal.masterId
     };
 
     const newHistory = [...history, JSON.stringify({data: result.newData, totalNet: result.newTotalNet, ledgers: result.newLedgers})].slice(-15);
     const newHistoryLog = [logEntry, ...historyLog].slice(0, 100);
 
     setData(result.newData); setTotalNet(result.newTotalNet); setLedgers(result.newLedgers);
     setHistory(newHistory); setHistoryLog(newHistoryLog);
     saveToStorage(result.newData, result.newTotalNet, result.newLedgers, newHistory, newHistoryLog, agents, appSettings);
 
     setQuickOutModal(null);
     showConfirm(t('success'), "ဂဏန်း " + quickOutModal.num + " ကို ဒိုင်တင်ပြီးပါပြီ။", null, true);
   };
 
   const submitBulkOut = () => {
     if(!bulkOutModal || !bulkOutModal.masterId) { showConfirm(t('alert'), t('no_master_yet'), null, true); return; }
     if(!bulkOutModal.items || bulkOutModal.items.length === 0) return;
 
     let d = {...data}; let tNet = totalNet; let l = JSON.parse(JSON.stringify(ledgers)); 
     let currentLogEntries = [];
     const agentId = bulkOutModal.masterId;
     const agent = agents[agentId] || agents['default_self'];
 
     if(!l[agentId]) l[agentId] = { in: 0, out: 0, commIn: 0, commOut: 0, data: {} };
     if(!l[agentId].data) l[agentId].data = {};
 
     let totalBulkItems = 0;
 
     bulkOutModal.items.forEach(item => {
         if (!item.selected) return; 
         let num = item.num; let price = parseInt(item.outAmount); 
         if (isNaN(price) || price <= 0) return;
 
         const commValue = (price * (agent.comm || 0)) / 100;
         l[agentId].out += price; l[agentId].commOut += commValue;
         d[num] -= price; tNet -= price;
         l[agentId].data[num] = (l[agentId].data[num] || 0) + price;
         
         totalBulkItems++;
         currentLogEntries.push({ 
           id: generateId(),
           time: getTime(), input: num, 
           parsed: [num],
           price: price, count: 1, type: 'out', agentId: agentId 
         });
     });
 
     if (totalBulkItems === 0) { setBulkOutModal(null); return; }
 
     const newHistory = [...history, JSON.stringify({data: d, totalNet: tNet, ledgers: l})].slice(-15);
     const newHistoryLog = [...currentLogEntries, ...historyLog].slice(0, 100);
 
     setData(d); setTotalNet(tNet); setLedgers(l);
     setHistory(newHistory); setHistoryLog(newHistoryLog);
     saveToStorage(d, tNet, l, newHistory, newHistoryLog, agents, appSettings);
 
     setBulkOutModal(null);
     showConfirm(t('success'), "ရွေးချယ်ထားသော (" + totalBulkItems + ") ကွက်ကို ဒိုင်တင်ပြီးပါပြီ။", null, true);
   };
 
   const handleOpenBulkOut = () => {
       const risks = getAllRisks();
       if(risks.length === 0) { showConfirm(t('alert'), "ကျော်သော ဂဏန်းမရှိပါ။", null, true); return; }
       const defaultMaster = Object.values(agents).find(a => a.type === 'master')?.id || '';
       const items = risks.map(r => ({ ...r, selected: true, outAmount: r.ex }));
       setBulkOutModal({ items, masterId: defaultMaster });
   };
 
   const handleResetExcess = () => {
       if(!bulkOutModal) return;
       const newItems = bulkOutModal.items.map(i => ({...i, outAmount: i.ex}));
       setBulkOutModal({...bulkOutModal, items: newItems});
   };
 
   const getColor = (value) => {
     if(value === 0) return "var(--text-muted)"; 
     if(value < 0) return "#3b82f6"; 
     let ratio = value / appSettings.globalLimit;
     if(value > appSettings.globalLimit) return "#ef4444"; 
     if(ratio < 0.2) return "var(--text-main)";
     if(ratio < 0.4) return "#10b981";
     if(ratio < 0.6) return "#f59e0b";
     if(ratio < 0.8) return "#ea580c";
     return "#ef4444";
   };
 
   const getAllRisks = () => {
     let arr = [];
     for(let n in data){
       let val = data[n];
       let ex = val > appSettings.globalLimit ? val - appSettings.globalLimit : 0;
       if(ex > 0) arr.push({num:n, ex});
     }
     return arr.sort((a,b) => b.ex - a.ex);
   };
 
   let totalExceed = 0;
   for(let n in data){
     let ex = data[n] > appSettings.globalLimit ? data[n] - appSettings.globalLimit : 0;
     if(ex) totalExceed += ex;
   }
 
   const getFilteredLimits = () => {
     let arr = Object.entries(data).map(([num, val]) => ({num, val}));
     if (limitFilter === 'over') arr = arr.filter(i => i.val > appSettings.globalLimit);
     else if (limitFilter === 'warn') arr = arr.filter(i => i.val >= appSettings.globalLimit * 0.8);
     if (limitFilter === 'seq') arr.sort((a,b) => parseInt(a.num) - parseInt(b.num));
     else if (limitFilter === 'asc') arr.sort((a,b) => a.val - b.val);
     else arr.sort((a,b) => b.val - a.val); 
     return arr;
   };
 
   const toggleSetting = (key) => {
     const newSettings = { ...appSettings, [key]: !appSettings[key] };
     setAppSettings(newSettings);
     saveToStorage(data, totalNet, ledgers, history, historyLog, agents, newSettings);
   };
 
   // --- RENDER ---
if (userRole === 'denied') {
       return (
           <div className={"app-wrapper " + theme + "-mode"} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px', textAlign: 'center'}}>
               <div style={{fontSize: '60px', marginBottom: '16px', filter: 'drop-shadow(0 4px 10px rgba(239, 68, 68, 0.4))'}}>🚫</div>
               <h2 style={{color: '#ef4444', fontSize: '24px', marginBottom: '8px'}}>ဝင်ရောက်ခွင့် ပိတ်ပင်ထားပါသည်</h2>
               <p style={{color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '400px', fontSize: '15px'}}>
                   သင့်အကောင့်သည် Admin မှ ခွင့်ပြုထားသော အကောင့်မဟုတ်ပါ (သို့မဟုတ်) သက်တမ်းကုန်ဆုံးသွားပါပြီ။
               </p>
               <button 
                  onClick={() => auth.signOut()} 
                  className="btn btn-red" 
                  style={{marginTop: '24px', maxWidth: '200px', padding: '14px', borderRadius: '12px'}}
               >
                   ထွက်မည် (Log Out)
               </button>
           </div>
       );
   }
   return (
     <div className={"app-wrapper " + theme + "-mode"}>
       <div className="app">
         <div className="page-transition" key={activeTab}>
           {/* =========================================
               TAB 0: DASHBOARD (Imported)
           ========================================= */}
           {activeTab === 'dashboard' && (
             <Dashboard 
                t={t} toggleLang={toggleLang} toggleTheme={toggleTheme} lang={lang} theme={theme} 
                setShowHelp={setShowHelp} setActiveTab={setActiveTab} showConfirm={showConfirm} 
                user={user} appSettings={appSettings} userRole={userRole}
             />
           )}
 
           {/* HEADER STATS */}
           {['home', 'grid', 'history', 'ledger', 'payout'].includes(activeTab) && (() => {
             let headerTotalIn = 0;
             let headerTotalOut = 0;
             Object.values(ledgers).forEach(stats => {
                 headerTotalIn += (stats.in || 0);
                 headerTotalOut += (stats.out || 0);
             });
             return (
             <div className="card" style={{padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: '12px', borderRadius: '12px'}}>
               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px'}}>
                 <div>
                   <div style={{color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{t('net_cash_in_hand')}</div>
                   <div style={{fontSize: '22px', fontWeight: '900', color: totalNet < 0 ? '#ef4444' : (totalNet > 0 ? '#10b981' : 'var(--text-muted)'), lineHeight: '1'}}>{totalNet.toLocaleString()}</div>
                 </div>
                 <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                    <button onClick={exportToPDF} style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold'}}>
                      <span style={{fontSize: '11px'}}>📊 {t('export_pdf')}</span>
                    </button>
 
                    <select 
                      value={session} 
                      onChange={(e)=>setSession(e.target.value)}
                      style={{padding: '4px 6px', width: 'auto', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '11px', fontWeight: 'bold', outline: 'none'}}
                    >
                      <option value="morning">🌅 {t('morning')}</option>
                      <option value="evening">🌙 {t('evening')}</option>
                    </select>
                    
                    <button onClick={handleResetSession} style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                      <span style={{fontSize: '11px'}}>🔄 {t('end_session')}</span>
                    </button>
                 </div>
               </div>
               
               <div style={{display: 'flex', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '8px'}}>
                  <div style={{flex: 1}}>
                     <div style={{fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 'bold'}}>Total IN</div>
                     <div style={{fontSize: '13px', fontWeight: '800', color: '#10b981'}}>{headerTotalIn.toLocaleString()}</div>
                  </div>
                  <div style={{width: '1px', background: 'var(--border)', opacity: 0.6}}></div>
                  <div style={{flex: 1}}>
                     <div style={{fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 'bold'}}>Total OUT</div>
                     <div style={{fontSize: '13px', fontWeight: '800', color: '#ef4444'}}>{headerTotalOut.toLocaleString()}</div>
                  </div>
                  <div style={{width: '1px', background: 'var(--border)', opacity: 0.6}}></div>
                  <div style={{flex: 1}}>
                     <div style={{fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 'bold'}}>{t('over_limit').replace(':','')}</div>
                     <div style={{fontSize: '13px', fontWeight: '800', color: '#f59e0b'}}>{totalExceed.toLocaleString()}</div>
                  </div>
               </div>
             </div>
             );
           })()}
 
           {/* =========================================
               TAB 1: HOME (Entry Tab Imported)
           ========================================= */}
           {activeTab === 'home' && (
             <EntryTab 
               t={t} appSettings={appSettings} setAppSettings={setAppSettings}
               agents={agents} selectedAgentId={selectedAgentId} setSelectedAgentId={setSelectedAgentId}
               entryMode={entryMode} setEntryMode={setEntryMode} txType={txType} handleTxTypeChange={handleTxTypeChange}
               numbersText={numbersText} setNumbersText={setNumbersText} priceText={priceText} setPriceText={setPriceText}
               priceInputRef={priceInputRef} inputText={inputText} setInputText={setInputText}
               handlePasteFromClipboard={handlePasteFromClipboard} preview={getPreview()} handleUnifiedAdd={handleUnifiedAdd}
             />
           )}
 
           {/* =========================================
               TAB 2: GRID (Imported)
           ========================================= */}
           {activeTab === 'grid' && (
             <GridTab 
               t={t} appSettings={appSettings} setAppSettings={setAppSettings}
               data={data} agents={agents} hotNumbers={hotNumbers}
               handleOpenBulkOut={handleOpenBulkOut} getAllRisks={getAllRisks}
               handleQuickOutClick={handleQuickOutClick} setQuickOutModal={setQuickOutModal}
               onSaveSettings={(newSet) => saveToStorage(data, totalNet, ledgers, history, historyLog, agents, newSet || appSettings)}
             />
           )}
 
           {/* =========================================
          TAB 3: HISTORY (Imported)
      ========================================= */}
      {activeTab === 'history' && (
        <HistoryTab 
          t={t} agents={agents} historyLog={historyLog} 
          historyFilter={historyFilter} setHistoryFilter={setHistoryFilter} 
          setHistoryLog={setHistoryLog} saveToStorage={saveToStorage} 
          data={data} totalNet={totalNet} ledgers={ledgers} history={history} appSettings={appSettings}
          showConfirm={showConfirm} handleDeleteHistoryItem={handleDeleteHistoryItem} 
          setEditHistoryModal={setEditHistoryModal}
        />
      )}
 
           {/* =========================================
               TAB 4: LEDGER (Imported)
           ========================================= */}
           {activeTab === 'ledger' && (
             <LedgerTab 
               t={t} ledgers={ledgers} agents={agents} 
               winNumber={winNumber} setWinNumber={setWinNumber} 
               appSettings={appSettings} setActiveTab={setActiveTab} 
               ledgerFilter={ledgerFilter} setLedgerFilter={setLedgerFilter}
               setNewAgentName={setNewAgentName} setNewAgentComm={setNewAgentComm} 
               setNewAgentLimit={setNewAgentLimit} setNewAgentType={setNewAgentType} 
               setEditingAgentId={setEditingAgentId} setShowAgentForm={setShowAgentForm} 
               moveAgent={moveAgent} handleEditClick={handleEditClick} setAgentDetailModal={setAgentDetailModal}
             />
           )}
 
           {/* =========================================
          TAB 5: PAYOUT (Imported)
      ========================================= */}
      {activeTab === 'payout' && (
        <PayoutTab 
          t={t} theme={theme} appSettings={appSettings} winNumber={winNumber} 
          setWinNumber={setWinNumber} ledgers={ledgers} agents={agents} setActiveTab={setActiveTab}
        />
      )}
 
          {/* =========================================
               TAB: SETTINGS (Imported)
           ========================================= */}
           {activeTab === 'settings' && (
             <SettingsTab 
                t={t} appSettings={appSettings} setAppSettings={setAppSettings} setActiveTab={setActiveTab}
                handleResetSession={handleResetSession} handleClearAll={handleClearAll} toggleSetting={toggleSetting}
                onSaveSettings={() => saveToStorage(data, totalNet, ledgers, history, historyLog, agents, appSettings)}
             />
           )}

           {/* =========================================
               TAB: ADMIN PANEL
           ========================================= */}
           {activeTab === 'admin' && (
             <AdminTab 
               t={t} agents={agents} setAgents={setAgents} setActiveTab={setActiveTab} showConfirm={showConfirm}
               saveToStorage={saveToStorage} data={data} totalNet={totalNet} ledgers={ledgers} history={history} 
               historyLog={historyLog} appSettings={appSettings}
             />
           )}
 
           {/* =========================================
               TAB 6: LIMITS & RISKS (Imported)
           ========================================= */}
           {activeTab === 'limits' && (
             <LimitsTab 
               t={t} appSettings={appSettings} data={data} agents={agents} 
               hotNumbers={hotNumbers} limitFilter={limitFilter} setLimitFilter={setLimitFilter}
               setBulkOutModal={setBulkOutModal} setQuickOutModal={setQuickOutModal} 
               getFilteredLimits={getFilteredLimits}
             />
           )}
 
         </div>
 
 {/* =========================================
               BOTTOM NAV BAR
           ========================================= */}
           <BottomNav 
              activeTab={activeTab} setActiveTab={setActiveTab} 
              setLedgerFilter={setLedgerFilter} t={t} userRole={userRole} 
           />
 
         {/* =========================================
             ALL MODALS & POPUPS (Imported)
         ========================================= */}
         <HelpModal showHelp={showHelp} setShowHelp={setShowHelp} t={t} />
         
         <AllModals 
            t={t} agents={agents} appSettings={appSettings} ledgers={ledgers} historyLog={historyLog} winNumber={winNumber}
            showAgentForm={showAgentForm} setShowAgentForm={setShowAgentForm} editingAgentId={editingAgentId} setEditingAgentId={setEditingAgentId}
            newAgentType={newAgentType} setNewAgentType={setNewAgentType} newAgentName={newAgentName} setNewAgentName={setNewAgentName}
            newAgentComm={newAgentComm} setNewAgentComm={setNewAgentComm} newAgentLimit={newAgentLimit} setNewAgentLimit={setNewAgentLimit}
            handleAddOrEditAgent={handleAddOrEditAgent} handleDeleteAgent={handleDeleteAgent}
            quickOutModal={quickOutModal} setQuickOutModal={setQuickOutModal} submitQuickOut={submitQuickOut}
            bulkOutModal={bulkOutModal} setBulkOutModal={setBulkOutModal} handleResetExcess={handleResetExcess} submitBulkOut={submitBulkOut}
            editHistoryModal={editHistoryModal} setEditHistoryModal={setEditHistoryModal} handleEditHistoryPrice={handleEditHistoryPrice}
            confirmModal={confirmModal} setConfirmModal={setConfirmModal} executeConfirm={executeConfirm}
            agentDetailModal={agentDetailModal} setAgentDetailModal={setAgentDetailModal} agentDetailTab={agentDetailTab} setAgentDetailTab={setAgentDetailTab}
            handleDeleteHistoryItem={handleDeleteHistoryItem} moveAgent={moveAgent} handleEditClick={handleEditClick}
         />
 
       </div>
     </div>
   );
};