import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, DollarSign, RefreshCw, Loader2 } from "lucide-react";

import {
  fetchMarketPrices,
  type MarketPricesPayload,
} from "@/lib/marketPricesClient";

interface Vendor {
  name: string;
  crop: string;
  contact: string;
  location: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
] as const;

const vendors: Vendor[] = [
  {
    name: "Rajesh Kumar",
    crop: "Wheat",
    contact: "+91 9876543210",
    location: "Varanasi, UP",
  },
  {
    name: "Anita Traders",
    crop: "Rice",
    contact: "+91 9123456780",
    location: "Patna, Bihar",
  },
  {
    name: "Green Agro",
    crop: "Soybean",
    contact: "+91 9988776655",
    location: "Indore, MP",
  },
  {
    name: "Fresh Farm Supplies",
    crop: "Sugarcane",
    contact: "+91 8899776655",
    location: "Nagpur, MH",
  },
];

function readProfileState(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "Uttar Pradesh";
    const u = JSON.parse(raw) as { state?: string };
    if (u.state && String(u.state).trim()) return String(u.state).trim();
  } catch {
    /* ignore */
  }
  return "Uttar Pradesh";
}

const MarketPrice = ({ onBack }: { onBack?: () => void }) => {
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>(() => readProfileState());
  const [payload, setPayload] = useState<MarketPricesPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setWarning(null);
    try {
      const { data, usedFallback, warning: w } = await fetchMarketPrices(selectedState);
      setPayload(data);
      setWarning(usedFallback ? w ?? null : null);
    } catch (e) {
      setWarning(e instanceof Error ? e.message : "Could not load prices");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [selectedState]);

  useEffect(() => {
    void load();
  }, [load]);

  const cropPrices = useMemo(() => payload?.crops ?? [], [payload]);

  const filteredVendors = selectedCrop
    ? vendors.filter((v) => v.crop === selectedCrop)
    : vendors;

  const asOfLabel = useMemo(() => {
    if (!payload?.asOf) return "";
    try {
      return new Date(payload.asOf).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return payload.asOf;
    }
  }, [payload?.asOf]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-green-700">🌾 Market Prices</h1>
          <p className="text-sm text-gray-600 mt-1">
            Latest indicative rates for <span className="font-semibold text-green-800">{selectedState}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              ⬅ Back
            </Button>
          )}
          <Button
            variant="outline"
            className="border-green-300 text-green-800"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      <Card className="border-green-100 shadow-sm rounded-2xl">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Your state (mandi region)</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full h-11 rounded-xl border border-green-200 bg-white px-3 text-sm font-medium text-green-950 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500">
              Defaults to the state in your profile. Change it to compare mandi-linked prices elsewhere.
            </p>
          </div>
          <div className="flex flex-col gap-1 md:items-end">
            {payload && (
              <>
                <Badge
                  variant="secondary"
                  className={
                    payload.source === "gov_mandi"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                      : "bg-amber-50 text-amber-900 border border-amber-200"
                  }
                >
                  {payload.source === "gov_mandi" ? "Live mandi (Gov data)" : "Regional daily index"}
                </Badge>
                {asOfLabel && (
                  <span className="text-xs text-gray-500">Updated {asOfLabel}</span>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {warning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm px-4 py-3">
          {warning}
        </div>
      )}

      {payload?.note && !warning && (
        <p className="text-xs text-gray-500 border border-gray-100 rounded-xl px-3 py-2 bg-gray-50/80">{payload.note}</p>
      )}

      {/* Crop catalog */}
      <div>
        <h2 className="text-lg font-semibold text-green-900 mb-3">Crop rates (₹ / quintal)</h2>
        {loading && !payload ? (
          <div className="flex items-center justify-center py-16 text-green-700 gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading latest prices…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cropPrices.map((price) => (
              <Card
                key={price.crop}
                className={`cursor-pointer hover:shadow-lg transition rounded-2xl border ${
                  selectedCrop === price.crop ? "border-green-600 ring-2 ring-green-100" : "border-green-100"
                }`}
                onClick={() =>
                  setSelectedCrop(selectedCrop === price.crop ? "" : price.crop)
                }
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    {price.crop}
                    <DollarSign className="text-green-600 h-5 w-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-gray-800">
                    Modal / avg:{" "}
                    <span className="font-bold text-green-700 text-lg">₹{price.avgPrice}</span>
                    <span className="text-sm text-gray-500"> / qtl</span>
                  </p>
                  {(price.minPrice != null || price.maxPrice != null) && (
                    <p className="text-xs text-gray-500">
                      Range: ₹{price.minPrice ?? "—"} – ₹{price.maxPrice ?? "—"}
                      {price.marketsSampled != null && price.marketsSampled > 0 && (
                        <span className="block mt-1 text-green-700 font-medium">
                          {price.marketsSampled} mandi snapshot{price.marketsSampled === 1 ? "" : "s"}
                        </span>
                      )}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mt-6">👩‍🌾 Vendors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((vendor, idx) => (
          <Card key={idx} className="hover:shadow-lg transition rounded-2xl border-green-50">
            <CardHeader>
              <CardTitle>{vendor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="flex items-center gap-2">
                <MapPin size={18} className="text-gray-500 shrink-0" />
                {vendor.location}
              </p>
              <p className="flex items-center gap-2">
                🌱 Crop: <span className="font-semibold">{vendor.crop}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={18} className="text-green-600 shrink-0" />
                <a href={`tel:${vendor.contact}`} className="text-blue-600 hover:underline">
                  {vendor.contact}
                </a>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarketPrice;
