import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchWeatherBundle,
  REFRESH_MS,
  type CurrentWeather,
  type ForecastDay,
} from "@/lib/weatherApi";

export function useWeather(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async (isBackground = false) => {
    if (!enabled) return;
    if (isBackground) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const bundle = await fetchWeatherBundle();
      if (!mounted.current) return;
      setCurrent(bundle.current);
      setForecast(bundle.forecast);
    } catch (e) {
      if (!mounted.current) return;
      setError(e instanceof Error ? e.message : "Could not load weather");
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    mounted.current = true;
    void load(false);

    const interval = setInterval(() => void load(true), REFRESH_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load(true);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    const onProfileUpdate = () => void load(true);
    window.addEventListener("harit-user-updated", onProfileUpdate);

    return () => {
      mounted.current = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("harit-user-updated", onProfileUpdate);
    };
  }, [load]);

  return {
    current,
    forecast,
    loading,
    refreshing,
    error,
    refresh: () => load(true),
    lastUpdated: current?.updatedAt ?? null,
  };
}
