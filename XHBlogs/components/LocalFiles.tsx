"use client";
import { useEffect, useState } from 'react';
import ConfirmDelete from './ConfirmDelete';
type StoredFile = { id: string; owner: string; name: string; size: number; blob: Blob };
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('xh-local-materials', 1);
    request.onupgradeneeded = () => { request.result.createObjectStore('files', { keyPath: 'id' }).createIndex('owner', 'owner'); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Cannot open the local file library. Check your browser settings.'));
  });
}
export async function addLocalFiles(owner: string, files: File[]) {
  if (!files.length) return;
  if (files.some(file => file.size > 100 * 1024 * 1024)) throw new Error('Keep each file under 100 MB.');
  const db = await database();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    files.forEach(file => tx.objectStore('files').put({ id: crypto.randomUUID(), owner, name: file.name, size: file.size, blob: file }));
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(new Error('Could not save the file. Browser storage may be full.'));
  }); } finally { db.close(); }
}
async function listFiles(owner: string): Promise<StoredFile[]> {
  const db = await database();
  try { return await new Promise((resolve, reject) => {
    const request = db.transaction('files').objectStore('files').index('owner').getAll(owner);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Could not read the file.'));
  }); } finally { db.close(); }
}
export async function removeLocalFiles(owner: string, id?: string) {
  const records = await listFiles(owner); const db = await database();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    records.filter(file => !id || file.id === id).forEach(file => tx.objectStore('files').delete(file.id));
    tx.oncomplete = () => resolve(); tx.onabort = () => reject(new Error('Could not delete the file.'));
  }); } finally { db.close(); }
}
export default function LocalFiles({ owner }: { owner: string }) {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  useEffect(() => { let active = true; listFiles(owner).then(value => { if(active) setFiles(value); }).catch(error => { if(active) setMessage(error.message); }); return () => { active = false; }; }, [owner]);
  async function upload(selected: File[]) {
    setBusy(true);
    try { await addLocalFiles(owner, selected); setFiles(await listFiles(owner)); setMessage('File saved.'); }
    catch(error) { setMessage(error instanceof Error ? error.message : 'Save failed'); } finally { setBusy(false); }
  }
  function download(file: StoredFile) {
    const url = URL.createObjectURL(file.blob); const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  async function remove(id: string) {
    setBusy(true);
    try { await removeLocalFiles(owner, id); setFiles(await listFiles(owner)); setDeleting(null); setMessage('File removed.'); }
    catch(error) { setMessage(error instanceof Error ? error.message : 'Delete failed'); } finally { setBusy(false); }
  }
  return <div className="local-files"><strong>Local materials · {files.length}</strong><label className="local-file-upload">{busy ? 'Saving…' : '＋ Add local file'}<input type="file" multiple disabled={busy} onChange={e => { const selected = Array.from(e.target.files || []); e.target.value = ''; if(selected.length) upload(selected); }} /></label>
    <div className="material-grid">{files.map(file => <FileCard key={file.id} file={file} busy={busy} onDownload={() => download(file)} onDelete={() => setDeleting(file.id)}/>)}</div>
    {!files.length && <div className="material-empty">▧<span>Add your first file to start a collection for this project</span></div>}
    {deleting && <ConfirmDelete busy={busy} description={`This will delete the file "${files.find(file => file.id === deleting)?.name || ''}".`} onCancel={() => setDeleting(null)} onConfirm={() => remove(deleting)}/>}
    <p role="status">{message || 'Each file is 100 MB or less and only kept in this browser.'}</p></div>;
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
  return <div className="material-card"><div className="material-preview">{url && !failed ? <img loading="lazy" decoding="async" src={url} alt={file.name} onError={() => setFailed(true)}/> : <div className="material-placeholder"><span>▤</span><b>{extension}</b><small>{isImage ? 'Image file' : 'Local document'}</small></div>}<span className="material-format">{extension}</span></div><div className="material-info"><h4 title={file.name}>{file.name}</h4><p>{file.size < 1048576 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1048576).toFixed(2)} MB`} · Local file</p><div><button onClick={onDownload}>↓ Download</button><button disabled={busy} onClick={onDelete} aria-label={`Delete file ${file.name}`}>Delete</button></div></div></div>;
}
