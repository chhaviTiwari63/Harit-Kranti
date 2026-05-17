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

    // Grab current messages to pass for memory context
    setMessages((prev) => {
      const updatedMessages = [...prev, userMessage];
      
      // Schedule bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: generateBotResponse(inputMessage, userLanguage, updatedMessages),
          timestamp: new Date(),
        };

        setMessages((p) => [...p, botResponse]);
        setIsTyping(false);

        if (audioEnabled) setTimeout(() => speakMessage(botResponse.content, userLanguage), 100);
      }, 1500);

      return updatedMessages;
    });

    setInputMessage("");
    setIsTyping(true);
  };

  const generateBotResponse = (input: string, language: string, currentMessages: Message[]): string => {
    const lowerInput = input.trim().toLowerCase();

    // 1. Conversational Memory Check: Grab previous bot message to see if user is replying to a suggestion
    const botMessages = currentMessages.filter((m) => m.type === "bot");
    const lastBotMsg = botMessages.length > 0 ? botMessages[botMessages.length - 1].content.toLowerCase() : "";

    const positiveTriggers = ["yes", "yep", "sure", "please", "ok", "okay", "yeah", "हाँ", "हा", "जरूर", "करो"];
    const isPositiveReply = positiveTriggers.some((t) => lowerInput === t || lowerInput.startsWith(t + " ") || lowerInput.endsWith(" " + t));

    if (isPositiveReply && lastBotMsg) {
      if (lastBotMsg.includes("companion planting guides") || lastBotMsg.includes("npk") || lastBotMsg.includes("fertilizer") || lastBotMsg.includes("सहयोगी")) {
        if (language === "hi") {
          return "बिल्कुल! यहाँ आपके लिए एक सहयोगी फसल सलाह है: मिट्टी में प्राकृतिक नाइट्रोजन के स्तर को बढ़ाने के लिए मक्का या कपास के साथ उड़द/लोबिया बोएं। बोने के समय प्रति एकड़ 50 किलोग्राम डीएपी (DAP) खाद का प्रयोग करें।";
        }
        return "Excellent choice! Grow legumes/beans alongside Maize or Cotton to naturally enrich soil nitrogen levels. During sowing, apply DAP at 50 kg per acre for strong root systems.";
      }
      if (lastBotMsg.includes("weather-smart") || lastBotMsg.includes("sowing calendars") || lastBotMsg.includes("कैलेंडर")) {
        if (language === "hi") {
          return "हाँ, आगामी खरीफ सीजन (जून-जुलाई) के लिए धान (चावल), मक्का, उड़द और कपास की बुवाई का सबसे सही समय है। बुवाई से पहले बीजोपचार अवश्य करें।";
        }
        return "Great! For the upcoming wet Kharif season (June-July), it is the perfect window to prepare nurseries for Rice (Paddy), Maize, and Cotton. Ensure you treat your seeds before sowing!";
      }
    }

    // 2. Specific Crop Suitability Check (Rice, Wheat, Maize, Cotton, etc.)
    const isRice = lowerInput.includes("rice") || lowerInput.includes("paddy") || lowerInput.includes("धान") || lowerInput.includes("चावल");
    const isWheat = lowerInput.includes("wheat") || lowerInput.includes("गेहूं") || lowerInput.includes("गेंहू");
    const isMaize = lowerInput.includes("maize") || lowerInput.includes("corn") || lowerInput.includes("मक्का");
    const isCotton = lowerInput.includes("cotton") || lowerInput.includes("कपास");

    const isGrow = lowerInput.includes("grow") || lowerInput.includes("plant") || lowerInput.includes("suitable") || lowerInput.includes("sow") || 
                  lowerInput.includes("उगाएं") || lowerInput.includes("बोएं") || lowerInput.includes("खेती") || lowerInput.includes("लगाएं") || lowerInput.includes("सकते");

    if (language === "hi") {
      if (isRice) {
        if (isGrow) {
          return "हाँ! यह समय धान (चावल) की नर्सरी तैयार करने के लिए बहुत उपयुक्त है क्योंकि खरीफ मानसून (जून-जुलाई) शुरू होने वाला है। धान को अधिक पानी और 25-30°C तापमान की आवश्यकता होती है।";
        }
        return "धान (चावल) एक मुख्य खरीफ फसल है। इसे गर्म और आर्द्र मौसम की आवश्यकता होती है। नर्सरी तैयार करने के लिए जून का पहला पखवाड़ा सर्वोत्तम रहता है।";
      }
      if (isWheat) {
        if (isGrow) {
          return "नहीं, इस समय (मई-जून की गर्मी में) गेहूं उगाना बिल्कुल भी उपयुक्त नहीं है। गेहूं एक रबी (सर्दी) की फसल है जिसे नवंबर में बोया जाता है। अभी बोने से फसल झुलस जाएगी।";
        }
        return "गेहूं एक ठंडी जलवायु की रबी फसल है। इसकी बुवाई नवंबर में की जाती है और कटाई मार्च-अप्रैल में होती है।";
      }
      if (isMaize) {
        return "मक्का की खेती खरीफ में जून-जुलाई में और बसंत में की जा सकती है। इसे अच्छी जल निकासी वाली बलुई दोमट मिट्टी की आवश्यकता होती है, बुवाई के लिए यह समय अच्छा है।";
      }
      if (isCotton) {
        return "कपास की बुवाई के लिए मई से जून का समय बहुत अच्छा रहता है। इसके लिए काली दोमट मिट्टी और पर्याप्त धूप आवश्यक है।";
      }
    } else {
      if (isRice) {
        if (isGrow) {
          return "Yes! It is highly suitable to grow Rice (Paddy) right now. We are approaching the monsoon season (June-July), which is the primary window for paddy nursery preparation. Rice requires ample standing water and high warmth.";
        }
        return "Rice (Paddy) is a water-intensive Kharif crop. Sowing begins with nursery preparation in June, followed by transplanting in July with the onset of rains.";
      }
      if (isWheat) {
        if (isGrow) {
          return "No, it is NOT suitable to grow wheat at this time (summer/May-June). Wheat is a winter Rabi crop that requires cold temperatures (15-20°C) and is sown in November. Sowing now will fail due to the 40°C+ extreme heat.";
        }
        return "Wheat is a winter Rabi crop. Sowing starts in November and harvesting is done in spring (March/April). It requires cool weather and moderate watering.";
      }
      if (isMaize) {
        return "Maize is a highly versatile crop suitable for the wet Kharif season (sowing in June-July). It thrives in well-drained loamy soil. Preparing your fields for Maize now is highly recommended.";
      }
      if (isCotton) {
        return "Cotton sowing is highly suitable between May and June. It requires warm weather, deep sandy-clay loam soil, and good solar radiation. Start preparing your ridges and furrows now!";
      }
    }

    // 3. General Suitability / Sowing Queries
    if (isGrow) {
      if (language === "hi") {
        return "आगामी वर्षा ऋतु (खरीफ) को देखते हुए धान (चावल), मक्का, कपास, बाजरा और ग्वार बोना सबसे अधिक उपयुक्त है। आप इनमें से किस फसल की योजना बना रहे हैं?";
      }
      return "Since we are entering the wet Kharif season, summer crops like Rice (Paddy), Maize, Cotton, Pearl Millet (Bajra), and Soybeans are highly suitable for sowing. Which of these are you planning to grow?";
    }

    // 4. Standard Keyword Matches with Dynamic Variations
    // Weather Context
    if (lowerInput.includes("weather") || lowerInput.includes("rain") || lowerInput.includes("monsoon") || lowerInput.includes("clouds") || lowerInput.includes("temperature") ||
        lowerInput.includes("मौसम") || lowerInput.includes("बारिश") || lowerInput.includes("पानी") || lowerInput.includes("तापमान")) {
      const templates = language === "hi" ? [
        "आज आपके क्षेत्र में मौसम कृषि कार्यों के अनुकूल है। वर्तमान तापमान लगभग 32°C है और आसमान बिल्कुल साफ़ है।",
        "मौसम विभाग के अनुसार आज तापमान 30°C से 34°C के बीच रहेगा। सिंचाई का सही समय सुबह जल्दी या शाम को रहेगा।",
        "आज आंशिक रूप से बादल छाए रहने की संभावना है। हवा की गति 4.4 m/s है, जिससे दवाओं का छिड़काव करने के लिए उत्तम परिस्थितियां हैं।"
      ] : [
        "The current weather in Ludhiana is favorable. The temperature is around 32°C with clear skies. Winds are calm at 4.4 m/s, excellent for field operations.",
        "According to agricultural weather services, humidity is around 12% today. We suggest irrigating early in the morning to prevent water loss.",
        "Expect partly cloudy conditions tomorrow. There is a low chance of precipitation, meaning field spraying will be highly effective today."
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }

    // Pest Context
    if (lowerInput.includes("pest") || lowerInput.includes("bug") || lowerInput.includes("disease") || lowerInput.includes("insect") || lowerInput.includes("worm") ||
        lowerInput.includes("कीट") || lowerInput.includes("कीड़ा") || lowerInput.includes("बीमारी") || lowerInput.includes("रोग")) {
      const templates = language === "hi" ? [
        "कीटों (जैसे एफिड्स या सफ़ेद मक्खी) से बचाव के लिए 5 मिलीलीटर नीम तेल को 1 लीटर गुनगुने पानी और लिक्विड सोप के साथ मिलाकर छिड़काव करें।",
        "फसलों में रस चूसने वाले कीटों का प्रकोप रोकने के लिए पीला चिपचिपा जाल (Yellow Sticky Traps) खेत की सीमाओं पर लगाएं।",
        "यदि पत्तियों पर भूरे/काले धब्बे दिख रहे हैं, तो यह कवक (Fungus) जनित हो सकता है। ट्राइकोडर्मा विरिडी जैव-कवकनाशी का प्रयोग करें।"
      ] : [
        "To control aphids or whiteflies naturally, spray a neem oil mixture (5 ml neem oil + 2 ml liquid soap per liter of lukewarm water).",
        "Install yellow sticky traps across field boundaries to catch sucking pests early before they spread to other crop sections.",
        "For fungal leaf spots or root rot, we highly recommend applying Trichoderma viride bio-fungicide to the root zones."
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }

    // Mandi Prices Context
    if (lowerInput.includes("price") || lowerInput.includes("market") || lowerInput.includes("mandi") || lowerInput.includes("rate") || lowerInput.includes("cost") ||
        lowerInput.includes("बाजार") || lowerInput.includes("भाव") || lowerInput.includes("मंडी") || lowerInput.includes("दर")) {
      const templates = language === "hi" ? [
        "आज की ताजा मंडी दरों के अनुसार: गेहूं ₹2,450/क्विंटल (+1.5% उछाल) और धान (चावल) ₹3,800/क्विंटल पर चल रहा है।",
        "मंडी अपडेट: मक्का का भाव ₹2,100/क्विंटल है। आलू की कीमतों में आज 3.8% की तेजी देखी गई है और यह ₹1,500/क्विंटल पर बिक रहा है।"
      ] : [
        "Today's active Mandi updates: Wheat rates are strong at ₹2,450/quintal (+1.5%), while Rice is steady at ₹3,800/quintal.",
        "Market trend analysis: Maize is trading at ₹2,100/quintal (+2.1%) and Mustard seeds are high at ₹5,600/quintal."
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }

    // Soil / NPK / Fertilizer Context
    if (lowerInput.includes("soil") || lowerInput.includes("fertilizer") || lowerInput.includes("npk") || lowerInput.includes("manure") || lowerInput.includes("urea") ||
        lowerInput.includes("मिट्टी") || lowerInput.includes("खाद") || lowerInput.includes("npk") || lowerInput.includes("उर्वरक")) {
      const templates = language === "hi" ? [
        "मिट्टी की उर्वरता बढ़ाने के लिए प्रति एकड़ 5 टन अच्छी तरह सड़ी हुई गोबर की खाद (FYM) या केंचुआ खाद का प्रयोग करें।",
        "नाइट्रोजन, फास्फोरस और पोटेशियम (NPK) का संतुलन 4:2:1 के अनुपात में बनाए रखें। यूरिया का अत्यधिक प्रयोग न करें।"
      ] : [
        "Maintain the standard 4:2:1 ratio for NPK (Nitrogen, Phosphorus, Potassium) fertilizers based on your crop growth stage.",
        "Incorporate well-decomposed organic manure or vermicompost (5 tons per acre) to build resilient soil structure and microbial life."
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }

    // Fallbacks
    const defaults = language === "hi" ? [
      "मैं मदद करने के लिए यहाँ हूँ! फसल सलाह (जैसे धान या गेहूं की बुवाई), मौसम, कीट, या बाजार मूल्य से संबंधित कोई भी सवाल पूछें।",
      "क्या आप फसलों की सहयोगी खेती या डीएपी/एनपीके खाद की गणना के बारे में जानना चाहते हैं? मुझे बताएं!",
      "मुझे बताएं कि आप अपने खेत में क्या योजना बना रहे हैं, मैं आपको सही सलाह दूंगा।"
    ] : [
      "I'm here to help! Ask me anything about specific crops (e.g. growing rice or wheat), weather, soil health, pests, or market prices.",
      "Would you like to explore companion planting guides, customized NPK fertilizer calculations, or weather-smart sowing calendars? Let me know!",
      "Tell me what crops you are planning to sow, and I'll give you customized agronomical advice."
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
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
