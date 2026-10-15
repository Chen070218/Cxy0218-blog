"use client";

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, RotateCcw, X } from 'lucide-react';

type Props = { storageKey: string; title: string; subtitle?: string; image: string; eyebrow?: string; compact?: boolean };
export function validCover(value: string): boolean {
  if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) return true;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}
export default function SectionCover({ storageKey, title, subtitle, image, eyebrow = 'MY COLLECTION', compact = false }: Props) {
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
    if (value && !validCover(value)) { setError('请填写 http/https 图片链接或站内图片路径。'); return; }
    try {
      if (value) localStorage.setItem(key, value); else localStorage.removeItem(key);
      setCustom(value); setFailed(false); setError(''); dialog.current?.close();
    } catch { setError('浏览器存储空间不足，请使用较小图片或图片链接。'); }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 1024 * 1024) { setError('请选择 1 MB 以内的 JPG、PNG 或 WebP 图片。'); return; }
    const reader = new FileReader(); reader.onload = () => { setDraft(String(reader.result)); setError(''); }; reader.onerror = () => setError('图片读取失败，请重试。'); reader.readAsDataURL(file);
  }
  return <>
    <section className={`section-cover ${compact ? 'section-cover-compact' : ''}`} aria-label={title + '封面'}>
      {/* Native img permits local uploads and arbitrary user-configured image hosts. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img decoding="async" src={failed ? '/covers/notes.jpg' : selected} alt="" onError={() => setFailed(true)} />
      <div className="section-cover-shade" />
      <div className="section-cover-copy"><span>{eyebrow}</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      <button className="cover-change" aria-label={`更换${title}封面`} onClick={() => {setDraft(custom);setError('');dialog.current?.showModal();}}><ImagePlus size={16}/><span>更换封面</span></button>
    </section>
    <dialog ref={dialog} className="cover-dialog">
      <div className="cover-dialog-head"><h2>更换「{title}」封面</h2><button aria-label="关闭封面设置" onClick={() => dialog.current?.close()}><X size={20}/></button></div>
      <p>仅保存在当前浏览器，不会自动上传到服务器。</p>
      <label>图片链接<input aria-label="封面图片链接" value={draft.startsWith('data:') ? '' : draft} placeholder="https://… 或 /covers/notes.jpg" onChange={e => setDraft(e.target.value)}/></label>
      <label>或上传图片<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => upload(e.target.files?.[0])}/></label>
      {draft && validCover(draft) && <img decoding="async" className="cover-preview" src={draft} alt="封面预览"/>}
      <p role="status">{error}</p>
      <div className="cover-actions"><button onClick={() => save('')}><RotateCcw size={15}/>恢复默认</button><button className="cover-primary" onClick={() => save(draft)}>保存封面</button></div>
    </dialog>
  </>;
}
