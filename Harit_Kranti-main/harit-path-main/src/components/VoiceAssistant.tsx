import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/useSpeech";
import { useToast } from "@/components/ui/use-toast";

interface VoiceAssistantProps {
  onNavigate: (screen: string) => void;
}

export default function VoiceAssistant({ onNavigate }: VoiceAssistantProps) {
  const { speak } = useSpeech();
  const { toast } = () => {
    // Simple custom alert or silent toast fallback
    return { toast: (opts: any) => console.log(opts) };
  };
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("Listening for commands...");
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript.toLowerCase();
        setTranscript(resultText);

        // Command handler
        if (resultText.includes("weather") || resultText.includes("forecast") || resultText.includes("rain")) {
          speak("Navigating to Weather Forecast", { lang: "en-US" });
          onNavigate("weather");
        } else if (resultText.includes("pest") || resultText.includes("infestation") || resultText.includes("bug")) {
          speak("Navigating to Pest Detection", { lang: "en-US" });
          onNavigate("pest-detection");
        } else if (resultText.includes("price") || resultText.includes("mandi") || resultText.includes("market") || resultText.includes("rate")) {
          speak("Navigating to Market Prices", { lang: "en-US" });
          onNavigate("market-prices");
        } else if (resultText.includes("chat") || resultText.includes("talk") || resultText.includes("assistant")) {
          speak("Navigating to Chat Assistant", { lang: "en-US" });
          onNavigate("chat");
        } else if (resultText.includes("soil") || resultText.includes("advisory") || resultText.includes("npk") || resultText.includes("crop")) {
          speak("Navigating to Crop Advisory Wizard", { lang: "en-US" });
          onNavigate("soil-health");
        } else if (resultText.includes("calendar") || resultText.includes("schedule")) {
          speak("Navigating to Farm Calendar", { lang: "en-US" });
          onNavigate("calendar");
        } else if (resultText.includes("home") || resultText.includes("dashboard")) {
          speak("Navigating to Home Dashboard", { lang: "en-US" });
          onNavigate("dashboard");
        } else {
          speak("Command not recognized. Try saying Weather, Pest, or Advisory.", { lang: "en-US" });
        }
      };

      recognitionRef.current = recognition;
    }
  }, [onNavigate, speak]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      {/* Dynamic Voice helper speech balloon bubble */}
      {isListening && (
        <div className="bg-white text-green-950 px-4 py-3 rounded-2xl shadow-2xl border border-green-200 text-xs font-bold animate-pulse max-w-xs flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span>{transcript}</span>
        </div>
      )}

      {/* Floating Microphone Trigger */}
      <Button
        onClick={toggleListening}
        className={`h-14 w-14 rounded-full shadow-2xl flex items-center justify-center border transition-all duration-300 transform active:scale-95 ${
          isListening
            ? "bg-red-500 border-red-400 text-white hover:bg-red-600 animate-pulse"
            : "bg-green-600 border-green-500 text-white hover:bg-green-700 hover:scale-105"
        }`}
        title="Voice Command Assistant"
      >
        {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </Button>
    </div>
  );
}
