/**
 * Market prices: prefers data.gov.in mandi dataset when DATA_GOV_IN_API_KEY is set;
 * otherwise returns a stable day-based regional estimate for the selected state.
 */

const MANDI_RESOURCE =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070.json";

/** Target crops shown in the app (commodity names aligned with mandi data where possible). */
const TRACKED_CROPS = ["Wheat", "Rice", "Maize", "Soybean", "Sugarcane"] as const;
export type TrackedCrop = (typeof TRACKED_CROPS)[number];

export type CropPriceRow = {
  crop: string;
  avgPrice: number;
  minPrice?: number;
  maxPrice?: number;
  marketsSampled?: number;
};

export type MarketPricesPayload = {
  state: string;
  source: "gov_mandi" | "regional_estimate";
  asOf: string;
  crops: CropPriceRow[];
  note?: string;
};

/** Rough wholesale index vs national average (₹/q ballpark), by state. */
const STATE_FACTORS: Record<string, number> = {
  "Andhra Pradesh": 1.02,
  "Arunachal Pradesh": 1.12,
  Assam: 1.05,
  Bihar: 0.98,
  Chhattisgarh: 0.99,
  Goa: 1.08,
  Gujarat: 1.03,
  Haryana: 1.06,
  "Himachal Pradesh": 1.07,
  Jharkhand: 0.99,
  Karnataka: 1.01,
  Kerala: 1.09,
  "Madhya Pradesh": 1.0,
  Maharashtra: 1.02,
  Manipur: 1.1,
  Meghalaya: 1.08,
  Mizoram: 1.1,
  Nagaland: 1.1,
  Odisha: 0.98,
  Punjab: 1.08,
  Rajasthan: 1.01,
  Sikkim: 1.11,
  "Tamil Nadu": 1.03,
  Telangana: 1.01,
  Tripura: 1.04,
  "Uttar Pradesh": 1.0,
  Uttarakhand: 1.04,
  "West Bengal": 1.0,
  Delhi: 1.05,
};

/** National modal ballpark (₹/quintal) used for estimates. */
const BASE_QUINTAL: Record<TrackedCrop, number> = {
  Wheat: 2320,
  Rice: 2880,
  Maize: 1980,
  Soybean: 4180,
  Sugarcane: 3400,
};

function normalizeState(s: string): string {
  const t = s.trim();
  if (!t) return "Uttar Pradesh";
  const abbrev: Record<string, string> = {
    UP: "Uttar Pradesh",
    MP: "Madhya Pradesh",
    MH: "Maharashtra",
    PB: "Punjab",
    HR: "Haryana",
    WB: "West Bengal",
    AP: "Andhra Pradesh",
    TN: "Tamil Nadu",
    KA: "Karnataka",
    GJ: "Gujarat",
    BR: "Bihar",
    RJ: "Rajasthan",
  };
  const upper = t.toUpperCase();
  return abbrev[upper] ?? t;
}

function stateFactor(state: string): number {
  const n = normalizeState(state);
  return STATE_FACTORS[n] ?? 1.0;
}

/** Deterministic ± jitter by calendar day + state + crop (feels “live”, stable intraday). */
function dayJitter(state: string, crop: string): number {
  const iso = new Date().toISOString().slice(0, 10);
  const seed = `${iso}|${normalizeState(state)}|${crop}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = (h >>> 0) / 2 ** 32;
  return 0.94 + u * 0.12;
}

export function regionalEstimate(state: string): MarketPricesPayload {
  const st = normalizeState(state);
  const f = stateFactor(st);
  const asOf = new Date().toISOString();
  const crops: CropPriceRow[] = TRACKED_CROPS.map((crop) => {
    const raw = BASE_QUINTAL[crop] * f * dayJitter(st, crop);
    const avgPrice = Math.round(raw / 10) * 10;
    return { crop, avgPrice, minPrice: Math.round(avgPrice * 0.92), maxPrice: Math.round(avgPrice * 1.08) };
  });
  return {
    state: st,
    source: "regional_estimate",
    asOf,
    crops,
    note:
      "Indicative wholesale range for your state (daily index). Set DATA_GOV_IN_API_KEY in backend .env for live AGMARKNET mandi data from data.gov.in.",
  };
}

function pickField(r: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = r[k];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return undefined;
}

function parsePrice(s: string | undefined): number | null {
  if (!s) return null;
  const n = parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normCommodity(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function matchesTracked(commodity: string): TrackedCrop | null {
  const n = normCommodity(commodity);
  for (const c of TRACKED_CROPS) {
    if (n === c.toLowerCase()) return c;
    if (n.includes(c.toLowerCase())) return c;
  }
  if (n.includes("paddy") || n.includes("rice")) return "Rice";
  if (n.includes("soybean") || n.includes("soya")) return "Soybean";
  if (n.includes("makka") || n.includes("maize") || n.includes("corn")) return "Maize";
  if (n.includes("sugarcane") || n.includes("gur") || n.includes("jaggery")) return "Sugarcane";
  return null;
}

function recordState(r: Record<string, unknown>): string {
  return (
    pickField(r, ["state", "State", "state_name", "State Name"]) ?? ""
  ).trim();
}

type GovRecord = Record<string, unknown>;

async function fetchGovMandi(apiKey: string, state: string): Promise<GovRecord[] | null> {
  const st = normalizeState(state);
  const urls = [
    `${MANDI_RESOURCE}?api-key=${encodeURIComponent(apiKey)}&limit=600&filters=${encodeURIComponent(
      JSON.stringify({ state: st })
    )}`,
    `${MANDI_RESOURCE}?api-key=${encodeURIComponent(apiKey)}&limit=800`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) continue;
      const data = (await res.json()) as { records?: GovRecord[]; error?: string };
      if (data.error) continue;
      if (!Array.isArray(data.records)) continue;
      let rows = data.records;
      if (url.includes("filters")) return rows;
      rows = rows.filter((r) => recordState(r).toLowerCase() === st.toLowerCase());
      if (rows.length > 0) return rows;
    } catch {
      /* try next */
    }
  }
  return null;
}

function aggregateByCrop(records: GovRecord[], state: string): MarketPricesPayload {
  const st = normalizeState(state);
  const fallback = regionalEstimate(st);
  const byCrop = new Map<
    TrackedCrop,
    { modals: number[]; mins: number[]; maxs: number[]; markets: Set<string> }
  >();

  for (const r of records) {
    const commodity =
      pickField(r, ["commodity", "Commodity", "commodity_name"]) ?? "";
    const crop = matchesTracked(commodity);
    if (!crop) continue;

    const modal = parsePrice(
      pickField(r, ["modal_price", "modal_price_rs_qtl", "Modal Price (Rs./Quintal)", "modal_price_rs"])
    );
    const min = parsePrice(pickField(r, ["min_price", "Min Price (Rs./Quintal)", "min_price_rs_qtl"]));
    const max = parsePrice(pickField(r, ["max_price", "Max Price (Rs./Quintal)", "max_price_rs_qtl"]));
    const market =
      pickField(r, ["market", "Market", "APMC", "apmc_market"]) ?? "unknown";

    if (!byCrop.has(crop)) {
      byCrop.set(crop, { modals: [], mins: [], maxs: [], markets: new Set() });
    }
    const bucket = byCrop.get(crop)!;
    if (modal != null) bucket.modals.push(modal);
    if (min != null) bucket.mins.push(min);
    if (max != null) bucket.maxs.push(max);
    bucket.markets.add(market);
  }

  let anyGov = false;
  const crops: CropPriceRow[] = TRACKED_CROPS.map((crop) => {
    const b = byCrop.get(crop);
    if (!b || b.modals.length === 0) {
      return fallback.crops.find((c) => c.crop === crop)!;
    }
    anyGov = true;
    const avg =
      b.modals.reduce((a, x) => a + x, 0) / b.modals.length;
    const avgPrice = Math.round(avg / 10) * 10;
    const minPrice =
      b.mins.length > 0 ? Math.round(Math.min(...b.mins) / 10) * 10 : Math.round(avgPrice * 0.93);
    const maxPrice =
      b.maxs.length > 0 ? Math.round(Math.max(...b.maxs) / 10) * 10 : Math.round(avgPrice * 1.07);
    return {
      crop,
      avgPrice,
      minPrice,
      maxPrice,
      marketsSampled: b.markets.size,
    };
  });

  const asOf = new Date().toISOString();
  if (!anyGov) {
    return {
      ...fallback,
      asOf,
      note: `${fallback.note ?? ""} (Mandi rows did not include tracked crops for "${st}".)`,
    };
  }
  return {
    state: st,
    source: "gov_mandi",
    asOf,
    crops,
    note: "Modal prices from mandi records for your state (data.gov.in / AGMARKNET), with estimates for crops missing in the feed.",
  };
}

export async function getMarketPricesForState(state: string): Promise<MarketPricesPayload> {
  const st = normalizeState(state);
  const key = process.env.DATA_GOV_IN_API_KEY?.trim();
  if (!key) {
    return regionalEstimate(st);
  }

  try {
    const records = await fetchGovMandi(key, st);
    if (!records || records.length === 0) {
      const est = regionalEstimate(st);
      return {
        ...est,
        note: `${est.note} (No mandi rows returned for "${st}" — showing estimate.)`,
      };
    }
    return aggregateByCrop(records, st);
  } catch {
    return regionalEstimate(st);
  }
}
