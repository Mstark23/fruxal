// app/api/v2/diagnostic/public-company/list/route.ts
// GET ?province=QC&range=1B-5B
// Static curated list — plain .TO tickers only (no -UN, -A, -B suffixes).
// No runtime FMP validation — fast, no rate limits.

import { NextRequest, NextResponse } from "next/server";

const RANGE_MAP: Record<string, { min: number; max: number }> = {
  "250M-1B":  { min: 250_000_000,    max: 1_000_000_000  },
  "1B-5B":    { min: 1_000_000_000,  max: 5_000_000_000  },
  "5B-25B":   { min: 5_000_000_000,  max: 25_000_000_000 },
  "25B+":     { min: 25_000_000_000, max: 999_000_000_000 },
};

interface TSXCompany {
  symbol: string; name: string; province: string;
  marketCap: number; sector: string; industry: string;
}

// Plain .TO tickers only — FMP handles these on standard plans.
// REITs (-UN.TO), dual-class (-A.TO / -B.TO) excluded — FMP 403s on those.
const TSX_COMPANIES: TSXCompany[] = [
  // ── ONTARIO — Financial ───────────────────────────────────────────────────
  { symbol: "RY.TO",   name: "Royal Bank of Canada",        province: "ON", marketCap: 185_000_000_000, sector: "Financial Services", industry: "Banking" },
  { symbol: "TD.TO",   name: "Toronto-Dominion Bank",       province: "ON", marketCap: 130_000_000_000, sector: "Financial Services", industry: "Banking" },
  { symbol: "BNS.TO",  name: "Bank of Nova Scotia",         province: "ON", marketCap: 75_000_000_000,  sector: "Financial Services", industry: "Banking" },
  { symbol: "BMO.TO",  name: "Bank of Montreal",            province: "ON", marketCap: 85_000_000_000,  sector: "Financial Services", industry: "Banking" },
  { symbol: "CM.TO",   name: "CIBC",                        province: "ON", marketCap: 65_000_000_000,  sector: "Financial Services", industry: "Banking" },
  { symbol: "MFC.TO",  name: "Manulife Financial",          province: "ON", marketCap: 58_000_000_000,  sector: "Financial Services", industry: "Insurance" },
  { symbol: "SLF.TO",  name: "Sun Life Financial",          province: "ON", marketCap: 40_000_000_000,  sector: "Financial Services", industry: "Insurance" },
  { symbol: "GWO.TO",  name: "Great-West Lifeco",           province: "ON", marketCap: 35_000_000_000,  sector: "Financial Services", industry: "Insurance" },
  { symbol: "FFH.TO",  name: "Fairfax Financial",           province: "ON", marketCap: 28_000_000_000,  sector: "Financial Services", industry: "Insurance" },
  { symbol: "BAM.TO",  name: "Brookfield Asset Management", province: "ON", marketCap: 80_000_000_000,  sector: "Financial Services", industry: "Asset Management" },
  // ── ONTARIO — Tech ────────────────────────────────────────────────────────
  { symbol: "SHOP.TO", name: "Shopify Inc.",                province: "ON", marketCap: 120_000_000_000, sector: "Technology",         industry: "E-commerce" },
  { symbol: "CSU.TO",  name: "Constellation Software",      province: "ON", marketCap: 75_000_000_000,  sector: "Technology",         industry: "Software" },
  { symbol: "DSG.TO",  name: "Descartes Systems",           province: "ON", marketCap: 8_000_000_000,   sector: "Technology",         industry: "Logistics Software" },
  { symbol: "ENGH.TO", name: "Enghouse Systems",            province: "ON", marketCap: 2_000_000_000,   sector: "Technology",         industry: "Software" },
  { symbol: "KXS.TO",  name: "Kinaxis",                     province: "ON", marketCap: 3_500_000_000,   sector: "Technology",         industry: "Supply Chain Software" },
  { symbol: "CDAY.TO", name: "Ceridian (Dayforce)",         province: "ON", marketCap: 7_000_000_000,   sector: "Technology",         industry: "HR Software" },
  // ── ONTARIO — Industrials / Consumer ──────────────────────────────────────
  { symbol: "CNR.TO",  name: "Canadian National Railway",   province: "ON", marketCap: 95_000_000_000,  sector: "Industrials",        industry: "Railroads" },
  { symbol: "WCN.TO",  name: "Waste Connections",           province: "ON", marketCap: 48_000_000_000,  sector: "Industrials",        industry: "Waste Management" },
  { symbol: "TIH.TO",  name: "Toromont Industries",         province: "ON", marketCap: 8_000_000_000,   sector: "Industrials",        industry: "Equipment Distribution" },
  { symbol: "MG.TO",   name: "Magna International",         province: "ON", marketCap: 14_000_000_000,  sector: "Consumer Disc.",     industry: "Auto Parts" },
  { symbol: "LNR.TO",  name: "Linamar Corporation",         province: "ON", marketCap: 3_000_000_000,   sector: "Consumer Disc.",     industry: "Auto Parts" },
  { symbol: "L.TO",    name: "Loblaw Companies",            province: "ON", marketCap: 38_000_000_000,  sector: "Consumer Staples",   industry: "Grocery" },
  // ── ONTARIO — Materials / Utilities ───────────────────────────────────────
  { symbol: "ABX.TO",  name: "Barrick Gold",                province: "ON", marketCap: 35_000_000_000,  sector: "Materials",          industry: "Gold Mining" },
  { symbol: "AEM.TO",  name: "Agnico Eagle Mines",          province: "ON", marketCap: 35_000_000_000,  sector: "Materials",          industry: "Gold Mining" },
  { symbol: "K.TO",    name: "Kinross Gold",                province: "ON", marketCap: 10_000_000_000,  sector: "Materials",          industry: "Gold Mining" },
  { symbol: "H.TO",    name: "Hydro One",                   province: "ON", marketCap: 22_000_000_000,  sector: "Utilities",          industry: "Electric Utility" },
  { symbol: "NPI.TO",  name: "Northland Power",             province: "ON", marketCap: 5_500_000_000,   sector: "Utilities",          industry: "Renewable Energy" },
  // ── QUÉBEC ────────────────────────────────────────────────────────────────
  { symbol: "ATD.TO",  name: "Alimentation Couche-Tard",    province: "QC", marketCap: 65_000_000_000,  sector: "Consumer Staples",   industry: "Convenience Stores" },
  { symbol: "MRU.TO",  name: "Metro Inc.",                  province: "QC", marketCap: 17_000_000_000,  sector: "Consumer Staples",   industry: "Grocery" },
  { symbol: "SAP.TO",  name: "Saputo Inc.",                 province: "QC", marketCap: 11_000_000_000,  sector: "Consumer Staples",   industry: "Dairy" },
  { symbol: "DOL.TO",  name: "Dollarama",                   province: "QC", marketCap: 25_000_000_000,  sector: "Consumer Disc.",     industry: "Dollar Stores" },
  { symbol: "GIL.TO",  name: "Gildan Activewear",           province: "QC", marketCap: 7_000_000_000,   sector: "Consumer Disc.",     industry: "Apparel" },
  { symbol: "MTY.TO",  name: "MTY Food Group",              province: "QC", marketCap: 1_400_000_000,   sector: "Consumer Disc.",     industry: "Restaurants" },
  { symbol: "DOO.TO",  name: "BRP Inc.",                    province: "QC", marketCap: 7_000_000_000,   sector: "Consumer Disc.",     industry: "Recreation Vehicles" },
  { symbol: "WSP.TO",  name: "WSP Global",                  province: "QC", marketCap: 22_000_000_000,  sector: "Industrials",        industry: "Engineering" },
  { symbol: "SNC.TO",  name: "AtkinsRéalis",                province: "QC", marketCap: 8_000_000_000,   sector: "Industrials",        industry: "Engineering" },
  { symbol: "CAE.TO",  name: "CAE Inc.",                    province: "QC", marketCap: 7_500_000_000,   sector: "Industrials",        industry: "Aerospace Simulation" },
  { symbol: "BBD.TO",  name: "Bombardier",                  province: "QC", marketCap: 6_000_000_000,   sector: "Industrials",        industry: "Aerospace" },
  { symbol: "GIB.TO",  name: "CGI Group",                   province: "QC", marketCap: 28_000_000_000,  sector: "Technology",         industry: "IT Services" },
  { symbol: "LSPD.TO", name: "Lightspeed Commerce",         province: "QC", marketCap: 2_500_000_000,   sector: "Technology",         industry: "POS Software" },
  { symbol: "IFC.TO",  name: "Intact Financial",            province: "QC", marketCap: 38_000_000_000,  sector: "Financial Services", industry: "P&C Insurance" },
  { symbol: "POW.TO",  name: "Power Corporation of Canada", province: "QC", marketCap: 22_000_000_000,  sector: "Financial Services", industry: "Diversified Financial" },
  { symbol: "LB.TO",   name: "Laurentian Bank",             province: "QC", marketCap: 1_200_000_000,   sector: "Financial Services", industry: "Banking" },
  { symbol: "BCE.TO",  name: "BCE Inc.",                    province: "QC", marketCap: 30_000_000_000,  sector: "Communication",      industry: "Telecom" },
  { symbol: "QBR.TO",  name: "Quebecor",                    province: "QC", marketCap: 7_000_000_000,   sector: "Communication",      industry: "Media & Telecom" },
  { symbol: "CCA.TO",  name: "Cogeco Communications",       province: "QC", marketCap: 2_500_000_000,   sector: "Communication",      industry: "Cable & Telecom" },
  { symbol: "BLX.TO",  name: "Boralex",                     province: "QC", marketCap: 2_500_000_000,   sector: "Utilities",          industry: "Renewable Energy" },
  { symbol: "INE.TO",  name: "Innergex Renewable Energy",   province: "QC", marketCap: 2_000_000_000,   sector: "Utilities",          industry: "Renewable Energy" },
  { symbol: "CAS.TO",  name: "Cascades Inc.",               province: "QC", marketCap: 800_000_000,     sector: "Materials",          industry: "Packaging" },
  // ── BRITISH COLUMBIA ──────────────────────────────────────────────────────
  { symbol: "T.TO",    name: "Telus Corporation",           province: "BC", marketCap: 30_000_000_000,  sector: "Communication",      industry: "Telecom" },
  { symbol: "TIXT.TO", name: "TELUS International",         province: "BC", marketCap: 2_000_000_000,   sector: "Technology",         industry: "IT Services" },
  { symbol: "WELL.TO", name: "WELL Health Technologies",    province: "BC", marketCap: 700_000_000,     sector: "Healthcare",         industry: "Digital Health" },
  { symbol: "FM.TO",   name: "First Quantum Minerals",      province: "BC", marketCap: 12_000_000_000,  sector: "Materials",          industry: "Copper Mining" },
  { symbol: "CS.TO",   name: "Capstone Copper",             province: "BC", marketCap: 5_000_000_000,   sector: "Materials",          industry: "Copper Mining" },
  { symbol: "LUG.TO",  name: "Lundin Gold",                 province: "BC", marketCap: 4_500_000_000,   sector: "Materials",          industry: "Gold Mining" },
  { symbol: "IVN.TO",  name: "Ivanhoe Mines",               province: "BC", marketCap: 18_000_000_000,  sector: "Materials",          industry: "Mining" },
  { symbol: "MX.TO",   name: "Methanex Corporation",        province: "BC", marketCap: 2_500_000_000,   sector: "Materials",          industry: "Chemicals" },
  { symbol: "WFG.TO",  name: "West Fraser Timber",          province: "BC", marketCap: 8_000_000_000,   sector: "Materials",          industry: "Lumber" },
  { symbol: "IFP.TO",  name: "Interfor Corporation",        province: "BC", marketCap: 1_500_000_000,   sector: "Materials",          industry: "Lumber" },
  { symbol: "CFP.TO",  name: "Canfor Corporation",          province: "BC", marketCap: 2_000_000_000,   sector: "Materials",          industry: "Lumber" },
  { symbol: "FTT.TO",  name: "Finning International",       province: "BC", marketCap: 4_000_000_000,   sector: "Industrials",        industry: "Equipment Distribution" },
  { symbol: "PBH.TO",  name: "Premium Brands Holdings",     province: "BC", marketCap: 3_500_000_000,   sector: "Consumer Staples",   industry: "Food Manufacturing" },
  // ── ALBERTA ───────────────────────────────────────────────────────────────
  { symbol: "SU.TO",   name: "Suncor Energy",               province: "AB", marketCap: 62_000_000_000,  sector: "Energy",             industry: "Oil & Gas" },
  { symbol: "ENB.TO",  name: "Enbridge",                    province: "AB", marketCap: 90_000_000_000,  sector: "Energy",             industry: "Pipelines" },
  { symbol: "TRP.TO",  name: "TC Energy",                   province: "AB", marketCap: 50_000_000_000,  sector: "Energy",             industry: "Pipelines" },
  { symbol: "CNQ.TO",  name: "Canadian Natural Resources",  province: "AB", marketCap: 80_000_000_000,  sector: "Energy",             industry: "Oil & Gas" },
  { symbol: "CVE.TO",  name: "Cenovus Energy",              province: "AB", marketCap: 40_000_000_000,  sector: "Energy",             industry: "Oil & Gas" },
  { symbol: "IMO.TO",  name: "Imperial Oil",                province: "AB", marketCap: 18_000_000_000,  sector: "Energy",             industry: "Oil & Gas" },
  { symbol: "PPL.TO",  name: "Pembina Pipeline",            province: "AB", marketCap: 22_000_000_000,  sector: "Energy",             industry: "Pipelines" },
  { symbol: "ARC.TO",  name: "ARC Resources",               province: "AB", marketCap: 9_500_000_000,   sector: "Energy",             industry: "Oil & Gas" },
  { symbol: "TVE.TO",  name: "Tamarack Valley Energy",      province: "AB", marketCap: 1_800_000_000,   sector: "Energy",             industry: "Oil & Gas" },
  { symbol: "CP.TO",   name: "Canadian Pacific Kansas City",province: "AB", marketCap: 90_000_000_000,  sector: "Industrials",        industry: "Railroads" },
  { symbol: "STN.TO",  name: "Stantec",                     province: "AB", marketCap: 10_000_000_000,  sector: "Industrials",        industry: "Engineering" },
  { symbol: "ALA.TO",  name: "AltaGas",                     province: "AB", marketCap: 9_000_000_000,   sector: "Utilities",          industry: "Gas Utility" },
  { symbol: "CU.TO",   name: "Canadian Utilities",          province: "AB", marketCap: 9_000_000_000,   sector: "Utilities",          industry: "Electric/Gas Utility" },
  { symbol: "TA.TO",   name: "TransAlta Corporation",       province: "AB", marketCap: 4_000_000_000,   sector: "Utilities",          industry: "Power Generation" },
  { symbol: "CPX.TO",  name: "Capital Power",               province: "AB", marketCap: 4_500_000_000,   sector: "Utilities",          industry: "Power Generation" },
  { symbol: "ACO.TO",  name: "ATCO Ltd.",                   province: "AB", marketCap: 5_000_000_000,   sector: "Utilities",          industry: "Diversified Utility" },
  { symbol: "CWB.TO",  name: "Canadian Western Bank",       province: "AB", marketCap: 2_800_000_000,   sector: "Financial Services", industry: "Banking" },
  // ── SASKATCHEWAN ──────────────────────────────────────────────────────────
  { symbol: "NTR.TO",  name: "Nutrien",                     province: "SK", marketCap: 32_000_000_000,  sector: "Materials",          industry: "Fertilizers" },
  { symbol: "CCO.TO",  name: "Cameco Corporation",          province: "SK", marketCap: 20_000_000_000,  sector: "Energy",             industry: "Uranium" },
  // ── MANITOBA ──────────────────────────────────────────────────────────────
  { symbol: "IGM.TO",  name: "IGM Financial",               province: "MB", marketCap: 8_000_000_000,   sector: "Financial Services", industry: "Asset Management" },
  { symbol: "BYD.TO",  name: "Boyd Group Services",         province: "MB", marketCap: 3_500_000_000,   sector: "Consumer Disc.",     industry: "Auto Repair" },
  { symbol: "NWC.TO",  name: "North West Company",          province: "MB", marketCap: 2_000_000_000,   sector: "Consumer Staples",   industry: "Grocery" },
  { symbol: "NFI.TO",  name: "NFI Group (New Flyer)",       province: "MB", marketCap: 1_200_000_000,   sector: "Industrials",        industry: "Bus Manufacturing" },
  // ── NOVA SCOTIA ───────────────────────────────────────────────────────────
  { symbol: "EMP.TO",  name: "Empire Company (Sobeys)",     province: "NS", marketCap: 9_000_000_000,   sector: "Consumer Staples",   industry: "Grocery" },
  { symbol: "EMA.TO",  name: "Emera Inc.",                  province: "NS", marketCap: 14_000_000_000,  sector: "Utilities",          industry: "Electric Utility" },
  // ── NEWFOUNDLAND ──────────────────────────────────────────────────────────
  { symbol: "FTS.TO",  name: "Fortis Inc.",                 province: "NL", marketCap: 25_000_000_000,  sector: "Utilities",          industry: "Electric Utility" },
];

export async function GET(req: NextRequest) {
  const province = req.nextUrl.searchParams.get("province") || "";
  const range    = req.nextUrl.searchParams.get("range")    || "";

  const bounds = RANGE_MAP[range];
  if (!bounds || !province) {
    return NextResponse.json({ success: false, error: "Invalid province or range" }, { status: 400 });
  }

  const companies = TSX_COMPANIES
    .filter((c) => c.province === province && c.marketCap >= bounds.min && c.marketCap <= bounds.max)
    .sort((a, b) => b.marketCap - a.marketCap);

  return NextResponse.json({ success: true, companies, province, range });
}
