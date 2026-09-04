import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./components/Dashboard";
import Community from "./components/Community";
import PestDetection from "./components/PestDetection";
import WeatherDetails from "./components/WeatherDetails";
import FarmCalendar from "./components/FarmCalendar";
import ChatAssistant from "./components/ChatAssistant";
import MarketPrice from "./components/MarketPrices";

const queryClient = new QueryClient();

// ✅ Wrapper for Dashboard
const DashboardWrapper = () => {
  const navigate = useNavigate();
  return (
    <Dashboard
      userLanguage="en"
      onNavigate={(screen) => navigate(`/${screen}`)}
    />
  );
};

// ✅ Wrapper for Community
const CommunityWrapper = () => {
  const navigate = useNavigate();
  return <Community userLanguage="en" onBack={() => navigate(-1)} />;
};

// ✅ Wrapper for PestDetection
const PestDetectionWrapper = () => {
  const navigate = useNavigate();
  try {
    return <PestDetection onBack={() => navigate(-1)} />;
  } catch (error) {
    console.error("❌ PestDetection crashed:", error);
    return <div className="p-4 text-red-500">Something went wrong loading Pest Detection.</div>;
  }
};

// ✅ Wrapper for WeatherDetails
const WeatherWrapper = () => {
  const navigate = useNavigate();
  return <WeatherDetails onBack={() => navigate(-1)} />;
};

// ✅ Wrapper for FarmCalendar
const CalendarWrapper = () => {
  const navigate = useNavigate();
  return <FarmCalendar onBack={() => navigate(-1)} />;
};

// ✅ Wrapper for ChatAssistant
const ChatWrapper = () => {
  const navigate = useNavigate();
  return <ChatAssistant onBack={() => navigate(-1)} userLanguage="en" />;
};

// ✅ Wrapper for MarketPrice
const MarketPriceWrapper = () => {
  const navigate = useNavigate();
  return <MarketPrice onBack={() => navigate(-1)} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Index />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardWrapper />} />

          {/* Community */}
          <Route path="/community" element={<CommunityWrapper />} />

          {/* Pest Detection */}
          <Route path="/pest-detection" element={<PestDetectionWrapper />} />

          {/* Weather */}
          <Route path="/weather" element={<WeatherWrapper />} />

          {/* Farm Calendar */}
          <Route path="/calendar" element={<CalendarWrapper />} />

          {/* Chat Assistant */}
          <Route path="/chat" element={<ChatWrapper />} />

          {/* Market Prices */}
          <Route path="/market-prices" element={<MarketPriceWrapper />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
