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

const TRACKED_CROPS = ["Wheat", "Rice", "Maize", "Soybean", "Sugarcane"] as const;

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

const BASE_QUINTAL: Record<(typeof TRACKED_CROPS)[number], number> = {
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
  return abbrev[t.toUpperCase()] ?? t;
}

function dayJitter(state: string, crop: string): number {
  const iso = new Date().toISOString().slice(0, 10);
  const seed = `${iso}|${normalizeState(state)}|${crop}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 0.94 + ((h >>> 0) / 2 ** 32) * 0.12;
}

/** Client-side regional estimate when API is unreachable. */
export function regionalEstimate(state: string): MarketPricesPayload {
  const st = normalizeState(state);
  const f = STATE_FACTORS[st] ?? 1.0;
  const crops: CropPriceRow[] = TRACKED_CROPS.map((crop) => {
    const avgPrice = Math.round((BASE_QUINTAL[crop] * f * dayJitter(st, crop)) / 10) * 10;
    return {
      crop,
      avgPrice,
      minPrice: Math.round(avgPrice * 0.92),
      maxPrice: Math.round(avgPrice * 1.08),
    };
  });
  return {
    state: st,
    source: "regional_estimate",
    asOf: new Date().toISOString(),
    crops,
    note: "Indicative wholesale range for your state (offline estimate). Start the backend with npm start for live mandi API data.",
  };
}

function apiUrl(state: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
  return `${base}/api/market/prices?${new URLSearchParams({ state }).toString()}`;
}

/** Try backend API; fall back to regional estimate if backend is down or route missing. */
export async function fetchMarketPrices(state: string): Promise<{
  data: MarketPricesPayload;
  usedFallback: boolean;
  warning?: string;
}> {
  try {
    const res = await fetch(apiUrl(state));
    if (res.ok) {
      const data = (await res.json()) as MarketPricesPayload;
      return { data, usedFallback: false };
    }
    if (res.status === 404 || res.status === 502 || res.status === 503) {
      const fallback = regionalEstimate(state);
      return {
        data: fallback,
        usedFallback: true,
        warning: `API unavailable (${res.status}). Showing estimated prices for ${fallback.state}. Run npm start from Harit_Kranti-main so backend serves /api/market/prices.`,
      };
    }
    throw new Error(`Server returned ${res.status}`);
  } catch (err) {
    const fallback = regionalEstimate(state);
    const msg = err instanceof Error ? err.message : "Network error";
    return {
      data: fallback,
      usedFallback: true,
      warning: `Could not reach API (${msg}). Showing estimated prices for ${fallback.state}.`,
    };
  }
}
