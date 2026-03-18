// Run: FMP_API_KEY=your_key node test_tickers.mjs
// Tests every ticker against FMP and prints which ones 403.

const FMP_KEY = process.env.FMP_API_KEY;
if (!FMP_KEY) { console.error("Set FMP_API_KEY env var"); process.exit(1); }

const TICKERS = [
  "RY.TO","TD.TO","BNS.TO","BMO.TO","CM.TO","MFC.TO","SLF.TO","GWO.TO","FFH.TO","BAM.TO",
  "SHOP.TO","CSU.TO","DSG.TO","ENGH.TO","CDAY.TO",
  "CNR.TO","WCN.TO","TIH.TO","MG.TO","LNR.TO","L.TO",
  "ABX.TO","AEM.TO","K.TO","H.TO","NPI.TO",
  "ATD.TO","MRU.TO","SAP.TO","DOL.TO","GIL.TO","MTY.TO","DOO.TO",
  "WSP.TO","SNC.TO","CAE.TO","BBD.TO","GIB.TO","LSPD.TO",
  "IFC.TO","POW.TO","LB.TO","BCE.TO","QBR.TO","CCA.TO","BLX.TO","INE.TO","CAS.TO",
  "T.TO","TIXT.TO","WELL.TO","FM.TO","CS.TO","LUG.TO","IVN.TO","MX.TO",
  "WFG.TO","IFP.TO","CFP.TO","FTT.TO","PBH.TO",
  "SU.TO","ENB.TO","TRP.TO","CNQ.TO","CVE.TO","IMO.TO","PPL.TO","ARC.TO","TVE.TO",
  "CP.TO","STN.TO","ALA.TO","CU.TO","TA.TO","CPX.TO","ACO.TO","CWB.TO",
  "NTR.TO","CCO.TO",
  "IGM.TO","BYD.TO","NWC.TO","NFI.TO",
  "EMP.TO","EMA.TO",
  "FTS.TO",
];

async function check(symbol) {
  const url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=1&apikey=${FMP_KEY}`;
  try {
    const r = await fetch(url);
    return { symbol, status: r.status, ok: r.ok };
  } catch (e) {
    return { symbol, status: "ERR", ok: false };
  }
}

// Batch 5 at a time to avoid rate limiting
const results = [];
for (let i = 0; i < TICKERS.length; i += 5) {
  const batch = TICKERS.slice(i, i + 5);
  const res = await Promise.all(batch.map(check));
  results.push(...res);
  process.stdout.write(`\rChecked ${Math.min(i + 5, TICKERS.length)}/${TICKERS.length}...`);
  await new Promise(r => setTimeout(r, 300)); // small delay between batches
}

console.log("\n\n✅ WORKS:");
results.filter(r => r.ok).forEach(r => console.log(`  ${r.symbol}`));

console.log("\n❌ FAILS (remove these):");
results.filter(r => !r.ok).forEach(r => console.log(`  ${r.symbol}  [${r.status}]`));
