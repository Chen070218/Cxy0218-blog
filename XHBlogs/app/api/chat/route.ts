// app/api/chat/route.ts
// Desktop pet chat endpoint: DeepSeek by default, Gemini as an alternative.
// Keys are never written into the code; always read from environment variables:
//   local → XHBlogs/.env.local (ignored by .gitignore)
//   online on Vercel → Project → Settings → Environment Variables
import { siteConfig } from '../../../siteConfig';

export const runtime = 'edge';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Choose the backend for this request: the provider in the request body wins, otherwise whichever key is configured
function pickProvider(requested?: string): 'deepseek' | 'gemini' {
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY);
  const wanted = (requested || siteConfig.chatProvider || '').trim();
  if (wanted === 'gemini' && hasGemini) return 'gemini';
  if (wanted === 'deepseek' && hasDeepSeek) return 'deepseek';
  if (hasDeepSeek) return 'deepseek';
  if (hasGemini) return 'gemini';
  return wanted === 'gemini' ? 'gemini' : 'deepseek';
}

async function askDeepSeek(message: string, history: ChatMessage[]) {
  const key = (process.env.DEEPSEEK_API_KEY || '').trim();
  if (!key) throw new Error('NO_KEY_DEEPSEEK');

  const cfg = siteConfig.deepseekConfig;
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: cfg.modelId,
      messages: [
        { role: 'system', content: cfg.systemPrompt },
        ...history.slice(-8),
        { role: 'user', content: message },
      ],
      temperature: cfg.temperature,
      max_tokens: cfg.maxOutputTokens,
      stream: false,
    }),
  });

  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${data?.error?.message || 'unknown error'}`);

  return {
    reply: data?.choices?.[0]?.message?.content?.trim() || 'This fox does not feel like talking to you right now...',
    model: data?.model || cfg.modelId,
    provider: 'deepseek' as const,
  };
}

async function askGemini(message: string, history: ChatMessage[]) {
  const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('NO_KEY_GEMINI');

  const cfg = siteConfig.geminiConfig;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${cfg.modelId}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: cfg.systemPrompt }] },
        contents: [
          ...history.slice(-8).map((h) => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })),
          { role: 'user', parts: [{ text: message }] },
        ],
        generationConfig: { maxOutputTokens: cfg.maxOutputTokens, temperature: cfg.temperature },
      }),
    }
  );

  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${data?.error?.message || 'unknown error'}`);

  return {
    reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || 'This fox does not feel like talking to you right now...',
    model: cfg.modelId,
    provider: 'gemini' as const,
  };
}

export async function POST(req: Request) {
  try {
    const body: any = await req.json().catch(() => ({}));
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history: ChatMessage[] = Array.isArray(body?.history)
      ? body.history
          .filter((h: any) => h && typeof h.content === 'string' && (h.role === 'user' || h.role === 'assistant'))
          .map((h: any) => ({ role: h.role, content: h.content }))
      : [];

    if (!message) return json({ error: 'Message cannot be empty' }, 400);

    const provider = pickProvider(typeof body?.provider === 'string' ? body.provider : undefined);
    const result = provider === 'gemini' ? await askGemini(message, history) : await askDeepSeek(message, history);
    return json(result, 200);
  } catch (error: any) {
    const msg = String(error?.message || 'unknown error');
    if (msg.startsWith('NO_KEY_')) {
      const name = msg.endsWith('GEMINI') ? 'GEMINI_API_KEY' : 'DEEPSEEK_API_KEY';
      return json(
        {
          error: `${name} is not configured yet`,
          hint: 'Put it in XHBlogs/.env.local locally, or in the Vercel environment variables online, then restart the server',
        },
        500
      );
    }
    console.error('Desktop pet chat failed:', msg);
    return json({ error: msg }, 500);
  }
}

export async function GET() {
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY);
  return json({
    status: 'Ready',
    provider: pickProvider(),
    keys: { deepseek: hasDeepSeek, gemini: hasGemini },
  });
}