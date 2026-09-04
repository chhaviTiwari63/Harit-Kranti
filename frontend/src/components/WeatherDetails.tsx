import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Cloud, Sun, CloudRain, Calendar, AlertTriangle, Thermometer } from "lucide-react";

interface WeatherDetailsProps {
  onBack: () => void;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

interface CurrentWeather {
  temp: number;
  condition: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  pressure: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  location: string;
}

interface ForecastDay {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: any;
  rain: number;
  wind: number;
  humidity: number;
  advice: string;
}

export default function WeatherDetails({ onBack }: WeatherDetailsProps) {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);

  const API_KEY = "49d8ff3c12808b60573e0301c6681d4c";

  const getPosition = (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 })
    );

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const position = await getPosition();
        const { latitude, longitude } = position.coords;

        // Fetch current weather + forecast
        const [currentRes, forecastRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`),
          fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly&units=metric&appid=${API_KEY}`),
        ]);

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        // Set current weather including location
        setCurrentWeather({
          temp: Math.round(currentData.main.temp),
          condition: currentData.weather[0].main,
          feelsLike: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed),
          windDirection: "SW",
          visibility: currentData.visibility / 1000,
          pressure: currentData.main.pressure,
          uvIndex: forecastData.current?.uvi || 0,
          sunrise: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sunset: new Date(currentData.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          location: currentData.name || "Unknown",
        });

        // Map forecast data
        const days = ["Today", "Tomorrow", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const mappedForecast: ForecastDay[] = forecastData.daily.slice(0, 5).map((day: any, index: number) => ({
          day: days[index],
          date: new Date(day.dt * 1000).toLocaleDateString([], { month: "short", day: "numeric" }),
          high: Math.round(day.temp.max),
          low: Math.round(day.temp.min),
          condition: day.weather[0].main,
          icon: day.weather[0].main.includes("Rain") ? CloudRain : day.weather[0].main.includes("Cloud") ? Cloud : Sun,
          rain: Math.round(day.pop * 100),
          wind: Math.round(day.wind_speed),
          humidity: day.humidity,
          advice: "Check field conditions before planning work.",
        }));

        setForecast(mappedForecast);
        setAlerts(forecastData.alerts || []);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
      }
    };

    fetchWeather();
  }, []);

  if (!currentWeather)
    return <div className="p-4 text-center text-green-700">Fetching real-time weather...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-green-100 to-green-200">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.6 }} className="bg-green-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white mr-3 hover:bg-green-500">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Weather Forecast</h1>
            <p className="text-white/80">{currentWeather.location}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="p-4 space-y-6">
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-green-200/50 rounded-xl p-1">
            <TabsTrigger value="current" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Current</TabsTrigger>
            <TabsTrigger value="forecast" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">7-Day</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">History</TabsTrigger>
          </TabsList>

          {/* Current */}
          <TabsContent value="current" className="space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="bg-white shadow-md border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-5xl font-bold text-green-700 mb-2">{currentWeather.temp}°C</div>
                      <p className="text-lg text-gray-500">{currentWeather.condition}</p>
                      <p className="text-sm text-gray-500">Feels like {currentWeather.feelsLike}°C</p>
                    </div>
                    <Cloud className="w-24 h-24 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {alerts.length > 0 && (
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.3 }}>
                <Card className="bg-white border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-700 flex items-center">
                      <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
                      Weather Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {alerts.map((alert, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{alert.event}</h4>
                          <Badge variant="destructive">High</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Forecast */}
          <TabsContent value="forecast" className="space-y-4">
            {forecast.length === 0 ? (
              <div className="text-center text-gray-500">Loading forecast...</div>
            ) : (
              forecast.map((day, index) => (
                <motion.div key={index} initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: index * 0.1 }}>
                  <Card className={`cursor-pointer border-green-200 transition-all ${selectedDay === index ? "ring-2 ring-green-600" : ""}`} onClick={() => setSelectedDay(index)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-semibold">{day.day}</p>
                          <p className="text-sm text-gray-500">{day.date}</p>
                        </div>
                        <day.icon className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium">{day.condition}</p>
                          <p className="text-sm text-green-700">{day.rain}% rain</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{day.high}°</p>
                        <p className="text-sm text-gray-500">{day.low}°</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="border-green-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center">
                    <Calendar className="w-6 h-6 mr-2" />
                    Historical Weather Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {forecast.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium">{month.day}</p>
                          <p className="text-xs text-gray-500">Forecast data</p>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <Thermometer className="w-5 h-5 mx-auto mb-1 text-red-500" />
                            <p className="font-medium">{month.high}°C</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
