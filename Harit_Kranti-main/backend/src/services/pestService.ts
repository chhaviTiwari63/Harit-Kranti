import axios from "axios";
import FormData from "form-data";

export const analyzePest = async (filePath: string) => {
  try {
    const formData = new FormData();
    const fs = require("fs");
    const path = require("path");

    const fileStream = fs.createReadStream(filePath);

    formData.append("file", fileStream);

    const response = await axios.post("http://localhost:8000/analyze", formData, {
      headers: formData.getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error calling ML service:", error);
    throw new Error("Pest detection service unavailable");
  }
};
