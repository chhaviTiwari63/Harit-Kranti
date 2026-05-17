import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, LogOut, User, Menu, X, Globe, Volume2, Bell, Settings, Wifi } from "lucide-react";

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onOpenAuth: (mode: "login" | "register") => void;
}

export default function Navbar({ user, onLogout, onOpenAuth }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [ttsEnabled, setTtsEnabled] = React.useState(false);

  const scrollToAlerts = () => {
    const el = document.getElementById("alerts-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/dashboard");
      setTimeout(() => {
        const target = document.getElementById("alerts-section");
        target?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Weather", path: "/weather" },
    { name: "Pest Detection", path: "/pest-detection" },
    { name: "Market Prices", path: "/market-prices" },
    { name: "Chat", path: "/chat" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-green-200/50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              <Sprout className="h-8 w-8 text-green-600 animate-pulse" />
              <span className="text-xl font-extrabold tracking-tight">Smart Crop Advisory</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-green-700 ${
                  isActive(link.path)
                    ? "text-green-700 font-semibold border-b-2 border-green-600 pb-1"
                    : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Profile / Auth Action */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2.5">
                {/* Online Indicator */}
                <div className="flex items-center space-x-1.5 bg-green-50 text-green-700 border border-green-150 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                  <Wifi className="h-3.5 w-3.5 text-green-600 animate-pulse" />
                  <span>Online</span>
                </div>

                {/* Language pill */}
                <div className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition">
                  <Globe className="h-3.5 w-3.5 text-gray-500" />
                  <span>English</span>
                </div>

                {/* Auto TTS Toggle */}
                <div
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`flex items-center space-x-1.5 border px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition duration-200 select-none ${
                    ttsEnabled
                      ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                      : "bg-white hover:bg-slate-50 text-gray-700 border-slate-200"
                  }`}
                >
                  <Volume2 className={`h-3.5 w-3.5 ${ttsEnabled ? "text-white" : "text-gray-500"}`} />
                  <span>Auto TTS {ttsEnabled ? "On" : "Off"}</span>
                </div>

                {/* Active Alerts Badge Button */}
                <div
                  onClick={scrollToAlerts}
                  className="flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-150 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm cursor-pointer transition duration-200"
                >
                  <Bell className="h-3.5 w-3.5 text-red-500 animate-swing" />
                  <span>Active Alerts</span>
                  <span className="bg-red-500 text-white rounded-full px-1.5 py-0.2 ml-1 text-[10px] font-black leading-none flex items-center justify-center min-h-[16px] min-w-[16px]">
                    4
                  </span>
                </div>

                {/* Settings indicator */}
                <div className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-gray-500 cursor-pointer shadow-sm transition">
                  <Settings className="h-4 w-4 animate-spin-slow" />
                </div>

                {/* Profile Card wrapper */}
                <div className="flex items-center space-x-1.5 bg-green-50 text-green-700 border border-green-150 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                  <User className="h-3.5 w-3.5" />
                  <span>Profile</span>
                </div>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-2.5 h-9 font-semibold text-xs transition duration-200"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => onOpenAuth("login")}
                  className="text-green-700 hover:text-green-800 hover:bg-green-50 rounded-xl text-xs font-bold"
                >
                  Login
                </Button>
                <Button
                  onClick={() => onOpenAuth("register")}
                  className="bg-green-600 text-white hover:bg-green-700 shadow-md rounded-xl text-xs font-bold"
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-green-700" /> : <Menu className="h-6 w-6 text-green-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-green-100 bg-white/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive(link.path)
                  ? "bg-green-50 text-green-700 font-semibold"
                  : "text-muted-foreground hover:bg-green-50/50 hover:text-green-700"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-green-100 flex flex-col space-y-2">
            {user ? (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 px-3 py-2 text-green-700 font-medium">
                  <User className="h-5 w-5" />
                  <span>Hello, {user.name}</span>
                </div>
                <Button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenAuth("login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-green-700 border-green-200 hover:bg-green-50"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    onOpenAuth("register");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
