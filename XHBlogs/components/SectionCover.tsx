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
export default function SectionCover({ storageKey, title, subtitle, image, eyebrow = 'Content', compact = false }: Props) {
  const [custom, setCustom] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
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
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 1024 * 1024) { setError('Choose a JPG, PNG or WebP image under 1 MB.'); return; }
    const reader = new FileReader(); reader.onload = () => { setDraft(String(reader.result)); setError(''); }; reader.onerror = () => setError('Could not read the image. Please try again.'); reader.readAsDataURL(file);
  }
  return <>
    <section className={`section-cover ${compact ? 'section-cover-compact' : ''}`} aria-label={title + ' cover'}>
      {/* Native img permits local uploads and arbitrary user-configured image hosts. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img decoding="async" src={failed ? withBasePath('/covers/notes.webp') : selected} alt="" onError={() => setFailed(true)} />
      <div className="section-cover-shade" />
      <div className="section-cover-copy"><span>{eyebrow}</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      <button className="cover-change" aria-label={`Change the ${title} cover`} onClick={() => {setDraft(custom);setError('');dialog.current?.showModal();}}><ImagePlus size={16}/><span>Change cover</span></button>
    </section>
    <dialog ref={dialog} className="cover-dialog">
      <div className="cover-dialog-head"><h2>Change the "{title}" cover</h2><button aria-label="Close cover settings" onClick={() => dialog.current?.close()}><X size={20}/></button></div>
      <p>Saved only in this browser; nothing is uploaded to a server.</p>
      <label>Image link<input aria-label="Cover image link" value={draft.startsWith('data:') ? '' : draft} placeholder="https://… or /covers/notes.webp" onChange={e => setDraft(e.target.value)}/></label>
      <label>Or upload an image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => upload(e.target.files?.[0])}/></label>
      {draft && validCover(draft) && <img decoding="async" className="cover-preview" src={draft} alt="Cover preview"/>}
      <p role="status">{error}</p>
      <div className="cover-actions"><button onClick={() => save('')}><RotateCcw size={15}/>Reset to default</button><button className="cover-primary" onClick={() => save(draft)}>Save cover</button></div>
    </dialog>
  </>;
}
