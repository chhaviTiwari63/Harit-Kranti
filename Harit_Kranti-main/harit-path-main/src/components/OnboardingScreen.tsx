import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Globe, MapPin } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import VoiceButton from "@/components/VoiceButton";
import farmerWelcome from "@/assets/WhatsApp Image 2025-09-18 at 18.48.58_de418c34.jpg";

export interface OnboardingData {
  language: "en-US" | "hi-IN" | "mr-IN" | "bn-IN" | "kn-IN";
  preferVoice: boolean;
  farmSize: string;
  soilType: string;
  previousCrops: string;
  location: string;
}

interface OnboardingScreenProps {
  onComplete: (data: OnboardingData) => void;
}

const languages = [
  { code: "hi-IN", name: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "en-US", name: "English", flag: "🇬🇧" },
  { code: "mr-IN", name: "मराठी (Marathi)", flag: "🇮🇳" },
  { code: "bn-IN", name: "বাংলা (Bengali)", flag: "🇧🇩" },
  { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳" },
];

// Framer Motion variants
const cardVariants: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.3, ease: "easeIn" } },
};

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const { speak } = useSpeech();

  // Speak instructions whenever step changes
  useEffect(() => {
    const stepTexts: Record<number, Record<string, string>> = {
      1: {
        "hi-IN": "स्वागत है! कृपया अपनी भाषा चुनें।",
        "en-US": "Welcome! Please select your language.",
        "mr-IN": "स्वागत आहे! कृपया आपली भाषा निवडा.",
        "bn-IN": "স্বাগতম! অনুগ্রহ করে আপনার ভাষা নির্বাচন করুন।",
        "kn-IN": "ಸ್ವಾಗತ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      },
      2: {
        "hi-IN": "आवाज़ सहायक को सक्षम करें या छोड़ें।",
        "en-US": "Enable voice assistant or skip.",
        "mr-IN": "आवाज सहाय्यक सक्षम करा किंवा वगळा.",
        "bn-IN": "ভয়েস সহকারী সক্ষম করুন বা এড়িয়ে যান।",
        "kn-IN": "ವಾಯ್ಸ್ ಸಹಾಯಕವನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ ಅಥವಾ ಬಿಟ್ಟುಬಿಡಿ.",
      },
      3: {
        "hi-IN": "अपनी खेती की जानकारी भरें।",
        "en-US": "Fill in your farming details.",
        "mr-IN": "आपली शेतीची माहिती भरा.",
        "bn-IN": "আপনার কৃষি বিবরণ পূরণ করুন।",
        "kn-IN": "ನಿಮ್ಮ ಕೃಷಿ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
      },
      4: {
        "hi-IN": "अपना स्थान साझा करें।",
        "en-US": "Share your location.",
        "mr-IN": "आपला स्थान सामायिक करा.",
        "bn-IN": "আপনার অবস্থান শেয়ার করুন।",
        "kn-IN": "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
      },
    };

    const text = stepTexts[step]?.[data.language || "en-US"];
    if (text && data.preferVoice !== false) {
      setTimeout(() => speak(text, { lang: data.language || "en-US" }), 500);
    }
  }, [step, data.language, data.preferVoice, speak]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else onComplete(data as OnboardingData);
  };

  const updateData = (key: keyof OnboardingData, value: string | boolean) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // ✅ Automatically detect location on Step 4
  useEffect(() => {
    if (step === 4) {
      if (!navigator.geolocation) {
        updateData("location", "Geolocation not supported");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const resData = await res.json();
            // Get city/town/village or fallback to state/country
            const address = resData.address;
            const cityOrVillage = address.city || address.town || address.village || address.county || address.state;
            updateData("location", cityOrVillage || `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
          } catch {
            updateData("location", `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
          }
        },
        () => {
          // Silent fallback if blocked or failed, user can enter manually
          console.log("Could not auto-detect location.");
        }
      );
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-green-50 to-green-100 p-4 flex flex-col">
      {/* Step dots */}
      <div className="flex justify-center mb-6 mt-4">
        <div className="flex space-x-3">
          {[1,2,3,4].map(i => (
            <motion.div
              key={i}
              className="w-4 h-4 rounded-full"
              animate={i <= step ? { backgroundColor: "#22c55e", scale: 1.3 } : { backgroundColor: "#a7f3d0", scale: 1 }}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 flex flex-col justify-center space-y-6 max-w-xl mx-auto w-full px-4">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div key="step1" variants={cardVariants} initial="initial" animate="animate" exit="exit">
              <Card className="p-8 text-center rounded-2xl shadow-lg bg-white">
                <img src={farmerWelcome} alt="Welcome" className="w-32 h-32 mx-auto rounded-full mb-6" />
                <h1 className="text-2xl sm:text-3xl font-semibold text-green-700 mb-4">स्मार्ट कृषि सलाहकार में आपका स्वागत है!</h1>
                <p className="text-base sm:text-lg text-green-600 mb-6">Welcome to Smart Crop Advisory!</p>

                <Label className="flex items-center gap-2 justify-center mb-4">
                  <Globe /> Select Language / भाषा चुनें
                  <VoiceButton text="Please select your language." language={data.language || "en-US"} size="icon" />
                </Label>

                <Select onValueChange={(val) => updateData("language", val)}>
                  <SelectTrigger className="w-full text-lg h-14 rounded-md border border-green-300 focus:ring-2 focus:ring-green-400">
                    <SelectValue placeholder="Choose language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(l => (
                      <SelectItem key={l.code} value={l.code} className="text-lg py-3">{l.flag} {l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={cardVariants} initial="initial" animate="animate" exit="exit">
              <Card className="p-8 rounded-2xl shadow-lg bg-white text-center">
                <h2 className="text-2xl sm:text-3xl font-semibold text-green-700 mb-6">Voice Assistance / आवाज़ सहायता</h2>
                <p className="text-base sm:text-lg text-green-600 mb-8">
                  Would you like voice guidance? / क्या आप आवाज़ से मार्गदर्शन चाहते हैं?
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <Button variant={data.preferVoice === true ? "default" : "ghost"} onClick={() => updateData("preferVoice", true)}>Yes / हाँ</Button>
                  <Button variant={data.preferVoice === false ? "default" : "ghost"} onClick={() => updateData("preferVoice", false)}>No / नहीं</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={cardVariants} initial="initial" animate="animate" exit="exit">
              <Card className="p-8 rounded-2xl shadow-lg bg-white">
                <h2 className="text-2xl sm:text-3xl font-semibold text-green-700 mb-6 text-center">Farm Details / खेत की जानकारी</h2>
                <div className="space-y-6">
                  <div>
                    <Label>Farm Size (Acres) / खेत का आकार</Label>
                    <Input placeholder="e.g., 2.5 acres" value={data.farmSize || ""} onChange={e => updateData("farmSize", e.target.value)} />
                  </div>
                  <div>
                    <Label>Soil Type / मिट्टी का प्रकार</Label>
                    <Select onValueChange={val => updateData("soilType", val)}>
                      <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clay">Clay / चिकनी मिट्टी</SelectItem>
                        <SelectItem value="sandy">Sandy / रेतीली मिट्टी</SelectItem>
                        <SelectItem value="loamy">Loamy / दोमट मिट्टी</SelectItem>
                        <SelectItem value="black">Black / काली मिट्टी</SelectItem>
                        <SelectItem value="red">Red / लाल मिट्टी</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Previous Crops / पिछली फसल</Label>
                    <Input placeholder="e.g., Wheat, Rice" value={data.previousCrops || ""} onChange={e => updateData("previousCrops", e.target.value)} />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={cardVariants} initial="initial" animate="animate" exit="exit">
              <Card className="p-8 rounded-2xl shadow-lg bg-white text-center">
                <h2 className="text-2xl sm:text-3xl font-semibold text-green-700 mb-6">Location / स्थान</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-green-600 animate-pulse">
                    <MapPin className="w-6 h-6" /> Detecting location...
                  </div>
                  <Input placeholder="Enter manually / या हाथ से लिखें" value={data.location || ""} onChange={e => updateData("location", e.target.value)} />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 max-w-xl mx-auto w-full px-4">
        {step > 1 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back / वापस</Button>}
        <div className="flex-1" />
        <Button onClick={handleNext} disabled={
          (step === 1 && !data.language) || 
          (step === 2 && data.preferVoice === undefined) ||
          (step === 3 && (!data.farmSize || !data.soilType))
        }>
          {step === 4 ? "Start Farming" : "Next"} <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
