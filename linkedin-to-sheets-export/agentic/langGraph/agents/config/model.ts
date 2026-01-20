import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export function createModel() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro",
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    temperature: 0.7,
  });
}
