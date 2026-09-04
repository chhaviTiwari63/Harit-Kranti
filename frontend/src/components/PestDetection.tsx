import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Upload,
  ArrowLeft,
  MapPin,
  Clock,
  AlertTriangle,
  Loader2,
  Phone,
  Info,
  RefreshCcw,
} from "lucide-react";

interface PestDetectionProps {
  onBack: () => void;
}

export default function PestDetection({ onBack }: PestDetectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [location, setLocation] = useState<string>("Fetching location...");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ✅ Fetch location
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocation("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setLocation(data.display_name || `Lat: ${latitude}, Lon: ${longitude}`);
        } catch {
          setLocation(`Lat: ${latitude}, Lon: ${longitude}`);
        }
      },
      () => setLocation("Unable to fetch location")
    );
  };

  // ✅ Upload image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
      fetchLocation();
      analyzeImage();
    };
    reader.readAsDataURL(file);
  };

  // ✅ Camera handling
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      alert("Camera access denied. Please allow camera permission.");
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const imgData = canvas.toDataURL("image/jpeg");
    setSelectedImage(imgData);
    stopCamera();
    fetchLocation();
    analyzeImage();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      setCameraActive(false);
    }
  };

  // ✅ Fake analysis with progress
  const analyzeImage = () => {
    setIsAnalyzing(true);
    setProgress(0);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setResults({
          pest: "Aphids (Green Peach Aphid)",
          confidence: 92,
          severity: "Medium",
          location,
          timestamp: new Date().toLocaleString(),
          treatment: {
            immediate: [
              "Spray neem oil solution (2-3 ml per liter water)",
              "Remove heavily infested leaves manually",
              "Increase air circulation around plants",
            ],
            preventive: [
              "Use yellow sticky traps to monitor aphid population",
              "Encourage beneficial insects like ladybugs",
              "Avoid over-fertilizing with nitrogen",
            ],
          },
        });
        setIsAnalyzing(false);
      }
    }, 600);
  };

  const resetDetection = () => {
    setSelectedImage(null);
    setResults(null);
    stopCamera();
    setProgress(0);
  };

  // ✅ Severity Badge
  const severityBadge = (level: string) => {
    switch (level) {
      case "High":
        return <Badge className="bg-red-500">High</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-500 text-black">Medium</Badge>;
      case "Low":
        return <Badge className="bg-green-500">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-green-100 via-white to-green-50 p-4 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Back button */}
      <motion.div
        className="flex items-center"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
      </motion.div>

      {/* Header */}
      <motion.h1
        className="text-2xl font-bold flex items-center space-x-2 text-green-700"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Info className="w-6 h-6 text-green-600" />
        <span>Pest Detection</span>
      </motion.h1>

      {/* Upload / Camera */}
      {!selectedImage && !cameraActive && (
        <motion.div
          className="grid gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button onClick={() => fileInputRef.current?.click()} className="w-full flex space-x-2 bg-green-600 text-white hover:bg-green-700">
            <Upload className="w-4 h-4" />
            <span>Upload Crop Image</span>
          </Button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <Button onClick={startCamera} variant="secondary" className="w-full flex space-x-2">
            <Camera className="w-4 h-4" />
            <span>Use Camera</span>
          </Button>
        </motion.div>
      )}

      {/* Camera View */}
      {cameraActive && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border" />
          <Button onClick={captureImage} className="w-full bg-green-600 text-white">
            Capture Photo
          </Button>
          <Button onClick={stopCamera} variant="outline" className="w-full">
            Cancel
          </Button>
        </motion.div>
      )}

      {/* Image Preview */}
      {selectedImage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="shadow-lg border-green-200">
            <CardContent className="p-0">
              <img
                src={selectedImage}
                alt="Captured crop"
                className="w-full h-64 object-cover rounded-t-2xl"
              />
              <div className="p-4 flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analyzing Progress */}
      {isAnalyzing && (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-green-600" />
            <span>Analyzing your crop image...</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}

      {/* Results */}
      {results && !isAnalyzing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-lg border-green-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2 text-green-700">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span>Pest Analysis Result</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p><strong>Pest:</strong> {results.pest}</p>
              <p><strong>Confidence:</strong> {results.confidence}%</p>
              <p>
                <strong>Severity:</strong> {severityBadge(results.severity)}
              </p>
              <p><strong>Detected At:</strong> {results.timestamp}</p>

              <div>
                <strong>Treatment:</strong>
                <ul className="list-disc ml-6">
                  {results.treatment.immediate.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>Prevention:</strong>
                <ul className="list-disc ml-6">
                  {results.treatment.preventive.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Expert Help */}
              <Button
                className="w-full bg-green-600 text-white flex items-center space-x-2 hover:bg-green-700"
                onClick={() => window.open("tel:18001801551")}
              >
                <Phone className="w-4 h-4" />
                <span>Call Krishi Vigyan Kendra (Toll-Free: 1800-180-1551)</span>
              </Button>

              {/* Reset */}
              <Button onClick={resetDetection} variant="outline" className="w-full flex space-x-2">
                <RefreshCcw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
