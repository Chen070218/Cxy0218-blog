"use client";
import { useEffect, useState } from 'react';
import ConfirmDelete from './ConfirmDelete';
type StoredFile = { id: string; owner: string; name: string; size: number; blob: Blob };
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('xh-local-materials', 1);
    request.onupgradeneeded = () => { request.result.createObjectStore('files', { keyPath: 'id' }).createIndex('owner', 'owner'); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('本地文件库无法打开，请检查浏览器设置。'));
  });
}
export async function addLocalFiles(owner: string, files: File[]) {
  if (!files.length) return;
  if (files.some(file => file.size > 100 * 1024 * 1024)) throw new Error('单个文件请控制在 100 MB 以内。');
  const db = await database();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    files.forEach(file => tx.objectStore('files').put({ id: crypto.randomUUID(), owner, name: file.name, size: file.size, blob: file }));
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(new Error('文件保存失败，可能是浏览器存储空间不足。'));
  }); } finally { db.close(); }
}
async function listFiles(owner: string): Promise<StoredFile[]> {
  const db = await database();
  try { return await new Promise((resolve, reject) => {
    const request = db.transaction('files').objectStore('files').index('owner').getAll(owner);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('文件读取失败。'));
  }); } finally { db.close(); }
}
export async function removeLocalFiles(owner: string, id?: string) {
  const records = await listFiles(owner); const db = await database();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    records.filter(file => !id || file.id === id).forEach(file => tx.objectStore('files').delete(file.id));
    tx.oncomplete = () => resolve(); tx.onabort = () => reject(new Error('文件删除失败。'));
  }); } finally { db.close(); }
}
export default function LocalFiles({ owner }: { owner: string }) {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  useEffect(() => { let active = true; listFiles(owner).then(value => { if(active) setFiles(value); }).catch(error => { if(active) setMessage(error.message); }); return () => { active = false; }; }, [owner]);
  async function upload(selected: File[]) {
    setBusy(true);
    try { await addLocalFiles(owner, selected); setFiles(await listFiles(owner)); setMessage('文件已保存。'); }
    catch(error) { setMessage(error instanceof Error ? error.message : '保存失败'); } finally { setBusy(false); }
  }
  function download(file: StoredFile) {
    const url = URL.createObjectURL(file.blob); const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  async function remove(id: string) {
    setBusy(true);
    try { await removeLocalFiles(owner, id); setFiles(await listFiles(owner)); setDeleting(null); setMessage('文件已移除。'); }
    catch(error) { setMessage(error instanceof Error ? error.message : '删除失败'); } finally { setBusy(false); }
  }
  return <div className="local-files"><strong>本地材料 · {files.length}</strong><label className="local-file-upload">{busy ? '正在保存…' : '＋ 添加本地文件'}<input type="file" multiple disabled={busy} onChange={e => { const selected = Array.from(e.target.files || []); e.target.value = ''; if(selected.length) upload(selected); }} /></label>
    <div className="material-grid">{files.map(file => <FileCard key={file.id} file={file} busy={busy} onDownload={() => download(file)} onDelete={() => setDeleting(file.id)}/>)}</div>
    {!files.length && <div className="material-empty">▧<span>添加第一份材料，建立你的项目收藏</span></div>}
    {deleting && <ConfirmDelete busy={busy} description={`将删除文件“${files.find(file => file.id === deleting)?.name || ''}”。`} onCancel={() => setDeleting(null)} onConfirm={() => remove(deleting)}/>}
    <p role="status">{message || '单个文件不超过 100 MB，仅保存于当前浏览器。'}</p></div>;
}

function FileCard({ file, busy, onDownload, onDelete }: { file: StoredFile; busy: boolean; onDownload: () => void; onDelete: () => void }) {
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);
  const isImage = /^image\/(png|jpeg|webp|gif|avif|bmp)$/.test(file.blob.type) || /\.(png|jpe?g|webp|gif|avif|bmp)$/i.test(file.name);
  const extension = file.name.split('.').pop()?.toUpperCase().slice(0, 8) || 'FILE';
  useEffect(() => {
    if(!isImage) return;
    const objectUrl = URL.createObjectURL(file.blob); setUrl(objectUrl); setFailed(false);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file.blob, isImage]);
  return <div className="material-card"><div className="material-preview">{url && !failed ? <img loading="lazy" decoding="async" src={url} alt={file.name} onError={() => setFailed(true)}/> : <div className="material-placeholder"><span>▤</span><b>{extension}</b><small>{isImage ? '图片文件' : '本地文档'}</small></div>}<span className="material-format">{extension}</span></div><div className="material-info"><h4 title={file.name}>{file.name}</h4><p>{file.size < 1048576 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1048576).toFixed(2)} MB`} · 本地文件</p><div><button onClick={onDownload}>↓ 下载文件</button><button disabled={busy} onClick={onDelete} aria-label={`删除文件${file.name}`}>删除</button></div></div></div>;
}
