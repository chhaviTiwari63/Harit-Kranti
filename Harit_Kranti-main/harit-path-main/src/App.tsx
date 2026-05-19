import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import VoiceAssistant from "@/components/VoiceAssistant";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./components/Dashboard";
import Community from "./components/Community";
import PestDetection from "./components/PestDetection";
import WeatherDetails from "./components/WeatherDetails";
import FarmCalendar from "./components/FarmCalendar";
import ChatAssistant from "./components/ChatAssistant";
import MarketPrice from "./components/MarketPrices";
import CropAdvisory from "./components/CropAdvisory";

const queryClient = new QueryClient();

// Main Layout Wrapper that shares user state across all pages
function MainLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    window.dispatchEvent(new CustomEvent("harit-user-updated"));
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleNavigation = (screen: string) => {
    if (!user) {
      handleOpenAuth("register");
      return;
    }
    navigate(`/${screen}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Premium Global Navbar */}
      <Navbar user={user} onLogout={handleLogout} onOpenAuth={handleOpenAuth} />

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Global Auth Dialog */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Floating Voice commands assistant */}
      {user && <VoiceAssistant onNavigate={handleNavigation} />}
    </div>
  );
}

// Protected route to restrict access to authenticated farmers
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    return <Navigate to="/" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

// Stateful Wrappers to pass navigations cleanly
const DashboardWrapper = () => {
  const navigate = useNavigate();
  return <Dashboard onNavigate={(screen) => navigate(`/${screen}`)} userLanguage="en" />;
};

const PestDetectionWrapper = () => {
  const navigate = useNavigate();
  return <PestDetection onBack={() => navigate("/dashboard")} />;
};

const WeatherWrapper = () => {
  const navigate = useNavigate();
  return <WeatherDetails onBack={() => navigate("/dashboard")} />;
};

const MarketPriceWrapper = () => {
  const navigate = useNavigate();
  return <MarketPrice onBack={() => navigate("/dashboard")} />;
};

const ChatWrapper = () => {
  const navigate = useNavigate();
  return <ChatAssistant onBack={() => navigate("/dashboard")} userLanguage="en" />;
};

const CropAdvisoryWrapper = () => {
  const navigate = useNavigate();
  return <CropAdvisory onBack={() => navigate("/dashboard")} user={null} />;
};

const CalendarWrapper = () => {
  const navigate = useNavigate();
  return <FarmCalendar onBack={() => navigate("/dashboard")} />;
};

const CommunityWrapper = () => {
  const navigate = useNavigate();
  return <Community onBack={() => navigate("/dashboard")} userLanguage="en" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Hero Landing Page */}
          <Route path="/" element={<Index />} />

          {/* Secure Farming Portal Endpoints */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pest-detection"
            element={
              <ProtectedRoute>
                <PestDetectionWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <WeatherWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/market-prices"
            element={
              <ProtectedRoute>
                <MarketPriceWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/soil-health"
            element={
              <ProtectedRoute>
                <CropAdvisoryWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <CommunityWrapper />
              </ProtectedRoute>
            }
          />

          {/* Fallback Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
