import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun,
  ArrowUp,
  ArrowDown,
  Sprout,
  Loader2,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import {
  conditionIcon,
  type CurrentWeather,
  type ForecastDay,
} from "@/lib/weatherApi";

interface WeatherDetailsProps {
  onBack: () => void;
}

interface WeatherAlert {
  title: string;
  severity: "high" | "medium" | "low";
  description: string;
}

type TabKey = "forecast" | "alerts" | "advice";

function buildFarmingAdvice(forecast: ForecastDay[], current: CurrentWeather): string[] {
  const tips: string[] = [];
  const rainyDays = forecast.filter((d) => d.rain >= 40).length;

  if (current.humidity < 35) {
    tips.push("Soil moisture is low — schedule irrigation early morning to reduce evaporation.");
  } else if (current.humidity > 75) {
    tips.push("High humidity increases fungal risk — improve row ventilation and scout leaves daily.");
  }

  if (current.windSpeed <= 15) {
    tips.push("Wind conditions are calm — suitable for spraying and field operations today.");
  } else {
    tips.push("Wind is elevated — avoid pesticide spraying until speeds drop below 15 km/h.");
  }

  if (current.uvIndex >= 7) {
    tips.push("Strong UV — plan strenuous field work before 10 AM or after 4 PM.");
  }

  if (rainyDays >= 2) {
    tips.push(`${rainyDays} days show rain risk this week — ensure drainage channels are clear.`);
  } else {
    tips.push("Dry spell expected — monitor soil moisture and adjust irrigation cycles.");
  }

  if (current.temp >= 35) {
    tips.push("Heat stress likely — mulching and drip irrigation help protect root zones.");
  }

  return tips.slice(0, 5);
}

function buildWeatherAlerts(current: CurrentWeather, forecast: ForecastDay[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  if (forecast[0]?.rain >= 50 || forecast[1]?.rain >= 50) {
    alerts.push({
      title: "Rain expected in next 48 hours",
      severity: "high",
      description: "Protect harvested produce and ensure field drainage before rainfall.",
    });
  }

  if (current.windSpeed >= 25) {
    alerts.push({
      title: "Strong wind advisory",
      severity: "medium",
      description: "Delay spraying operations and secure greenhouse covers or shade nets.",
    });
  }

  if (current.temp >= 38) {
    alerts.push({
      title: "Heatwave conditions",
      severity: "high",
      description: "Increase watering frequency and avoid transplanting during peak afternoon heat.",
    });
  }

  if (current.humidity >= 80) {
    alerts.push({
      title: "High humidity alert",
      severity: "medium",
      description: "Monitor for leaf blight and rust — apply preventive organic fungicide if needed.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      title: "No severe alerts",
      severity: "low",
      description: "Weather is stable for routine farming activities in your area.",
    });
  }

  return alerts;
}

function formatLastUpdated(ts: number | null): string {
  if (!ts) return "";
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function WeatherDetails({ onBack }: WeatherDetailsProps) {
  const { current: currentWeather, forecast, loading, refreshing, error, refresh, lastUpdated } =
    useWeather();
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("forecast");

  const alerts = useMemo(
    () => (currentWeather ? buildWeatherAlerts(currentWeather, forecast) : []),
    [currentWeather, forecast]
  );

  const farmingAdvice = useMemo(
    () => (currentWeather ? buildFarmingAdvice(forecast, currentWeather) : []),
    [currentWeather, forecast]
  );

  const metrics = currentWeather
    ? [
        { label: "Feels Like", value: `${currentWeather.feelsLike}°C`, icon: Thermometer, color: "text-orange-500 bg-orange-50 border-orange-100" },
        { label: "Humidity", value: `${currentWeather.humidity}%`, icon: Droplets, color: "text-blue-500 bg-blue-50 border-blue-100" },
        { label: "Wind Speed", value: `${currentWeather.windSpeed} km/h`, icon: Wind, color: "text-sky-500 bg-sky-50 border-sky-100" },
        { label: "Pressure", value: `${currentWeather.pressure} mb`, icon: Gauge, color: "text-violet-500 bg-violet-50 border-violet-100" },
        { label: "Visibility", value: `${currentWeather.visibility} km`, icon: Eye, color: "text-emerald-500 bg-emerald-50 border-emerald-100" },
        { label: "UV Index", value: `${currentWeather.uvIndex}`, icon: Sun, color: "text-amber-500 bg-amber-50 border-amber-100" },
      ]
    : [];

  const tabs: { key: TabKey; label: string }[] = [
    { key: "forecast", label: "7-Day Forecast" },
    { key: "alerts", label: "Weather Alerts" },
    { key: "advice", label: "Farming Advice" },
  ];

  if (loading && !currentWeather) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center gap-3 text-blue-800">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="font-medium">Fetching live weather for your region…</span>
      </div>
    );
  }

  if (error && !currentWeather) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] p-6 max-w-lg mx-auto">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Card className="rounded-2xl border-red-200 bg-red-50 p-6 text-center space-y-4">
          <p className="text-red-800 font-medium">{error}</p>
          <Button onClick={refresh} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" /> Try again
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentWeather) return null;

  const CurrentIcon = conditionIcon(currentWeather.condition);

  return (
    <div className="min-h-screen bg-[#F0F7FF] pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-2 -ml-2 text-blue-700 hover:bg-blue-100/80 hover:text-blue-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f]">Weather Dashboard</h1>
            <p className="text-sm text-blue-600/80 mt-1">
              Live updates every 10 minutes · GPS or your profile state
            </p>
            {lastUpdated && (
              <p className="text-xs text-blue-500/70 mt-1">
                Last updated: {formatLastUpdated(lastUpdated)}
              </p>
            )}
            {error && (
              <p className="text-xs text-amber-700 mt-1">
                Refresh issue: {error} — showing last known data
              </p>
            )}
          </div>
          <Button
            variant="outline"
            className="border-blue-300 text-blue-800 shrink-0"
            onClick={refresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh now</span>
          </Button>
        </div>

        <Card className="rounded-2xl border border-blue-100/80 bg-white shadow-sm overflow-hidden relative">
          {refreshing && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 overflow-hidden">
              <div className="h-full w-1/3 bg-blue-500 animate-pulse" />
            </div>
          )}
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1e40af] flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                  {currentWeather.location}
                </h2>
                <p className="text-sm text-blue-500/90 mt-1">Current Weather Conditions · Live</p>
              </div>
              <div className="sm:text-right flex sm:block items-center gap-4">
                <CurrentIcon className="h-14 w-14 text-blue-400 sm:hidden" strokeWidth={1.5} />
                <div>
                  <div className="text-5xl sm:text-6xl font-bold text-[#1e3a5f] leading-none tabular-nums">
                    {currentWeather.temp}°C
                  </div>
                  <p className="text-base text-blue-600/80 mt-2 font-medium capitalize">
                    {currentWeather.condition}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-blue-50/30"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${m.color}`}>
                    <m.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wide">
                      {m.label}
                    </p>
                    <p className="text-sm font-bold text-[#1e3a5f] mt-0.5 tabular-nums">{m.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-xl border border-blue-100 bg-white p-1 flex flex-wrap sm:flex-nowrap gap-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[120px] rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-[#2563eb] text-white shadow-md"
                  : "text-[#1e3a5f] hover:bg-blue-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "forecast" && (
          <div>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {forecast.length === 0 ? (
                <p className="text-blue-600/70 text-sm py-8 w-full text-center">
                  Forecast data unavailable.
                </p>
              ) : (
                forecast.map((day, index) => {
                  const DayIcon = day.icon;
                  const isSelected = selectedDay === index;
                  return (
                    <button
                      key={`${day.day}-${day.date}`}
                      type="button"
                      onClick={() => setSelectedDay(index)}
                      className={`snap-start shrink-0 w-[130px] sm:w-[140px] rounded-2xl border bg-white p-4 text-left transition-all hover:shadow-md ${
                        isSelected
                          ? "border-[#2563eb] ring-2 ring-blue-100 shadow-md"
                          : "border-blue-100/80 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-bold text-[#1e3a5f]">{day.day}</span>
                        <DayIcon className="h-8 w-8 text-blue-400" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1 mb-3">
                        <p className="flex items-center gap-1 text-sm font-bold text-red-500 tabular-nums">
                          <ArrowUp className="h-3.5 w-3.5" />
                          {day.high}°
                        </p>
                        <p className="flex items-center gap-1 text-sm font-bold text-blue-500 tabular-nums">
                          <ArrowDown className="h-3.5 w-3.5" />
                          {day.low}°
                        </p>
                      </div>
                      <p className="text-xs font-medium text-blue-600/80 leading-snug">{day.condition}</p>
                      {day.rain > 0 && (
                        <p className="text-[10px] text-blue-400 mt-1">{day.rain}% rain chance</p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            {forecast[selectedDay] && (
              <Card className="mt-4 rounded-2xl border border-blue-100 bg-white shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm font-bold text-[#1e40af] mb-1">
                    {forecast[selectedDay].day} — {forecast[selectedDay].date}
                  </p>
                  <p className="text-sm text-blue-700/80">{forecast[selectedDay].advice}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <Card
                key={i}
                className={`rounded-2xl border shadow-sm ${
                  alert.severity === "high"
                    ? "border-red-200 bg-red-50/40"
                    : alert.severity === "medium"
                      ? "border-amber-200 bg-amber-50/40"
                      : "border-blue-100 bg-white"
                }`}
              >
                <CardContent className="p-5 flex gap-4">
                  <div
                    className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-xl ${
                      alert.severity === "high"
                        ? "bg-red-100 text-red-600"
                        : alert.severity === "medium"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#1e3a5f]">{alert.title}</h3>
                      <Badge
                        className={
                          alert.severity === "high"
                            ? "bg-red-600 text-white"
                            : alert.severity === "medium"
                              ? "bg-amber-500 text-white"
                              : "bg-blue-500 text-white"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700/80 leading-relaxed">{alert.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "advice" && (
          <div className="space-y-3">
            {farmingAdvice.map((tip, i) => (
              <Card key={i} className="rounded-2xl border border-blue-100 bg-white shadow-sm">
                <CardContent className="p-5 flex gap-4">
                  <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-[#1e3a5f] font-medium leading-relaxed pt-2">{tip}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
