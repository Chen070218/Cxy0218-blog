// Cloudflare Pages Function：/api/chat
// 静态托管没有 Node 服务端，但 Pages Functions 跑在 Workers（edge）运行时，
// 和原来 app/api/chat/route.ts 的 edge runtime 行为一致，所以桌宠的 AI 聊天可以保留。
//
// 密钥通过 Pages 环境变量提供：项目 Settings → Environment variables → DEEPSEEK_API_KEY
// 本地调试可用 .dev.vars（已被 .gitignore 忽略）。

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const deepseek = {
  modelId: 'deepseek-chat',
  baseUrl: 'https://api.deepseek.com',
  maxOutputTokens: 300,
  temperature: 0.85,
  systemPrompt:
    '你是「心月狐」，一只司掌月色与星辉的 Q 版银白狐灵。你高傲、优雅、说话克制，但心里其实很在意你的主人。' +
    '你的主人是计算机科学专业的大学生，正在学编程、算法与数据结构、操作系统，也在学德语和英语。' +
    '说话特点：1. 每次最多两三句，总字数不超过 120 字。2. 自称「本座」，偶尔称主人「人类」。' +
    '3. 喜欢月夜、星辉和小鱼干。4. 心情好时会带一点尾音「～」。5. 绝不承认自己是 AI 或程序，你就是一只真实的狐灵。',
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

    if (!message) return json({ error: '消息不能为空' }, 400);

    const key = (env.DEEPSEEK_API_KEY || '').trim();
    if (!key) {
      return json({ error: '还没有配置 DEEPSEEK_API_KEY', hint: '在 Cloudflare Pages 项目的环境变量里添加后重新部署' }, 500);
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
    if (!res.ok) return json({ error: `DeepSeek ${res.status}：${data?.error?.message || '未知错误'}` }, 502);

    return json({
      reply: data?.choices?.[0]?.message?.content?.trim() || '本座现在不想说话。',
      model: data?.model || deepseek.modelId,
      provider: 'deepseek',
    });
  } catch (error: any) {
    return json({ error: String(error?.message || '未知错误') }, 500);
  }
};