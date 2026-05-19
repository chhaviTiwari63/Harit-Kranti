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
  AlertTriangle,
  Cloud,
  Bug,
  CheckCheck,
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

type AlertSeverity = "high" | "critical" | "medium";
type AlertCategory = "weather" | "pest" | "market";

interface FarmAlert {
  id: string;
  category: AlertCategory;
  text: string;
  severity: AlertSeverity;
  read: boolean;
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

  const [farmAlerts, setFarmAlerts] = useState<FarmAlert[]>([
    {
      id: "a1",
      category: "weather",
      text: "Heavy rainfall expected in next 24 hours. Protect your crops and ensure proper drainage.",
      severity: "high",
      read: false,
    },
    {
      id: "a2",
      category: "pest",
      text: "Brown plant hopper detected in nearby farms. Immediate action recommended.",
      severity: "critical",
      read: false,
    },
    {
      id: "a3",
      category: "market",
      text: "Wheat prices increased by 8% in Ludhiana mandi. Good time to sell.",
      severity: "medium",
      read: false,
    },
    {
      id: "a4",
      category: "weather",
      text: "Heatwave alert: Soil moisture evaporation rates are elevated. Increase watering cycles.",
      severity: "high",
      read: false,
    },
    {
      id: "a5",
      category: "pest",
      text: "Advisory: Wheat yellow rust alert issued for neighboring state divisions.",
      severity: "medium",
      read: false,
    },
  ]);

  const unreadAlertCount = farmAlerts.filter((a) => !a.read).length;

  const markAlertRead = (id: string) => {
    setFarmAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const markAllAlertsRead = () => {
    if (unreadAlertCount === 0) return;
    setFarmAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    toast({
      title: "All caught up",
      description: "Every alert in this list is marked as read.",
    });
  };

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

        {/* Dashboard Panels: Checklist & Active Alerts (catalog-style) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card id="alerts-section" className="lg:col-span-2 border border-green-100 shadow-md rounded-3xl bg-white flex flex-col overflow-hidden">
            <div className="p-6 pb-4 border-b border-green-50 bg-gradient-to-r from-green-50/40 to-white">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xl font-bold text-green-900 flex flex-wrap items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 text-green-700 border border-green-200/80 shrink-0">
                      <Bell className="h-5 w-5" />
                    </span>
                    <span>Active Alerts</span>
                    {unreadAlertCount > 0 && (
                      <Badge className="bg-red-500 text-white border-0 font-bold rounded-full px-2 py-0.5 text-[10px] min-w-[1.25rem] justify-center">
                        {unreadAlertCount}
                      </Badge>
                    )}
                  </h3>
                  <p className="text-xs text-green-700/80 font-medium">
                    Important notifications for your farm — browse like a catalog
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={markAllAlertsRead}
                  disabled={unreadAlertCount === 0}
                  className="shrink-0 border-green-300 text-green-800 hover:bg-green-50 rounded-xl font-semibold gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all as read
                  {unreadAlertCount > 0 ? ` (${unreadAlertCount})` : ""}
                </Button>
              </div>
            </div>

            <div className="p-6 pt-5 flex-1 flex flex-col gap-4 min-h-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[340px] overflow-y-auto pr-1">
                {farmAlerts.map((alert) => {
                  const CategoryIcon = alert.category === "weather" ? Cloud : alert.category === "pest" ? Bug : TrendingUp;
                  const categoryLabel =
                    alert.category === "weather" ? "Weather" : alert.category === "pest" ? "Pest" : "Market";
                  const severityRing =
                    alert.severity === "critical"
                      ? "ring-red-200"
                      : alert.severity === "high"
                        ? "ring-orange-200"
                        : "ring-yellow-200";
                  const severityBadge =
                    alert.severity === "critical"
                      ? "bg-red-600 text-white"
                      : alert.severity === "high"
                        ? "bg-orange-600 text-white"
                        : "bg-amber-500 text-black";
                  const iconWrap =
                    alert.severity === "critical"
                      ? "bg-red-50 text-red-600 border-red-100"
                      : alert.severity === "high"
                        ? "bg-orange-50 text-orange-600 border-orange-100"
                        : "bg-amber-50 text-amber-700 border-amber-100";
                  return (
                    <Card
                      key={alert.id}
                      role={alert.read ? undefined : "button"}
                      tabIndex={alert.read ? -1 : 0}
                      onClick={() => !alert.read && markAlertRead(alert.id)}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && !alert.read) {
                          e.preventDefault();
                          markAlertRead(alert.id);
                        }
                      }}
                      className={`group relative rounded-2xl border border-green-100/80 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                        !alert.read ? `ring-2 ${severityRing} cursor-pointer` : "opacity-90 cursor-default"
                      }`}
                    >
                      {!alert.read && (
                        <span
                          className="absolute top-3 right-3 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"
                          aria-label="Unread"
                        />
                      )}
                      <CardContent className="p-4 flex flex-col gap-3 h-full">
                        <div className="flex items-start justify-between gap-2">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconWrap}`}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-800 border border-green-100">
                            {categoryLabel}
                          </Badge>
                        </div>
                        <p className={`text-sm font-semibold leading-snug text-gray-800 flex-1 ${alert.read ? "text-gray-500" : ""}`}>
                          {alert.text}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                          <div className="flex items-center gap-1.5 text-amber-700">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span className="text-[11px] font-bold uppercase text-gray-500">Priority</span>
                          </div>
                          <Badge className={`text-[10px] uppercase font-bold tracking-wider rounded-lg px-2.5 py-0.5 ${severityBadge}`}>
                            {alert.severity}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-green-200 text-green-800 hover:bg-green-50 rounded-xl font-semibold"
                onClick={() =>
                  toast({
                    title: "All alerts",
                    description: `You have ${farmAlerts.length} items in this catalog. Full history view can be added here.`,
                  })
                }
              >
                View all alerts ({farmAlerts.length})
              </Button>
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
