import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.VERTEX_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
const MODEL = process.env.VERTEX_MODEL ?? 'gemini-2.5-pro';

if (!API_KEY) {
  console.warn('[vertex] VERTEX_API_KEY 未配置；请到 https://aistudio.google.com/apikey 或 GCP Vertex Express Mode 创建');
}

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!client) {
    // vertexai: true → 走 Vertex AI Express Mode（API Key 模式）
    client = new GoogleGenAI({ vertexai: true, apiKey: API_KEY });
  }
  return client;
}

export interface AskOptions {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

/** 流式生成文本; 返回 ReadableStream<Uint8Array> 可直接给 Next.js Response */
export function streamGenerate(opts: AskOptions): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const ai = getClient();
        const stream = await ai.models.generateContentStream({
          model: MODEL,
          contents: opts.user,
          config: {
            systemInstruction: opts.system,
            temperature: opts.temperature ?? 0.7,
            maxOutputTokens: opts.maxTokens ?? 4096,
            topP: 0.95,
          },
        });
        for await (const chunk of stream) {
          const text = chunk.text ?? '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`\n\n⚠️ 推演中断：${msg}`));
        controller.close();
      }
    },
  });
}
