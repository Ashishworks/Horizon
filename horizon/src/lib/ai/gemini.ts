import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemma-3-4b-it",
});
