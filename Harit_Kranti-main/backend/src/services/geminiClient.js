import fetch from "node-fetch";

export async function getGeminiAdvice(pest, confidence, language) {
  const prompt = `
  The ML model detected: ${pest} (confidence: ${confidence}).
  Provide clear pest management advice for small farmers.
  Explain in ${language}, keep it simple, and include organic & chemical options.
  `;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No advice available";
}