import { Cloud, CloudRain, CloudSun, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY ?? "49d8ff3c12808b60573e0301c6681d4c";
const REFRESH_MS = 10 * 60 * 1000; // 10 minutes

export { REFRESH_MS, API_KEY };

export interface CurrentWeather {
  temp: number;
  condition: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  location: string;
  updatedAt: number;
}

export interface ForecastDay {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: LucideIcon;
  rain: number;
  advice: string;
}

export interface WeatherBundle {
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export function conditionIcon(condition: string): LucideIcon {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle") || c.includes("thunder")) return CloudRain;
  if (c.includes("cloud") || c.includes("mist") || c.includes("haze") || c.includes("fog")) return CloudSun;
  return Sun;
}

export function formatCondition(main: string, description?: string): string {
  if (description) {
    return description.charAt(0).toUpperCase() + description.slice(1);
  }
  const map: Record<string, string> = {
    Clear: "Clear Sky",
    Clouds: "Partly Cloudy",
    Rain: "Rainy",
    Drizzle: "Light Rain",
    Thunderstorm: "Thunderstorm",
    Mist: "Misty",
    Haze: "Hazy",
  };
  return map[main] ?? main;
}

function estimateUvIndex(hour: number, cloudMain: string): number {
  const cloudy = cloudMain.toLowerCase().includes("cloud") || cloudMain.toLowerCase().includes("rain");
  if (hour < 6 || hour > 19) return 0;
  if (cloudy) return hour < 12 ? 4 : 3;
  if (hour >= 10 && hour <= 15) return 8;
  return 5;
}

function humidityLabel(h: number): string {
  if (h < 30) return "Very Low — irrigate soon";
  if (h < 50) return "Low — monitor soil moisture";
  if (h < 70) return "Moderate — balanced conditions";
  return "High — watch for fungal pressure";
}

function windLabel(kmh: number): string {
  if (kmh <= 15) return "Excellent — ideal for field operations";
  if (kmh <= 25) return "Moderate — caution when spraying";
  return "Strong — delay spraying operations";
}

function pestRiskLabel(temp: number, humidity: number): { level: string; note: string } {
  if (temp >= 32 && humidity >= 70) {
    return { level: "High", note: "Warm & humid — scout for hopper and rust" };
  }
  if (temp <= 12 || temp >= 40) {
    return { level: "Low", note: "Extreme temperatures limit pest activity" };
  }
  if (humidity >= 65) {
    return { level: "Medium", note: "Humid conditions — check leaf undersides" };
  }
  return { level: "Low", note: "Conditions unfavorable for major pest outbreaks" };
}

export function getHumidityLabel(h: number) {
  return humidityLabel(h);
}

export function getWindLabel(kmh: number) {
  return windLabel(kmh);
}

export function getPestRisk(temp: number, humidity: number) {
  return pestRiskLabel(temp, humidity);
}

export function readProfileState(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "Uttar Pradesh";
    const u = JSON.parse(raw) as { state?: string };
    return u.state?.trim() || "Uttar Pradesh";
  } catch {
    return "Uttar Pradesh";
  }
}

async function geocodeState(state: string): Promise<{ lat: number; lon: number; label: string } | null> {
  try {
    const q = encodeURIComponent(`${state},IN`);
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1&appid=${API_KEY}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const place = data[0];
    const label = place.state
      ? `${place.name}, ${place.state}`
      : `${place.name}, ${state}`;
    return { lat: place.lat, lon: place.lon, label };
  } catch {
    return null;
  }
}

async function resolveCoordinates(): Promise<{
  lat: number;
  lon: number;
  locationHint: string;
  source: "gps" | "profile" | "default";
}> {
  const profileState = readProfileState();

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 120_000,
      })
    );
    return {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      locationHint: profileState,
      source: "gps",
    };
  } catch {
    const geo = await geocodeState(profileState);
    if (geo) {
      return { lat: geo.lat, lon: geo.lon, locationHint: geo.label, source: "profile" };
    }
    return {
      lat: 25.3176,
      lon: 82.9739,
      locationHint: `${profileState}`,
      source: "default",
    };
  }
}

function parseForecastList(list: any[]): ForecastDay[] {
  const dailyMap = new Map<
    string,
    { dt: number; max: number; min: number; main: string; pop: number }
  >();

  list.forEach((item: any) => {
    const key = new Date(item.dt * 1000).toDateString();
    const max = item.main.temp_max;
    const min = item.main.temp_min;
    const main = item.weather[0].main;
    const pop = item.pop ?? 0;
    const existing = dailyMap.get(key);

    if (!existing) {
      dailyMap.set(key, { dt: item.dt, max, min, main, pop });
    } else {
      dailyMap.set(key, {
        dt: existing.dt,
        max: Math.max(existing.max, max),
        min: Math.min(existing.min, min),
        main: pop > existing.pop ? main : existing.main,
        pop: Math.max(existing.pop, pop),
      });
    }
  });

  return Array.from(dailyMap.values())
    .slice(0, 7)
    .map((day, index) => {
      const date = new Date(day.dt * 1000);
      const condition = formatCondition(day.main);
      const rainPct = Math.round(day.pop * 100);
      return {
        day:
          index === 0
            ? "Today"
            : index === 1
              ? "Tomorrow"
              : date.toLocaleDateString([], { weekday: "short" }),
        date: date.toLocaleDateString([], { month: "short", day: "numeric" }),
        high: Math.round(day.max),
        low: Math.round(day.min),
        condition,
        icon: conditionIcon(day.main),
        rain: rainPct,
        advice:
          rainPct >= 50
            ? "Avoid spraying — rain may wash off treatments."
            : day.max >= 35
              ? "Irrigate early morning; avoid midday field work."
              : "Good window for irrigation and light field operations.",
      };
    });
}

export async function fetchWeatherBundle(): Promise<WeatherBundle> {
  const { lat, lon, locationHint, source } = await resolveCoordinates();

  const [currentRes, forecastRes] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    ),
  ]);

  if (!currentRes.ok) throw new Error("Weather API failed");
  const currentData = await currentRes.json();

  let forecast: ForecastDay[] = [];
  if (forecastRes.ok) {
    const forecastData = await forecastRes.json();
    if (Array.isArray(forecastData.list)) {
      forecast = parseForecastList(forecastData.list);
    }
  }

  const city = currentData.name as string | undefined;
  let location = city || locationHint;
  if (city && source === "gps" && locationHint) {
    location = `${city}, ${locationHint}`;
  } else if (source === "profile") {
    location = locationHint;
  }

  const cloudMain = currentData.weather[0].main as string;
  const hour = new Date().getHours();

  const current: CurrentWeather = {
    temp: Math.round(currentData.main.temp),
    condition: formatCondition(cloudMain, currentData.weather[0].description),
    feelsLike: Math.round(currentData.main.feels_like),
    humidity: currentData.main.humidity,
    windSpeed: Math.round(currentData.wind.speed * 3.6),
    visibility: Math.round((currentData.visibility || 10000) / 1000),
    pressure: currentData.main.pressure,
    uvIndex: estimateUvIndex(hour, cloudMain),
    location,
    updatedAt: Date.now(),
  };

  return { current, forecast };
}
