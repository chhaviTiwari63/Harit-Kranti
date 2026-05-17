import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Sprout, ArrowLeft, Loader2, Coins, TrendingUp, Info, Leaf, CheckCircle2 } from "lucide-react";

interface CropAdvisoryProps {
  onBack: () => void;
  user: any;
}

export default function CropAdvisory({ onBack, user }: CropAdvisoryProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Form Inputs
  const [crop, setCrop] = useState("");
  const [soil, setSoil] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [growthStage, setGrowthStage] = useState("");

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop || !soil || !farmSize || !growthStage) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all agricultural profiling fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const size = parseFloat(farmSize);
      const isWheat = crop === "wheat";
      const isRice = crop === "rice";

      // Mock calculation formulas based on crop & soil selection
      const yieldPerAc = isWheat ? 2.4 : isRice ? 3.1 : 1.8;
      const totalYield = (yieldPerAc * size).toFixed(1);
      const investmentPerAc = isWheat ? 12000 : isRice ? 15000 : 10000;
      const totalInvestment = Math.round(investmentPerAc * size);
      const returnPerAc = isWheat ? 32000 : isRice ? 42000 : 25000;
      const totalReturn = Math.round(returnPerAc * size);
      const totalProfit = totalReturn - totalInvestment;

      setResults({
        crop: crop.toUpperCase(),
        soil: soil.toUpperCase(),
        size,
        stage: growthStage.toUpperCase(),
        yield: totalYield,
        investment: totalInvestment.toLocaleString(),
        profit: totalProfit.toLocaleString(),
        margin: Math.round((totalProfit / totalReturn) * 100),
        checklist: isWheat
          ? [
              "Maintain shallow irrigation level (2.5 cm depth) during current stage.",
              "Apply first top dressing of Urea (30 kg per acre).",
              "Look for early symptoms of Yellow Rust and spray Propiconazole if seen.",
              "Ensure proper mechanical weeding or apply post-emergence weedicides.",
            ]
          : [
              "Maintain continuous standing water depth of 5 cm in the paddy.",
              "Apply standard top dressing of Nitrogen (NPK 20:20:20).",
              "Check for Stem Borer bugs and place pheromone traps (5 traps/acre).",
              "Implement shallow drainage if excessive monsoon rain occurs.",
            ],
        recommendations: isWheat
          ? [
              { name: "Mustard", match: "94%", reason: "Excellent companion crop to grow alongside Wheat borders, attracting early pollinators." },
              { name: "Gram (Chickpeas)", match: "88%", reason: "Nitrogen-fixing pulses that naturally enrich the sandy/loamy soil for wheat roots." },
            ]
          : [
              { name: "Green Gram (Moong)", match: "92%", reason: "Grows perfectly post-rice harvest to utilize remaining soil dampness." },
              { name: "Black Gram (Urad)", match: "86%", reason: "Adds biological nitrogen back into loamy soil fields." },
            ],
        fertilizer: {
          urea: Math.round(45 * size),
          dap: Math.round(30 * size),
          mop: Math.round(20 * size),
          npk: "12:32:16",
        },
      });

      setLoading(false);
      toast({
        title: "Advisory Ready",
        description: "Generated personalized advisory checklists.",
      });
    }, 1200);
  };

  const resetForm = () => {
    setResults(null);
    setCrop("");
    setSoil("");
    setFarmSize("");
    setGrowthStage("");
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

      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-green-900 tracking-tight flex items-center space-x-2">
          <Sprout className="h-8 w-8 text-green-600 animate-pulse" />
          <span>Interactive Crop Advisory Wizard</span>
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Select your current crop parameters to calculate yields, DAP/NPK fertilizer dosages, and companion crops.
        </p>
      </div>

      {!results ? (
        <Card className="border border-green-100 shadow-lg rounded-3xl bg-white p-6 sm:p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-700 font-bold">Crop Type</Label>
                <Select onValueChange={setCrop} value={crop}>
                  <SelectTrigger className="border-green-200 rounded-xl h-11">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wheat">🌾 Wheat (गेंहू)</SelectItem>
                    <SelectItem value="rice">🍚 Rice / Paddy (धान)</SelectItem>
                    <SelectItem value="corn">🌽 Corn / Maize (मक्का)</SelectItem>
                    <SelectItem value="cotton">🥛 Cotton (कपास)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-700 font-bold">Soil Type</Label>
                <Select onValueChange={setSoil} value={soil}>
                  <SelectTrigger className="border-green-200 rounded-xl h-11">
                    <SelectValue placeholder="Select soil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">Clay / चिकनी मिट्टी</SelectItem>
                    <SelectItem value="sandy">Sandy / रेतीली मिट्टी</SelectItem>
                    <SelectItem value="loamy">Loamy / दोमट मिट्टी</SelectItem>
                    <SelectItem value="black">Black / काली मिट्टी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="ad-farm" className="text-gray-700 font-bold">
                  Farm Size (Acres)
                </Label>
                <Input
                  id="ad-farm"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 3.5"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="rounded-xl border-green-200 h-11"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-bold">Growth Stage</Label>
                <Select onValueChange={setGrowthStage} value={growthStage}>
                  <SelectTrigger className="border-green-200 rounded-xl h-11">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sowing">🌱 Sowing / बुवाई</SelectItem>
                    <SelectItem value="vegetative">🌿 Vegetative Growth / वृद्धि</SelectItem>
                    <SelectItem value="flowering">🌸 Flowering / फूल आना</SelectItem>
                    <SelectItem value="maturity">🌾 Maturity / पकना</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 flex items-center justify-center space-x-2 shadow-md">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating Personalized Advisory...</span>
                </>
              ) : (
                <span>Get Personalized Advisory</span>
              )}
            </Button>
          </form>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Banner Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50/50 border border-green-200 rounded-3xl p-6 shadow-md grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated Yield</span>
              <div className="text-3xl font-extrabold text-green-800">{results.yield} Tons</div>
              <span className="text-xs font-semibold text-green-700">for {results.size} Acres</span>
            </div>
            <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-green-200 py-4 sm:py-0">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated Investment</span>
              <div className="text-3xl font-extrabold text-green-800">₹{results.investment}</div>
              <span className="text-xs font-semibold text-gray-500">Seed & fertilization</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Profit Margin</span>
              <div className="text-3xl font-extrabold text-green-700">₹{results.profit}</div>
              <Badge className="bg-green-100 text-green-700 border border-green-200">
                {results.margin}% ROI Status
              </Badge>
            </div>
          </Card>

          {/* Sub Tab Panels */}
          <Tabs defaultValue="advisory" className="w-full space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-green-100/50 border border-green-200/50 rounded-2xl p-1">
              <TabsTrigger value="advisory" className="rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
                General Advisory
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Crop Recommendations
              </TabsTrigger>
              <TabsTrigger value="fertilizer" className="rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Fertilizer Guide
              </TabsTrigger>
            </TabsList>

            {/* General Advisory */}
            <TabsContent value="advisory">
              <Card className="border border-green-100 shadow-md rounded-3xl bg-white p-6">
                <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center space-x-2 text-green-800">
                  <Leaf className="h-5 w-5" />
                  <CardTitle className="text-xl font-bold">Farming Action Items</CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  {results.checklist.map((item: string, i: number) => (
                    <div key={i} className="flex items-start space-x-3 p-3 rounded-xl border border-gray-50 bg-slate-50/50">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-700 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Crop Recommendations */}
            <TabsContent value="recommendations">
              <Card className="border border-green-100 shadow-md rounded-3xl bg-white p-6">
                <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center space-x-2 text-green-800">
                  <TrendingUp className="h-5 w-5" />
                  <CardTitle className="text-xl font-bold">Recommended Companion Crops</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.recommendations.map((rec: any, i: number) => (
                    <Card key={i} className="border border-green-100/50 rounded-2xl p-5 bg-green-50/30">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-green-950">{rec.name}</span>
                        <Badge className="bg-green-600 text-white font-bold">{rec.match} Match</Badge>
                      </div>
                      <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                        {rec.reason}
                      </p>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Fertilizer Guide */}
            <TabsContent value="fertilizer">
              <Card className="border border-green-100 shadow-md rounded-3xl bg-white p-6">
                <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center space-x-2 text-green-800">
                  <Info className="h-5 w-5" />
                  <CardTitle className="text-xl font-bold">Soil NPK & Fertilizer Guide</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/20 text-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">UREA Dosage</span>
                    <div className="text-2xl font-extrabold text-blue-900">{results.fertilizer.urea} kg</div>
                    <span className="text-[10px] text-gray-400 font-medium block">Total required</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/20 text-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">DAP Dosage</span>
                    <div className="text-2xl font-extrabold text-amber-900">{results.fertilizer.dap} kg</div>
                    <span className="text-[10px] text-gray-400 font-medium block">Phosphorus enricher</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/20 text-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">MOP Potash</span>
                    <div className="text-2xl font-extrabold text-purple-900">{results.fertilizer.mop} kg</div>
                    <span className="text-[10px] text-gray-400 font-medium block">Potassium enricher</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center space-x-3 text-sm text-gray-600 font-semibold leading-relaxed">
                  <Info className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>
                    Guidelines calculated based on state standards. Ensure to apply Urea in split intervals rather than all at once for higher root absorption efficiency.
                  </span>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Reset button */}
          <Button onClick={resetForm} variant="outline" className="w-full rounded-xl border-green-200 text-green-700 hover:bg-green-50">
            Generate Advisory for another Crop
          </Button>
        </div>
      )}
    </div>
  );
}
