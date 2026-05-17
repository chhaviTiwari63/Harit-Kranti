import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, CloudSun, ShieldAlert, BadgeIndianRupee, ChevronRight } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Automatically redirect to /dashboard if already logged in
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50/40 to-white flex flex-col justify-between">
      {/* Header Navbar */}
      <Navbar user={user} onLogout={handleLogout} onOpenAuth={handleOpenAuth} />

      {/* Hero Section */}
      <section className="relative px-6 py-16 sm:py-24 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-green-200">
          <Sprout className="h-4 w-4 animate-bounce" />
          <span>Next-Generation Agricultural Technology</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-green-900 tracking-tight leading-tight">
          AI-Powered Farm Advisory <br />
          <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
            & Pest Detection
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
          Maximize your crop yields with real-time agronomic insights, soil intelligence, and automated disease diagnosis.
        </p>
        <div className="flex justify-center space-x-4 pt-4">
          <Button
            onClick={() => handleOpenAuth("register")}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg px-8 py-6 text-lg font-bold flex items-center transition-all hover:scale-105"
          >
            <span>Get Started</span>
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOpenAuth("login")}
            className="border-green-300 text-green-700 hover:bg-green-50 rounded-xl px-8 py-6 text-lg font-bold"
          >
            Farmer Sign In
          </Button>
        </div>
      </section>

      {/* Core Feature Action Cards */}
      <section className="max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: "Crop Advisory",
            description: "Get personalized checklists, Companion crop recommendations, and complete DAP/NPK fertilizer guides.",
            icon: Sprout,
            color: "text-green-600 bg-green-100 border-green-200",
          },
          {
            title: "Weather Forecast",
            description: "View localized 7-day agronomic forecasts and receive direct field-work weather alerts.",
            icon: CloudSun,
            color: "text-blue-600 bg-blue-100 border-blue-200",
          },
          {
            title: "Pest Detection",
            description: "Scan your plants with the AI camera to identify infestations and read bio-treatment guidelines instantly.",
            icon: ShieldAlert,
            color: "text-amber-600 bg-amber-100 border-amber-200",
          },
          {
            title: "Market Prices",
            description: "Track live regional crop rates, mandi price charts, and mandi inflation tickers.",
            icon: BadgeIndianRupee,
            color: "text-emerald-600 bg-emerald-100 border-emerald-200",
          },
        ].map((feat, i) => (
          <Card
            key={i}
            onClick={() => handleOpenAuth("register")}
            className="group cursor-pointer rounded-2xl border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
          >
            <CardContent className="p-6 space-y-4">
              <div className={`p-3 rounded-xl inline-flex ${feat.color} border`}>
                <feat.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-green-900 group-hover:text-green-700 transition-colors">
                {feat.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {feat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Trust & Proof Section */}
      <section className="bg-green-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Trusted by 10,000+ Farmers</h2>
            <p className="text-green-200/80 font-medium">Driving agricultural security across rural India.</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold text-green-300">98%</div>
              <div className="text-xs text-green-200 font-medium">Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-green-300">24/7</div>
              <div className="text-xs text-green-200 font-medium">Support</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-green-300">15+</div>
              <div className="text-xs text-green-200 font-medium">States</div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
