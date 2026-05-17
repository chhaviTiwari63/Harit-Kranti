import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

// Sample crop calendar data
const cropCalendar = {
  January: ["Wheat", "Mustard", "Peas"],
  February: ["Barley", "Potato", "Spinach"],
  March: ["Rice (nursery)", "Maize", "Tomato"],
  April: ["Rice (sowing)", "Groundnut", "Cucumber"],
  May: ["Millet", "Soybean", "Okra"],
  June: ["Rice", "Cotton", "Sugarcane"],
  July: ["Paddy", "Maize", "Turmeric"],
  August: ["Paddy", "Soybean", "Sesame"],
  September: ["Maize", "Pulses", "Groundnut"],
  October: ["Wheat (sowing)", "Mustard", "Chickpea"],
  November: ["Wheat", "Barley", "Lentil"],
  December: ["Wheat", "Garlic", "Onion"],
};

// Recommended rotation (simplified demo)
const cropRotation = {
  Wheat: "Rice",
  Rice: "Wheat",
  Maize: "Pulses",
  Soybean: "Wheat",
  Mustard: "Maize",
};

const FarmCalendar = ({ onBack }: { onBack: () => void }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>("January");
  const [previousCrop, setPreviousCrop] = useState<string>("Wheat");

  const suggestedCrops = cropCalendar[selectedMonth];
  const rotationSuggestion =
    cropRotation[previousCrop] || "Try legumes for soil health 🌱";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 p-6">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-xl rounded-2xl overflow-hidden border-2 border-green-700">
          <CardHeader className="bg-green-700 text-white p-6">
            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Calendar className="w-7 h-7" />
              <CardTitle className="text-2xl">Smart Farm Calendar 📅</CardTitle>
            </motion.div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Month Selector */}
            <motion.div
              className="flex gap-3 flex-wrap justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {Object.keys(cropCalendar).map((month) => (
                <motion.div
                  key={month}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setSelectedMonth(month)}
                    className={`px-4 py-2 rounded-xl shadow-md transition ${
                      selectedMonth === month
                        ? "bg-green-600 text-white"
                        : "bg-white text-green-700 border border-green-600 hover:bg-green-100"
                    }`}
                  >
                    {month}
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            {/* Crop Suggestions */}
            <motion.div
              className="bg-white rounded-2xl shadow-md p-6 border border-green-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-bold text-green-800 mb-4">
                🌾 Crops for {selectedMonth}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence>
                  {suggestedCrops.map((crop) => (
                    <motion.div
                      key={crop}
                      className="p-4 rounded-xl border-2 border-green-500 bg-green-50 hover:bg-green-100 shadow cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <p className="text-lg font-medium text-green-800">
                        {crop}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Crop Rotation Suggestion */}
            <motion.div
              className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-xl"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-yellow-900 font-medium">
                🌱 Based on your last crop <b>{previousCrop}</b>, we recommend
                planting:{" "}
                <span className="font-bold text-green-700">
                  {rotationSuggestion}
                </span>
              </p>
              <div className="mt-3">
                <label className="text-sm text-gray-700">
                  Update your previous crop:
                </label>
                <select
                  value={previousCrop}
                  onChange={(e) => setPreviousCrop(e.target.value)}
                  className="ml-2 p-2 rounded-lg border border-green-400 focus:ring focus:ring-green-300"
                >
                  {Object.keys(cropRotation).map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* Back Button */}
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onBack}
                className="bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-green-800"
              >
                ⬅ Back to Dashboard
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FarmCalendar;
