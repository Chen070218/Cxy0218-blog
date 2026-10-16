// Cloudflare Pages Function：/api/music
// 静态托管没有 Next.js 服务端，这里用 Workers（edge）运行时重写一遍原来的 app/api/music/route.ts。
// 作用：代理网易云音乐的歌曲详情与歌词接口，避免浏览器直连被跨域拦住。

const NET_EASE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  Referer: 'https://music.163.com/',
};

type SongResult = {
  id: string;
  name?: string;
  artist?: string;
  author?: string;
  cover?: string;
  pic?: string;
  url?: string;
  lrc?: string;
  error?: string;
};

const json = (body: unknown, status = 200, cache = 'public, max-age=600, s-maxage=3600') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache },
  });

async function loadSong(songId: string): Promise<SongResult> {
  try {
    const [detailRes, lrcRes] = await Promise.all([
      fetch(`https://music.163.com/api/song/detail/?id=${songId}&ids=[${songId}]`, {
        headers: NET_EASE_HEADERS,
      }),
      fetch(`https://music.163.com/api/song/lyric?id=${songId}&lv=-1&kv=-1&tv=-1`, {
        headers: NET_EASE_HEADERS,
      }).catch(() => null),
    ]);

    if (!detailRes.ok) return { id: songId, error: `upstream_${detailRes.status}` };

    const detail: any = await detailRes.json().catch(() => ({}));
    const song = detail?.songs?.[0];
    if (!song) return { id: songId, error: 'not_found' };

    let lrcText = '';
    if (lrcRes && lrcRes.ok) {
      const lrcData: any = await lrcRes.json().catch(() => ({}));
      lrcText = lrcData?.lrc?.lyric || '';
    }

    const artistName = song?.artists?.[0]?.name || '未知歌手';
    return {
      id: songId,
      name: song.name,
      artist: artistName,
      author: artistName,
      cover: song?.album?.picUrl || '',
      pic: song?.album?.picUrl || '',
      url: `https://music.163.com/song/media/outer/url?id=${songId}.mp3`,
      lrc: lrcText,
    };
  } catch (error: any) {
    return { id: songId, error: String(error?.message || error) };
  }
}

export const onRequestGet = async (context: { request: Request }) => {
  const url = new URL(context.request.url);
  const ids = url.searchParams.get('ids');
  if (!ids) return json({ error: 'Missing ids parameter' }, 400, 'no-store');

  const songIds = ids
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 20);

  const results = await Promise.all(songIds.map(loadSong));
  return json(results);
};
