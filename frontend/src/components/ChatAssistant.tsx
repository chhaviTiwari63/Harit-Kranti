import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Bot,
  User,
  Leaf,
  MapPin
} from "lucide-react";

interface ChatAssistantProps {
  onBack: () => void;
  userLanguage: string;
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

// Translation dictionary
const translations: Record<string, any> = {
  hi: {
    welcome: "नमस्ते! मैं आपका स्मार्ट कृषि सहायक हूं। मैं फसल, मौसम, कीट नियंत्रण और बाजार की कीमतों के बारे में आपकी मदद कर सकता हूं। आप क्या जानना चाहते हैं?",
    quickSuggestions: ["आज का मौसम?", "गेहूं का भाव?", "कीट नियंत्रण", "सिंचाई सलाह"],
    placeholder: "अपना सवाल यहां लिखें...",
    listening: "सुन रहा हूं...",
    languageBadge: "हिंदी",
    botTitle: "Smart Farming Helper",
    botName: "AI सहायक",
    botResponses: {
      weather: "आज पुणे में आंशिक बादल छाए रहेंगे। तापमान 28°C रहेगा। कल बारिश की 80% संभावना है।",
      pest: "कीट नियंत्रण के लिए नीम तेल (2-3ml प्रति लीटर पानी) का छिड़काव करें।",
      price: "आज गेहूं ₹2,180, चावल ₹3,450 और कपास ₹6,200 भाव चल रहा है।",
      default: "मैं मदद करने के लिए यहां हूं! फसल, मौसम, कीट या बाजार में से क्या जानना चाहेंगे?"
    }
  },
  en: {
    welcome: "Hello! I'm your Smart Agricultural Assistant. I can help you with crops, weather, pest control, and market prices. What would you like to know?",
    quickSuggestions: ["What's the weather?", "Wheat price?", "Pest control", "Irrigation advice"],
    placeholder: "Type your question here...",
    listening: "Listening...",
    languageBadge: "English",
    botTitle: "Smart Farming Helper",
    botName: "AI Assistant",
    botResponses: {
      weather: "Today in Pune: Partly cloudy, 28°C. Tomorrow: 80% chance of rain.",
      pest: "For pest control, spray neem oil solution (2-3ml per liter water).",
      price: "Today's Pune market: Wheat ₹2,180, Rice ₹3,450, Cotton ₹6,200.",
      default: "Happy to help! Would you like info on crops, weather, pests, or market prices?"
    }
  }
};

export default function ChatAssistant({ onBack, userLanguage }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: translations[userLanguage].welcome,
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speakMessage = (text: string, language: string) => {
    if ("speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      utterance.rate = 0.9;
      synth.speak(utterance);
    }
  };

  useEffect(() => {
    if (audioEnabled && messages.length === 1) {
      setTimeout(() => {
        speakMessage(messages[0].content, userLanguage);
      }, 1000);
    }
  }, [audioEnabled, userLanguage, messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: generateBotResponse(inputMessage, userLanguage),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);

      if (audioEnabled) setTimeout(() => speakMessage(botResponse.content, userLanguage), 100);
    }, 1500);
  };

  const generateBotResponse = (input: string, language: string): string => {
    const lowerInput = input.toLowerCase();
    const t = translations[language].botResponses;

    if (lowerInput.includes("weather") || lowerInput.includes("मौसम")) return t.weather;
    if (lowerInput.includes("pest") || lowerInput.includes("कीट")) return t.pest;
    if (lowerInput.includes("price") || lowerInput.includes("market") || lowerInput.includes("बाजार")) return t.price;
    return t.default;
  };

  const startListening = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setInputMessage(
        userLanguage === "hi" ? "मेरी फसल में कीड़े लग गए हैं, क्या करूं?" : "My crops have pest problems, what should I do?"
      );
    }, 2000);
  };

  const quickSuggestions = translations[userLanguage].quickSuggestions;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-green-200 to-green-300 flex flex-col">
      {/* Header */}
      <motion.div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6 rounded-b-3xl shadow-lg"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white mr-3">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{translations[userLanguage].botName}</h1>
            <div className="flex items-center space-x-2 opacity-90">
              <Bot className="w-4 h-4" />
              <span>{translations[userLanguage].botTitle}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setAudioEnabled(!audioEnabled)} className="text-white">
            {audioEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </Button>
        </div>

        {/* Location + Language Badge */}
        <motion.div className="flex items-center space-x-2 text-white/80" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <MapPin className="w-4 h-4" />
          <span>Pune, Maharashtra</span>
          <motion.div whileHover={{ scale: 1.1, rotate: 3 }} whileTap={{ scale: 0.95 }}>
            <Badge className="ml-2 bg-green-200 text-green-800 shadow">{translations[userLanguage].languageBadge}</Badge>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <Card className={`max-w-[80%] rounded-2xl ${message.type === "user" ? "bg-green-600 text-white shadow-md" : "bg-white shadow-md border border-green-300"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow ${message.type === "user" ? "bg-green-500/40" : "bg-green-100"}`}>
                      {message.type === "user" ? <User className="w-5 h-5" /> : <Leaf className="w-5 h-5 text-green-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-base leading-relaxed">{message.content}</p>
                      <p className="text-xs mt-2 text-gray-500">{message.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-white border border-green-200 shadow-md rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                    <Leaf className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <motion.div className="p-4 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-center text-green-800 font-medium">{userLanguage === "hi" ? "त्वरित सुझाव:" : "Quick suggestions:"}</p>
          <div className="grid grid-cols-2 gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={() => setInputMessage(suggestion)} className="text-sm p-3 h-auto text-left break-words border-green-400 bg-green-50 hover:bg-green-100">{suggestion}</Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-green-50 border-t border-green-300">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder={translations[userLanguage].placeholder} className="h-12 pr-12 border-green-400 focus:ring-green-600" onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} />
            <Button variant="ghost" size="icon" onClick={startListening} disabled={isListening} className={`absolute right-1 top-1 h-10 w-10 ${isListening ? "bg-red-500 text-white" : "text-green-700"}`}>
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
          </div>
          <Button onClick={handleSendMessage} className="h-12 w-12 bg-green-600 hover:bg-green-700 text-white shadow">
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {isListening && (
          <p className="mt-2 text-center text-red-600 font-medium">🎤 {translations[userLanguage].listening}</p>
        )}
      </div>
    </div>
  );
}
