// src/utils/helpers.tsx
export const getTime = () => {
    let d = new Date();
    let ampm = d.getHours() >= 12 ? 'PM' : 'AM';
    let hr = d.getHours() % 12 || 12;
    return hr.toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0") + " " + ampm;
  };
  
  export const generateId = () => Math.random().toString(36).substr(2, 9);
  export const formatEx = (ex) => {
    if (ex >= 10000) return (ex / 1000).toFixed(0) + 'K';
    if (ex >= 1000) return (ex / 1000).toFixed(1).replace('.0', '') + 'K';
    return ex;
  };
  
  export const formatPrice = (val) => {
    if (val === 0) return '-';
    if (val >= 1000) return (val / 1000).toFixed(1).replace('.0', '') + 'K';
    return val.toString();
  };
  
  export const normalizeText = (str) => {
    if (!str) return '';
    const myanmarNums = ['၀','၁','၂','၃','၄','၅','၆','၇','၈','၉'];
    let result = str.toLowerCase();
    myanmarNums.forEach((n, i) => {
        result = result.split(n).join(i.toString());
    });
    result = result.replace(/[\u200B-\u200D\uFEFF]/g, '');
    return result;
  };
  
  export const preprocessInput = (str) => {
    let cleanStr = str;
    const prefixes = ['kwp', 'kw', 'kwe', 'khwe', 'ခွေပူး', 'ခပ', 'ခွေ', 'b', 'br', 'breik', 'break', 'ဘရိတ်', 'p', 'ပါ', 'ပတ်လည်', 'th', 'ထိပ်', 'h', 't', 'နောက်', 'ပိတ်'];
    const suffixes = ['r', 'ပြန်', 'အပြန်', 'b', 'br', 'breik', 'break', 'ဘရိတ်', 'p', 'ပါ', 'ပတ်လည်', 'th', 'ထိပ်', 'h', 't', 'နောက်', 'ပိတ်'];
    
    prefixes.forEach(p => {
        let safePrefix = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleanStr = cleanStr.replace(new RegExp("(^|[\\s,])(" + safePrefix + ")[\\s\\-\\=\\*]+(\\d+)", "gi"), '$1$2$3');
    });
    suffixes.forEach(s => {
        let safeSuffix = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleanStr = cleanStr.replace(new RegExp("(\\d+)[\\s\\-\\=\\*]+(" + safeSuffix + ")(?=[\\s,]|$)", "gi"), '$1$2');
    });
    return cleanStr;
  };
  
  export const exactStandalone = (val) => {
      if(["po", "pw", "ပါဝါ", "ပါဝ", "ပဝါ"].includes(val)) return ["05","16","27","38","49"].flatMap(p=>[p, p[1]+p[0]]);
      if(["nk", "နက္ခတ်", "နတ်က္ခတ်", "နက္ခ", "နက", "နကတ"].includes(val)) return ["07","18","24","35","69"].flatMap(p=>[p, p[1]+p[0]]);
      if(["eq", "ပူး", "တူ", "ညီ", "အပူး"].includes(val)) return Array.from({length:10}, (_,i)=>i+""+i);
      if(val === "peq") return ["00", "22", "44", "66", "88"];
      if(val === "neq") return ["11", "33", "55", "77", "99"];
  
      if(["p'", 'p"', "pt", "pth"].includes(val)) return ["0","2","4","6","8"].flatMap(h => Array.from({length:10}, (_,i)=> h+i));
      if(["n'", 'n"', "nt", "nth"].includes(val)) return ["1","3","5","7","9"].flatMap(h => Array.from({length:10}, (_,i)=> h+i));
      
      if(["'p", '"p', "pnh"].includes(val)) return ["0","2","4","6","8"].flatMap(t => Array.from({length:10}, (_,i)=> i+t));
      if(["'n", '"n', "nnh"].includes(val)) return ["1","3","5","7","9"].flatMap(t => Array.from({length:10}, (_,i)=> i+t));
  
      if(val === "bro" || ["ညီအစ်ကို","ညီကို","ညီအကို","ညက","ညအက"].includes(val)) {
          let res = [];
          for(let i=0;i<10;i++) for(let j=0;j<10;j++) if(Math.abs(i-j)===1 || (i===0&&j===9) || (i===9&&j===0)) res.push(i+""+j);
          return res;
      }
     
      if(/^[pn\.]{2}$/.test(val)) {
          let res = [];
          for(let i=0;i<10;i++){
              for(let j=0;j<10;j++){
                  let ok = true;
                  if(val[0] === "p" && i%2!==0) ok=false;
                  if(val[0] === "n" && i%2===0) ok=false;
                  if(val[1] === "p" && j%2!==0) ok=false;
                  if(val[1] === "n" && j%2===0) ok=false;
                  if(ok) res.push(i+""+j);
              }
          }
          return res;
      }
      return null;
  };