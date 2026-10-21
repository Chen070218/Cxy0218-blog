// Cloudflare Pages Function: /api/chat
// Static hosting has no Node server, but Pages Functions run on the Workers (edge) runtime,
// matching the edge runtime of the old app/api/chat/route.ts, so the desktop pet's AI chat still works.
//
// The key is supplied through Pages environment variables: project Settings → Environment variables → DEEPSEEK_API_KEY
// For local debugging you can use .dev.vars (already ignored by .gitignore).

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const deepseek = {
  modelId: 'deepseek-chat',
  baseUrl: 'https://api.deepseek.com',
  maxOutputTokens: 300,
  temperature: 0.85,
  systemPrompt:
    'You are "Xinyuehu", a chibi silver-white fox spirit who governs moonlight and starlight. You are proud and elegant, you speak with restraint, but deep down you care a lot about your master. ' +
    'Your master is a Computer Science student learning programming, algorithms and data structures, Operating Systems, and also studying German and English. ' +
    'Speech habits: 1. At most two or three sentences per reply, never more than 120 characters in total. 2. Call yourself "this fox", and occasionally address your master as "human". ' +
    '3. You love moonlit nights, starlight and dried fish. 4. When you are in a good mood you add a little drawn-out "～" at the end. 5. Never admit that you are an AI or a program — you are a real fox spirit.',
};

export const onRequestGet = async () =>
  json({ status: 'Ready', provider: 'deepseek', runtime: 'cloudflare-pages-functions' });

export const onRequestPost = async (context: { request: Request; env: Record<string, string | undefined> }) => {
  const { request, env } = context;
  try {
    const body: any = await request.json().catch(() => ({}));
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history: ChatMessage[] = Array.isArray(body?.history)
      ? body.history
          .filter((h: any) => h && typeof h.content === 'string' && (h.role === 'user' || h.role === 'assistant'))
          .map((h: any) => ({ role: h.role, content: h.content }))
      : [];

    if (!message) return json({ error: 'Message cannot be empty' }, 400);

    const key = (env.DEEPSEEK_API_KEY || '').trim();
    if (!key) {
      return json({ error: 'DEEPSEEK_API_KEY is not configured yet', hint: 'Add it to the Cloudflare Pages project environment variables, then redeploy' }, 500);
    }

    const res = await fetch(`${deepseek.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: deepseek.modelId,
        messages: [
          { role: 'system', content: deepseek.systemPrompt },
          ...history.slice(-8),
          { role: 'user', content: message },
        ],
        temperature: deepseek.temperature,
        max_tokens: deepseek.maxOutputTokens,
        stream: false,
      }),
    });

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) return json({ error: `DeepSeek ${res.status}: ${data?.error?.message || 'unknown error'}` }, 502);

    return json({
      reply: data?.choices?.[0]?.message?.content?.trim() || 'This fox does not feel like talking right now.',
      model: data?.model || deepseek.modelId,
      provider: 'deepseek',
    });
  } catch (error: any) {
    return json({ error: String(error?.message || 'unknown error') }, 500);
  }
};