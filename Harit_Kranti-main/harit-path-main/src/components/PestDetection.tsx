import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BookOpen,
  ShieldAlert,
} from "lucide-react";

interface PestDetectionProps {
  onBack: () => void;
}

const PEST_CATALOG = [
  {
    name: "Aphids (Green Peach Aphid)",
    risk: "Medium",
    symptoms: "Yellowing leaves, stunted crop growth, sticky honeydew substance on stems.",
    treatment: "Spray Neem oil solution (3-5 ml per liter water) or release ladybugs as natural predators.",
  },
  {
    name: "Brown Planthopper",
    risk: "High",
    symptoms: "Hopperburn (drying of crop patches), yellowing starting from bottom leaves.",
    treatment: "Drain field standing water for 3-4 days and apply Beauveria bassiana bio-pesticide.",
  },
  {
    name: "Stem Borer",
    risk: "High",
    symptoms: "Deadhearts (drying of central tiller), whiteheads in mature plants.",
    treatment: "Release Trichogramma chilonis wasps or install pheromone traps (5 traps per acre).",
  },
  {
    name: "Leaf Folder",
    risk: "Medium",
    symptoms: "Folded leaves secured by silk, white feeding streaks on leaf blades.",
    treatment: "Use yellow sticky traps and spray with Bacillus thuringiensis (Bt) solution.",
  },
  {
    name: "Root Rot (Fungal)",
    risk: "High",
    symptoms: "Brownish discolored roots, rotting stem bases, rapid leaf wilting.",
    treatment: "Improve field drainage, apply Trichoderma viride bio-fungicide to soil.",
  },
];

export default function PestDetection({ onBack }: PestDetectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [location, setLocation] = useState<string>("Detecting location...");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch location dynamically
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocation("Location not supported");
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
          const cityOrState = data.address.city || data.address.state || data.display_name;
          setLocation(cityOrState || `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
        } catch {
          setLocation(`Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
        }
      },
      () => setLocation("Varanasi, UP")
    );
  };

  // Upload image
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

  // Camera handling
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
      alert("Camera access denied. Please allow permissions.");
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

  const analyzeImage = () => {
    setIsAnalyzing(true);
    setProgress(0);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setResults({
          pest: "Aphids (Green Peach Aphid)",
          confidence: 94,
          severity: "Medium",
          location,
          timestamp: new Date().toLocaleString(),
          treatment: {
            immediate: [
              "Spray Neem oil solution (3-5 ml per liter water)",
              "Manually prune heavily infested leaf stems",
              "Increase row spacing for better air flow",
            ],
            preventive: [
              "Install yellow sticky traps across boundaries",
              "Encourage ladybugs (natural predators) on crops",
              "Avoid over-fertilizing with nitrogen enrichers",
            ],
          },
        });
        setIsAnalyzing(false);
      }
    }, 500);
  };

  const resetDetection = () => {
    setSelectedImage(null);
    setResults(null);
    stopCamera();
    setProgress(0);
  };

  const severityBadge = (level: string) => {
    switch (level) {
      case "High":
        return <Badge className="bg-red-500 text-white font-bold">High</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-500 text-black font-bold">Medium</Badge>;
      case "Low":
        return <Badge className="bg-green-500 text-white font-bold">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <div className="flex items-center">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2 text-green-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-green-900 tracking-tight flex items-center space-x-2">
          <ShieldAlert className="h-8 w-8 text-green-600 animate-pulse" />
          <span>AI Pest Detection Portal</span>
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Diagnose crop diseases instantly by uploading photos, or browse our organic treatment catalogs.
        </p>
      </div>

      <Tabs defaultValue="detector" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-green-100/50 border border-green-200/50 rounded-2xl p-1">
          <TabsTrigger value="detector" className="rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
            AI Detector
          </TabsTrigger>
          <TabsTrigger value="database" className="rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Pest Database
          </TabsTrigger>
        </TabsList>

        {/* AI Detector Tab */}
        <TabsContent value="detector" className="space-y-6">
          {!selectedImage && !cameraActive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-green-300 hover:border-green-500 bg-green-50/20 hover:bg-green-50/50 transition duration-300 p-8 rounded-3xl text-center space-y-3 flex flex-col items-center justify-center min-h-[220px]"
              >
                <div className="p-4 rounded-full bg-green-100 text-green-700">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-950">Upload Crop Image</h3>
                  <p className="text-xs text-gray-400 font-semibold mt-1">
                    Supports PNG, JPG, or JPEG up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
              </Card>

              <Card
                onClick={startCamera}
                className="cursor-pointer border-2 border-dashed border-green-300 hover:border-green-500 bg-green-50/20 hover:bg-green-50/50 transition duration-300 p-8 rounded-3xl text-center space-y-3 flex flex-col items-center justify-center min-h-[220px]"
              >
                <div className="p-4 rounded-full bg-green-100 text-green-700">
                  <Camera className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-950">Use Field Camera</h3>
                  <p className="text-xs text-gray-400 font-semibold mt-1">
                    Snap a photo of crop leaves in real-time
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Camera View */}
          {cameraActive && (
            <Card className="border border-green-100 rounded-3xl p-4 bg-white shadow-lg overflow-hidden space-y-4">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl border bg-slate-900 object-cover max-h-[380px]" />
              <div className="flex space-x-3">
                <Button onClick={captureImage} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-12">
                  Capture Crop Photo
                </Button>
                <Button onClick={stopCamera} variant="outline" className="rounded-xl h-12 border-green-200">
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Image Analysis Progress */}
          {selectedImage && isAnalyzing && (
            <Card className="border border-green-100 rounded-3xl p-6 bg-white shadow-lg space-y-4">
              <img src={selectedImage} alt="Crop Upload" className="w-full h-64 object-cover rounded-2xl" />
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                  <span className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    <span>Analyzing crop health...</span>
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-green-600 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </Card>
          )}

          {/* Results Analysis */}
          {selectedImage && results && !isAnalyzing && (
            <Card className="border border-green-200 rounded-3xl bg-white shadow-lg overflow-hidden">
              <img src={selectedImage} alt="Crop Diagnosis" className="w-full h-64 object-cover" />

              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between text-xs text-gray-400 font-bold border-b border-gray-100 pb-3">
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span>{location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{results.timestamp}</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-extrabold text-green-950">{results.pest}</span>
                    <Badge className="bg-green-600 font-bold text-white">{results.confidence}% Match</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Crop Risk Severity:</span>
                    {severityBadge(results.severity)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 border border-red-100 bg-red-50/10 rounded-2xl space-y-2">
                    <h4 className="font-bold text-red-800 flex items-center space-x-1.5 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Immediate Action Plan</span>
                    </h4>
                    <ul className="list-disc ml-4 text-xs font-semibold text-gray-600 space-y-1">
                      {results.treatment.immediate.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 border border-green-100 bg-green-50/10 rounded-2xl space-y-2">
                    <h4 className="font-bold text-green-800 flex items-center space-x-1.5 text-sm">
                      <Info className="h-4 w-4" />
                      <span>Preventive Agronomy</span>
                    </h4>
                    <ul className="list-disc ml-4 text-xs font-semibold text-gray-600 space-y-1">
                      {results.treatment.preventive.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
                  <Button
                    onClick={() => window.open("tel:18001801551")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 flex items-center justify-center space-x-2"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Kisan Helpline (Toll-Free)</span>
                  </Button>
                  <Button onClick={resetDetection} variant="outline" className="rounded-xl h-12 border-green-200 text-green-700">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    <span>Diagnose Another leaf</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pest Database Tab */}
        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PEST_CATALOG.map((pest, i) => (
              <Card key={i} className="border border-green-100 shadow-md rounded-3xl bg-white p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-950">{pest.name}</span>
                  {severityBadge(pest.risk)}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Symptoms</span>
                  <p className="text-xs font-semibold text-gray-600 leading-relaxed">{pest.symptoms}</p>
                </div>
                <div className="space-y-1 border-t border-gray-50 pt-2.5">
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block">Organic Treatment</span>
                  <p className="text-xs font-semibold text-green-950 leading-relaxed">{pest.treatment}</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
