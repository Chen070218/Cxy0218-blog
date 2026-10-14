// app/api/chat/route.ts
// 桌宠「煤球」的对话接口：默认走 DeepSeek，也可以切到 Gemini。
// 密钥不写在代码里，一律读环境变量：
//   本地 → XHBlogs/.env.local（已被 .gitignore 忽略）
//   线上 Vercel → Project → Settings → Environment Variables
import { siteConfig } from '../../../siteConfig';

export const runtime = 'edge';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// 决定这次请求用哪个后端：请求体里的 provider 优先，其次看环境变量里配了哪个密钥
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
  if (!res.ok) throw new Error(`DeepSeek ${res.status}：${data?.error?.message || '未知错误'}`);

  return {
    reply: data?.choices?.[0]?.message?.content?.trim() || '本喵现在不想理你喵...',
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
  if (!res.ok) throw new Error(`Gemini ${res.status}：${data?.error?.message || '未知错误'}`);

  return {
    reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || '本喵现在不想理你喵...',
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

    if (!message) return json({ error: '消息不能为空' }, 400);

    const provider = pickProvider(typeof body?.provider === 'string' ? body.provider : undefined);
    const result = provider === 'gemini' ? await askGemini(message, history) : await askDeepSeek(message, history);
    return json(result, 200);
  } catch (error: any) {
    const msg = String(error?.message || '未知错误');
    if (msg.startsWith('NO_KEY_')) {
      const name = msg.endsWith('GEMINI') ? 'GEMINI_API_KEY' : 'DEEPSEEK_API_KEY';
      return json(
        {
          error: `还没有配置 ${name}`,
          hint: '本地放到 XHBlogs/.env.local，线上放到 Vercel 的环境变量里，然后重启服务',
        },
        500
      );
    }
    console.error('桌宠对话失败：', msg);
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