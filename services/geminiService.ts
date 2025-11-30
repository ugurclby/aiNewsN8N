import { GoogleGenAI } from "@google/genai";
import { Source } from '../types';

export const generateAgentPrompt = async (
  selectedSources: Source[],
  focus: string,
  language: string = 'Turkish'
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const sourceNames = selectedSources.map(s => s.name).join(', ');

    const prompt = `
      You are an expert AI automation architect using n8n.
      
      I am building an automated news scraper that visits these sites: ${sourceNames}.
      
      My goal is to create a System Prompt for an LLM Agent (like Gemini or ChatGPT) within n8n.
      This agent will receive raw HTML or Markdown from these websites.
      
      The user wants the summaries to focus on: "${focus}".
      The user wants the output language to be: "${language}".
      
      Please generate a highly optimized "System Instruction" for the AI Agent. 
      
      The System Instruction should:
      1. Instruct the AI to extract only the most significant news from the last 24 hours.
      2. Instruct the AI to ignore navigation menus, footers, ads, and generic boilerplate.
      3. Define a strict JSON output format so the next node in n8n can parse it easily.
         - The JSON should be an Array of objects.
         - Each object must have: "title", "link" (if found in text, otherwise null), "summary" (in ${language}), "importance_score" (1-10).
      4. Explicitly state that if no relevant news is found, return an empty array [].
      5. CRITICAL: Instruct the model to output RAW JSON only. Do NOT use markdown code blocks (like \`\`\`json). Do NOT add any text before or after the JSON.
      6. Be concise and strict.
      
      Output ONLY the system prompt text. Do not add conversational filler.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "// İstem oluşturulamadı (Prompt failed generation)";
  } catch (error) {
    console.error("Error generating prompt:", error);
    return `// Hata oluştu. Lütfen API anahtarınızın geçerli olduğundan emin olun.\n// Sistem Hatası: ${error instanceof Error ? error.message : String(error)}`;
  }
};