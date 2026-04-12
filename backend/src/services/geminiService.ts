// backend/src/services/geminiService.ts
import { TextServiceClient } from "@google-ai/generativelanguage";

// Ignore TypeScript types for now
declare module "@google-ai/generativelanguage";

const client = new TextServiceClient({
  apiKey: process.env.GEMINI_API_KEY,
});

export const getGeminiAdvice = async (prompt: string): Promise<string> => {
  try {
    const request = {
      model: "models/text-bison-001",
      prompt: { text: prompt },
      temperature: 0.7,
      maxOutputTokens: 500,
    };

    const [response] = await client.generateText(request);

    const advice =
  (response.candidates?.[0] as any)?.content?.text ??
  (response.candidates?.[0] as any)?.output_text ??
  (response.candidates?.[0] as any)?.output ??
  "No advice available";


    return advice || "No advice generated.";
  } catch (error: any) {
    console.error("❌ Gemini API error:", error.message ?? error);
    return "Error generating advisory from Gemini.";
  }
};
