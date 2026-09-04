import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, DollarSign } from "lucide-react";

interface CropPrice {
  crop: string;
  avgPrice: number; // price per quintal
}

interface Vendor {
  name: string;
  crop: string;
  contact: string;
  location: string;
}

const cropPrices: CropPrice[] = [
  { crop: "Wheat", avgPrice: 2200 },
  { crop: "Rice", avgPrice: 2800 },
  { crop: "Maize", avgPrice: 1900 },
  { crop: "Soybean", avgPrice: 3500 },
  { crop: "Sugarcane", avgPrice: 3100 },
];

const vendors: Vendor[] = [
  {
    name: "Rajesh Kumar",
    crop: "Wheat",
    contact: "+91 9876543210",
    location: "Varanasi, UP",
  },
  {
    name: "Anita Traders",
    crop: "Rice",
    contact: "+91 9123456780",
    location: "Patna, Bihar",
  },
  {
    name: "Green Agro",
    crop: "Soybean",
    contact: "+91 9988776655",
    location: "Indore, MP",
  },
  {
    name: "Fresh Farm Supplies",
    crop: "Sugarcane",
    contact: "+91 8899776655",
    location: "Nagpur, MH",
  },
];

const MarketPrice = ({ onBack }: { onBack?: () => void }) => {
  const [selectedCrop, setSelectedCrop] = useState<string>("");

  const filteredVendors = selectedCrop
    ? vendors.filter((v) => v.crop === selectedCrop)
    : vendors;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700">🌾 Market Prices</h1>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            ⬅ Back
          </Button>
        )}
      </div>

      {/* Crop Price List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cropPrices.map((price) => (
          <Card
            key={price.crop}
            className={`cursor-pointer hover:shadow-lg transition ${
              selectedCrop === price.crop ? "border-green-600" : ""
            }`}
            onClick={() =>
              setSelectedCrop(
                selectedCrop === price.crop ? "" : price.crop
              )
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {price.crop}
                <DollarSign className="text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Avg Rate:{" "}
                <span className="font-bold text-green-700">
                  ₹{price.avgPrice}/quintal
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vendor List */}
      <h2 className="text-xl font-semibold mt-6">👩‍🌾 Vendors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((vendor, idx) => (
          <Card key={idx} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{vendor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="flex items-center gap-2">
                <MapPin size={18} className="text-gray-500" />{" "}
                {vendor.location}
              </p>
              <p className="flex items-center gap-2">
                🌱 Crop: <span className="font-semibold">{vendor.crop}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={18} className="text-green-600" />{" "}
                <a
                  href={`tel:${vendor.contact}`}
                  className="text-blue-600 hover:underline"
                >
                  {vendor.contact}
                </a>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarketPrice;
