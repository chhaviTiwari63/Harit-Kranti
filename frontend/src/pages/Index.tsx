import { useState } from "react";
import OnboardingScreen, { OnboardingData } from "../components/OnboardingScreen"; 
import Dashboard from "@/components/Dashboard";
import ChatAssistant from "@/components/ChatAssistant";
import PestDetection from "@/components/PestDetection";
import WeatherDetails from "@/components/WeatherDetails";
import FarmCalendar from "@/components/FarmCalendar";
import Community from "@/components/Community";
import MarketPrice from "@/components/MarketPrices"; 
import { Screen } from "@/types/screens";

// Language options
type Language = "en" | "hi";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen | "language-select">("language-select");
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
    setCurrentScreen("onboarding");
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    setUserData(data);
    setCurrentScreen("dashboard");
  };

  const handleNavigation = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen("dashboard");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "language-select":
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-100 to-green-200">
            <h1 className="text-3xl font-bold mb-6 text-green-800">Select Your Language</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => handleLanguageSelect("en")}
                className="px-6 py-3 bg-green-700 text-white rounded-xl shadow hover:bg-green-800 transition"
              >
                English
              </button>
              <button
                onClick={() => handleLanguageSelect("hi")}
                className="px-6 py-3 bg-green-700 text-white rounded-xl shadow hover:bg-green-800 transition"
              >
                हिन्दी
              </button>
            </div>
          </div>
        );

      case "onboarding":
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;

      case "dashboard":
        return (
          <Dashboard
            onNavigate={handleNavigation}
            userLanguage={selectedLanguage || "en"}
          />
        );

      case "chat":
      case "voice-assistant":
        return (
          <ChatAssistant
            onBack={handleBack}
            userLanguage={selectedLanguage || "en"}
          />
        );

      case "pest-detection":
        return <PestDetection onBack={handleBack} />;

      case "weather":
        return <WeatherDetails onBack={handleBack} />;

      case "market-prices":
        return <MarketPrice onBack={handleBack} />;

      case "community":
        return (
          <Community
            userLanguage={selectedLanguage || "en"}
            onBack={handleBack}
          />
        );

      case "soil-health":
        return (
          <PlaceholderScreen
            title="🌍 Soil Health"
            description="Comprehensive soil analysis tools coming soon!"
            onBack={handleBack}
          />
        );

      case "advisory-details":
        return (
          <PlaceholderScreen
            title="📖 Detailed Advisory"
            description="In-depth crop advisory system coming soon!"
            onBack={handleBack}
          />
        );

      case "calendar":
        return <FarmCalendar onBack={handleBack} />;

      default:
        return (
          <Dashboard
            onNavigate={handleNavigation}
            userLanguage={selectedLanguage || "en"}
          />
        );
    }
  };

  return <div className="min-h-screen scroll-smooth">{renderScreen()}</div>;
};

// Placeholder screen for coming soon features
const PlaceholderScreen = ({
  title,
  description,
  onBack,
}: {
  title: string;
  description: string;
  onBack: () => void;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-green-200 p-4 flex items-center justify-center">
    <div className="text-center max-w-lg">
      <h1 className="text-3xl font-bold text-green-800 mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">{description}</p>
      <button
        onClick={onBack}
        className="bg-green-700 text-white px-6 py-3 rounded-xl shadow-md hover:bg-green-800 transition"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
);

export default Index;
