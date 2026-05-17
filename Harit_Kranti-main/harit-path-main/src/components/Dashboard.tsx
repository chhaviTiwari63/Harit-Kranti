import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  CloudSun,
  ShieldAlert,
  Coins,
  MessageSquareCode,
  CalendarDays,
  Users,
  Plus,
  Trash2,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Thermometer,
  Droplets,
  Wind,
  Bell,
} from "lucide-react";

interface DashboardProps {
  onNavigate: (screen: string) => void;
  userLanguage: string;
}

interface Task {
  id: string;
  text: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

export default function Dashboard({ onNavigate, userLanguage }: DashboardProps) {
  const { toast } = useToast();
  const [farmerName, setFarmerName] = useState("Farmer");
  const [farmerState, setFarmerState] = useState("India");

  // Localized weather info
  const [temp, setTemp] = useState("28");
  const [weatherDesc, setWeatherDesc] = useState("Clear Sky");

  // Task state
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "💧 Irrigate crop field", priority: "High", completed: false },
    { id: "2", text: "🧪 Check NPK / soil health report", priority: "High", completed: true },
    { id: "3", text: "🌾 Apply neem oil bio-spray to leaves", priority: "Medium", completed: false },
    { id: "4", text: "🚜 Schedule tractor maintenance", priority: "Low", completed: false },
    { id: "5", text: "🥬 Check latest mandi rates for Wheat", priority: "Low", completed: false },
  ]);

  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");

  // Load user data on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setFarmerName(parsed.name || "Farmer");
      setFarmerState(parsed.state || "Uttar Pradesh");
    }

    // Try fetching live weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&appid=49d8ff3c12808b60573e0301c6681d4c`
            );
            if (res.ok) {
              const data = await res.json();
              setTemp(Math.round(data.main.temp).toString());
              setWeatherDesc(data.weather[0].description);
            }
          } catch {}
        },
        () => {}
      );
    }
  }, []);

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const updated = !t.completed;
          if (updated) {
            toast({
              title: "Task Done!",
              description: `"${t.text}" completed!`,
            });
          }
          return { ...t, completed: updated };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      priority: newTaskPriority,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskText("");
    toast({
      title: "Task Added",
      description: "Added to your crop maintenance task tracker.",
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    toast({
      title: "Task Removed",
      variant: "destructive",
    });
  };

  // Completion calculation
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Quick action config
  const quickActions = [
    {
      title: "Crop Advisory",
      desc: "NPK guides & companion recommendations.",
      icon: Sprout,
      screen: "soil-health",
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Weather Forecast",
      desc: "Localized forecast & fieldwork alerts.",
      icon: CloudSun,
      screen: "weather",
      color: "from-blue-500 to-sky-600",
    },
    {
      title: "Pest Detection",
      desc: "Scan crop images & view treatments.",
      icon: ShieldAlert,
      screen: "pest-detection",
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Market Prices",
      desc: "Track live regional Mandi rates.",
      icon: Coins,
      screen: "market-prices",
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "AI Chat Assistant",
      desc: "Agronomic advice in your language.",
      icon: MessageSquareCode,
      screen: "chat",
      color: "from-purple-500 to-indigo-600",
    },
    {
      title: "Farm Calendar",
      desc: "Schedules & harvest logs.",
      icon: CalendarDays,
      screen: "calendar",
      color: "from-rose-500 to-pink-600",
    },
    {
      title: "Farmer Community",
      desc: "Connect and share with others.",
      icon: Users,
      screen: "community",
      color: "from-cyan-500 to-blue-600",
    },
  ];

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* 🌾 Mandi Live scrolling Ticker */}
      <div className="w-full bg-green-900 text-green-100 py-2.5 overflow-hidden relative border-b border-green-800 shadow-inner">
        <div className="animate-marquee flex items-center space-x-12 whitespace-nowrap text-sm font-semibold tracking-wider">
          {[1, 2].map((loop) => (
            <React.Fragment key={loop}>
              <span className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span>🌾 WHEAT: ₹2,450/q (+1.5%)</span>
              </span>
              <span>🍚 RICE: ₹3,800/q (-0.5%)</span>
              <span>🌽 MAIZE: ₹2,100/q (+2.1%)</span>
              <span>🥔 POTATO: ₹1,500/q (+3.8%)</span>
              <span>🧅 ONION: ₹2,200/q (-4.2%)</span>
              <span>🍅 TOMATO: ₹1,800/q (+8.5%)</span>
              <span>🥬 MUSTARD: ₹5,600/q (+1.2%)</span>
              <span>🥛 COTTON: ₹6,800/q (+0.7%)</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6 pb-12">
        {/* Welcome Dashboard Banner */}
        <div className="bg-gradient-to-br from-green-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 border border-green-600">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {farmerName}!
            </h1>
            <p className="text-green-100 font-medium text-base">
              Here is your custom daily farm summary. Keep your soil and plants healthy!
            </p>
            <div className="flex items-center space-x-2 text-green-200/90 text-sm font-semibold">
              <MapPin className="h-4 w-4" />
              <span>Registered region: {farmerState}</span>
            </div>
          </div>

          {/* Quick Weather Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center space-x-4 min-w-[200px]">
            <CloudSun className="h-12 w-12 text-yellow-300" />
            <div>
              <div className="text-2xl font-bold">{temp}°C</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-green-100">
                {weatherDesc}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Agricultural Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Temperature card */}
          <Card className="border border-green-100 rounded-3xl shadow-md bg-white p-5 space-y-4 hover:shadow-lg transition duration-200">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Temperature</span>
              <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                <Thermometer className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-gray-900">{temp}°C</div>
              <div className="text-xs font-semibold text-gray-400 capitalize">{weatherDesc}</div>
            </div>
          </Card>

          {/* Humidity card */}
          <Card className="border border-green-100 rounded-3xl shadow-md bg-white p-5 space-y-4 hover:shadow-lg transition duration-200">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Humidity</span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Droplets className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-gray-900">12%</div>
              <div className="text-xs font-bold text-blue-600">Soil: Very Low</div>
            </div>
          </Card>

          {/* Wind Speed card */}
          <Card className="border border-green-100 rounded-3xl shadow-md bg-white p-5 space-y-4 hover:shadow-lg transition duration-200">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Wind Speed</span>
              <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                <Wind className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-gray-900">4.43 m/s</div>
              <div className="text-xs font-semibold text-emerald-600">Excellent - Ideal for operations</div>
            </div>
          </Card>

          {/* Pest Risk card */}
          <Card className="border border-green-100 rounded-3xl shadow-md bg-white p-5 space-y-4 hover:shadow-lg transition duration-200">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wide">
              <span>Pest Risk</span>
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-red-600">Low</div>
              <div className="text-xs font-semibold text-gray-400">Extreme temperatures limit pest activity</div>
            </div>
          </Card>
        </div>

        {/* Dashboard Panels: Checklist & Active Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Alerts Panel (Takes 2 Columns) */}
          <Card id="alerts-section" className="lg:col-span-2 border border-red-100 shadow-md rounded-3xl bg-white flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-150 pb-3">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-red-950 flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-red-655 animate-bounce" />
                  <span>Active Alerts</span>
                </h3>
                <p className="text-xs text-gray-400 font-medium">Important notifications for your farm</p>
              </div>
              <Badge className="bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-1 rounded-full text-xs">
                4 Active
              </Badge>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {[
                {
                  text: "Heavy rainfall expected in next 24 hours. Protect your crops and ensure proper drainage.",
                  severity: "high",
                  color: "bg-orange-50 border-orange-100 text-orange-900",
                  badge: "bg-orange-600 text-white",
                },
                {
                  text: "Brown plant hopper detected in nearby farms. Immediate action recommended.",
                  severity: "critical",
                  color: "bg-red-50 border-red-100 text-red-950",
                  badge: "bg-red-600 text-white animate-pulse",
                },
                {
                  text: "Heatwave alert: Soil moisture evaporation rates are elevated. Increase watering cycles.",
                  severity: "high",
                  color: "bg-orange-50 border-orange-100 text-orange-900",
                  badge: "bg-orange-600 text-white",
                },
                {
                  text: "Advisory: Wheat yellow rust alert issued for neighboring state divisions.",
                  severity: "medium",
                  color: "bg-yellow-50 border-yellow-100 text-yellow-900",
                  badge: "bg-yellow-500 text-black",
                },
              ].map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-4 rounded-2xl border ${alert.color} hover:scale-[1.005] transition-all`}
                >
                  <p className="text-sm font-semibold leading-relaxed flex-1 pr-4">{alert.text}</p>
                  <Badge className={`text-[10px] uppercase font-bold tracking-wider rounded-lg px-2.5 py-0.5 shadow-sm ${alert.badge}`}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Daily Farm Task Tracker (Takes 1 Column) */}
          <Card className="lg:col-span-1 border border-green-100 shadow-md rounded-3xl bg-white flex flex-col max-h-[420px]">
            <CardHeader className="border-b border-green-50 pb-4">
              <CardTitle className="text-xl font-bold text-green-800 flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Daily Farming Checklist</span>
              </CardTitle>
              {/* Progress Tracker */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Progress</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <Progress value={progressPercent} className="h-2.5 bg-green-50 text-green-600" />
              </div>
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col justify-between overflow-hidden">
              {/* Task Items Scroll list */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[170px]">
                <AnimatePresence initial={false}>
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={`flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-green-50/20 transition-all ${
                        task.completed ? "opacity-60 bg-slate-50 border-slate-100" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => handleToggleTask(task.id)}>
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleTask(task.id)}
                          className="border-green-300 text-green-600 focus:ring-green-400 rounded"
                        />
                        <span className={`text-sm font-semibold text-gray-700 ${task.completed ? "line-through text-gray-400" : ""}`}>
                          {task.text}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            task.priority === "High"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : task.priority === "Medium"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                          }`}
                        >
                          {task.priority}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add New Task Form */}
              <form onSubmit={handleAddTask} className="border-t border-green-50 pt-4 space-y-3 mt-3">
                <Input
                  placeholder="Create custom task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="rounded-xl border-green-200 h-9 text-xs"
                />
                <div className="flex justify-between items-center space-x-2">
                  <div className="flex space-x-1">
                    {(["High", "Medium", "Low"] as const).map((pri) => (
                      <button
                        key={pri}
                        type="button"
                        onClick={() => setNewTaskPriority(pri)}
                        className={`text-[10px] px-2 py-1 rounded-full font-bold border transition ${
                          newTaskPriority === pri
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {pri}
                      </button>
                    ))}
                  </div>
                  <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-8 px-3 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Navigation Grid (Full 100% Width Layout below) */}
        <div className="space-y-4">
          <div className="border-b border-green-150 pb-2">
            <h3 className="text-xl font-bold text-green-900 flex items-center space-x-2">
              <Sprout className="h-5 w-5 text-green-600" />
              <span>Quick Actions</span>
            </h3>
            <p className="text-xs text-gray-400 font-semibold">Access agricultural services instantly</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <Card
                key={i}
                onClick={() => onNavigate(action.screen)}
                className="group cursor-pointer hover:shadow-xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-0.5 rounded-3xl border border-green-50 overflow-hidden bg-white shadow-md"
              >
                <CardContent className="p-5 flex items-center space-x-4">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-md`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-green-950 group-hover:text-green-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-450 text-[11px] font-semibold leading-normal">
                      {action.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
