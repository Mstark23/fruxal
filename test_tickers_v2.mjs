// Run: $env:FMP_API_KEY="yourkey"; node test_tickers_v2.mjs
const FMP_KEY = process.env.FMP_API_KEY;
if (!FMP_KEY) { console.error("Set FMP_API_KEY env var"); process.exit(1); }

const TICKERS = [
  "RY.TO","TD.TO","BNS.TO","BMO.TO","CM.TO","MFC.TO","SLF.TO","GWO.TO","FFH.TO","BAM.TO",
  "SHOP.TO","CSU.TO","DSG.TO","ENGH.TO",
  "CNR.TO","WCN.TO","TIH.TO","MG.TO","LNR.TO","L.TO",
  "ABX.TO","AEM.TO","K.TO","H.TO","NPI.TO",
  "ATD.TO","MRU.TO","SAP.TO","DOL.TO","GIL.TO","MTY.TO","DOO.TO",
  "WSP.TO","SNC.TO","CAE.TO",
  "IFC.TO","POW.TO","LB.TO","BCE.TO","BLX.TO","INE.TO","CAS.TO",
  "T.TO","TIXT.TO","WELL.TO","FM.TO","CS.TO","LUG.TO","IVN.TO","MX.TO",
  "WFG.TO","IFP.TO","CFP.TO","FTT.TO","PBH.TO",
  "SU.TO","ENB.TO","TRP.TO","CNQ.TO","CVE.TO","IMO.TO","PPL.TO","TVE.TO",
  "CP.TO","STN.TO","ALA.TO","CU.TO","TA.TO","CPX.TO","CWB.TO",
  "NTR.TO","CCO.TO",
  "IGM.TO","BYD.TO","NWC.TO","NFI.TO",
  "EMA.TO","FTS.TO",
];

async function check(symbol) {
  const url = `https://financialmodelingprep.com/stable/income-statement?symbol=${symbol}&limit=1&apikey=${FMP_KEY}`;
  try {
    const r = await fetch(url);
    if (!r.ok) return { symbol, status: r.status, ok: false };
    const data = await r.json();
    return { symbol, status: r.status, ok: Array.isArray(data) && data.length > 0 };
  } catch (e) {
    return { symbol, status: "ERR", ok: false };
  }
}

const results = [];
for (let i = 0; i < TICKERS.length; i += 5) {
  const batch = TICKERS.slice(i, i + 5);
  const res = await Promise.all(batch.map(check));
  results.push(...res);
  process.stdout.write(`\rChecked ${Math.min(i + 5, TICKERS.length)}/${TICKERS.length}...`);
  await new Promise(r => setTimeout(r, 300));
}

console.log(`\n\n✅ WORKS (${results.filter(r=>r.ok).length}):`);
results.filter(r => r.ok).forEach(r => console.log(`  ${r.symbol}`));
console.log(`\n❌ FAILS (${results.filter(r=>!r.ok).length}):`);
results.filter(r => !r.ok).forEach(r => console.log(`  ${r.symbol}  [${r.status}]`));
