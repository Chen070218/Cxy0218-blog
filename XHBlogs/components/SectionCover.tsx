"use client";

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, RotateCcw, X } from 'lucide-react';
import { withBasePath } from '../sitePath';

type Props = { storageKey: string; title: string; subtitle?: string; image: string; eyebrow?: string; compact?: boolean };
export function validCover(value: string): boolean {
  if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) return true;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

/** Read an image file, scale it down and re-encode it so localStorage stays small. */
async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('no canvas context');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const webp = canvas.toDataURL('image/webp', 0.82);
  if (webp.startsWith('data:image/webp')) return webp;
  return canvas.toDataURL('image/jpeg', 0.82);
}

export default function SectionCover({ storageKey, title, subtitle, image, eyebrow = 'Content', compact = false }: Props) {
  const [custom, setCustom] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const key = 'xh-cover-v1:' + storageKey;
  useEffect(() => {
    try { const value = localStorage.getItem(key); if (value && validCover(value)) setCustom(value); } catch { /* Default image remains usable. */ }
  }, [key]);
  const selected = custom || image;
  function save(value: string) {
    if (value && !validCover(value)) { setError('Please enter an http/https image link or an in-site image path.'); return; }
    try {
      if (value) localStorage.setItem(key, value); else localStorage.removeItem(key);
      setCustom(value); setFailed(false); setError(''); dialog.current?.close();
    } catch { setError('Browser storage is full. Use a smaller image or an image link.'); }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Choose an image file (JPG, PNG, WebP or HEIC).'); return; }
    if (file.size > 15 * 1024 * 1024) { setError('That image is over 15 MB. Choose a smaller one or use an image link.'); return; }
    setBusy(true);
    setError('');
    try {
      const data = await compressImage(file);
      if (!validCover(data)) throw new Error('not an image');
      if (data.length > 3.5 * 1024 * 1024) throw new Error('too large after compression');
      setDraft(data);
    } catch {
      setError('Could not read that image. Try a JPG or PNG, or paste an image link instead.');
    } finally {
      setBusy(false);
    }
  }
  return <>
    <section className={`section-cover ${compact ? 'section-cover-compact' : ''}`} aria-label={title + ' cover'}>
      {/* Native img permits local uploads and arbitrary user-configured image hosts. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img decoding="async" src={failed ? withBasePath('/covers/notes.webp') : selected} alt="" onError={() => setFailed(true)} />
      <div className="section-cover-shade" />
      <div className="section-cover-copy"><span>{eyebrow}</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      <button type="button" className="cover-change" aria-label={`Change the ${title} cover`} onClick={() => {setDraft(custom);setError('');dialog.current?.showModal();}}><ImagePlus size={16}/><span>Change cover</span></button>
    </section>
    <dialog ref={dialog} className="cover-dialog">
      <div className="cover-dialog-head"><h2>Change the "{title}" cover</h2><button type="button" aria-label="Close cover settings" onClick={() => dialog.current?.close()}><X size={20}/></button></div>
      <p>Saved only in this browser; nothing is uploaded to a server. Uploaded photos are resized before they are saved.</p>
      <label>Image link<input aria-label="Cover image link" value={draft.startsWith('data:') ? '' : draft} placeholder="https://… or /photos/own/home.webp" onChange={e => setDraft(e.target.value)}/></label>
      <label>Or upload an image<input type="file" accept="image/*" onChange={e => upload(e.target.files?.[0])}/></label>
      {busy && <p role="status">Resizing the image…</p>}
      {draft && validCover(draft) && <img decoding="async" className="cover-preview" src={draft} alt="Cover preview"/>}
      <p role="status">{error}</p>
      <div className="cover-actions">
        <button type="button" onClick={() => save('')}><RotateCcw size={15}/>Reset to default</button>
        <button type="button" className="cover-primary" onClick={() => save(draft)}>Save cover</button>
      </div>
    </dialog>
  </>;
}
