import { generateText, type CoreMessage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';

// Initialize free-tier providers (gracefully handles missing keys)
const google = process.env.GOOGLE_AI_API_KEY ? createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY }) : null;
const groq = process.env.GROQ_API_KEY ? createGroq({ apiKey: process.env.GROQ_API_KEY }) : null;

// The Fallback Chain (Free & Fast)
const getModelChain = () => {
  const chain: { name: string; model: any }[] = [];
  if (google) chain.push({ name: 'Google Gemini 2.0 Flash', model: google('gemini-2.0-flash-exp') });
  if (groq) chain.push({ name: 'Groq Llama 3.3 70B', model: groq('llama-3.3-70b-versatile') });
  return chain;
};

export async function generateAIResponse(params: { system: string; prompt: string }) {
  const messages: CoreMessage[] = [
    { role: 'system', content: params.system },
    { role: 'user', content: params.prompt }
  ];

  const chain = getModelChain();
  if (chain.length === 0) {
    throw new Error('No AI providers configured. Add GOOGLE_AI_API_KEY or GROQ_API_KEY.');
  }

  let lastError: any = null;

  for (const provider of chain) {
    try {
      const result = await generateText({
        model: provider.model,
        messages,
      });
      // Success! Return the text and log which provider handled it
      console.log(`[AI Router] Success via ${provider.name}`);
      return { text: result.text, provider: provider.name };
    } catch (error: any) {
      lastError = error;
      console.warn(`[AI Router] ${provider.name} failed (${error?.message || error}). Falling back to next provider...`);
      continue; // Try the next provider in the chain
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError?.message || lastError}`);
}
