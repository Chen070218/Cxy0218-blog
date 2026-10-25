// scripts/build-music-data.mjs
//
// Builds XHBlogs/data/music.ts, the single source of truth for the music player.
//
// Two kinds of tracks:
//   1. FULL — free-licensed instrumentals from ccMixter. The audio files are
//      committed under XHBlogs/public/music/ (96 kbps MP3, ~2-4 MB each), so they
//      play offline on every host, with no key, no login and no external stream.
//      Credit and licence are stored per track and shown on the music page; this
//      is what the CC BY licences require.
//   2. PREVIEW — 30-second Apple iTunes previews of well-known songs. Resolved at
//      build time, so playback still needs no API route.
//
// Usage: node scripts/build-music-data.mjs

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'XHBlogs', 'data', 'music.ts');

const FULL_TRACKS = [
  {
    id: 'full-drops-of-h2o',
    slug: 'drops-of-h2o-the-filtered-water-treatment',
    title: 'Drops of H2O (The Filtered Water Treatment)',
    artist: 'djlang59',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://ccmixter.org/files/djlang59/37792',
    durationSec: 315,
  },
  {
    id: 'full-improvisation-on-friday',
    slug: 'improvisation-on-friday',
    title: 'Improvisation On Friday…',
    artist: 'AlexBeroza',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://ccmixter.org/files/AlexBeroza/17253',
    durationSec: 217,
  },
  {
    id: 'full-parametaphoriquement',
    slug: 'parametaphoriquement',
    title: 'Parametaphoriquement',
    artist: 'gmz',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://ccmixter.org/files/gmz/19367',
    durationSec: 289,
  },
  {
    id: 'full-silence-await',
    slug: 'silence-await',
    title: 'Silence Await',
    artist: 'cdk',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://ccmixter.org/files/cdk/17432',
    durationSec: 199,
  },
  {
    id: 'full-awel',
    slug: 'awel',
    title: 'Awel',
    artist: 'stefsax',
    license: 'CC BY 2.5',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.5/',
    sourceUrl: 'https://ccmixter.org/files/stefsax/7785',
    durationSec: 185,
  },
  {
    id: 'full-urbana-metronica',
    slug: 'urbana-metronica-wooh-yeah-mix',
    title: 'Urbana-Metronica (wooh-yeah mix)',
    artist: 'jlbrock44',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://ccmixter.org/files/jlbrock44/33345',
    durationSec: 207,
  },
  {
    id: 'full-long-goodbye',
    slug: 'the-long-goodbye',
    title: 'The Long Goodbye',
    artist: 'flatwound',
    license: 'CC BY 2.5',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.5/',
    sourceUrl: 'https://ccmixter.org/files/flatwound/14476',
    durationSec: 134,
  },
  {
    id: 'full-rkod-pulse',
    slug: 'dj-rkod-pulse-george-ellinas-remix',
    title: 'DJ Rkod — Pulse (George Ellinas remix)',
    artist: 'George_Ellinas',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://ccmixter.org/files/George_Ellinas/14073',
    durationSec: 198,
  },
];

// iTunes track ids for the "popular previews" half of the playlist.
const PREVIEW_IDS = [
  '1122773680', // Viva La Vida — Coldplay
  '1193701392', // Shape of You — Ed Sheeran
  '1499378607', // Blinding Lights — The Weeknd
  '1471704175', // Counting Stars — OneRepublic
  '1440872929', // Wake Me Up — Avicii
  '1196294581', // Faded — Alan Walker
  '1544491233', // Rolling in the Deep — Adele
  '1193701400', // Perfect — Ed Sheeran
  '590423552',  // Numb — LINKIN PARK
  '6781024437', // Bohemian Rhapsody — Queen
  '1679849823', // Creep (Acoustic) — Radiohead
  '1559739399', // Experience — Ludovico Einaudi
  '1411628233', // Believer — Imagine Dragons
];

async function resolvePreviews() {
  const response = await fetch(
    `https://itunes.apple.com/lookup?id=${PREVIEW_IDS.join(',')}&entity=song&country=US`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
        Accept: 'application/json',
      },
    },
  );
  if (!response.ok) throw new Error(`iTunes lookup failed: ${response.status}`);
  const payload = await response.json();
  const byId = new Map((payload.results || []).map((track) => [String(track.trackId), track]));
  const tracks = [];
  for (const id of PREVIEW_IDS) {
    const track = byId.get(id);
    if (!track?.previewUrl) continue;
    tracks.push({
      id: 'preview-' + id,
      title: track.trackName,
      artist: track.artistName,
      cover: String(track.artworkUrl100 || '').replace('/100x100bb', '/600x600bb'),
      src: track.previewUrl,
      kind: 'preview',
      license: 'Preview',
      licenseUrl: 'https://www.apple.com/legal/internet-services/itunes/',
      sourceUrl: track.trackViewUrl || 'https://music.apple.com/',
      durationSec: Math.round((track.trackTimeMillis || 0) / 1000),
    });
  }
  return tracks;
}

const full = FULL_TRACKS.map((track) => ({
  id: track.id,
  title: track.title,
  artist: track.artist,
  cover: `/music/covers/${track.slug}.webp`,
  src: `/music/${track.slug}.mp3`,
  kind: 'full',
  license: track.license,
  licenseUrl: track.licenseUrl,
  sourceUrl: track.sourceUrl,
  durationSec: track.durationSec,
}));

const previews = await resolvePreviews();

const file = [
  '// Generated by scripts/build-music-data.mjs — do not edit by hand.',
  '// Full tracks: free-licensed ccMixter audio hosted in public/music (CC BY, credited on /music).',
  '// Previews: official 30-second Apple iTunes clips, resolved at build time.',
  '',
  'export type MusicKind = "full" | "preview";',
  '',
  'export type MusicTrack = {',
  '  id: string;',
  '  title: string;',
  '  artist: string;',
  '  cover: string;',
  '  src: string;',
  '  kind: MusicKind;',
  '  license: string;',
  '  licenseUrl: string;',
  '  sourceUrl: string;',
  '  durationSec: number;',
  '};',
  '',
  'export const musicTracks: MusicTrack[] = [',
  ...[...full, ...previews].map((track) => '  ' + JSON.stringify(track) + ','),
  '];',
  '',
].join('\n');

fs.writeFileSync(OUT, file, 'utf8');
console.log(`[ok] wrote ${full.length} full tracks and ${previews.length} previews to ${path.relative(ROOT, OUT)}`);
