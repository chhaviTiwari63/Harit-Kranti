// Dashboard.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Screen } from "@/types/screens";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { Bell, Settings } from "lucide-react";
import marketIcon from "@/assets/WhatsApp Image 2025-09-19 at 06.18.07_c217dfff.jpg";
import communityImage from "@/assets/WhatsApp Image 2025-09-19 at 06.18.06_46c59b7e.jpg";
import weatherImage from "@/assets/WhatsApp Image 2025-09-19 at 06.18.06_e2b3ccdc.jpg";
import soilImage from "@/assets/WhatsApp Image 2025-09-19 at 06.18.06_e2b3ccdc.jpg";
import pestImage from "@/assets/WhatsApp Image 2025-09-19 at 06.38.03_614cb0be.jpg";
import aiAssistantImage from "@/assets/WhatsApp Image 2025-09-19 at 06.18.07_2a030f59.jpg";
import farmCalendarImage from "@/assets/WhatsApp Image 2025-09-19 at 07.00.01_50543af8.jpg"; 

interface Section {
  title: string;
  icon: string;
  content: string | JSX.Element;
  screen: Screen;
  bgGradient: string;
}

const sections: Section[] = [
  {
    title: "Weather Forecast",
    icon: weatherImage,
    content: (
      <>
        ☀ 26°C | Partly Cloudy
        <div className="flex space-x-6 mt-2">
          <div className="flex items-center space-x-1">
            💧 <span>65%</span>
          </div>
          <div className="flex items-center space-x-1">
            🌬 <span>12 km/h</span>
          </div>
        </div>
      </>
    ),
    screen: "weather",
    bgGradient: "from-green-100/80 to-green-300/60",
  },
  {
    title: "Soil Health",
    icon: soilImage,
    content: "Analyze soil quality and get crop-specific advice.",
    screen: "soil-health",
    bgGradient: "from-emerald-100/80 to-emerald-300/60",
  },
  {
    title: "Pest Detection",
    icon: pestImage,
    content: "Upload crop images to detect pests instantly.",
    screen: "pest-detection",
    bgGradient: "from-lime-100/80 to-lime-300/60",
  },
  {
    title: "AI Assistant",
    icon: aiAssistantImage,
    content: "Chat or talk for instant farming guidance.",
    screen: "chat",
    bgGradient: "from-green-200/80 to-green-400/60",
  },
  {
    title: "Community",
    icon: communityImage,
    content: "Connect & share with other farmers.",
    screen: "community",
    bgGradient: "from-teal-100/80 to-teal-300/60",
  },
  {
    title: "Farm Calendar",
    icon: farmCalendarImage,
    content: "Smart reminders & seasonal planning.",
    screen: "calendar",
    bgGradient: "from-green-50/80 to-green-200/60",
  },
  {
    title: "Market Prices",
    icon: marketIcon,
    content: "Track latest crop prices in your region.",
    screen: "market-prices",
    bgGradient: "from-yellow-100/80 to-green-200/60",
  },
];

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  userLanguage: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, userLanguage }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-green-50 to-green-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* Top Bar */}
      <motion.div
        className="flex justify-between items-center px-6 py-4 bg-green-200/70 backdrop-blur-lg sticky top-0 z-10 rounded-b-3xl shadow-md"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <motion.h1
          className="text-3xl font-extrabold text-green-900 drop-shadow-md flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          🌱 Harit Kranti
        </motion.h1>
        <div className="flex items-center space-x-4">
          <motion.button
            className="relative p-2 bg-white/70 rounded-full hover:scale-110 hover:shadow-lg transition-all duration-300"
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="w-6 h-6 text-green-800" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1 animate-bounce">
              2
            </span>
          </motion.button>
          <motion.button
            onClick={() => onNavigate("settings")}
            className="p-2 bg-white/70 rounded-full hover:scale-110 hover:shadow-lg transition-all duration-300"
            whileTap={{ rotate: 30, scale: 0.9 }}
          >
            <Settings className="w-6 h-6 text-green-800" />
          </motion.button>
        </div>
      </motion.div>

      {/* Language Badge */}
      <motion.div
        className="text-center my-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <span className="inline-block bg-green-700 text-white px-6 py-3 rounded-full shadow-lg text-lg tracking-wide">
          {userLanguage.toUpperCase()} 🌍
        </span>
      </motion.div>

      {/* Cards with animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-20">
        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: idx * 0.15, duration: 0.8, type: "spring" }}
          >
            <Tilt
              tiltMaxAngleX={10}
              tiltMaxAngleY={10}
              glareEnable={true}
              glareMaxOpacity={0.15}
              transitionSpeed={1500}
            >
              <Card
                onClick={() => onNavigate(section.screen)}
                className={`cursor-pointer bg-gradient-to-r ${section.bgGradient} rounded-3xl shadow-xl border border-green-200 backdrop-blur-sm p-4 hover:shadow-2xl transform hover:scale-105 transition duration-500`}
              >
                <CardHeader className="flex items-center space-x-4">
                  <motion.img
                    src={section.icon}
                    className="w-12 h-12"
                    alt={section.title}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  />
                  <CardTitle className="text-xl font-bold text-green-900">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-green-800 mt-2 text-base">
                  {section.content}
                </CardContent>
              </Card>
            </Tilt>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Dashboard;
